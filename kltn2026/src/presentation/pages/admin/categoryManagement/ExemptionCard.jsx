import React from 'react';
import { APPLIED_YEAR } from './categoryUtils';

const ExemptionCard = ({
  uploadMessage,
  isUploading,
  fileInputRef,
  onFileUpload,
  exemptCount2026,
  onOpenExemptModal,
}) => (
  <div className="col-lg-6">
    <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '16px' }}>
      <div className="card-body p-4 p-md-5 d-flex flex-column">
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width: '48px', height: '48px', fontSize: '20px', backgroundColor: '#f5f3ff', color: '#8b5cf6' }}>
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <div>
            <h5 className="fw-bold mb-1">Đối tượng Miễn/Giảm thuế</h5>
            <p className="text-muted small mb-0">Danh sách cá nhân được áp dụng chính sách giảm trừ</p>
          </div>
        </div>

        {uploadMessage && (
          <div className={`alert alert-${uploadMessage.type} small py-2 mb-3`}>
            {uploadMessage.text}
          </div>
        )}

        <input
          type="file"
          accept=".xlsx, .xls"
          ref={fileInputRef}
          onChange={onFileUpload}
          className="d-none"
          aria-label="Tải lên file Excel danh sách miễn giảm"
        />
        <button
          type="button"
          className="border border-dashed rounded-3 p-4 text-center mb-4 flex-grow-1 d-flex flex-column justify-content-center w-100"
          style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1', cursor: isUploading ? 'not-allowed' : 'pointer' }}
          onClick={() => !isUploading && fileInputRef.current.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <div className="spinner-border text-danger mx-auto mb-3"></div>
          ) : (
            <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm" style={{ width: '48px', height: '48px', backgroundColor: '#fff', border: '1px solid #fecaca', color: '#dc2626', fontSize: '20px' }}>
              <i className="bi bi-upload"></i>
            </div>
          )}
          <div className="fw-bold text-dark mb-1">{isUploading ? 'Đang xử lý file...' : 'Tải lên file Excel Danh sách'}</div>
          <div className="text-muted small">Kéo thả file vào đây hoặc click để chọn<br/>(Chỉ nhận .xlsx)</div>
        </button>

        <div className="d-flex justify-content-between align-items-center rounded-3 p-3" style={{ backgroundColor: '#faf5ff' }}>
          <div>
            <div className="small text-muted mb-1" style={{ fontSize: '12px' }}>Năm áp dụng: {APPLIED_YEAR}</div>
            <div className="fw-bold" style={{ color: '#8b5cf6', fontSize: '14px' }}>{exemptCount2026} Bản ghi</div>
          </div>
          <button type="button" className="btn fw-bold d-flex align-items-center gap-2"
            style={{ backgroundColor: '#fff', border: '1px solid #ddd6fe', color: '#8b5cf6', fontSize: '13px' }}
            onClick={onOpenExemptModal}
          >
            Xem danh sách <i className="bi bi-chevron-right" style={{ fontSize: '12px' }}></i>
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default ExemptionCard;
