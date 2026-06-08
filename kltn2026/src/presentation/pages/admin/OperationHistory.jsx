import React, { useState } from 'react';
import { backdropA11yProps } from '../../../utils/a11y';
import AdminLayout from '../../components/AdminLayout';
import { adminApi } from '../../../infrastructure/api/adminApi';
import { useAppDialog } from '../../components/dialog/DialogContext';
import { useAsyncMountLoadWithReload } from '../../../hooks/useAsyncMountLoad';
import {
  mapProcessingStepLabel,
  formatStatusChangeLabel,
} from './operationHistoryLabels';

const loadAuditLogs = async () => {
  const rawLogs = await adminApi.getAuditLogs();
  if (!Array.isArray(rawLogs)) return [];

  const mappedLogs = rawLogs.map((log) => {
    const actionStr = (log.processingStep || '').toUpperCase();
    const isError =
      actionStr.includes('REJECT') ||
      actionStr.includes('FAIL') ||
      (log.newStatus || '').toUpperCase().includes('REJECT');

    const logDate = log.processedAt ? new Date(log.processedAt) : null;
    const formattedTime = logDate
      ? logDate.toLocaleString('vi-VN', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        })
      : '—';

    const statusChange = [log.oldStatus, log.newStatus].filter(Boolean).join(' → ');

    return {
      id: log.plogId,
      time: formattedTime,
      rawDate: logDate ? logDate.toISOString().split('T')[0] : '',
      processorAccountId: log.processorAccountId,
      cccd: log.processorCccd || log.processor_cccd || '',
      fullName: log.processorFullName || log.processor_full_name || '',
      accountName: log.processorFullName || log.processor_full_name || '—',
      accountId: log.processorCccd || log.processor_cccd || String(log.processorAccountId ?? '—'),
      processingStep: log.processingStep,
      oldStatus: log.oldStatus,
      newStatus: log.newStatus,
      processorNotes: log.processorNotes,
      recordId: log.recordId,
      statusChange,
      statusChangeLabel: formatStatusChangeLabel(log.oldStatus, log.newStatus),
      ip: '—',
      actionType: log.processingStep || 'KHÔNG RÕ',
      actionTypeLabel: mapProcessingStepLabel(log.processingStep),
      target: log.recordId ? `Hồ sơ #${log.recordId}` : 'Hệ thống',
      detail: log.processorNotes || formatStatusChangeLabel(log.oldStatus, log.newStatus) || '',
      status: isError ? 'LỖI' : 'TỐT',
    };
  });

  mappedLogs.sort((a, b) => b.id - a.id);
  return mappedLogs;
};

