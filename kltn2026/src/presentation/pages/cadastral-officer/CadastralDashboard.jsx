import React, { useState, useMemo } from 'react';
import { useUserInfo } from '../../../hooks/useUserInfo';
import { useAuth } from '../../../hooks/useAuth';
import CadastralLayout from '../../components/CadastralLayout';
import { cadastralApi } from '../../../infrastructure/api/cadastralApi';
import { notifyCadastralWorkloadChanged } from '../../../hooks/useCadastralWorkloadCount';
import { useAsyncMountLoad } from '../../../hooks/useAsyncMountLoad';

const loadCadastralDashboard = async () => {
  const data = await cadastralApi.getCadastralDashboard();
  notifyCadastralWorkloadChanged();
  return data;
};

const extractCode = (content = '') => {
  const m = content.match(/(HS-\d{6}|KN-\d{6})/);
  return m ? m[0] : '—';
};

const NEW_WORK_NOTI_TYPES = new Set(['RECORD_NEW', 'COMPLAINT_NEW', 'RECORD_FRAUD']);

const mapNotiToTableRow = (n) => ({
  id: n.id,
  displayId: extractCode(n.content),
  createdAt: n.createdAt,
  reason: n.content || n.title,
  status: n.notiType,
  statusLabel: n.title,
});

