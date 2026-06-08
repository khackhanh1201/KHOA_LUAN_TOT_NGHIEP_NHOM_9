import React from 'react';

const RegionQuotaCard = ({ regions, isLoadingRegions, onRefresh, onOpenConfig }) => (
  <div className="col-lg-6">
    <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '16px' }}>
      <div className="card-body p-4 p-md-5 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width: '48px', height: '48px', fontSize: '20px', backgroundColor: '#fffbeb', color: '#d97706' }}>
              <i className="bi bi-geo-alt-fill"></i>
            </div>
            <div>
              <h5 className="fw-bold mb-1">Hạn mức đất ở (m2)</h5>
              <p className="text-muted small mb-0">Cấu hình định mức cho Phường/Xã</p>
            </div>
          </div>
          <button type="button" className="btn btn-light border-0 btn-sm text-muted" onClick={onRefresh} disabled={isLoadingRegions} aria-label="Làm mới danh sách khu vực">
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </div>

        <div className="d-flex flex-column gap-3" style={{ maxHeight: '350px', overflowY: 'auto' }}>
          {isLoadingRegions ? (
            <div className="text-center py-4"><span className="spinner-border text-warning spinner-border-sm"></span></div>
          ) : (
            regions.map((region) => (
              <div key={`${region.districtCode}-${region.wardCode}-${region.streetName}`} className="border rounded-3 p-3 d-flex justify-content-between align-items-center bg-white shadow-sm">
                <div>
                  <div className="fw-bold text-dark" style={{ fontSize: '15px' }}>{region.districtCode} - {region.wardCode}</div>
                  <div className="text-muted small mt-1">{region.streetName} (Vị trí: {region.positionLevel})</div>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <div className="fw-bold text-dark fs-5">{region.landQuota} <span style={{fontSize: '14px', fontWeight: '600'}}>m²</span></div>
                  <button type="button" className="btn btn-light border d-flex align-items-center justify-content-center"
                    style={{ width: '36px', height: '36px' }}
                    onClick={() => onOpenConfig(region)}
                    aria-label="Cấu hình hạn mức"
                  >
                    <i className="bi bi-gear text-secondary"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  </div>
);

export default RegionQuotaCard;
