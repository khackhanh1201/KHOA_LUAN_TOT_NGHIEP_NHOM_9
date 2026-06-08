import React from 'react';
import { unsupportedMessageStyle } from './attachmentPreviewStyles';

const AttachmentPreviewContent = ({ file, kind, kindLabel, pdfPreviewUrl, pdfPreviewState }) => {
  if (kind === 'image') {
    return (
      <img
        src={file.url}
        alt={file.name || 'Xem trước'}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    );
  }

  if (kind === 'pdf') {
    if (pdfPreviewState === 'loading') {
      return (
        <div style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600 }}>
          Đang tải PDF...
        </div>
      );
    }

    if (pdfPreviewState === 'error' || !pdfPreviewUrl) {
      return (
        <div style={unsupportedMessageStyle}>
          <i className="bi bi-file-earmark-pdf" style={{ fontSize: 48, marginBottom: 16, display: 'block', color: '#94a3b8' }} />
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
            Không thể hiển thị PDF trong trình duyệt
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
            Vui lòng tải file về máy để mở bằng trình đọc PDF.
          </div>
        </div>
      );
    }

    return (
      <iframe
        title={file.name || 'Xem trước PDF'}
        sandbox="allow-same-origin"
        src={pdfPreviewUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          background: '#fff',
        }}
      />
    );
  }

  return (
    <div style={unsupportedMessageStyle}>
      <i
        className={`bi ${kind === 'spreadsheet' ? 'bi-file-earmark-excel' : kind === 'document' ? 'bi-file-earmark-word' : 'bi-file-earmark'}`}
        style={{ fontSize: 48, marginBottom: 16, display: 'block', color: '#94a3b8' }}
      />
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
        Không hỗ trợ xem trước loại {kindLabel} trên trình duyệt
      </div>
      <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
        Bạn có thể tải file về máy để mở bằng Word / Excel hoặc phần mềm tương ứng.
      </div>
    </div>
  );
};

export default AttachmentPreviewContent;
