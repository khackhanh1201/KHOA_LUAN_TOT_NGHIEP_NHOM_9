import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:8080/api';

const formatDob = (value) => {
  if (!value) return '—';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString('vi-VN');
};

const mapProfileToUserInfo = (userData) => ({
  fullName: userData.fullName || userData.name || 'Người dùng',
  citizenId: userData.cccdNumber || userData.citizenId || '—',
  phone: userData.phone || userData.phoneNumber || '—',
  email: userData.email || '—',
  address: userData.address || userData.provinceCity || '—',
  dob: formatDob(userData.dateOfBirth || userData.dob),
  avatarInitial: (userData.fullName || userData.name || 'U')[0].toUpperCase(),
});

export function useAccountProfile() {
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState('');
  const [isRefetching, setIsRefetching] = useState(false);

  const loading = (userInfo === null && !error) || isRefetching;

  const fetchUserInfo = useCallback(async ({ refetch = false } = {}) => {
    try {
      if (refetch) setIsRefetching(true);
      setError('');
      const token = localStorage.getItem('token');

      await fetch(`${API_BASE}/profile/sync`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).catch(() => {});

      const res = await fetch(`${API_BASE}/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Không thể lấy thông tin tài khoản');

      const userData = await res.json();
      setUserInfo(mapProfileToUserInfo(userData));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Không thể tải thông tin tài khoản');
    } finally {
      if (refetch) setIsRefetching(false);
    }
  }, []);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  return {
    userInfo,
    loading,
    error,
    refetch: () => fetchUserInfo({ refetch: true }),
  };
};
