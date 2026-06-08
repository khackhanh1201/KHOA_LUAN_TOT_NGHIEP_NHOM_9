import React from 'react';
import {
  containerStyle,
  btnPrimary,
  btnBack,
  formCard,
  formGrid,
  formGroupFull,
  formGroup,
  formLabel,
  inputStyle,
} from './reportManagementUtils';

const ReportCreateFormView = ({
  filters,
  setFilters,
  availableStreets,
  availableTaxTypes,
  onBack,
  onApply,
}) => (
  <div style={containerStyle}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
      <button type="button" onClick={onBack} style={btnBack} aria-label="Quay lại">
        <i className="bi bi-arrow-left" />
      </button>
      <div>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.01em' }}>
          Tạo báo cáo thống kê
        </h2>
        <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>
          Cấu hình các tiêu chí để hệ thống tổng hợp dữ liệu báo cáo.
        </p>
      </div>
    </div>

    <div style={formCard}>
      <div style={formGroupFull}>
        <label htmlFor="report-title" style={formLabel}>TÊN BÁO CÁO</label>
        <input
          id="report-title"
          type="text"
          placeholder="Nhập tên báo cáo (ví dụ: Báo cáo quý 1)..."
          style={inputStyle}
          value={filters.title}
          onChange={(e) => setFilters({ ...filters, title: e.target.value })}
        />
      </div>

      <div style={formGrid}>
        <div style={formGroup}>
          <label htmlFor="report-street" style={formLabel}>PHẠM VI THỐNG KÊ (TUYẾN ĐƯỜNG)</label>
          <select
            id="report-street"
            style={inputStyle}
            value={filters.street}
            onChange={(e) => setFilters({ ...filters, street: e.target.value })}
          >
            {availableStreets.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div style={formGroup}>
          <span style={formLabel}>KỲ BÁO CÁO</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <input id="report-start-date" type="date" aria-label="Ngày bắt đầu kỳ báo cáo" style={inputStyle} value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
            <input id="report-end-date" type="date" aria-label="Ngày kết thúc kỳ báo cáo" style={inputStyle} value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
          </div>
        </div>
        <div style={formGroup}>
          <label htmlFor="report-tax-type" style={formLabel}>LOẠI THUẾ/LỆ PHÍ</label>
          <select id="report-tax-type" style={inputStyle} value={filters.taxType} onChange={(e) => setFilters({ ...filters, taxType: e.target.value })}>
            {availableTaxTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginTop: 30 }}>
        <button type="button" style={btnPrimary} onClick={onApply}>
          <i className="bi bi-bar-chart-fill" /> Tạo báo cáo
        </button>
      </div>
    </div>
  </div>
);

export default ReportCreateFormView;
