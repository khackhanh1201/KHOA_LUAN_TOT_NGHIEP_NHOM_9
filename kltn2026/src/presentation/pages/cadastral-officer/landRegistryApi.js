import { getBearerAuthHeaders } from '../../../utils/authHeaders';
import { cadastralApi } from '../../../infrastructure/api/cadastralApi';
import { API_BASE, getAuth } from './landRegistryState';

export const fetchLandParcelsList = async () => {
  const res = await fetch(`${API_BASE}/land-parcels`, { headers: getAuth() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const records = Array.isArray(data) ? data : (data.data || data.content || []);
  const seen = new Set();
  return records.filter((rec) => {
    const id = rec.landParcelId ?? rec.id;
    if (id == null) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

export const fetchLandParcelDetail = async (recordId, fallbackRecord) => {
  if (!recordId) return fallbackRecord;
  const res = await fetch(`${API_BASE}/land-parcels/${recordId}`, { headers: getAuth() });
  if (!res.ok) return fallbackRecord;
  const detail = await res.json();
  return detail.data ?? detail;
};

export const importLandParcelsExcel = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/land-parcels/import`, {
    method: 'POST',
    headers: getBearerAuthHeaders(),
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Upload thất bại. Vui lòng kiểm tra file.');
  }
  return res.json().catch(() => ({}));
};

export const createLandParcel = (payload) => cadastralApi.createParcel(payload);

export const updateLandParcel = (id, payload) => cadastralApi.updateParcel(id, payload);

export const deleteLandParcel = (id) => cadastralApi.deleteParcel(id);
