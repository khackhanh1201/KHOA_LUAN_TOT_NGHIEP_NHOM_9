import {
  colors,
  pageHeader,
  tableContainer,
  table as tableToken,
  tableHeadRow,
  tableHeadCell,
  tableBodyRow,
  tableCell,
  searchInput as searchInputToken,
  searchIcon as searchIconToken,
  btnPrimary,
  btnSecondary,
  card as cardToken,
  formLabel,
} from '../../theme/designTokens';

export const containerStyle = {
  padding: '24px 32px',
  backgroundColor: colors.bgCanvas,
  minHeight: '100vh',
};
export const headerStyle = { ...pageHeader, marginBottom: 24 };

export const btnSecondaryStyle = { ...btnSecondary, paddingInline: 18 };
export const btnPrimaryStyle = { ...btnPrimary, paddingInline: 18 };
export const btnBackStyle = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  border: 'none',
  background: colors.bgSurface,
  cursor: 'pointer',
  boxShadow: '0 2px 5px rgba(15,23,42,0.08)',
  fontSize: 16,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};
export const btnCancelStyle = {
  padding: '10px 24px',
  borderRadius: 8,
  border: `1px solid ${colors.border}`,
  backgroundColor: colors.bgSurface,
  color: colors.textBody,
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
};

export const filterBarStyle = {
  ...cardToken,
  padding: 16,
  display: 'flex',
  gap: 16,
  alignItems: 'center',
  marginBottom: 24,
};
export const searchWrapperStyle = { position: 'relative', flex: 1 };
export const searchIconStyle = { ...searchIconToken };
export const searchInputStyle = { ...searchInputToken };

export const tableCardStyle = { ...tableContainer };
export const tableStyle = { ...tableToken };
export const thRowStyle = { ...tableHeadRow };
export const thCellStyle = { ...tableHeadCell };
export const tdRowStyle = { ...tableBodyRow };
export const tdCellStyle = { ...tableCell };
export const positionBadgeStyle = {
  backgroundColor: colors.primarySoft,
  color: colors.danger,
  padding: '4px 10px',
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
};
export const statusBadgeStyle = {
  backgroundColor: colors.successSoft,
  color: colors.success,
  padding: '4px 12px',
  borderRadius: 50,
  fontSize: 12,
  fontWeight: 700,
};
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

export const btnPrimarySubmitStyle = { ...btnPrimary, padding: '10px 32px' };
export const cardStyle = { ...cardToken, padding: 30 };

export const labelStyle = { ...formLabel, marginBottom: 8 };
export const inputBaseStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 8,
  border: `1px solid ${colors.border}`,
  fontSize: 13,
  outline: 'none',
  color: colors.textPrimary,
  backgroundColor: colors.bgSurface,
};
export const inputDisabledStyle = { ...inputBaseStyle, backgroundColor: colors.bgMuted, color: colors.textSecondary };
export const uploadDashBoxStyle = {
  border: `1px dashed ${colors.border}`,
  borderRadius: 12,
  backgroundColor: colors.bgMuted,
  padding: '30px 20px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'pointer',
};
