export const layoutStyles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
    fontFamily: '"Inter", "Segoe UI", "Roboto", system-ui, sans-serif',
  },
  header: {
    height: '70px',
    backgroundColor: '#a30d11',
    borderBottom: '2px solid #fbbf24',
    flexShrink: 0,
    zIndex: 1001,
  },
  bodyContainer: { display: 'flex', flex: 1, overflow: 'hidden' },
  sidebar: {
    width: '280px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e2e8f0',
    paddingTop: '8px',
    overflowY: 'auto',
    flexShrink: 0,
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
  content: { flex: 1, padding: '25px', overflowY: 'auto', backgroundColor: '#f8fafc' },
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
  avatarImage: { width: '100%', height: '100%', objectFit: 'contain' },
  dropdownMenu: {
    position: 'absolute',
    top: '65px',
    right: '20px',
    width: '240px',
    backgroundColor: '#fff',
    borderRadius: '15px',
    zIndex: 1000,
    boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
    overflow: 'hidden',
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

const NAV_ICONS_WITH_FILL = new Set([
  'grid-3x3-gap',
  'info-circle',
  'credit-card-2-front',
  'exclamation-triangle',
]);

export const resolveNavIconClass = (icon, active) => {
  let name = icon.startsWith('bi-') ? icon.slice(3) : icon;
  const base = name.replace(/-fill$/, '');

  if (active && NAV_ICONS_WITH_FILL.has(base)) {
    name = `${base}-fill`;
  } else if (!active && name.endsWith('-fill') && NAV_ICONS_WITH_FILL.has(base)) {
    name = base;
  }

  return `bi bi-${name}`;
};
