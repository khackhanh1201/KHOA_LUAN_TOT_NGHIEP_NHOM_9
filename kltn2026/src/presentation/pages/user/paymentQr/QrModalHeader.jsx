import React from 'react';
import { colors, radius } from '../../../theme/designTokens';

const rdStyleWidthHeightBorderRadius2 = {
        width: 44, height: 44, borderRadius: radius.md, background: colors.primary, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        boxShadow: '0 4px 12px rgba(163,13,17,0.25)',
      };
const rdStyleWidthHeightBorderRadius = { width: 40, height: 40, borderRadius: radius.pill, border: `1px solid ${colors.border}`, background: colors.bgSurface, color: colors.textSecondary, fontSize: 22, lineHeight: 1, cursor: 'pointer' };

const QrModalHeader = ({ onClose }) => (
  <div
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 24px', borderBottom: `1px solid ${colors.border}`,
      background: `linear-gradient(90deg, ${colors.primarySoft} 0%, ${colors.bgSurface} 55%)`,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={rdStyleWidthHeightBorderRadius2}>
        <i className="bi bi-qr-code-scan" />
      </div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 20, color: colors.textPrimary, letterSpacing: '-0.02em' }}>
          Quét mã QR để thanh toán
        </div>
        <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
          Mở app ngân hàng trên điện thoại → Quét mã → Xác nhận giao dịch
        </div>
      </div>
    </div>
    <button type="button" aria-label="Đóng" onClick={onClose}
      style={rdStyleWidthHeightBorderRadius}>
      ×
    </button>
  </div>
);

export default QrModalHeader;
