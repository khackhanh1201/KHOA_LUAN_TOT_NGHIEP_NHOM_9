import { useState, useEffect, useCallback } from 'react';
import { taxOfficerApi } from '../infrastructure/api/taxOfficerApi';

export const TAX_OFFICER_WORKLOAD_EVENT = 'tax-officer-workload-changed';

export const notifyTaxOfficerWorkloadChanged = () => {
  window.dispatchEvent(new CustomEvent(TAX_OFFICER_WORKLOAD_EVENT));
};

export const useTaxOfficerWorkloadCount = (pollMs = 60000) => {
  const [pendingTaxRecords, setPendingTaxRecords] = useState(0);
  const [pendingComplaints, setPendingComplaints] = useState(0);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setPendingTaxRecords(0);
      setPendingComplaints(0);
      return { pendingTaxRecords: 0, pendingComplaints: 0 };
    }
    try {
      const data = await taxOfficerApi.getPendingWorkload();
      const records = Number(data?.pendingTaxRecords) || 0;
      const complaints = Number(data?.pendingComplaints) || 0;
      setPendingTaxRecords(records);
      setPendingComplaints(complaints);
      return { pendingTaxRecords: records, pendingComplaints: complaints };
    } catch {
      setPendingTaxRecords(0);
      setPendingComplaints(0);
      return { pendingTaxRecords: 0, pendingComplaints: 0 };
    }
  }, []);

  useEffect(() => {
    refresh();
    const onChanged = () => refresh();
    window.addEventListener(TAX_OFFICER_WORKLOAD_EVENT, onChanged);
    return () => {
      window.removeEventListener(TAX_OFFICER_WORKLOAD_EVENT, onChanged);
    };
  }, [refresh]);

  useEffect(() => {
    if (pollMs <= 0) return undefined;
    const intervalId = setInterval(refresh, pollMs);
    return () => clearInterval(intervalId);
  }, [pollMs, refresh]);

  const totalPending = pendingTaxRecords + pendingComplaints;

  return {
    pendingTaxRecords,
    pendingComplaints,
    totalPending,
    refresh,
  };
};
