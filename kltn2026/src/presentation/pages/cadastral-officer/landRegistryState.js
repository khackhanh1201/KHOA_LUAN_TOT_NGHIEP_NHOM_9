export const API_BASE = 'http://localhost:8080/api';

export const getAuth = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const EMPTY_MANUAL_FORM = {
  landTypeId: '',
  areaId: '',
  parcelNumber: '',
  mapSheetNumber: '',
  areaSize: '',
  address: '',
  gcnBookNumber: '',
  certificateNumber: '',
};

export const LAND_REGISTRY_INITIAL_STATE = {
  view: 'list',
  allLandRecords: [],
  loading: false,
  error: null,
  searchQuery: '',
  selectedRecord: null,
  showPushDataModal: false,
  pushDataMethod: null,
  uploading: false,
  selectedExcelFile: null,
  uploadSuccess: false,
  showGcnPreview: false,
  downloadingGcnPdf: false,
  isEditing: false,
  saving: false,
  editForm: {},
  landTypes: [],
  areas: [],
  manualForm: { ...EMPTY_MANUAL_FORM },
};

export const landRegistryReducer = (state, action) => {
  switch (action.type) {
    case 'patch':
      return { ...state, ...action.payload };
    case 'patchEditForm':
      return { ...state, editForm: { ...state.editForm, ...action.payload } };
    case 'patchManualForm':
      return { ...state, manualForm: { ...state.manualForm, ...action.payload } };
    case 'openRecordDetail':
      return {
        ...state,
        selectedRecord: action.record,
        editForm: action.editForm,
        isEditing: false,
        view: 'detail',
      };
    case 'startEdit':
      return { ...state, editForm: action.editForm, isEditing: true };
    case 'cancelEdit':
      return { ...state, editForm: action.editForm, isEditing: false };
    case 'closePushModal':
      return {
        ...state,
        showPushDataModal: false,
        pushDataMethod: null,
        selectedExcelFile: null,
        uploadSuccess: false,
      };
    case 'resetManualForm':
      return { ...state, manualForm: { ...EMPTY_MANUAL_FORM } };
    default:
      return state;
  }
};

export const buildEditForm = (rec) => ({
  landTypeId: rec?.landTypeId ?? '',
  areaId: rec?.areaId ?? '',
  parcelNumber: rec?.parcelNumber ?? '',
  mapSheetNumber: rec?.mapSheetNumber ?? '',
  areaSize: rec?.areaSize ?? '',
  address: rec?.address ?? '',
  usageDuration: rec?.usageDuration ?? '',
  usageType: rec?.usageType ?? '',
  usageOrigin: rec?.usageOrigin ?? '',
  attachedHouse: rec?.attachedHouse ?? '',
  attachedOther: rec?.attachedOther ?? '',
  notes: rec?.notes ?? '',
});
