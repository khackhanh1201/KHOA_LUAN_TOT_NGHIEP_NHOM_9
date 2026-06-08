// src/usecases/authService.js
// Chuẩn hoá việc lưu / đọc / xoá session người dùng trong localStorage.
// Mục tiêu: mọi nơi trong app (Layouts, Pages, Hooks) đều dùng chung một
// nguồn dữ liệu duy nhất, tránh tình trạng UI hiển thị dữ liệu cũ / hardcoded.
const AI_CHAT_SESSION_KEY = 'ai_chat_session_id';
const STORAGE_KEYS = {
  TOKEN: 'token',
  ROLE: 'role',
  USER_INFO: 'user_info',
};

/**
 * Tên custom event được phát mỗi khi session thay đổi (login/logout/switch).
 * Các hook React (useAuth) subscribe vào event này để tự re-render.
 * Việc này biến localStorage – vốn KHÔNG reactive – thành nguồn dữ liệu reactive.
 */
export const AUTH_CHANGED_EVENT = 'auth-session-changed';

/**
 * Phát tín hiệu "session đã đổi" trong cùng một tab.
 * Tab khác sẽ tự nhận `storage` event của browser (native).
 */
const emitAuthChanged = (detail) => {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT, { detail }));
  } catch (err) {
    console.warn('[authService] Không thể phát AUTH_CHANGED_EVENT:', err);
  }
};

/**
 * Mapping role chuẩn (canonical) → URL dashboard tương ứng.
 * Đây là SOURCE OF TRUTH duy nhất cho việc routing theo role.
 * Khi thêm role mới, CHỈ cần update bảng này.
 */
const ROLE_HOME_ROUTE = {
  ROLE_ADMIN: '/admin/dashboard',
  ROLE_TAX_OFFICER: '/tax-officer/dashboard',
  ROLE_LAND_OFFICER: '/dashboard',
  ROLE_CITIZEN: '/home',
};

/**
 * Mapping role → URL của "hệ thống Đất đai" dành riêng cho role đó.
 *
 * Tất cả 4 role đều có 1 nút "Đất đai" duy nhất trên VNeID Home. Khi click,
 * nút này phải dispatch về UI phù hợp với role:
 *  - Citizen: trang dịch vụ thuế đất công dân (LandTaxPage)
 *  - 3 role nghiệp vụ: dashboard nghiệp vụ tương ứng
 *
 * Trùng `ROLE_HOME_ROUTE` cho 3 role nghiệp vụ; khác cho CITIZEN
 * (vì CITIZEN-home là /home — chính là VNeID landing).
 */
const LAND_TAX_SYSTEM_BY_ROLE = {
  ROLE_ADMIN: '/admin/dashboard',
  ROLE_TAX_OFFICER: '/tax-officer/dashboard',
  ROLE_LAND_OFFICER: '/dashboard',
  ROLE_CITIZEN: '/land-tax',
};

const DEFAULT_HOME = '/home';
const DEFAULT_LAND_TAX = '/land-tax';

/**
 * Mapping role → tên hiển thị tiếng Việt.
 * Dùng cho popup "Đổi tài khoản" (switch role) để user dễ nhận biết.
 */
export const ROLE_LABELS = {
  ROLE_CITIZEN: 'Tài khoản cá nhân',
  ROLE_ADMIN: 'Quản trị viên',
  ROLE_TAX_OFFICER: 'Cán bộ Thuế',
  ROLE_LAND_OFFICER: 'Cán bộ địa chính',
};

/**
 * Alias từ các biến thể role hay gặp từ backend (Spring/JPA) về role chuẩn.
 * Việc này giúp app không phụ thuộc vào cách đặt tên role chính xác của BE
 * (ví dụ ROLE_CADASTRAL_OFFICER trong DB nhưng FE chỉ biết ROLE_LAND_OFFICER).
 */
const ROLE_ALIASES = {
  // Các tên alias cho Land Officer
  ROLE_CADASTRAL_OFFICER: 'ROLE_LAND_OFFICER',
  CADASTRAL_OFFICER: 'ROLE_LAND_OFFICER',
  LAND_OFFICER: 'ROLE_LAND_OFFICER',
  // Alias cho các role còn lại (phòng khi BE bỏ tiền tố ROLE_)
  ADMIN: 'ROLE_ADMIN',
  TAX_OFFICER: 'ROLE_TAX_OFFICER',
  CITIZEN: 'ROLE_CITIZEN',
  USER: 'ROLE_CITIZEN',
};

/**
 * Chuẩn hoá role: upper-case, thêm tiền tố ROLE_ nếu thiếu, ánh xạ alias.
 * Trả về null nếu không nhận diện được.
 */
