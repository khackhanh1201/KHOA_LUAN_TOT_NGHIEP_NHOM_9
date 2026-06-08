import React from 'react';
import { backdropA11yProps } from '../../../../utils/a11y';
import { APPLIED_YEAR, STATUS_LABELS } from './categoryUtils';

const closeOverlayIfTarget = (onClose) => (event) => {
  if (event.target === event.currentTarget) onClose(event);
};

const ExemptionListModal = ({
  filteredExemptions,
  exemptions,
  isLoadingExemptions,
  exemptSearch,
  exemptType,
  onClose,
  onPatch,
}) => (
  <div
    className="modal-overlay d-flex align-items-center justify-content-center p-3"
    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 1050 }}
    {...backdropA11yProps(closeOverlayIfTarget(onClose))}
  >
    <div
      className="card border-0 shadow-lg d-flex flex-column"
      style={{ width: '100%', maxWidth: '900px', maxHeight: 'min(90vh, 720px)', borderRadius: '16px', overflow: 'hidden' }}
    >
      <div className="bg-danger text-white px-4 py-3 d-flex justify-content-between align-items-center flex-shrink-0">
        <div>
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-list-check fs-5"></i>
            <h5 className="mb-0 fw-bold">Danh sách Đối tượng Miễn/Giảm thuế</h5>
          </div>
          <div className="small opacity-75 mt-1">
            Năm {APPLIED_YEAR} · {filteredExemptions.length} bản ghi
            {filteredExemptions.length !== exemptions.length ? ` (lọc từ ${exemptions.length})` : ''}
          </div>
        </div>
        <button type="button" className="btn text-white fs-4 p-0" onClick={onClose} aria-label="Đóng">
          <i className="bi bi-x"></i>
        </button>
      </div>

      <div className="p-4 d-flex flex-column flex-grow-1" style={{ minHeight: 0, overflow: 'hidden' }}>
        <div className="row g-3 mb-3 flex-shrink-0">
          <div className="col-md-7 position-relative">
            <i className="bi bi-search position-absolute text-muted" style={{ left: '25px', top: '50%', transform: 'translateY(-50%)' }}></i>
            <input
              type="text"
              className="form-control py-2"
              placeholder="Tìm kiếm theo CCCD, tên hoặc ID công dân..."
              aria-label="Tìm kiếm theo CCCD, tên hoặc ID công dân"
              value={exemptSearch}
              onChange={(e) => onPatch({ exemptSearch: e.target.value })}
              style={{ paddingLeft: '40px', borderRadius: '8px' }}
            />
          </div>
          <div className="col-md-5">
            <select
              className="form-select py-2"
              aria-label="Lọc theo lý do miễn giảm"
              value={exemptType}
              onChange={(e) => onPatch({ exemptType: e.target.value })}
              style={{ borderRadius: '8px' }}
            >
              <option>Tất cả lý do miễn giảm</option>
              <option>Thương binh</option>
              <option>Hộ nghèo</option>
              <option>Mẹ VNAH</option>
              <option>Gia đình chính sách</option>
            </select>
          </div>
        </div>

        <div
          className="table-responsive border rounded-3 flex-grow-1"
          style={{ overflowY: 'auto', overflowX: 'auto', minHeight: 0, maxHeight: 'calc(90vh - 220px)' }}
        >
          <table className="table table-borderless table-hover align-middle mb-0">
            <thead className="border-bottom bg-light sticky-top" style={{ zIndex: 1 }}>
              <tr>
                <th className="py-3 px-4 text-muted small fw-bold">CCCD</th>
                <th className="py-3 px-4 text-muted small fw-bold">HỌ VÀ TÊN</th>
                <th className="py-3 px-4 text-muted small fw-bold">LÝ DO MIỄN GIẢM</th>
                <th className="py-3 px-4 text-muted small fw-bold">TỶ LỆ (%)</th>
                <th className="py-3 px-4 text-muted small fw-bold">NĂM</th>
                <th className="py-3 px-4 text-muted small fw-bold">TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingExemptions ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <output aria-live="polite" aria-label="Đang tải danh sách miễn giảm">
                      <span className="spinner-border spinner-border-sm text-danger" aria-hidden="true" />
                      <span className="visually-hidden">Đang tải danh sách miễn giảm</span>
                    </output>
                  </td>
                </tr>
              ) : filteredExemptions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <i className="bi bi-inbox text-muted" style={{ fontSize: '32px' }} />
                    <p className="text-muted mt-3 mb-0">Không tìm thấy bản ghi nào phù hợp</p>
                  </td>
                </tr>
              ) : (
                filteredExemptions.map((item) => {
                  const statusInfo = STATUS_LABELS[item.status] || STATUS_LABELS.PENDING;
                  return (
                    <tr key={item.exemptId} className="border-bottom">
                      <td className="py-3 px-4 text-secondary font-monospace">{item.cccdNumber || item.citizenId || '—'}</td>
                      <td className="py-3 px-4 fw-bold text-dark">{item.fullName}</td>
                      <td className="py-3 px-4 text-muted">{item.exemptionReason || '—'}</td>
                      <td className="py-3 px-4">
                        <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">
                          {item.discountRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted">{item.appliedYear}</td>
                      <td className="py-3 px-4">
                        <span className={`badge ${statusInfo.className} px-3 py-2 rounded-pill`}>
                          {statusInfo.text}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <p className="text-muted small mb-0 mt-2 flex-shrink-0">
          <i className="bi bi-mouse me-1" />
          Cuộn chuột trong bảng để xem thêm khi danh sách dài.
        </p>
      </div>
    </div>
  </div>
);

export default ExemptionListModal;
