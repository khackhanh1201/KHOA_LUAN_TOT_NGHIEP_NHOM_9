import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { interactiveDivProps } from '../../../utils/a11y';
import LandTaxLayout from '../../components/LandTaxLayout';
import { useUserInfo } from '../../../hooks/useUserInfo';
import { useAsyncMountLoadWithReload } from '../../../hooks/useAsyncMountLoad';
import LandTaxRecentActivity from './LandTaxRecentActivity';

const statusBadgeStyle = (cfg) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  padding: '3px 10px',
  borderRadius: 20,
  background: cfg.bg,
  color: cfg.color,
  fontSize: 12,
  fontWeight: 600,
});

const urgentBadgeStyle = {
  background: '#ef4444',
  color: '#fff',
  borderRadius: '50%',
  width: 20,
  height: 20,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 12,
  fontWeight: 700,
};

const featureCardStyle = {
  background: '#fff',
  borderRadius: 12,
  padding: '16px 20px',
  border: '1px solid #f1f5f9',
  cursor: 'pointer',
  transition: 'box-shadow 0.2s, border-color 0.2s',
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
};

const featureIconStyle = {
  width: 36,
  height: 36,
  borderRadius: 10,
  background: '#fff7ed',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const API_BASE = 'http://localhost:8080/api';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// ── Màu trạng thái (Update theo CSDL) ──
const STATUS_CONFIG = {
  // Tax Payments
  PAID:       { label: 'Đã nộp',    bg: '#dcfce7', color: '#16a34a', dot: '#22c55e' },
  UNPAID:     { label: 'Chờ nộp',   bg: '#fef9c3', color: '#ca8a04', dot: '#eab308' },
  OVERDUE:    { label: 'Trễ hạn',   bg: '#fee2e2', color: '#dc2626', dot: '#ef4444' },
  
  // Tax Declarations & Records
  PENDING:    { label: 'Chờ xử lý', bg: '#fef9c3', color: '#ca8a04', dot: '#eab308' },
  APPROVED:   { label: 'Đã duyệt',  bg: '#dcfce7', color: '#16a34a', dot: '#22c55e' },
  COMPLETED:  { label: 'Hoàn thành',bg: '#dcfce7', color: '#16a34a', dot: '#22c55e' },
  REJECTED:   { label: 'Từ chối',   bg: '#fee2e2', color: '#dc2626', dot: '#ef4444' },
  CANCELLED:  { label: 'Đã hủy',    bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: '#f3f4f6', color: '#6b7280', dot: '#9ca3af' };
  return (
    <span style={statusBadgeStyle(cfg)}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
      {cfg.label}
    </span>
  );
};

// ── Donut Chart SVG thuần ──
const DonutChart = ({ paid, pending, overdue }) => {
  const total = paid + pending + overdue || 1;
  const paidPct = paid / total;
  const pendingPct = pending / total;
  const overduePct = overdue / total;

  const r = 54, cx = 70, cy = 70, stroke = 14;
  const circ = 2 * Math.PI * r;

  const paidDash   = paidPct * circ;
  const pendingDash = pendingPct * circ;
  const overdueDash = overduePct * circ;
  const paidOffset   = 0;
  const pendingOffset = -paidDash;
  const overdueOffset = -(paidDash + pendingDash);

  const pct = total > 0 ? Math.round((paid / total) * 100) : 0;

  return (
    <svg viewBox="0 0 140 140" style={{ width: 140, height: 140 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
      {overdueDash > 0 && (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ef4444" strokeWidth={stroke}
          strokeDasharray={`${overdueDash} ${circ - overdueDash}`}
          strokeDashoffset={overdueOffset} strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }} />
      )}
      {pendingDash > 0 && (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#eab308" strokeWidth={stroke}
          strokeDasharray={`${pendingDash} ${circ - pendingDash}`}
          strokeDashoffset={pendingOffset} strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }} />
      )}
      {paidDash > 0 && (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#22c55e" strokeWidth={stroke}
          strokeDasharray={`${paidDash} ${circ - paidDash}`}
          strokeDashoffset={paidOffset} strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }} />
      )}
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize={20} fontWeight={700} fill="#1e293b">{pct}%</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize={10} fill="#64748b">Đã nộp</text>
    </svg>
  );
};