export const normalizeRole = (raw) => {
  if (!raw || typeof raw !== 'string') return null;
  const upper = raw.trim().toUpperCase();
  if (ROLE_ALIASES[upper]) return ROLE_ALIASES[upper];
  if (ROLE_HOME_ROUTE[upper]) return upper;
  // Phòng trường hợp BE trả về kiểu "LAND_OFFICER" không có prefix
  const withPrefix = upper.startsWith('ROLE_') ? upper : `ROLE_${upper}`;
  if (ROLE_ALIASES[withPrefix]) return ROLE_ALIASES[withPrefix];
  if (ROLE_HOME_ROUTE[withPrefix]) return withPrefix;
  return upper; // trả về nguyên giá trị để consumer còn debug được
};

/**
 * Thứ tự ưu tiên khi user có NHIỀU role.
 * Mảng `roles[]` là SOURCE OF TRUTH (cái user thực sự có quyền).
 */
const ROLE_PRIORITY = [
  'ROLE_ADMIN',
  'ROLE_TAX_OFFICER',
  'ROLE_LAND_OFFICER',
  'ROLE_CITIZEN',
];

/**
 * Tập các role đặc quyền (nghiệp vụ). Nếu user có BẤT KỲ role nào trong đây,
 * FE sẽ ưu tiên dùng nó để routing, BẤT KỂ `activeRole` mà BE trả về.
 * Đây là tuyến phòng thủ trước trường hợp BE set activeRole sai/lệch.
 */
const PRIVILEGED_ROLES = new Set([
  'ROLE_ADMIN',
  'ROLE_TAX_OFFICER',
  'ROLE_LAND_OFFICER',
]);

/**
 * Defensive role resolver.
 *
 * Quy tắc:
 * 1. Nếu `roles[]` chứa BẤT KỲ privileged role nào (ADMIN / TAX_OFFICER / LAND_OFFICER),
 *    trả về role đó theo thứ tự ưu tiên trong ROLE_PRIORITY,
 *    KHÔNG QUAN TÂM `activeRole` đang nói gì.
 * 2. Nếu không có privileged role, tin tưởng `activeRole` (đã normalize).
 * 3. Mặc định an toàn cuối cùng: 'ROLE_CITIZEN'.
 *
 * Hàm đồng thời log warning khi phát hiện BE trả dữ liệu lệch
 * (activeRole nói 1 đằng, roles[] nói 1 nẻo) để dễ debug phía BE.
 *
 * @param {string[]|null|undefined} roles - mảng roles từ API.
 * @param {string|null|undefined} activeRole - role active BE chỉ định.
 * @returns {string} canonical role (luôn có giá trị).
 */
const getAuthorizedRole = (roles, activeRole) => {
  const normalizedRoles = Array.isArray(roles)
    ? roles.flatMap((role) => {
        const normalized = normalizeRole(role);
        return normalized ? [normalized] : [];
      })
    : [];
  const normalizedRoleSet = new Set(normalizedRoles);
  const normalizedActive = normalizeRole(activeRole);

  // Bước 1: privileged role trong roles[] WIN.
  for (const candidate of ROLE_PRIORITY) {
    if (PRIVILEGED_ROLES.has(candidate) && normalizedRoleSet.has(candidate)) {
      if (normalizedActive && normalizedActive !== candidate) {
        console.warn(
          `[getAuthorizedRole] Dữ liệu role KHÔNG đồng nhất: ` +
          `activeRole="${normalizedActive}" nhưng user có privileged role "${candidate}". ` +
          `FE ưu tiên "${candidate}" để bảo vệ trải nghiệm.`
        );
      }
      return candidate;
    }
  }

  // Bước 2: không có privileged role → tin tưởng activeRole nếu hợp lệ.
  if (normalizedActive) return normalizedActive;

  // Bước 3: roles[] có role không-đặc-quyền nhưng activeRole rỗng → dùng phần tử đầu.
  if (normalizedRoles.length > 0) return normalizedRoles[0];

  // Bước 4: hoàn toàn không có dữ liệu role → mặc định công dân.
  return 'ROLE_CITIZEN';
};

/**
 * @deprecated dùng `getAuthorizedRole(roles, activeRole)` cho rõ contract.
 * Wrapper giữ để không phá API cũ.
 *
 * @param {{ roles?: string[], activeRole?: string, role?: string }} data
 * @returns {string|null}
 */
export const getBestRole = (data) => {
  if (!data) return null;
  return getAuthorizedRole(data.roles, data.activeRole || data.role);
};

// Alias nội bộ để saveSession không phải đổi tên.
const extractRole = getBestRole;

/**
 * Trả về URL dashboard mặc định theo role.
 * Dùng cho cả: post-login redirect, ProtectedRoute fallback, wildcard route.
 */
const getHomePathForRole = (role) => {
  const canonical = normalizeRole(role);
  return ROLE_HOME_ROUTE[canonical] || DEFAULT_HOME;
};

