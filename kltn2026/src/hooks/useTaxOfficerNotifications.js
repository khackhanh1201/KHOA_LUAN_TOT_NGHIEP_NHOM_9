import { useState, useEffect, useCallback, useMemo } from 'react';
import { taxOfficerApi } from '../infrastructure/api/taxOfficerApi';
import { TAX_OFFICER_WORKLOAD_EVENT } from './useTaxOfficerWorkloadCount';

const READ_STORAGE_KEY = 'tax-officer-noti-read';

const loadReadIds = () => {
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
};

const saveReadIds = (set) => {
  localStorage.setItem(READ_STORAGE_KEY, JSON.stringify([...set]));
};

export const useTaxOfficerNotifications = (pollMs = 60000) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState(loadReadIds);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setItems([]);
      setLoading(false);
      return;
    }
    try {
      const list = await taxOfficerApi.getOfficerNotifications();
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Lỗi tải thông báo cán bộ thuế:', e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const onWorkload = () => refresh();
    window.addEventListener(TAX_OFFICER_WORKLOAD_EVENT, onWorkload);
    return () => {
      window.removeEventListener(TAX_OFFICER_WORKLOAD_EVENT, onWorkload);
    };
  }, [refresh]);

  useEffect(() => {
    if (pollMs <= 0) return undefined;
    const intervalId = setInterval(refresh, pollMs);
    return () => clearInterval(intervalId);
  }, [pollMs, refresh]);

  const notifications = useMemo(
    () =>
      items.map((n) => ({
        ...n,
        isRead: readIds.has(n.id),
      })),
    [items, readIds]
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markRead = useCallback(async (id) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveReadIds(next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(async () => {
    setReadIds((prev) => {
      const next = new Set(prev);
      items.forEach((n) => next.add(n.id));
      saveReadIds(next);
      return next;
    });
  }, [items]);

  return {
    notifications,
    unreadCount,
    loading,
    refresh,
    markRead,
    markAllRead,
  };
};
