import React from 'react';
import { Alert, Spinner } from 'react-bootstrap';

const QrLoginPanel = ({ qrPhase, qrBase64, qrError, onGenerateQr }) => (
  <div className="col-md-6 d-flex flex-column align-items-center justify-content-center">
    {qrPhase === 'generating' && (
      <>
        <Spinner animation="border" variant="danger" className="mb-3" />
        <p className="small text-muted">Đang tạo mã QR...</p>
      </>
    )}
    {qrPhase === 'error' && (
      <Alert variant="danger" className="text-center w-100 mb-3">{qrError}</Alert>
    )}
    {qrPhase === 'confirmed' && (
      <Alert variant="success" className="text-center w-100 mb-3">
        <i className="bi bi-check-circle-fill me-2" /> Quét thành công! Đang chuyển về trang chủ...
      </Alert>
    )}
    {qrPhase === 'expired' && (
      <Alert variant="warning" className="text-center w-100 mb-3">Mã QR hết hạn. Đang tạo mới...</Alert>
    )}
    {(qrPhase === 'polling' || qrPhase === 'expired') && qrBase64 && (
      <>
        <img src={qrBase64} alt="QR Code Đăng nhập VNeID" className="img-fluid border p-3 rounded mb-3"
          style={{ maxWidth: '220px', background: '#fff', opacity: qrPhase === 'expired' ? 0.25 : 1, transition: 'opacity 0.3s' }} />
        <p className="small text-muted text-center px-4 mb-1">
          Quét mã QR bằng ứng dụng <strong className="text-danger">VNeID</strong> trên điện thoại
        </p>
        {qrPhase === 'polling' && (
          <div className="small text-secondary mb-2 d-flex align-items-center gap-1">
            <Spinner animation="grow" size="sm" /> Đang chờ quét mã...
          </div>
        )}
      </>
    )}
    <button type="button" className="btn btn-outline-danger btn-sm mt-2" onClick={onGenerateQr}
      disabled={qrPhase === 'generating' || qrPhase === 'confirmed'}>
      <i className="bi bi-arrow-clockwise me-1" /> Tạo mã QR mới
    </button>
  </div>
);

export default QrLoginPanel;
