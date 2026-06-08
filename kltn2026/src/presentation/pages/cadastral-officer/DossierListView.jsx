import React from 'react';
import CadastralLayout from '../../components/CadastralLayout';
import { pageTitle, pageSubtitle, colors } from '../../theme/designTokens';
import { DOSSIER_TABS } from './dossierUtils';
import { FormInput } from './DossierSubcomponents';
import {
  containerStyle,
  headerStyle,
  searchWrapperStyle,
  searchIconStyle,
  searchInputStyle,
  btnDarkRedStyle,
  popoverStyle,
  filterGridStyle,
  labelStyle,
  inputBaseStyle,
  btnCancelStyle,
  btnSaveRedStyle,
  tableCardStyle,
  tabsWrapper,
  tabActive,
  tabInactive,
  tableStyle,
  thRowStyle,
  thCellStyle,
  tdRowStyle,
  tdCellStyle,
  iconBtnStyle,
  getStatusBadge,
} from './dossierStyles';
import { mapStatusLabel } from './dossierUtils';

const DossierListView = ({
  user,
  searchQuery,
  activeTab,
  showAdvancedSearch,
  loading,
  dossiers,
  filteredDossiers,
  tabCounts,
  onSearchChange,
  onToggleAdvancedSearch,
  onCloseAdvancedSearch,
  onTabChange,
  onViewDetail,
}) => (
  <CadastralLayout user={user}>
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={pageTitle}>Xử lý hồ sơ</h2>
          <p style={pageSubtitle}>Danh sách hồ sơ đất đai cần xử lý và phê duyệt hồ sơ địa chính</p>
        </div>

        <div style={{ display: 'flex', gap: 12, position: 'relative' }}>
          <div style={searchWrapperStyle}>
            <i className="bi bi-search" style={searchIconStyle}></i>
            <input
              type="text"
              placeholder="Tìm kiếm mã hồ sơ, tên chủ đất, số thửa..."
              aria-label="Tìm kiếm mã hồ sơ, tên chủ đất, số thửa"
              style={searchInputStyle}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <button type="button" style={btnDarkRedStyle} onClick={onToggleAdvancedSearch}>
            <i className="bi bi-funnel"></i> Tìm kiếm nâng cao
          </button>

          {showAdvancedSearch && (
            <div style={popoverStyle}>
              <h4 style={{ margin: '0 0 20px 0', fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Bộ lọc tìm kiếm</h4>
              <div style={filterGridStyle}>
                <FormInput label="MÃ HỒ SƠ" placeholder="Nhập mã hồ sơ..." />
                <FormInput label="TÊN NGƯỜI NỘP" placeholder="Tên người nộp..." />
                <FormInput label="SỐ TỜ/SỐ THỬA" placeholder="Số tờ/Số thửa..." />
                <div>
                  <label htmlFor="dossier-filter-category" style={labelStyle}>PHÂN LOẠI</label>
                  <select id="dossier-filter-category" style={inputBaseStyle}><option>Tất cả</option></select>
                </div>
                <div>
                  <label htmlFor="dossier-filter-status" style={labelStyle}>TRẠNG THÁI</label>
                  <select id="dossier-filter-status" style={inputBaseStyle}><option>Tất cả</option></select>
                </div>
                <div>
                  <label htmlFor="dossier-filter-date" style={labelStyle}>THỜI GIAN</label>
                  <input id="dossier-filter-date" type="date" style={inputBaseStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button type="button" style={btnCancelStyle} onClick={onCloseAdvancedSearch}>
                  Xóa bộ lọc
                </button>
                <button type="button" style={btnSaveRedStyle} onClick={onCloseAdvancedSearch}>
                  Áp dụng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={tableCardStyle}>
        <div style={tabsWrapper}>
          {DOSSIER_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              style={activeTab === tab ? tabActive : tabInactive}
            >
              {tab}
              {tabCounts[tab] > 0 && (
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 12,
                    fontWeight: 800,
                    color: activeTab === tab ? colors.primary : colors.textMuted,
                  }}
                >
                  ({tabCounts[tab]})
                </span>
              )}
            </button>
          ))}
        </div>

        <table style={tableStyle}>
          <thead>
            <tr style={thRowStyle}>
              <th style={thCellStyle}>MÃ HỒ SƠ</th>
              <th style={thCellStyle}>TÊN NGƯỜI NỘP</th>
              <th style={thCellStyle}>PHÂN LOẠI HỒ SƠ</th>
              <th style={thCellStyle}>LOẠI ĐẤT</th>
              <th style={thCellStyle}>NGÀY NHẬN HỒ SƠ</th>
              <th style={thCellStyle}>TRẠNG THÁI HIỆN TẠI</th>
              <th style={{ ...thCellStyle, textAlign: 'center' }}>HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Đang tải dữ liệu...</td></tr>
            ) : filteredDossiers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  {dossiers.length === 0
                    ? 'Chưa có hồ sơ trên hệ thống'
                    : `Không có hồ sơ nào ở mục "${activeTab}"`}
                </td>
              </tr>
            ) : (
              filteredDossiers.map((item) => (
                <tr key={item.rawId} style={tdRowStyle}>
                  <td style={{ ...tdCellStyle, fontWeight: 700, color: '#1e293b' }}>
                    {item.id}
                    {item.warning && <i className="bi bi-exclamation-triangle" style={{ color: '#f59e0b', marginLeft: 8 }}></i>}
                  </td>
                  <td style={{ ...tdCellStyle, fontWeight: 700 }}>{item.name}</td>
                  <td style={{ ...tdCellStyle, color: '#475569' }}>{item.categoryLabel}</td>
                  <td style={{ ...tdCellStyle, color: '#64748b' }}>{item.landType}</td>
                  <td style={{ ...tdCellStyle, color: '#64748b' }}>{item.date}</td>
                  <td style={tdCellStyle}>
                    <span style={getStatusBadge(item.status)}>
                      {item.statusLabel || mapStatusLabel(item.status)}
                    </span>
                  </td>
                  <td style={{ ...tdCellStyle, textAlign: 'center' }}>
                    <button type="button" style={iconBtnStyle} onClick={() => onViewDetail(item)} aria-label="Xem chi tiết hồ sơ"><i className="bi bi-eye"></i></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </CadastralLayout>
);

export default DossierListView;
