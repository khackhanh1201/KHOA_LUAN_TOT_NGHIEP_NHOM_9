const API_BASE = 'http://localhost:8080/api';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const PENALTY_RATE_PER_DAY = 0.0003;

const calcPenalty = (base, dueDateStr) => {
  if (!dueDateStr || !base || base <= 0) return { overdueDays: 0, penalty: 0 };
  const due = new Date(dueDateStr);
  if (isNaN(due.getTime())) return { overdueDays: 0, penalty: 0 };
  const dueMid = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const today = new Date();
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffMs = todayMid.getTime() - dueMid.getTime();
  if (diffMs <= 0) return { overdueDays: 0, penalty: 0 };
  const overdueDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const penalty = Math.round(base * PENALTY_RATE_PER_DAY * overdueDays);
  return { overdueDays, penalty };
};

export const formatDateVN = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN');
};

export const formatVND = (n) => `${(Number(n) || 0).toLocaleString('vi-VN')} VNĐ`;

export const formatShortVND = (n) => {
  if (n >= 1000000000) return `${(n / 1000000000).toFixed(1)} tỷ`;
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)} tr`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)} k`;
  return `${n}`;
};

const PAID_STATUSES = new Set(['PAID', 'SUCCESS']);

export const getStreetName = (address) => {
  if (!address) return 'Khác';
  const match = address.match(/(?:đường|phố)\s+([^,]+)/i);
  if (match) {
    const street = match[1].trim();
    if (street) return street.charAt(0).toUpperCase() + street.slice(1);
  }
  const parts = address.split(',');
  if (parts.length > 0) {
    const firstPart = parts[0].trim();
    if (firstPart) return firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
  }
  return address.trim() || 'Khác';
};

export const loadReportManagementData = async () => {
  const headers = getAuthHeaders();
  const [payRes, recRes, revRes] = await Promise.allSettled([
    fetch(`${API_BASE}/payments/all`, { headers }),
    fetch(`${API_BASE}/tax/records`, { headers }),
    fetch(`${API_BASE}/reports/revenue?year=2026`, { headers }),
  ]);

  let payJson = [];
  if (payRes.status === 'fulfilled' && payRes.value.ok) {
    payJson = await payRes.value.json();
  } else {
    console.warn('Failed to fetch payments');
  }

  let recJson = [];
  if (recRes.status === 'fulfilled' && recRes.value.ok) {
    recJson = await recRes.value.json();
  } else {
    console.warn('Failed to fetch records');
  }

  let revJson = null;
  if (revRes.status === 'fulfilled' && revRes.value.ok) {
    revJson = await revRes.value.json();
  } else {
    console.warn('Failed to fetch reports/revenue');
  }

  const fetchedPayments = Array.isArray(payJson) ? payJson : (payJson?.data || []);
  const fetchedRecords = Array.isArray(recJson) ? recJson : (recJson?.data || []);

  const targetYear = 2026;
  const availableYears = fetchedPayments.flatMap((p) => {
    if (p.paidAt) {
      const d = new Date(p.paidAt);
      return !isNaN(d.getTime()) ? [d.getFullYear()] : [];
    }
    return [];
  });

  let yearToUse = targetYear;
  if (availableYears.length > 0 && !availableYears.includes(2026)) {
    const counts = {};
    availableYears.forEach((y) => {
      counts[y] = (counts[y] || 0) + 1;
    });
    yearToUse = Number(Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b)));
  }

  let revenueData;
  if (revJson && Array.isArray(revJson)) {
    revenueData = revJson;
  } else {
    const fallbackRev = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, amount: 0, year: yearToUse }));
    fetchedPayments.forEach((p) => {
      const isPaid = PAID_STATUSES.has(p.paymentStatus);
      if (isPaid && p.paidAt) {
        const date = new Date(p.paidAt);
        if (!isNaN(date.getTime()) && date.getFullYear() === yearToUse) {
          const m = date.getMonth();
          fallbackRev[m].amount += Number(p.totalAmountDue || 0);
        }
      }
    });
    revenueData = fallbackRev;
  }

  return { payments: fetchedPayments, records: fetchedRecords, revenueData };
};

