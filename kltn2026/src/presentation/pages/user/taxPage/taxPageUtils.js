import {
  EXEMPT_STATUS_APPROVED,
  findExemptionForYear,
  formatExemptionStatusLabel,
  normalizeExemptStatus,
} from '../../../../utils/taxExempt';

export const API_BASE = 'http://localhost:8080/api';

export const getAuth = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const formatVND = (v) => (v != null ? Number(v).toLocaleString('vi-VN') + ' VND' : '—');
export const formatDate = (v) => (v ? new Date(v).toLocaleDateString('vi-VN') : '—');

export const isFullTaxExempt = (item) =>
  item?.isFullExempt === true ||
  item?.isExempt === true ||
  Number(item?.taxAmount ?? 0) <= 0;

export const hasPartialExemption = (item) =>
  Boolean(item?.hasPartialExemption) && !isFullTaxExempt(item);

export const formatPayableAmount = (item) => {
  if (isFullTaxExempt(item)) return 'Được miễn thuế';
  return formatVND(item.taxAmount);
};

const mapExemptionMeta = (myExemptions, taxYear, taxAmount) => {
  const exemptRow = findExemptionForYear(myExemptions, taxYear);
  const approvedExempt =
    exemptRow && normalizeExemptStatus(exemptRow.status) === EXEMPT_STATUS_APPROVED;
  const discountRate = approvedExempt ? Number(exemptRow.discountRate ?? 0) : 0;
  const isFullExempt = taxAmount <= 0 || (approvedExempt && discountRate >= 100);
  const hasPartialExemptionFlag =
    approvedExempt && discountRate > 0 && discountRate < 100 && taxAmount > 0;

  return {
    exemptRow,
    approvedExempt,
    discountRate,
    isFullExempt,
    hasPartialExemption: hasPartialExemptionFlag,
    exemptionReason: approvedExempt
      ? exemptRow.exemptionReason
      : isFullExempt
        ? 'Miễn thuế 100%'
        : null,
    exemptionStatus: exemptRow?.status ?? null,
    exemptionStatusLabel: exemptRow?.status
      ? formatExemptionStatusLabel(exemptRow.status)
      : null,
  };
};

export const getAmountDisplayClass = (item) =>
  isFullTaxExempt(item) ? 'text-success' : 'text-danger';

const DEFAULT_TAX_TYPE_LABEL = 'Thuế sử dụng đất phi nông nghiệp';

export const getLandTypeLabel = (r) => r.landTypeName || DEFAULT_TAX_TYPE_LABEL;

export const formatParcelDisplay = (r) => {
  if (r.parcelNumber) {
    return `Thửa ${r.parcelNumber} · TĐ-${r.landParcelId ?? '—'}`;
  }
  return r.parcelCode || `TĐ-${r.landParcelId ?? '—'}`;
};

export const matchAmountRange = (amount, range) => {
  if (!range) return true;
  const n = Number(amount) || 0;
  if (range === 'under500') return n < 500_000;
  if (range === '500to2m') return n >= 500_000 && n <= 2_000_000;
  if (range === 'over2m') return n > 2_000_000;
  return true;
};

const normalizeParcelMeta = (p) => ({
  landParcelId: p.landParcelId ?? p.land_parcel_id ?? p.parcelId,
  landTypeId: p.landTypeId ?? p.land_type_id ?? null,
  landTypeName: p.landTypeName ?? p.land_type_name ?? p.typeName ?? '',
  parcelNumber: p.parcelNumber ?? p.parcel_number ?? '',
});

const buildParcelLookup = (parcels, history) => {
  const map = {};
  (Array.isArray(parcels) ? parcels : []).forEach((p) => {
    const meta = normalizeParcelMeta(p);
    if (meta.landParcelId != null) {
      map[meta.landParcelId] = meta;
    }
  });
  (Array.isArray(history) ? history : []).forEach((h) => {
    const pid = h.parcelId ?? h.landParcelId;
    if (pid == null) return;
    const existing = map[pid] || {};
    map[pid] = {
      landParcelId: pid,
      landTypeId: existing.landTypeId ?? h.landTypeId ?? null,
      landTypeName:
        existing.landTypeName || h.landTypeName || h.declaredUsage || '',
      parcelNumber: existing.parcelNumber || h.parcelNumber || '',
    };
  });
  return map;
};

const enrichBill = (item, parcelLookup) => {
  const landParcelId = item.landParcelId ?? item.land_parcel_id;
  const meta = parcelLookup[landParcelId] || {};
  const parcelCode = `TĐ-${landParcelId || '???'}`;
  return {
    taxId: item.payId,
    recordId: item.recordId,
    landParcelId,
    parcelCode,
    parcelNumber: meta.parcelNumber || '',
    landTypeId: meta.landTypeId ?? null,
    landTypeName: meta.landTypeName || '',
    taxYear: item.taxYear,
    taxAmount: item.totalPayable ?? (item.totalAmountDue || 0),
    baseAmount: item.totalAmountDue || 0,
    penaltyAmount: item.penaltyAmount || 0,
    totalPayable: item.totalPayable ?? (item.totalAmountDue || 0),
    overdueDays: item.overdueDays || 0,
    status: item.paymentStatus || 'UNPAID',
    submittedAt: item.paidAt || item.dueDate,
    dueDate: item.dueDate,
  };
};

