import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getDisplayName, clearSession, switchRole, getUserRoles, getLandTaxSystemPath } from '../../usecases/authService';
import { useAuth } from '../../hooks/useAuth';
import { useTaxOfficerNotifications } from '../../hooks/useTaxOfficerNotifications';
import { useTaxOfficerWorkloadCount } from '../../hooks/useTaxOfficerWorkloadCount';
import TaxOfficerHeader from './TaxOfficerHeader';
import TaxOfficerSidebar from './TaxOfficerSidebar';
import TaxOfficerSwitchRoleModal from './TaxOfficerSwitchRoleModal';
import { layoutStyles as styles } from './taxOfficerLayoutStyles';

const TaxOfficerLayout = ({ children, user }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  const [showSwitchRoleModal, setShowSwitchRoleModal] = useState(false);
  const dropdownRef = useRef(null);
  const notiRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const auth = useAuth();
  const { pendingTaxRecords, pendingComplaints } = useTaxOfficerWorkloadCount();
  const {
    notifications,
    unreadCount,
    loading: notiLoading,
    markRead,
    markAllRead,
  } = useTaxOfficerNotifications();
  const currentUser = user || auth.user;
  const displayName = user ? getDisplayName(user, 'Cán bộ thuế') : (auth.displayName || 'Cán bộ thuế');
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
    console.debug('[TaxOfficerLayout] user →', currentUser, '| role:', auth.role);
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
      <TaxOfficerHeader
        displayName={displayName}
        dropdownRef={dropdownRef}
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
        notiRef={notiRef}
        notiOpen={notiOpen}
        setNotiOpen={setNotiOpen}
        unreadCount={unreadCount}
        notiLoading={notiLoading}
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
        <TaxOfficerSwitchRoleModal
          displayName={displayName}
          userRoles={userRoles}
          activeRole={auth.role}
          onClose={() => setShowSwitchRoleModal(false)}
          onSwitchRole={handleSwitchRole}
        />
      )}

      <div style={styles.bodyContainer}>
        <TaxOfficerSidebar
          location={location}
          navigate={navigate}
          pendingTaxRecords={pendingTaxRecords}
          pendingComplaints={pendingComplaints}
        />
        <main style={styles.content}>{children}</main>
      </div>
    </div>
  );
};

export default TaxOfficerLayout;
