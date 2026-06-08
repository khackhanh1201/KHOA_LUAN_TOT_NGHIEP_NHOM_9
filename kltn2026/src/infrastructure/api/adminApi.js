const API_BASE = 'http://localhost:8080'; 

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const handleResponse = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
};

const toArray = (json) => (Array.isArray(json) ? json : json?.data ?? []);

export const adminApi = {
  // ─── ADMIN CONTROLLER (Quản lý User, Quyền, Hệ thống) ───────────────────────────
  getUsers: (search) => {
    const query =
      search && String(search).trim()
        ? `?search=${encodeURIComponent(String(search).trim())}`
        : '';
    return fetch(`${API_BASE}/api/admin/users${query}`, { headers: getAuthHeaders() })
      .then(handleResponse)
      .then(toArray);
  },

  createUser: (data) =>
    fetch(`${API_BASE}/api/admin/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Cập nhật trạng thái (Khóa/Mở khóa) cần truyền tham số isActive (true/false)
  updateUserStatus: (cccd, isActive) =>
    fetch(`${API_BASE}/api/admin/users/${cccd}/status?active=${isActive}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Cập nhật Role truyền thẳng qua URL Params
  updateUserRole: (cccd, roleData) =>
    fetch(`${API_BASE}/api/admin/users/${cccd}/role?role=${roleData}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getRoles: () =>
    fetch(`${API_BASE}/api/admin/roles`, { headers: getAuthHeaders() })
      .then(handleResponse)
      .then(toArray),

  updateRole: (id, data) =>
    fetch(`${API_BASE}/api/admin/roles/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  getDashboardStatistics: () =>
    fetch(`${API_BASE}/api/admin/statistics/dashboard`, { headers: getAuthHeaders() })
      .then(handleResponse),

      getAuditLogs: () =>
        fetch(`${API_BASE}/api/admin/logs`, { headers: getAuthHeaders() })
          .then(handleResponse)
          .then(toArray),

  // ─── COMPLAINT CONTROLLER (Quản lý Khiếu Nại) ─────────────────────────────
  getAllComplaints: () =>
    fetch(`${API_BASE}/api/complaints`, { headers: getAuthHeaders() })
      .then(handleResponse)
      .then(toArray),

  respondComplaint: (id, responseData) =>
    fetch(`${API_BASE}/api/complaints/${id}/respond`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(responseData),
    }).then(handleResponse),

  // ─── TAX CONTROLLER (Quản lý Thuế) ─────────────────────────────────────────
  getVerifiedRecords: () =>
    fetch(`${API_BASE}/api/tax/records/verified`, { headers: getAuthHeaders() })
      .then(handleResponse)
      .then(toArray),

  // Duyệt tờ khai (có thể gửi kèm ghi chú nếu cần)
  approveTaxRecord: (id, data = {}) =>
    fetch(`${API_BASE}/api/tax/records/${id}/approve`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Từ chối tờ khai bắt buộc phải truyền Body chứa processorNotes
  rejectTaxRecord: (id, data) =>
    fetch(`${API_BASE}/api/tax/records/${id}/verify`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Trả về file (Blob) thay vì JSON để tránh crash ứng dụng
  exportTaxData: () =>
    fetch(`${API_BASE}/api/tax/export/data`, { headers: getAuthHeaders() })
      .then(res => {
        if (!res.ok) throw new Error('Lỗi xuất dữ liệu thuế');
        return res.blob();
      }),

  // ─── RECORD CONTROLLER (Hồ sơ phân hệ thửa đất) ────────────────────────────
  getAllRecords: () =>
    fetch(`${API_BASE}/api/records`, { headers: getAuthHeaders() })
      .then(handleResponse)
      .then(toArray),

  getSubmittedRecords: () =>
    fetch(`${API_BASE}/api/records/submitted`, { headers: getAuthHeaders() })
      .then(handleResponse)
      .then(toArray),

  verifyRecord: (id) =>
    fetch(`${API_BASE}/api/records/${id}/verify`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // ─── PAYMENT & RECONCILIATION (Đối soát thanh toán & Báo cáo) ──────────────
  getReconciliationDiscrepancies: () =>
    fetch(`${API_BASE}/api/payments/reconcile/discrepancies`, { headers: getAuthHeaders() })
      .then(handleResponse)
      .then(toArray),
  runReconciliation: () =>
    fetch(`${API_BASE}/api/payments/reconcile/run`, {
      method: 'POST',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  adjustBill: (id, data) =>
    fetch(`${API_BASE}/api/payments/bills/${id}/adjust`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Trả về file (Blob) Excel
  exportAdminReports: () =>
    fetch(`${API_BASE}/api/admin/reports/export`, { headers: getAuthHeaders() })
      .then(res => {
        if (!res.ok) throw new Error('Lỗi xuất báo cáo Admin');
        return res.blob(); 
      }),

  // ─── MASTER DATA CONTROLLER ────────────────────────────────────────────────
  getLandTypes: () =>
    fetch(`${API_BASE}/api/master-data/land-types`, { headers: getAuthHeaders() })
      .then(handleResponse)
      .then(toArray),

  createLandType: (data) =>
    fetch(`${API_BASE}/api/master-data/land-types`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),
};