import {
  findExemptionForYear,
  formatExemptionStatusLabel,
  normalizeExemptStatus,
  EXEMPT_STATUS_APPROVED,
} from '../../../../utils/taxExempt';
import {
  buildProgressiveBreakdown,
  calcProgressiveTax,
  progressiveTaxRateLabel,
} from '../../../../utils/progressiveTax';
import { resolveTotalPayable } from '../../../../utils/taxPenalty';
import { getBearerAuthHeaders, getJsonAuthHeaders } from '../../../../utils/authHeaders';

export const API_BASE = 'http://localhost:8080/api';

export const PAYMENT_TAB = {
  PENDING: 'pending',
  HISTORY: 'history',
};

const PENDING_STATUSES = ['UNPAID', 'AWAITING_PAYMENT', 'OVERDUE'];

const formatDateValue = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

export const formatCurrency = (amount) => {
  return Number(amount).toLocaleString('vi-VN') + ' ₫';
};

const getDisplayAmountDue = (item) => {
  if (item?.totalPayable != null && Number.isFinite(Number(item.totalPayable))) {
    return Number(item.totalPayable);
  }
  if (item?.displayAmountDue != null) return Number(item.displayAmountDue);
  return resolveTotalPayable(item);
};

/** Miễn thuế 100% hoặc tổng phải nộp = 0 */
export const isFullTaxExempt = (item) =>
  item?.isFullExempt === true ||
  item?.isExempt === true ||
  (item?.totalPayable != null && Number(item.totalPayable) <= 0) ||
  (normalizeExemptStatus(item?.exemptionStatus) === EXEMPT_STATUS_APPROVED &&
    Number(item?.discountRate ?? 0) >= 100);

export const formatPayableAmount = (item) => {
  if (isFullTaxExempt(item)) return 'Được miễn thuế';
  return formatCurrency(getDisplayAmountDue(item));
};

export const getAmountDisplayClass = (item) =>
  isFullTaxExempt(item) ? 'text-success' : 'text-danger';

