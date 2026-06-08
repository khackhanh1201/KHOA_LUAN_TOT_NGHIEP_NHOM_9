import { useSyncExternalStore } from 'react';

function emptySubscribe() {
  return () => {};
}

function formatViDateTime(timestamp) {
  const d = new Date(timestamp);
  return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
}

/** Định dạng ngày/giờ vi-VN — client-only, không flicker khi hydrate. */
export function useClientDateLabel(timestamp) {
  return useSyncExternalStore(
    emptySubscribe,
    () => formatViDateTime(timestamp),
    () => '',
  );
}

/** Ngày hôm nay vi-VN — client-only. */
export function useTodayDateVi() {
  return useSyncExternalStore(
    emptySubscribe,
    () => new Date().toLocaleDateString('vi-VN'),
    () => '',
  );
}
