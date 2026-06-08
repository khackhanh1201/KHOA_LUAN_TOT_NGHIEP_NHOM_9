import {
  formatTaxRecordCode,
  parseTaxRecordId,
} from '../../../utils/taxRecordCode';
import { getJsonAuthHeaders } from '../../../utils/authHeaders';

export const API_BASE = 'http://localhost:8080/api';

export const matchesRecordCode = (item, query) => {
  const q = (query || '').toLowerCase().trim();
  if (!q) return true;
  const code = (item.recordCode || '').toLowerCase();
  const idStr = item.id != null ? String(item.id).toLowerCase() : '';
  if (code.includes(q) || idStr.includes(q)) return true;
  const parsed = parseTaxRecordId(query);
  return parsed != null && Number(item.id) === parsed;
};

const mapRecordCategory = (cat) => {
  const map = {
    TAX_DECLARATION: 'Tờ khai thuế',
    TAX: 'Hồ sơ thuế',
    LAND_OWNERSHIP_NEW: 'Khai báo đất mới',
    TRANSFER: 'Chuyển nhượng quyền sử dụng đất',
    MUTATION: 'Tách/Hợp thửa đất',
    CHANGE_PURPOSE: 'Đổi mục đích sử dụng',
    GCN_RENEWAL: 'Cấp đổi giấy chứng nhận',
    LAND_MUTATION: 'Biến động đất đai',
  };
  return map[cat] || cat || '—';
};

const formatMoney = (num, { estimated = false } = {}) => {
  if (num == null || num === '') return '—';
  const base = `${Number(num).toLocaleString('vi-VN')} VNĐ`;
  return estimated ? `${base} (ước tính)` : base;
};

const formatPaymentStatus = (status) => {
  if (!status) return 'Chưa thanh toán';
  const map = {
    PAID: 'Đã thanh toán',
    UNPAID: 'Chưa thanh toán',
    AWAITING_PAYMENT: 'Chờ thanh toán',
    CANCELLED: 'Đã hủy',
  };
  return map[status] || status;
};

export const buildTaxDetailFromRecord = (record, listItem = {}) => {
  const parcel = record.landParcel || {};
  const taxDecl = record.taxDeclaration || {};
  const fin = record.financialInfo || {};
  const taxExempt = record.taxExemption || {};
  const adj = fin.adjustmentFactor != null ? Number(fin.adjustmentFactor) : 0.0003;
  const areaVal = taxDecl.declaredArea ?? parcel.areaSize;

  return {
    ...listItem,
    id: record.recordId ?? listItem.id,
    submittedAt: record.submittedAt ?? listItem.submittedAt,
    recordCode: formatTaxRecordCode(record.recordId, record.submittedAt),
    status: record.currentStatus ?? listItem.status,
    name: record.fullName || listItem.name || '—',
    cccd: record.cccdNumber || listItem.cccd || '—',
    date: record.submittedAt
      ? new Date(record.submittedAt).toLocaleDateString('vi-VN')
      : listItem.date,
    recordCategory: mapRecordCategory(record.recordCategory),
    exemptSubject: taxExempt.label || 'Không có',
    parcelNumber: parcel.parcelNumber || listItem.parcelNumber || '—',
    mapSheetNumber: parcel.mapSheetNumber || listItem.mapSheetNumber || '—',
    areaSize: areaVal != null ? `${areaVal} m²` : listItem.areaSize || '—',
    landType:
      parcel.landTypeName || taxDecl.declaredUsage || listItem.landType || '—',
    usageOrigin: parcel.usageType || parcel.usageOrigin || listItem.usageOrigin || '—',
    address: parcel.address || listItem.address || '—',
    taxRate: `${(adj * 100).toFixed(2).replace('.', ',')}%`,
    landPrice:
      fin.unitPrice != null
        ? `${Number(fin.unitPrice).toLocaleString('vi-VN')} VNĐ/m²`
        : '—',
    adjustmentFactor: `${(adj * 100).toFixed(2).replace('.', ',')}%`,
    discount: formatMoney(fin.reductionAmount),
    grossTax: formatMoney(fin.grossTaxAmount),
    totalTax: formatMoney(fin.totalTaxAmount, { estimated: fin.estimated === true }),
    paymentStatus: formatPaymentStatus(
      fin.paymentStatus ?? record.payment?.paymentStatus
    ),
  };
};