const resolveAreaAndTaxRate = async (item, headers, historyList, parcelCache) => {
  let parcel = parcelCache[item.landParcelId];
  if (!parcel && item.landParcelId) {
    const res = await fetch(`${API_BASE}/land-parcels/${item.landParcelId}`, { headers });
    if (res.ok) {
      const json = await res.json();
      parcel = json.data ?? json;
      parcelCache[item.landParcelId] = parcel;
    }
  }

  const decl = historyList.find(
    (d) => Number(d.recordId) === Number(item.recordId)
  );
  const area = decl?.declaredArea ?? parcel?.areaSize ?? parcel?.area_size;
  const areaId = parcel?.areaId ?? parcel?.area_id;
  const landTypeId = parcel?.landTypeId ?? parcel?.land_type_id;

  let taxRate = '—';
  let unitPrice = null;
  let landQuotaLimit = null;
  const numericArea = area != null ? Number(area) : null;
  if (areaId && landTypeId && numericArea != null && numericArea > 0) {
    const calcRes = await fetch(`${API_BASE}/taxes/calculate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        areaId: Number(areaId),
        landTypeId: Number(landTypeId),
        declaredArea: numericArea,
      }),
    });
    if (calcRes.ok) {
      const calc = await calcRes.json();
      if (calc?.unitPrice != null) unitPrice = Number(calc.unitPrice);
      if (calc?.landQuotaLimit != null) landQuotaLimit = Number(calc.landQuotaLimit);
      if (calc?.taxRate != null) {
        taxRate = `${(calc.taxRate * 100).toFixed(2)}%`;
      }
    }
  }

  const taxBeforeExempt =
    unitPrice != null && numericArea != null && numericArea > 0
      ? calcProgressiveTax(numericArea, unitPrice, landQuotaLimit)
      : null;

  return {
    area: numericArea,
    taxRate,
    unitPrice,
    landQuotaLimit,
    taxBeforeExempt,
  };
};

const mapPaymentItem = async (r, headers, historyList, parcelCache, myExemptions, isPaid) => {
  const baseAmount = Number(r.totalAmountDue ?? 0);
  const penaltyAmount = Number(r.penaltyAmount ?? 0);
  const totalPayable = resolveTotalPayable(r);
  const overdueDays = Number(r.overdueDays ?? 0);
  const taxYear = r.taxYear ?? new Date().getFullYear();

  const exemptRow = findExemptionForYear(myExemptions, taxYear);
  const approvedExempt =
    exemptRow && normalizeExemptStatus(exemptRow.status) === EXEMPT_STATUS_APPROVED;
  const discountRate = approvedExempt ? Number(exemptRow.discountRate ?? 0) : 0;
  const isFullExempt = totalPayable <= 0 || discountRate >= 100;

  const isAnnual = r.recordCategory === 'ANNUAL_TAX_RENEWAL';
  const installmentLabel = r.installmentLabel || (r.installmentNo === 1
    ? 'Kỳ 1 (50%)'
    : r.installmentNo === 2
      ? 'Kỳ 2 (50%)'
      : null);

  const base = {
    paymentId: r.payId,
    recordId: r.recordId,
    landParcelId: r.landParcelId,
    taxYear,
    code: `PAY-${taxYear}-${String(r.payId).padStart(5, '0')}`,
    type: isAnnual ? 'Thuế đất hằng năm (tự động)' : 'Thuế sử dụng đất phi nông nghiệp',
    recordCategory: r.recordCategory || null,
    installmentNo: r.installmentNo ?? null,
    installmentLabel,
    annualTaxTotal: r.annualTaxTotal != null ? Number(r.annualTaxTotal) : null,
    parcel: `Thửa đất TĐ-${r.landParcelId ?? '—'}`,
    amount: baseAmount,
    baseAmount,
    penaltyAmount,
    totalPayable,
    overdueDays,
    overdue: Boolean(r.overdue) || overdueDays > 0,
    dueDate: formatDateValue(r.dueDate),
    dueDateRaw: r.dueDate,
    paidAt: formatDateValue(r.paidAt),
    status: isPaid ? 'PAID' : r.paymentStatus || 'UNPAID',
    isExempt: isFullExempt,
    isFullExempt,
    exemptionReason: approvedExempt
      ? exemptRow.exemptionReason
      : isFullExempt
        ? 'Miễn thuế 100%'
        : null,
    discountRate: approvedExempt ? discountRate : isFullExempt ? 100 : 0,
    exemptionStatus: exemptRow?.status ?? null,
    canPay: false,
  };

  const { area, taxBeforeExempt, landQuotaLimit } = await resolveAreaAndTaxRate(
    base,
    headers,
    historyList,
    parcelCache
  );

  const displayAmountDue = totalPayable;
  const isFullExemptComputed =
    displayAmountDue <= 0 || (approvedExempt && discountRate >= 100);

  let taxRateLabel = progressiveTaxRateLabel(area, landQuotaLimit);
  if (isFullExemptComputed) taxRateLabel = 'Miễn 100%';
  else if (approvedExempt && discountRate > 0 && discountRate < 100) {
    taxRateLabel = `Giảm ${discountRate}%`;
  }

  return {
    ...base,
    area: area ?? '—',
    taxRate: taxRateLabel,
    taxBeforeExempt,
    displayAmountDue,
    isFullExempt: isFullExempt || isFullExemptComputed,
    isExempt: isFullExempt || isFullExemptComputed,
    canPay:
      !isPaid &&
      ['AWAITING_PAYMENT', 'OVERDUE'].includes(r.paymentStatus) &&
      displayAmountDue > 0 &&
      !(isFullExempt || isFullExemptComputed),
  };
};

export const loadPaymentLists = async () => {
  const headers = getJsonAuthHeaders();

  const [unpaidRes, paidRes, exemptRes, histRes] = await Promise.all([
    fetch(`${API_BASE}/payments/unpaid`, { method: 'GET', headers }),
    fetch(`${API_BASE}/payments/paid`, { method: 'GET', headers }),
    fetch(`${API_BASE}/tax/exemptions/me`, { headers }),
    fetch(`${API_BASE}/tax/declarations/my-history`, { headers }),
  ]);

  if (!unpaidRes.ok && !paidRes.ok) {
    throw new Error('Không thể tải danh sách khoản thuế. Vui lòng thử lại.');
  }

  const unpaidJson = unpaidRes.ok ? await unpaidRes.json() : [];
  const paidJson = paidRes.ok ? await paidRes.json() : [];
  const unpaidRecords = Array.isArray(unpaidJson) ? unpaidJson : unpaidJson?.data || [];
  const paidRecords = Array.isArray(paidJson) ? paidJson : paidJson?.data || [];

  let myExemptions = [];
  if (exemptRes.ok) {
    myExemptions = await exemptRes.json();
  }

  let historyList = [];
  if (histRes.ok) {
    const hist = await histRes.json();
    historyList = Array.isArray(hist) ? hist : hist?.data ?? [];
  }

  const parcelCache = {};

  const pendingRaw = unpaidRecords.filter((r) =>
    PENDING_STATUSES.includes(r.paymentStatus)
  );
  const paidRaw = paidRecords
    .filter((r) => r.paymentStatus === 'PAID')
    .sort((a, b) => {
      const ta = a.paidAt ? new Date(a.paidAt).getTime() : 0;
      const tb = b.paidAt ? new Date(b.paidAt).getTime() : 0;
      return tb - ta;
    });

  const [pending, paid] = await Promise.all([
    Promise.all(
      pendingRaw.map((r) =>
        mapPaymentItem(r, headers, historyList, parcelCache, myExemptions, false)
      )
    ),
    Promise.all(
      paidRaw.map((r) =>
        mapPaymentItem(r, headers, historyList, parcelCache, myExemptions, true)
      )
    ),
  ]);

  pending.sort((a, b) => b.taxYear - a.taxYear || b.paymentId - a.paymentId);

  return { pending, paid };
};

export const INITIAL_PAYMENT_STATE = {
  localPayments: null,
  error: '',
  activeTab: PAYMENT_TAB.PENDING,
  selectedDetail: null,
  showExemptionForm: false,
  exemptionReason: '',
  exemptionDiscountRate: '50',
  exemptionEvidenceName: '',
  submittingExemption: false,
  qrModal: { open: false, data: null, item: null },
  creatingPaymentLink: false,
  copiedField: '',
};

/** Thông báo thân thiện khi PayOS chưa PAID (tránh so sánh PENDING vs OVERDUE gây hiểu nhầm). */
export const buildSyncStatusAlert = (sync) => {
  const payos = String(sync?.payosStatus || '').toUpperCase();
  if (payos === 'PENDING' || payos === 'PROCESSING') {
    return {
      title: 'Chờ thanh toán',
      message:
        'Chưa nhận được tiền từ ngân hàng. Vui lòng quét mã QR và hoàn tất chuyển khoản, sau đó bấm "Tôi đã chuyển khoản".',
      variant: 'info',
    };
  }
  if (payos === 'CANCELLED' || payos === 'CANCELED') {
    return {
      title: 'Giao dịch đã hủy',
      message: 'Thanh toán đã bị hủy trên PayOS. Bạn có thể đóng mã QR và tạo link thanh toán mới.',
      variant: 'warning',
    };
  }
  if (payos === 'ERROR') {
    return {
      title: 'Không kiểm tra được',
      message: sync?.message || 'Không truy vấn được trạng thái PayOS. Thử lại sau vài giây.',
      variant: 'warning',
    };
  }
  return {
    title: 'Chưa cập nhật',
    message:
      sync?.message ||
      `Trạng thái chưa đồng bộ (PayOS: ${sync?.payosStatus || '—'}). Thử lại sau khi chuyển khoản xong.`,
    variant: 'warning',
  };
};

export const fetchTaxDetail = async (item) => {
  const headers = getJsonAuthHeaders();

  const [parcelRes, histRes, exemptRes] = await Promise.all([
    fetch(`${API_BASE}/land-parcels/${item.landParcelId}`, { headers }),
    fetch(`${API_BASE}/tax/declarations/my-history`, { headers }),
    fetch(`${API_BASE}/tax/exemptions/me`, { headers }),
  ]);

  const parcelJson = parcelRes.ok ? await parcelRes.json() : {};
  const parcel = parcelJson.data ?? parcelJson;

  let decl = null;
  if (histRes.ok) {
    const hist = await histRes.json();
    const list = Array.isArray(hist) ? hist : hist?.data ?? [];
    decl = list.find((d) => Number(d.recordId) === Number(item.recordId));
  }

  let myExemptions = [];
  if (exemptRes.ok) {
    myExemptions = await exemptRes.json();
  }

  const area = decl?.declaredArea ?? parcel?.areaSize ?? parcel?.area_size;
  const areaId = parcel?.areaId ?? parcel?.area_id;
  const landTypeId = parcel?.landTypeId ?? parcel?.land_type_id;
  const numericArea = area != null ? Number(area) : null;

  let unitPrice = null;
  let landQuotaLimit = null;
  if (areaId && landTypeId && numericArea != null && numericArea > 0) {
    const calcRes = await fetch(`${API_BASE}/taxes/calculate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        areaId: Number(areaId),
        landTypeId: Number(landTypeId),
        declaredArea: numericArea,
      }),
    });
    if (calcRes.ok) {
      const calc = await calcRes.json();
      if (calc?.unitPrice != null) unitPrice = Number(calc.unitPrice);
      if (calc?.landQuotaLimit != null) landQuotaLimit = Number(calc.landQuotaLimit);
    }
  }

  const landValue =
    unitPrice != null && numericArea != null ? unitPrice * numericArea : null;
  const tierBreakdown =
    unitPrice != null && numericArea != null
      ? buildProgressiveBreakdown(numericArea, unitPrice, landQuotaLimit)
      : [];
  const taxBeforeExempt =
    unitPrice != null && numericArea != null
      ? calcProgressiveTax(numericArea, unitPrice, landQuotaLimit)
      : null;

  const exemptRow = findExemptionForYear(myExemptions, item.taxYear);
  const approvedExempt =
    exemptRow && normalizeExemptStatus(exemptRow.status) === EXEMPT_STATUS_APPROVED;
  const discountRate = approvedExempt ? Number(exemptRow.discountRate ?? 0) : 0;
  const exemptionAmount =
    taxBeforeExempt != null && discountRate > 0
      ? Math.round((taxBeforeExempt * discountRate) / 100)
      : 0;
  const amountAfterExempt =
    taxBeforeExempt != null ? Math.max(0, taxBeforeExempt - exemptionAmount) : null;
  const displayAmountDue = Number(item.amount ?? 0) >= 0
    ? Number(item.amount)
    : approvedExempt && discountRate > 0
      ? Math.round(amountAfterExempt ?? 0)
      : Math.round(taxBeforeExempt ?? 0);

  return {
    ...item,
    loading: false,
    taxCode: `TAX-${item.taxYear}-${String(item.paymentId).padStart(3, '0')}`,
    parcelLabel: parcel?.parcelNumber
      ? `TĐ-${parcel.parcelNumber}`
      : item.parcel,
    address:
      parcel?.address ||
      decl?.address ||
      (parcel?.mapSheetNumber
        ? `Tờ ${parcel.mapSheetNumber}, thửa ${parcel.parcelNumber ?? '—'}`
        : '—'),
    area: numericArea,
    unitPrice,
    landValue,
    tierBreakdown,
    taxBeforeExempt,
    taxRateText: progressiveTaxRateLabel(numericArea, landQuotaLimit),
    exemptionReason: exemptRow?.exemptionReason ?? item.exemptionReason ?? null,
    exemptionStatus: exemptRow?.status ?? item.exemptionStatus ?? null,
    exemptionStatusLabel: exemptRow?.status
      ? formatExemptionStatusLabel(exemptRow.status)
      : null,
    discountRate,
    exemptionAmount,
    amountAfterExempt,
    displayAmountDue,
    isFullExempt:
      displayAmountDue <= 0 ||
      (approvedExempt && discountRate >= 100) ||
      Boolean(item.isFullExempt),
  };
};

export const downloadPaymentReceipt = async (paymentId) => {
  const res = await fetch(`${API_BASE}/payments/${paymentId}/receipt`, {
    headers: getBearerAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Không thể tải biên lai thanh toán.');
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `BienLai_ThueDat_${paymentId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const paymentPageReducer = (state, action) => {
  switch (action.type) {
    case 'PATCH':
      return { ...state, ...action.payload };
    case 'CLOSE_QR_MODAL':
      return { ...state, copiedField: '', qrModal: { open: false, data: null, item: null } };
    case 'RESET_EXEMPTION_FORM':
      return {
        ...state,
        showExemptionForm: false,
        exemptionReason: '',
        exemptionEvidenceName: '',
      };
    case 'OPEN_DETAIL_LOADING':
      return {
        ...state,
        showExemptionForm: false,
        exemptionReason: '',
        exemptionEvidenceName: '',
        selectedDetail: { ...action.item, loading: true },
      };
    default:
      return state;
  }
};
