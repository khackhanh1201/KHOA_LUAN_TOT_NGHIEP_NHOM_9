import { getJsonAuthHeaders, getBearerAuthHeaders } from '../../utils/authHeaders';

const API_BASE = 'http://localhost:8080/api';

const getAuthHeaders = () => getJsonAuthHeaders();

const handleResponse = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || `HTTP ${res.status}`);
  }
  return res.json();
};

const toArray = (json) => (Array.isArray(json) ? json : json?.data ?? []);

export const userApi = {
  // ─── Profile ─────────────────────────────────────────────────────────────
  syncProfile: () =>
    fetch(`${API_BASE}/profile/sync`, { method: 'POST', headers: getAuthHeaders() })
      .then(handleResponse),

  // ─── Land Parcels ─────────────────────────────────────────────────────────
  getMyLandParcels: () =>
    fetch(`${API_BASE}/land-parcels/my-parcels`, { headers: getAuthHeaders() })
      .then(handleResponse)
      .then(toArray),

  searchParcels: ({ mapSheet, parcelNumber } = {}) => {
    const params = new URLSearchParams();
    if (mapSheet) params.append('mapSheet', mapSheet);
    if (parcelNumber) params.append('parcelNumber', parcelNumber);
    return fetch(`${API_BASE}/land-parcels/search?${params}`, { headers: getAuthHeaders() })
      .then(handleResponse)
      .then(toArray);
  },

  // ─── Tax Declarations ─────────────────────────────────────────────────────
  submitDeclaration: ({ parcelId, attachmentIds = [] }) =>
    fetch(`${API_BASE}/tax/declarations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ parcelId: Number(parcelId), attachmentIds }),
    }).then(handleResponse),

  getMyDeclarations: () =>
    fetch(`${API_BASE}/tax/declarations/my-history`, { headers: getAuthHeaders() })
      .then(handleResponse)
      .then(toArray),

  getDeclarationById: (id) =>
    fetch(`${API_BASE}/tax/declarations/${id}`, { headers: getAuthHeaders() })
      .then(handleResponse),

  cancelDeclaration: (id) =>
    fetch(`${API_BASE}/tax/declarations/${id}/cancel`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // ─── Tax Bills ────────────────────────────────────────────────────────────
  getUnpaidBills: () =>
    fetch(`${API_BASE}/tax/bills/unpaid`, { headers: getAuthHeaders() })
      .then(handleResponse)
      .then(toArray),

  getPaidBills: () =>
    fetch(`${API_BASE}/tax/bills/paid`, { headers: getAuthHeaders() })
      .then(handleResponse)
      .then(toArray),

  // ─── Payments ────────────────────────────────────────────────────────────
  createPaymentLink: (billId) =>
    fetch(`${API_BASE}/payments/${billId}/create-link`, {
      method: 'POST',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  downloadReceipt: (billId) =>
    fetch(`${API_BASE}/payments/${billId}/receipt`, { headers: getAuthHeaders() }),

  // ─── Complaints ──────────────────────────────────────────────────────────
  submitComplaint: (data) =>
    fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  getMyComplaints: () =>
    fetch(`${API_BASE}/complaints/my`, { headers: getAuthHeaders() })
      .then(handleResponse)
      .then(toArray),

  submitComplaintSupplement: (complaintId, additionalNote, attachmentIds = []) =>
    fetch(`${API_BASE}/complaints/${complaintId}/supplement`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ additionalNote, attachmentIds }),
    }).then(handleResponse),

  // ─── Notifications ────────────────────────────────────────────────────────
  getMyNotifications: () =>
    fetch(`${API_BASE}/notifications/me`, { headers: getAuthHeaders() })
      .then(handleResponse).then(toArray),
  
  getUnreadNotificationCount: () =>
    fetch(`${API_BASE}/notifications/me/unread-count`, { headers: getAuthHeaders() })
      .then(handleResponse)
      .then(data => data.count ?? 0),
  
  markNotificationRead: (notiId) =>
    fetch(`${API_BASE}/notifications/${notiId}/read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    }).then(handleResponse),
  
  markAllNotificationsRead: () =>
    fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    }).then(handleResponse),
    getMyRecordsForComplaint: () =>
      fetch(`${API_BASE}/tax/declarations/my-history`, { headers: getAuthHeaders() })
        .then(handleResponse)
        .then(toArray),

  // ─── File Upload ─────────────────────────────────────────────────────────
  uploadFile: (file, relatedEntityType, relatedEntityId) => {
    const formData = new FormData();
    formData.append('file', file);
    if (relatedEntityType) formData.append('relatedEntityType', relatedEntityType);
    if (relatedEntityId != null) formData.append('relatedEntityId', String(relatedEntityId));
    return fetch(`${API_BASE}/files/upload`, {
      method: 'POST',
      headers: getBearerAuthHeaders(),
      body: formData,
    }).then(handleResponse);
  },
};
