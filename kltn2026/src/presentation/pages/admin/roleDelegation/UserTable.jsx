import React from 'react';
import {
  getUserCccd,
  getRoleKey,
  getRoleBadgeClass,
  formatStatus,
  ROLE_DISPLAY,
} from './roleDelegationUtils';

const UserTable = ({ list, mode, totalInTab, searchTerm, onOpenRoleModal, onOpenDelegateModal }) => {
  const emptyMessage =
    mode === 'delegation'
      ? 'Không có người dùng nào có thể nhận ủy quyền Admin'
      : 'Không có người dùng nào để phân quyền';
  const noResultMessage = searchTerm.trim()
    ? `Không tìm thấy kết quả cho "${searchTerm.trim()}"`
    : emptyMessage;

  return (
    <div className="p-0">
      {totalInTab > 0 && (
        <div className="px-4 py-2 border-bottom bg-white small text-muted">
          Hiển thị <strong>{list.length}</strong> / {totalInTab} người dùng
          {searchTerm.trim() ? ` (đang lọc: "${searchTerm.trim()}")` : ''}
        </div>
      )}
      <div className="table-responsive">
        <table className="table table-borderless table-hover align-middle mb-0" style={{ minWidth: '800px' }}>
          <thead className="bg-light border-bottom">
            <tr>
              <th className="py-3 px-4 text-muted small fw-bold">HỌ TÊN / CCCD</th>
              <th className="py-3 px-4 text-muted small fw-bold">CHỨC VỤ</th>
              <th className="py-3 px-4 text-muted small fw-bold">TRẠNG THÁI</th>
              <th className="py-3 px-4 text-muted small fw-bold text-end">THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-5 text-muted">
                  {noResultMessage}
                </td>
              </tr>
            ) : (
              list.map((usr, idx) => {
                const roleKey = getRoleKey(usr);
                const statusInfo = formatStatus(usr.status || usr.account_status);
                return (
                  <tr
                    key={usr.accountId ?? `${getUserCccd(usr)}-${roleKey}-${idx}`}
                    className={idx !== list.length - 1 ? 'border-bottom' : ''}
                  >
                    <td className="py-3 px-4">
                      <div className="fw-bold text-dark">{usr.fullName || usr.full_name || usr.name}</div>
                      <div className="text-muted small font-monospace mt-1">{getUserCccd(usr)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge rounded-pill px-3 py-2 fw-semibold ${getRoleBadgeClass(roleKey)}`}>
                        {ROLE_DISPLAY[roleKey] || roleKey}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div
                        className={`d-flex align-items-center gap-2 small fw-semibold ${
                          statusInfo.ok ? 'text-success' : 'text-secondary'
                        }`}
                      >
                        <div
                          className={`rounded-circle ${statusInfo.ok ? 'bg-success' : 'bg-secondary'}`}
                          style={{ width: '8px', height: '8px' }}
                        />
                        {statusInfo.label}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-end">
                      {mode === 'roles' ? (
                        <button
                          type="button"
                          className="btn bg-primary bg-opacity-10 text-primary rounded-pill fw-semibold px-4 py-2 border-0"
                          style={{ fontSize: '13px' }}
                          onClick={() => onOpenRoleModal(usr)}
                        >
                          Thiết lập quyền
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn bg-danger bg-opacity-10 text-danger rounded-pill fw-semibold px-4 py-2 border-0"
                          style={{ fontSize: '13px' }}
                          onClick={() => onOpenDelegateModal(usr)}
                        >
                          Ủy quyền Admin
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
