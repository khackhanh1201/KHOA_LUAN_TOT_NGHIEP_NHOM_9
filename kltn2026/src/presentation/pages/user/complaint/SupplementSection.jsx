import React from 'react';
import { getSupplementRequestDisplay } from './complaintUtils';

const SupplementSection = ({
  needSupplementList,
  supplementDrafts,
  supplementFiles,
  supplementSubmitting,
  onDraftChange,
  onFileChange,
  onSubmit,
}) => {
  if (needSupplementList.length === 0) return null;

  return (
    <div className="card shadow-sm border-0 mt-4" style={{ borderRadius: '16px', border: '1px solid #fed7aa' }}>
      <div className="card-body p-4">
        <h5 className="fw-bold mb-3" style={{ color: '#ea580c' }}>
          <i className="bi bi-file-earmark-plus me-2" />
          Khiếu nại cần bổ sung hồ sơ
        </h5>
        {needSupplementList.map((c) => {
          const cid = c.id ?? c.complaintId;
          const supplementDisplay = getSupplementRequestDisplay(c);
          const files = supplementFiles[cid] || [];
          const inputId = `supplement-file-${cid}`;

          return (
            <div key={cid} className="mb-4 p-3" style={{ background: '#fffbeb', borderRadius: 12, border: '1px solid #fde68a' }}>
              <div className="fw-bold mb-1">KN-{String(cid).padStart(4, '0')}</div>
              {supplementDisplay && (
                <p className="small text-secondary mb-2">
                  <strong>{supplementDisplay.label}:</strong> {supplementDisplay.note}
                </p>
              )}
              <textarea
                className="form-control mb-2"
                rows={3}
                placeholder="Nhập nội dung / mô tả tài liệu bổ sung..."
                aria-label="Nội dung bổ sung"
                value={supplementDrafts[cid] || ''}
                onChange={(e) => onDraftChange(cid, e.target.value)}
              />

              <div className="mb-3">
                <label htmlFor={inputId} className="form-label small fw-semibold mb-1">
                  Tài liệu đính kèm (PDF hoặc ảnh)
                </label>
                <button
                  type="button"
                  className="border border-dashed rounded-3 p-3 text-center bg-white w-100"
                  style={{ borderColor: '#fcd34d' }}
                  onClick={() => document.getElementById(inputId)?.click()}
                >
                  <i className="bi bi-cloud-arrow-up" style={{ fontSize: '24px', color: '#94a3b8' }} />
                  <p className="mt-2 mb-0 small fw-medium text-dark">Nhấn để tải lên file bổ sung</p>
                  <small className="text-muted">Hỗ trợ PDF, JPG, PNG</small>
                </button>
                <input
                  id={inputId}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="d-none"
                  multiple
                  onChange={(e) => onFileChange(cid, e.target.files)}
                />
                {files.length > 0 && (
                  <ul className="small text-success mt-2 mb-0 ps-3">
                    {files.map((file) => (
                      <li key={file.name}>{file.name}</li>
                    ))}
                  </ul>
                )}
              </div>

              <button
                type="button"
                className="btn btn-sm fw-bold text-white"
                style={{ background: '#a30d11' }}
                disabled={supplementSubmitting === cid}
                onClick={() => onSubmit(cid)}
              >
                {supplementSubmitting === cid ? 'Đang gửi...' : 'Gửi bổ sung'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SupplementSection;
