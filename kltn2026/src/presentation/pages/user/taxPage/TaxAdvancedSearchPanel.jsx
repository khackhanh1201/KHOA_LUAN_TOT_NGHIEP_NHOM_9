import React from 'react';

const rdStylePositionTopRight = {
      position: 'fixed', top: 110, right: 40, width: 380, background: '#fff',
      borderRadius: 12, boxShadow: '0 20px 50px rgba(0,0,0,0.25)', zIndex: 4000,
      padding: 24, maxHeight: '80vh', overflowY: 'auto',
    };
const rdStyleFlexPaddingBorder = { flex: 1, padding: '12px', border: '1px solid #e2e8f0', background: '#f1f5f9', color: '#475569', borderRadius: 8, fontWeight: 500, cursor: 'pointer' };
const rdStyleFlexPaddingBackground = { flex: 1, padding: '12px', background: '#a30d11', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' };

const TaxAdvancedSearchPanel = ({
  advFilters,
  yearOptions,
  landTypeOptions,
  onFilterChange,
  onReset,
  onClose,
}) => (
  <div
    style={rdStylePositionTopRight}
  >
    <h5 style={{ marginBottom: 20, fontWeight: 700, color: '#0f172a' }}>Tìm kiếm nâng cao</h5>

    <div style={{ marginBottom: 16 }}>
      <label htmlFor="taxAdvTaxYear" style={{ fontSize: 13, color: '#64748b', display: 'block', marginBottom: 6 }}>Năm tính thuế</label>
      <select
        id="taxAdvTaxYear"
        value={advFilters.taxYear}
        onChange={(e) => onFilterChange({ taxYear: e.target.value })}
        style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14 }}
      >
        <option value="">Tất cả các năm</option>
        {yearOptions.map((y) => (
          <option key={y} value={String(y)}>{y}</option>
        ))}
      </select>
    </div>

    <div style={{ marginBottom: 16 }}>
      <label htmlFor="taxAdvLandTypeName" style={{ fontSize: 13, color: '#64748b', display: 'block', marginBottom: 6 }}>Loại đất</label>
      <select
        id="taxAdvLandTypeName"
        value={advFilters.landTypeName}
        onChange={(e) => onFilterChange({ landTypeName: e.target.value })}
        style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14 }}
      >
        <option value="">Tất cả loại đất</option>
        {landTypeOptions.map((name) => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>
    </div>

    <div style={{ marginBottom: 24 }}>
      <label htmlFor="taxAdvAmountRange" style={{ fontSize: 13, color: '#64748b', display: 'block', marginBottom: 6 }}>Số tiền</label>
      <select
        id="taxAdvAmountRange"
        value={advFilters.amountRange}
        onChange={(e) => onFilterChange({ amountRange: e.target.value })}
        style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14 }}
      >
        <option value="">Mọi mức giá</option>
        <option value="under500">Dưới 500.000 VND</option>
        <option value="500to2m">500.000 - 2.000.000 VND</option>
        <option value="over2m">Trên 2.000.000 VND</option>
      </select>
    </div>

    <div style={{ display: 'flex', gap: 12 }}>
      <button type="button" onClick={onReset}
        style={rdStyleFlexPaddingBorder}
      >
        Xóa bộ lọc
      </button>
      <button type="button" onClick={onClose}
        style={rdStyleFlexPaddingBackground}
      >
        Đóng
      </button>
    </div>
  </div>
);

export default TaxAdvancedSearchPanel;