const loadLandTaxData = async () => {
  const [recRes, declRes] = await Promise.all([
    fetch(`${API_BASE}/payments/unpaid`, { headers: getAuthHeaders() }),
    fetch(`${API_BASE}/tax/declarations/my-history`, { headers: getAuthHeaders() }),
  ]);

  let taxRecords = [];
  let declarations = [];

  if (recRes.ok) {
    const j = await recRes.json();
    const raw = j.data || j || [];
    taxRecords = raw.map((r) => {
      let st = r.paymentStatus || r.status || 'UNPAID';
      if (st === 'UNPAID' && r.dueDate && new Date(r.dueDate) < new Date()) {
        st = 'OVERDUE';
      }
      return {
        ...r,
        taxId: r.payId || r.pay_id || r.id,
        status: st,
        parcelCode: r.parcelNumber || `TĐ-${r.landParcelId}`,
        parcelId: r.landParcelId || r.land_parcel_id,
        taxYear: r.taxYear || r.tax_year,
        taxAmount: r.totalAmountDue || r.total_amount_due || r.amount,
        dueDate: r.dueDate || r.due_date,
        createdAt: r.paidAt || r.paid_at || r.dueDate || r.due_date,
      };
    });
  }

  if (declRes.ok) {
    const j = await declRes.json();
    const raw = j.data || j || [];
    declarations = raw.map((d) => ({
      ...d,
      declarationId: d.recordId || d.declarationId || d.id,
      createdAt: d.createdAt || d.submitted_at,
      parcelCode: d.parcelNumber || d.parcelCode,
      parcelId: d.parcelId || d.parcel_id,
      taxYear: d.taxYear || (d.createdAt ? new Date(d.createdAt).getFullYear() : null),
      declaredArea: d.declaredArea || d.declared_area,
      declaredPurpose: d.declaredUsage || d.declaredPurpose || d.declared_purpose,
      status: d.status,
    }));
  }

  return { taxRecords, declarations };
};

