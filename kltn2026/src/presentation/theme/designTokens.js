// Design tokens — toàn hệ thống Land Tax (công dân, cán bộ thuế, địa chính, admin)
// Quy tắc 60-30-10, 4px grid, type scale chuẩn.

export const colors = {
  // 60% nền
  bgCanvas: '#f8fafc',
  bgSurface: '#ffffff',
  bgMuted: '#f1f5f9',

  // 30% phụ
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  textPrimary: '#1e293b',
  textBody: '#334155',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',

  // 10% nhấn — chỉ DÙNG MỘT sắc đỏ duy nhất
  primary: '#a30d11',
  primaryHover: '#8a0a0e',
  primarySoft: '#fff1f2',
  primaryBorder: '#fecdd3',

  // Accent vàng (giữ cho header/avatar nghiệp vụ)
  accent: '#fbbf24',

  // Trạng thái
  success: '#16a34a',
  successSoft: '#dcfce7',
  warning: '#d97706',
  warningSoft: '#fef3c7',
  danger: '#dc2626',
  dangerSoft: '#fee2e2',
  info: '#3b82f6',
  infoSoft: '#eff6ff',
};

/** className for keyboard-only focus ring (see index.css `.rd-focus-visible`) */
export const FOCUS_VISIBLE_CLASS = 'rd-focus-visible';

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const fontSize = {
  label: 12,    // UPPERCASE LABEL (min 12px a11y)
  meta: 13,
  body: 14,
  section: 16,
  title: 24,    // page title h2
  metric: 32,   // KPI lớn
};

export const fontWeight = {
  regular: 500,
  medium: 600,
  bold: 700,
  extra: 800,
};

export const shadow = {
  card: '0 1px 2px rgba(15,23,42,0.04)',
  popover: '0 10px 30px rgba(15,23,42,0.10)',
  modal: '0 25px 50px -12px rgba(15,23,42,0.25)',
};

// Layout constants — đồng bộ với TaxOfficerLayout
const layout = {
  headerHeight: 70,
  sidebarWidth: 280,
  contentMaxWidth: 1440,
  pagePadding: '24px 32px',
};

// =============== Component-level styles dùng chung ===============

export const pageHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: space.lg,
  marginBottom: space.xxl,
  flexWrap: 'wrap',
};

export const pageTitle = {
  margin: 0,
  fontSize: fontSize.title,
  fontWeight: fontWeight.extra,
  color: colors.textPrimary,
  letterSpacing: '-0.01em',
};

export const pageSubtitle = {
  margin: '4px 0 0',
  color: colors.textSecondary,
  fontSize: fontSize.body,
};

export const card = {
  background: colors.bgSurface,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.md,
  boxShadow: shadow.card,
  overflow: 'hidden',
};

// Buttons
export const btnPrimary = {
  padding: '10px 18px',
  background: colors.primary,
  color: '#fff',
  border: 'none',
  borderRadius: radius.sm,
  fontWeight: fontWeight.bold,
  fontSize: fontSize.meta,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: space.sm,
  transition: 'background 0.15s ease',
  lineHeight: 1.2,
};

export const btnSecondary = {
  padding: '10px 18px',
  background: colors.bgSurface,
  color: colors.textBody,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.sm,
  fontWeight: fontWeight.bold,
  fontSize: fontSize.meta,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: space.sm,
  transition: 'background 0.15s ease',
  lineHeight: 1.2,
};

const btnGhost = {
  padding: '8px 12px',
  background: 'transparent',
  color: colors.textSecondary,
  border: 'none',
  borderRadius: radius.sm,
  fontSize: 18,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

// Tabs (1 kiểu duy nhất)
export const tabsBar = {
  display: 'flex',
  gap: space.xs,
  background: colors.bgMuted,
  padding: 4,
  borderRadius: radius.sm,
  width: 'fit-content',
  marginBottom: space.xxl,
};

export const tabBase = {
  padding: '8px 16px',
  borderRadius: radius.sm - 2,
  border: 'none',
  background: 'transparent',
  color: colors.textSecondary,
  fontWeight: fontWeight.medium,
  fontSize: fontSize.meta,
  cursor: 'pointer',
  lineHeight: 1.4,
  transition: 'all 0.15s ease',
};

export const tabActive = {
  ...tabBase,
  background: colors.primary,
  color: '#fff',
  fontWeight: fontWeight.bold,
};

// Search input chuẩn
export const searchInput = {
  width: '100%',
  padding: '10px 14px 10px 40px',
  border: `1px solid ${colors.border}`,
  borderRadius: radius.sm,
  fontSize: fontSize.body,
  outline: 'none',
  background: colors.bgSurface,
  color: colors.textPrimary,
  lineHeight: 1.4,
};

export const searchIcon = {
  position: 'absolute',
  left: 14,
  top: '50%',
  transform: 'translateY(-50%)',
  color: colors.textMuted,
  pointerEvents: 'none',
};

// Bảng (table chuẩn)
export const tableContainer = {
  ...card,
  width: '100%',
};

export const table = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: fontSize.body,
};

