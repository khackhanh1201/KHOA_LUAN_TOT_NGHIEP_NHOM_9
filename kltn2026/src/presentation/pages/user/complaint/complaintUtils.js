import { formatTaxRecordCode, parseTaxRecordId } from '../../../../utils/taxRecordCode';

{ formatTaxRecordCode, parseTaxRecordId };

export const STATUS_MAP = {
  PENDING: { label: 'Chờ xử lý', bg: '#fef3c7', color: '#d97706' },
  PROCESSING: { label: 'Đang xử lý', bg: '#dbeafe', color: '#2563eb' },
  IN_PROGRESS: { label: 'Đang xử lý', bg: '#dbeafe', color: '#2563eb' },
  NEED_SUPPLEMENT: { label: 'Cần bổ sung', bg: '#ffedd5', color: '#ea580c' },
  RESOLVED: { label: 'Đã giải quyết', bg: '#dcfce7', color: '#16a34a' },
  REJECTED: { label: 'Từ chối', bg: '#fee2e2', color: '#dc2626' },
};

export const COMPLAINT_DOMAIN = { TAX: 'TAX', LAND: 'LAND' };

export const DOMAIN_LABELS = {
  [COMPLAINT_DOMAIN.TAX]: 'Khiếu nại về thuế / tờ khai',
  [COMPLAINT_DOMAIN.LAND]: 'Khiếu nại về đất đai / hồ sơ địa chính',
};

const LAND_TITLE_DEFAULT = 'Khiếu nại về sai diện tích trên sổ';

export const isTaxRecord = (cat) => cat === 'TAX_DECLARATION' || cat === 'TAX';

export const normalizeParcel = (p) => ({
  landParcelId: p.landParcelId ?? p.land_parcel_id ?? p.id,
  parcelNumber: p.parcelNumber ?? p.parcel_number ?? '',
  mapSheetNumber: p.mapSheetNumber ?? p.map_sheet_number ?? '',
  areaSize: p.areaSize ?? p.area_size ?? null,
  address: p.address ?? '',
  gcnBookNumber: p.gcnBookNumber ?? p.gcn_book_number ?? '',
  landTypeName: p.landTypeName ?? p.land_type_name ?? '',
});

export const formatRecordOption = (r) => {
  const id = r.recordId ?? r.id;
  const label = [
    formatTaxRecordCode(id, r.createdAt || r.submittedAt),
    r.recordCategory || '—',
    r.status || r.currentStatus,
    r.address || (r.parcelNumber ? `Thửa ${r.parcelNumber}` : ''),
  ].filter(Boolean).join(' · ');
  return { value: String(id), label };
};

export const formatParcelOption = (p) => {
  const id = p.landParcelId;
  const label = [
    p.gcnBookNumber ? `GCN ${p.gcnBookNumber}` : null,
    p.parcelNumber ? `Thửa ${p.parcelNumber}` : null,
    p.mapSheetNumber ? `Tờ ${p.mapSheetNumber}` : null,
    p.areaSize != null && p.areaSize !== '' ? `${p.areaSize} m²` : null,
    p.landTypeName || null,
    p.address || null,
  ].filter(Boolean).join(' · ');
  return { value: String(id), label: label || `Thửa đất #${id}` };
};

export const buildLandComplaintContent = (title, content, parcel) => {
  const metaParts = [
    `[${title}]`,
    parcel?.gcnBookNumber ? `GCN: ${parcel.gcnBookNumber}` : null,
    parcel?.landParcelId ? `Mã thửa TĐ-${parcel.landParcelId}` : null,
    parcel?.parcelNumber ? `Số thửa: ${parcel.parcelNumber}` : null,
    parcel?.mapSheetNumber ? `Tờ bản đồ: ${parcel.mapSheetNumber}` : null,
    parcel?.areaSize != null && parcel?.areaSize !== '' ? `Diện tích trên sổ: ${parcel.areaSize} m²` : null,
    parcel?.address ? `Địa chỉ: ${parcel.address}` : null,
  ].filter(Boolean);
  return `${metaParts.join(' | ')} — ${content.trim()}`;
};

