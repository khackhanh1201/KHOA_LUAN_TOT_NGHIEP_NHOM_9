import React from 'react';
import { ROLE_LABELS } from '../../usecases/authService';
import { backdropA11yProps } from '../../utils/a11y';
import { styles } from './cadastralLayoutStyles';

const closeOverlayIfTarget = (onClose) => (event) => {
  if (event.target === event.currentTarget) onClose(event);
};

const CadastralSwitchRoleModal = ({
  show,
  displayName,
  userRoles,
  currentRole,
  onClose,
  onSwitchRole,
}) => {
  if (!show) return null;

  return (
    <div style={styles.modalOverlay} {...backdropA11yProps(closeOverlayIfTarget(onClose))}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <h5 style={{ margin: 0, fontWeight: 700, fontSize: 18, color: '#1e293b' }}>Đổi tài khoản</h5>
          <button type="button" style={styles.modalCloseBtn} onClick={onClose} aria-label="Đóng">
            <i className="bi bi-x" style={{ fontSize: 22 }}></i>
          </button>
        </div>

        <div style={styles.modalBody}>
          {userRoles.map((role) => {
            const isActive = role === currentRole;
            return (
              <button
                type="button"
                key={role}
                style={{
                  ...styles.roleItem,
                  backgroundColor: isActive ? '#fffbeb' : '#fff',
                  cursor: 'pointer',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                }}
                onClick={() => onSwitchRole(role)}
              >
                <div style={styles.roleAvatar}>
                  <img
                    src="https://upload.wikimedia.org/wikipedia/vi/a/ad/VNeID_logo.webp"
                    alt="avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b', marginBottom: 2 }}>
                    {displayName}
                  </div>
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>
                    {ROLE_LABELS[role] || role}
                  </div>
                </div>

                {isActive && (
                  <div style={styles.checkmark}>
                    <i className="bi bi-check-lg" style={{ fontSize: 16, color: '#fff' }}></i>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CadastralSwitchRoleModal;