export const loadTaxPageRecords = async () => {
  const [unpaidRes, paidRes, parcelsRes, historyRes] = await Promise.allSettled([
    fetch(`${API_BASE}/payments/unpaid`, { headers: getAuth() }),
    fetch(`${API_BASE}/payments/paid`, { headers: getAuth() }),
    fetch(`${API_BASE}/land-parcels/my-parcels`, { headers: getAuth() }),
    fetch(`${API_BASE}/tax/declarations/my-history`, { headers: getAuth() }),
  ]);

  let parcels = [];
  if (parcelsRes.status === 'fulfilled' && parcelsRes.value.ok) {
    const json = await parcelsRes.value.json();
    parcels = Array.isArray(json) ? json : json.data || [];
  }

  let history = [];
  if (historyRes.status === 'fulfilled' && historyRes.value.ok) {
    const json = await historyRes.value.json();
    history = Array.isArray(json) ? json : json.data || [];
  }

  const parcelLookup = buildParcelLookup(parcels, history);

  let myExemptions = [];
  try {
    const exRes = await fetch(`${API_BASE}/tax/exemptions/me`, { headers: getAuth() });
    if (exRes.ok) {
      myExemptions = await exRes.json();
    }
  } catch (e) {
    console.warn('Không tải được danh sách miễn giảm:', e);
  }

  let allBills = [];

  if (unpaidRes.status === 'fulfilled' && unpaidRes.value.ok) {
    const unpaidData = await unpaidRes.value.json();
    const unpaidArr = Array.isArray(unpaidData) ? unpaidData : (unpaidData.data || []);

    const mappedUnpaid = unpaidArr.map((item) => {
      const base = enrichBill(item, parcelLookup);
      const taxAmount = base.taxAmount;
      const taxYear = base.taxYear;
      const meta = mapExemptionMeta(myExemptions, taxYear, base.baseAmount ?? taxAmount);
      return {
        ...base,
        taxAmount,
        taxYear,
        status: item.paymentStatus || 'UNPAID',
        submittedAt: item.dueDate,
        isExempt: meta.isFullExempt,
        isFullExempt: meta.isFullExempt,
        hasPartialExemption: meta.hasPartialExemption,
        exemptionReason: meta.exemptionReason,
        discountRate: meta.discountRate || (meta.isFullExempt ? 100 : null),
        exemptionStatus: meta.exemptionStatus,
        exemptionStatusLabel: meta.exemptionStatusLabel,
      };
    });
    allBills = [...allBills, ...mappedUnpaid];
  }

  if (paidRes.status === 'fulfilled' && paidRes.value.ok) {
    const paidData = await paidRes.value.json();
    const paidArr = Array.isArray(paidData) ? paidData : (paidData.data || []);

    const mappedPaid = paidArr.map((item) => {
      const base = enrichBill(item, parcelLookup);
      const taxAmount = base.taxAmount;
      const taxYear = base.taxYear;
      const meta = mapExemptionMeta(myExemptions, taxYear, base.baseAmount ?? taxAmount);
      return {
        ...base,
        taxAmount,
        status: 'PAID',
        submittedAt: item.paidAt || item.dueDate,
        isExempt: meta.isFullExempt,
        isFullExempt: meta.isFullExempt,
        hasPartialExemption: meta.hasPartialExemption,
        exemptionReason: meta.exemptionReason,
        discountRate: meta.discountRate || (meta.isFullExempt ? 100 : null),
        exemptionStatus: meta.exemptionStatus,
        exemptionStatusLabel: meta.exemptionStatusLabel,
      };
    });
    allBills = [...allBills, ...mappedPaid];
  }

  allBills.sort((a, b) => b.taxYear - a.taxYear || b.taxId - a.taxId);
  return allBills;
};

const INITIAL_ADV_FILTERS = { taxYear: '', landTypeName: '', amountRange: '' };

export const INITIAL_TAX_UI = {
  tab: 'all',
  search: '',
  selectedDetail: null,
  selectedPayment: null,
  paymentLink: null,
  creatingLink: false,
  showAdv: false,
  advFilters: INITIAL_ADV_FILTERS,
};

export const taxUiReducer = (state, action) => {
  switch (action.type) {
    case 'PATCH':
      return { ...state, ...action.payload };
    case 'PATCH_ADV_FILTERS':
      return { ...state, advFilters: { ...state.advFilters, ...action.payload } };
    case 'RESET_ADV_FILTERS':
      return {
        ...state,
        advFilters: INITIAL_ADV_FILTERS,
        search: '',
        showAdv: false,
      };
    case 'CLOSE_PAYMENT_MODAL':
      return { ...state, selectedPayment: null, paymentLink: null };
    default:
      return state;
  }
};
