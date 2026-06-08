import React from 'react';
import { interactiveDivProps } from '../../../utils/a11y';

export const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', 
  justifyContent: 'center', zIndex: 5000, backdropFilter: 'blur(4px)'
};

export const modalContentStyle = {
  background: '#fff', borderRadius: 24, width: '90%', 
  overflow: 'hidden', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
};

export const modalHeaderStyle = {
  padding: '20px 30px', borderBottom: '1px solid #f1f5f9', 
  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
};

export const modalFooterStyle = {
  padding: '20px 30px', borderTop: '1px solid #f1f5f9', 
  display: 'flex', justifyContent: 'flex-end', gap: 12, background: '#fff'
};

export const closeButtonStyle = { 
  background: '#f1f5f9', border: 'none', borderRadius: '50%', 
  width: 36, height: 36, cursor: 'pointer', display: 'flex', 
  alignItems: 'center', justifyContent: 'center' 
};

export const btnPrimary = { padding: '12px 24px', borderRadius: 10, border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 };
export const btnSecondary = { padding: '12px 24px', borderRadius: 10, border: 'none', background: '#e2e8f0', color: '#475569', fontWeight: 600, cursor: 'pointer' };
export const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  color: '#1e293b',
  outline: 'none',
  background: '#fff',
  marginTop: 4
};
export const fsOverlayStyle = { position: 'fixed', top: '70px', left: '280px', right: 0, bottom: 0, background: '#f8fafc', zIndex: 900, display: 'flex', flexDirection: 'column', overflowY: 'auto' };
export const fsHeaderStyle = { padding: '16px 32px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 };
export const fsBodyStyle = { padding: '24px 32px', display: 'flex', gap: 24, maxWidth: 1440, margin: '0 auto', width: '100%' };
export const sectionCardStyle = { background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 1px 2px rgba(15,23,42,0.04)', marginBottom: 20 };
export const btnSaveRedStyle = { padding: '10px 18px', borderRadius: 8, border: 'none', backgroundColor: '#a30d11', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', gap: 8, alignItems: 'center', lineHeight: 1.2 };
export const btnCancelStyle = { padding: '10px 18px', borderRadius: 8, border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#334155', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', gap: 8, alignItems: 'center', lineHeight: 1.2 };
export const btnSideActionRed = { width: '100%', padding: '12px', background: '#a30d11', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, textAlign: 'center', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 };

export const SectionTitle = ({ icon, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '24px 0 12px', color: '#64748b' }}>
    <i className={`bi bi-${icon}`}></i>
    <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>{title}</span>
  </div>
);

export const InfoRow = ({ label, value, bold, half }) => (
  <div style={{ marginBottom: 16, width: half ? '48%' : '100%' }}>
    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase' }}>{label}</div>
    <div style={{ fontWeight: bold ? 700 : 500, fontSize: 15, color: '#1e293b' }}>{value || '—'}</div>
  </div>
);

export const DetailField = ({ label, value, color, strong }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase' }}>{label}</div>
    <div style={{ fontSize: 14, color: color || '#1e293b', fontWeight: strong ? 700 : 500 }}>{value}</div>
  </div>
);

export const grid4Style = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px 24px' };
export const grid3Style = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 };
export const grayBoxStyle = { background: '#f8fafc', padding: '12px 16px', borderRadius: 8, border: '1px solid #f1f5f9' };
export const labelStyle = { fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase' };
export const sectionTitleStyle = { fontSize: 16, fontWeight: 700, marginBottom: 20, borderBottom: '1px solid #f1f5f9', paddingBottom: 12, display: 'flex', alignItems: 'center', gap: 8 };
export const getPriorityBadge = (p) => ({ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 800, background: p === 'CAO' ? '#fee2e2' : p === 'TRUNG BÌNH' ? '#ffedd5' : '#e0e7ff', color: p === 'CAO' ? '#ef4444' : p === 'TRUNG BÌNH' ? '#f59e0b' : '#6366f1' });


const formatCardStyle = (active) => ({
  flex: 1,
  padding: '24px',
  borderRadius: 20,
  border: active ? '2px solid #a30d11' : '1px solid #e2e8f0',
  textAlign: 'center',
  cursor: 'pointer',
  background: active ? '#fff1f2' : '#fff',
  transition: 'all 0.2s',
});

export const FormatCard = ({ active, label, onClick }) => (
  <div {...interactiveDivProps(onClick, `Chọn định dạng ${label}`)} style={formatCardStyle(active)}>
    <h3 style={{ margin: 0, color: active ? '#a30d11' : '#1e293b', fontWeight: 800 }}>{label}</h3>
    <small style={{ color: '#94a3b8', fontWeight: 600, letterSpacing: 1 }}>TÀI LIỆU</small>
  </div>
);

export const btnLarge = {
  width: '100%', padding: '16px', border: 'none',
  borderRadius: 50, fontWeight: 700, fontSize: 15,
  cursor: 'pointer', display: 'flex', alignItems: 'center',
  justifyContent: 'center', gap: 10, transition: 'transform 0.1s',
};
