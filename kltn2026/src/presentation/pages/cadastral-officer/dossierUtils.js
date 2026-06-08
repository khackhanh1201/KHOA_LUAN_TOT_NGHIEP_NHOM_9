export const API_BASE = 'http://localhost:8080/api';

export const getAuth = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const display = (val, fallback = '—') =>
  val !== null && val !== undefined && val !== '' ? val : fallback;

const formatDate = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleDateString('vi-VN') : '—';

export const formatLongDate = (dateStr) => {
  if (!dateStr) return '—';
  const dt = new Date(dateStr);
  return `ngày ${dt.getDate()} tháng ${dt.getMonth() + 1} năm ${dt.getFullYear()}`;
};

export const mapStatusLabel = (status) => {
  const map = {
    SUBMITTED: 'Chờ xác minh',
    PENDING: 'Chờ xử lý',
    PROCESSING: 'Đang xử lý',
    VERIFIED: 'Đã xác minh',
    APPROVED: 'Đã duyệt',
    COMPLETED: 'Hoàn tất',
    REJECTED: 'Từ chối',
    CANCELLED: 'Đã hủy',
    NEED_MORE_DOCS: 'Bổ sung hồ sơ',
    FRAUD_SUSPECTED: 'Nghi gian lận',
    WARNING_FRAUD: 'Cảnh báo gian lận',
  };
  return map[status] || status || '—';
};

export const mapRecordCategory = (cat) => {
  const map = {
    TAX_DECLARATION: 'Tờ khai thuế',
    TAX: 'Hồ sơ thuế',
    LAND_OWNERSHIP_NEW: 'Khai báo đất mới',
    TRANSFER: 'Chuyển nhượng / tách hợp thửa',
    MUTATION: 'Tách/Hợp thửa đất',
    CHANGE_PURPOSE: 'Đổi mục đích sử dụng',
    GCN_RENEWAL: 'Cấp đổi GCN',
    LAND_MUTATION: 'Biến động đất đai',
  };
  return map[cat] || cat || '—';
};

export const canReceiveRecord = (status) =>
  status === 'SUBMITTED' || status === 'PENDING' || status === 'FRAUD_SUSPECTED';

export const DOSSIER_TABS = ['Tất cả', 'Chờ xác minh', 'Chờ xử lý', 'Đang duyệt', 'Đã duyệt'];

export const TAB_STATUS_MAP = {
  'Tất cả': null,
  'Chờ xác minh': ['SUBMITTED', 'FRAUD_SUSPECTED'],
  'Chờ xử lý': ['PENDING'],
  'Đang duyệt': ['VERIFIED', 'PROCESSING', 'NEED_MORE_DOCS'],
  'Đã duyệt': ['APPROVED', 'COMPLETED', 'REJECTED', 'CANCELLED'],
};

export const DOSSIER_INITIAL_STATE = {
  view: 'list',
  activeTab: 'Tất cả',
  showAdvancedSearch: false,
  showPdfPreview: false,
  attachmentPreview: null,
  downloadingPdf: false,
  searchQuery: '',
  dossiers: [],
  selectedDossier: null,
  dossierDetails: null,
  loading: false,
  detailLoading: false,
  actionLoading: false,
  cadastralMaster: null,
  cadastralMismatches: {},
  compareDone: false,
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

const mapHistoryRole = (role) => {
  if (role === 'CITIZEN') return 'NGƯỜI DÂN';
  if (role === 'OFFICER') return 'CÁN BỘ';
  return role || 'HỆ THỐNG';
};

export const mapDossierDetailsFromApi = (record, dossierFromList, docs = []) => {
  const parcel = record.landParcel || {};
  const taxDecl = record.taxDeclaration || {};
  const fin = record.financialInfo || {};
  const taxExempt = record.taxExemption || {};

  const declaredArea = taxDecl.declaredArea ?? parcel.areaSize;
  const landTypeLabel =
    parcel.landTypeName ||
    taxDecl.declaredUsage ||
    parcel.usageType ||
    null;

  return {
    recordId: record.recordId,
    landParcelId: record.landParcelId,
    gcnBookNumber: parcel.gcnBookNumber || '',
    citizenInfo: {
      citizenId: record.citizenId,
      fullName:
        record.fullName ||
        dossierFromList?.name ||
        `Công dân #${record.citizenId}`,
      cccd: record.cccdNumber || dossierFromList?.cccd || '—',
    },
    declaredInfo: {
      parcelNumber: parcel.parcelNumber,
      mapSheetNumber: parcel.mapSheetNumber,
      area: declaredArea,
      landType: landTypeLabel,
      landTypeId: parcel.landTypeId,
      landTypeName: parcel.landTypeName,
      usageType: parcel.usageType,
      address: parcel.address,
      linkedParcelId: record.landParcelId,
    },
    recordInfo: {
      recordCategory: mapRecordCategory(record.recordCategory),
      recordCategoryRaw: record.recordCategory,
      currentStatus: record.currentStatus,
      submittedAt: record.submittedAt,
      taxExemption: taxExempt.label || 'Không có',
    },
    landParcelInfo: {
      parcelNumber: parcel.parcelNumber,
      mapSheetNumber: parcel.mapSheetNumber,
      area: declaredArea,
      landType: landTypeLabel,
      usageType: parcel.usageType,
      address: parcel.address,
    },
    financialInfo: {
      landPrice: fin.unitPrice ?? null,
      adjustmentFactor:
        fin.adjustmentFactor != null
          ? String(fin.adjustmentFactor)
          : '0.0003',
      reductionAmount: fin.reductionAmount ?? null,
      totalTaxAmount: fin.totalTaxAmount ?? record.totalAmountDue ?? record.payment?.totalAmountDue ?? null,
      paymentStatus: formatPaymentStatus(
        fin.paymentStatus ?? record.paymentStatus ?? record.payment?.paymentStatus
      ),
      taxYear: fin.taxYear ?? record.payment?.taxYear ?? null,
      estimated: fin.estimated === true,
      grossTaxAmount: fin.grossTaxAmount ?? null,
    },
    attachments: docs.map((doc) => ({
      name: doc.fileName || doc.file_name || 'Tài liệu',
      status: 'Đã nộp',
      url: doc.fileUrl || doc.file_url || '',
      fileType: doc.fileType || doc.file_type || '',
    })),
    history: (record.history || []).map((item) => ({
      role: mapHistoryRole(item.role),
      action: item.action,
      timestamp: item.timestamp,
      user: item.user,
      tag: item.tag,
      notes: item.notes,
    })),
  };
};

export const dossierReducer = (state, action) => {
  switch (action.type) {
    case 'patch':
      return { ...state, ...action.payload };
    case 'beginDetailFetch':
      return {
        ...state,
        detailLoading: true,
        cadastralMaster: null,
        cadastralMismatches: {},
        compareDone: false,
      };
    case 'setCompareResult':
      return {
        ...state,
        cadastralMaster: action.master ?? null,
        cadastralMismatches: action.mismatches ?? {},
        compareDone: true,
      };
    case 'returnToList':
      return {
        ...state,
        view: 'list',
        cadastralMaster: null,
        cadastralMismatches: {},
        compareDone: false,
      };
    default:
      return state;
  }
};
