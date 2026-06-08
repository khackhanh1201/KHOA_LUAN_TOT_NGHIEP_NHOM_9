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
} from '../../theme/designTokens';

export const containerStyle = {
  padding: '24px 32px',
  backgroundColor: colors.bgCanvas,
  minHeight: '100vh',
};
export const detailHeaderCardStyle = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: '20px 24px',
  marginBottom: 24,
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
export const headerStyle = { ...pageHeader, marginBottom: 24 };

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
export const tabActive = { ...tabInactive, backgroundColor: colors.bgSurface, color: colors.textPrimary, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' };

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

export const getStatusBadge = (status) => {
  const base = { padding: '6px 12px', borderRadius: 50, fontSize: 12, fontWeight: 800 };
  if (status === 'SUBMITTED' || status === 'PENDING') {
    return { ...base, backgroundColor: colors.infoSoft, color: colors.info };
  }
  if (status === 'VERIFIED' || status === 'PROCESSING' || status === 'NEED_MORE_DOCS') {
    return { ...base, backgroundColor: colors.warningSoft, color: colors.warning };
  }
  if (status === 'APPROVED' || status === 'COMPLETED') {
    return { ...base, backgroundColor: colors.successSoft, color: colors.success };
  }
  if (status === 'FRAUD_SUSPECTED' || status === 'WARNING_FRAUD') {
    return { ...base, backgroundColor: colors.dangerSoft, color: colors.danger };
  }
  if (status === 'REJECTED' || status === 'CANCELLED') {
    return { ...base, backgroundColor: colors.dangerSoft, color: colors.danger };
  }
  return { ...base, backgroundColor: colors.bgMuted, color: colors.textSecondary };
};

export const popoverStyle = { position: 'absolute', top: '120%', right: 0, width: 400, backgroundColor: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 10px 40px rgba(0,0,0,0.15)', border: '1px solid #f1f5f9', zIndex: 100 };
export const filterGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 };
export const labelStyle = { display: 'block', fontSize: 12, fontWeight: 800, color: '#94a3b8', marginBottom: 6 };
export const inputBaseStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' };
export const btnCancelStyle = { flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#334155', fontSize: 14, fontWeight: 700, cursor: 'pointer' };
export const btnSaveRedStyle = { flex: 1, padding: '10px', borderRadius: 8, border: 'none', backgroundColor: '#b91c1c', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' };

export const btnBackStyle = { width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#fff', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', fontSize: 16 };
export const cardStyle = { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24 };
export const grid4Col = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 };
export const grid3Col = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 };

export const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
export const modalContentStyle = { borderRadius: 16, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' };
export const modalHeaderBorderedStyle = { padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' };
export const closeBtnDarkStyle = { background: 'none', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer' };

export const compareBannerStyle = {
  background: '#fff7ed',
  border: '1px solid #fdba74',
  borderRadius: 8,
  padding: '12px 16px',
  marginBottom: 16,
  fontSize: 13,
  color: '#9a3412',
  fontWeight: 600,
};

export const compareOkBannerStyle = {
  background: '#f0fdf4',
  border: '1px solid #86efac',
  borderRadius: 8,
  padding: '12px 16px',
  marginBottom: 16,
  fontSize: 13,
  color: '#166534',
  fontWeight: 600,
};