export const loadTaxProcessingRecords = async () => {
  const res = await fetch(`${API_BASE}/tax/records`, {
    method: 'GET',
    headers: getJsonAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`HTTP Error! Status: ${res.status}`);
  }

  const json = await res.json();
  const rawData = Array.isArray(json) ? json : (json?.data || json?.content || []);

  return rawData.map((item) => {
    let mainTab = 'PENDING';
    if (item?.currentStatus === 'PROCESSING' || item?.currentStatus === 'VERIFIED') {
      mainTab = 'PROCESSING';
    } else if (
      item?.currentStatus === 'APPROVED' ||
      item?.currentStatus === 'REJECTED' ||
      item?.currentStatus === 'CANCELLED'
    ) {
      mainTab = 'COMPLETED';
    }

    const recordId = item?.recordId;
    const submittedAt = item?.submittedAt;

    return {
      id: recordId || '---',
      submittedAt,
      recordCode: formatTaxRecordCode(recordId, submittedAt),
      name: item?.fullName || '---',
      cccd: item?.senderCccd || '---',
      landType: item?.landType || '---',
      priority: item?.priority || 'TRUNG BÌNH',
      date: item?.submittedAt ? new Date(item.submittedAt).toLocaleDateString('vi-VN') : '---',
      status: item?.currentStatus || 'PENDING',
      mainTab,
      recordCategory: item?.recordCategory || 'Đăng ký biến động đất đai',
      citizenId: item?.citizenId || '---',
      parcelNumber: item?.landParcelNumber || '---',
      mapSheetNumber: item?.mapSheetNumber || '---',
      areaSize: item?.area ? `${item.area} m2` : '---',
      usageOrigin: item?.usageOrigin || 'Sử dụng riêng',
      address: item?.landAddress || item?.address || '---',
      exemptSubject: item?.exemptSubject || 'Không có',
      taxRate: '---',
      landPrice: '---',
      adjustmentFactor: '---',
      discount: '---',
      totalTax: item?.calculatedTaxAmount
        ? `${Number(item.calculatedTaxAmount).toLocaleString('vi-VN')} VNĐ`
        : '---',
    };
  });
};

export const initialState = {
  activeTab: 'ALL',
  search: '',
  filters: { code: '', name: '', taxType: 'Tất cả', status: 'Tất cả' },
  showAdvanced: false,
  riskFilter: 'normal',
  showDetail: false,
  selectedRecord: null,
  actionModal: null,
  actionReason: '',
  actionDetail: '',
  attachments: [],
  attachmentPreview: null,
  loadingAttachments: false,
  detailLoading: false,
  showExportOptions: false,
  showPreview: false,
  exportFormat: 'PDF',
  showHistory: false,
};

export const taxProcessingReducer = (state, action) => {
  switch (action.type) {
    case 'patch':
      return { ...state, ...action.payload };
    case 'openDetail':
      return {
        ...state,
        selectedRecord: action.item,
        showDetail: true,
        attachments: [],
        attachmentPreview: null,
        loadingAttachments: true,
        detailLoading: true,
      };
    case 'closeDetail':
      return { ...state, showDetail: false };
    case 'closeActionModal':
      return { ...state, actionModal: null };
    case 'resetFilters':
      return {
        ...state,
        filters: { code: '', name: '', taxType: 'Tất cả', status: 'Tất cả' },
        search: '',
      };
    case 'closeExportModals':
      return { ...state, showExportOptions: false, showPreview: false };
    case 'completeAction':
      return {
        ...state,
        actionModal: null,
        showDetail: false,
        actionDetail: '',
      };
    default:
      return state;
  }
};
