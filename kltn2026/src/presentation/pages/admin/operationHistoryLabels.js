/** Bước xử lý (processing_logs.processing_step) — khớp mã DB. */
export const PROCESSING_STEP_LABELS = {
  APPROVE: 'Phê duyệt hồ sơ',
  REJECT: 'Từ chối hồ sơ',
  RECEIVE: 'Tiếp nhận hồ sơ (cán bộ thuế)',
  REJECT_CADASTRAL_FRAUD: 'Từ chối do không khớp sổ địa chính',
  RECONCILE_ADJUST: 'Điều chỉnh đối soát thanh toán',
  VERIFY_CADASTRAL: 'Tiếp nhận & xác minh địa chính',
  RECEIVE_TAX: 'Tiếp nhận hồ sơ (cán bộ thuế)',
  APPROVE_TAX: 'Phê duyệt hồ sơ thuế',
  PAYMENT_SUCCESS: 'Thanh toán thuế thành công',
  // Nên thêm luôn alias khớp code BE hiện tại (log mới)
  APPROVE: 'Phê duyệt hồ sơ',
  RECEIVE: 'Tiếp nhận hồ sơ (cán bộ thuế)',
  REJECT: 'Từ chối hồ sơ',
  REJECT_CADASTRAL_FRAUD: 'Từ chối do không khớp sổ địa chính',
  RECONCILE_ADJUST: 'Điều chỉnh đối soát thanh toán',
};

export const mapProcessingStepLabel = (step) => {
  const key = String(step || '').trim().toUpperCase();
  if (!key || key === 'KHÔNG RÕ') return 'Không rõ';
  return PROCESSING_STEP_LABELS[key] || step || 'Không rõ';
};

/** Trạng thái hồ sơ (records.current_status) — khớp DB. */
export const RECORD_STATUS_LABELS = {
  SUBMITTED: 'Chờ xác minh',
  PENDING: 'Chờ xử lý',
  VERIFIED: 'Đã xác minh',
  PROCESSING: 'Đang xử lý',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  CANCELLED: 'Đã hủy',
  COMPLETED: 'Hoàn tất',
  FRAUD_SUSPECTED: 'Nghi gian lận',
  NEED_MORE_DOCS: 'Bổ sung hồ sơ',
  WARNING_FRAUD: 'Cảnh báo gian lận',
  VERIFY_CADASTRAL: 'Tiếp nhận & xác minh địa chính',
  RECEIVE_TAX: 'Tiếp nhận hồ sơ (cán bộ thuế)',
  APPROVE_TAX: 'Phê duyệt hồ sơ thuế',
  PAYMENT_SUCCESS: 'Thanh toán thuế thành công',
  // Nên thêm luôn alias khớp code BE hiện tại (log mới)
  APPROVE: 'Phê duyệt hồ sơ',
  RECEIVE: 'Tiếp nhận hồ sơ (cán bộ thuế)',
  REJECT: 'Từ chối hồ sơ',
  REJECT_CADASTRAL_FRAUD: 'Từ chối do không khớp sổ địa chính',
  RECONCILE_ADJUST: 'Điều chỉnh đối soát thanh toán',
};

export const mapRecordStatusLabel = (status) => {
  const key = String(status || '').trim().toUpperCase();
  if (!key) return '—';
  return RECORD_STATUS_LABELS[key] || status;
};

export const formatStatusChangeLabel = (oldStatus, newStatus) => {
  const parts = [oldStatus, newStatus].filter(Boolean);
  if (parts.length === 0) return '—';
  return parts.map(mapRecordStatusLabel).join(' → ');
};
