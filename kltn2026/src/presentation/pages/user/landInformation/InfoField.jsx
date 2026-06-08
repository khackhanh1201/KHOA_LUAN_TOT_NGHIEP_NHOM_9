import React from 'react';

export const InfoField = ({ label, value, span = 1 }) => (
  <div style={{ marginBottom: 12, gridColumn: span === 2 ? 'span 2' : 'auto' }}>
    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: 500 }}>{value || '—'}</div>
  </div>
);

export default InfoField;