const CadastralDashboard = () => {
  const [activeTab, setActiveTab] = useState('new');
  const { data: dashboard, error: dashboardError, isLoading: loading } = useAsyncMountLoad(loadCadastralDashboard);

  const { user } = useUserInfo();
  const { role } = useAuth();
  const isLandOfficer = role === 'ROLE_LAND_OFFICER';

  const stats = useMemo(() => {
    if (!dashboard) {
      return {
        total: '0',
        verified: '0',
        processing: '0',
        needMoreDocs: '0',
        discrepancy: '0',
        newWorkTotal: 0,
        newRecords: 0,
        newComplaints: 0,
        fraudAlerts: 0,
        verifiedRate: 0,
      };
    }
    return {
      total: Number(dashboard.totalRecords || 0).toLocaleString('vi-VN'),
      verified: Number(dashboard.verifiedRecords || 0).toLocaleString('vi-VN'),
      processing: String(dashboard.processingRecords ?? 0),
      needMoreDocs: String(dashboard.needMoreDocsRecords ?? 0),
      discrepancy: String(dashboard.fraudRecords ?? 0),
      newWorkTotal: Number(dashboard.newWorkTotal ?? 0),
      newRecords: Number(dashboard.newSubmittedRecords ?? 0),
      newComplaints: Number(dashboard.newPendingComplaints ?? 0),
      fraudAlerts: Number(dashboard.fraudAlerts ?? 0),
      verifiedRate: dashboard.verifiedRatePercent ?? 0,
    };
  }, [dashboard]);

  const tableData = useMemo(() => {
    if (!dashboard) return [];
    if (activeTab === 'new') {
      const rows = [];
      for (const n of dashboard.newWorkItems || []) {
        if (NEW_WORK_NOTI_TYPES.has(n.notiType)) {
          rows.push(mapNotiToTableRow(n));
        }
      }
      return rows;
    }
    if (activeTab === 'verified') {
      return (dashboard.recentVerifiedRecords || []).map(mapNotiToTableRow);
    }
    if (activeTab === 'complaint') {
      return (dashboard.recentComplaints || []).map(mapNotiToTableRow);
    }
    return [];
  }, [dashboard, activeTab]);

  return (
    <CadastralLayout user={user}>
      <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '30px 40px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ marginBottom: 30 }}>
          <h2 style={{ margin: 0, fontWeight: 800, color: '#1e293b', fontSize: 24 }}>
            Bảng điều khiển {isLandOfficer && '— Cán bộ Địa chính'}
          </h2>
          <p style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>
            Theo dõi tình trạng hồ sơ đất đai và việc mới cần xử lý
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, marginBottom: 40 }}>
          <div style={statusCardStyle}>
            <div>
              <h3 style={{ margin: 0, color: '#fff', fontWeight: 700, fontSize: 18 }}>Trạng thái hồ sơ</h3>
              <p style={{ margin: '4px 0 0', color: '#f8fafc', fontSize: 14 }}>
                Tổng số hồ sơ: <span style={{ fontWeight: 700 }}>{stats.total}</span>
              </p>
            </div>

            <div style={{ position: 'relative', width: 140, height: 140, margin: '20px auto' }}>
              <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                <path d="M18 2.08 a 15.92 15.92 0 0 1 0 31.83 a 15.92 15.92 0 0 1 0 -31.83" fill="none" stroke="#f59e0b" strokeWidth="4" />
                <path
                  d="M18 2.08 a 15.92 15.92 0 0 1 0 31.83 a 15.92 15.92 0 0 1 0 -31.83"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="4"
                  strokeDasharray={`${stats.verifiedRate}, 100`}
                />
              </svg>
              <div style={donutCenterText}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{stats.verifiedRate}%</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginTop: 4 }}>ĐÃ XÁC THỰC</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <StatBox icon="check-circle-fill" value={stats.verified} label="ĐÃ XÁC THỰC" iconColor="#10b981" />
              <StatBox icon="clock-fill" value={stats.processing} label="ĐANG XỬ LÝ" iconColor="#3b82f6" />
              <StatBox icon="exclamation-circle-fill" value={stats.needMoreDocs} label="CẦN BỔ SUNG" iconColor="#f59e0b" />
              <StatBox icon="exclamation-triangle-fill" value={stats.discrepancy} label="NGHI GIAN LẬN" iconColor="#ef4444" />
            </div>
          </div>

          <div style={urgentCardStyle}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={urgentIconBox}>
                <i className="bi bi-bell-fill"></i>
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#9a3412', fontWeight: 800, fontSize: 18 }}>Việc mới</h3>
                <p style={{ margin: '2px 0 0', color: '#c2410c', fontSize: 13 }}>
                  Hồ sơ / khiếu nại vừa tiếp nhận
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'center', margin: '30px 0 40px' }}>
              <span style={{ fontSize: 64, fontWeight: 800, color: '#d97706', lineHeight: 1 }}>
                {stats.newWorkTotal}
              </span>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#d97706', marginLeft: 8, textTransform: 'uppercase' }}>
                Việc mới
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <UrgentRow label="Hồ sơ mới tiếp nhận" value={stats.newRecords} dotColor="#f59e0b" valueColor="#d97706" />
              <UrgentRow label="Khiếu nại mới" value={stats.newComplaints} dotColor="#eab308" valueColor="#ca8a04" />
              <UrgentRow label="Cảnh báo gian lận" value={stats.fraudAlerts} dotColor="#ef4444" valueColor="#dc2626" />
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ fontWeight: 800, color: '#1e293b', marginBottom: 20, fontSize: 20 }}>Hoạt động gần đây</h3>

          <div style={tableCardStyle}>
            <div style={tabsContainer}>
              <TabButton active={activeTab === 'new'} onClick={() => setActiveTab('new')} label="Việc mới" />
              <TabButton active={activeTab === 'verified'} onClick={() => setActiveTab('verified')} label="Đã xác thực" />
              <TabButton active={activeTab === 'complaint'} onClick={() => setActiveTab('complaint')} label="Khiếu nại" />
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={thRow}>
                  <th style={thCell}>MÃ GIAO DỊCH</th>
                  <th style={thCell}>NGÀY THÁNG</th>
                  <th style={thCell}>NỘI DUNG</th>
                  <th style={thCell}>TRẠNG THÁI</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : tableData.length > 0 ? (
                  tableData.map((item) => {
                    const dateStr = item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString('vi-VN')
                      : '—';
                    const statusInfo = mapActivityStatus(item.status, item.statusLabel);

                    return (
                      <tr key={item.id} style={tdRow}>
                        <td style={{ ...tdCell, fontWeight: 700 }}>{item.displayId}</td>
                        <td style={{ ...tdCell, color: '#64748b' }}>{dateStr}</td>
                        <td style={tdCell}>{item.reason}</td>
                        <td style={tdCell}>
                          <span style={getStatusBadge(statusInfo.type)}>{statusInfo.text}</span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </CadastralLayout>
  );
};

const StatBox = ({ icon, value, label, iconColor }) => (
  <div style={statBoxStyle}>
    <div style={{ color: iconColor, fontSize: 20, display: 'flex', alignItems: 'center' }}>
      <i className={`bi bi-${icon}`}></i>
    </div>
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', letterSpacing: 0.5 }}>{label}</div>
    </div>
  </div>
);

const UrgentRow = ({ label, value, dotColor, valueColor }) => (
  <div style={urgentRowStyle}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor }}></div>
      <span style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>{label}</span>
    </div>
    <span style={{ fontSize: 16, fontWeight: 800, color: valueColor }}>{value}</span>
  </div>
);

