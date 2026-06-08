import React from 'react';
import CadastralLayout from '../../components/CadastralLayout';
import { pageTitle, pageSubtitle, colors } from '../../theme/designTokens';
import {
  containerStyle,
  headerStyle,
  btnSecondaryStyle,
  btnPrimaryStyle,
  filterBarStyle,
  searchWrapperStyle,
  searchIconStyle,
  searchInputStyle,
  tableCardStyle,
  tableStyle,
  thRowStyle,
  thCellStyle,
  tdRowStyle,
  tdCellStyle,
  iconBtnStyle,
} from './landPriceStyles';

const LandPriceListView = ({
  user,
  managedAreaLabel,
  exporting,
  loading,
  searchTerm,
  onSearchChange,
  onExportExcel,
  onCreateClick,
  filteredLandPrices,
  landPrices,
  masterAreas,
  masterLandTypes,
  onViewDetail,
}) => (
  <CadastralLayout user={user}>
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={pageTitle}>Quản lý Giá đất</h2>
          <p style={pageSubtitle}>
            Khu vực quản lý: <b>{managedAreaLabel}</b>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            style={{ ...btnSecondaryStyle, opacity: exporting ? 0.7 : 1 }}
            onClick={onExportExcel}
            disabled={exporting || loading}
          >
            <i className="bi bi-download"></i> {exporting ? 'Đang xuất...' : 'Xuất Excel'}
          </button>
          <button type="button" style={btnPrimaryStyle} onClick={onCreateClick}>
            <i className="bi bi-plus"></i> Nhập giá đất
          </button>
        </div>
      </div>

      <div style={filterBarStyle}>
        <div style={searchWrapperStyle}>
          <i className="bi bi-search" style={searchIconStyle}></i>
          <input
            type="text"
            placeholder="Tìm kiếm loại đất, khu vực..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Tìm kiếm loại đất, khu vực"
            style={searchInputStyle}
          />
        </div>
      </div>

      <div style={tableCardStyle}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>Đang tải dữ liệu...</div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr style={thRowStyle}>
                <th style={thCellStyle}>MÃ GIÁ</th>
                <th style={thCellStyle}>LOẠI ĐẤT (ID)</th>
                <th style={thCellStyle}>KHU VỰC (Area ID)</th>
                <th style={{ ...thCellStyle, textAlign: 'right' }}>MỨC GIÁ (VNĐ/m²)</th>
                <th style={thCellStyle}>ÁP DỤNG TỪ</th>
                <th style={{ ...thCellStyle, textAlign: 'center' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filteredLandPrices.map((rec) => {
                const matchedArea = masterAreas.find((a) => a.areaId === rec.areaId);
                const matchedLandType = masterLandTypes.find((t) => t.landTypeId === rec.landTypeId);

                return (
                  <tr key={rec.priceId} style={tdRowStyle}>
                    <td style={tdCellStyle}>GĐ-{rec.priceId}</td>
                    <td style={tdCellStyle}>{matchedLandType ? matchedLandType.typeName : `Loại ${rec.landTypeId}`}</td>
                    <td style={tdCellStyle}>{matchedArea ? `${matchedArea.streetName} - Vị trí ${matchedArea.positionLevel}` : `Khu ${rec.areaId}`}</td>
                    <td
                      style={{
                        ...tdCellStyle,
                        textAlign: 'right',
                        fontWeight: 800,
                        color: colors.danger,
                      }}
                    >
                      {(rec.unitPrice || 0).toLocaleString('vi-VN')}
                    </td>
                    <td style={tdCellStyle}>{rec.appliedFrom}</td>
                    <td style={{ ...tdCellStyle, textAlign: 'center' }}>
                      <button type="button" style={iconBtnStyle} onClick={() => onViewDetail(rec)} aria-label="Xem chi tiết giá đất">
                        <i className="bi bi-eye"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {landPrices.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Không có dữ liệu</td></tr>
              )}
              {landPrices.length > 0 && filteredLandPrices.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Không tìm thấy kết quả phù hợp</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  </CadastralLayout>
);

export default LandPriceListView;
