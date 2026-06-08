/** Nhãn tiếng Việt cho từng trường sai lệch — khớp BE CadastralCompareService. */
export const CADASTRAL_MISMATCH_LABELS = {
  areaSize: 'Diện tích khai báo không khớp với sổ địa chính',
  parcelNumber: 'Số thửa không khớp với sổ địa chính',
  mapSheetNumber: 'Số tờ bản đồ không khớp với sổ địa chính',
  landTypeId: 'Loại đất không khớp với sổ địa chính',
  address: 'Địa chỉ không khớp với sổ địa chính',
  owner: 'Chủ sở hữu không khớp với sổ địa chính',
  parcelLink: 'Liên kết thửa đất không khớp với sổ địa chính',
  gcnNotFound: 'Không tìm thấy thửa trên sổ theo số GCN',
};

export const buildMismatchMessage = (mismatches, { prefix = '', suffix = '' } = {}) => {
  const lines = Object.keys(mismatches || {})
    .filter((k) => mismatches[k])
    .map((k) => CADASTRAL_MISMATCH_LABELS[k] || k);
  if (lines.length === 0) return '';
  const body = lines.map((l) => `• ${l}`).join('\n');
  return `${prefix}${body}${suffix}`;
};

/** Ưu tiên danh sách message từ BE, fallback map FE. */
export const formatMismatchFromResponse = (data) => {
  if (Array.isArray(data?.mismatchMessages) && data.mismatchMessages.length > 0) {
    return data.mismatchMessages.map((m) => `• ${m}`).join('\n');
  }
  if (data?.mismatchSummary) return data.mismatchSummary;
  return buildMismatchMessage(data?.mismatches);
};
