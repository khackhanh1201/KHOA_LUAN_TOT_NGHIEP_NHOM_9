import React from 'react';
import QRCode from 'react-qr-code';
import { colors, radius, shadow } from '../../../theme/designTokens';

const rdStyleFlexTextAlignPadding = { flex: 1, textAlign: 'center', padding: '10px 6px', borderRadius: radius.sm, background: colors.bgSurface, border: `1px solid ${colors.border}`, fontSize: 12, color: colors.textSecondary };
const rdStyleWidthHeightBorderRadius = { width: 22, height: 22, borderRadius: '50%', background: colors.primarySoft, color: colors.primary, fontWeight: 800, fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 };

const QrLeftPanel = ({ payAmount, baseAmount, penaltyAmount, qrCodeValue }) => (
  <div style={{
    padding: '28px 24px', background: colors.bgMuted, borderRight: `1px solid ${colors.border}`,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  }}>
    <div style={{ textAlign: 'center', marginBottom: 20, width: '100%' }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.textMuted }}>
        Tổng thanh toán
      </div>
      <div style={{ fontSize: 36, fontWeight: 800, color: colors.primary, letterSpacing: '-0.03em', marginTop: 4, lineHeight: 1.1 }}>
        {Number(payAmount).toLocaleString('vi-VN')}
        <span style={{ fontSize: 20, marginLeft: 4 }}>₫</span>
      </div>
      {Number(penaltyAmount) > 0 && (
        <div style={{ marginTop: 10, fontSize: 12, color: colors.warning, background: colors.warningSoft, borderRadius: radius.sm, padding: '6px 10px', display: 'inline-block' }}>
          Gốc {Number(baseAmount ?? 0).toLocaleString('vi-VN')} ₫ + phạt {Number(penaltyAmount).toLocaleString('vi-VN')} ₫
        </div>
      )}
    </div>
    <div style={{ padding: 16, borderRadius: radius.lg, background: '#fff', border: `1px solid ${colors.border}`, boxShadow: shadow.card }}>
      <QRCode value={String(qrCodeValue || '')} size={220} />
    </div>
    <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: colors.textSecondary }}>
      <output className="spinner-border spinner-border-sm text-success" aria-live="polite" style={{ width: 14, height: 14, borderWidth: 2 }} />
      Hệ thống đang chờ xác nhận từ ngân hàng
    </div>
    <div style={{ display: 'flex', gap: 8, marginTop: 24, width: '100%' }}>
      {[{ n: '1', t: 'Mở app NH' }, { n: '2', t: 'Quét QR' }, { n: '3', t: 'Xác nhận' }].map((step) => (
        <div key={step.n} style={rdStyleFlexTextAlignPadding}>
          <div style={rdStyleWidthHeightBorderRadius}>
            {step.n}
          </div>
          <div style={{ fontWeight: 600 }}>{step.t}</div>
        </div>
      ))}
    </div>
  </div>
);

export default QrLeftPanel;
