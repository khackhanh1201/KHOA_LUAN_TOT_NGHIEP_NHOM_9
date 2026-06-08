import React from 'react';
import CadastralLayout from '../../components/CadastralLayout';
import {
  containerStyle,
  headerStyle,
  pageTitle,
  pageSubtitle,
  searchWrapperStyle,
  searchIconStyle,
  searchInputStyle,
  btnRedOutlineStyle,
  tableCardStyle,
  tableStyle,
  thRowStyle,
  thCellStyle,
  tdRowStyle,
  tdCellStyle,
  iconBtnStyle,
} from './landRegistryStyles';

const LandRegistryListView = ({
  user,
  searchQuery,
  loading,
  error,
  landRecords,
  isAdmin,
  getLandTypeName,
  onSearchChange,
  onOpenPushModal,
  onViewDetail,
  onDelete,
}) => (
  <CadastralLayout user={user}>
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={pageTitle}>Danh sách đất đai</h2>
          <p style={pageSubtitle}>Quản lý và tra cứu thông tin các thửa đất trên địa bàn</p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={searchWrapperStyle}>
            <i className="bi bi-search" style={searchIconStyle}></i>
            <input
              type="text"
              placeholder="Tìm kiếm thửa đất số, địa chỉ..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Tìm kiếm thửa đất số, địa chỉ"
              style={searchInputStyle}
            />
          </div>

          <button type="button" style={btnRedOutlineStyle} onClick={onOpenPushModal}>
            <i className="bi bi-upload"></i> Đẩy dữ liệu
          </button>
        </div>
      </div>

      <div style={tableCardStyle}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>Đang tải...</div>
        ) : error ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'red' }}>{error}</div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr style={thRowStyle}>
                <th style={thCellStyle}>SỐ VÀO SỔ / GCN</th>
                <th style={thCellStyle}>THỬA ĐẤT SỐ</th>
                <th style={thCellStyle}>TỜ BẢN ĐỒ</th>
                <th style={thCellStyle}>LOẠI ĐẤT</th>
                <th style={thCellStyle}>ĐỊA CHỈ</th>
                <th style={{ ...thCellStyle, textAlign: 'center' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {landRecords.map((rec, idx) => (
                <tr key={rec.id || idx} style={tdRowStyle}>
                  <td style={{ ...tdCellStyle, fontWeight: 700 }}>{rec.gcnBookNumber || 'N/A'}</td>
                  <td style={tdCellStyle}>{rec.parcelNumber || 'N/A'}</td>
                  <td style={tdCellStyle}>{rec.mapSheetNumber || 'N/A'}</td>
                  <td style={tdCellStyle}>{getLandTypeName(rec.landTypeId)}</td>
                  <td style={tdCellStyle}>{rec.address || 'Chưa có địa chỉ'}</td>
                  <td style={{ ...tdCellStyle, textAlign: 'center' }}>
                    <button type="button" style={iconBtnStyle} onClick={() => onViewDetail(rec)} aria-label="Xem chi tiết thửa đất">
                      <i className="bi bi-eye"></i>
                    </button>
                    {isAdmin && (
                      <button type="button" style={{ ...iconBtnStyle, color: '#b91c1c', marginLeft: 8 }}
                        onClick={() => onDelete(rec.landParcelId)}
                        title="Xóa thửa đất"
                        aria-label="Xóa thửa đất"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {landRecords.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: 60 }}>Không có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  </CadastralLayout>
);

export default LandRegistryListView;