export const computeReportStats = (payments, records, appliedFilters) => {
  const filteredPayments = payments.filter((p) => {
    const record = records.find((r) => String(r.recordId) === String(p.recordId));
    if (appliedFilters.taxType !== 'Tất cả') {
      const type = record?.taxType || 'Thuế sử dụng đất';
      if (type !== appliedFilters.taxType) return false;
    }
    if (appliedFilters.street !== 'Tất cả') {
      const address = record ? (record.landAddress || record.address || '') : '';
      const street = getStreetName(address);
      if (street !== appliedFilters.street) return false;
    }
    const dateStr = p.paidAt || p.dueDate;
    if (dateStr && dateStr !== '---') {
      const date = new Date(dateStr);
      if (appliedFilters.startDate) {
        const start = new Date(appliedFilters.startDate);
        if (date < start) return false;
      }
      if (appliedFilters.endDate) {
        const end = new Date(appliedFilters.endDate);
        end.setHours(23, 59, 59, 999);
        if (date > end) return false;
      }
    }
    return true;
  });

  const stats = { totalDue: 0, paid: 0, unpaid: 0, overdue: 0, completionRate: 0 };
  filteredPayments.forEach((p) => {
    const base = Number(p.totalAmountDue || 0);
    const isPaid = PAID_STATUSES.has(p.paymentStatus);
    const fallback = calcPenalty(base, p.dueDate);
    const penalty =
      p.penaltyAmount != null && Number.isFinite(Number(p.penaltyAmount))
        ? Number(p.penaltyAmount)
        : fallback.penalty;
    const total =
      p.totalPayable != null && Number.isFinite(Number(p.totalPayable))
        ? Number(p.totalPayable)
        : base + penalty;

    stats.totalDue += total;
    if (isPaid) {
      stats.paid += total;
    } else {
      const isOverdue = p.paymentStatus === 'OVERDUE' || calcPenalty(base, p.dueDate).overdueDays > 0;
      if (isOverdue) stats.overdue += total;
      else stats.unpaid += total;
    }
  });
  stats.completionRate = stats.totalDue > 0 ? (stats.paid / stats.totalDue) * 100 : 0;

  const r = 70;
  const circ = 2 * Math.PI * r;
  const totalAmountForDonut = stats.totalDue || 1;
  const pctPaid = (stats.paid / totalAmountForDonut) * 100;
  const pctUnpaid = (stats.unpaid / totalAmountForDonut) * 100;
  const pctOverdue = (stats.overdue / totalAmountForDonut) * 100;
  const lenPaid = (pctPaid / 100) * circ;
  const lenUnpaid = (pctUnpaid / 100) * circ;
  const lenOverdue = (pctOverdue / 100) * circ;
  const anglePaid = -90;
  const angleUnpaid = anglePaid + (pctPaid / 100) * 360;
  const angleOverdue = angleUnpaid + (pctUnpaid / 100) * 360;

  const streetDataMap = {};
  filteredPayments.forEach((p) => {
    const isPaid = PAID_STATUSES.has(p.paymentStatus);
    const record = records.find((rItem) => String(rItem.recordId) === String(p.recordId));
    const address = record ? (record.landAddress || record.address || '') : '';
    const street = getStreetName(address);
    const base = Number(p.totalAmountDue || 0);
    const fallback = calcPenalty(base, p.dueDate);
    const penalty =
      p.penaltyAmount != null && Number.isFinite(Number(p.penaltyAmount))
        ? Number(p.penaltyAmount)
        : fallback.penalty;
    const total =
      p.totalPayable != null && Number.isFinite(Number(p.totalPayable))
        ? Number(p.totalPayable)
        : base + penalty;

    if (!streetDataMap[street]) {
      streetDataMap[street] = { street, totalDue: 0, paid: 0, unpaid: 0, overdue: 0 };
    }
    streetDataMap[street].totalDue += total;
    if (isPaid) streetDataMap[street].paid += total;
    else {
      const isOverdue = p.paymentStatus === 'OVERDUE' || calcPenalty(base, p.dueDate).overdueDays > 0;
      if (isOverdue) streetDataMap[street].overdue += total;
      else streetDataMap[street].unpaid += total;
    }
  });

  const streetDataList = Object.values(streetDataMap);
  const top5Streets = streetDataList.toSorted((a, b) => b.paid - a.paid).slice(0, 5);
  const maxPaidStreet = Math.max(...top5Streets.map((s) => s.paid), 0);
  const maxPaidStreetVal = maxPaidStreet > 0 ? maxPaidStreet : 10000000;
  const barTicks = [maxPaidStreetVal, maxPaidStreetVal * 0.67, maxPaidStreetVal * 0.33, 0];

  return {
    stats,
    donut: { r, circ, lenPaid, lenUnpaid, lenOverdue, anglePaid, angleUnpaid, angleOverdue },
    streetDataList,
    top5Streets,
    maxPaidStreetVal,
    barTicks,
  };
};

