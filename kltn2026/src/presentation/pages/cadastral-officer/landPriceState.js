import { getJsonAuthHeaders } from '../../../utils/authHeaders';

export const API_BASE = 'http://localhost:8080/api';

export const getAuth = () => getJsonAuthHeaders();

export const loadMasterData = async () => {
  const [resTypes, resAreas] = await Promise.all([
    fetch(`${API_BASE}/master-data/land-types`, { headers: getAuth() }),
    fetch(`${API_BASE}/master-data/areas`, { headers: getAuth() }),
  ]);
  let masterLandTypes = [];
  let masterAreas = [];
  if (resTypes.ok) {
    const typesData = await resTypes.json();
    masterLandTypes = typesData.data || [];
  }
  if (resAreas.ok) {
    const areasData = await resAreas.json();
    masterAreas = areasData.data || [];
  }
  return { masterLandTypes, masterAreas };
};

const EMPTY_CREATE_FORM = {
  landTypeId: '',
  areaId: '',
  unitPrice: '',
  appliedFrom: '',
  decisionReference: '',
};

export const LAND_PRICE_INITIAL_STATE = {
  view: 'list',
  landPrices: [],
  loading: false,
  searchTerm: '',
  selectedRecord: null,
  attachmentPreview: null,
  priceHistory: [],
  historyLoading: false,
  createForm: { ...EMPTY_CREATE_FORM },
  decisionFile: null,
  priceDocuments: [],
  creating: false,
  exporting: false,
};

export const landPriceReducer = (state, action) => {
  switch (action.type) {
    case 'patch':
      return { ...state, ...action.payload };
    case 'patchCreateForm':
      return { ...state, createForm: { ...state.createForm, ...action.payload } };
    case 'openDetail':
      return {
        ...state,
        selectedRecord: action.record,
        attachmentPreview: null,
        priceHistory: [],
        priceDocuments: [],
        view: 'detail',
      };
    case 'resetCreateForm':
      return {
        ...state,
        createForm: { ...EMPTY_CREATE_FORM },
        decisionFile: null,
      };
    default:
      return state;
  }
};
