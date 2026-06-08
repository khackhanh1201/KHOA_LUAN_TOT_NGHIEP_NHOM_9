import { userApi } from '../../../../infrastructure/api/userApi';
import { formatTaxRecordCode } from '../../../../utils/taxRecordCode';

export const API_BASE = 'http://localhost:8080/api';
export const getAuth = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'land', label: 'Đất đai' },
  { key: 'tax', label: 'Thuế' },
  { key: 'declaration', label: 'Hồ sơ' },
  { key: 'payment', label: 'Thanh toán' },
  { key: 'complaint', label: 'Khiếu nại' },
];

export const TYPE_META = {
  land: { label: 'Thửa đất', route: '/land-information', icon: 'bi-geo-alt-fill' },
  tax: { label: 'Thuế', route: '/tax', icon: 'bi-receipt-cutoff' },
  declaration: { label: 'Hồ sơ', route: '/property-declaration', icon: 'bi-folder2-open' },
  payment: { label: 'Thanh toán', route: '/payment', icon: 'bi-credit-card-2-front' },
  complaint: { label: 'Khiếu nại', route: '/complaint', icon: 'bi-exclamation-triangle-fill' },
};

const RECENT_KEY = 'landtax_search_recent';
const MAX_RECENT = 5;

const toArray = (json) => (Array.isArray(json) ? json : json?.data ?? []);

const normalizeParcel = (p) => ({
  id: p.landParcelId ?? p.land_parcel_id ?? p.id,
  parcelNumber: p.parcelNumber ?? p.parcel_number ?? '',
  mapSheetNumber: p.mapSheetNumber ?? p.map_sheet_number ?? '',
  areaSize: p.areaSize ?? p.area_size ?? '',
  address: p.address ?? '',
  certificateNumber: p.certificateNumber ?? p.certificate_number ?? p.gcnBookNumber ?? p.gcn_book_number ?? '',
});

const buildSearchBlob = (...parts) => {
  const tokens = [];
  for (const v of parts) {
    if (v != null && v !== '') tokens.push(String(v).toLowerCase());
  }
  return tokens.join(' ');
};

const matchesKeyword = (blob, q) => {
  if (!q) return true;
  return blob.includes(q.toLowerCase());
};