const TabButton = ({ active, label, onClick }) => (
  <button type="button" onClick={onClick} style={active ? tabActiveStyle : tabInactiveStyle}>
    {label}
  </button>
);

const mapActivityStatus = (notiType, title) => {
  switch (notiType) {
    case 'RECORD_NEW':
      return { text: 'Chờ xác minh', type: 'pending' };
    case 'COMPLAINT_NEW':
      return { text: 'Khiếu nại mới', type: 'pending' };
    case 'RECORD_FRAUD':
      return { text: 'Nghi gian lận', type: 'error' };
    case 'RECORD_VERIFIED':
      return { text: 'Đã xác thực', type: 'success' };
    case 'COMPLAINT_ACTIVITY':
      return { text: title || 'Khiếu nại', type: 'checking' };
    default:
      return { text: title || '—', type: 'pending' };
  }
};

const getStatusBadge = (type) => {
  const base = {
    padding: '6px 12px',
    borderRadius: 50,
    fontSize: 12,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  };
  if (type === 'pending') return { ...base, background: '#fef3c7', color: '#d97706' };
  if (type === 'checking') return { ...base, background: '#ffedd5', color: '#c2410c' };
  if (type === 'success') return { ...base, background: '#d1fae5', color: '#059669' };
  if (type === 'error') return { ...base, background: '#fee2e2', color: '#dc2626' };
  return base;
};

const statusCardStyle = {
  background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
  borderRadius: 20,
  padding: 30,
  boxShadow: '0 10px 25px rgba(185, 28, 28, 0.15)',
};
const donutCenterText = {
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
const statBoxStyle = {
  background: 'rgba(255,255,255,0.1)',
  borderRadius: 12,
  padding: '12px 16px',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
};
const urgentCardStyle = {
  background: '#fffbeb',
  border: '1px solid #fde68a',
  borderRadius: 20,
  padding: 30,
  boxShadow: '0 10px 25px rgba(245, 158, 11, 0.05)',
};
const urgentIconBox = {
  background: '#f59e0b',
  color: '#fff',
  width: 36,
  height: 36,
  borderRadius: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 18,
};
const urgentRowStyle = {
  border: '1px solid #fde68a',
  borderRadius: 50,
  padding: '12px 24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: '#fff',
};
const tableCardStyle = { background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' };
const tabsContainer = { display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '0 20px', background: '#fff' };
const tabInactiveStyle = {
  background: 'none',
  border: 'none',
  borderBottom: '2px solid transparent',
  padding: '20px 24px',
  fontSize: 14,
  fontWeight: 700,
  color: '#64748b',
  cursor: 'pointer',
};
const tabActiveStyle = { ...tabInactiveStyle, color: '#b91c1c', borderBottom: '2px solid #b91c1c' };
const thRow = { background: '#fff', borderBottom: '1px solid #f1f5f9' };
const thCell = {
  padding: '20px 24px',
  textAlign: 'left',
  fontSize: 12,
  fontWeight: 800,
  color: '#94a3b8',
  letterSpacing: 0.5,
  textTransform: 'uppercase',
};
const tdRow = { borderBottom: '1px solid #f1f5f9' };
const tdCell = { padding: '20px 24px', fontSize: 14, color: '#1e293b' };

export default CadastralDashboard;
