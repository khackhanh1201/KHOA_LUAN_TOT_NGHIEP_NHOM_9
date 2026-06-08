import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useUserInfo } from '../../../hooks/useUserInfo';
import { adminApi } from '../../../infrastructure/api/adminApi';
import { useAsyncMountLoadWithReload } from '../../../hooks/useAsyncMountLoad';

const formatVisits = (n) => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n;
};

const DEFAULT_STATS = {
  visits24h: 0,
  totalAccounts: 0,
  stuckDossiers: 0,
  lockedAccounts: 0,
  incidents: 0,
  incidentDetails: [],
  successRate: 95,
};

const DEFAULT_LOGS = { system: [], security: [], error: [] };

const loadAdminDashboard = async () => {
  const [statsData, logsData] = await Promise.all([
    adminApi.getDashboardStatistics(),
    adminApi.getAuditLogs(),
  ]);

  const dataS = statsData?.data || statsData || {};
  const stats = {
    visits24h: dataS.visits24h ?? 0,
    totalAccounts: dataS.totalAccounts ?? 0,
    stuckDossiers: dataS.stuckDossiers ?? dataS.pendingDeclarations ?? 0,
    lockedAccounts: dataS.lockedAccounts ?? 0,
    incidents: dataS.incidents ?? 0,
    incidentDetails: Array.isArray(dataS.incidentDetails) ? dataS.incidentDetails : [],
    successRate: dataS.successRate ?? 95,
  };

  const formattedLogs = { system: [], security: [], error: [] };

  if (Array.isArray(logsData)) {
    logsData.forEach((log) => {
      const step = (log.processingStep || '').toUpperCase();
      const newStatus = (log.newStatus || '').toUpperCase();
      const notes = (log.processorNotes || '').toUpperCase();
      const logTime = log.processedAt
        ? new Date(log.processedAt).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
          })
        : '—';
      const statusChange = [log.oldStatus, log.newStatus].filter(Boolean).join(' → ');
      const logContent = [
        log.processingStep,
        statusChange && `(${statusChange})`,
        log.processorNotes,
        log.recordId ? `[Hồ sơ #${log.recordId}]` : null,
      ].filter(Boolean).join(' ');
      const logItem = {
        id: log.plogId,
        time: logTime,
        content: logContent || '—',
        status: 'Hoàn tất',
        type: 'success',
      };

      if (
        newStatus.includes('REJECT') ||
        step.includes('REJECT') ||
        step.includes('TỪ CHỐI') ||
        notes.includes('TỪ CHỐI')
      ) {
        logItem.type = 'danger';
        logItem.status = 'Từ chối / Lỗi';
        formattedLogs.error.push(logItem);
      } else if (
        step.includes('LOGIN') ||
        step.includes('LOCK') ||
        step.includes('AUTH') ||
        step.includes('KHÓA')
      ) {
        logItem.type = 'warning';
        logItem.status = 'Cảnh báo';
        formattedLogs.security.push(logItem);
      } else {
        formattedLogs.system.push(logItem);
      }
    });
  }

  formattedLogs.system.sort((a, b) => b.id - a.id);
  formattedLogs.error.sort((a, b) => b.id - a.id);
  formattedLogs.security.sort((a, b) => b.id - a.id);

  return { stats, logs: formattedLogs };
};

const AdminDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user_info') || '{}');
  useUserInfo();

  const [activeTab, setActiveTab] = useState('system');
  const { data, error: loadError, isLoading, reload: fetchDashboardData } =
    useAsyncMountLoadWithReload(loadAdminDashboard);

  const stats = data?.stats ?? DEFAULT_STATS;
  const logs = data?.logs ?? DEFAULT_LOGS;
  const error = loadError?.message || null;

  const currentLogs = logs[activeTab] || [];

  return (
    <AdminLayout user={user}>
      <div className="container py-4" style={{ maxWidth: '1140px' }}>
        
        {/* Header Section */}
        <div className="mb-4 d-flex justify-content-between align-items-center">
          <div>
            <h3 className="fw-bold">Bảng điều khiển hệ thống</h3>
            <p className="text-muted">Giám sát trạng thái hoạt động toàn cục của nền tảng</p>
          </div>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={fetchDashboardData}>
            <i className="bi bi-arrow-clockwise me-2"></i> Làm mới dữ liệu
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {isLoading ? (
          <div className="text-center py-5">
            <output className="spinner-border text-danger" aria-live="polite">
              <span className="visually-hidden">Loading...</span>
            </output>
            <div className="mt-3 text-muted">Đang tải dữ liệu hệ thống...</div>
          </div>
        ) : (
          <>
            {/* Top Cards Grid */}
            <div className="row g-4 mb-4">
              
              {/* 1. Sức khỏe nền tảng (Thẻ Đỏ) */}
              <div className="col-lg-6">
                <div 
                  className="card border-0 shadow-sm h-100" 
                  style={{ 
                    borderRadius: '16px', 
                    background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
                    color: 'white'
                  }}
                >
                  <div className="card-body p-4 p-md-5">
                    <div className="mb-4">
                      <h5 className="fw-bold mb-1">Sức khỏe nền tảng</h5>
                      <p className="mb-0" style={{ fontSize: '14px', color: '#f1f5f9' }}>
                        Trạng thái: <span style={{ color: '#4ade80', fontWeight: '600' }}>Hoạt động ổn định</span>
                      </p>
                    </div>

                    {/* SVG Donut Chart */}
                    <div className="position-relative mx-auto mb-4" style={{ width: '140px', height: '140px' }}>
                      <svg viewBox="0 0 36 36" className="w-100 h-100">
                        <path d="M18 2.08 a 15.92 15.92 0 0 1 0 31.83 a 15.92 15.92 0 0 1 0 -31.83" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                        <path
                          d="M18 2.08 a 15.92 15.92 0 0 1 0 31.83 a 15.92 15.92 0 0 1 0 -31.83"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="4"
                          strokeDasharray={`${stats.successRate}, 100`}
                        />                      
                      </svg>
                      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center">
                        <div style={{ fontSize: '28px', fontWeight: '800', lineHeight: '1' }}>{stats.successRate}%</div>
                        <div style={{ fontSize: '12px', fontWeight: '700', marginTop: '4px' }}>THÀNH CÔNG</div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="row g-3">
                      <StatBox icon="activity" value={formatVisits(stats.visits24h)} label="TRUY CẬP (24H)" iconColor="#10b981" />                      <StatBox icon="people" value={stats.totalAccounts} label="TÀI KHOẢN" iconColor="#3b82f6" />
                      <StatBox icon="shield-exclamation" value={stats.stuckDossiers} label="HỒ SƠ KẸT" iconColor="#f59e0b" />
                      <StatBox icon="person-x" value={stats.lockedAccounts} label="TK BỊ KHÓA" iconColor="#ef4444" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Cảnh báo hệ thống (Thẻ Trắng) */}
              <div className="col-lg-6">
                <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '16px' }}>
                  <div className="card-body p-4 p-md-5 d-flex flex-column">
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div className="d-flex align-items-center justify-content-center rounded-3 bg-danger text-white" style={{ width: '48px', height: '48px', fontSize: '20px' }}>
                        <i className="bi bi-exclamation-triangle-fill"></i>
                      </div>
                      <div>
                        <h5 className="fw-bold text-danger mb-0">Cảnh báo hệ thống</h5>
                        <p className="text-danger mb-0 small"><i className="bi bi-bell me-1"></i> Cần chú ý ngay</p>
                      </div>
                    </div>

                    <div className="text-center my-4 flex-grow-1 d-flex flex-column justify-content-center">
                      <div>
                        <span style={{ fontSize: '64px', fontWeight: '800', color: '#dc2626', lineHeight: '1' }}>{stats.incidents}</span>
                        <span className="ms-2" style={{ fontSize: '20px', fontWeight: '700', color: '#dc2626' }}>sự cố</span>
                      </div>
                    </div>

                    <div className="d-flex flex-column gap-3 mt-auto">
                      {stats.incidentDetails.map((inc) => (
                         <IncidentRow key={inc.label} label={inc.label} count={inc.count} color={inc.color} />
                      ))}
                      {stats.incidentDetails.length === 0 && (
                         <div className="text-success text-center fw-bold"><i className="bi bi-check-circle me-1"></i> Mọi thứ đang hoạt động tốt</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Nhật ký nền tảng */}
            <div className="mb-4 mt-5">
              <h4 className="fw-bold">Nhật ký nền tảng gần đây</h4>
            </div>

            <div className="card shadow-sm border-0 mb-5" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              {/* Tabs */}
              <div className="d-flex border-bottom px-3 bg-white" style={{ overflowX: 'auto' }}>
                <TabButton active={activeTab === 'system'} onClick={() => setActiveTab('system')} label="Hệ thống & Dữ liệu" />
                <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} label="Bảo mật & Tài khoản" />
                <TabButton active={activeTab === 'error'} onClick={() => setActiveTab('error')} label="Cảnh báo lỗi" />
              </div>

              {/* Table */}
              <div className="table-responsive">
                <table className="table table-borderless mb-0" style={{ minWidth: '700px' }}>
                  <thead className="border-bottom" style={{ background: '#f8fafc' }}>
                    <tr>
                      <th className="py-3 px-4 text-muted small fw-bold">ID</th>
                      <th className="py-3 px-4 text-muted small fw-bold">THỜI GIAN</th>
                      <th className="py-3 px-4 text-muted small fw-bold">NỘI DUNG SỰ KIỆN</th>
                      <th className="py-3 px-4 text-muted small fw-bold text-end">TRẠNG THÁI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentLogs.map((log, index) => (
                      <tr key={log.id} className={index !== currentLogs.length - 1 ? "border-bottom" : ""}>
                        <td className="py-3 px-4 fw-bold align-middle text-dark font-monospace">#{log.id}</td>
                        <td className="py-3 px-4 text-muted align-middle">{log.time}</td>
                        <td className="py-3 px-4 align-middle text-dark">{log.content}</td>
                        <td className="py-3 px-4 text-end align-middle">
                          <span className={`badge rounded-pill px-3 py-2 ${getBadgeClass(log.type)}`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {currentLogs.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center py-5 text-muted">Không có dữ liệu nhật ký</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

// --- Sub-Components ---
const StatBox = ({ icon, value, label, iconColor }) => (
  <div className="col-6">
    <div className="d-flex align-items-center gap-3 p-2 rounded-3" style={{ background: 'rgba(255,255,255,0.1)' }}>
      <div 
        className="rounded-circle d-flex align-items-center justify-content-center text-white" 
        style={{ width: '36px', height: '36px', background: iconColor, flexShrink: 0 }}
      >
        <i className={`bi bi-${icon}`}></i>
      </div>
      <div>
        <div className="fw-bold" style={{ fontSize: '16px', lineHeight: '1.2' }}>{value}</div>
        <div style={{ fontSize: '12px', color: '#cbd5e1', letterSpacing: '0.5px' }}>{label}</div>
      </div>
    </div>
  </div>
);

const IncidentRow = ({ label, count, color }) => (
  <div className="d-flex justify-content-between align-items-center border rounded-pill px-4 py-2 bg-white">
    <div className="d-flex align-items-center gap-2">
      <div className="rounded-circle" style={{ width: '8px', height: '8px', background: color }}></div>
      <span className="fw-semibold text-secondary" style={{ fontSize: '14px' }}>{label}</span>
    </div>
    <span className="fw-bold" style={{ fontSize: '16px', color: color }}>{count}</span>
  </div>
);

const TabButton = ({ active, label, onClick }) => (
  <button type="button" onClick={onClick} 
    className={`btn flex-shrink-0 fw-bold rounded-0 px-4 py-3 ${active ? 'text-danger border-danger' : 'text-muted border-transparent'}`}
    style={{ 
      border: 'none', 
      borderBottom: `2px solid ${active ? '#b91c1c' : 'transparent'}`,
      fontSize: '15px'
    }}
  >
    {label}
  </button>
);

const getBadgeClass = (type) => {
  if (type === 'success') return 'bg-success bg-opacity-10 text-success';
  if (type === 'warning') return 'bg-warning bg-opacity-10 text-warning';
  if (type === 'danger' || type === 'error') return 'bg-danger bg-opacity-10 text-danger';
  return 'bg-secondary bg-opacity-10 text-secondary';
};

export default AdminDashboard;
