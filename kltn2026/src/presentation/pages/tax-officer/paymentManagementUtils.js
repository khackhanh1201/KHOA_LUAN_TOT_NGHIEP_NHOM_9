import { getBearerAuthHeaders } from '../../../utils/authHeaders';
import {
  successBadge,
  reconcilingBadge,
  disputedBadge,
  failedBadge,
  pendingBadge,
} from './paymentManagementStyles';

export const API_BASE = 'http://localhost:8080/api';

export const LIST_TABS = ['Tất cả', 'Chờ thanh toán', 'Đã thanh toán'];
export const RECON_TABS = ['Tất cả', 'Khớp', 'Lệch'];

const formatInvoiceCode = (payId, taxYear) => {
  const year = taxYear || new Date().getFullYear();
  const id = Number(payId) || 0;
  return `HD-${year}-${String(id).padStart(3, '0')}`;
};

const formatMst = (cccd) => {
  if (!cccd) return '—';
  const digits = String(cccd).replace(/\D/g, '');
  if (digits.length >= 10) return digits.slice(0, 10);
  return digits.padStart(10, '0');
};

const mapPaymentStatus = (status) => {
  const map = {
    UNPAID: 'CHỜ THANH TOÁN',
    AWAITING_PAYMENT: 'CHỜ THANH TOÁN',
    OVERDUE: 'CHỜ THANH TOÁN',
    PAID: 'ĐÃ NỘP',
    SUCCESS: 'ĐÃ NỘP',
    DISCREPANCY: 'ĐANG ĐỐI SOÁT',
    DISPUTED: 'CẦN THẨM ĐỊNH',
    FAILED: 'THẤT BẠI',
    CANCELLED: 'THẤT BẠI',
    WAIVED: 'MIỄN/GIẢM',
  };
  return map[status] || status || '—';
};

export const getStatusBadgeStyle = (statusRaw) => {
  if (['PAID', 'SUCCESS'].includes(statusRaw)) return successBadge;
  if (statusRaw === 'DISCREPANCY') return reconcilingBadge;
  if (statusRaw === 'DISPUTED') return disputedBadge;
  if (['FAILED', 'CANCELLED'].includes(statusRaw)) return failedBadge;
  if (['UNPAID', 'AWAITING_PAYMENT', 'OVERDUE'].includes(statusRaw)) return pendingBadge;
  return pendingBadge;
};

export const matchesListTab = (item, tab) => {
  const s = item.paymentStatusRaw;
  if (tab === 'Tất cả') return true;
  if (tab === 'Chờ thanh toán') return ['UNPAID', 'AWAITING_PAYMENT', 'OVERDUE'].includes(s);
  if (tab === 'Đã thanh toán') return ['PAID', 'SUCCESS', 'FAILED', 'CANCELLED'].includes(s);
  return true;
};

export const matchesSearch = (item, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    String(item.invoiceCode || '').toLowerCase().includes(q) ||
    String(item.mst || '').toLowerCase().includes(q) ||
    String(item.name || '').toLowerCase().includes(q) ||
    String(item.transactionCode || '').toLowerCase().includes(q)
  );
};

export const getAuthHeaders = () => getBearerAuthHeaders();

// === LOGIC TÍNH PHẠT CHẬM NỘP ===
// Phạt = Tiền gốc × 0.03% × Số ngày quá hạn (tính từ 00:00:00 ngày liền kề sau hạn nộp).
// Trả về { overdueDays, penalty } hoặc { overdueDays: 0, penalty: 0 } nếu chưa quá hạn / dueDate trống.
const PENALTY_RATE_PER_DAY = 0.0003; // 0.03%
const calcPenalty = (base, dueDateStr) => {
  if (!dueDateStr || !base || base <= 0) return { overdueDays: 0, penalty: 0 };
  const due = new Date(dueDateStr);
  if (isNaN(due.getTime())) return { overdueDays: 0, penalty: 0 };

  // Chuẩn hóa: bỏ phần giờ — so sánh theo ngày
  const dueMid = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const today = new Date();
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const diffMs = todayMid.getTime() - dueMid.getTime();
  if (diffMs <= 0) return { overdueDays: 0, penalty: 0 };

  const overdueDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const penalty = Math.round(base * PENALTY_RATE_PER_DAY * overdueDays);
  return { overdueDays, penalty };
};

// Format ngày dd/MM/yyyy theo vi-VN; trả '—' nếu invalid
export const formatDateVN = (dateStr) => {
  if (!dateStr || dateStr === '---') return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN');
};

// Format số tiền VN (tabular-nums áp ở style cell)
export const formatVND = (n) => `${(Number(n) || 0).toLocaleString('vi-VN')} đ`;
export const mapReconRowFromApi = (row) => ({
  logId: row.logId,
  payId: row.payId,
  invoiceCode: row.invoiceCode,
  orderCode: row.orderCode,
  status: row.reconciliationStatus,
  reconciliationLabel: row.reconciliationLabel,
  needsAction: row.needsAction,
  hasPayosSignal: row.hasPayosSignal,
  payosAmount: Number(row.payosAmount || 0),
  payosDescription: row.payosDescription || '',
  mst: row.mst || '—',
  payerName: row.payerName || '—',
  systemBase: Number(row.systemBase || 0),
  systemPenalty: Number(row.systemPenalty || 0),
  systemTotal: Number(row.systemTotal || 0),
  systemStatus: row.systemStatusLabel || 'BÌNH THƯỜNG',
});

