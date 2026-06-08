import React from 'react';
import { interactiveDivProps } from '../../../utils/a11y';

const formatCardStyle = (active) => ({
  flex: 1,
  padding: '24px',
  borderRadius: 20,
  border: active ? '2px solid #a30d11' : '1px solid #e2e8f0',
  textAlign: 'center',
  cursor: 'pointer',
  background: active ? '#fff1f2' : '#fff',
  transition: 'border-color 0.2s, background 0.2s',
});

export const FormatCard = ({ active, label, onClick }) => (
  <div
    {...interactiveDivProps(onClick, `Chọn định dạng ${label}`)}
    style={formatCardStyle(active)}
  >
    <h3 style={{ margin: 0, color: active ? '#a30d11' : '#1e293b', fontWeight: 800 }}>{label}</h3>
    <small style={{ color: '#94a3b8', fontWeight: 600, letterSpacing: 1 }}>TÀI LIỆU</small>
  </div>
);

export const SectionTitle = ({ icon, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '24px 0 12px', color: '#64748b' }}>
    <i className={`bi bi-${icon}`} />
    <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>{title}</span>
  </div>
);
