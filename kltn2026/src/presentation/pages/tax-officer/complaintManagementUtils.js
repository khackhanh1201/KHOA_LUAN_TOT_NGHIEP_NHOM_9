import { formatTaxRecordCode } from '../../../utils/taxRecordCode';

export const API_BASE = 'http://localhost:8080/api';

export const getAuth = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const formatDate = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleDateString('vi-VN') : '—';

const parseComplaintContent = (content = '') => {
  const match = content.match(/^\[(.+?)\]\s*-\s*(.*)$/s);
  if (match) {
    return { title: match[1].trim(), body: match[2].trim() };
  }
  return { title: null, body: content };
};

const getComplaintTypeLabel = (item) => {
  if (item.complaintTitle) return item.complaintTitle;
  const { title } = parseComplaintContent(item.content);
  if (title) return title;
  if (item.recordCategory === 'TAX_DECLARATION' || item.recordCategory === 'TAX') {
    return item.recordId
      ? `Khiếu nại thuế — Hồ sơ ${formatTaxRecordCode(item.recordId, item.createdAt)}`
      : 'Khiếu nại về thuế';
  }
  if (item.recordId) {
    return `Khiếu nại đất đai — Hồ sơ ${formatTaxRecordCode(item.recordId, item.createdAt)}`;
  }
  return 'Khiếu nại chung';
};

const mapStatusLabel = (status) => {
  const map = {
    PENDING: 'Chờ xử lý',
    IN_PROGRESS: 'Đang xử lý',
    PROCESSING: 'Đang xử lý',
    NEED_SUPPLEMENT: 'Chờ bổ sung',
    RESOLVED: 'Đã giải quyết',
    REJECTED: 'Từ chối',
  };
  return map[status] || status || '—';
};

const parseSupplementSections = (content = '') => {
  const parts = content.split(/\n\n(?=\[Bổ sung )/);
  const supplements = [];
  const mainParts = [];

  for (const part of parts) {
    const match = part.match(/^\[Bổ sung ([^\]]+)\]\n([\s\S]*)$/);
    if (match) {
      supplements.push({ date: match[1], text: match[2].trim() });
    } else {
      mainParts.push(part);
    }
  }

  return {
    mainRaw: mainParts.join('\n\n').trim(),
    supplements,
  };
};

const buildHistory = (item) => {
  const steps = [];
  const citizenLabel = item.citizenName || `Công dân #${item.citizenId ?? '—'}`;
  if (item.createdAt) {
    steps.push({
      action: 'Gửi khiếu nại',
      user: citizenLabel,
      time: formatDate(item.createdAt),
      active: item.status === 'PENDING',
    });
  }
  if (item.status === 'IN_PROGRESS' || item.status === 'PROCESSING') {
    steps.push({
      action: 'Tiếp nhận xử lý',
      user: 'Cán bộ thuế',
      time: formatDate(item.updatedAt),
      active: true,
    });
  }
  if (item.status === 'NEED_SUPPLEMENT' && item.responseNote) {
    steps.push({
      action: `Yêu cầu bổ sung: ${item.responseNote}`,
      user: 'Cán bộ thuế',
      time: formatDate(item.updatedAt),
      active: true,
    });
  } else if (item.responseNote && (item.status === 'IN_PROGRESS' || item.status === 'PROCESSING')) {
    const { supplements } = parseSupplementSections(item.content);
    if (supplements.length > 0) {
      steps.push({
        action: `Yêu cầu bổ sung: ${item.responseNote}`,
        user: 'Cán bộ thuế',
        time: formatDate(item.updatedAt),
        active: false,
      });
    }
  }
  if (item.responseNote && item.status !== 'NEED_SUPPLEMENT') {
    steps.push({
      action: `Phản hồi: ${item.responseNote}`,
      user: 'Cán bộ thuế',
      time: formatDate(item.updatedAt),
      active: item.status === 'RESOLVED',
    });
  }

  const { supplements } = parseSupplementSections(item.content);
  supplements.forEach((sup) => {
    steps.push({
      action: `Công dân bổ sung: ${sup.text}`,
      user: citizenLabel,
      time: sup.date,
      active: item.status === 'IN_PROGRESS' || item.status === 'PROCESSING',
    });
  });

  return steps;
};

const mapAttachments = (attachments = []) =>
  (Array.isArray(attachments) ? attachments : []).map((doc) => ({
    name: doc.fileName || doc.file_name || 'Tài liệu',
    url: doc.fileUrl || doc.file_url || '',
    fileType: doc.fileType || doc.file_type || '',
  }));

export const mapComplaintFromApi = (item) => {
  const parsed = parseComplaintContent(item.content);
  const { mainRaw, supplements } = parseSupplementSections(item.content);
  const mainParsed = parseComplaintContent(mainRaw || item.content);
  const attachments = mapAttachments(item.attachments);
  return {
    id: item.id,
    complaintCode: `KN-${String(item.id).padStart(6, '0')}`,
    citizenId: item.citizenId,
    recordId: item.recordId,
    recordCategory: item.recordCategory,
    content: item.content,
    contentTitle: item.complaintTitle || mainParsed.title || parsed.title,
    contentBody: item.complaintBody || mainParsed.body || parsed.body,
    supplementSections: supplements,
    status: item.status,
    statusLabel: mapStatusLabel(item.status),
    type: getComplaintTypeLabel(item),
    date: formatDate(item.createdAt),
    createdAt: formatDate(item.createdAt),
    createdAtRaw: item.createdAt,
    updatedAt: item.updatedAt,
    responseNote: item.responseNote,
    name: item.citizenName || `Công dân #${item.citizenId ?? '—'}`,
    cccdNumber: item.citizenCccd || '—',
    phone: item.phone || '—',
    email: item.email || '—',
    history: buildHistory(item),
    attachments,
    files: attachments,
  };
};

