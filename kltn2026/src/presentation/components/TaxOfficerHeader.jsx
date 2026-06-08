import React from 'react';
import TaxOfficerNotificationPanel from './TaxOfficerNotificationPanel';
import { layoutStyles as styles } from './taxOfficerLayoutStyles';

const TaxOfficerHeader = ({
  displayName,
  dropdownRef,
  isDropdownOpen,
  setIsDropdownOpen,
  notiRef,
  notiOpen,
  setNotiOpen,
  unreadCount,
  notiLoading,
  notifications,
  markRead,
  markAllRead,
  navigate,
  onLogout,
  onOpenSwitchRole,
}) => (
  <header style={styles.header} className="d-flex justify-content-between align-items-center px-4">
    <div className="d-flex align-items-center">
      <img
        src="https://vneid.gov.vn/_next/static/media/logo-full-vneid.c28b5b54.png"
        alt="logo"
        style={{ height: '35px' }}
      />
      <div className="ms-3 text-white text-start d-none d-md-block">
        <div className="fw-bold" style={{ fontSize: '13px', lineHeight: '1.2' }}>
          HỆ THỐNG PHÂN HỆ
        </div>
        <div style={{ fontSize: '12px' }} className="opacity-75 text-uppercase">
          Quản lý thuế đất đai
        </div>
      </div>
    </div>

    <div className="d-flex align-items-center text-white gap-3">
      <TaxOfficerNotificationPanel
        notiRef={notiRef}
        notiOpen={notiOpen}
        setNotiOpen={setNotiOpen}
        unreadCount={unreadCount}
        notiLoading={notiLoading}
        notifications={notifications}
        markRead={markRead}
        markAllRead={markAllRead}
        navigate={navigate}
      />

      <div className="position-relative" ref={dropdownRef}>
        <button
          type="button"
          className="d-flex align-items-center cursor-pointer border-0 bg-transparent text-white p-0"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          aria-label="Mở menu tài khoản"
          aria-expanded={isDropdownOpen}
        >
          <div className="me-3 text-end">
            <div className="fw-bold text-uppercase" style={{ fontSize: '14px' }}>
              {displayName}
            </div>
            <div style={{ fontSize: '12px' }} className="text-warning fw-bold">
              Cán bộ nghiệp vụ
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

        {isDropdownOpen && (
          <div className="shadow-lg border-0" style={styles.dropdownMenu}>
            <div className="p-3 border-bottom d-flex align-items-center">
              <div className="me-3 flex-grow-1 text-start">
                <div className="fw-bold text-dark">{displayName}</div>
                <div className="small text-muted">
                  Định danh mức 2 <i className="bi bi-shield-check-fill text-danger" />
                </div>
              </div>
              <img
                src="https://upload.wikimedia.org/wikipedia/vi/a/ad/VNeID_logo.webp"
                alt="avatar"
                style={{ width: '45px', height: '45px' }}
              />
            </div>
            <div className="list-group list-group-flush text-start">
              <button
                type="button"
                className="list-group-item list-group-item-action border-0 py-3 small"
                onClick={() => navigate('/account')}
              >
                <i className="bi bi-key me-3" /> Đổi mật khẩu
              </button>
              <button type="button" className="list-group-item list-group-item-action border-0 py-3 small">
                <i className="bi bi-shield-lock me-3" /> Đổi passcode
              </button>
              <button type="button" className="list-group-item list-group-item-action border-0 py-3 small text-danger">
                <i className="bi bi-slash-circle me-3" /> Yêu cầu khóa tài khoản
              </button>
              <button
                type="button"
                className="list-group-item list-group-item-action border-0 py-3 small"
                onClick={onOpenSwitchRole}
              >
                <i className="bi bi-person-gear me-3" /> Đổi tài khoản
              </button>
              <button
                type="button"
                className="list-group-item list-group-item-action border-0 py-3 small"
                onClick={onLogout}
              >
                <i className="bi bi-box-arrow-right me-3" /> Đăng xuất
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  </header>
);

export default TaxOfficerHeader;
