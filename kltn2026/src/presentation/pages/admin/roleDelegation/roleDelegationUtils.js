import { normalizeRole } from '../../../../usecases/authService';
import { adminApi } from '../../../../infrastructure/api/adminApi';

export const ASSIGNABLE_ROLES = ['TAX_OFFICER', 'LAND_OFFICER', 'CITIZEN'];

export const ROLE_DISPLAY = {
  TAX_OFFICER: 'Cán bộ Thuế',
  LAND_OFFICER: 'Cán bộ Địa chính',
  CITIZEN: 'Người dân',
  ADMIN: 'Quản trị viên',
};

export const getUserCccd = (usr) =>
  usr?.cccdNumber || usr?.cccd_number || usr?.cccd || '';

export const getUserAccountId = (usr) => usr?.accountId ?? usr?.account_id ?? null;

export const findAdminAccountId = (users, adminCccd) => {
  if (!adminCccd) return null;
  const match = users.find(
    (u) => getUserCccd(u) === adminCccd && normalizeRole(u.role || u.role_code) === 'ROLE_ADMIN'
  );
  return getUserAccountId(match);
};

const normalizeUserRecord = (usr) => ({
  ...usr,
  accountId: usr?.accountId ?? usr?.account_id ?? null,
  fullName: usr?.fullName ?? usr?.full_name ?? usr?.name ?? '',
  cccdNumber: usr?.cccdNumber ?? usr?.cccd_number ?? usr?.cccd ?? '',
  phoneNumber: usr?.phoneNumber ?? usr?.phone ?? usr?.phone_number ?? '',
  role: usr?.role ?? usr?.roleCode ?? usr?.role_code ?? '',
  status: usr?.status ?? usr?.accountStatus ?? usr?.account_status ?? '',
  email: usr?.email ?? '',
});

const parseUsersResponse = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.content)) return raw.content;
  return [];
};

export const getRoleKey = (usr) => {
  const raw = usr?.role || usr?.role_code || usr?.role_name || '';
  const normalized = normalizeRole(raw);
  if (normalized) return normalized.replace(/^ROLE_/, '');
  return String(raw).replace(/^ROLE_/, '');
};

const isAdminRole = (usr) => normalizeRole(usr?.role || usr?.role_code) === 'ROLE_ADMIN';

export const getRoleBadgeClass = (roleKey) => {
  if (roleKey === 'TAX_OFFICER') return 'bg-primary bg-opacity-10 text-primary';
  if (roleKey === 'LAND_OFFICER') return 'bg-success bg-opacity-10 text-success';
  if (roleKey === 'CITIZEN') return 'bg-secondary bg-opacity-10 text-secondary';
  if (roleKey === 'ADMIN') return 'bg-danger bg-opacity-10 text-danger';
  return 'bg-danger bg-opacity-10 text-danger';
};

export const formatStatus = (status) => {
  const s = String(status || '').toUpperCase();
  if (s === 'ACTIVE' || s === 'HOẠT ĐỘNG') return { label: 'Hoạt động', ok: true };
  if (s === 'INACTIVE' || s === 'LOCKED' || s === 'KHÓA') return { label: 'Không hoạt động', ok: false };
  return { label: status || '—', ok: true };
};

/** Chuẩn hóa chuỗi để tìm không phân biệt dấu tiếng Việt. */
const foldText = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();

const matchesSearch = (usr, term) => {
  const q = foldText(term);
  if (!q) return true;

  const name = foldText(usr.fullName || usr.full_name || usr.name);
  const cccd = getUserCccd(usr);
  const email = foldText(usr.email);
  const phone = String(usr.phoneNumber || usr.phone || usr.phone_number || '');
  const roleKey = getRoleKey(usr);
  const roleLabel = foldText(ROLE_DISPLAY[roleKey] || roleKey);
  const roleRaw = foldText(usr.role || usr.role_code || usr.role_name);

  return (
    name.includes(q) ||
    cccd.includes(q) ||
    email.includes(q) ||
    phone.includes(q) ||
    roleLabel.includes(q) ||
    foldText(roleKey).includes(q) ||
    roleRaw.includes(q)
  );
};

export const loadDelegationUsers = async () => {
  const raw = await adminApi.getUsers();
  return parseUsersResponse(raw).map(normalizeUserRecord);
};

export const initialState = {
  localUsers: null,
  isRoleModalOpen: false,
  selectedUser: null,
  selectedRoleCode: '',
  isDelegateModalOpen: false,
  delegateTarget: null,
  delegating: false,
  activeTab: 'roles',
  searchTerm: '',
};

export const roleDelegationReducer = (state, action) => {
  switch (action.type) {
    case 'patch':
      return { ...state, ...action.payload };
    case 'openRoleModal':
      return {
        ...state,
        selectedUser: action.user,
        selectedRoleCode: action.roleCode,
        isRoleModalOpen: true,
      };
    case 'closeRoleModal':
      return { ...state, isRoleModalOpen: false };
    case 'openDelegateModal':
      return {
        ...state,
        delegateTarget: action.user,
        isDelegateModalOpen: true,
      };
    case 'closeDelegateModal':
      return {
        ...state,
        isDelegateModalOpen: false,
        delegateTarget: null,
      };
    case 'resetLocalUsers':
      return { ...state, localUsers: null };
    default:
      return state;
  }
};

export const filterUsersForRoleTab = (users) => users.filter((u) => !isAdminRole(u));

