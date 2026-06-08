import React from 'react';
import { LAND_TYPE_LABELS } from './landInfoUtils';

const rdStylePositionTopRight = {
    position: 'fixed', top: 110, right: 40, width: 380, background: '#fff',
    borderRadius: 12, boxShadow: '0 20px 50px rgba(0,0,0,0.25)', zIndex: 4000,
    padding: 24, maxHeight: '80vh', overflowY: 'auto',
  };

const LandAdvancedSearchPanel = ({ advFilters, onFilterChange, onReset, onClose }) => (
  <div style={rdStylePositionTopRight}>
    <h5 style={{ marginBottom: 20, fontWeight: 700, color: '#0f172a' }}>Tìm kiếm nâng cao</h5>

    <div style={{ marginBottom: 16 }}>
      <label htmlFor="landAdvGcnBookNumber" style={{ fontSize: 13, color: '#64748b', display: 'block', marginBottom: 6 }}>Số vào sổ cấp GCN</label>
      <input id="landAdvGcnBookNumber" type="text" placeholder="Nhập số vào sổ..." value={advFilters.gcnBookNumber}
        onChange={(e) => onFilterChange({ gcnBookNumber: e.target.value })}
        style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14 }}
      />
    </div>

    <div style={{ marginBottom: 16 }}>
      <label htmlFor="landAdvParcelNumber" style={{ fontSize: 13, color: '#64748b', display: 'block', marginBottom: 6 }}>Thửa đất số</label>
      <input id="landAdvParcelNumber" type="text" placeholder="Nhập số thửa..." value={advFilters.parcelNumber}
        onChange={(e) => onFilterChange({ parcelNumber: e.target.value })}
        style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14 }}
      />
    </div>

    <div style={{ marginBottom: 16 }}>
      <label htmlFor="landAdvMapSheetNumber" style={{ fontSize: 13, color: '#64748b', display: 'block', marginBottom: 6 }}>Tờ bản đồ số</label>
      <input id="landAdvMapSheetNumber" type="text" placeholder="Nhập số tờ bản đồ..." value={advFilters.mapSheetNumber}
        onChange={(e) => onFilterChange({ mapSheetNumber: e.target.value })}
        style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14 }}
      />
    </div>

    <div style={{ marginBottom: 16 }}>
      <label htmlFor="landAdvLandTypeId" style={{ fontSize: 13, color: '#64748b', display: 'block', marginBottom: 6 }}>Loại đất</label>
      <select id="landAdvLandTypeId" value={advFilters.landTypeId} onChange={(e) => onFilterChange({ landTypeId: e.target.value })}
        style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14 }}
      >
        <option value="">Tất cả</option>
        {Object.entries(LAND_TYPE_LABELS).map(([key, name]) => (
          <option key={key} value={key}>{name}</option>
        ))}
      </select>
    </div>

    <div style={{ marginBottom: 24 }}>
      <label htmlFor="landAdvAddress" style={{ fontSize: 13, color: '#64748b', display: 'block', marginBottom: 6 }}>Địa chỉ</label>
      <input id="landAdvAddress" type="text" placeholder="Nhập địa chỉ thửa đất..." value={advFilters.address}
        onChange={(e) => onFilterChange({ address: e.target.value })}
        style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14 }}
      />
    </div>

    <div style={{ display: 'flex', gap: 12 }}>
      <button type="button" onClick={onReset} style={{ flex: 1, padding: '12px', border: '1px solid #e2e8f0', background: '#f1f5f9', color: '#475569', borderRadius: 8, fontWeight: 500 }}>
        Xóa bộ lọc
      </button>
      <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', background: '#a30d11', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}>
        Đóng
      </button>
    </div>
  </div>
);

export default LandAdvancedSearchPanel;
