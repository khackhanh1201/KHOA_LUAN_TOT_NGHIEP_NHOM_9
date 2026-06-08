import React from 'react';
import { styles } from './cadastralLayoutStyles';

const navBadgeStyle = (active) => ({
  backgroundColor: active ? '#ffffff' : '#c91d1d',
  color: active ? '#c91d1d' : '#ffffff',
  fontSize: '13px',
  minWidth: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '700',
});

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

const CadastralNavItem = ({ active, icon, label, onClick, badge }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      ...navButtonReset,
      ...styles.navItem,
      ...(active ? styles.navItemActive : {}),
    }}
    className="cursor-pointer mb-2"
  >
    <div style={styles.iconContainer}>
      <i
        className={`bi ${icon}`}
        style={{
          fontSize: '22px',
          color: active ? '#ffffff' : '#5b6577',
        }}
      />
    </div>

    <span
      style={{
        fontSize: '17px',
        fontWeight: active ? '700' : '500',
        color: active ? '#ffffff' : '#5b6577',
        marginLeft: '14px',
        flex: 1,
      }}
    >
      {label}
    </span>

    {badge > 0 && (
      <span
        className="badge rounded-pill"
        style={navBadgeStyle(active)}
      >
        {badge}
      </span>
    )}
  </button>
);

export default CadastralNavItem;