const dedupeByKey = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.type}-${item.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const saveRecentSearch = (keyword, tab) => {
  try {
    const prev = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    const entry = { keyword, tab, at: Date.now() };
    const next = [entry, ...prev.filter((e) => e.keyword !== keyword || e.tab !== tab)].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch { /* ignore */ }
};

export const loadRecentSearches = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
};

const mapLandResult = (p) => {
  const n = normalizeParcel(p);
  return {
    id: n.id, type: 'land', title: `Thửa số: ${n.parcelNumber || '—'}`,
    lines: [`Tờ bản đồ: ${n.mapSheetNumber || '—'}`, `Diện tích: ${n.areaSize ? `${n.areaSize} m²` : '—'}`, `Sổ GCN: ${n.certificateNumber || '—'}`, `Địa chỉ: ${n.address || '—'}`],
    route: '/land-information',
    searchText: buildSearchBlob(n.parcelNumber, n.mapSheetNumber, n.address, n.certificateNumber, n.areaSize),
  };
};

const mapDeclarationResult = (d) => {
  const id = d.recordId ?? d.id;
  const code = formatTaxRecordCode(id, d.createdAt || d.submittedAt);
  return {
    id, type: 'declaration', title: code,
    lines: [d.recordCategory || 'Hồ sơ khai báo', d.address || (d.parcelId ? `Thửa #${d.parcelId}` : ''), d.status || d.currentStatus || ''].filter(Boolean),
    route: '/property-declaration',
    searchText: buildSearchBlob(code, id, d.recordCategory, d.address, d.parcelId, d.parcelNumber, d.mapSheetNumber, d.status, d.currentStatus),
  };
};

const mapTaxBillResult = (item, paid) => {
  const id = item.paymentId ?? item.billId ?? item.id;
  const parcel = item.parcelNumber ?? item.parcel ?? item.parcelLabel ?? (item.parcelId ? `Thửa #${item.parcelId}` : '—');
  return {
    id, type: 'tax', title: `Thuế năm ${item.taxYear ?? '—'} · ${parcel}`,
    lines: [paid ? 'Đã thanh toán' : 'Chưa thanh toán', item.taxAmount != null ? `Số tiền: ${Number(item.taxAmount).toLocaleString('vi-VN')} VND` : null, item.dueDate ? `Hạn: ${new Date(item.dueDate).toLocaleDateString('vi-VN')}` : null].filter(Boolean),
    route: '/tax',
    searchText: buildSearchBlob(id, item.taxYear, parcel, item.parcelNumber, item.paymentStatus, item.taxAmount, item.landTypeName),
  };
};

const mapComplaintResult = (c) => {
  const id = c.complaintId ?? c.id;
  const title = c.complaintTitle || c.title || `Khiếu nại #${id}`;
  return {
    id, type: 'complaint', title,
    lines: [c.recordCategory || c.complaintType || '', c.status || '', (c.complaintBody || c.content || '').slice(0, 120)].filter(Boolean),
    route: '/complaint',
    searchText: buildSearchBlob(id, title, c.complaintBody, c.content, c.status, c.recordCategory),
  };
};

async function fetchLandResults(q) {
  const out = [];
  try {
    const parcels = await userApi.getMyLandParcels();
    parcels.forEach((p) => { const row = mapLandResult(p); if (matchesKeyword(row.searchText, q)) out.push(row); });
  } catch (e) { console.warn('load land parcels', e); }
  try {
    const searched = await userApi.searchParcels({ mapSheet: q, parcelNumber: q });
    searched.forEach((p) => { const row = mapLandResult(p); if (matchesKeyword(row.searchText, q)) out.push(row); });
  } catch { /* optional */ }
  return dedupeByKey(out);
}

async function fetchDeclarationResults(q) {
  try {
    const list = await userApi.getMyDeclarations();
    const results = [];
    for (const d of list) {
      const row = mapDeclarationResult(d);
      if (matchesKeyword(row.searchText, q)) results.push(row);
    }
    return results;
  } catch (e) { console.warn('load declarations', e); return []; }
}

async function fetchTaxResults(q) {
  const out = [];
  try {
    const [unpaidRes, paidRes] = await Promise.all([
      fetch(`${API_BASE}/payments/unpaid`, { headers: getAuth() }),
      fetch(`${API_BASE}/payments/paid`, { headers: getAuth() }),
    ]);
    if (unpaidRes.ok) {
      toArray(await unpaidRes.json()).forEach((item) => { const row = mapTaxBillResult(item, false); if (matchesKeyword(row.searchText, q)) out.push(row); });
    }
    if (paidRes.ok) {
      toArray(await paidRes.json()).forEach((item) => { const row = mapTaxBillResult(item, true); if (matchesKeyword(row.searchText, q)) out.push(row); });
    }
  } catch (e) { console.warn('load tax bills', e); }
  return dedupeByKey(out);
}

async function fetchComplaintResults(q) {
  try {
    const list = await userApi.getMyComplaints();
    const results = [];
    for (const c of list) {
      const row = mapComplaintResult(c);
      if (matchesKeyword(row.searchText, q)) results.push(row);
    }
    return results;
  } catch (e) { console.warn('load complaints', e); return []; }
}

const LOADERS = {
  land: fetchLandResults,
  tax: fetchTaxResults,
  declaration: fetchDeclarationResults,
  payment: async (q) => {
    const bills = await fetchTaxResults(q);
    return bills.map((r) => ({ ...r, type: 'payment', route: '/payment', title: r.title.startsWith('Thuế') ? r.title.replace('Thuế', 'Thanh toán') : r.title }));
  },
  complaint: fetchComplaintResults,
};

export const INITIAL_SEARCH_STATE = {
  keyword: '', activeTab: 'all', allResults: [], results: [], loading: false,
  error: '', hasSearched: false, recentList: loadRecentSearches(),
};

export const searchPageReducer = (state, action) => {
  switch (action.type) {
    case 'PATCH':
      return { ...state, ...action.payload };
    case 'NEW_SEARCH':
      return { ...state, hasSearched: false, allResults: [], results: [], error: '', keyword: '', activeTab: 'all' };
    default:
      return state;
  }
};

export const dedupeResults = dedupeByKey;

export async function runSearchForTab(tab, q) {
  if (tab === 'all') {
    const groups = await Promise.all([
      fetchLandResults(q), fetchTaxResults(q), fetchDeclarationResults(q), LOADERS.payment(q), fetchComplaintResults(q),
    ]);
    return dedupeByKey(groups.flat());
  }
  const loader = LOADERS[tab];
  return loader ? loader(q) : [];
}

export function filterResultsByTab(items, tab) {
  if (tab === 'all') return items;
  return items.filter((r) => r.type === tab);
}
