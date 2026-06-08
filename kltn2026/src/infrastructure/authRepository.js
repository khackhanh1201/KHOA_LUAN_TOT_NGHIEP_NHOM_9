// src/infrastructure/authRepository.js

const API_BASE = "http://localhost:9090/api";  // Backend chạy port 9090

export const authRepository = {
  // Đăng nhập bằng CCCD + mật khẩu
  login: async (citizenId, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cccdNumber: citizenId.trim(),
          password 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const err = new Error(errorData.message || "Số định danh hoặc mật khẩu không đúng");
        // Gắn errorCode (ACCOUNT_INACTIVE / ACCOUNT_LOCKED / AUTH_FAILED) để FE phân biệt UI.
        err.code = errorData.errorCode;
        throw err;
      }

      const json = await response.json();
      console.log('[login] response:', json);

      // ✅ Token nằm ở json.data.token theo tài liệu API
      return json;
    } catch (error) {
      // Re-throw giữ nguyên error.code đã gắn ở trên (nếu có).
      if (!error.code) {
        const wrapped = new Error(error.message || "Đăng nhập thất bại. Vui lòng thử lại.");
        wrapped.code = 'NETWORK_ERROR';
        throw wrapped;
      }
      throw error;
    }
  },

  // Bước 1: Yêu cầu gửi OTP kích hoạt
  activateRequestOtp: async ({ cccdNumber, phoneNumber, email }) => {
    try {
      const response = await fetch(`${API_BASE}/vneid/activate/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cccdNumber: cccdNumber.trim(),
          phoneNumber: phoneNumber.trim(),
          email: email.trim() 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể gửi yêu cầu OTP");
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || "Lỗi khi yêu cầu OTP. Vui lòng kiểm tra thông tin.");
    }
  },

  // Bước 2: Xác thực mã OTP
  activateVerifyOtp: async ({ cccdNumber, otpCode }) => {
    try {
      const response = await fetch(`${API_BASE}/vneid/activate/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cccdNumber: cccdNumber.trim(),
          otpCode: otpCode.trim() 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Mã OTP không hợp lệ hoặc đã hết hạn");
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || "Xác thực OTP thất bại.");
    }
  },

  // Bước 3: Đặt mật khẩu và kích hoạt tài khoản
  activateSetPassword: async ({ cccdNumber, password }) => {
    try {
      const response = await fetch(`${API_BASE}/vneid/activate/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cccdNumber: cccdNumber.trim(),
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Kích hoạt tài khoản thất bại");
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || "Lỗi khi đặt mật khẩu. Vui lòng thử lại.");
    }
  },

  // Tạo mã QR đăng nhập
  generateQr: async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/qr-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể tạo mã QR");
      }

      const json = await response.json();
      console.log('[generateQr] response:', json);
      return json;
    } catch (error) {
      throw new Error(error.message || "Lỗi khi tạo QR. Vui lòng thử lại.");
    }
  },

  // Kiểm tra trạng thái QR (polling)
  checkQrStatus: async (qrToken) => {
    try {
      const response = await fetch(`${API_BASE}/auth/qr-status?token=${encodeURIComponent(qrToken)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể kiểm tra trạng thái QR");
      }

      const json = await response.json();
      console.log('[checkQrStatus] response:', json); // ← xem status thay đổi không
      return json;
    } catch (error) {
      throw new Error(error.message || "Lỗi khi kiểm tra QR status.");
    }
  },

  // Handshake cuối cùng sau khi mobile đã xác nhận QR.
  qrLogin: async (qrToken) => {
    try {
      const response = await fetch(`${API_BASE}/auth/qr-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.message || "Đăng nhập QR thất bại");
      }
      return json;
    } catch (error) {
      throw new Error(error.message || "Lỗi khi xác nhận đăng nhập QR.");
    }
  },
};