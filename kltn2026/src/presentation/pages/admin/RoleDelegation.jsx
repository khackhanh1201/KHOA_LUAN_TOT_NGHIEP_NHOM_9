import React, { useReducer, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { adminApi } from '../../../infrastructure/api/adminApi';
import { useAppDialog } from '../../components/dialog/DialogContext';
import { clearSession, getCurrentUser } from '../../../usecases/authService';
import { useAsyncMountLoadWithReload } from '../../../hooks/useAsyncMountLoad';
import {
  getUserCccd,
  loadDelegationUsers,
  initialState,
  roleDelegationReducer,
  filterUsersForRoleTab,
  filterUsersForDelegationTab,
  filterUsersBySearch,
  getInitialRoleCode,
  saveUserRole,
  createDelegation,
} from './roleDelegation/roleDelegationUtils';
import DelegationTabContent from './roleDelegation/DelegationTabContent';
import RoleModal from './roleDelegation/RoleModal';
import DelegateModal from './roleDelegation/DelegateModal';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';

const RoleDelegation = () => {
  const user = JSON.parse(localStorage.getItem('user_info') || '{}');
  const navigate = useNavigate();
  const { showAlert, showConfirm } = useAppDialog();

  const { data: loadedUsers, isLoading, reload: reloadUsers } = useAsyncMountLoadWithReload(loadDelegationUsers);
  const [state, dispatch] = useReducer(roleDelegationReducer, initialState);
  const {
    localUsers,
    isRoleModalOpen,
    selectedUser,
    selectedRoleCode,
    isDelegateModalOpen,
    delegateTarget,
    delegating,
    activeTab,
    searchTerm,
  } = state;

  const users = localUsers ?? loadedUsers ?? EMPTY_ARRAY;

  const currentAdminCccd = useMemo(() => {
    const u = getCurrentUser();
    return u?.cccdNumber || u?.cccd_number || u?.cccd || user?.cccdNumber || user?.cccd || '';
  }, [user]);

  const usersForRoleTab = useMemo(() => filterUsersForRoleTab(users), [users]);
  const usersForDelegationTab = useMemo(
    () => filterUsersForDelegationTab(users, currentAdminCccd),
    [users, currentAdminCccd]
  );
  const filteredRoleTabUsers = useMemo(
    () => filterUsersBySearch(usersForRoleTab, searchTerm),
    [usersForRoleTab, searchTerm]
  );
  const filteredDelegationTabUsers = useMemo(
    () => filterUsersBySearch(usersForDelegationTab, searchTerm),
    [usersForDelegationTab, searchTerm]
  );

  const fetchData = () => {
    dispatch({ type: 'resetLocalUsers' });
    reloadUsers();
  };

  const handlePatch = (payload) => dispatch({ type: 'patch', payload });

  const handleSaveRole = () =>
    saveUserRole({
      selectedUser,
      selectedRoleCode,
      showAlert,
      adminApi,
      onSuccess: fetchData,
      onClose: () => dispatch({ type: 'closeRoleModal' }),
    });

  const handleOpenRoleModal = (usr) => {
    dispatch({ type: 'openRoleModal', user: usr, roleCode: getInitialRoleCode(usr) });
  };

  const handleOpenDelegateModal = (usr) => {
    dispatch({ type: 'openDelegateModal', user: usr });
  };

  const handleCreateDelegation = () =>
    createDelegation({
      delegateTarget,
      currentAdminCccd,
      showAlert,
      showConfirm,
      adminApi,
      clearSession,
      navigate,
      onDelegatingChange: (value) => handlePatch({ delegating: value }),
      onCloseModal: () => dispatch({ type: 'closeDelegateModal' }),
    });

  return (
    <AdminLayout user={user}>
      <div className="container py-4" style={{ maxWidth: '1140px' }}>
        <div className="mb-4">
          <h3 className="fw-bold">Phân & Ủy quyền</h3>
          <p className="text-muted">Quản lý vai trò truy cập và ủy quyền quyền Quản trị viên</p>
        </div>

        <div className="card shadow-sm border-0 mb-5" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div className="d-flex border-bottom px-3 bg-white" style={{ overflowX: 'auto' }}>
            <button
              type="button"
              className={`btn flex-shrink-0 fw-bold rounded-0 px-4 py-3 ${activeTab === 'roles' ? 'text-danger border-danger' : 'text-muted border-transparent'}`}
              style={{
                border: 'none',
                borderBottom: `2px solid ${activeTab === 'roles' ? '#b91c1c' : 'transparent'}`,
                fontSize: '15px',
              }}
              onClick={() => handlePatch({ activeTab: 'roles' })}
            >
              <i className="bi bi-key me-2" /> Phân quyền
            </button>
            <button
              type="button"
              className={`btn flex-shrink-0 fw-bold rounded-0 px-4 py-3 ${activeTab === 'delegation' ? 'text-danger border-danger' : 'text-muted border-transparent'}`}
              style={{
                border: 'none',
                borderBottom: `2px solid ${activeTab === 'delegation' ? '#b91c1c' : 'transparent'}`,
                fontSize: '15px',
              }}
              onClick={() => handlePatch({ activeTab: 'delegation' })}
            >
              <i className="bi bi-link-45deg me-2" /> Ủy quyền
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-danger" />
            </div>
          ) : (
            <DelegationTabContent
              activeTab={activeTab}
              searchTerm={searchTerm}
              onPatch={handlePatch}
              filteredRoleTabUsers={filteredRoleTabUsers}
              filteredDelegationTabUsers={filteredDelegationTabUsers}
              usersForRoleTab={usersForRoleTab}
              usersForDelegationTab={usersForDelegationTab}
              onOpenRoleModal={handleOpenRoleModal}
              onOpenDelegateModal={handleOpenDelegateModal}
            />
          )}
        </div>

        {isRoleModalOpen && selectedUser && (
          <RoleModal
            selectedUser={selectedUser}
            selectedRoleCode={selectedRoleCode}
            onClose={() => dispatch({ type: 'closeRoleModal' })}
            onPatch={handlePatch}
            onSave={handleSaveRole}
          />
        )}

        {isDelegateModalOpen && delegateTarget && (
          <DelegateModal
            delegateTarget={delegateTarget}
            delegating={delegating}
            onClose={() => dispatch({ type: 'closeDelegateModal' })}
            onConfirm={handleCreateDelegation}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default RoleDelegation;
