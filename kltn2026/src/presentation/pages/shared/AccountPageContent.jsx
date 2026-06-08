import React from 'react';
import { useAppDialog } from '../../components/dialog/DialogContext';

const AccountPageContent = ({ userInfo, onLogout }) => {
  const { showAlert } = useAppDialog();

  return (
    <div className="container py-4" style={{ maxWidth: '1000px' }}>
      <div className="mb-4">
        <h3 className="fw-bold">Tài khoản</h3>
        <p className="text-muted">Quản lý thông tin cá nhân và cài đặt bảo mật</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '16px' }}>
            <div className="card-body text-center p-5">
              <div
                className="mx-auto mb-4 d-flex align-items-center justify-content-center"
                style={{
                  width: '120px',
                  height: '120px',
                  backgroundColor: '#a30d11',
                  color: 'white',
                  fontSize: '48px',
                  fontWeight: 'bold',
                  borderRadius: '50%',
                }}
              >
                {userInfo?.avatarInitial}
              </div>

              <h4 className="fw-bold mb-1">{userInfo?.fullName}</h4>
              <p className="text-muted mb-4">Số định danh: {userInfo?.citizenId}</p>

              <button
                type="button"
                className="btn btn-outline-danger w-100 py-2 mb-3"
                onClick={() =>
                  showAlert({
                    title: 'Thông báo',
                    message: 'Chức năng chỉnh sửa ảnh đại diện đang phát triển',
                    variant: 'info',
                  })
                }
              >
                Chỉnh sửa ảnh đại diện
              </button>

              <button type="button" className="btn btn-link text-danger fw-bold" onClick={onLogout}>
                Đăng xuất
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <i className="bi bi-person-circle text-danger me-2 fs-5" />
                <h5 className="fw-bold mb-0">Thông tin cá nhân</h5>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <p className="text-muted small mb-1">Họ và tên</p>
                  <p className="fw-medium">{userInfo?.fullName}</p>
                </div>
                <div className="col-md-6">
                  <p className="text-muted small mb-1">Ngày sinh</p>
                  <p className="fw-medium">{userInfo?.dob}</p>
                </div>
                <div className="col-md-6">
                  <p className="text-muted small mb-1">Số điện thoại</p>
                  <p className="fw-medium">{userInfo?.phone}</p>
                </div>
                <div className="col-md-6">
                  <p className="text-muted small mb-1">Email</p>
                  <p className="fw-medium">{userInfo?.email}</p>
                </div>
                <div className="col-12">
                  <p className="text-muted small mb-1">Địa chỉ thường trú</p>
                  <p className="fw-medium">{userInfo?.address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm border-0" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-4">
                <i className="bi bi-shield-lock text-danger me-2 fs-5" />
                <h5 className="fw-bold mb-0">Cài đặt & Bảo mật</h5>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center py-3 border-bottom">
                  <div>
                    <div className="fw-medium">Xác thực 2 lớp (2FA)</div>
                    <small className="text-muted">Tăng cường bảo mật cho tài khoản của bạn</small>
                  </div>
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" checked readOnly aria-label="Bật xác thực 2 lớp (2FA)" />
                  </div>
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between align-items-center py-3">
                  <div>
                    <div className="fw-medium">Thông báo đẩy</div>
                    <small className="text-muted">Nhận thông báo về thuế và hồ sơ</small>
                  </div>
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" checked readOnly aria-label="Bật thông báo đẩy" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-5 text-muted small">
        Cơ quan Thuế / Cơ quan Địa chính Việt Nam
        <br />
        Hotline: 1900 xxxx • Hướng dẫn sử dụng hệ thống
      </div>
    </div>
  );
};

export default AccountPageContent;