/**
 * Trả về URL của hệ thống "Đất đai" tương ứng với role.
 * Dùng khi user click nút "Đất đai" trên VNeID home / sidebar.
 *  - Citizen → trang dịch vụ thuế đất công dân
 *  - Admin / Tax / Land Officer → dashboard nghiệp vụ của họ
 */
export const getLandTaxSystemPath = (role) => {
  const canonical = normalizeRole(role);
  return LAND_TAX_SYSTEM_BY_ROLE[canonical] || DEFAULT_LAND_TAX;
};

/**
 * Giải mã JWT (không xác thực chữ ký) để rút role dự phòng nếu
 * payload login không kèm role.
 */
const decodeRoleFromToken = (token) => {
  try {
    if (!token || typeof token !== 'string') return null;
    const part = token.split('.')[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(json);
    return (
      payload.role ||
      (Array.isArray(payload.roles) ? payload.roles[0] : null) ||
      (Array.isArray(payload.authorities) ? payload.authorities[0] : null) ||
      null
    );
  } catch {
    return null;
  }
};

/**
 * Endpoint trả về profile đầy đủ (gồm roles[] + activeRole).
 * BE của project chia 2 service:
 *  - 9090: auth service (chỉ trả JWT khi login)
 *  - 8080: user service  (trả profile chi tiết)
 * Khi BE gộp lại 1 service, chỉ cần đổi hằng số này.
 */
const PROFILE_API_URL = 'http://localhost:8080/api/profile';

/**
 * Gọi /api/profile bằng token hiện tại, lấy data đầy đủ (roles, activeRole, fullName, ...)
 * rồi gọi lại `saveSession` để cập nhật role thật.
 *
 * LÝ DO TỒN TẠI: endpoint /api/auth/login KHÔNG trả về roles, nên nếu chỉ dựa
 * vào response login thì role luôn fallback về 'ROLE_CITIZEN' — user admin/cán bộ
 * sẽ bị đẩy nhầm vào trang công dân.
 *
 * Hàm an toàn để gọi bất cứ lúc nào sau khi có token:
 *  - Sau login (CCCD + QR)
 *  - Khi reload app (giữ session "tươi")
 *  - Khi user yêu cầu refresh (chuyển role, cập nhật profile)
 *
 * @returns {Promise<{role: string, userInfo: object}|null>}
 */
export const refreshSessionFromProfile = async () => {
  const token = getToken();
  if (!token) {
    console.debug('[refreshSession] không có token, bỏ qua.');
    return null;
  }

  try {
    const res = await fetch(PROFILE_API_URL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.warn(`[refreshSession] /api/profile trả về HTTP ${res.status}`);
      return null;
    }

    const json = await res.json();
    // Hỗ trợ cả 2 kiểu envelope: { success, data: {...} } hoặc raw {...}
    const profile = json?.data && typeof json.data === 'object' ? json.data : json;

    console.log('[refreshSession] profile từ BE:', profile);

    // GHI ĐÈ session với data đầy đủ — emitAuthChanged được trigger
    // → mọi component dùng useAuth tự re-render với role mới.
    const result = saveSession(profile, token);
    console.log(
      `[refreshSession] role đã cập nhật: "${result.role}" (từ /api/profile)`
    );
    return result;
  } catch (err) {
    console.error('[refreshSession] lỗi gọi /api/profile:', err);
    return null;
  }
};

/**
 * Lưu session ngay sau khi login thành công.
 * @param {object} payload - object `data` từ API ({ fullName, userId, activeRole, roles, token, ... }).
 * @param {string} [tokenOverride] - token nếu nằm ngoài payload (vd qrFlow).
 */
export const saveSession = (payload, tokenOverride) => {
  const data = payload?.data ?? payload ?? {};
  const token = tokenOverride || data.token;

  const rawRole = extractRole(data) || decodeRoleFromToken(token);
  const role = normalizeRole(rawRole) || 'ROLE_CITIZEN';

  if (rawRole && rawRole !== role) {
    console.info(`[authService] Role "${rawRole}" được chuẩn hoá → "${role}"`);
  }

  if (token) localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.ROLE, role);

  // LƯU Ý: luôn lưu PHẲNG (flat) để mọi consumer chỉ cần đọc `user.fullName`,
  // không cần dò sâu nhiều cấp `user.data.fullName`.
  const { token: _omitToken, ...userInfo } = data;

  // Đảm bảo roles trong userInfo không trùng nhau và luôn mặc định có ROLE_CITIZEN
  const userRolesList = Array.isArray(userInfo.roles) ? userInfo.roles : [];
  const normalizedRoles = userRolesList.flatMap((role) => {
    const normalized = normalizeRole(role);
    return normalized ? [normalized] : [];
  });
  if (!normalizedRoles.includes('ROLE_CITIZEN')) {
    normalizedRoles.push('ROLE_CITIZEN');
  }
  userInfo.roles = [...new Set(normalizedRoles)];

  localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));

  // Báo cho mọi component đang subscribe (qua useAuth) để re-render
  // với dữ liệu mới — KHÔNG cần reload trang, KHÔNG cần Context Provider.
  emitAuthChanged({ type: 'login', role, userInfo });

  return { token, role, userInfo };
};