export const tableHeadRow = {
  background: colors.bgMuted,
  borderBottom: `1px solid ${colors.border}`,
};

export const tableHeadCell = {
  padding: '14px 20px',
  fontSize: fontSize.label,
  fontWeight: fontWeight.extra,
  color: colors.textSecondary,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  textAlign: 'left',
  whiteSpace: 'nowrap',
};

export const tableBodyRow = {
  borderBottom: `1px solid ${colors.borderLight}`,
};

export const tableCell = {
  padding: '14px 20px',
  fontSize: fontSize.body,
  color: colors.textBody,
  verticalAlign: 'middle',
  lineHeight: 1.5,
};

// Form
export const formLabel = {
  display: 'block',
  fontSize: fontSize.label,
  fontWeight: fontWeight.extra,
  color: colors.textSecondary,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: space.sm,
};

const formInput = {
  width: '100%',
  padding: '10px 14px',
  border: `1px solid ${colors.border}`,
  borderRadius: radius.sm,
  fontSize: fontSize.body,
  outline: 'none',
  background: colors.bgSurface,
  color: colors.textPrimary,
  fontFamily: 'inherit',
  lineHeight: 1.4,
};

// Modal
const modalOverlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15,23,42,0.45)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 5000,
  padding: space.lg,
};

const modalContent = {
  background: colors.bgSurface,
  borderRadius: radius.lg,
  width: 'min(720px, 92vw)',
  maxHeight: '90vh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: shadow.modal,
};

