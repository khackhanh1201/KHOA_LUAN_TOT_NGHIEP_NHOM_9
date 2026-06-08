import { getToken } from '../../../../usecases/authService';

export const API_BASE = 'http://localhost:8080/api';

/** Thông báo khi cán bộ chưa cập nhật đơn giá khu vực (hiển thị trên màn khai báo). */
export const LAND_PRICE_MISSING_MESSAGE =
  'Đơn giá của khu vực chưa được cập nhật. Vui lòng đợi cán bộ cập nhật giá và khai báo lại sau.';

export const isLandPriceMissingError = (status, bodyText = '') => {
  if (status === 404) return true;
  const lower = String(bodyText).toLowerCase();
  return (
    lower.includes('đơn giá') ||
    lower.includes('don gia') ||
    lower.includes('land_price_not_found') ||
    lower.includes('bảng giá')
  );
};

export const STEPS = [
  { id: 1, label: 'XÁC THỰC' },
  { id: 2, label: 'THÔNG TIN' },
  { id: 3, label: 'TÀI LIỆU' },
  { id: 4, label: 'GỬI HỒ SƠ' },
];

export const NEW_LAND_TYPE_LABEL = 'Khai báo đất sở hữu (Đất mới)';
const RECORD_CATEGORY_NEW_LAND = 'LAND_OWNERSHIP_NEW';

export const getAuth = (token = getToken()) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export const EXEMPT_STATUS_APPROVED = 'APPROVED';
export const EXEMPT_STATUS_PENDING = 'PENDING';

export const normalizeExemptStatus = (status) => String(status || '').toUpperCase();

export const formatExemptionStatusLabel = (status) => {
  const s = normalizeExemptStatus(status);
  if (s === EXEMPT_STATUS_APPROVED) return 'Đã duyệt';
  if (s === EXEMPT_STATUS_PENDING) return 'Chờ duyệt';
  return status || '—';
};

/** Năm thuế khi nộp tờ khai — khớp BE (LocalDate.now().getYear() / tax_payments.tax_year). */
export const getDeclarationTaxYear = () => new Date().getFullYear();

/**
 * Chỉ lấy miễn giảm đúng applied_year (không fallback sang năm khác).
 * APPROVED ưu tiên trước PENDING trong cùng năm.
 */
export const findExemptionForYear = (list, year) => {
  const y = Number(year);
  const arr = (Array.isArray(list) ? list : []).filter((e) => {
    const s = normalizeExemptStatus(e.status);
    return s === EXEMPT_STATUS_APPROVED || s === EXEMPT_STATUS_PENDING;
  });
  return (
    arr.find(
      (e) => Number(e.appliedYear) === y && normalizeExemptStatus(e.status) === EXEMPT_STATUS_APPROVED
    ) ||
    arr.find(
      (e) => Number(e.appliedYear) === y && normalizeExemptStatus(e.status) === EXEMPT_STATUS_PENDING
    ) ||
    null
  );
};

export const resolveLandTypeLabel = (landTypeId, landTypeName, landTypes = []) => {
  if (landTypeName) return landTypeName;
  const id = Number(landTypeId);
  if (!id) return '';
  const found = landTypes.find(
    (t) => Number(t.landTypeId ?? t.land_type_id) === id
  );
  return found?.typeName ?? found?.type_name ?? found?.typeCode ?? found?.type_code ?? '';
};

const EMPTY_TAX_ESTIMATE = {
  loading: false,
  grossTaxAmount: null,
  reductionAmount: null,
  calculatedAmount: null,
  discountRate: null,
  exemptionApplied: false,
  unitPrice: null,
  landPriceMissing: false,
  error: null,
};

const INITIAL_DECLARATION_FORM = {
  recordCategory: RECORD_CATEGORY_NEW_LAND,
  landParcelId: '',
  areaId: '',
  landTypeId: '',
  landTypeName: '',
  gcnBookNumber: '',
  parcelNumber: '',
  mapSheetNumber: '',
  areaSize: '',
  usageType: '',
  address: '',
  usageOrigin: '',
  certificateNumber: '',
  attachedHouse: '',
  attachedOther: '',
  notes: '',
  doiTuongMienThue: 'Không có',
  exemptionReason: '',
  discountRate: '',
  exemptionStatus: '',
  appliedYear: '',
  usageDuration: '',
  declaredUsage: '',
};

