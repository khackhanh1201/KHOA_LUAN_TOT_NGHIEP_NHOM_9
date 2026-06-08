import React from 'react';

const ComplaintInfoItem = ({ label, value, bold, color }) => (
  <div>
    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 800, marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 14, fontWeight: bold ? 700 : 600, color: color || '#1e293b' }}>{value}</div>
  </div>
);

export default ComplaintInfoItem;
