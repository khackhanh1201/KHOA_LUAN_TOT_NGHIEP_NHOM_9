export const thStyle = { padding: '14px 20px', fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'left', whiteSpace: 'nowrap' };
export const tdCellStyle = { padding: '14px 20px', fontSize: 14, color: '#334155', verticalAlign: 'middle', lineHeight: 1.5 };
// Cell tiền: text-align right + tabular-nums + min-width để không vỡ khi số > 1 tỷ
export const amountCellStyle = { padding: '14px 20px', fontSize: 14, color: '#334155', verticalAlign: 'middle', lineHeight: 1.5, textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', minWidth: 120 };

export const btnPrimaryRed = { background: '#a30d11', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, lineHeight: 1.2 };
export const btnConfirmRed = { background: '#a30d11', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, lineHeight: 1.2 };
export const btnWhite = { background: '#fff', border: '1px solid #e2e8f0', padding: '10px 22px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', color: '#334155', fontSize: 13, lineHeight: 1.2 };
const btnSecondary = { background: '#fff', border: '1px solid #e2e8f0', padding: '10px 22px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', color: '#334155', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8, lineHeight: 1.2 };
export const btnBack = { width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#334155' };

export const tabContainer = { display: 'flex', gap: 4, background: '#f1f5f9', padding: 4, borderRadius: 8, width: 'fit-content' };
export const tabActive = { padding: '8px 16px', borderRadius: 6, border: 'none', background: '#a30d11', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', lineHeight: 1.4 };
export const tabInactive = { padding: '8px 16px', borderRadius: 6, border: 'none', background: 'transparent', color: '#64748b', fontWeight: 600, fontSize: 13, cursor: 'pointer', lineHeight: 1.4 };

export const tableContainerStyle = { background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 2px rgba(15,23,42,0.04)' };
export const tabsWrapperStyle = { padding: '16px 20px', borderBottom: '1px solid #f1f5f9' };

const mainTable = { width: '100%', borderCollapse: 'collapse', fontSize: 14 };
export const tableHeaderRow = { borderBottom: '1px solid #e2e8f0', background: '#f1f5f9' };
export const tableRow = { borderBottom: '1px solid #f1f5f9' };

const btnDetail = { border: '1px solid #e2e8f0', background: '#fff', padding: '6px 14px', borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: 'pointer', color: '#334155' };
export const successBadge = { display: 'inline-flex', alignItems: 'center', background: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 800, letterSpacing: '0.02em', whiteSpace: 'nowrap' };
export const pendingBadge = { display: 'inline-flex', alignItems: 'center', background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 800, letterSpacing: '0.02em', whiteSpace: 'nowrap' };
export const reconcilingBadge = { display: 'inline-flex', alignItems: 'center', background: '#dbeafe', color: '#2563eb', padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 800, letterSpacing: '0.02em', whiteSpace: 'nowrap' };
export const disputedBadge = { display: 'inline-flex', alignItems: 'center', background: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 800, letterSpacing: '0.02em', whiteSpace: 'nowrap' };
export const failedBadge = { display: 'inline-flex', alignItems: 'center', background: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 800, letterSpacing: '0.02em', whiteSpace: 'nowrap' };
export const overdueBadge = pendingBadge;

export const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.45)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: 16 };
export const modalContent = { background: '#fff', width: 'min(720px, 92vw)', maxHeight: '90vh', borderRadius: 16, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(15,23,42,0.25)' };
const modalHeader = { padding: '20px 24px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 };
const idBadge = { background: '#fff1f2', color: '#a30d11', padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700 };
const modalBody = { padding: 24, overflowY: 'auto', flex: 1 };
const sectionCard = { background: '#f8fafc', borderRadius: 12, padding: 20, border: '1px solid #f1f5f9' };
const iconBox = { width: 32, height: 32, background: '#dcfce7', color: '#16a34a', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 8 };
const grid3 = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 20px' };
const modalFooter = { padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 };

// Styles riêng cho phần Modal Upload File Đối soát
export const reconUploadModalContent = { background: '#fff', width: 'min(900px, 92vw)', borderRadius: 16, padding: 32, position: 'relative', boxShadow: '0 25px 50px -12px rgba(15,23,42,0.25)' };
export const inputLabel = { display: 'block', fontSize: 12, fontWeight: 800, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' };
export const formSelect = { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontWeight: 600, color: '#1e293b', outline: 'none', fontSize: 14 };
export const formInput = { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#1e293b', outline: 'none', fontSize: 14 };
export const uploadArea = { border: '2px dashed #cbd5e1', borderRadius: 12, height: '100%', minHeight: 200, textAlign: 'center', background: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'center' };
export const iconUploadBox = { width: 48, height: 48, background: '#fff1f2', color: '#a30d11', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%', margin: '0 auto 12px', fontSize: 22 };

// Styles cho Full-screen Detail (đồng bộ với TaxProcessing)
export const fsOverlayStyle = { position: 'fixed', top: '70px', left: '280px', right: 0, bottom: 0, background: '#f8fafc', zIndex: 900, display: 'flex', flexDirection: 'column', overflowY: 'auto' };
export const fsHeaderStyle = { padding: '16px 32px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 };
export const fsBodyStyle = { padding: '24px 32px', display: 'flex', gap: 24, maxWidth: 1440, margin: '0 auto', width: '100%' };
export const sectionCardStyle = { background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 1px 2px rgba(15,23,42,0.04)' };
export const sectionTitleStyle = { fontSize: 16, fontWeight: 700, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #f1f5f9', color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 };
export const grid3Style = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 20px' };
export const grayBoxStyle = { background: '#f8fafc', padding: '12px 14px', borderRadius: 8, border: '1px solid #f1f5f9' };

// Boxes phục vụ "Thông tin tài chính" trong detail
export const formulaBoxStyle = { marginTop: 16, padding: '16px 20px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8 };
export const totalBoxStyle = { marginTop: 16, padding: '16px 20px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8 };

// Styles phần Kết quả đối soát
export const statsGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 };
export const statCard = { padding: 24, borderRadius: 12, textAlign: 'center', border: '1px solid #e2e8f0', background: '#fff' };
export const cardReconResult = { background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 2px rgba(15,23,42,0.04)' };
export const reconTable = { width: '100%', borderCollapse: 'collapse' };
export const miniTabs = { display: 'flex', gap: 4, background: '#f1f5f9', padding: 4, borderRadius: 8 };
export const miniTab = { background: 'none', border: 'none', padding: '6px 14px', fontSize: 12, fontWeight: 700, color: '#64748b', cursor: 'pointer', borderRadius: 6 };
export const miniTabActive = { ...miniTab, background: '#a30d11', color: '#fff' };

export const capsuleBadgeSuccess = { background: '#dcfce7', color: '#16a34a', padding: '6px 12px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, letterSpacing: '0.02em', whiteSpace: 'nowrap' };
export const capsuleBadgeError = { background: '#fee2e2', color: '#dc2626', padding: '6px 12px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, letterSpacing: '0.02em', whiteSpace: 'nowrap' };
const btnActionGreen = { background: '#16a34a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer', lineHeight: 1.4 };
export const btnActionRed = { background: '#a30d11', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer', lineHeight: 1.4 };
const btnPrimarySmall = { background: '#a30d11', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, fontWeight: 700, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', lineHeight: 1.2 };
export const btnExitRecon = { background: '#0f172a', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', lineHeight: 1.2 };
