export const API_BASE = 'http://localhost:8080/api';

export const loadTaxOfficerRecords = async () => {
  const res = await fetch(`${API_BASE}/tax/records`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  if (!res.ok) throw new Error('Không thể tải dữ liệu');
  const json = await res.json();
  return Array.isArray(json) ? json : (json?.data || []);
};

export const initialState = {
  localRecords: null,
  search: '',
  showAdvanced: false,
  advFilters: { code: '', name: '', cccd: '', address: '' },
  selectedRecord: null,
  showDetail: false,
  showExportOptions: false,
  showPreview: false,
  exportFormat: 'PDF',
  isEditing: false,
  editValues: {},
  showHistory: false,
  loadingDetail: false,
  detailError: '',
};

export const taxRecordsReducer = (state, action) => {
  switch (action.type) {
    case 'patch':
      return { ...state, ...action.payload };
    case 'startEdit':
      return {
        ...state,
        isEditing: true,
        editValues: action.editValues,
      };
    case 'cancelEdit':
      return { ...state, isEditing: false, detailError: '' };
    case 'closeDetail':
      return {
        ...state,
        isEditing: false,
        showDetail: false,
        selectedRecord: null,
        detailError: '',
      };
    case 'openExport':
      return { ...state, selectedRecord: action.record, showExportOptions: true };
    case 'resetFilters':
      return {
        ...state,
        advFilters: { code: '', name: '', cccd: '', address: '' },
        search: '',
      };
    case 'closeExportModals':
      return { ...state, showExportOptions: false, showPreview: false };
    default:
      return state;
  }
};

export const fetchDeclarationDetail = async (record, dispatch) => {
  dispatch({ type: 'patch', payload: { loadingDetail: true } });
  try {
    const detailData = {
      recordId: record.recordId,
      fullName: record.fullName,
      senderCccd: record.senderCccd,
      address: record.address,
      landParcelNumber: record.landParcelNumber,
      mapSheetNumber: record.mapSheetNumber,
      area: record.area,
      landType: record.landType,
      taxType: record.taxType,
      calculatedTaxAmount: record.calculatedTaxAmount,
      landAddress: record.landAddress,
    };

    dispatch({ type: 'patch', payload: { selectedRecord: detailData } });
  } catch (err) {
    console.error('Lỗi map dữ liệu:', err);
  } finally {
    dispatch({ type: 'patch', payload: { loadingDetail: false } });
  }
};
