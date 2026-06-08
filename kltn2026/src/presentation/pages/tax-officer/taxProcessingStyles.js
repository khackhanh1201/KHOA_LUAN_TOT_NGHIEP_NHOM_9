const filterInputBaseStyle = { padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 14, outline: 'none', color: '#1e293b' };
const filterPopoverStyle = { position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 480, background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 10px 30px rgba(15,23,42,0.12)', zIndex: 1000, border: '1px solid #e2e8f0' };
const filterGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' };
const btnResetFilter = { flex: 1, padding: '10px 18px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', color: '#334155', fontWeight: 700, fontSize: 13, cursor: 'pointer', lineHeight: 1.2 };
const btnApplyFilter = { flex: 1, padding: '10px 18px', border: 'none', borderRadius: 8, background: '#a30d11', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', lineHeight: 1.2 };
export const searchInputStyle = { width: '100%', padding: '10px 14px 10px 40px', border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', fontSize: 14, color: '#1e293b', background: '#fff' };
export const searchIconStyle = { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' };
const btnAdvancedSearch = { padding: '10px 18px', background: '#a30d11', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, lineHeight: 1.2 };
export const tableContainerStyle = { background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 2px rgba(15,23,42,0.04)' };
export const tabsWrapperStyle = { padding: '16px 20px', borderBottom: '1px solid #f1f5f9' };
export const tabInactiveStyle = { padding: '8px 16px', borderRadius: 6, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', color: '#64748b', background: 'transparent', lineHeight: 1.4 };
export const tabActiveStyle = { ...tabInactiveStyle, background: '#a30d11', color: '#fff', fontWeight: 700 };
export const thStyle = { padding: '14px 20px', fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'left', whiteSpace: 'nowrap' };
export const tdStyle = { padding: '14px 20px', fontSize: 14, color: '#334155', verticalAlign: 'middle', lineHeight: 1.5 };
export const tableHeaderRowStyle = { background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' };
export const tableBodyRowStyle = { borderBottom: '1px solid #f1f5f9' };

const getPriorityBadge = (p) => ({ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 800, letterSpacing: '0.02em', background: p === 'CAO' ? '#fee2e2' : p === 'TRUNG BÌNH' ? '#fef3c7' : '#eff6ff', color: p === 'CAO' ? '#dc2626' : p === 'TRUNG BÌNH' ? '#d97706' : '#3b82f6' });

export const mapStatusToText = (status) => {
  const map = {
    APPROVED: 'Đã duyệt',
    PENDING: 'Đang chờ cán bộ địa chính xử lý',
    SUBMITTED: 'Đang chờ cán bộ địa chính xử lý',
    VERIFIED: 'Chờ cán bộ thuế tiếp nhận',
    PROCESSING: 'Đang xử lý',
    REJECTED: 'Từ chối',
    CANCELLED: 'Đã hủy',
    COMPLETED: 'Hoàn thành',
  };
  return map[status] || status;
};

export const getStatusColor = (status) => {
  if (status === 'PENDING' || status === 'SUBMITTED') return '#3b82f6';
  if (status === 'VERIFIED') return '#7c3aed';
  if (status === 'PROCESSING') return '#f59e0b';
  if (status === 'APPROVED') return '#16a34a';
  if (status === 'REJECTED' || status === 'CANCELLED') return '#dc2626';
  if (status === 'COMPLETED') return '#475569';
  return '#1e293b';
};

export const getStatusBadge = (status) => {
  const base = { display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 800, letterSpacing: '0.02em', whiteSpace: 'nowrap' };
  const text = mapStatusToText(status);
  if (status === 'PENDING' || status === 'SUBMITTED' || text === 'Đang chờ cán bộ địa chính xử lý') return { ...base, background: '#eff6ff', color: '#3b82f6' };
  if (status === 'VERIFIED' || text === 'Chờ cán bộ thuế tiếp nhận') return { ...base, background: '#ede9fe', color: '#7c3aed' };
  if (status === 'PROCESSING' || text === 'Đang xử lý') return { ...base, background: '#fef3c7', color: '#d97706' };
  if (status === 'APPROVED' || text === 'Đã duyệt') return { ...base, background: '#dcfce7', color: '#16a34a' };
  if (status === 'REJECTED' || status === 'CANCELLED' || text === 'Từ chối' || text === 'Đã hủy') return { ...base, background: '#fee2e2', color: '#dc2626' };
  if (status === 'COMPLETED' || text === 'Hoàn thành') return { ...base, background: '#f1f5f9', color: '#64748b' };
  return base;
};

export const fsOverlayStyle = { position: 'fixed', top: '70px', left: '280px', right: 0, bottom: 0, background: '#f8fafc', zIndex: 900, display: 'flex', flexDirection: 'column', overflowY: 'auto' };
export const fsHeaderStyle = { padding: '16px 32px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 };
export const fsBodyStyle = { padding: '24px 32px', display: 'flex', gap: 24, maxWidth: 1440, margin: '0 auto', width: '100%' };

const btnOutlineHeader = { padding: '8px 20px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 6, fontWeight: 600, color: '#334155', cursor: 'pointer' };
const btnDangerHeader = { padding: '8px 20px', background: '#c8102e', border: 'none', borderRadius: 6, fontWeight: 600, color: '#fff', cursor: 'pointer' };
const btnWarningOutlineHeader = { padding: '8px 20px', background: '#fff', border: '1px solid #f59e0b', borderRadius: 6, fontWeight: 600, color: '#d97706', cursor: 'pointer' };
const btnSuccessHeader = { padding: '8px 20px', background: '#10b981', border: 'none', borderRadius: 6, fontWeight: 600, color: '#fff', cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center' };
const btnDangerOutlineHeader = { padding: '8px 20px', background: '#fff', border: 'none', fontWeight: 600, color: '#ef4444', cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center' };

export const sectionCardStyle = { background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' };
export const sectionTitleStyle = { fontSize: 16, fontWeight: 700, marginBottom: 20, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 };
export const grid4Style = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px 24px' };
export const grid3Style = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 };
export const grayBoxStyle = { background: '#f8fafc', padding: '12px 16px', borderRadius: 8, border: '1px solid #f1f5f9' };
export const labelStyle = { fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase' };

const btnSideActionRed = { width: '100%', padding: '12px', background: '#a30d11', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, textAlign: 'center', cursor: 'pointer' };
const btnSideActionOrange = { width: '100%', padding: '12px', background: '#ea580c', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, textAlign: 'center', cursor: 'pointer' };

export const modalOverlayCenterStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 6000 };
export const modalActionContentStyle = { background: '#fff', borderRadius: 24, width: 500, overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' };
export const modalActionHeaderStyle = { padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
export const closeBtnNoBg = { background: 'none', border: 'none', fontSize: 28, color: '#94a3b8', cursor: 'pointer' };
export const labelActionStyle = { display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 8 };
export const selectActionStyle = { width: '100%', padding: '12px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none', fontSize: 14 };
export const textareaActionStyle = { width: '100%', padding: '12px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none', fontSize: 14, resize: 'none', background: '#f8fafc' };
export const modalActionFooterStyle = { padding: '20px 24px', display: 'flex', gap: 12, justifyContent: 'space-between' };
export const btnCancelWhite = { flex: 1, padding: '12px', background: '#fff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: 12, fontWeight: 700, cursor: 'pointer' };
export const btnConfirmOrange = { flex: 1, padding: '12px', background: '#ea580c', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer' };
export const btnCancelWhiteFlex = { flex: 1, padding: '14px', background: '#fff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: 12, fontWeight: 700, cursor: 'pointer' };
export const btnConfirmGreenFlex = { flex: 1, padding: '14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer' };
export const closeButtonStyle = {
  background: '#f1f5f9',
  border: 'none',
  borderRadius: '50%',
  width: 36,
  height: 36,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const btnLarge = {
  width: '100%',
  padding: '16px',
  border: 'none',
  borderRadius: 50,
  fontWeight: 700,
  fontSize: 15,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  transition: 'transform 0.1s',
};

export const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 5000,
  backdropFilter: 'blur(4px)',
};

export const modalContentStyle = {
  background: '#fff',
  borderRadius: 24,
  width: '90%',
  overflow: 'hidden',
  position: 'relative',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

export const modalFooterStyle = {
  padding: '20px 30px',
  borderTop: '1px solid #f1f5f9',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 12,
  background: '#fff',
};

export const btnPrimary = { padding: '12px 24px', borderRadius: 10, border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 };
export const btnSecondary = { padding: '12px 24px', borderRadius: 10, border: 'none', background: '#e2e8f0', color: '#475569', fontWeight: 600, cursor: 'pointer' };
export const btnCancelStyle = { padding: '10px 18px', borderRadius: 8, border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#334155', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', gap: 8, alignItems: 'center', lineHeight: 1.2 };
export const btnSaveRedStyle = { padding: '10px 18px', borderRadius: 8, border: 'none', backgroundColor: '#a30d11', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', gap: 8, alignItems: 'center', lineHeight: 1.2 };

export { FormatCard, SectionTitle } from './TaxProcessingUiParts.jsx';
