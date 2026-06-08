import React from 'react';
import { getUserCccd, getRoleKey, ROLE_DISPLAY } from './roleDelegationUtils';

const DelegateModal = ({ delegateTarget, delegating, onClose, onConfirm }) => (
  <div
    className="modal-overlay d-flex align-items-center justify-content-center"
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      zIndex: 1050,
    }}
  >
    <div
      className="card border-0 shadow-lg"
      style={{ width: '100%', maxWidth: '480px', borderRadius: '16px', overflow: 'hidden' }}
    >
      <div className="bg-danger text-white px-4 py-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold">
          <i className="bi bi-shield-check me-2" />
          Ủy quyền Quản trị viên
        </h5>
        <button
          type="button"
          className="btn text-white fs-4 p-0"
          disabled={delegating}
          onClick={onClose}
          aria-label="Đóng"
        >
          <i className="bi bi-x" />
        </button>
      </div>
      <div className="p-4">
        <p className="text-muted small mb-3">
          Người nhận sẽ trở thành <strong>Quản trị viên</strong> hệ thống. Bạn sẽ mất quyền Admin,
          chuyển sang <strong>Người dân</strong> và bị đăng xuất.
        </p>
        <div className="bg-light border rounded-3 p-3 mb-4">
          <div className="fw-bold">{delegateTarget.fullName || delegateTarget.full_name}</div>
          <div className="text-muted small font-monospace mt-1">CCCD: {getUserCccd(delegateTarget)}</div>
          <div className="small mt-2">
            Chức vụ hiện tại:{' '}
            <span className="fw-semibold">{ROLE_DISPLAY[getRoleKey(delegateTarget)] || getRoleKey(delegateTarget)}</span>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-light border fw-semibold flex-grow-1"
            disabled={delegating}
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            type="button"
            className="btn btn-danger fw-semibold flex-grow-1"
            disabled={delegating}
            onClick={onConfirm}
          >
            {delegating ? 'Đang xử lý...' : 'Xác nhận ủy quyền'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default DelegateModal;
