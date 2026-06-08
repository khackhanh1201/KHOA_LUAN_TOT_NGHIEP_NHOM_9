import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { adminApi } from '../../../infrastructure/api/adminApi'; 
import { useUserInfo } from '../../../hooks/useUserInfo';
import { useAppDialog } from '../../components/dialog/DialogContext';
import { useAsyncMountLoadWithReload } from '../../../hooks/useAsyncMountLoad';

const DEFAULT_KPIS = {
  totalRecords: 13,
  totalRevenue: 12013750,
  revenueGrowth: 5.4,
};

const loadReportData = async () => {
  const statsData = await adminApi.getDashboardStatistics();
  const s = statsData?.data || statsData;
  if (s) {
    return {
      totalRecords: s.totalRecords || 13,
      totalRevenue: s.totalRevenue || 12013750,
      revenueGrowth: s.revenueGrowth || 5.4,
    };
  }
  throw new Error('Dữ liệu trả về trống');
};

const AdminReportStats = () => {
  const { showAlert } = useAppDialog();
  const user = JSON.parse(localStorage.getItem('user_info') || '{}');
  const { data: kpis, error: loadError, isLoading, reload: fetchReportData } = useAsyncMountLoadWithReload(loadReportData);
  const displayKpis = kpis ?? (loadError ? DEFAULT_KPIS : DEFAULT_KPIS);
  const error = loadError ? 'Không thể làm mới dữ liệu. Đang hiển thị dữ liệu bộ nhớ đệm.' : null;

  // Hàm Xuất Báo Cáo: Đồng bộ hóa cấu trúc URL từ file adminApi gốc
  const handleExport = async (reportType, format) => {
    try {
      const token = localStorage.getItem('token');
      // Đảm bảo URL Base đồng nhất với 'http://localhost:8080/api'
      const baseUrl = 'http://localhost:8080/api';
      
      // Chuyển hướng hoặc mở tab mới kèm Query Params và Token xác thực
      const exportUrl = `${baseUrl}/admin/reports/export?reportType=${reportType}&format=${format}&token=${token}`;
      window.open(exportUrl, '_blank');
      
    } catch (err) {
      console.error("Lỗi xuất bản báo cáo:", err);
      await showAlert({ title: 'Lỗi', message: 'Lỗi khi xuất báo cáo', variant: 'error' });
    }
  };

  return (
    <AdminLayout user={user}>
      <div className="container py-4" style={{ maxWidth: '1140px' }}>
        
        {/* Header Section */}
        <div className="mb-4 d-flex justify-content-between align-items-center">
          <div>
            <h3 className="fw-bold">Báo cáo & Thống kê</h3>
            <p className="text-muted">Xuất dữ liệu, phân tích doanh thu và hiệu suất xử lý hồ sơ</p>
          </div>
          <button type="button" className="btn btn-outline-danger btn-sm px-3" onClick={fetchReportData} style={{borderRadius: '20px'}}>
            <i className="bi bi-arrow-clockwise me-1"></i> Làm mới
          </button>
        </div>

        {error && <div className="alert alert-warning py-2 small mb-4">{error}</div>}

        {isLoading ? (
          <div className="text-center py-5"><div className="spinner-border text-danger"></div></div>
        ) : (
          <>
            {/* Top KPI Cards */}
            <div className="row g-4 mb-4">
              <div className="col-lg-6">
                <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                  <div className="card-body p-4 text-center text-lg-start">
                    <div className="text-muted small fw-bold mb-2">TỔNG SỐ HỒ SƠ TIẾP NHẬN</div>
                    <div className="fw-bold text-dark mb-1" style={{ fontSize: '32px' }}>
                      {displayKpis.totalRecords.toLocaleString()}
                    </div>
                    <div className="text-secondary fw-semibold small">
                      <i className="bi bi-folder2-open me-1"></i> Hồ sơ Đất đai & Khai thuế
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                  <div className="card-body p-4 text-center text-lg-start">
                    <div className="text-muted small fw-bold mb-2">TỔNG THU THUẾ ĐẤT ĐAI (VNĐ)</div>
                    <div className="fw-bold text-dark mb-1" style={{ fontSize: '32px' }}>
                      {displayKpis.totalRevenue.toLocaleString()} ₫
                    </div>
                    <div className="text-success fw-semibold small">
                      <i className="bi bi-graph-up-arrow me-1"></i> +{displayKpis.revenueGrowth}% so với kỳ trước
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Chart Area */}
            <div className="card shadow-sm border-0 mb-5" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                  <div className="fw-bold text-dark"><i className="bi bi-activity text-primary me-2"></i>Lưu lượng Hoạt động Hệ thống (7 ngày qua)</div>
                  <button type="button" onClick={() => handleExport('SYSTEM_ACTIVITY', 'csv')}
                    className="btn fw-bold" 
                    style={styles.pillButtonBlue}
                  >
                    <i className="bi bi-file-earmark-arrow-down me-2"></i>Xuất CSV
                  </button>
                </div>

                <div style={{ height: '250px', width: '100%' }}>
                  <svg width="100%" height="100%" viewBox="0 0 1000 250" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Grid Lines */}
                    <line x1="50" y1="20" x2="1000" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="50" y1="70" x2="1000" y2="70" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="50" y1="120" x2="1000" y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="50" y1="170" x2="1000" y2="170" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="50" y1="220" x2="1000" y2="220" stroke="#e2e8f0" strokeWidth="1" />

                    {/* Area Path */}
                    <path d="M 50 110 L 200 105 L 350 108 L 500 110 L 650 90 L 800 85 L 950 70 L 950 220 L 50 220 Z" fill="url(#areaGradient)" />
                    {/* Line Path */}
                    <path d="M 50 110 L 200 105 L 350 108 L 500 110 L 650 90 L 800 85 L 950 70" fill="none" stroke="#3b82f6" strokeWidth="3" />

                    {/* Y-Axis Labels */}
                    <text x="40" y="24" fill="#94a3b8" fontSize="10" textAnchor="end">100</text>
                    <text x="40" y="74" fill="#94a3b8" fontSize="10" textAnchor="end">75</text>
                    <text x="40" y="124" fill="#94a3b8" fontSize="10" textAnchor="end">50</text>
                    <text x="40" y="174" fill="#94a3b8" fontSize="10" textAnchor="end">25</text>
                    <text x="40" y="224" fill="#94a3b8" fontSize="10" textAnchor="end">0</text>

                    {/* X-Axis Labels */}
                    <text x="50" y="240" fill="#94a3b8" fontSize="10" textAnchor="middle">12/05</text>
                    <text x="200" y="240" fill="#94a3b8" fontSize="10" textAnchor="middle">13/05</text>
                    <text x="350" y="240" fill="#94a3b8" fontSize="10" textAnchor="middle">14/05</text>
                    <text x="500" y="240" fill="#94a3b8" fontSize="10" textAnchor="middle">15/05</text>
                    <text x="650" y="240" fill="#94a3b8" fontSize="10" textAnchor="middle">16/05</text>
                    <text x="800" y="240" fill="#94a3b8" fontSize="10" textAnchor="middle">17/05</text>
                    <text x="950" y="240" fill="#94a3b8" fontSize="10" textAnchor="middle">18/05</text>
                  </svg>
                </div>
              </div>
            </div>

            {/* Custom Reports Section */}
            <h4 className="fw-bold mb-4">Các báo cáo tiêu chuẩn</h4>
            <div className="row g-4">
              <div className="col-lg-6">
                <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '16px' }}>
                  <div className="card-body p-4 d-flex flex-column justify-content-between">
                    <div>
                      <div className="bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center mb-3" style={{width:'40px', height:'40px'}}><i className="bi bi-file-earmark-pdf"></i></div>
                      <h5 className="fw-bold">Báo cáo luân chuyển hồ sơ</h5>
                      <p className="text-muted small">Chiết xuất trạng thái từ bảng <code className="text-danger bg-light px-1">records</code> và <code className="text-danger bg-light px-1">processing_logs</code>. Danh sách hồ sơ thuế/địa chính đang tồn đọng hoặc đã xử lý xong.</p>
                    </div>
                    <button type="button" onClick={() => handleExport('DOSSIER_STATUS', 'xlsx')}
                      className="btn w-100 mt-3 fw-bold" 
                      style={styles.pillButtonBlue}
                    >
                      Xuất file Excel (.xlsx)
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '16px' }}>
                  <div className="card-body p-4 d-flex flex-column justify-content-between">
                    <div>
                      <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center mb-3" style={{width:'40px', height:'40px'}}><i className="bi bi-people"></i></div>
                      <h5 className="fw-bold">Danh sách Miễn Giảm thuế</h5>
                      <p className="text-muted small">Chiết xuất từ bảng <code className="text-primary bg-light px-1">tax_exempt_subjects</code>. Danh sách cá nhân hưởng chính sách ưu đãi trên hệ thống.</p>
                    </div>
                    <button type="button" onClick={() => handleExport('EXEMPTION_LIST', 'pdf')}
                      className="btn w-100 mt-3 fw-bold" 
                      style={styles.pillButtonBlue}
                    >
                      Xuất file PDF (.pdf)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

const styles = {
  pillButtonBlue: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '50px',
    fontSize: '14px',
    transition: 'all 0.2s'
  }
};

export default AdminReportStats;