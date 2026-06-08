const API_BASE = 'http://localhost:9090/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
};

export const vneidApi = {
  // ─── Authentication (Đăng nhập và quản lý phiên) ──────────────────────────

  // Đăng nhập truyền thống (CCCD + Password)
  login: (cccd, password) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cccd, password }),
    }).then(handleResponse),

  // Chuyển đổi vai trò làm việc
  switchRole: (role) =>
    fetch(`${API_BASE}/auth/switch-role`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    }).then(handleResponse),

  // ─── QR Login Flow ────────────────────────────────────────────────────────

  // 1. Khởi tạo mã QR đăng nhập
  generateQr: () =>
    fetch(`${API_BASE}/auth/qr-generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).then(handleResponse),

  // 2. Kiểm tra trạng thái QR (Polling từ phía Web)
  checkQrStatus: (sessionId) =>
    fetch(`${API_BASE}/auth/qr-status?sessionId=${sessionId}`, {
      headers: { 'Content-Type': 'application/json' },
    }).then(handleResponse),

  // 3. Xác nhận đăng nhập QR từ Mobile (Bằng Firebase UID)
  confirmQr: (sessionId, firebaseUid) =>
    fetch(`${API_BASE}/auth/qr-confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, firebaseUid }),
    }).then(handleResponse),

  // 4. Handshake cuối cùng: Đăng nhập QR sau khi Mobile xác nhận
  qrLogin: (qrToken) =>
    fetch(`${API_BASE}/auth/qr-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrToken }),
    }).then(handleResponse),

  // ─── Activation (Kích hoạt tài khoản VNeID) ───────────────────────────────

  // Yêu cầu kích hoạt
  requestActivation: (cccd) =>
    fetch(`${API_BASE}/vneid/activate/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cccd }),
    }).then(handleResponse),

  // Xác thực OTP
  verifyOtp: (cccd, otp) =>
    fetch(`${API_BASE}/vneid/activate/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cccd, otp }),
    }).then(handleResponse),

  // Thiết lập mật khẩu mới
  setPassword: (cccd, activationToken, newPassword) =>
    fetch(`${API_BASE}/vneid/activate/set-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cccd, activationToken, newPassword }),
    }).then(handleResponse),

  // ─── Internal Citizen (Quản lý công dân nội bộ) ───────────────────────────

  // Lấy thông tin công dân
  getCitizen: (cccd) =>
    fetch(`${API_BASE}/vneid/internal/citizens/${cccd}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Cập nhật trạng thái công dân
  updateCitizenStatus: (cccd, status) =>
    fetch(`${API_BASE}/vneid/internal/citizens/${cccd}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    }).then(handleResponse),
};