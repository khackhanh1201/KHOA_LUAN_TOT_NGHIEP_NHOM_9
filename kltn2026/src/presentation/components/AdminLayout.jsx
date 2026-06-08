import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { backdropA11yProps, interactiveDivProps } from '../../utils/a11y';
import { getDisplayName, clearSession, switchRole, getUserRoles, ROLE_LABELS, getLandTaxSystemPath } from '../../usecases/authService';
import { useAuth } from '../../hooks/useAuth';

const AdminLayout = ({ children, user }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSwitchRoleModal, setShowSwitchRoleModal] = useState(false);

  const dropdownRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const auth = useAuth();
  const currentUser = user || auth.user;
  const displayName = user ? getDisplayName(user, 'Admin') : (auth.displayName || 'Admin');

  // Lấy danh sách roles của user hiện tại
  const userRoles = getUserRoles();

  const handleSwitchRole = (newRole) => {
    if (newRole === auth.role) {
      setShowSwitchRoleModal(false);
      return;
    }
    switchRole(newRole);
    setShowSwitchRoleModal(false);
    setIsDropdownOpen(false);
    // Chuyển hướng đến dashboard tương ứng với role mới
    const targetPath = getLandTaxSystemPath(newRole);
    navigate(targetPath);
  };

  useEffect(() => {
    console.debug('[AdminLayout] user →', currentUser, '| role:', auth.role);
  }, [currentUser, auth.role]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  return (
    <div style={styles.wrapper}>
      {/* ================= HEADER ================= */}
      <header
        style={styles.header}
        className="d-flex justify-content-between align-items-center px-4"
      >
        <div className="d-flex align-items-center">
          <img
            src="https://vneid.gov.vn/_next/static/media/logo-full-vneid.c28b5b54.png"
            alt="logo"
            style={{ height: '35px' }}
          />

          <div className="ms-3 text-white text-start d-none d-md-block">
            <div
              className="fw-bold"
              style={{ fontSize: '13px', lineHeight: '1.2' }}
            >
              HỆ THỐNG QUẢN TRỊ
            </div>

            <div
              style={{ fontSize: '12px' }}
              className="opacity-75 text-uppercase"
            >
              Quản lý thuế đất đai
            </div>
          </div>
        </div>

        {/* USER */}
        <div
          className="d-flex align-items-center text-white position-relative"
          ref={dropdownRef}
        >
          <div className="position-relative me-4 cursor-pointer">
            <i className="bi bi-bell fs-5"></i>

            <span
              className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark"
              style={{
                fontSize: '12px',
                padding: '2px 5px',
              }}
            >
              3
            </span>
          </div>

          <button
            type="button"
            className="d-flex align-items-center cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
            style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer' }}
          >            <div className="me-3 text-end">
              <div
                className="fw-bold text-uppercase"
                style={{ fontSize: '14px' }}
              >
                {displayName}
              </div>

              <div
                style={{ fontSize: '12px' }}
                className="text-warning fw-bold"
              >
                Quản trị viên
              </div>
            </div>

            <div style={styles.avatarWrapper}>
              <img
                src="https://upload.wikimedia.org/wikipedia/vi/a/ad/VNeID_logo.webp"
                alt="avatar"
                style={styles.avatarImage}
              />
            </div>
          </button>

          {/* DROPDOWN */}
          {isDropdownOpen && (
            <div className="shadow-lg border-0" style={styles.dropdownMenu}>
              <div className="p-3 border-bottom d-flex align-items-center">
                <div className="me-3 flex-grow-1 text-start">
                  <div className="fw-bold text-dark">{displayName}</div>
                  <div className="small text-muted">
                    Định danh mức 2 <i className="bi bi-shield-check-fill text-danger"></i>
                  </div>
                </div>
                <img src="https://upload.wikimedia.org/wikipedia/vi/a/ad/VNeID_logo.webp" alt="avatar" style={{width: '45px', height: '45px'}} />
              </div>

              <div className="list-group list-group-flush text-start">
                <button type="button" className="list-group-item list-group-item-action border-0 py-3 small"><i className="bi bi-key me-3"></i> Đổi mật khẩu</button>
                <button type="button" className="list-group-item list-group-item-action border-0 py-3 small"><i className="bi bi-shield-lock me-3"></i> Đổi passcode</button>
                <button type="button" className="list-group-item list-group-item-action border-0 py-3 small text-danger"><i className="bi bi-slash-circle me-3"></i> Yêu cầu khóa tài khoản</button>
                <button type="button" className="list-group-item list-group-item-action border-0 py-3 small" onClick={() => { setShowSwitchRoleModal(true); setIsDropdownOpen(false); }}><i className="bi bi-person-gear me-3"></i> Đổi tài khoản</button>
                <button type="button" className="list-group-item list-group-item-action border-0 py-3 small"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-3"></i> Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* SWITCH ROLE MODAL */}
      {showSwitchRoleModal && (
        <div style={styles.modalOverlay} {...backdropA11yProps(() => setShowSwitchRoleModal(false))}>
          <div style={styles.modalContent}>
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <h5 style={{ margin: 0, fontWeight: 700, fontSize: 18, color: '#1e293b' }}>Đổi tài khoản</h5>
              <button type="button" style={styles.modalCloseBtn}
                onClick={() => setShowSwitchRoleModal(false)}
                aria-label="Đóng"
              >
                <i className="bi bi-x" style={{ fontSize: 22 }}></i>
              </button>
            </div>

            {/* Modal Body — Danh sách role */}
            <div style={styles.modalBody}>
              {userRoles.map((role) => {
                const isActive = role === auth.role;
                return (
                  <div
                    key={role}
                    {...interactiveDivProps(() => handleSwitchRole(role), `Chuyển sang ${ROLE_LABELS[role] || role}`)}
                    style={{
                      ...styles.roleItem,
                      backgroundColor: isActive ? '#fffbeb' : '#fff',
                      cursor: 'pointer',
                    }}
                  >                    {/* Avatar */}
                    <div style={styles.roleAvatar}>
                      <img
                        src="https://upload.wikimedia.org/wikipedia/vi/a/ad/VNeID_logo.webp"
                        alt="avatar"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>

                    {/* Thông tin */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b', marginBottom: 2 }}>
                        {displayName}
                      </div>
                      <div style={{ fontSize: 13, color: '#94a3b8' }}>
                        {ROLE_LABELS[role] || role}
                      </div>
                    </div>

                    {/* Checkmark khi active */}
                    {isActive && (
                      <div style={styles.checkmark}>
                        <i className="bi bi-check-lg" style={{ fontSize: 16, color: '#fff' }}></i>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= BODY ================= */}
      <div style={styles.bodyContainer}>
        {/* ================= SIDEBAR ================= */}
        <nav style={styles.sidebar}>
          <div style={{ padding: '18px 14px' }}>
            <NavItem
              active={location.pathname === '/admin/dashboard'}
              icon="bi-grid"
              label="Bảng điều khiển"
              onClick={() => navigate('/admin/dashboard')}
            />

            <NavItem
              active={location.pathname === '/admin/users'}
              icon="bi-person-gear"
              label="Quản lý người dùng"
              onClick={() => navigate('/admin/users')}
            />

            {/* ĐÃ FIX LINK */}
            <NavItem
              active={location.pathname === '/admin/roles'}
              icon="bi-shield-check"
              label="Phân & Ủy quyền"
              onClick={() => navigate('/admin/roles')} 
            />

            {/* ĐÃ FIX LINK */}
            <NavItem
              active={location.pathname === '/admin/operations'}
              icon="bi-clock-history"
              label="Lịch sử thao tác"
              onClick={() => navigate('/admin/operations')}
            />

            <NavItem
              active={location.pathname === '/admin/report-stats'}
              icon="bi-bar-chart"
              label="Báo cáo - Thống kê"
              onClick={() => navigate('/admin/report-stats')}
            />

            {/* ĐÃ FIX LINK */}
            <NavItem
              active={location.pathname === '/admin/categories'}
              icon="bi-database"
              label="Quản lý danh mục"
              onClick={() => navigate('/admin/categories')}
            />

            <NavItem
              active={location.pathname === '/account'}
              icon="bi-person-circle"
              label="Tài khoản"
              onClick={() => navigate('/account')}
            />
          </div>
        </nav>

        {/* ================= CONTENT ================= */}
        <main style={styles.content}>{children}</main>
      </div>
    </div>
  );
};

/* ================= NAV ITEM ================= */

const navButtonReset = {
  border: 'none',
  background: 'transparent',
  width: '100%',
  textAlign: 'left',
  padding: 0,
  cursor: 'pointer',
  font: 'inherit',
  color: 'inherit',
  display: 'flex',
  alignItems: 'center',
};

const NavItem = ({ active, icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      ...navButtonReset,
      ...styles.navItem,
      ...(active ? styles.navItemActive : {}),
    }}
    className="mb-2"
  >    <div style={styles.iconWrapper}>
      <i
        className={`bi ${icon}`}
        style={{
          fontSize: '20px',
          color: active ? '#ffffff' : '#667085',
        }}
      ></i>
    </div>

    <span
      style={{
        marginLeft: '14px',
        fontSize: '15px',
        fontWeight: active ? '700' : '500',
        color: active ? '#ffffff' : '#475467',
      }}
    >
      {label}
    </span>
  </button>
);

/* ================= STYLES ================= */

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
  },

  header: {
    height: '70px',
    backgroundColor: '#a30d11',
    borderBottom: '2px solid #fbbf24',
    flexShrink: 0,
    zIndex: 1000,
  },

  bodyContainer: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },

  sidebar: {
    width: '320px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e5e7eb',
    paddingTop: '10px',
    overflowY: 'auto',
  },

  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    backgroundColor: '#f8fafc',
  },

  navItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 16px',
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  navItemActive: {
    backgroundColor: '#c5161d',
  },

  iconWrapper: {
    width: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarWrapper: {
    width: '42px',
    height: '42px',
    backgroundColor: '#fff',
    borderRadius: '50%',
    border: '2px solid #fbbf24',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: '3px',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },

  dropdownMenu: {
    position: 'absolute',
    top: '65px',
    right: '0',
    width: '240px',
    backgroundColor: '#fff',
    borderRadius: '14px',
    overflow: 'hidden',
    zIndex: 1000,
    boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
  },

  /* ================= SWITCH ROLE MODAL ================= */
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },

  modalContent: {
    width: '420px',
    maxWidth: '90vw',
    backgroundColor: '#fff',
    borderRadius: '18px',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 24px',
    borderBottom: '1px solid #f1f5f9',
  },

  modalCloseBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    transition: 'background 0.2s',
  },

  modalBody: {
    padding: '12px 16px 20px',
  },

  roleItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 16px',
    borderRadius: '14px',
    transition: 'background 0.2s ease',
    marginBottom: '4px',
  },

  roleAvatar: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    border: '2px solid #ffc107',
    overflow: 'hidden',
    flexShrink: 0,
    backgroundColor: '#fff',
    padding: '3px',
  },

  checkmark: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#eab308',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
};

export default AdminLayout;