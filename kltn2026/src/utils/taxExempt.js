export const EXEMPT_STATUS_APPROVED = 'APPROVED';
export const EXEMPT_STATUS_PENDING = 'PENDING';

export const normalizeExemptStatus = (status) => String(status || '').toUpperCase();

/**
 * Miễn giảm đúng applied_year; APPROVED ưu tiên trước PENDING.
 */
export const findExemptionForYear = (list, year) => {
  const y = Number(year);
  const arr = (Array.isArray(list) ? list : []).filter((e) => {
    const s = normalizeExemptStatus(e.status);
    return s === EXEMPT_STATUS_APPROVED || s === EXEMPT_STATUS_PENDING;
  });
  return (
    arr.find(
      (e) => Number(e.appliedYear) === y && normalizeExemptStatus(e.status) === EXEMPT_STATUS_APPROVED
    ) ||
    arr.find(
      (e) => Number(e.appliedYear) === y && normalizeExemptStatus(e.status) === EXEMPT_STATUS_PENDING
    ) ||
    null
  );
};

export const formatExemptionStatusLabel = (status) => {
  const s = normalizeExemptStatus(status);
  if (s === EXEMPT_STATUS_APPROVED) return 'Đã duyệt';
  if (s === EXEMPT_STATUS_PENDING) return 'Chờ duyệt';
  return status || '—';
};
