import { useState, useEffect, useCallback } from 'react';
import { cadastralApi } from '../infrastructure/api/cadastralApi';

export const CADASTRAL_WORKLOAD_EVENT = 'cadastral-workload-changed';

export const notifyCadastralWorkloadChanged = () => {
  window.dispatchEvent(new CustomEvent(CADASTRAL_WORKLOAD_EVENT));
};

export const useCadastralWorkloadCount = (pollMs = 60000) => {
  const [pendingRecords, setPendingRecords] = useState(0);
  const [pendingComplaints, setPendingComplaints] = useState(0);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setPendingRecords(0);
      setPendingComplaints(0);
      return { pendingRecords: 0, pendingComplaints: 0 };
    }
    try {
      const data = await cadastralApi.getPendingWorkload();
      const records = Number(data?.pendingRecords) || 0;
      const complaints = Number(data?.pendingComplaints) || 0;
      setPendingRecords(records);
      setPendingComplaints(complaints);
      return { pendingRecords: records, pendingComplaints: complaints };
    } catch {
      setPendingRecords(0);
      setPendingComplaints(0);
      return { pendingRecords: 0, pendingComplaints: 0 };
    }
  }, []);

  useEffect(() => {
    refresh();
    const onChanged = () => refresh();
    window.addEventListener(CADASTRAL_WORKLOAD_EVENT, onChanged);
    return () => {
      window.removeEventListener(CADASTRAL_WORKLOAD_EVENT, onChanged);
    };
  }, [refresh]);

  useEffect(() => {
    if (pollMs <= 0) return undefined;
    const intervalId = setInterval(refresh, pollMs);
    return () => clearInterval(intervalId);
  }, [pollMs, refresh]);

  const totalPending = pendingRecords + pendingComplaints;

  return {
    pendingRecords,
    pendingComplaints,
    totalPending,
    refresh,
  };
};
