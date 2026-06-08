export const layoutStyles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
    fontFamily: '"Inter", "Segoe UI", "Roboto", system-ui, sans-serif',
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
    width: '280px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e2e8f0',
    paddingTop: '8px',
    overflowY: 'auto',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: 0,
    backgroundColor: '#f8fafc',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 14px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  navItemActive: {
    backgroundColor: '#a30d11',
  },
  iconWrapper: {
    width: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapper: {
    width: '40px',
    height: '40px',
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
    top: '60px',
    right: '0',
    width: '240px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    zIndex: 1000,
    boxShadow: '0 10px 30px rgba(15,23,42,0.12)',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  modalContent: {
    width: '420px',
    maxWidth: '92vw',
    backgroundColor: '#fff',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(15,23,42,0.25)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #f1f5f9',
  },
  modalCloseBtn: {
    background: '#f1f5f9',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'background 0.15s',
  },
  modalBody: {
    padding: '12px 16px 20px',
  },
  roleItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 14px',
    borderRadius: '12px',
    transition: 'background 0.15s ease',
    marginBottom: '4px',
  },
  roleAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: '2px solid #fbbf24',
    overflow: 'hidden',
    flexShrink: 0,
    backgroundColor: '#fff',
    padding: '3px',
  },
  checkmark: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    backgroundColor: '#eab308',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
};

export const notiPanelStyle = {
  position: 'absolute',
  top: '42px',
  right: 0,
  width: 360,
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  zIndex: 2000,
  maxHeight: 420,
  overflow: 'hidden',
  color: '#0f172a',
};

export const notiPanelHeaderStyle = {
  padding: '12px 16px',
  borderBottom: '1px solid #eee',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

export const notiMarkAllBtnStyle = {
  border: 'none',
  background: 'none',
  color: '#a30d11',
  fontSize: 12,
  cursor: 'pointer',
};

export const notiEmptyStyle = { padding: 16, margin: 0, color: '#94a3b8' };

export const notiItemStyle = {
  padding: '12px 16px',
  borderBottom: '1px solid #f1f5f9',
  cursor: 'pointer',
};

export const notiPanelFooterStyle = {
  padding: 10,
  textAlign: 'center',
  borderTop: '1px solid #eee',
};

export const notiViewAllBtnStyle = {
  border: 'none',
  background: 'none',
  color: '#a30d11',
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
};
