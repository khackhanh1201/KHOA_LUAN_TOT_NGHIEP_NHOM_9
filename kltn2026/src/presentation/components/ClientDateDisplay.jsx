import React from 'react';
import { useClientDateLabel, useTodayDateVi } from '../../hooks/useClientDateLabel';

/** Ngày/giờ vi-VN — chỉ render sau mount (tránh hydration mismatch). */
export function ClientViDateTime({ timestamp }) {
  const label = useClientDateLabel(timestamp);
  return <>{label || '\u00A0'}</>;
}

/** Ngày hôm nay vi-VN — chỉ render sau mount. */
export function ClientTodayVi() {
  const label = useTodayDateVi();
  return <>{label || '\u00A0'}</>;
}
