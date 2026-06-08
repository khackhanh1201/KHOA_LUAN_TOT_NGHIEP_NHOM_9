import { colors, btnPrimary, searchInput as searchInputToken, searchIcon as searchIconToken, tableContainer, table as tableToken, tableHeadRow, tableHeadCell, tableBodyRow, tableCell } from '../../theme/designTokens';

export const getStatusBadge = (status) => {
  const base = { padding: '6px 12px', borderRadius: 50, fontSize: 12, fontWeight: 800 };
  if (status === 'PENDING') return { ...base, backgroundColor: colors.warningSoft, color: colors.warning };
  if (status === 'IN_PROGRESS') return { ...base, backgroundColor: colors.infoSoft, color: colors.info };
  if (status === 'NEED_SUPPLEMENT') return { ...base, backgroundColor: colors.primarySoft, color: colors.primary };
  if (status === 'RESOLVED') return { ...base, backgroundColor: colors.successSoft, color: colors.success };
  if (status === 'REJECTED') return { ...base, backgroundColor: colors.dangerSoft, color: colors.danger };
  return { ...base, backgroundColor: colors.bgMuted, color: colors.textSecondary };
};

export const searchWrapperStyle = { position: 'relative', width: 320 };
export const searchIconStyle = { ...searchIconToken };
export const searchInputStyle = { ...searchInputToken };
export const btnDarkRedStyle = { ...btnPrimary, padding: '10px 20px', fontSize: 14 };

export const tableCardStyle = { ...tableContainer };
export const tabsWrapper = {
  display: 'flex',
  gap: 8,
  padding: '14px 18px',
  borderBottom: `1px solid ${colors.borderLight}`,
  backgroundColor: colors.bgMuted,
};
export const tabInactive = {
  backgroundColor: 'transparent',
  color: colors.textSecondary,
  border: 'none',
  padding: '8px 20px',
  borderRadius: 50,
  fontWeight: 800,
  fontSize: 13,
  cursor: 'pointer',
};
export const tabActive = {
  ...tabInactive,
  backgroundColor: colors.bgSurface,
  color: colors.textPrimary,
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
};

export const tableStyle = { ...tableToken, width: '100%', borderCollapse: 'collapse' };
export const thRowStyle = { ...tableHeadRow };
export const thCellStyle = { ...tableHeadCell };
export const tdRowStyle = { ...tableBodyRow };
export const tdCellStyle = { ...tableCell, padding: '16px 24px' };
export const iconBtnStyle = {
  background: colors.bgMuted,
  border: 'none',
  width: 32,
  height: 32,
  borderRadius: 8,
  cursor: 'pointer',
  color: colors.textSecondary,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const btnBackStyle = { width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#fff', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', fontSize: 16 };
export const cardStyle = { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 30 };
export const quoteBoxStyle = { fontStyle: 'italic', color: '#475569', backgroundColor: '#f8fafc', padding: 24, borderRadius: 12, borderLeft: '4px solid #cbd5e1', fontSize: 14, lineHeight: 1.6 };
export const fileAttachmentStyle = { flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12 };

export const btnOrangeStyle = { backgroundColor: '#ea580c', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', gap: 8 };
export const btnRedRejectStyle = { backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', gap: 8 };
export const btnGreenStyle = { backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', gap: 8 };
export const btnSupplementStyle = { backgroundColor: '#d97706', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', gap: 8 };