const LandTaxPage = () => {
  const navigate = useNavigate();
  const { user } = useUserInfo();

  const { data, error: loadError, isLoading: loading, reload: fetchAll } =
    useAsyncMountLoadWithReload(loadLandTaxData);
  const taxRecords = data?.taxRecords ?? [];
  const declarations = data?.declarations ?? [];
  const error = loadError ? 'Không thể tải dữ liệu. Vui lòng thử lại.' : '';

  const [activeTab, setActiveTab] = useState('tax'); // 'tax' | 'declarations'

  // ── Tính toán stats ──
  const paid    = taxRecords.filter(r => r.status === 'PAID').length;
  const pending = taxRecords.filter(r => r.status === 'UNPAID' || r.status === 'PENDING').length;
  const overdue = taxRecords.filter(r => r.status === 'OVERDUE').length;
  const total   = taxRecords.length;

  const declPending  = declarations.filter(d => d.status === 'PENDING').length;
  const declApproved = declarations.filter(d => d.status === 'APPROVED' || d.status === 'COMPLETED').length;
  const declRejected = declarations.filter(d => d.status === 'REJECTED').length;
  const declTotal    = declarations.length;
  const declPct      = declTotal > 0 ? Math.round((declApproved / declTotal) * 100) : 0;

  // ── Cần xử lý ngay ──
  const urgent = [];
  for (const r of taxRecords) {
    if (r.status === 'OVERDUE') {
      urgent.push({
        type: 'overdue',
        label: `Thuế trễ hạn — ${r.parcelCode || `Thửa #${r.parcelId}`}`,
        detail: `Năm ${r.taxYear} · ${Number(r.taxAmount).toLocaleString('vi-VN')} ₫`,
        color: '#ef4444',
      });
    } else if (r.status === 'UNPAID' || r.status === 'PENDING') {
      urgent.push({
        type: 'pending',
        label: `Thuế đến hạn nộp — ${r.parcelCode || `Thửa #${r.parcelId}`}`,
        detail: r.dueDate ? `Hạn: ${new Date(r.dueDate).toLocaleDateString('vi-VN')}` : '',
        color: '#f59e0b',
      });
    }
  }
  for (const d of declarations) {
    if (d.status === 'PENDING') {
      urgent.push({
        type: 'decl',
        label: `Tờ khai chờ duyệt — ${d.parcelCode || `Thửa #${d.parcelId}`}`,
        detail: `Năm ${d.taxYear}`,
        color: '#3b82f6',
      });
    }
  }

  return (
    <LandTaxLayout user={user}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 8 }}>
        <h4 style={{ fontWeight: 700, color: '#1e293b', marginBottom: 2 }}>Tổng quan</h4>
        <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
          Theo dõi trạng thái thuế và hồ sơ của bạn
        </p>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 16px', borderRadius: 10, marginBottom: 16, fontSize: 13 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
          <output className="spinner-border text-danger" aria-live="polite" />
          <p style={{ marginTop: 12 }}>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          {/* ── Row 1: 3 card stats ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>

            {/* Trạng thái thuế */}
            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={styles.cardLabel}>Trạng thái nộp thuế</p>
                  <p style={styles.cardSub}>Tổng khoản thuế: {total}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 8 }}>
                <DonutChart paid={paid} pending={pending} overdue={overdue} />
                <div style={{ flex: 1 }}>
                  {[
                    { label: 'Đã nộp',  count: paid,    color: '#22c55e' },
                    { label: 'Chờ nộp', count: pending, color: '#eab308' },
                    { label: 'Trễ hạn', count: overdue, color: '#ef4444' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: '#64748b', flex: 1 }}>{item.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cần xử lý ngay */}
            <div style={{ ...styles.card, background: urgent.length > 0 ? '#fff8f8' : '#fff', border: urgent.length > 0 ? '1px solid #fecaca' : '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                {urgent.length > 0 && (
                  <span style={urgentBadgeStyle}>!</span>
                )}
                <p style={{ ...styles.cardLabel, margin: 0 }}>Cần xử lý ngay</p>
              </div>
              {urgent.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8' }}>
                  <i className="bi bi-check-circle" style={{ fontSize: 28, color: '#22c55e' }} />
                  <p style={{ fontSize: 12, marginTop: 8 }}>Không có việc cần xử lý</p>
                </div>
              ) : (
                <div style={{ fontSize: 13 }}>
                  <div style={{ background: '#fff7ed', borderRadius: 8, padding: '8px 12px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#92400e' }}>Tổng số việc</span>
                    <span style={{ fontWeight: 700, color: '#dc2626', fontSize: 28 }}>{urgent.length}</span>
                  </div>
                  {urgent.slice(0, 3).map((u) => (
                    <div key={u.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#475569', fontSize: 12 }}>{u.label}</span>
                      <span style={{ background: u.color + '20', color: u.color, borderRadius: 20, padding: '2px 8px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {u.type === 'overdue' ? 'Trễ hạn' : u.type === 'pending' ? 'Chờ nộp' : 'Chờ duyệt'}
                      </span>
                    </div>
                  ))}
                  {urgent.length > 3 && (
                    <p style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center', marginTop: 6 }}>+{urgent.length - 3} việc khác</p>
                  )}
                </div>
              )}
            </div>

            {/* Trạng thái hồ sơ */}
            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <p style={styles.cardLabel}>Trạng thái hồ sơ khai báo</p>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>Tổng hồ sơ: {declTotal}</span>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Tỷ lệ hoàn thành</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>{declPct}%</span>
                </div>
                <div style={{ height: 8, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: '100%',
                      transform: `scaleX(${declPct / 100})`,
                      transformOrigin: 'left',
                      background: 'linear-gradient(90deg, #22c55e, #16a34a)',
                      borderRadius: 10,
                      transition: 'transform 0.5s ease',
                    }}
                  />
                </div>
              </div>
              {[
                { label: 'Đang xử lý', count: declPending,  color: '#eab308', pct: declTotal > 0 ? Math.round(declPending/declTotal*100) : 0 },
                { label: 'Đã hoàn thành', count: declApproved, color: '#22c55e', pct: declPct },
                { label: 'Từ chối', count: declRejected, color: '#ef4444', pct: declTotal > 0 ? Math.round(declRejected/declTotal*100) : 0 },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#64748b', flex: 1 }}>{item.label}</span>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{item.pct}%</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', minWidth: 20, textAlign: 'right' }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Chức năng ── */}
          <div style={{ marginBottom: 16 }}>
            <h5 style={{ fontWeight: 700, color: '#1e293b', marginBottom: 12, fontSize: 15 }}>Chức năng</h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { icon: 'bi-search', label: 'Tra cứu thông tin đất', desc: 'Tra cứu thông tin quy hoạch, diện tích, giá đất', onClick: () => navigate('/land-information') },
                { icon: 'bi-file-earmark-plus', label: 'Nộp hồ sơ khai thuế đất', desc: 'Tạo mới và gửi hồ sơ khai báo thuế đất', onClick: () => navigate('/property-declaration') },
                { icon: 'bi-credit-card', label: 'Nộp thuế', desc: 'Thanh toán trực tuyến các khoản thuế đất', onClick: () => navigate('/payment') },
                { icon: 'bi-clock-history', label: 'Theo dõi trạng thái hồ sơ', desc: 'Kiểm tra tiến độ xử lý hồ sơ đã nộp', onClick: () => setActiveTab('declarations') },
                { icon: 'bi-chat-left-text', label: 'Gửi khiếu nại', desc: 'Gửi phản ánh, thắc mắc về thuế đất', onClick: () => navigate('/complaint') },
              ].map((fn) => (
                <div
                  key={fn.label}
                  {...interactiveDivProps(fn.onClick, fn.label)}
                  style={featureCardStyle}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
                >
                  <div style={featureIconStyle}>
                    <i className={`bi ${fn.icon}`} style={{ fontSize: 17, color: '#f97316' }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 13, color: '#1e293b', margin: 0 }}>{fn.label}</p>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, marginTop: 2 }}>{fn.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <LandTaxRecentActivity
            cardStyle={styles.card}
            taxRecords={taxRecords}
            declarations={declarations}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onRefresh={fetchAll}
            StatusBadge={StatusBadge}
          />
        </>
      )}
    </LandTaxLayout>
  );
};

const styles = {
  card: {
    background: '#fff',
    borderRadius: 14,
    padding: '20px 22px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  cardLabel: {
    fontWeight: 700,
    fontSize: 14,
    color: '#1e293b',
    margin: '0 0 2px 0',
  },
  cardSub: {
    fontSize: 12,
    color: '#94a3b8',
    margin: 0,
  },
};

export default LandTaxPage;