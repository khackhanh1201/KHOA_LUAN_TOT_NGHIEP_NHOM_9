/**
 * Định dạng mã hồ sơ thuế thống nhất với màn cán bộ thuế (TaxRecords, TaxProcessing).
 * Ví dụ: recordId=10, năm 2026 → T-2026-010
 */
export function formatTaxRecordCode(recordId, dateLike) {
  if (recordId == null || recordId === '') return '—';
  const year = dateLike
    ? new Date(dateLike).getFullYear()
    : new Date().getFullYear();
  return `T-${year}-${String(recordId).padStart(3, '0')}`;
}

/** Parse mã hồ sơ từ T-2026-010, HS-2026-010 hoặc số thuần. */
export function parseTaxRecordId(input) {
  if (input == null || input === '') return null;
  const s = String(input).trim();
  const prefixed = s.match(/(?:T|HS)-(\d{4})-(\d+)/i);
  if (prefixed) return parseInt(prefixed[2], 10);
  const digits = s.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : null;
}
