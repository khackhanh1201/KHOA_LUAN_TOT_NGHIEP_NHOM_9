const API_BASE = 'http://localhost:8080/api';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const handleResponse = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
};

export const taxOfficerApi = {
  getOfficerNotifications: () =>
    fetch(`${API_BASE}/tax/officer-notifications`, { headers: getAuthHeaders() }).then(
      handleResponse
    ),

  getPendingWorkload: () =>
    fetch(`${API_BASE}/tax/pending-workload`, { headers: getAuthHeaders() }).then(
      handleResponse
    ),

  receiveTaxRecord: (recordId) =>
    fetch(`${API_BASE}/tax/records/${recordId}/receive`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    }).then(handleResponse),
};
