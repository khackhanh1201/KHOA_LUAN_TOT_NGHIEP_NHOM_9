import React from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { loginStyles } from './loginParts';

const LoginFormPanel = ({
  citizenId,
  password,
  showPassword,
  loginLoading,
  loginError,
  accountStatusBlock,
  onCitizenIdChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  onGoActivate,
  onActivateFromBlock,
}) => (
  <div className="col-md-6 border-end text-dark">
    <h5 className="fw-bold mb-4">Đăng nhập VNeID</h5>

    {accountStatusBlock ? (
      <Alert variant="warning" className="d-flex align-items-start mb-3">
        <i className={`bi ${accountStatusBlock.code === 'ACCOUNT_LOCKED' ? 'bi-lock-fill' : 'bi-exclamation-triangle-fill'} fs-4 me-3 mt-1`} />
        <div className="flex-grow-1">
          <div className="fw-bold mb-1">
            {accountStatusBlock.code === 'ACCOUNT_LOCKED' ? 'Tài khoản đã bị khoá' : 'Tài khoản chưa được kích hoạt'}
          </div>
          <div className="small mb-2">{accountStatusBlock.message}</div>
          {accountStatusBlock.code === 'ACCOUNT_INACTIVE' && (
            <button type="button" className="btn btn-sm btn-warning fw-bold" onClick={onActivateFromBlock}>
              <i className="bi bi-shield-check me-2" /> Kích hoạt ngay
            </button>
          )}
        </div>
      </Alert>
    ) : (
      loginError && <Alert variant="danger">{loginError}</Alert>
    )}

    <form onSubmit={onSubmit}>
      <div className="input-group mb-3">
        <span className="input-group-text bg-white border-end-0"><i className="bi bi-person" /></span>
        <input type="text" className="form-control border-start-0" placeholder="Số định danh cá nhân (CCCD)"
          value={citizenId} onChange={(e) => onCitizenIdChange(e.target.value)}
          aria-label="Số định danh cá nhân (CCCD)" required />
      </div>
      <div className="input-group mb-4">
        <span className="input-group-text bg-white border-end-0"><i className="bi bi-lock" /></span>
        <input type={showPassword ? 'text' : 'password'} className="form-control border-start-0 border-end-0"
          placeholder="Mật khẩu" value={password} onChange={(e) => onPasswordChange(e.target.value)}
          aria-label="Mật khẩu" required />
        <button
          type="button"
          className="input-group-text bg-white border-start-0"
          onClick={onTogglePassword}
          aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        >
          <i className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'}`} />
        </button>
      </div>
      <button className="btn btn-danger w-100 fw-bold py-2" type="submit" style={loginStyles.btnRed} disabled={loginLoading}>
        {loginLoading ? <><Spinner animation="border" size="sm" /> Đang xử lý...</> : 'Đăng nhập'}
      </button>
    </form>

    <p className="text-center mt-4 small">
      Chưa có tài khoản hoạt động?{' '}
      <button type="button" className="btn btn-link text-danger fw-bold p-0 border-0" onClick={onGoActivate}>Kích hoạt ngay</button>
    </p>
  </div>
);

export default LoginFormPanel;
