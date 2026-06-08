const API_BASE = 'http://localhost:8080/api';

export const getAuth = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const formatDate = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleDateString('vi-VN') : '—';

const extractLandParcelIdFromContent = (content = '') => {
  const match = content.match(/Mã thửa TĐ-(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
};

const extractGcnFromContent = (content = '') => {
  const match = content.match(/GCN:\s*(\S+)/i);
  return match ? match[1] : null;
};

/** Hiển thị mã hồ sơ liên quan cho cán bộ địa chính — ưu tiên số vào sổ GCN (tương tự T-YYYY-xxx bên thuế). */
export const formatCadastralRelatedRecord = (item) => {
  const gcn = item.gcnBookNumber || item.gcn_book_number || extractGcnFromContent(item.content);
  if (gcn) return gcn;

  if (item.recordId != null && item.recordId !== '') {
    return `HS-${String(item.recordId).padStart(6, '0')}`;
  }

  const parcelId = item.landParcelId ?? item.land_parcel_id ?? extractLandParcelIdFromContent(item.content);
  if (parcelId) return `Thửa TĐ-${parcelId}`;

  return '—';
};

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
      ? `Khiếu nại thuế — Hồ sơ #${item.recordId}`
      : 'Khiếu nại về thuế';
  }

  if (item.recordId) {
    return `Khiếu nại đất đai — Hồ sơ #${item.recordId}`;
  }

  return 'Khiếu nại chung';
};

const mapStatusLabel = (status) => {
  const map = {
    PENDING: 'Chờ xử lý',
    IN_PROGRESS: 'Đang xử lý',
    NEED_SUPPLEMENT: 'Chờ bổ sung',
    RESOLVED: 'Đã giải quyết',
    REJECTED: 'Từ chối',
  };
  return map[status] || status || '—';
};

export const parseSupplementSections = (content = '') => {
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

const mapAttachments = (attachments = []) =>
  (Array.isArray(attachments) ? attachments : []).map((doc) => ({
    id: doc.documentId || doc.document_id,
    name: doc.fileName || doc.file_name || 'Tài liệu',
    url: doc.fileUrl || doc.file_url || '',
    fileType: doc.fileType || doc.file_type || '',
  }));

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

  if (item.status === 'IN_PROGRESS') {
    steps.push({
      action: 'Tiếp nhận xử lý',
      user: 'Cán bộ địa chính',
      time: formatDate(item.updatedAt),
      active: true,
    });
  }

  if (item.status === 'NEED_SUPPLEMENT' && item.responseNote) {
    steps.push({
      action: `Yêu cầu bổ sung: ${item.responseNote}`,
      user: 'Cán bộ địa chính',
      time: formatDate(item.updatedAt),
      active: true,
    });
  } else if (item.responseNote && (item.status === 'IN_PROGRESS' || item.status === 'PROCESSING')) {
    const { supplements } = parseSupplementSections(item.content);
    if (supplements.length > 0) {
      steps.push({
        action: `Yêu cầu bổ sung: ${item.responseNote}`,
        user: 'Cán bộ địa chính',
        time: formatDate(item.updatedAt),
        active: false,
      });
    }
  }

  if (item.responseNote && item.status !== 'NEED_SUPPLEMENT') {
    steps.push({
      action: `Phản hồi: ${item.responseNote}`,
      user: 'Cán bộ xử lý',
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
    landParcelId: item.landParcelId ?? item.land_parcel_id ?? extractLandParcelIdFromContent(item.content),
    gcnBookNumber: item.gcnBookNumber || item.gcn_book_number || null,
    relatedRecordDisplay: formatCadastralRelatedRecord(item),
    content: item.content,
    contentTitle: item.complaintTitle || mainParsed.title || parsed.title,
    contentBody: item.complaintBody || mainParsed.body || parsed.body,
    supplementSections: supplements,
    status: item.status,
    statusLabel: mapStatusLabel(item.status),
    type: getComplaintTypeLabel(item),
    date: formatDate(item.createdAt),
    createdAt: item.createdAt,
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

export const COMPLAINT_LIST_PATH = '/cadastral-complaints';
export const DEFAULT_COMPLAINT_TAB = 'Tất cả';

export const COMPLAINT_INITIAL_STATE = {
  view: 'list',
  activeTab: DEFAULT_COMPLAINT_TAB,
  complaints: [],
  loading: false,
  showAdvancedSearch: false,
  selectedComplaint: null,
  attachmentPreview: null,
};

export const complaintReducer = (state, action) => {
  switch (action.type) {
    case 'patch':
      return { ...state, ...action.payload };
    case 'openDetail':
      return {
        ...state,
        selectedComplaint: action.complaint,
        view: 'detail',
      };
    default:
      return state;
  }
};

export { API_BASE };