const modalHeader = {
  padding: '20px 24px',
  borderBottom: `1px solid ${colors.borderLight}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexShrink: 0,
};

const modalBody = {
  padding: '20px 24px',
  overflowY: 'auto',
  flex: 1,
};

const modalFooter = {
  padding: '16px 24px',
  borderTop: `1px solid ${colors.borderLight}`,
  display: 'flex',
  justifyContent: 'flex-end',
  gap: space.md,
  flexShrink: 0,
};

const modalCloseBtn = {
  background: colors.bgMuted,
  border: 'none',
  borderRadius: radius.pill,
  width: 32,
  height: 32,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: colors.textSecondary,
};

// Badge/Status helpers
export const getStatusBadge = (kind) => {
  const map = {
    success: { bg: colors.successSoft, color: colors.success },
    warning: { bg: colors.warningSoft, color: colors.warning },
    danger: { bg: colors.dangerSoft, color: colors.danger },
    info: { bg: colors.infoSoft, color: colors.info },
    neutral: { bg: colors.bgMuted, color: colors.textSecondary },
  };
  const v = map[kind] || map.neutral;
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: radius.pill,
    fontSize: fontSize.label,
    fontWeight: fontWeight.extra,
    letterSpacing: '0.02em',
    background: v.bg,
    color: v.color,
    whiteSpace: 'nowrap',
  };
};

const mapRecordStatus = (status) => {
  const m = {
    PENDING:   { label: 'Chờ tiếp nhận', kind: 'info' },
    SUBMITTED: { label: 'Chờ tiếp nhận', kind: 'info' },
    VERIFIED:  { label: 'Đang xử lý',    kind: 'warning' },
    PROCESSING:{ label: 'Đang xử lý',    kind: 'warning' },
    APPROVED:  { label: 'Đã duyệt',      kind: 'success' },
    REJECTED:  { label: 'Từ chối',       kind: 'danger' },
    CANCELLED: { label: 'Đã hủy',        kind: 'danger' },
    COMPLETED: { label: 'Hoàn thành',    kind: 'neutral' },
    FRAUD_SUSPECTED: { label: 'Nghi gian lận', kind: 'danger' },
  };
  return m[status] || { label: status || '—', kind: 'neutral' };
};

const mapPriorityBadge = (p) => {
  const m = {
    'CAO':        { kind: 'danger',  label: 'CAO' },
    'TRUNG BÌNH': { kind: 'warning', label: 'TRUNG BÌNH' },
    'THẤP':       { kind: 'info',    label: 'THẤP' },
  };
  return m[p] || { kind: 'neutral', label: p || '—' };
};

// Empty / loading helpers
export const emptyState = {
  textAlign: 'center',
  padding: '48px 24px',
  color: colors.textMuted,
  fontSize: fontSize.body,
};

export const loadingBox = {
  textAlign: 'center',
  padding: '48px 24px',
};

// Section card (cho khu vực chi tiết)
const sectionCard = {
  background: colors.bgSurface,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.md,
  padding: space.xxl,
  boxShadow: shadow.card,
  marginBottom: space.xl,
};

const sectionTitle = {
  fontSize: fontSize.section,
  fontWeight: fontWeight.bold,
  color: colors.textPrimary,
  marginBottom: space.lg,
  paddingBottom: space.md,
  borderBottom: `1px solid ${colors.borderLight}`,
  display: 'flex',
  alignItems: 'center',
  gap: space.sm,
};

const fieldLabel = {
  fontSize: fontSize.label,
  fontWeight: fontWeight.extra,
  color: colors.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: space.xs,
};

const fieldValue = {
  fontSize: fontSize.body,
  fontWeight: fontWeight.bold,
  color: colors.textPrimary,
  lineHeight: 1.5,
};

const grayBox = {
  background: colors.bgCanvas,
  border: `1px solid ${colors.borderLight}`,
  borderRadius: radius.sm,
  padding: '12px 14px',
};

const grid2 = { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 20px' };
const grid3 = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 20px' };
const grid4 = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px 20px' };

// =============== Advanced Search (Tìm kiếm nâng cao) ===============

export const advBtnTrigger = {
  padding: '10px 18px',
  background: colors.primary,
  color: '#fff',
  border: 'none',
  borderRadius: radius.sm,
  fontWeight: fontWeight.bold,
  fontSize: fontSize.meta,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: space.sm,
  lineHeight: 1.2,
};

export const advPopover = {
  position: 'absolute',
  top: 'calc(100% + 8px)',
  right: 0,
  width: 380,
  background: colors.bgSurface,
  borderRadius: radius.md,
  padding: space.xxl,
  boxShadow: shadow.popover,
  zIndex: 1000,
  border: `1px solid ${colors.border}`,
};

export const advTitle = {
  margin: '0 0 20px 0',
  fontSize: fontSize.section,
  fontWeight: fontWeight.bold,
  color: colors.textPrimary,
};

export const advFieldGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  marginBottom: space.lg,
};

export const advFieldLabel = {
  fontSize: fontSize.body,
  fontWeight: fontWeight.medium,
  color: colors.textBody,
};

export const advFieldInput = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: radius.sm,
  border: `1px solid ${colors.border}`,
  background: colors.bgSurface,
  fontSize: fontSize.body,
  outline: 'none',
  color: colors.textPrimary,
  lineHeight: 1.4,
};

export const advFooter = {
  display: 'flex',
  gap: space.md,
  marginTop: space.xl,
  justifyContent: 'flex-end',
};

export const advBtnReset = {
  padding: '10px 18px',
  border: `1px solid ${colors.border}`,
  borderRadius: radius.sm,
  background: colors.bgSurface,
  color: colors.textBody,
  fontWeight: fontWeight.bold,
  fontSize: fontSize.meta,
  cursor: 'pointer',
  lineHeight: 1.2,
};

export const advBtnClose = {
  padding: '10px 18px',
  border: 'none',
  borderRadius: radius.sm,
  background: colors.primary,
  color: '#fff',
  fontWeight: fontWeight.bold,
  fontSize: fontSize.meta,
  cursor: 'pointer',
  lineHeight: 1.2,
};

/** Tab pill — đồng bộ TaxPage, PaymentPage, PropertyDeclarationPage */
const pillTabsBar = {
  display: 'flex',
  gap: 4,
  padding: '14px 16px',
  borderBottom: `1px solid ${colors.borderLight}`,
};

export const getPillTabStyle = (active) => ({
  padding: '6px 16px',
  borderRadius: 20,
  fontSize: fontSize.meta,
  fontWeight: fontWeight.bold,
  cursor: 'pointer',
  border: active ? `2px solid ${colors.primary}` : `2px solid ${colors.border}`,
  background: active ? colors.primarySoft : colors.bgSurface,
  color: active ? colors.primary : colors.textSecondary,
  display: 'inline-flex',
  alignItems: 'center',
  gap: space.sm,
});

const getPillTabBadgeStyle = (active) => ({
  background: active ? colors.primary : colors.bgMuted,
  color: active ? '#fff' : colors.textSecondary,
  fontSize: 12,
  fontWeight: fontWeight.extra,
  padding: '1px 7px',
  borderRadius: 10,
  minWidth: 20,
  textAlign: 'center',
});