/**
 * Đọc thông tin user hiện tại từ localStorage.
 * Tự xử lý cả trường hợp lịch sử dữ liệu đang lưu dạng nested `{ data: {...} }`.
 */
export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_INFO);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed.data && typeof parsed.data === 'object' ? parsed.data : parsed;
    }
    return null;
  } catch {
    return null;
  }
};

export const getDisplayName = (userLike, fallback = 'Người dùng') => {
  const u = userLike || getCurrentUser();
  return (
    u?.fullName ||
    u?.full_name ||
    u?.name ||
    u?.data?.fullName ||
    u?.data?.full_name ||
    fallback
  );
};

export const getActiveRole = () => localStorage.getItem(STORAGE_KEYS.ROLE) || null;
export const getToken = () => localStorage.getItem(STORAGE_KEYS.TOKEN) || null;

/**
 * Lấy danh sách roles[] của user hiện tại từ localStorage.
 * Trả về mảng đã normalize, luôn có ít nhất role đang active.
 * Luôn bổ sung ROLE_CITIZEN vì mọi user đều có quyền công dân cơ bản.
 */
export const getUserRoles = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_INFO);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const data = parsed?.data || parsed;
    const roles = Array.isArray(data?.roles) ? data.roles : [];
    const normalized = roles.flatMap((role) => {
      const n = normalizeRole(role);
      return n ? [n] : [];
    });
    // Đảm bảo role đang active luôn nằm trong danh sách
    const active = getActiveRole();
    if (active && !normalized.includes(active)) {
      normalized.push(active);
    }
    // Mọi user đều có quyền công dân cơ bản
    if (!normalized.includes('ROLE_CITIZEN')) {
      normalized.push('ROLE_CITIZEN');
    }
    return [...new Set(normalized)];
  } catch {
    const active = getActiveRole();
    return active ? [active] : [];
  }
};

/**
 * Chuyển đổi role hiện tại (không đăng xuất, không đổi token).
 * Ghi role mới vào localStorage và phát event để mọi component re-render.
 *
 * @param {string} newRole - Role canonical cần chuyển sang.
 * @returns {string} role đã normalize và lưu.
 */
export const switchRole = (newRole) => {
  const canonical = normalizeRole(newRole);
  if (!canonical) {
    console.warn('[switchRole] Không nhận diện được role:', newRole);
    return getActiveRole();
  }
  localStorage.setItem(STORAGE_KEYS.ROLE, canonical);
  emitAuthChanged({ type: 'switch-role', role: canonical });
  console.info(`[switchRole] Đã chuyển role → "${canonical}"`);
  return canonical;
};

export const clearSession = () => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.ROLE);
  localStorage.removeItem(STORAGE_KEYS.USER_INFO);
  localStorage.removeItem(AI_CHAT_SESSION_KEY);
  emitAuthChanged({ type: 'logout' });
};

/**
 * Subscribe vào sự kiện session thay đổi.
 * Tự lắng nghe cả custom event (same-tab) và storage event (cross-tab).
 * Trả về hàm unsubscribe để cleanup trong useEffect.
 *
 * @param {(detail?: any) => void} callback
 * @returns {() => void}
 */
export const subscribeAuthChange = (callback) => {
  if (typeof window === 'undefined' || typeof callback !== 'function') {
    return () => {};
  }

  const onCustom = (e) => callback(e?.detail);
  const onStorage = (e) => {
    if (
      e.key === STORAGE_KEYS.TOKEN ||
      e.key === STORAGE_KEYS.ROLE ||
      e.key === STORAGE_KEYS.USER_INFO ||
      e.key === null // localStorage.clear()
    ) {
      callback({ type: 'storage' });
    }
  };

  window.addEventListener(AUTH_CHANGED_EVENT, onCustom);
  window.addEventListener('storage', onStorage);

  return () => {
    window.removeEventListener(AUTH_CHANGED_EVENT, onCustom);
    window.removeEventListener('storage', onStorage);
  };
};

const authService = {
  saveSession,
  refreshSessionFromProfile,
  getCurrentUser,
  getDisplayName,
  getActiveRole,
  getToken,
  getUserRoles,
  switchRole,
  clearSession,
  getAuthorizedRole,
  getBestRole,
  normalizeRole,
  getHomePathForRole,
  getLandTaxSystemPath,
  subscribeAuthChange,
  AUTH_CHANGED_EVENT,
  ROLE_LABELS,
};

authService;