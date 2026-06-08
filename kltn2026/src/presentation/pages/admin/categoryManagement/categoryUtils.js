import { getToken } from '../../../../usecases/authService';

export const APPLIED_YEAR = 2026;
export const BASE_URL = 'http://localhost:8080'; // Cập nhật port backend của bạn

export const STATUS_LABELS = {
  APPROVED: { text: 'Đã duyệt', className: 'bg-success bg-opacity-10 text-success' },
  PENDING: { text: 'Chờ duyệt', className: 'bg-warning bg-opacity-10 text-warning' },
  REJECTED: { text: 'Từ chối', className: 'bg-danger bg-opacity-10 text-danger' },
};

export const loadRegions = async () => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/api/master-data/areas`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) {
    const data = await res.json();
    return data.data || data;
  }
  return [];
};

export const loadExemptions = async () => {
  const token = getToken();
  const res = await fetch(
    `${BASE_URL}/api/tax/exemptions?applied_year=${APPLIED_YEAR}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (res.ok) {
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }
  return [];
};

export const initialState = {
  regionsOverride: null,
  exemptionsOverride: null,
  isUploading: false,
  uploadMessage: null,
  isExemptModalOpen: false,
  isConfigModalOpen: false,
  selectedRegion: null,
  exemptSearch: '',
  exemptType: 'Tất cả lý do miễn giảm',
  editLandQuota: '',
};

export const categoryManagementReducer = (state, action) => {
  switch (action.type) {
    case 'patch':
      return { ...state, ...action.payload };
    case 'openExemptModal':
      return { ...state, isExemptModalOpen: true };
    case 'closeExemptModal':
      return { ...state, isExemptModalOpen: false };
    case 'openConfigModal':
      return {
        ...state,
        selectedRegion: action.region,
        editLandQuota: action.landQuota,
        isConfigModalOpen: true,
      };
    case 'closeConfigModal':
      return { ...state, isConfigModalOpen: false };
    default:
      return state;
  }
};
