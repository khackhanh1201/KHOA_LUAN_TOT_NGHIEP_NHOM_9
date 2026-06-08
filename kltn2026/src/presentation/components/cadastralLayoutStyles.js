export const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    backgroundColor: '#f4f6f9',
  },
  header: {
    height: '70px',
    backgroundColor: '#b31217',
    borderBottom: '2px solid #ffc107',
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
    paddingTop: '5px',
    borderRight: '1px solid #edf0f5',
    overflowY: 'auto',
    flexShrink: 0,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 18px',
    borderRadius: '16px',
    transition: 'all 0.25s ease',
  },
  navItemActive: {
    backgroundColor: '#c5161d',
    boxShadow: '0 6px 14px rgba(197,22,29,0.18)',
  },
  iconContainer: {
    width: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto',
  },
  avatarWrapper: {
    width: '42px',
    height: '42px',
    backgroundColor: '#fff',
    borderRadius: '50%',
    border: '2px solid #ffc107',
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
    borderRadius: '15px',
    overflow: 'hidden',
    zIndex: 1000,
    boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
  },
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
