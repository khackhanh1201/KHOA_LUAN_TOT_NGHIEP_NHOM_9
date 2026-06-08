import React from 'react';

const DetailField = ({ label, value, color, strong }) => (
  <div>
    <div style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
    <div style={{ fontSize: 14, color: color || '#1e293b', fontWeight: strong ? 700 : 500, lineHeight: 1.5 }}>{value}</div>
  </div>
);

export { DetailField };
