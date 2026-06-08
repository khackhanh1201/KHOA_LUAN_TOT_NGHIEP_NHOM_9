import React from 'react';
import { Alert } from 'react-bootstrap';
import { loginStyles } from './loginParts';

const ActivationForm = ({
  activationStep,
  cccdNumber,
  phoneNumber,
  email,
  otpCode,
  newPassword,
  maskedEmail,
  activationLoading,
  activationMessage,
  activationError,
  onBack,
  onFieldChange,
  onRequestOtp,
  onVerifyOtp,
  onSetPassword,
  onGoStep1,
}) => (
  <div className="text-dark">
    <div className="d-flex align-items-center mb-4">
      <button type="submit" className="btn btn-light rounded-circle me-3" onClick={onBack}
        style={{ width: '40px', height: '40px' }} aria-label="Quay lại đăng nhập">
        <i className="bi bi-arrow-left" />
      </button>
      <h4 className="fw-bold mb-0 flex-grow-1 text-center pe-5">Kích hoạt tài khoản VNeID - Bước {activationStep}/3</h4>
    </div>

    {activationError && <Alert variant="danger">{activationError}</Alert>}
    {activationMessage && <Alert variant="success">{activationMessage}</Alert>}

    {activationStep === 1 && (
      <form onSubmit={onRequestOtp} className="px-md-4">
        <div className="input-group mb-3">
          <span className="input-group-text"><i className="bi bi-person" /></span>
          <input type="text" className="form-control" placeholder="Số CCCD (12 chữ số)" value={cccdNumber}
            onChange={(e) => onFieldChange({ cccdNumber: e.target.value })} aria-label="Số CCCD" required maxLength={12} />
        </div>
        <div className="input-group mb-3">
          <span className="input-group-text"><i className="bi bi-telephone" /></span>
          <input type="tel" className="form-control" placeholder="Số điện thoại đã đăng ký" value={phoneNumber}
            onChange={(e) => onFieldChange({ phoneNumber: e.target.value })} aria-label="Số điện thoại" required />
        </div>
        <div className="input-group mb-4">
          <span className="input-group-text"><i className="bi bi-envelope" /></span>
          <input type="email" className="form-control" placeholder="Email nhận mã OTP" value={email}
            onChange={(e) => onFieldChange({ email: e.target.value })} aria-label="Email nhận mã OTP" required />
        </div>
        <button type="submit" className="btn btn-danger w-100 fw-bold py-2" disabled={activationLoading} style={loginStyles.btnRed}>
          {activationLoading ? 'Đang gửi...' : 'Gửi mã OTP'}
        </button>
        <p className="text-center mt-3 small text-muted">Hệ thống sẽ gửi mã OTP đến email bạn cung cấp</p>
      </form>
    )}

    {activationStep === 2 && (
      <form onSubmit={onVerifyOtp} className="px-md-4">
        <p className="text-center mb-4">Mã OTP đã được gửi đến <strong>{maskedEmail}</strong></p>
        <div className="input-group mb-4">
          <span className="input-group-text"><i className="bi bi-shield-lock" /></span>
          <input type="text" className="form-control text-center fs-4 fw-bold" placeholder="Nhập mã OTP 6 số"
            value={otpCode} onChange={(e) => onFieldChange({ otpCode: e.target.value.replace(/\D/g, '') })}
            aria-label="Mã OTP" maxLength={6} required />
        </div>
        <button type="submit" className="btn btn-danger w-100 fw-bold py-2" disabled={activationLoading} style={loginStyles.btnRed}>
          {activationLoading ? 'Đang xác thực...' : 'Xác nhận OTP'}
        </button>
        <p className="text-center mt-3 small">
          <button type="button" className="btn btn-link text-danger p-0 border-0" onClick={onGoStep1}>Gửi lại OTP</button>
        </p>
      </form>
    )}

    {activationStep === 3 && (
      <form onSubmit={onSetPassword} className="px-md-4">
        <p className="text-center mb-4">Thiết lập mật khẩu cho tài khoản <strong>{cccdNumber}</strong></p>
        <div className="mb-3">
          <label htmlFor="activation-password" className="form-label">Mật khẩu đăng nhập</label>
          <input id="activation-password" type="password" className="form-control" placeholder="Tối thiểu 8 ký tự" value={newPassword}
            onChange={(e) => onFieldChange({ newPassword: e.target.value })} required minLength={8} />
        </div>
        <button type="submit" className="btn btn-danger w-100 fw-bold py-2" disabled={activationLoading} style={loginStyles.btnRed}>
          {activationLoading ? 'Đang kích hoạt...' : 'Hoàn tất kích hoạt'}
        </button>
      </form>
    )}
  </div>
);

export default ActivationForm;
