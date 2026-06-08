const norm = (v) => String(v ?? '').trim().toLowerCase();

/**
 * So khớp dữ liệu tờ khai (declared) với sổ địa chính (master).
 */
export function compareCadastral(declared, master, recordOwner, options = {}) {
  const skipOwnerCheck = options.skipOwnerCheck === true;
  const mismatches = {};
  const flag = (key, ok) => {
    if (!ok) mismatches[key] = true;
  };

  flag('parcelNumber', norm(declared.parcelNumber) === norm(master.parcelNumber));
  flag('mapSheetNumber', norm(declared.mapSheetNumber) === norm(master.mapSheetNumber));

  const dArea = Number(declared.area ?? declared.declaredArea);
  const mArea = Number(master.areaSize);
  flag(
    'areaSize',
    !Number.isNaN(dArea) &&
      !Number.isNaN(mArea) &&
      Math.abs(dArea - mArea) < 0.01
  );

  const dType = norm(
    declared.landTypeName || declared.landType || declared.declaredUsage
  );
  const mType = norm(master.landTypeName || master.usageType);
  const dTypeId = declared.landTypeId != null ? Number(declared.landTypeId) : null;
  const mTypeId = master.landTypeId != null ? Number(master.landTypeId) : null;
  flag(
    'landTypeId',
    (dTypeId != null && mTypeId != null && dTypeId === mTypeId) ||
      dType === mType ||
      (dType && mType && (dType.includes(mType) || mType.includes(dType)))
  );

  flag('address', norm(declared.address) === norm(master.address));

  if (!skipOwnerCheck) {
    const owners = master.owners || [];
    const ownerOk = owners.some(
      (o) =>
        Number(o.citizenId) === Number(recordOwner.citizenId) ||
        norm(o.cccdNumber) === norm(recordOwner.cccd)
    );
    flag('owner', ownerOk);
  }

  if (
    !options.skipOwnerCheck &&
    master.landParcelId != null &&
    declared.linkedParcelId != null &&
    Number(declared.linkedParcelId) !== Number(master.landParcelId)
  ) {
    mismatches.parcelLink = true;
    mismatches.parcelNumber = true;
    mismatches.mapSheetNumber = true;
  }

  return {
    mismatches,
    hasMismatch: Object.keys(mismatches).length > 0,
  };
}

export async function fetchMasterParcelByGcn(apiBase, gcnBookNumber, getAuthHeaders) {
  const gcn = String(gcnBookNumber ?? '').trim();
  if (!gcn) return null;

  const res = await fetch(
    `${apiBase}/land-parcels/by-gcn?gcnBookNumber=${encodeURIComponent(gcn)}`,
    { headers: getAuthHeaders() }
  );
  if (!res.ok) return null;
  const json = await res.json();
  return json.data ?? json;
}

export function formatOwnerList(owners) {
  if (!owners?.length) return '—';
  return owners
    .map((o) => o.fullName || o.cccdNumber || `ID ${o.citizenId}`)
    .join(', ');
}