const OperationHistory = () => {
  const user = JSON.parse(localStorage.getItem('user_info') || '{}');
  const { showAlert } = useAppDialog();

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('Tất cả hành động');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const { data: logs = [], error: loadError, isLoading, reload: fetchAuditLogs } =
    useAsyncMountLoadWithReload(loadAuditLogs);
  const error = loadError?.message || null;
  const filteredLogs = logs.filter(log => {
    // 1. Lọc theo text (Tìm kiếm ID log, CCCD, IP, Tên)
    const matchSearch = 
      (log.cccd || '').includes(searchTerm) ||
      (log.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toString().includes(searchTerm) || 
      log.accountId.includes(searchTerm) || 
      log.ip.includes(searchTerm) ||
      log.accountName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Lọc theo Action
    const matchAction = actionFilter === 'Tất cả hành động' || log.actionType === actionFilter;
    
    // 3. Lọc theo Ngày
    const matchDate = !dateFilter || log.rawDate === dateFilter;

    return matchSearch && matchAction && matchDate;
  });

  // Lấy danh sách các loại thao tác duy nhất để hiển thị vào thẻ select (Dropdown)
  const uniqueActions = [...new Set(logs.map(log => log.actionType))];

  // Hàm xuất CSV: Sử dụng đúng token và endpoint tập trung
  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = 'http://localhost:8080/api';
      window.open(`${baseUrl}/admin/reports/export?reportType=AUDIT_LOGS&format=csv&token=${token}`, '_blank');
    } catch (err) {
      console.error(err);
      await showAlert({ title: 'Lỗi', message: 'Lỗi khi xuất dữ liệu', variant: 'error' });
    }
  };

  return (
    <AdminLayout user={user}>
      <div className="container py-4" style={{ maxWidth: '1140px' }}>
        
        {/* Header Section */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h3 className="fw-bold mb-1">Lịch sử thao tác</h3>
            <p className="text-muted small mb-0">Tra cứu và kiểm toán các hành động trên hệ thống (Audit Logs)</p>
          </div>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-light border fw-semibold px-3 py-2 shadow-sm" onClick={fetchAuditLogs} aria-label="Làm mới dữ liệu">
              <i className="bi bi-arrow-clockwise"></i>
            </button>
            <button type="button" className="btn btn-outline-secondary fw-semibold px-4 py-2 d-flex align-items-center gap-2 shadow-sm" 
              style={{ borderRadius: '8px' }}
              onClick={handleExportCSV}
            >
              <i className="bi bi-download"></i> Xuất dữ liệu (CSV)
            </button>
          </div>
        </div>

        {error && <div className="alert alert-danger py-2 small mb-4">{error}</div>}

        {/* Filter Bar */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '12px' }}>
          <div className="card-body p-3">
            <div className="row g-3 align-items-center">
              {/* Search */}
              <div className="col-12 col-lg-5 position-relative">
                <i className="bi bi-search position-absolute text-muted" style={{ left: '25px', top: '50%', transform: 'translateY(-50%)' }}></i>
                <input 
                  type="text" 
                  className="form-control py-2 bg-light border-0" 
                  placeholder="Tra cứu ID Log, CCCD, IP..." 
                  aria-label="Tra cứu ID Log, CCCD, IP"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '40px', borderRadius: '8px' }}
                />
              </div>
              
              {/* Action Filter */}
              <div className="col-12 col-md-4 col-lg-4">
                <select 
                  className="form-select py-2 bg-light border-0 fw-semibold text-secondary" 
                  value={actionFilter} 
                  onChange={(e) => setActionFilter(e.target.value)} 
                  style={{ borderRadius: '8px' }}
                >
                  <option value="Tất cả hành động">Tất cả hành động</option>
                  {uniqueActions.map(action => (
                    <option key={action} value={action}>
                      {mapProcessingStepLabel(action)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div className="col-12 col-md-4 col-lg-3">
                <input 
                  type="date" 
                  className="form-control py-2 bg-light border-0 text-secondary fw-semibold" 
                  aria-label="Lọc theo ngày"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  style={{ borderRadius: '8px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="card shadow-sm border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          {isLoading ? (
            <div className="text-center py-5">
              <output className="spinner-border text-danger" aria-live="polite"></output>
              <div className="mt-3 text-muted small">Đang lấy dữ liệu log...</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-borderless table-hover align-middle mb-0" style={{ minWidth: '900px' }}>
                <thead className="bg-light border-bottom">
                  <tr>
                    <th className="py-3 px-4 text-muted small fw-bold" style={{ letterSpacing: '0.5px' }}>THỜI GIAN</th>
                    <th className="py-3 px-4 text-muted small fw-bold" style={{ letterSpacing: '0.5px' }}>TÀI KHOẢN (NGƯỜI XỬ LÝ)</th>
                    <th className="py-3 px-4 text-muted small fw-bold" style={{ letterSpacing: '0.5px' }}>LOẠI THAO TÁC</th>
                    <th className="py-3 px-4 text-muted small fw-bold" style={{ letterSpacing: '0.5px' }}>ĐỐI TƯỢNG TÁC ĐỘNG</th>
                    <th className="py-3 px-4 text-muted small fw-bold" style={{ letterSpacing: '0.5px' }}>CHI TIẾT</th>
                    <th className="py-3 px-4 text-muted small fw-bold text-end" style={{ letterSpacing: '0.5px' }}>TRẠNG THÁI</th>
                    <th className="py-3 px-4 text-muted small fw-bold text-end">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, index) => (
                    <tr key={log.id} className={index !== filteredLogs.length - 1 ? "border-bottom" : ""}>
                      <td className="py-3 px-4 text-muted small text-nowrap">
                        <div className="fw-semibold text-dark">{log.time.split(' ')[1]}</div>
                        <div className="small">{log.time.split(' ')[0]}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="fw-bold text-dark font-monospace">
                          {log.cccd || '—'}
                        </div>
                        <div className="text-muted small mt-1">
                          {log.fullName || '—'}
                          {log.processorAccountId != null && (
                            <span className="ms-1">• TK #{log.processorAccountId}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                          {log.actionTypeLabel}
                        </span>
                      </td>
                      
                      <td className="py-3 px-4 text-secondary small fw-semibold font-monospace">
                        {log.target}
                      </td>
                      <td className="py-3 px-4 text-secondary small" style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={log.detail}>
                        {log.detail || '-'}
                      </td>
                      <td className="py-3 px-4 text-end">
                        <span className={`badge rounded-pill px-3 py-2 ${log.status === 'TỐT' ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                          {log.status === 'TỐT' ? 'Thành công' : 'Lỗi/Từ chối'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary rounded-pill fw-semibold"
                          onClick={() => setSelectedLog(log)}
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        <i className="bi bi-inbox fs-1 d-block mb-3 text-secondary opacity-50"></i>
                        Không tìm thấy nhật ký thao tác nào phù hợp với bộ lọc
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
      {selectedLog && (
  <div
    className="d-flex align-items-center justify-content-center"
    style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      zIndex: 1050,
    }}
    {...backdropA11yProps(() => setSelectedLog(null))}
  >
    <div
      className="card border-0 shadow-lg"
      style={{ width: '100%', maxWidth: '520px', borderRadius: '16px' }}
    >
      <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold">Chi tiết thao tác</h5>
        <button
          type="button"
          className="btn btn-sm btn-light"
          onClick={() => setSelectedLog(null)}
        >
          Đóng
        </button>
      </div>

      <div className="card-body">
        <div className="mb-4 p-3 bg-light rounded-3">
          <div className="small text-muted fw-bold mb-2">NGƯỜI XỬ LÝ</div>
          <div><span className="text-muted">Họ tên:</span>{' '}
            <strong>{selectedLog.fullName || '—'}</strong>
          </div>
          <div className="mt-1">
            <span className="text-muted">CCCD:</span>{' '}
            <strong className="font-monospace">{selectedLog.cccd || '—'}</strong>
          </div>
          <div className="mt-1 small text-muted">
            Mã tài khoản: #{selectedLog.processorAccountId ?? '—'}
          </div>
        </div>

        <div className="mb-4 p-3 border rounded-3">
          <div className="small text-muted fw-bold mb-2">HOẠT ĐỘNG TẠI GIAI ĐOẠN NÀY</div>
          <div><span className="text-muted">Bước xử lý:</span>{' '}
            <strong>{selectedLog.actionTypeLabel || mapProcessingStepLabel(selectedLog.processingStep)}</strong>
          </div>
          <div className="mt-1">
            <span className="text-muted">Đối tượng:</span>{' '}
            <strong className="font-monospace">{selectedLog.target}</strong>
          </div>
          <div className="mt-1">
            <span className="text-muted">Thời gian:</span>{' '}
            <strong>{selectedLog.time}</strong>
          </div>
          {selectedLog.detail && (
            <div className="mt-2 small">
              <span className="text-muted">Ghi chú:</span> {selectedLog.detail}
            </div>
          )}
        </div>

        <div className="p-3 border rounded-3">
          <div className="small text-muted fw-bold mb-2">TRẠNG THÁI</div>
          <div>
            <span className="text-muted">Chuyển trạng thái:</span>{' '}
            <strong>{selectedLog.statusChangeLabel || formatStatusChangeLabel(selectedLog.oldStatus, selectedLog.newStatus)}</strong>
          </div>
          <span
            className={`badge rounded-pill mt-2 px-3 py-2 ${
              selectedLog.status === 'TỐT'
                ? 'bg-success bg-opacity-10 text-success'
                : 'bg-danger bg-opacity-10 text-danger'
            }`}
          >
            {selectedLog.status === 'TỐT' ? 'Thành công' : 'Lỗi/Từ chối'}
          </span>
        </div>
      </div>
    </div>
  </div>
)}
    </AdminLayout>
  );
};

export default OperationHistory;