export const computeRevenueChart = (revenueData) => {
  const maxAmount = Math.max(...revenueData.map((d) => d.amount), 0);
  const maxAmountVal = maxAmount > 0 ? maxAmount : 10000000;
  const yTicks = [maxAmountVal, maxAmountVal * 0.75, maxAmountVal * 0.5, maxAmountVal * 0.25, 0];
  const points = revenueData.map((d, i) => ({
    x: 40 + i * 40,
    y: 125 - (d.amount / maxAmountVal) * 110,
  }));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  return { maxAmountVal, yTicks, points, pathD };
};

export const StatItem = ({ dotColor, label, value, color }) => (
  <div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor }} />
      <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>{label}</span>
    </div>
    <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
  </div>
);

export const containerStyle = { padding: '24px 32px' };
export const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 16,
  marginBottom: 24,
  flexWrap: 'wrap',
};
export const btnPrimary = {
  background: '#a30d11',
  color: '#fff',
  border: 'none',
  padding: '10px 18px',
  borderRadius: 8,
  fontWeight: 700,
  fontSize: 13,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  lineHeight: 1.2,
};
export const btnBack = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  border: 'none',
  background: '#f1f5f9',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#334155',
  fontSize: 16,
};
export const topCardStyle = {
  background: '#fff',
  borderRadius: 12,
  padding: 32,
  border: '1px solid #e2e8f0',
  marginBottom: 20,
  boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
};
export const chartsWrapper = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 };
export const chartCardStyle = {
  background: '#fff',
  borderRadius: 12,
  padding: 24,
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
};
export const chartContainer = { position: 'relative', width: 180, height: 180 };
export const chartCenterText = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
};
export const statsGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 48px' };
export const chartTitle = { margin: 0, fontSize: 16, fontWeight: 700, color: '#1e293b' };
export const yAxis = {
  position: 'absolute',
  left: 0,
  top: 0,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  fontSize: 12,
  color: '#94a3b8',
  fontWeight: 600,
  paddingBottom: 20,
};
export const axisLabel = { fontSize: 12, color: '#94a3b8', fontWeight: 600 };
export const thStyle = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: 12,
  color: '#64748b',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};
export const tdStyle = { padding: '12px 16px', fontSize: 13, color: '#334155' };
export const formCard = {
  background: '#fff',
  borderRadius: 12,
  padding: 32,
  border: '1px solid #e2e8f0',
  maxWidth: 800,
  boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
};
export const formGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 };
export const formGroupFull = { marginBottom: 20 };
export const formGroup = { display: 'flex', flexDirection: 'column', gap: 8 };
export const formLabel = {
  fontSize: 12,
  fontWeight: 800,
  color: '#64748b',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
};
export const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  outline: 'none',
  background: '#fff',
  fontSize: 14,
  color: '#1e293b',
};
