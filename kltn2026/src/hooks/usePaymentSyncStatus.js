import { useSyncExternalStore, useRef } from 'react';

const API_BASE = 'http://localhost:8080/api';
const PENDING = Symbol('usePaymentSyncStatus.pending');

const MISSING_PAY_ID = {
  status: 'error',
  message: 'Thiếu mã hóa đơn (payId). Vui lòng quay lại trang thanh toán.',
};

const syncOnce = async (payId) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/payments/${payId}/sync-status`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json().catch(() => ({}));
};

const startPolling = (payId, navigate, onUpdate) => {
  let cancelled = false;
  const maxAttempts = 12;

  const poll = async (attempt) => {
    if (cancelled) return;
    if (attempt >= maxAttempts) {
      onUpdate({
        status: 'warning',
        message:
          'PayOS có thể đã nhận tiền nhưng hệ thống chưa cập nhật. Vào trang Thanh toán và bấm "Tải lại trạng thái".',
      });
      return;
    }
    try {
      const json = await syncOnce(payId);
      if (json.paymentStatus === 'PAID') {
        onUpdate({
          status: 'success',
          message: 'Thanh toán thành công! Hóa đơn đã được cập nhật.',
        });
        setTimeout(() => navigate('/payment', { replace: true }), 2000);
        return;
      }
      onUpdate({
        status: 'loading',
        message: `Đang chờ xác nhận... (PayOS: ${json.payosStatus || '—'}, lần ${attempt + 1}/${maxAttempts})`,
      });
    } catch (err) {
      onUpdate({ status: 'loading', message: `Lỗi đồng bộ: ${err.message}` });
    }
    if (!cancelled) {
      setTimeout(() => poll(attempt + 1), 5000);
    }
  };

  poll(0);
  return () => {
    cancelled = true;
  };
};

const missingPayIdStore = {
  subscribe() {
    return () => {};
  },
  getSnapshot() {
    return MISSING_PAY_ID;
  },
};

export function usePaymentSyncStatus(payId, navigate) {
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  const keyRef = useRef(null);
  const storeRef = useRef(missingPayIdStore);
  const cancelRef = useRef(null);

  if (keyRef.current !== payId) {
    if (cancelRef.current) cancelRef.current();
    keyRef.current = payId;

    if (!payId) {
      storeRef.current = missingPayIdStore;
    } else {
      let snapshot = PENDING;
      const listeners = new Set();

      storeRef.current = {
        subscribe(onStoreChange) {
          listeners.add(onStoreChange);
          if (snapshot === PENDING) {
            snapshot = {
              status: 'loading',
              message: 'Đang xác nhận thanh toán với PayOS...',
            };
            cancelRef.current = startPolling(
              payId,
              (path, opts) => navigateRef.current(path, opts),
              (next) => {
                snapshot = next;
                listeners.forEach((l) => l());
              }
            );
          }
          return () => listeners.delete(onStoreChange);
        },
        getSnapshot() {
          return snapshot;
        },
      };
    }
  }

  const snapshot = useSyncExternalStore(
    storeRef.current.subscribe,
    storeRef.current.getSnapshot,
    () => PENDING
  );

  if (snapshot === PENDING) {
    return { status: 'loading', message: 'Đang xác nhận thanh toán với PayOS...' };
  }
  return snapshot;
}
