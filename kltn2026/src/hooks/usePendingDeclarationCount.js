import { useState, useEffect, useCallback } from 'react';
import { countPendingDeclarations } from '../utils/declarationStatus';

const API_BASE = 'http://localhost:8080/api';
const PENDING_DECLARATIONS_EVENT = 'pending-declarations-changed';

export const notifyPendingDeclarationsChanged = (count) => {
  window.dispatchEvent(
    new CustomEvent(PENDING_DECLARATIONS_EVENT, { detail: { count } })
  );
};

export const usePendingDeclarationCount = () => {
  const [pendingCount, setPendingCount] = useState(0);

  const refreshPendingCount = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setPendingCount(0);
      return 0;
    }
    try {
      const res = await fetch(`${API_BASE}/tax/declarations/my-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return 0;
      const json = await res.json();
      const raw = Array.isArray(json) ? json : json?.data || [];
      const next = countPendingDeclarations(raw);
      setPendingCount(next);
      return next;
    } catch {
      setPendingCount(0);
      return 0;
    }
  }, []);

  useEffect(() => {
    refreshPendingCount();

    const onChanged = (e) => {
      if (typeof e.detail?.count === 'number') {
        setPendingCount(e.detail.count);
      } else {
        refreshPendingCount();
      }
    };
    window.addEventListener(PENDING_DECLARATIONS_EVENT, onChanged);
    return () => window.removeEventListener(PENDING_DECLARATIONS_EVENT, onChanged);
  }, [refreshPendingCount]);

  return { pendingCount, refreshPendingCount };
};