export const loadAllPayments = async () => {
  const endpoint = '/payments/all';

  const [payRes, recRes] = await Promise.all([
    fetch(`${API_BASE}${endpoint}`, { headers: getAuthHeaders() }),
    fetch(`${API_BASE}/tax/records`, { headers: getAuthHeaders() }),
  ]);

  if (!payRes.ok) {
    throw new Error(`Lỗi ${payRes.status}: Không thể tải danh sách thanh toán`);
  }

  const payJson = await payRes.json();
  const rawData = Array.isArray(payJson) ? payJson : (payJson?.data || []);

  const recordMap = {};
  if (recRes.ok) {
    const records = await recRes.json();
    (Array.isArray(records) ? records : []).forEach((r) => {
      recordMap[String(r.recordId)] = {
        fullName: r.fullName || null,
        senderCccd: r.senderCccd || null,
      };
    });
  }

  return rawData.map((item) => {
    const recordInfo = recordMap[String(item.recordId)] || {};
    const base = Number(item.totalAmountDue || 0);
    const dueDate = item.dueDate ? String(item.dueDate) : '';
    const isPaid = ['PAID', 'SUCCESS'].includes(item.paymentStatus);

    const apiPenalty = item.penaltyAmount != null ? Number(item.penaltyAmount) : null;
    const apiOverdueDays = item.overdueDays != null ? Number(item.overdueDays) : null;
    const fallback = calcPenalty(base, dueDate);
    const penalty = apiPenalty != null && Number.isFinite(apiPenalty) ? apiPenalty : fallback.penalty;
    const overdueDays =
      apiOverdueDays != null && Number.isFinite(apiOverdueDays) ? apiOverdueDays : fallback.overdueDays;
    const total =
      item.totalPayable != null && Number.isFinite(Number(item.totalPayable))
        ? Number(item.totalPayable)
        : base + penalty;

    const taxYear = item.taxYear || new Date().getFullYear();
    const isAnnual = item.recordCategory === 'ANNUAL_TAX_RENEWAL';
    const installmentLabel = item.installmentLabel || (item.installmentNo === 1
      ? 'Kỳ 1'
      : item.installmentNo === 2
        ? 'Kỳ 2'
        : null);
    return {
      payId: item.payId,
      recordId: item.recordId,
      landParcelId: item.landParcelId,
      taxYear,
      totalAmountDue: base,
      paymentStatus: item.paymentStatus || 'UNPAID',
      dueDate: dueDate || '---',
      transactionCode: item.transactionCode || '---',
      paidAt: item.paidAt || null,
      invoiceCode: formatInvoiceCode(item.payId, taxYear),
      id: formatInvoiceCode(item.payId, taxYear),
      name: recordInfo.fullName || (item.recordId ? `Hồ sơ #${item.recordId}` : 'Không rõ'),
      mst: formatMst(recordInfo.senderCccd),
      cccdNumber: recordInfo.senderCccd || '—',
      recordCategory: item.recordCategory || null,
      isAnnual,
      installmentLabel,
      annualTaxTotal: item.annualTaxTotal != null ? Number(item.annualTaxTotal) : null,
      base,
      penalty,
      overdueDays,
      total,
      status: mapPaymentStatus(item.paymentStatus),
      paymentStatusRaw: item.paymentStatus,
    };
  });
};

export const initialState = {
  view: 'list',
  activeTab: 'Tất cả',
  showDetail: false,
  selectedPayment: null,
  localPayments: null,
  error: '',
  showAdvanced: false,
  advFilters: { transactionCode: '', mst: '', status: 'Tất cả' },
  showUploadModal: false,
  reconAccount: 'Vietcombank',
  reconStartDate: '2026-05-14',
  reconEndDate: '2026-05-29',
  reconFile: null,
  uploading: false,
  reconResult: null,
  loadingDetail: false,
  searchQuery: '',
  reconTab: 'Tất cả',
  showErrorModal: false,
  selectedErrorItem: null,
  loadingRecon: false,
};

export const paymentManagementReducer = (state, action) => {
  switch (action.type) {
    case 'patch':
      return { ...state, ...action.payload };
    case 'openDetail':
      return { ...state, showDetail: true, loadingDetail: true };
    case 'closeDetail':
      return { ...state, showDetail: false, selectedPayment: null };
    case 'openErrorModal':
      return { ...state, selectedErrorItem: action.item, showErrorModal: true };
    case 'closeErrorModal':
      return { ...state, showErrorModal: false, selectedErrorItem: null };
    case 'resetFilters':
      return {
        ...state,
        advFilters: { transactionCode: '', mst: '', status: 'Tất cả' },
        searchQuery: '',
      };
    case 'closeUploadModal':
      return { ...state, showUploadModal: false, reconFile: null };
    case 'resetLocalPayments':
      return { ...state, localPayments: null };
    default:
      return state;
  }
};
