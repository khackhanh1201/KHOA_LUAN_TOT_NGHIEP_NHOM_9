import React, { useReducer } from 'react';
import AdminLayout from '../../components/AdminLayout';
// Import adminApi từ hạ tầng API (Named Export)
import { adminApi } from '../../../infrastructure/api/adminApi';
import { useAppDialog } from '../../components/dialog/DialogContext';
import { useAsyncMountLoad } from '../../../hooks/useAsyncMountLoad';

const MOCK_USERS = [
  { id: '1', name: 'Nguyễn Văn Công', email: 'cong.nv@vneid.gov', role: 'Công dân', cccd: '001090123456', status: 'Hoạt động', lastLogin: '10:30 18/04/2026' },
  { id: '2', name: 'Trần Thị Hằng', email: 'hang.tt@tax.gov.vn', role: 'Cán bộ Thuế', cccd: '001192654321', status: 'Hoạt động', lastLogin: '08:15 18/04/2026' },
  { id: '3', name: 'Lê Minh Tuấn', email: 'tuan.lm@land.gov.vn', role: 'Cán bộ Địa chính', cccd: '037085987654', status: 'Hoạt động', lastLogin: '09:00 18/04/2026' },
];

const loadUsers = async () => {
  try {
    const data = await adminApi.getUsers();
    const usersData = data?.data || data;
    if (Array.isArray(usersData) && usersData.length > 0) {
      return usersData;
    }
    return MOCK_USERS;
  } catch (error) {
    console.error('Lỗi khi fetch users:', error);
    return MOCK_USERS;
  }
};

const initialState = {
  localUsers: null,
  searchTerm: '',
  roleFilter: 'Tất cả vai trò',
  isLockModalOpen: false,
  selectedUser: null,
  lockReason: '',
};

const userManagementReducer = (state, action) => {
  switch (action.type) {
    case 'patch':
      return { ...state, ...action.payload };
    case 'openLockModal':
      return {
        ...state,
        selectedUser: action.user,
        lockReason: '',
        isLockModalOpen: true,
      };
    case 'closeLockModal':
      return { ...state, isLockModalOpen: false };
    default:
      return state;
  }
};