export const parseComplaintContent = (raw) => {
  const text = raw || '';
  const m = text.match(/^\[(.+?)\]\s*-\s*(.*)$/s);
  if (m) return { title: m[1].trim(), body: m[2].trim() };
  const landMeta = text.match(/^\[(.+?)\]\s*\|/);
  if (landMeta) {
    const body = text.includes(' — ') ? text.split(' — ').slice(1).join(' — ') : text;
    return { title: landMeta[1].trim(), body: body.trim() };
  }
  return { title: null, body: text };
};

export const domainFromCategory = (cat) =>
  isTaxRecord(cat) ? COMPLAINT_DOMAIN.TAX : COMPLAINT_DOMAIN.LAND;

const SUPPLEMENT_OFFICER_TAG = /^\[\[SUPPLEMENT_BY:(TAX_OFFICER|LAND_OFFICER)\]\]\s*\n?/;

export const getSupplementRequestDisplay = (complaint) => {
  let note = complaint.responseNote || '';
  if (!note) return null;
  let role = complaint.supplementOfficerRole;
  const tagMatch = note.match(SUPPLEMENT_OFFICER_TAG);
  if (tagMatch) {
    role = role || tagMatch[1];
    note = note.replace(SUPPLEMENT_OFFICER_TAG, '').trim();
  }
  if (!note) return null;
  if (role === 'TAX_OFFICER') return { label: 'Yêu cầu bổ sung của cán bộ thuế', note };
  if (role === 'LAND_OFFICER') return { label: 'Yêu cầu bổ sung của cán bộ địa chính', note };
  const domain = domainFromCategory(complaint.recordCategory);
  return domain === COMPLAINT_DOMAIN.TAX
    ? { label: 'Yêu cầu bổ sung của cán bộ thuế', note }
    : { label: 'Yêu cầu bổ sung của cán bộ địa chính', note };
};

export const INITIAL_COMPLAINT_FORM = {
  complaintDomain: COMPLAINT_DOMAIN.TAX,
  recordId: '',
  landParcelId: '',
  title: 'Khiếu nại về số tiền thuế đất đai',
  content: '',
  file: null,
  attachment: null,
};

export const INITIAL_COMPLAINT_STATE = {
  form: INITIAL_COMPLAINT_FORM,
  loading: false,
  success: false,
  error: '',
  complaints: [],
  listLoading: true,
  lastDomain: COMPLAINT_DOMAIN.TAX,
  supplementDrafts: {},
  supplementFiles: {},
  supplementSubmitting: null,
};

export const complaintPageReducer = (state, action) => {
  switch (action.type) {
    case 'PATCH':
      return { ...state, ...action.payload };
    case 'PATCH_FORM':
      return { ...state, form: { ...state.form, ...action.payload } };
    case 'RESET_FORM':
      return { ...state, form: INITIAL_COMPLAINT_FORM };
    case 'SET_DOMAIN':
      return {
        ...state,
        form: {
          ...state.form,
          complaintDomain: action.domain,
          recordId: '',
          landParcelId: '',
          title: action.domain === COMPLAINT_DOMAIN.TAX
            ? 'Khiếu nại về số tiền thuế đất đai'
            : LAND_TITLE_DEFAULT,
        },
        error: '',
      };
    case 'PATCH_SUPPLEMENT_DRAFT':
      return { ...state, supplementDrafts: { ...state.supplementDrafts, [action.id]: action.value } };
    case 'PATCH_SUPPLEMENT_FILES':
      return { ...state, supplementFiles: { ...state.supplementFiles, [action.id]: action.files } };
    case 'CLEAR_SUPPLEMENT_DRAFT': {
      const nextDrafts = { ...state.supplementDrafts };
      const nextFiles = { ...state.supplementFiles };
      delete nextDrafts[String(action.id)];
      delete nextFiles[String(action.id)];
      return { ...state, supplementDrafts: nextDrafts, supplementFiles: nextFiles };
    }
    default:
      return state;
  }
};
