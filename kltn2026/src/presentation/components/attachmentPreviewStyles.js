const overlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.55)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1100,
  padding: 16,
};

export const modalStyle = {
  width: 'min(960px, 96vw)',
  height: 'min(88vh, 900px)',
  background: '#fff',
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
  display: 'flex',
  flexDirection: 'column',
};

export const headerStyle = {
  padding: '14px 20px',
  borderBottom: '1px solid #e2e8f0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  background: '#fff',
};

export const bodyStyle = {
  flex: 1,
  minHeight: 0,
  background: '#0f172a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
};

export const footerStyle = {
  padding: '12px 20px',
  borderTop: '1px solid #e2e8f0',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 10,
  background: '#fff',
};

export const btnSecondary = {
  padding: '10px 18px',
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  background: '#fff',
  color: '#334155',
  fontWeight: 700,
  fontSize: 13,
  cursor: 'pointer',
};

export const btnPrimary = {
  ...btnSecondary,
  border: 'none',
  background: '#a30d11',
  color: '#fff',
};

export const unsupportedMessageStyle = {
  textAlign: 'center',
  color: '#e2e8f0',
  padding: 32,
  maxWidth: 420,
};
