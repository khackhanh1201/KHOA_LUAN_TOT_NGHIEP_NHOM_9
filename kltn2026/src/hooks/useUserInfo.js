import { useMemo } from 'react';
import { getCurrentUser } from '../usecases/authService';
import { useAsyncMountLoadWithReload } from './useAsyncMountLoad';

const API_BASE = 'http://localhost:8080/api';

const buildSessionUser = () => {
  const initial = getCurrentUser();
  return initial
    ? {
        fullName: initial.fullName || initial.name || 'Người dùng',
        citizenId: initial.cccdNumber || initial.citizenId || initial.userId,
        email: initial.email,
        phone: initial.phone || initial.phoneNumber,
        avatarInitial: (initial.fullName || 'U')[0].toUpperCase(),
      }
    : null;
};

const mapProfilePayload = (payload) => ({
  fullName: payload.fullName || payload.name || 'Người dùng',
  citizenId: payload.cccdNumber || payload.citizenId || payload.userId,
  phone: payload.phone || payload.phoneNumber,
  email: payload.email,
  address: payload.address || payload.provinceCity,
  dob: (() => {
    const raw = payload.dateOfBirth || payload.dob;
    if (!raw) return '';
    if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      const [y, m, d] = raw.split('-');
      return `${d}/${m}/${y}`;
    }
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? '' : parsed.toLocaleDateString('vi-VN');
  })(),
  avatarInitial: (payload.fullName || 'U')[0].toUpperCase(),
  roles: payload.roles,
  activeRole: payload.activeRole,
});

const loadUserProfile = async () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  await fetch(`${API_BASE}/profile/sync`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }).catch(() => null);

  const res = await fetch(`${API_BASE}/profile`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (res.ok) {
    const userData = await res.json();
    const payload = userData?.data || userData;
    return mapProfilePayload(payload);
  }

  throw new Error(`Profile API trả về ${res.status}`);
};

/**
 * Fetch profile chi tiết từ BE (có sync với VNeID).
 * Dùng cho các page Account/Profile cần thông tin đầy đủ
 * (dob, address, phone, …) ngoài fullName/role có sẵn ở session.
 *
 * @returns {{ user: object|null, loading: boolean, error: string|null, refetch: () => void }}
 */
export const useUserInfo = () => {
  const sessionUser = useMemo(() => buildSessionUser(), []);
  const { data: profile, error: loadError, isLoading, reload: refetch } =
    useAsyncMountLoadWithReload(loadUserProfile);

  const user = profile ?? sessionUser;
  const loading = isLoading && !sessionUser;
  const error = loadError?.message ?? null;

  return { user, loading, error, refetch };
};
