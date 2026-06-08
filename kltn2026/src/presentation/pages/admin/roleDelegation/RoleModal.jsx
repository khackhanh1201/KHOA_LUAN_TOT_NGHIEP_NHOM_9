import React from 'react';
import { ASSIGNABLE_ROLES, ROLE_DISPLAY, getUserCccd } from './roleDelegationUtils';

const RoleModal = ({ selectedUser, selectedRoleCode, onClose, onPatch, onSave }) => (
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
      style={{ width: '100%', maxWidth: '550px', borderRadius: '16px', overflow: 'hidden' }}
    >
      <div className="bg-danger text-white px-4 py-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-key fs-5" />
          <h5 className="mb-0 fw-bold">Cập nhật quyền hạn</h5>
        </div>
        <button type="button" className="btn text-white fs-4 p-0" onClick={onClose} aria-label="Đóng">
          <i className="bi bi-x" />
        </button>
      </div>

      <div className="p-4">
        <div className="d-flex align-items-center gap-3 p-3 border rounded-3 mb-4 bg-light">
          <div
            className="rounded-circle bg-white border d-flex align-items-center justify-content-center text-muted"
            style={{ width: '48px', height: '48px', fontSize: '24px' }}
          >
            <i className="bi bi-person" />
          </div>
          <div>
            <div className="fw-bold text-dark" style={{ fontSize: '16px' }}>
              {selectedUser.fullName || selectedUser.full_name}
            </div>
            <div className="text-muted small mt-1 font-monospace">CCCD: {getUserCccd(selectedUser)}</div>
          </div>
        </div>

        <div className="fw-bold text-secondary mb-3 small">Chọn quyền (không bao gồm Admin)</div>

        <div className="d-flex flex-column gap-3">
          {ASSIGNABLE_ROLES.map((code) => (
            <label
              key={code}
              className={`d-flex align-items-start gap-3 p-3 border rounded-3 cursor-pointer shadow-sm ${
                selectedRoleCode === code
                  ? code === 'TAX_OFFICER'
                    ? 'border-primary bg-primary bg-opacity-10'
                    : code === 'LAND_OFFICER'
                      ? 'border-success bg-success bg-opacity-10'
                      : 'border-secondary bg-secondary bg-opacity-10'
                  : 'bg-white'
              }`}
            >
              <input
                type="radio"
                name="roleSelect"
                className="form-check-input mt-1"
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                checked={selectedRoleCode === code}
                onChange={() => onPatch({ selectedRoleCode: code })}
              />
              <div>
                <div className="fw-bold">{ROLE_DISPLAY[code]}</div>
                <div className="text-muted small mt-1 font-monospace">{code}</div>
              </div>
            </label>
          ))}
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
          <button
            type="button"
            className="btn btn-light border fw-semibold px-4"
            style={{ borderRadius: '8px' }}
            onClick={onClose}
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            className="btn btn-danger fw-semibold px-4 d-flex align-items-center gap-2"
            style={{ borderRadius: '8px' }}
            onClick={onSave}
          >
            <i className="bi bi-check2" /> Lưu phân quyền
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default RoleModal;
