import { useState, useEffect, useCallback } from 'react';
import { userApi } from '../infrastructure/api/userApi';

export function useNotifications(pollMs = 30000) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [list, count] = await Promise.all([
        userApi.getMyNotifications(),
        userApi.getUnreadNotificationCount(),
      ]);
      setNotifications(Array.isArray(list) ? list : []);
      setUnreadCount(Number(count) || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const onChanged = () => refresh();
    window.addEventListener('notifications-changed', onChanged);
    return () => {
      window.removeEventListener('notifications-changed', onChanged);
    };
  }, [refresh]);

  useEffect(() => {
    if (pollMs <= 0) return undefined;
    const timer = setInterval(refresh, pollMs);
    return () => clearInterval(timer);
  }, [pollMs, refresh]);

  const markRead = async (notiId) => {
    await userApi.markNotificationRead(notiId);
    await refresh();
  };

  const markAllRead = async () => {
    await userApi.markAllNotificationsRead();
    await refresh();
  };

  return { notifications, unreadCount, loading, refresh, markRead, markAllRead };
}