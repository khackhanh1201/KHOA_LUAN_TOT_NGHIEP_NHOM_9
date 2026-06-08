import React from 'react';

const QuotaConfigModal = ({
  selectedRegion,
  editLandQuota,
  onClose,
  onPatch,
  onSave,
}) => (
  <div className="modal-overlay d-flex align-items-center justify-content-center" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 1050 }}>
    <div className="card border-0 shadow-lg" style={{ width: '100%', maxWidth: '450px', borderRadius: '16px', overflow: 'hidden' }}>
      <div className="bg-danger text-white px-4 py-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-geo-alt fs-5"></i>
          <h5 className="mb-0 fw-bold">Cấu hình Hạn mức Đất ở</h5>
        </div>
        <button type="button" className="btn text-white fs-4 p-0" onClick={onClose} aria-label="Đóng">
          <i className="bi bi-x"></i>
        </button>
      </div>

      <div className="p-4">
        <div className="alert alert-warning d-flex gap-3 align-items-start border-warning" style={{ borderRadius: '12px' }}>
          <i className="bi bi-exclamation-triangle-fill mt-1"></i>
          <div className="small" style={{ lineHeight: '1.5' }}>
            Hạn mức đất ở ảnh hưởng trực tiếp đến hệ số đóng thuế lũy tiến của bất động sản nằm trên địa bàn này.
          </div>
        </div>

        <div className="row g-3 mt-3">
          <div className="col-6">
            <label htmlFor="config-district" className="form-label fw-bold small text-secondary">Mã Quận/Huyện</label>
            <input id="config-district" type="text" className="form-control bg-light" value={selectedRegion.districtCode} readOnly style={{ borderRadius: '8px' }} />
          </div>
          <div className="col-6">
            <label htmlFor="config-ward" className="form-label fw-bold small text-secondary">Mã Phường/Xã</label>
            <input id="config-ward" type="text" className="form-control bg-light" value={selectedRegion.wardCode} readOnly style={{ borderRadius: '8px' }} />
          </div>
          <div className="col-12">
            <label htmlFor="config-street" className="form-label fw-bold small text-secondary">Tên Đường / Khu vực</label>
            <input id="config-street" type="text" className="form-control bg-light" value={selectedRegion.streetName} readOnly style={{ borderRadius: '8px' }} />
          </div>
          <div className="col-12">
            <label htmlFor="config-quota" className="form-label fw-bold small text-secondary">Hạn mức tối đa (m2)</label>
            <div className="position-relative">
              <input
                id="config-quota"
                type="number"
                className="form-control fw-bold text-dark"
                value={editLandQuota}
                onChange={(e) => onPatch({ editLandQuota: e.target.value })}
                style={{ borderRadius: '8px', paddingRight: '40px' }}
              />
              <span className="position-absolute text-muted fw-semibold" style={{ right: '15px', top: '50%', transform: 'translateY(-50%)' }}>m²</span>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
          <button type="button" className="btn btn-light border fw-semibold px-4" style={{ borderRadius: '8px' }} onClick={onClose}>Hủy bỏ</button>
          <button type="button" className="btn btn-danger fw-semibold px-4" onClick={onSave}>
            Lưu cấu hình
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default QuotaConfigModal;
