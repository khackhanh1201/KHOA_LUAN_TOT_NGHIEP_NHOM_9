import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDisplayName, clearSession, switchRole, getUserRoles, getLandTaxSystemPath } from '../../usecases/authService';
import { useAuth } from '../../hooks/useAuth';
import { useCadastralWorkloadCount } from '../../hooks/useCadastralWorkloadCount';
import { useCadastralOfficerNotifications } from '../../hooks/useCadastralOfficerNotifications';
import CadastralHeader from './CadastralHeader';
import CadastralSidebar from './CadastralSidebar';
import CadastralSwitchRoleModal from './CadastralSwitchRoleModal';
import { styles } from './cadastralLayoutStyles';

const CadastralLayout = ({ children, user }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  const [showSwitchRoleModal, setShowSwitchRoleModal] = useState(false);
  const dropdownRef = useRef(null);
  const notiRef = useRef(null);

  const navigate = useNavigate();
  const auth = useAuth();
  const { pendingRecords, pendingComplaints } = useCadastralWorkloadCount();
  const {
    notifications,
    unreadCount,
    loading: notiLoading,
    markRead,
    markAllRead,
  } = useCadastralOfficerNotifications();
  const currentUser = user || auth.user;
  const displayName = user ? getDisplayName(user, 'Cán bộ địa chính') : (auth.displayName || 'Cán bộ địa chính');

  useEffect(() => {
    console.debug('[CadastralLayout] user →', currentUser, '| role:', auth.role);
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

  return (
    <div style={styles.wrapper}>
      <CadastralHeader
        displayName={displayName}
        dropdownRef={dropdownRef}
        notiRef={notiRef}
        isDropdownOpen={isDropdownOpen}
        notiOpen={notiOpen}
        onToggleDropdown={() => setIsDropdownOpen(!isDropdownOpen)}
        onToggleNoti={setNotiOpen}
        onLogout={handleLogout}
        onOpenSwitchRoleModal={() => { setShowSwitchRoleModal(true); setIsDropdownOpen(false); }}
        unreadCount={unreadCount}
        notifications={notifications}
        notiLoading={notiLoading}
        markRead={markRead}
        markAllRead={markAllRead}
      />

      <CadastralSwitchRoleModal
        show={showSwitchRoleModal}
        displayName={displayName}
        userRoles={userRoles}
        currentRole={auth.role}
        onClose={() => setShowSwitchRoleModal(false)}
        onSwitchRole={handleSwitchRole}
      />

      <div style={styles.bodyContainer}>
        <CadastralSidebar
          pendingRecords={pendingRecords}
          pendingComplaints={pendingComplaints}
        />
        <main style={styles.content}>{children}</main>
      </div>
    </div>
  );
};

export default CadastralLayout;
