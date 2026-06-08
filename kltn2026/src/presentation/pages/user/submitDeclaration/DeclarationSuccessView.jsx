import React from 'react';

const rdStyleWidthHeightBackground = { width: 90, height: 90, background: '#dcfce7', borderRadius: '50%', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' };

const DeclarationSuccessView = ({ declarationCode, onNavigate }) => (
  <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ textAlign: 'center', maxWidth: 460 }}>
      <div style={rdStyleWidthHeightBackground}>
        <i className="bi bi-check-circle-fill" style={{ fontSize: 55, color: '#16a34a' }} />
      </div>
      <h3 style={{ fontWeight: 800 }}>Nộp hồ sơ thành công!</h3>
      <p style={{ color: '#64748b', margin: '12px 0 32px' }}>
        Mã hồ sơ: <strong className="text-dark fs-5">{declarationCode}</strong>
      </p>
      <button type="button" onClick={onNavigate}
        style={{ padding: '14px 32px', background: '#a30d11', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700 }}
      >
        Theo dõi hồ sơ
      </button>
    </div>
  </div>
);

export default DeclarationSuccessView;
