import React from 'react';
import { layoutStyles as styles, resolveNavIconClass } from './landTaxLayoutStyles';

const navButtonReset = {
  border: 'none',
  background: 'transparent',
  width: '100%',
  textAlign: 'left',
  padding: 0,
  cursor: 'pointer',
  font: 'inherit',
  color: 'inherit',
};

const LandTaxNavItem = ({ active, icon, label, onClick, badge }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      ...navButtonReset,
      ...styles.navItem,
      ...(active ? styles.navItemActive : {}),
    }}
    className="mb-2 d-flex align-items-center justify-content-between cursor-pointer"
  >
    <div className="d-flex align-items-center">
      <div style={styles.iconWrapper}>
        <i
          className={resolveNavIconClass(icon, active)}
          style={{
            fontSize: '20px',
            color: active ? '#ffffff' : '#667085',
          }}
        />
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
    </div>
    {badge && (
      <span
        className={`badge rounded-pill ${active ? 'bg-white text-danger' : 'bg-danger text-white'}`}
        style={{ fontSize: '12px', padding: '4px 8px', fontWeight: '700' }}
      >
        {badge}
      </span>
    )}
  </button>
);

export default LandTaxNavItem;