export const initialState = {
  view: 'list',
  activeTab: 'Tất cả',
  complaints: [],
  loading: false,
  showAdvancedSearch: false,
  selectedComplaint: null,
  attachmentPreview: null,
  searchTerm: '',
  advFilters: { code: '', name: '', cccd: '', type: 'Tất cả' },
};

export const complaintManagementReducer = (state, action) => {
  switch (action.type) {
    case 'patch':
      return { ...state, ...action.payload };
    case 'openDetail':
      return {
        ...state,
        attachmentPreview: null,
        selectedComplaint: action.complaint,
        view: 'detail',
      };
    case 'closeDetail':
      return { ...state, view: 'list' };
    case 'resetFilters':
      return {
        ...state,
        advFilters: { code: '', name: '', cccd: '', type: 'Tất cả' },
        searchTerm: '',
      };
    default:
      return state;
  }
};

export const getStatusBadge = (status) => {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
  };
  if (status === 'PENDING') return { ...base, backgroundColor: '#fef3c7', color: '#d97706' };
  if (status === 'IN_PROGRESS' || status === 'PROCESSING') {
    return { ...base, backgroundColor: '#dbeafe', color: '#2563eb' };
  }
  if (status === 'NEED_SUPPLEMENT') {
    return { ...base, backgroundColor: '#fef3c7', color: '#d97706' };
  }
  if (status === 'RESOLVED') return { ...base, backgroundColor: '#dcfce7', color: '#16a34a' };
  if (status === 'REJECTED') return { ...base, backgroundColor: '#fee2e2', color: '#dc2626' };
  return { ...base, backgroundColor: '#f1f5f9', color: '#64748b' };
};

export const searchWrapperStyle = { position: 'relative', width: 360 };
export const searchIconStyle = {
  position: 'absolute',
  left: 14,
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#94a3b8',
  pointerEvents: 'none',
};
export const searchInputStyle = {
  width: '100%',
  padding: '10px 14px 10px 40px',
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  fontSize: 14,
  outline: 'none',
  background: '#fff',
  color: '#1e293b',
};
export const tableCardStyle = {
  background: '#fff',
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  overflow: 'hidden',
  boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
};
export const tabsWrapperStyle = { padding: '16px 20px', borderBottom: '1px solid #f1f5f9' };
export const tabContainer = {
  display: 'flex',
  gap: 4,
  background: '#f1f5f9',
  padding: 4,
  borderRadius: 8,
  width: 'fit-content',
};
export const tabActive = {
  padding: '8px 16px',
  borderRadius: 6,
  border: 'none',
  background: '#a30d11',
  color: '#fff',
  fontWeight: 700,
  fontSize: 13,
  cursor: 'pointer',
  lineHeight: 1.4,
};
export const tabInactive = {
  padding: '8px 16px',
  borderRadius: 6,
  border: 'none',
  background: 'transparent',
  color: '#64748b',
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
  lineHeight: 1.4,
};
export const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 14 };
export const thRowStyle = { borderBottom: '1px solid #e2e8f0', background: '#f1f5f9' };
export const thCellStyle = {
  padding: '14px 20px',
  textAlign: 'left',
  fontSize: 12,
  fontWeight: 800,
  color: '#64748b',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
};
export const tdRowStyle = { borderBottom: '1px solid #f1f5f9' };
export const tdCellStyle = {
  padding: '14px 20px',
  fontSize: 14,
  color: '#334155',
  verticalAlign: 'middle',
  lineHeight: 1.5,
};
export const btnActionStyle = {
  background: 'none',
  border: 'none',
  color: '#64748b',
  fontSize: 18,
  cursor: 'pointer',
  padding: '6px 8px',
  borderRadius: 6,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};
export const btnBackStyle = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  border: 'none',
  background: '#f1f5f9',
  cursor: 'pointer',
  fontSize: 16,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#334155',
};
export const cardStyle = {
  backgroundColor: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: 24,
  boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
};
export const quoteBoxStyle = {
  fontStyle: 'italic',
  color: '#334155',
  backgroundColor: '#f8fafc',
  padding: 20,
  borderRadius: 8,
  borderLeft: '4px solid #a30d11',
  fontSize: 14,
  lineHeight: 1.6,
};
export const fileAttachmentStyle = {
  flex: 1,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 16px',
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
};
export const btnOrangeStyle = {
  backgroundColor: '#ea580c',
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
  lineHeight: 1.2,
};
export const btnRedRejectStyle = {
  backgroundColor: '#dc2626',
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
  lineHeight: 1.2,
};
export const btnGreenStyle = {
  backgroundColor: '#16a34a',
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
  lineHeight: 1.2,
};
export const btnSupplementStyle = {
  backgroundColor: '#d97706',
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
  lineHeight: 1.2,
};