export const INITIAL_DECLARATION_STATE = {
  step: 1,
  landTypes: [],
  form: INITIAL_DECLARATION_FORM,
  gcnLookupError: '',
  gcnLookingUp: false,
  loadingExemption: false,
  taxEstimate: EMPTY_TAX_ESTIMATE,
  files: [],
  agreed: false,
  submitting: false,
  error: '',
  success: false,
  declarationCode: '',
};

export const declarationPageReducer = (state, action) => {
  switch (action.type) {
    case 'PATCH':
      return { ...state, ...action.payload };
    case 'PATCH_FORM':
      return { ...state, form: { ...state.form, ...action.payload } };
    case 'SET_TAX_ESTIMATE':
      return { ...state, taxEstimate: { ...state.taxEstimate, ...action.payload } };
    case 'RESET_TAX_ESTIMATE':
      return { ...state, taxEstimate: EMPTY_TAX_ESTIMATE };
    default:
      return state;
  }
};

export const canGoStep3 = (form, taxEstimate = {}) => {
  if (taxEstimate.landPriceMissing) return false;
  if (taxEstimate.loading) return false;
  return form.gcnBookNumber.trim().length > 0 && !!form.landParcelId;
};

export const lookupParcelByGcn = async (gcn, token, landTypes) => {
  const trimmed = String(gcn || '').trim();
  if (!trimmed) {
    return { gcnLookupError: '', formPatch: null };
  }

  const res = await fetch(
    `${API_BASE}/land-parcels/lookup-by-gcn?gcnBookNumber=${encodeURIComponent(trimmed)}`,
    { headers: getAuth(token) }
  );

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    return {
      gcnLookupError:
        errJson.message || errJson.error || 'Không tìm thấy thửa đất với số GCN này trên sổ địa chính.',
      formPatch: { landParcelId: '', landTypeId: '', landTypeName: '', areaId: '' },
    };
  }

  const json = await res.json();
  const p = json.data ?? json;
  return {
    gcnLookupError: '',
    formPatch: {
      landParcelId: String(p.landParcelId ?? ''),
      areaId: String(p.areaId ?? ''),
      landTypeId: String(p.landTypeId ?? ''),
      landTypeName: p.landTypeName || resolveLandTypeLabel(p.landTypeId, '', landTypes),
      parcelNumber: p.parcelNumber || '',
      mapSheetNumber: p.mapSheetNumber || '',
      areaSize: p.areaSize != null ? String(p.areaSize) : '',
      usageType: p.usageType || '',
      address: p.address || '',
      usageOrigin: p.usageOrigin || '',
      certificateNumber: p.certificateNumber || '',
      attachedHouse: p.attachedHouse || '',
      attachedOther: p.attachedOther || '',
      notes: p.notes || '',
      usageDuration: p.usageDuration || '',
    },
  };
};

/** @deprecated dùng lookupParcelByGcn */
export const lookupUnownedParcelByGcn = lookupParcelByGcn;

export const submitDeclaration = async (form, attachmentIds) => {
  const payload = {
    parcelId: form.landParcelId ? Number(form.landParcelId) : null,
    gcnBookNumber: form.gcnBookNumber.trim(),
    declaredUsage: form.usageType || undefined,
    declaredArea: Number(form.areaSize),
    attachmentIds,
    recordCategory: RECORD_CATEGORY_NEW_LAND,
    parcelNumber: form.parcelNumber,
    mapSheetNumber: form.mapSheetNumber,
    usageType: form.usageType,
    address: form.address,
    usageOrigin: form.usageOrigin,
    certificateNumber: form.certificateNumber,
    attachedHouse: form.attachedHouse,
    attachedOther: form.attachedOther,
    notes: form.notes,
    exemptSubject: form.exemptionReason || form.doiTuongMienThue,
    discountRate: form.discountRate ? Number(form.discountRate) : undefined,
    appliedYear: form.appliedYear ? Number(form.appliedYear) : getDeclarationTaxYear(),
  };

  const res = await fetch(`${API_BASE}/tax/declarations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    if (isLandPriceMissingError(res.status, text)) {
      throw new Error(LAND_PRICE_MISSING_MESSAGE);
    }
    let message = text || `Lỗi ${res.status}`;
    try {
      const parsed = JSON.parse(text);
      message = parsed.error || parsed.message || message;
    } catch {
      /* keep raw text */
    }
    throw new Error(message);
  }

  const result = await res.json();
  const newId = result.data?.record_id || result.data?.recordId || result.recordId || Date.now();
  return `HS-${new Date().getFullYear()}-${String(newId).padStart(4, '0')}`;
};
