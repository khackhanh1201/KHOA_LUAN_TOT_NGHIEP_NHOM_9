import React from 'react';
import UserTable from './UserTable';

const DelegationTabContent = ({
  activeTab,
  searchTerm,
  onPatch,
  filteredRoleTabUsers,
  filteredDelegationTabUsers,
  usersForRoleTab,
  usersForDelegationTab,
  onOpenRoleModal,
  onOpenDelegateModal,
}) => (
  <>
    <div className="px-4 py-3 border-bottom bg-white">
      <div className="position-relative">
        <i
          className="bi bi-search position-absolute text-muted"
          style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        />
        <input
          type="search"
          className="form-control py-2 bg-light border-0"
          placeholder="Tìm kiếm theo Họ tên, CCCD, Email, SĐT, Chức vụ..."
          aria-label="Tìm kiếm theo Họ tên, CCCD, Email, SĐT, Chức vụ"
          value={searchTerm}
          onChange={(e) => onPatch({ searchTerm: e.target.value })}
          onInput={(e) => onPatch({ searchTerm: e.target.value })}
          style={{ paddingLeft: '36px', borderRadius: '8px' }}
          autoComplete="off"
        />
        {searchTerm && (
          <button
            type="button"
            className="btn btn-sm btn-link text-muted position-absolute"
            style={{ right: '4px', top: '50%', transform: 'translateY(-50%)', textDecoration: 'none' }}
            onClick={() => onPatch({ searchTerm: '' })}
            aria-label="Xóa tìm kiếm"
          >
            <i className="bi bi-x-lg" />
          </button>
        )}
      </div>
    </div>
    {activeTab === 'roles' && (
      <>
        <div className="px-4 py-3 bg-light border-bottom small text-muted">
          Gán quyền <strong>Cán bộ Thuế</strong>, <strong>Cán bộ Địa chính</strong> hoặc{' '}
          <strong>Người dân</strong>. Không gán quyền Admin tại đây.
        </div>
        <UserTable
          list={filteredRoleTabUsers}
          mode="roles"
          totalInTab={usersForRoleTab.length}
          searchTerm={searchTerm}
          onOpenRoleModal={onOpenRoleModal}
          onOpenDelegateModal={onOpenDelegateModal}
        />
      </>
    )}
    {activeTab === 'delegation' && (
      <>
        <div className="px-4 py-3 bg-warning bg-opacity-10 border-bottom small text-dark">
          <i className="bi bi-exclamation-triangle me-1" />
          Chỉ có thể <strong>ủy quyền quyền Quản trị viên</strong>. Sau khi ủy quyền, tài
          khoản Admin hiện tại sẽ trở thành Người dân và bạn sẽ bị đăng xuất.
        </div>
        <UserTable
          list={filteredDelegationTabUsers}
          mode="delegation"
          totalInTab={usersForDelegationTab.length}
          searchTerm={searchTerm}
          onOpenRoleModal={onOpenRoleModal}
          onOpenDelegateModal={onOpenDelegateModal}
        />
      </>
    )}
  </>
);

export default DelegationTabContent;
