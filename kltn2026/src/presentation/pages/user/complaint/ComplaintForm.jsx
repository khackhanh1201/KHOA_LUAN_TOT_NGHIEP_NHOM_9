import React from 'react';
import {
  COMPLAINT_DOMAIN,
  DOMAIN_LABELS,
  formatRecordOption,
  formatParcelOption,
} from './complaintUtils';

const ComplaintForm = ({
  form,
  loading,
  error,
  recordsLoading,
  isLandDomain,
  taxRecords,
  myLandParcels,
  onDomainChange,
  onChange,
  onFileChange,
  onSubmit,
}) => (
  <div className="card shadow-sm border-0" style={{ borderRadius: '16px' }}>
    <div className="card-body p-4 p-md-5">
      <h5 className="fw-bold mb-4">Tạo khiếu nại mới</h5>
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label htmlFor="complaintDomain" className="form-label fw-semibold">Loại phản ánh <span className="text-danger">*</span></label>
          <select id="complaintDomain" className="form-select bg-light border-0" name="complaintDomain" value={form.complaintDomain}
            onChange={onDomainChange} style={{ padding: '12px', borderRadius: '8px' }}>
            <option value={COMPLAINT_DOMAIN.TAX}>{DOMAIN_LABELS[COMPLAINT_DOMAIN.TAX]}</option>
            <option value={COMPLAINT_DOMAIN.LAND}>{DOMAIN_LABELS[COMPLAINT_DOMAIN.LAND]}</option>
          </select>
          <small className="text-muted d-block mt-1">
            {isLandDomain
              ? 'Phản ánh sai số liệu trên sổ địa chính (diện tích, tờ bản đồ, vị trí…). Cơ quan Địa chính xử lý.'
              : 'Hồ sơ sẽ chuyển Cơ quan Thuế xử lý.'}
          </small>
        </div>

        <div className="mb-4">
          <label htmlFor="complaintRelatedField" className="form-label fw-semibold">{isLandDomain ? 'Thửa đất liên quan' : 'Hồ sơ liên quan'}</label>
          {recordsLoading ? (
            <div className="text-muted small py-2">Đang tải dữ liệu...</div>
          ) : isLandDomain ? (
            myLandParcels.length > 0 ? (
              <>
                <select id="complaintRelatedField" className="form-select bg-light border-0" name="landParcelId" value={form.landParcelId}
                  onChange={onChange} style={{ padding: '12px', borderRadius: '8px' }}>
                  <option value="">— Chọn thửa đất —</option>
                  {myLandParcels.map((p) => {
                    const opt = formatParcelOption(p);
                    return <option key={opt.value} value={opt.value}>{opt.label}</option>;
                  })}
                </select>
                <small className="text-muted d-block mt-1">Chọn thửa đất bạn đang sở hữu để phản ánh sai lệch trên sổ.</small>
              </>
            ) : (
              <>
                <input id="complaintRelatedField" type="text" name="landParcelId" className="form-control bg-light border-0"
                  placeholder="Nhập mã thửa đất (VD: 244)" value={form.landParcelId} onChange={onChange}
                  style={{ padding: '12px', borderRadius: '8px' }} />
                <small className="text-warning d-block mt-1">Chưa có thửa đất trong tài khoản. Nhập mã thửa thủ công hoặc liên hệ cán bộ địa chính.</small>
              </>
            )
          ) : taxRecords.length > 0 ? (
            <select id="complaintRelatedField" className="form-select bg-light border-0" name="recordId" value={form.recordId}
              onChange={onChange} style={{ padding: '12px', borderRadius: '8px' }}>
              <option value="">— Chọn hồ sơ —</option>
              {taxRecords.map((r) => {
                const opt = formatRecordOption(r);
                return <option key={opt.value} value={opt.value}>{opt.label}</option>;
              })}
            </select>
          ) : (
            <>
              <input id="complaintRelatedField" type="text" name="recordId" className="form-control bg-light border-0"
                placeholder="Nhập mã hồ sơ (VD: T-2026-010)" value={form.recordId} onChange={onChange}
                style={{ padding: '12px', borderRadius: '8px' }} />
              <small className="text-warning d-block mt-1">Chưa có hồ sơ thuế trong tài khoản. Nhập mã thủ công hoặc nộp hồ sơ trước.</small>
            </>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="complaintTitle" className="form-label fw-semibold">Tiêu đề khiếu nại</label>
          <select id="complaintTitle" className="form-select bg-light border-0" name="title" value={form.title}
            onChange={onChange} style={{ padding: '12px', borderRadius: '8px' }}>
            {!isLandDomain ? (
              <>
                <option value="Khiếu nại về số tiền thuế đất đai">Khiếu nại về số tiền thuế</option>
                <option value="Khiếu nại về biên lai / thanh toán">Khiếu nại về biên lai / thanh toán</option>
                <option value="Khiếu nại về quyết định thuế">Khiếu nại về quyết định thuế</option>
              </>
            ) : (
              <>
                <option value="Khiếu nại về sai diện tích trên sổ">Khiếu nại về sai diện tích trên sổ</option>
                <option value="Khiếu nại về sai tờ bản đồ / số thửa">Khiếu nại về sai tờ bản đồ / số thửa</option>
                <option value="Khiếu nại về sai vị trí / địa chỉ thửa đất">Khiếu nại về sai vị trí / địa chỉ thửa đất</option>
                <option value="Khiếu nại về quá trình xử lý hồ sơ">Khiếu nại về quá trình xử lý hồ sơ</option>
                <option value="Khiếu nại về quyết định từ chối duyệt">Khiếu nại về quyết định từ chối duyệt</option>
                <option value="Phản ánh khác về đất đai">Phản ánh khác về đất đai</option>
              </>
            )}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="fileInput" className="form-label fw-semibold">
            {isLandDomain ? 'Tài liệu minh chứng (GCN, bản vẽ, ảnh hiện trạng…)' : 'File PDF biên lai / thông báo thuế'}
          </label>
          <button
            type="button"
            className="border border-dashed rounded-3 p-4 text-center bg-light w-100"
            style={{ borderColor: '#cbd5e1' }}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <i className="bi bi-cloud-arrow-up" style={{ fontSize: '32px', color: '#94a3b8' }} />
            <p className="mt-2 mb-1 fw-medium text-dark">Tải lên file PDF</p>
          </button>
          <input id="fileInput" type="file" accept=".pdf,.jpg,.jpeg,.png" className="d-none"
            onChange={(e) => onFileChange(e, 'file')} />
          {form.file && (
            <small className="text-success mt-2 d-block fw-semibold">
              <i className="bi bi-check-lg" /> Đã chọn: {form.file.name}
            </small>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="complaintContent" className="form-label fw-semibold">Nội dung chi tiết <span className="text-danger">*</span></label>
          <textarea id="complaintContent" name="content" className="form-control bg-light border-0" rows="5"
            placeholder={isLandDomain
              ? 'Mô tả sai lệch so với sổ địa chính (vd: diện tích sổ 100 m², thực tế 85 m²…)'
              : 'Nhập chi tiết nội dung phản ánh của bạn...'}
            value={form.content} onChange={onChange} required
            style={{ resize: 'vertical', borderRadius: '8px', padding: '12px' }}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="attachmentInput" className="form-label fw-semibold">Tài liệu đính kèm khác (nếu có)</label>
          <button
            type="button"
            className="border border-dashed rounded-3 p-4 text-center bg-light w-100"
            style={{ borderColor: '#cbd5e1' }}
            onClick={() => document.getElementById('attachmentInput').click()}
          >
            <i className="bi bi-paperclip" style={{ fontSize: '32px', color: '#94a3b8' }} />
            <p className="mt-2 mb-1 fw-medium text-dark">Nhấn để tải lên file đính kèm</p>
            <small className="text-muted">Hỗ trợ PDF, JPG, PNG</small>
          </button>
          <input id="attachmentInput" type="file" accept=".pdf,.jpg,.jpeg,.png" className="d-none"
            onChange={(e) => onFileChange(e, 'attachment')} />
          {form.attachment && (
            <small className="text-success mt-2 d-block fw-semibold">
              <i className="bi bi-check-lg" /> Đã chọn: {form.attachment.name}
            </small>
          )}
        </div>

        {error && <div className="alert alert-danger py-2 small mb-4">{error}</div>}

        <button type="submit" className="btn btn-danger w-100 py-3 fw-bold" disabled={loading}
          style={{ fontSize: '15px', borderRadius: '10px' }}>
          {loading ? (
            <><span className="spinner-border spinner-border-sm me-2" /> Đang gửi khiếu nại...</>
          ) : (
            'Gửi khiếu nại ngay'
          )}
        </button>
      </form>
    </div>
  </div>
);

export default ComplaintForm;
