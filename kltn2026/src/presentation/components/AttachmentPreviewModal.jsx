import React, { useEffect, useEffectEvent, useRef, useState } from 'react';
import { guessAttachmentKind, ATTACHMENT_KIND_LABELS } from '../../utils/filePreview';
import { downloadFileFromUrl } from '../../utils/downloadFile';
import {
  modalStyle,
  headerStyle,
  bodyStyle,
  footerStyle,
  btnSecondary,
  btnPrimary,
} from './attachmentPreviewStyles';
import { fetchPdfBlobUrl } from './attachmentPreviewUtils';
import AttachmentPreviewContent from './AttachmentPreviewContent';

const dialogShellStyle = {
  border: 'none',
  padding: 0,
  margin: 'auto',
  maxWidth: 900,
  width: 'calc(100% - 48px)',
  background: 'transparent',
};

const AttachmentPreviewModal = ({ file, onClose }) => {
  const dialogRef = useRef(null);
  const kind = file?.url ? guessAttachmentKind(file) : 'other';
  const previewKey = `${file?.url ?? ''}|${file?.name ?? ''}|${file?.fileType ?? ''}|${kind}`;

  const [pdfPreview, setPdfPreview] = useState({
    key: previewKey,
    url: null,
    state: kind === 'pdf' && file?.url ? 'loading' : 'idle',
  });

  if (previewKey !== pdfPreview.key) {
    setPdfPreview({
      key: previewKey,
      url: null,
      state: kind === 'pdf' && file?.url ? 'loading' : 'idle',
    });
  }

  const { url: pdfPreviewUrl, state: pdfPreviewState } = pdfPreview;

  const handleClose = useEffectEvent(() => onClose?.());

  useEffect(() => {
    const el = dialogRef.current;
    if (!file?.url || !el) return undefined;
    if (!el.open) el.showModal();
    return () => {
      if (el.open) el.close();
    };
  }, [file?.url]);

  useEffect(() => {
    if (!file) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [file]);

  useEffect(() => {
    if (!file?.url || kind !== 'pdf' || pdfPreviewState !== 'loading') {
      return undefined;
    }

    let objectUrl = null;
    let cancelled = false;
    fetchPdfBlobUrl(file.url)
      .then((url) => {
        if (cancelled) {
          window.URL.revokeObjectURL(url);
          return;
        }
        objectUrl = url;
        setPdfPreview((prev) => ({ ...prev, url: objectUrl, state: 'ready' }));
      })
      .catch((err) => {
        console.warn('PDF preview fetch failed:', err);
        if (!cancelled) setPdfPreview((prev) => ({ ...prev, state: 'error' }));
      });
    return () => {
      cancelled = true;
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
    };
  }, [file?.url, file?.name, file?.fileType, kind, pdfPreview.key, pdfPreviewState]);

  if (!file?.url) return null;

  const kindLabel = ATTACHMENT_KIND_LABELS[kind] || 'Tệp';

  const handleDownload = async () => {
    await downloadFileFromUrl(file.url, file.name || 'tai-lieu');
  };

  return (
    <dialog
      ref={dialogRef}
      style={dialogShellStyle}
      aria-label={`Xem trước ${file.name || 'tài liệu'}`}
      onCancel={(e) => {
        e.preventDefault();
        onClose?.();
      }}
    >
      <div style={modalStyle}>
        <div style={headerStyle}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
              {kindLabel}
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: '#1e293b',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {file.name || 'Tài liệu đính kèm'}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: 22,
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div style={bodyStyle}>
          <AttachmentPreviewContent
            file={file}
            kind={kind}
            kindLabel={kindLabel}
            pdfPreviewUrl={pdfPreviewUrl}
            pdfPreviewState={pdfPreviewState}
          />
        </div>

        <div style={footerStyle}>
          <button type="button" style={btnSecondary} onClick={onClose}>
            Đóng
          </button>
          <button type="button" style={btnPrimary} onClick={handleDownload}>
            <i className="bi bi-download" /> Tải xuống
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default AttachmentPreviewModal;
