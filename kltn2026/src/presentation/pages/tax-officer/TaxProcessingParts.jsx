import React from 'react';
import { downloadFileFromUrl } from '../../../utils/downloadFile';
import { sectionCardStyle } from './taxProcessingStyles';

const DetailField = ({ label, value, color, strong }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase' }}>{label}</div>
    <div style={{ fontSize: 14, color: color || '#1e293b', fontWeight: strong ? 700 : 500 }}>{value}</div>
  </div>
);

const AttachmentItem = ({ name, fileUrl, fileType, onView }) => {
  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!fileUrl) return;
    await downloadFileFromUrl(fileUrl, name || 'tai-lieu');
  };

  const handleView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!fileUrl || !onView) return;
    onView({ name, url: fileUrl, fileType });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <i className="bi bi-file-earmark-text" style={{ color: '#10b981', fontSize: 18 }} />
        <div style={{ fontSize: 14, fontWeight: 600 }}>{name}</div>
      </div>
      <div style={{ display: 'flex', gap: 16, color: '#64748b', fontSize: 16 }}>
        {fileUrl && (
          <>
            <button
              type="button"
              onClick={handleView}
              aria-label="Xem trước trên web"
              title="Xem trước trên web"
              style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
            >
              <i className="bi bi-eye" />
            </button>
            <button
              type="button"
              onClick={handleDownload}
              aria-label="Tải xuống"
              title="Tải xuống"
              style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
            >
              <i className="bi bi-download" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export { DetailField, AttachmentItem };
