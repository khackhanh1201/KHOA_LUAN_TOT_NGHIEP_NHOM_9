/** Nhãn phường/xã mặc định (bổ sung khi API areas không có tên hiển thị). */
const DEFAULT_WARD_LABELS = {
  W_THANH_LIET: 'Xã Thanh Liệt',
  W01: 'Phường Phố Huế',
  W02: 'Phường Hàng Bài',
  W03: 'Phường Kim Mã',
  W04: 'Phường Đội Cấn',
  W05: 'Phường Dịch Vọng',
  W06: 'Phường Mai Dịch',
  W07: 'Phường Nguyễn Trãi',
  W08: 'Phường Khương Trung',
  W09: 'Phường Tây Mỗ',
  W10: 'Phường Mễ Trì',
  D_THANH_TRI: 'Huyện Thanh Trì',
};

const DEFAULT_DISTRICT_LABELS = {
  '001': 'Thành phố Hà Nội',
  D_THANH_TRI: 'Huyện Thanh Trì',
};

/** ward_code dạng 00001, 00009… trong DB là mã nội bộ, không phải mã hành chính. */
const isInternalNumericCode = (code) => /^0+\d+$/.test(String(code || ''));

const WARD_NAME_FROM_STREET = {
  'Thanh Liệt': 'Xã Thanh Liệt',
  'Kim Giang': 'Xã Kim Giang',
  'Tựu Liệt': 'Xã Tựu Liệt',
};

const humanizeAreaCode = (code) => {
  if (!code) return '';
  return code
    .replace(/^(W_|D_)/i, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export const buildWardLabelMap = (areas = []) => {
  const map = { ...DEFAULT_WARD_LABELS };
  areas.forEach((a) => {
    if (a.wardCode && !map[a.wardCode] && !isInternalNumericCode(a.wardCode)) {
      map[a.wardCode] = humanizeAreaCode(a.wardCode);
    }
    if (a.districtCode && !map[a.districtCode] && !isInternalNumericCode(a.districtCode)) {
      map[a.districtCode] = humanizeAreaCode(a.districtCode);
    }
  });
  return map;
};

export const buildDistrictLabelMap = (areas = []) => {
  const map = { ...DEFAULT_DISTRICT_LABELS };
  areas.forEach((a) => {
    if (a.districtCode && !map[a.districtCode] && !isInternalNumericCode(a.districtCode)) {
      map[a.districtCode] = humanizeAreaCode(a.districtCode);
    }
  });
  return map;
};

export const formatWardLabel = (code, labelMap = DEFAULT_WARD_LABELS) =>
  labelMap[code] || humanizeAreaCode(code) || code || '—';

const formatDistrictLabel = (code, labelMap = DEFAULT_DISTRICT_LABELS) =>
  labelMap[code] || humanizeAreaCode(code) || code || '—';

/** Nhãn phường/xã từ bản ghi area (ưu tiên tên địa danh, không hiện mã nội bộ). */
export const formatAreaWardLabel = (area, labelMap = DEFAULT_WARD_LABELS) => {
  if (!area) return '—';
  const { wardCode, streetName } = area;
  if (wardCode && labelMap[wardCode] && !isInternalNumericCode(wardCode)) {
    return labelMap[wardCode];
  }
  if (streetName) {
    return WARD_NAME_FROM_STREET[streetName] || `Phường ${streetName}`;
  }
  return formatWardLabel(wardCode, labelMap);
};

/** Nhãn quận/huyện từ bản ghi area. */
export const formatAreaDistrictLabel = (area, labelMap = DEFAULT_DISTRICT_LABELS) => {
  if (!area) return '—';
  return formatDistrictLabel(area.districtCode, labelMap);
};

/** Nhãn option dropdown chọn khu vực. */
export const formatAreaOptionLabel = (area) => {
  if (!area) return '—';
  return `${area.streetName} — Vị trí ${area.positionLevel}`;
};

/** Khu vực quản lý: nhóm theo vị trí, hiển thị tên tuyến đường. */
export const formatManagedAreas = (areas = []) => {
  if (!areas.length) return '—';

  const byLevel = areas.reduce((acc, area) => {
    const level = area.positionLevel ?? 0;
    if (!acc[level]) acc[level] = [];
    if (area.streetName) acc[level].push(area.streetName);
    return acc;
  }, {});

  const parts = Object.keys(byLevel)
    .sort((a, b) => Number(a) - Number(b))
    .map((level) => `Vị trí ${level}: ${byLevel[level].join(', ')}`);

  return parts.join(' · ') || '—';
};

/** Khớp bộ lọc khiếu nại cán bộ địa chính trên BE (ComplaintService type=LAND). */
const isLandComplaint = (item) => {
  const cat = item?.recordCategory;
  return !cat || !['TAX_DECLARATION', 'TAX'].includes(cat);
};