export const filterUsersForDelegationTab = (users, currentAdminCccd) =>
  users.filter((u) => {
    if (isAdminRole(u)) return false;
    const cccd = getUserCccd(u);
    if (currentAdminCccd && cccd === currentAdminCccd) return false;
    return true;
  });

export const filterUsersBySearch = (users, searchTerm) => {
  if (!searchTerm.trim()) return users;
  return users.filter((u) => matchesSearch(u, searchTerm));
};

export const getInitialRoleCode = (usr) => {
  const key = getRoleKey(usr);
  return ASSIGNABLE_ROLES.includes(key) ? key : 'CITIZEN';
};

export const saveUserRole = async ({
  selectedUser,
  selectedRoleCode,
  showAlert,
  adminApi,
  onSuccess,
  onClose,
}) => {
  if (!selectedUser || !selectedRoleCode) return;

  if (selectedRoleCode === 'ADMIN') {
    await showAlert({
      title: 'Không được phép',
      message: 'Tab Phân quyền không gán quyền Quản trị viên. Dùng tab Ủy quyền để chuyển quyền Admin.',
      variant: 'warning',
    });
    return;
  }

  if (!ASSIGNABLE_ROLES.includes(selectedRoleCode)) {
    await showAlert({
      title: 'Không hợp lệ',
      message: 'Chỉ được gán: Cán bộ Thuế, Cán bộ Địa chính hoặc Người dân.',
      variant: 'warning',
    });
    return;
  }

  try {
    const cccd = getUserCccd(selectedUser);
    if (!cccd) {
      await showAlert({
        title: 'Lỗi',
        message: 'Không xác định được CCCD người dùng.',
        variant: 'error',
      });
      return;
    }
    await adminApi.updateUserRole(cccd, `ROLE_${selectedRoleCode}`, getUserAccountId(selectedUser));
    await showAlert({
      title: 'Thành công',
      message: 'Cập nhật quyền hạn thành công!',
      variant: 'success',
    });
    onSuccess();
  } catch (err) {
    console.error('Lỗi lưu quyền hạn:', err);
    await showAlert({
      title: 'Lỗi',
      message: err.message || 'Có lỗi xảy ra khi cập nhật quyền',
      variant: 'error',
    });
  } finally {
    onClose();
  }
};

export const createDelegation = async ({
  delegateTarget,
  currentAdminCccd,
  currentAdminAccountId,
  showAlert,
  showConfirm,
  adminApi,
  clearSession,
  navigate,
  onDelegatingChange,
  onCloseModal,
}) => {
  if (!delegateTarget) return;

  const delegateeCccd = getUserCccd(delegateTarget);
  if (!delegateeCccd) {
    await showAlert({
      title: 'Lỗi',
      message: 'Không xác định được CCCD người nhận ủy quyền.',
      variant: 'error',
    });
    return;
  }

  if (!currentAdminCccd) {
    await showAlert({
      title: 'Lỗi',
      message: 'Không xác định được tài khoản Admin hiện tại.',
      variant: 'error',
    });
    return;
  }

  if (!currentAdminAccountId) {
    await showAlert({
      title: 'Lỗi',
      message: 'Không xác định được account Admin hiện tại. Vui lòng tải lại trang.',
      variant: 'error',
    });
    return;
  }

  const delegateeAccountId = getUserAccountId(delegateTarget);
  if (!delegateeAccountId) {
    await showAlert({
      title: 'Lỗi',
      message: 'Không xác định được tài khoản người nhận ủy quyền.',
      variant: 'error',
    });
    return;
  }

  const delegateeStatus = formatStatus(delegateTarget.status || delegateTarget.account_status);
  if (!delegateeStatus.ok) {
    await showAlert({
      title: 'Không hợp lệ',
      message: 'Chỉ có thể ủy quyền cho tài khoản đang hoạt động.',
      variant: 'warning',
    });
    return;
  }

  if (normalizeRole(delegateTarget.role || delegateTarget.role_code) === 'ROLE_ADMIN') {
    await showAlert({
      title: 'Không hợp lệ',
      message: 'Người nhận đã là Quản trị viên.',
      variant: 'warning',
    });
    return;
  }

  const confirmed = await showConfirm({
    title: 'Xác nhận ủy quyền Admin',
    message: `Bạn sắp chuyển quyền Quản trị viên cho ${delegateTarget.fullName || delegateTarget.full_name}. Tài khoản của bạn sẽ chuyển thành Người dân và bạn sẽ được đăng xuất ngay sau khi xác nhận.`,
    variant: 'warning',
    confirmLabel: 'Ủy quyền',
    cancelLabel: 'Hủy',
  });

  if (!confirmed) return;

  onDelegatingChange(true);
  try {
    await adminApi.delegateAdmin({
      currentAdminCccd,
      currentAdminAccountId,
      delegateeCccd,
      delegateeAccountId,
    });

    onCloseModal();

    await showAlert({
      title: 'Ủy quyền thành công',
      message: 'Đã chuyển quyền Quản trị viên. Phiên làm việc của bạn đã kết thúc.',
      variant: 'success',
    });

    clearSession();
    navigate('/');
  } catch (err) {
    console.error('Lỗi ủy quyền:', err);
    await showAlert({
      title: 'Lỗi',
      message: err.message || 'Không thể hoàn tất ủy quyền. Vui lòng kiểm tra lại hệ thống.',
      variant: 'error',
    });
  } finally {
    onDelegatingChange(false);
  }
};
