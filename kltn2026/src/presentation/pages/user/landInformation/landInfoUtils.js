const API_BASE = 'http://localhost:8080/api';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const LAND_TYPE_LABELS = {
  ODT: 'Đất ở tại đô thị',
  ONT: 'Đất ở tại nông thôn',
  LUC: 'Đất chuyên trồng lúa nước',
  BHK: 'Đất bằng trồng cây hàng năm khác',
  CLN: 'Đất trồng cây lâu năm',
  RSX: 'Đất rừng sản xuất',
  NTS: 'Đất nuôi trồng thủy sản',
  SKC: 'Đất cơ sở sản xuất phi nông nghiệp',
  TMD: 'Đất thương mại, dịch vụ',
  DNL: 'Đất công trình năng lượng',
};

export const decodeJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return {};
  }
};

export const loadMyParcels = async () => {
  const res = await fetch(`${API_BASE}/land-parcels/my-parcels`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = await res.json();
  const raw = Array.isArray(json) ? json : (json.data || []);

  return raw.map((item) => ({
    ...item,
    parcelId: item.landParcelId || item.land_parcel_id,
    parcelNumber: item.parcelNumber || item.parcel_number,
    mapSheetNumber: item.mapSheetNumber || item.map_sheet_number,
    areaSize: item.areaSize || item.area_size,
    usageDuration: item.usageDuration || item.usage_duration,
    usageType: item.usageType || item.usage_type,
    usageOrigin: item.usageOrigin || item.usage_origin,
    address: item.address,
    certificateNumber: item.certificateNumber || item.certificate_number,
    gcnBookNumber: item.gcnBookNumber || item.gcn_book_number,
    attachedHouse: item.attachedHouse || item.attached_house,
    attachedOther: item.attachedOther || item.attached_other,
    landInfoPdf: item.landInfoPdf || item.land_info_pdf,
    notes: item.notes,
    landTypeId: item.typeId || item.type_id || item.landTypeId,
    landTypeName: item.typeName || item.type_name || item.landTypeName,
  }));
};

export const getLandTypeLabel = (code) => LAND_TYPE_LABELS[code] || code || '—';
