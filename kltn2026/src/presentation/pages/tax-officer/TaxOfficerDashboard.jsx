import React, { useState, useEffect, useCallback } from 'react';
import TaxOfficerLayout from '../../components/TaxOfficerLayout';
import { useUserInfo } from '../../../hooks/useUserInfo';
import { useAsyncMountLoad } from '../../../hooks/useAsyncMountLoad';
import {
  colors, radius, space, fontSize, fontWeight, shadow,
  pageTitle, pageSubtitle, card,
  tabsBar, tabBase, tabActive,
  tableCell, tableHeadCell, tableHeadRow, tableBodyRow,
  emptyState, loadingBox, getStatusBadge,
} from './_designTokens';

const donutOuterStyle = (approvedPct) => ({
  width: 160,
  height: 160,
  borderRadius: '50%',
  background: `conic-gradient(#22c55e 0% ${approvedPct}%, #eab308 ${approvedPct}% 100%)`,
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const donutInnerStyle = {
  width: 110,
  height: 110,
  background: colors.primary,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
};

const urgentIconStyle = {
  background: colors.dangerSoft,
  color: colors.danger,
  width: 32,
  height: 32,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const formatStatusBadge = (status) => {
  const map = {
    SUBMITTED: { kind: 'info', label: 'Đang chờ cán bộ địa chính xử lý' },
    VERIFIED: { kind: 'warning', label: 'Chờ cán bộ thuế tiếp nhận' },
    PROCESSING: { kind: 'warning', label: 'Đang xử lý' },
    APPROVED: { kind: 'success', label: 'Đã duyệt' },
    CANCELLED: { kind: 'danger', label: 'Đã hủy' },
    COMPLETED: { kind: 'neutral', label: 'Hoàn thành' },
    PENDING: { kind: 'warning', label: 'Chờ xử lý' },
    IN_PROGRESS: { kind: 'info', label: 'Đang xử lý' },
    RESOLVED: { kind: 'success', label: 'Đã giải quyết' },
    REJECTED: { kind: 'danger', label: 'Từ chối' },
  };
  return map[status] || { kind: 'neutral', label: status };
};

const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString('vi-VN') : '—');

const API_BASE = 'http://localhost:8080/api';
const toArray = (json) =>
  Array.isArray(json) ? json : json?.data ?? json?.content ?? [];

const parseComplaintContent = (content = '') => {
  if (!content) return { title: null, body: '' };
  const match = content.match(/^\[(.+?)\]\s*-\s*(.*)$/s);
  return match
    ? { title: match[1].trim(), body: match[2].trim() }
    : { title: null, body: content };
};

const mapNewRecordRow = (item) => ({
  id: `record-${item.recordId}`,
  type: 'record',
  code: `HS-${new Date(item.submittedAt || Date.now()).getFullYear()}-${String(item.recordId).padStart(3, '0')}`,
  createdAt: item.submittedAt,
  reason: item.declaredUsage
    ? `Kê khai: ${item.declaredUsage}`
    : item.fullName
      ? `Hồ sơ: ${item.fullName}`
      : 'Hồ sơ mới chờ duyệt',
  status: item.currentStatus || 'VERIFIED',
});

const mapApprovedRecordRow = (item) => ({
  id: `record-${item.recordId}`,
  type: 'record',
  code: `HS-${new Date(item.submittedAt || Date.now()).getFullYear()}-${String(item.recordId).padStart(3, '0')}`,
  createdAt: item.submittedAt,
  reason: item.fullName
    ? `Đã duyệt — ${item.fullName}`
    : `Hồ sơ #${item.recordId} đã duyệt`,
  status: 'APPROVED',
});

const mapComplaintRow = (item) => {
  const parsed = parseComplaintContent(item.content);
  return {
    id: `complaint-${item.id}`,
    type: 'complaint',
    code: `KN-${String(item.id).padStart(6, '0')}`,
    createdAt: item.createdAt,
    reason:
      item.complaintTitle ||
      parsed.title ||
      item.complaintBody ||
      parsed.body ||
      item.content ||
      'Khiếu nại',
    status: item.status || 'PENDING',
  };
};

const fetchWithAuth = async (url) => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Lỗi fetch tại ${url}:`, error);
    return [];
  }
};

const loadTaxOfficerDashboard = async () => {
  const [complaintsData, taxRecordsData, paymentsData] = await Promise.all([
    fetchWithAuth(`${API_BASE}/complaints`),
    fetchWithAuth(`${API_BASE}/tax/records`),
    fetchWithAuth(`${API_BASE}/payments/all`),
  ]);

  const safeComplaints = Array.isArray(complaintsData) ? complaintsData : (complaintsData?.data || []);
  const complaintStats = {
    total: safeComplaints.length,
    pending: safeComplaints.filter((c) => c.status === 'PENDING').length,
    inProgress: safeComplaints.filter((c) => c.status === 'IN_PROGRESS' || c.status === 'PROCESSING').length,
    resolved: safeComplaints.filter((c) => c.status === 'RESOLVED').length,
    rejected: safeComplaints.filter((c) => c.status === 'REJECTED').length,
  };

  const safeTaxRecords = Array.isArray(taxRecordsData) ? taxRecordsData : (taxRecordsData?.data || taxRecordsData?.content || []);
  const taxApproved = safeTaxRecords.filter((r) => r.currentStatus === 'APPROVED').length;
  const taxVerified = safeTaxRecords.filter((r) => r.currentStatus === 'VERIFIED' || r.currentStatus === 'PROCESSING').length;
  const taxSubmitted = safeTaxRecords.filter((r) => r.currentStatus === 'SUBMITTED' || r.currentStatus === 'PENDING').length;
  const taxRejected = safeTaxRecords.filter((r) => r.currentStatus === 'REJECTED').length;
  const taxFraud = safeTaxRecords.filter((r) => r.currentStatus === 'FRAUD_SUSPECTED').length;
  const taxTotal = safeTaxRecords.length;

  const stats = {
    total: taxTotal,
    verified: taxApproved,
    processing: taxVerified,
    needMoreDocs: taxSubmitted,
    discrepancy: taxRejected,
    urgentTotal: taxVerified,
    urgentNew: taxVerified,
    urgentOverdue: 0,
    urgentFraud: taxFraud,
  };

  const safePayments = Array.isArray(paymentsData) ? paymentsData : (paymentsData?.data || []);
  const paymentOverdue = safePayments.filter((p) => {
    const unpaidStatuses = ['UNPAID', 'AWAITING_PAYMENT', 'OVERDUE'];
    if (!unpaidStatuses.includes(p.paymentStatus)) return false;
    if (!p.dueDate) return false;
    const due = new Date(p.dueDate);
    if (isNaN(due.getTime())) return false;
    const today = new Date();
    const dueMid = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return todayMid > dueMid;
  }).length;

  return { stats, complaintStats, paymentOverdue };
};

const TaxOfficerDashboard = () => {
  const { user } = useUserInfo();
  const { data: dashboard, isLoading } = useAsyncMountLoad(loadTaxOfficerDashboard);

  const stats = dashboard?.stats ?? {
    total: 0, verified: 0, processing: 0, needMoreDocs: 0,
    discrepancy: 0, urgentTotal: 0, urgentNew: 0, urgentFraud: 2, urgentOverdue: 0,
  };
  const complaintStats = dashboard?.complaintStats ?? {
    total: 0, pending: 0, inProgress: 0, resolved: 0, rejected: 0,
  };
  const paymentOverdue = dashboard?.paymentOverdue ?? 0;

  const [tableData, setTableData] = useState([]);
  const [activityTab, setActivityTab] = useState('new');
  const [tableLoading, setTableLoading] = useState(false);

  const fetchActivityTable = useCallback(async (tab) => {
    setTableLoading(true);
    try {
      let rows = [];

      if (tab === 'new') {
        const data = await fetchWithAuth(`${API_BASE}/tax/records/verified`);
        rows = toArray(data).map(mapNewRecordRow);
      } else if (tab === 'approved') {
        const data = await fetchWithAuth(`${API_BASE}/tax/records`);
        rows = [];
        for (const r of toArray(data)) {
          if (r.currentStatus === 'APPROVED') rows.push(mapApprovedRecordRow(r));
        }
      } else if (tab === 'complaint') {
        const data = await fetchWithAuth(`${API_BASE}/complaints`);
        rows = toArray(data).map(mapComplaintRow);
      }

      rows.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setTableData(rows.slice(0, 10));
    } catch (err) {
      console.error('Lỗi tải hoạt động:', err);
      setTableData([]);
    } finally {
      setTableLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivityTable('new');
  }, [fetchActivityTable]);

  const handleActivityTabChange = (tabKey) => {
    setActivityTab(tabKey);
    fetchActivityTable(tabKey);
  };
  const approvedPct =
  stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0;
  const emptyMsg = {
    new: 'Không có hồ sơ mới (VERIFIED).',
    approved: 'Không có hồ sơ đã duyệt.',
    complaint: 'Không có khiếu nại.',
  }[activityTab];
  return (
    <TaxOfficerLayout user={user}>
      <div style={{ padding: '24px 32px' }}>
        {/* Header */}
        <div style={{ marginBottom: space.xxl }}>
          <h2 style={pageTitle}>Bảng điều khiển</h2>
          <p style={pageSubtitle}>
            Theo dõi tình trạng hồ sơ và công việc của bạn
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: space.xxl }}>

          {/* Trạng thái hồ sơ - Card lớn màu đỏ */}
          <div style={{
            background: colors.primary,
            color: '#fff',
            borderRadius: radius.lg,
            padding: '24px 28px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: shadow.card,
          }}>
            <div style={{ marginBottom: space.lg }}>
              <h3 style={{ margin: 0, fontWeight: fontWeight.bold, fontSize: fontSize.section }}>Hồ sơ khai thuế</h3>
              <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: fontSize.meta }}>
                Tổng số hồ sơ: {isLoading ? '…' : stats.total.toLocaleString('vi-VN')}
              </p>
            </div>

            {/* Donut Chart */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0 24px' }}>
              <div style={donutOuterStyle(approvedPct)}>
                <div style={donutInnerStyle}>
                  <div style={{ fontSize: fontSize.metric, fontWeight: fontWeight.extra, lineHeight: 1 }}>
                    {isLoading ? '—' : `${approvedPct}%`}
                  </div>
                  <div style={{ fontSize: fontSize.label, opacity: 0.9, marginTop: 4, letterSpacing: '0.05em' }}>ĐÃ DUYỆT</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: space.md }}>
              <KpiTile color="#22c55e" label="ĐÃ DUYỆT" value={stats.verified} loading={isLoading} />
              <KpiTile color="#3b82f6" label="ĐANG XỬ LÝ" value={stats.processing} loading={isLoading} />
              <KpiTile color="#eab308" label="CẦN BỔ SUNG" value={stats.needMoreDocs} loading={isLoading} />
              <KpiTile color="#ef4444" label="TRỄ HẠN" value={stats.discrepancy} loading={isLoading} />
            </div>
          </div>

          {/* Cần xử lý ngay */}
          <div style={{
            background: colors.bgSurface,
            border: `1px solid ${colors.dangerSoft}`,
            borderRadius: radius.lg,
            padding: '24px 28px',
            boxShadow: shadow.card,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: space.sm, marginBottom: space.md }}>
              <div style={urgentIconStyle}>
                <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: 14 }}></i>
              </div>
              <div>
                <strong style={{ color: colors.danger, fontSize: fontSize.section }}>Cần xử lý ngay</strong>
                <div style={{ fontSize: fontSize.meta, color: colors.danger }}>Ưu tiên cao</div>
              </div>
            </div>

            <div style={{ fontSize: 44, fontWeight: fontWeight.extra, color: colors.danger, lineHeight: 1, marginBottom: space.xs }}>
              {isLoading ? '—' : (complaintStats.pending + stats.needMoreDocs + paymentOverdue)}
            </div>
            <div style={{ fontSize: fontSize.section, color: colors.danger, marginBottom: space.xl }}>hồ sơ</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: space.md }}>
              <UrgentRow label="Hồ sơ khiếu nại" value={complaintStats.pending} loading={isLoading} />
              <UrgentRow label="Hồ sơ khai thuế" value={stats.needMoreDocs} loading={isLoading} />
              <UrgentRow label="Hồ sơ thanh toán quá hạn" value={paymentOverdue} loading={isLoading} highlight />
            </div>
          </div>
        </div>

        {/* Hoạt động gần đây */}
        <div style={{ marginTop: space.xxxl }}>
          <h3 style={{ fontWeight: fontWeight.bold, fontSize: fontSize.section, color: colors.textPrimary, margin: 0, marginBottom: space.md }}>
            Hoạt động gần đây
          </h3>

          <div style={{ ...card, padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.borderLight}` }}>
              <div style={tabsBar}>
                {[
                  { key: 'new', label: 'Hồ sơ mới' },
                  { key: 'approved', label: 'Hồ sơ đã duyệt' },
                  { key: 'complaint', label: 'Khiếu nại' },
                ].map((tab) => (
                  <button type="button" key={tab.key}
                    onClick={() => handleActivityTabChange(tab.key)}
                    style={activityTab === tab.key ? tabActive : tabBase}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={tableHeadRow}>
                  <th style={{ ...tableHeadCell, width: '20%' }}>Mã hồ sơ/Khiếu nại</th>
                  <th style={{ ...tableHeadCell, width: '15%' }}>Ngày tháng</th>
                  <th style={{ ...tableHeadCell, width: '45%' }}>Nội dung</th>
                  <th style={{ ...tableHeadCell, width: '20%', textAlign: 'center' }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {tableLoading ? (
                  <tr><td colSpan="4" style={loadingBox}>
                    <output className="spinner-border text-danger" aria-live="polite" />
                    <div style={{ marginTop: 8, color: colors.textSecondary, fontSize: fontSize.meta }}>Đang tải dữ liệu…</div>
                  </td></tr>
                ) : tableData.length === 0 ? (
                  <tr><td colSpan="4" style={emptyState}>{emptyMsg}</td></tr>
                ) : (
                  tableData.map((row) => {
                    const badge = formatStatusBadge(row.status);
                    return (
                      <tr key={row.id} style={tableBodyRow}>
                        <td style={{ ...tableCell, fontWeight: fontWeight.bold, color: colors.primary }}>{row.code}</td>
                        <td style={{ ...tableCell, color: colors.textSecondary }}>{formatDate(row.createdAt)}</td>
                        <td style={tableCell}>{row.reason}</td>
                        <td style={{ ...tableCell, textAlign: 'center' }}>
                          <span style={getStatusBadge(badge.kind)}>{badge.label}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </TaxOfficerLayout>
  );
};

const KpiTile = ({ color, label, value, loading }) => (
  <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: radius.md, padding: '14px 16px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: space.sm }}>
      <div style={{ width: 8, height: 8, background: color, borderRadius: '50%' }} />
      <span style={{ fontSize: fontSize.section, fontWeight: fontWeight.extra }}>
        {loading ? '—' : (value ?? 0).toLocaleString('vi-VN')}
      </span>
    </div>
    <div style={{ fontSize: fontSize.label, opacity: 0.9, marginTop: 4, letterSpacing: '0.05em', fontWeight: fontWeight.bold }}>{label}</div>
  </div>
);

const UrgentRow = ({ label, value, loading, highlight }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: fontSize.body }}>
    <span style={{ color: colors.textBody }}>{label}</span>
    <strong style={{ color: highlight ? colors.danger : colors.textPrimary, fontWeight: fontWeight.bold }}>
      {loading ? '—' : value}
    </strong>
  </div>
);

export default TaxOfficerDashboard;