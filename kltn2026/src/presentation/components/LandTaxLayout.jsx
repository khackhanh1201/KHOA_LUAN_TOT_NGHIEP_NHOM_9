import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getDisplayName, clearSession, switchRole, getUserRoles, getLandTaxSystemPath } from '../../usecases/authService';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { usePendingDeclarationCount } from '../../hooks/usePendingDeclarationCount';
import LandTaxHeader from './LandTaxHeader';
import LandTaxSidebar from './LandTaxSidebar';
import LandTaxSwitchRoleModal from './LandTaxSwitchRoleModal';
import { layoutStyles as styles } from './landTaxLayoutStyles';

const LandTaxLayout = ({ children, user }) => {
  const auth = useAuth();
  const currentUser = user || auth.user;
  const displayName = user ? getDisplayName(user, 'Khách truy cập') : (auth.displayName || 'Khách truy cập');

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSwitchRoleModal, setShowSwitchRoleModal] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();
  const { pendingCount: pendingDeclarationCount } = usePendingDeclarationCount();
  const [notiOpen, setNotiOpen] = useState(false);
  const notiRef = useRef(null);
  const userRoles = getUserRoles();

  const handleSwitchRole = (newRole) => {
    if (newRole === auth.role) {
      setShowSwitchRoleModal(false);
      return;
    }
    switchRole(newRole);
    setShowSwitchRoleModal(false);
    setIsDropdownOpen(false);
    navigate(getLandTaxSystemPath(newRole));
  };

  useEffect(() => {
    console.debug('[LandTaxLayout] user →', currentUser, '| role:', auth.role);
  }, [currentUser, auth.role]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notiRef.current && !notiRef.current.contains(event.target)) {
        setNotiOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  return (
    <div style={styles.wrapper}>
      <LandTaxHeader
        displayName={displayName}
        dropdownRef={dropdownRef}
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
        notiRef={notiRef}
        notiOpen={notiOpen}
        setNotiOpen={setNotiOpen}
        unreadCount={unreadCount}
        loading={loading}
        notifications={notifications}
        markRead={markRead}
        markAllRead={markAllRead}
        navigate={navigate}
        onLogout={handleLogout}
        onOpenSwitchRole={() => {
          setShowSwitchRoleModal(true);
          setIsDropdownOpen(false);
        }}
      />

      {showSwitchRoleModal && (
        <LandTaxSwitchRoleModal
          displayName={displayName}
          userRoles={userRoles}
          activeRole={auth.role}
          onClose={() => setShowSwitchRoleModal(false)}
          onSwitchRole={handleSwitchRole}
        />
      )}

      <div style={styles.bodyContainer}>
        <LandTaxSidebar
          location={location}
          navigate={navigate}
          pendingDeclarationCount={pendingDeclarationCount}
        />
        <main style={styles.content}>{children}</main>
      </div>
    </div>
  );
};

export default LandTaxLayout;
