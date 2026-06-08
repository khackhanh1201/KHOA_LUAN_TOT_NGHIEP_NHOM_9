import React from 'react';

const rdStyleMarginTopWidthPadding = { marginTop: 40, width: '100%', padding: '16px', background: '#a30d11', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700 };

const Step1Verification = ({ user, cccdNumber, onContinue }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
    <h5 style={{ fontWeight: 700 }}>Xác thực danh tính</h5>
    <p style={{ color: '#64748b', marginBottom: 32 }}>Hệ thống sẽ sử dụng thông tin định danh mức 2 của bạn</p>

    <div style={{ background: '#f8fafc', borderRadius: 12, padding: 24, textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
        <span>Họ và tên</span>
        <strong>{user?.fullName || 'Nguyễn Công Việt'}</strong>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
        <span>Số định danh (CCCD)</span>
        <strong>{cccdNumber}</strong>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
        <span>Mức độ định danh</span>
        <span style={{ color: '#16a34a', fontWeight: 600 }}>✓ Mức 2 (Đã xác thực)</span>
      </div>
    </div>

    <button type="button" onClick={onContinue}
      style={rdStyleMarginTopWidthPadding}
    >
      Tiếp tục
    </button>
  </div>
);

export default Step1Verification;
