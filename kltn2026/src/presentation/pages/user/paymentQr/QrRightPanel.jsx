import React from 'react';
import { colors, radius } from '../../../theme/designTokens';

const rdStyleWidthHeightBorderRadius = { width: 40, height: 40, borderRadius: radius.sm, background: colors.primarySoft, color: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 };
const copyButtonStyle = (copiedField, rowKey, canCopy) => ({
  height: 38,
  padding: '0 14px',
  borderRadius: radius.sm,
  border: `1px solid ${copiedField === rowKey ? colors.success : colors.border}`,
  background: copiedField === rowKey ? colors.successSoft : colors.bgMuted,
  color: copiedField === rowKey ? colors.success : colors.textSecondary,
  cursor: canCopy ? 'pointer' : 'not-allowed',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 13,
  fontWeight: 600,
  flexShrink: 0,
});
const rdStyleFlexPaddingBorderRadius = { flex: 1, padding: '12px 14px', borderRadius: radius.sm, background: colors.infoSoft, border: '1px solid #bfdbfe', fontSize: 12, color: '#1e40af', lineHeight: 1.5, display: 'flex', gap: 10, alignItems: 'flex-start' };

const QrRightPanel = ({ metaRows, copyRows, copiedField, onCopy }) => (
  <div style={{ padding: '28px 28px 24px', display: 'flex', flexDirection: 'column' }}>
    {metaRows.length > 0 && (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        {metaRows.map((m) => (
          <div key={m.label} style={{ padding: '10px 12px', borderRadius: radius.sm, background: colors.bgMuted, border: `1px solid ${colors.borderLight}` }}>
            <div style={{ fontSize: 12, color: colors.textMuted, fontWeight: 600 }}>{m.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary, marginTop: 2, wordBreak: 'break-word' }}>{m.value}</div>
          </div>
        ))}
      </div>
    )}
    <div style={{ padding: '16px 18px', borderRadius: radius.md, border: `1px solid ${colors.border}`, background: colors.bgSurface, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        <div style={rdStyleWidthHeightBorderRadius}>
          <i className="bi bi-bank2" />
        </div>
        <div>
          <div style={{ fontSize: 12, color: colors.textMuted, fontWeight: 600 }}>Ngân hàng thụ hưởng</div>
          <div style={{ fontWeight: 700, fontSize: 15, color: colors.textPrimary, marginTop: 2 }}>{copyRows.bankName || '—'}</div>
          <div style={{ fontSize: 14, color: colors.textBody, marginTop: 4 }}>{copyRows.accountName || '—'}</div>
        </div>
      </div>
      {copyRows.rows.map((row) => (
        <div key={row.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: `1px solid ${colors.borderLight}` }}>
          <i className={`bi ${row.icon}`} style={{ color: colors.textMuted, fontSize: 16, width: 20 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: colors.textMuted, fontWeight: 600 }}>{row.label}</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: colors.textPrimary, wordBreak: 'break-all', marginTop: 2 }}>{row.value}</div>
          </div>
          <button type="button" title="Sao chép" disabled={!row.copy} onClick={() => onCopy(row.key, row.copy, row.label)}
            style={copyButtonStyle(copiedField, row.key, row.copy)}>
            <i className={`bi ${copiedField === row.key ? 'bi-check2' : 'bi-copy'}`} />
            {copiedField === row.key ? 'Đã chép' : 'Sao chép'}
          </button>
        </div>
      ))}
    </div>
    <div style={rdStyleFlexPaddingBorderRadius}>
      <i className="bi bi-shield-check" style={{ fontSize: 16, marginTop: 1 }} />
      <span>Giao dịch được bảo mật qua PayOS. Vui lòng chuyển đúng <strong>số tiền</strong> và <strong>nội dung</strong> để hệ thống tự động ghi nhận thanh toán.</span>
    </div>
  </div>
);

export default QrRightPanel;