const UserManagement = () => {
  const user = JSON.parse(localStorage.getItem('user_info') || '{}');
  const { showAlert } = useAppDialog();

  const { data: loadedUsers, isLoading: loadingUsers } = useAsyncMountLoad(loadUsers);
  const [state, dispatch] = useReducer(userManagementReducer, initialState);
  const {
    localUsers,
    searchTerm,
    roleFilter,
    isLockModalOpen,
    selectedUser,
    lockReason,
  } = state;

  const users = localUsers ?? loadedUsers ?? [];
  const isLoading = loadingUsers && users.length === 0;

  const filteredUsers = users.filter(u => {
    const userName = u.name || u.fullName || '';
    const userEmail = u.email || '';
    const userCccd = u.cccd || u.citizenCccd || u.cccdNumber || '';
    
    const matchSearch = userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        userCccd.includes(searchTerm);
    const matchRole = roleFilter === 'Tất cả vai trò' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  // Mở Modal Khóa tài khoản
  const handleOpenLockModal = (u) => {
    dispatch({ type: 'openLockModal', user: u });
  };

  // Xử lý Khóa (gọi API qua adminApi để cập nhật trạng thái)
  // Xử lý Khóa / Mở Khóa (Tự động nhận diện trạng thái)
  const handleConfirmStatusChange = async () => {
    if (!lockReason.trim()) {
      await showAlert({
        title: 'Thông báo',
        message: 'Vui lòng nhập lý do để lưu vết hệ thống!',
        variant: 'warning',
      });
      return;
    }

    try {
      const targetCccd = selectedUser.cccdNumber || selectedUser.cccd || selectedUser.citizenCccd;
      if (!targetCccd) {
        await showAlert({
          title: 'Lỗi',
          message: 'Không tìm thấy số CCCD của người dùng!',
          variant: 'error',
        });
        return;
      }
      
      const isCurrentlyActive = isUserActive(selectedUser.status);
      
      // Logic: Đang hoạt động -> truyền false (để Khóa) | Đang khóa -> truyền true (để Mở)
      const targetActiveStatus = !isCurrentlyActive; 

      // Gọi API qua adminApi (accountId để cập nhật đúng dòng khi user có nhiều role)
      await adminApi.updateUserStatus(targetCccd, targetActiveStatus, selectedUser.accountId);

      // Cập nhật lại giao diện ngay lập tức
      const newStatusText = targetActiveStatus ? 'Hoạt động' : 'Bị khóa';
      dispatch({
        type: 'patch',
        payload: {
          localUsers: users.map(u => {
            const sameAccount = selectedUser.accountId != null && u.accountId === selectedUser.accountId;
            const sameLegacyUser = selectedUser.accountId == null
              && (u.id === selectedUser.id
                || u.cccdNumber === targetCccd
                || u.cccd === targetCccd);
            return sameAccount || sameLegacyUser ? { ...u, status: newStatusText } : u;
          }),
        },
      });
      
      dispatch({ type: 'closeLockModal' });
      await showAlert({
        title: 'Thành công',
        message: `${targetActiveStatus ? 'Mở khóa' : 'Khóa'} tài khoản thành công!`,
        variant: 'success',
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      await showAlert({
        title: 'Lỗi',
        message: error.message || 'Lỗi khi cập nhật trạng thái tài khoản!',
        variant: 'error',
      });
    }
  };

  return (
    <AdminLayout user={user}>
      <div className="container py-4" style={{ maxWidth: '1140px' }}>
        
        {/* Header Section */}
        <div className="mb-4">
          <h3 className="fw-bold">Quản lý người dùng</h3>
          <p className="text-muted">Quản lý tài khoản công dân, cán bộ Thuế và cán bộ Địa chính</p>
        </div>

        {/* Filter Bar */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '12px' }}>
          <div className="card-body p-3">
            <div className="row g-3">
              <div className="col-md-8 position-relative">
                <i className="bi bi-search position-absolute text-muted" style={{ left: '25px', top: '50%', transform: 'translateY(-50%)' }}></i>
                <input 
                  type="text" 
                  className="form-control py-2 bg-light border-0" 
                  placeholder="Tìm kiếm theo Tên, Email, CCCD..." 
                  aria-label="Tìm kiếm theo Tên, Email, CCCD"
                  value={searchTerm}
                  onChange={(e) => dispatch({ type: 'patch', payload: { searchTerm: e.target.value } })}
                  style={{ paddingLeft: '40px', borderRadius: '8px' }}
                />
              </div>
              <div className="col-md-4">
                <select 
  className="form-select py-2 border-danger text-danger fw-semibold" 
  value={roleFilter} 
  onChange={(e) => dispatch({ type: 'patch', payload: { roleFilter: e.target.value } })} 
  style={{ borderRadius: '8px', backgroundColor: '#fff' }}
>
  <option value="Tất cả vai trò">Tất cả vai trò</option>
  <option value="ROLE_CITIZEN">Công dân</option>
  <option value="ROLE_TAX_OFFICER">Cán bộ Thuế</option>
  <option value="ROLE_LAND_OFFICER">Cán bộ Địa chính</option>
</select>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-5">
            <output className="spinner-border text-danger" aria-live="polite">
              <span className="visually-hidden">Đang tải...</span>
            </output>
          </div>
        )}

        {/* Table */}
        {!isLoading && (
          <div className="card shadow-sm border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="table table-borderless table-hover align-middle mb-0" style={{ minWidth: '950px' }}>
                <thead className="bg-light border-bottom">
                  <tr>
                    <th className="py-3 px-4 text-muted small fw-bold" style={{ letterSpacing: '0.5px' }}>ID / NGƯỜI DÙNG</th>
                    <th className="py-3 px-4 text-muted small fw-bold" style={{ letterSpacing: '0.5px' }}>VAI TRÒ</th>
                    <th className="py-3 px-4 text-muted small fw-bold" style={{ letterSpacing: '0.5px' }}>CCCD</th>
                    <th className="py-3 px-4 text-muted small fw-bold" style={{ letterSpacing: '0.5px' }}>TRẠNG THÁI</th>
                    <th className="py-3 px-4 text-muted small fw-bold" style={{ letterSpacing: '0.5px' }}>ĐĂNG NHẬP CUỐI</th>
                    <th className="py-3 px-4 text-muted small fw-bold text-center" style={{ letterSpacing: '0.5px' }}>THAO TÁC</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, idx) => (
                    <tr 
                      key={u.accountId ?? `${u.cccdNumber ?? u.cccd ?? u.id}-${u.role ?? idx}`}
                      className={idx !== filteredUsers.length - 1 ? "border-bottom" : ""}
                    >
                      <td className="py-3 px-4">
                        <div className="d-flex align-items-center gap-3">
                          <div className="rounded-circle bg-secondary bg-opacity-10 text-secondary d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                            {(u.name || u.fullName || 'U').charAt(0)}
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{u.name || u.fullName || 'N/A'}</div>
                            <div className="text-muted small mt-1">{u.email || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
      <span className={`badge px-3 py-2 ${getRoleBadgeClass(u.role)}`}>
        {getRoleDisplayName(u.role)} {/* Hiển thị Tiếng Việt thay vì mã code */}
      </span>
    </td>
                      <td className="py-3 px-4 text-secondary small font-monospace">
                        {u.cccdNumber || u.cccd || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <div className={`d-flex align-items-center gap-2 small fw-semibold 
    ${getStatusClass(u.status)}`}>
    <div className={`rounded-circle ${getStatusDotClass(u.status)}`} 
         style={{ width: '8px', height: '8px' }}></div>
    {getStatusDisplay(u.status)}
  </div>
                      </td>
                      <td className="py-3 px-4 text-muted small">
                        {u.lastLogin || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button type="button" className="btn btn-light btn-sm text-secondary" 
                          onClick={() => handleOpenLockModal(u)}
                          title={getLockActionLabel(u.status)}
                          aria-label={getLockActionLabel(u.status)}
                          style={{ borderRadius: '8px', width: '36px', height: '36px' }}
                        >
                          <i className={getLockActionIcon(u.status)}></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        Không tìm thấy người dùng nào phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Khóa / Mở Khóa Tài Khoản */}
        {isLockModalOpen && selectedUser && (
          (() => {
            // Tính toán giao diện dựa vào trạng thái hiện tại
            const isCurrentlyActive = isUserActive(selectedUser.status);
            const themeColor = isCurrentlyActive ? 'danger' : 'success';
            const titleText = isCurrentlyActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản';
            const descText = isCurrentlyActive ? 'Đình chỉ tài khoản' : 'Khôi phục quyền truy cập cho';
            const iconName = isCurrentlyActive ? 'bi-lock-fill' : 'bi-unlock-fill';
            const btnText = isCurrentlyActive ? 'Xác nhận Khóa' : 'Xác nhận Mở khóa';

            return (
              <div className="modal-overlay d-flex align-items-center justify-content-center" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 1050 }}>
                <div className="card border-0 shadow-lg" style={{ width: '100%', maxWidth: '500px', borderRadius: '16px', overflow: 'hidden' }}>
                  <div className="p-4 p-md-5">
                    {/* Modal Header */}
                    <div className="d-flex gap-3 mb-4">
                      <div className={`rounded-circle bg-${themeColor} bg-opacity-10 text-${themeColor} d-flex align-items-center justify-content-center flex-shrink-0`} style={{ width: '48px', height: '48px', fontSize: '24px' }}>
                        <i className={iconName}></i>
                      </div>
                      <div>
                        <h4 className="fw-bold text-dark mb-1">{titleText}</h4>
                        <p className="text-muted small mb-0" style={{ lineHeight: '1.5' }}>
                          {descText} <span className="fw-bold text-dark">{selectedUser.name || selectedUser.fullName || 'N/A'}</span><br />
                          ({selectedUser.cccd || selectedUser.cccdNumber || selectedUser.email}).
                        </p>  
                      </div>
                    </div>

                    {/* Modal Body */}
                    <div className="border-top pt-4 mb-4">
                      <label htmlFor="lockReason" className="form-label fw-bold small text-dark mb-2">
                        Lý do thao tác <span className="text-danger">*</span>
                      </label>
                      <textarea 
                        id="lockReason"
                        className="form-control"
                        rows={4}
                        placeholder={`Nhập lý do ${titleText.toLowerCase()} để lưu vết hệ thống...`}
                        value={lockReason}
                        onChange={(e) => dispatch({ type: 'patch', payload: { lockReason: e.target.value } })}
                        style={{ borderRadius: '8px', resize: 'none' }}
                      />
                      <div className="d-flex align-items-center gap-2 text-muted small mt-2">
                        <i className="bi bi-shield-check"></i>
                        Hành động này sẽ được lưu lại vào Lịch sử thao tác.
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="d-flex justify-content-end gap-2 border-top pt-4">
                      <button type="button" className="btn btn-light border fw-semibold px-4" style={{ borderRadius: '8px' }} onClick={() => dispatch({ type: 'closeLockModal' })}>Hủy</button>
                      
                      {/* GỌI HÀM MỚI Ở ĐÂY */}
                      <button type="button" className={`btn btn-${themeColor} fw-semibold px-4`} style={{ borderRadius: '8px' }} onClick={handleConfirmStatusChange}>
                        {btnText}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()
        )}

      </div>
    </AdminLayout>
  );
};
const getRoleDisplayName = (role) => {
  if (role === 'ROLE_CITIZEN') return 'Công dân';
  if (role === 'ROLE_TAX_OFFICER') return 'Cán bộ Thuế';
  if (role === 'ROLE_LAND_OFFICER') return 'Cán bộ Địa chính';
  if (role === 'ROLE_ADMIN') return 'Quản trị viên';
  return role || 'N/A';
};
// Cập nhật hàm lấy màu sắc (check theo mã của Backend)
const getRoleBadgeClass = (role) => {
  if (role === 'ROLE_CITIZEN') return 'bg-primary bg-opacity-10 text-primary';
  if (role === 'ROLE_TAX_OFFICER') return 'bg-success bg-opacity-10 text-success';
  if (role === 'ROLE_LAND_OFFICER') return 'bg-info bg-opacity-10 text-info';
  if (role === 'ROLE_ADMIN') return 'bg-danger bg-opacity-10 text-danger';
  return 'bg-secondary bg-opacity-10 text-secondary';
};
const isUserActive = (status) => {
  if (!status) return false;
  const upperStatus = String(status).toUpperCase();
  return upperStatus === 'ACTIVE' || upperStatus === 'HOẠT ĐỘNG';
};

const getLockActionLabel = (status) =>
  isUserActive(status) ? 'Khóa tài khoản' : 'Mở khóa tài khoản';

const getLockActionIcon = (status) =>
  isUserActive(status) ? 'bi bi-lock-fill' : 'bi bi-unlock-fill';

const getStatusClass = (status) => {
  if (!status) return 'text-secondary';
  
  const upperStatus = String(status).toUpperCase();
  if (upperStatus === 'ACTIVE' || upperStatus === 'HOẠT ĐỘNG') {
    return 'text-success';
  }
  if (upperStatus === 'LOCKED' || upperStatus === 'BỊ KHÓA') {
    return 'text-danger';
  }
  return 'text-secondary';
};

const getStatusDotClass = (status) => {
  const upperStatus = String(status).toUpperCase();
  if (upperStatus === 'ACTIVE' || upperStatus === 'HOẠT ĐỘNG') {
    return 'bg-success';
  }
  if (upperStatus === 'LOCKED' || upperStatus === 'BỊ KHÓA') {
    return 'bg-danger';
  }
  return 'bg-secondary';
};

const getStatusDisplay = (status) => {
  if (!status) return 'N/A';
  
  const upperStatus = String(status).toUpperCase();
  if (upperStatus === 'ACTIVE') return 'Hoạt động';
  if (upperStatus === 'LOCKED') return 'Bị khóa';
  
  return status;
};
export default UserManagement;
