import React from 'react';
import { colors, radius } from '../../../theme/designTokens';

const QrModalFooter = ({ onClose, onConfirmTransfer }) => (
  <div style={{ padding: '16px 24px 20px', borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'flex-end', gap: 12, background: colors.bgMuted }}>
    <button type="button" className="btn fw-semibold"
      style={{ minWidth: 120, borderRadius: radius.md, border: `1px solid ${colors.border}`, background: colors.bgSurface, color: colors.textBody, padding: '11px 20px' }}
      onClick={onClose}>
      Đóng
    </button>
    <button type="button" className="btn fw-semibold text-white"
      style={{ minWidth: 200, borderRadius: radius.md, background: colors.primary, border: 'none', padding: '11px 24px', boxShadow: '0 4px 14px rgba(163,13,17,0.3)' }}
      onClick={onConfirmTransfer}>
      <i className="bi bi-check2-circle me-2" /> Tôi đã chuyển khoản
    </button>
  </div>
);

export default QrModalFooter;
