import {
  colors,
  pageHeader,
  pageTitle,
  pageSubtitle,
  tableContainer,
  table as tableToken,
  tableHeadRow,
  tableHeadCell,
  tableBodyRow,
  tableCell,
  searchInput as searchInputToken,
  searchIcon as searchIconToken,
  btnSecondary,
} from '../../theme/designTokens';

export const containerStyle = { padding: '24px 32px', background: colors.bgCanvas, minHeight: '100vh' };
export const detailPageStyle = { padding: '24px 32px', background: '#f8fafc', minHeight: '100vh' };
export const detailHeaderStyle = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: '20px 24px',
  marginBottom: 20,
  boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
};
export const detailActionBarStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
  marginTop: 16,
  paddingTop: 16,
  borderTop: '1px solid #e2e8f0',
};
export const detailBodyStyle = { display: 'flex', flexDirection: 'column', gap: 20 };
export const sectionCardStyle = {
  background: '#fff',
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  padding: 24,
  boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
};
export const sectionTitleStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontWeight: 800,
  fontSize: 15,
  color: '#1e293b',
  marginBottom: 20,
};
export const grid3Style = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 };
export const grayBoxStyle = {
  background: '#f8fafc',
  border: '1px solid #f1f5f9',
  borderRadius: 10,
  padding: '14px 16px',
};
export const readOnlyBoxStyle = {
  ...grayBoxStyle,
  background: '#f1f5f9',
  borderColor: '#e2e8f0',
};
export const fieldLabelStyle = {
  fontSize: 12,
  fontWeight: 800,
  color: '#94a3b8',
  letterSpacing: '0.04em',
  marginBottom: 6,
  textTransform: 'uppercase',
};
export const editInputStyle = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 6,
  border: '1px solid #cbd5e1',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
};
export const btnPrimaryRed = {
  background: '#a30d11',
  color: '#fff',
  border: 'none',
  padding: '10px 18px',
  borderRadius: 8,
  fontWeight: 700,
  fontSize: 13,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
};
export const btnWhiteOutline = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  padding: '10px 18px',
  borderRadius: 8,
  fontWeight: 700,
  fontSize: 13,
  cursor: 'pointer',
  color: '#334155',
};
export const btnBackCircleStyle = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  border: 'none',
  background: '#f1f5f9',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#334155',
  fontSize: 16,
};
export const headerStyle = { ...pageHeader, marginBottom: 24 };
export const searchWrapperStyle = { position: 'relative', width: 320 };
export const searchIconStyle = { ...searchIconToken };
export const searchInputStyle = { ...searchInputToken };
export const btnRedOutlineStyle = { ...btnSecondary, padding: '10px 16px', fontWeight: 800 };
export const tableCardStyle = { ...tableContainer };
export const tableStyle = { ...tableToken, width: '100%', borderCollapse: 'collapse' };
export const thRowStyle = { ...tableHeadRow };
export const thCellStyle = { ...tableHeadCell };
export const tdRowStyle = { ...tableBodyRow };
export const tdCellStyle = { ...tableCell, padding: '16px 24px' };
export const iconBtnStyle = {
  background: colors.bgMuted,
  border: 'none',
  width: 36,
  height: 36,
  borderRadius: 8,
  cursor: 'pointer',
  color: colors.textSecondary,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};
export const modalOverlayStyle = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 };
export const modalContentStyle = { background: '#fff', borderRadius: 12, boxShadow: '0 20px 25px rgba(0,0,0,0.1)' };
export const modalHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 24px',
  borderBottom: '1px solid #e2e8f0',
};
export const modalBodyStyle = { padding: '24px', maxHeight: '70vh', overflowY: 'auto' };
export const modalFooterStyle = {
  padding: '16px 24px',
  borderTop: '1px solid #e2e8f0',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
};
export const iconBtnNoBgStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
};
export const optionCardStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '16px',
  padding: '20px',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  marginBottom: '16px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: '#fff',
};
export const iconSquareStyle = {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};
export const btnOutlineFullStyle = {
  width: '100%',
  padding: '12px',
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontWeight: 600,
  color: '#334155',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
};
export const btnRedFullStyle = {
  width: '100%',
  padding: '12px',
  background: '#b91c1c',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 600,
  color: '#fff',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
};
export const infoAlertStyle = {
  background: '#eff6ff',
  border: '1px solid #bfdbfe',
  borderRadius: '8px',
  padding: '12px 16px',
  color: '#1e40af',
  fontSize: '14px',
  display: 'flex',
  gap: '12px',
  alignItems: 'flex-start',
  lineHeight: '1.5',
};
export const labelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 600,
  color: '#334155',
  marginBottom: '6px',
};
export const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
};
export const grid2ColStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
};
export const dashedUploadAreaStyle = {
  border: '1px dashed #cbd5e1',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center',
  cursor: 'pointer',
  backgroundColor: '#f8fafc',
};
export const btnGrayOutlineStyle = {
  padding: '10px 20px',
  background: '#fff',
  border: '1px solid #e2e8f0',
  color: '#475569',
  borderRadius: '8px',
  fontWeight: 600,
  cursor: 'pointer',
};
export const btnRedSubmitStyle = {
  padding: '10px 20px',
  background: '#b91c1c',
  border: 'none',
  color: '#fff',
  borderRadius: '8px',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
};

export { pageTitle, pageSubtitle };
