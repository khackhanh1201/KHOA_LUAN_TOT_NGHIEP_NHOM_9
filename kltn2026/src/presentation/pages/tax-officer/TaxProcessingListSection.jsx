import React from 'react';
import {
  advBtnTrigger, advPopover, advTitle, advFieldGroup,
  advFieldLabel, advFieldInput, advFooter, advBtnReset, advBtnClose,
} from './_designTokens';
import { mapStatusToText, getStatusBadge } from './taxProcessingStyles';
import {
  searchInputStyle, searchIconStyle, tableContainerStyle, tabsWrapperStyle,
  tabActiveStyle, tabInactiveStyle, thStyle, tdStyle, tableHeaderRowStyle, tableBodyRowStyle,
} from './taxProcessingStyles';

const TaxProcessingListSection = ({
  search, filters, showAdvanced, activeTab, isLoading, displayedData, dispatch, onViewDetail,
}) => (
  <>
        {/* Header & Bộ lọc */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.01em' }}>Xử lý khai thuế</h2>
            <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>Danh sách hồ sơ đất đai cần xử lý và phê duyệt nghĩa vụ tài chính</p>
          </div>

          <div style={{ display: 'flex', gap: 12, position: 'relative' }}>
            <div style={{ position: 'relative', width: 360 }}>
              <i className="bi bi-search" style={searchIconStyle} />
              <input type="text" aria-label="Tìm kiếm mã hồ sơ" placeholder="Tìm kiếm mã hồ sơ..." value={search} onChange={(e) => dispatch({ type: 'patch', payload: { search: e.target.value } })} style={searchInputStyle} />
            </div>

            <button type="button" style={advBtnTrigger} onClick={() => dispatch({ type: 'patch', payload: { showAdvanced: !showAdvanced } })}>
              <i className="bi bi-sliders" /> Tìm kiếm nâng cao
            </button>

            {showAdvanced && (
              <div style={advPopover}>
                <h4 style={advTitle}>Tìm kiếm nâng cao</h4>
                <div style={advFieldGroup}>
                  <label htmlFor="tp-adv-code" style={advFieldLabel}>Mã hồ sơ</label>
                  <input id="tp-adv-code" type="text" placeholder="Nhập mã hồ sơ..." style={advFieldInput} value={filters.code} onChange={e => dispatch({ type: 'patch', payload: { filters: { ...filters, code: e.target.value } } })} />
                </div>
                <div style={advFieldGroup}>
                  <label htmlFor="tp-adv-name" style={advFieldLabel}>Tên người nộp</label>
                  <input id="tp-adv-name" type="text" placeholder="Nhập tên người nộp..." style={advFieldInput} value={filters.name} onChange={e => dispatch({ type: 'patch', payload: { filters: { ...filters, name: e.target.value } } })} />
                </div>
                <div style={advFieldGroup}>
                  <label htmlFor="tp-adv-tax-type" style={advFieldLabel}>Loại đất</label>
                  <select id="tp-adv-tax-type" style={advFieldInput} value={filters.taxType} onChange={e => dispatch({ type: 'patch', payload: { filters: { ...filters, taxType: e.target.value } } })}>
                    <option>Tất cả</option>
                    <option>Đất ở đô thị</option>
                    <option>Đất nông nghiệp</option>
                  </select>
                </div>
                <div style={{...advFieldGroup, marginBottom: 0}}>
                  <label htmlFor="tp-adv-status" style={advFieldLabel}>Trạng thái</label>
                  <select id="tp-adv-status" style={advFieldInput} value={filters.status} onChange={e => dispatch({ type: 'patch', payload: { filters: { ...filters, status: e.target.value } } })}>
                    <option>Tất cả</option>
                    <option value="PENDING">Đang chờ cán bộ địa chính xử lý</option>
                    <option value="PROCESSING">Đang xử lý</option>
                    <option value="APPROVED">Đã duyệt</option>
                    <option value="REJECTED">Từ chối</option>
                  </select>
                </div>
                <div style={advFooter}>
                  <button type="button" style={advBtnReset} onClick={() => dispatch({ type: 'resetFilters' })}>Xóa bộ lọc</button>
                  <button type="button" style={advBtnClose} onClick={() => dispatch({ type: 'patch', payload: { showAdvanced: false } })}>Đóng</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table Container */}
        <div style={tableContainerStyle}>
          <div style={tabsWrapperStyle}>
            <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', padding: 4, borderRadius: 8, width: 'fit-content' }}>
              {['ALL', 'PENDING', 'PROCESSING', 'APPROVED', 'COMPLETED'].map((tab) => (
                <button type="button" key={tab} onClick={() => dispatch({ type: 'patch', payload: { activeTab: tab } })} style={tab === activeTab ? tabActiveStyle : tabInactiveStyle}>
                  {tab === 'ALL' && 'Tất cả'}
                  {tab === 'PENDING' && 'Đang chờ cán bộ địa chính xử lý'}
                  {tab === 'PROCESSING' && 'Đang xử lý'}
                  {tab === 'APPROVED' && 'Đã duyệt'}
                  {tab === 'COMPLETED' && 'Hoàn thành'}
                </button>
              ))}
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={thStyle}>Mã hồ sơ</th>
                <th style={thStyle}>Tên người nộp</th>
                <th style={thStyle}>Loại đất</th>
                <th style={thStyle}>Ngày nhận</th>
                <th style={thStyle}>Trạng thái</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '48px' }}>
                  <div className="spinner-border text-danger" />
                  <div style={{ marginTop: 8, color: '#64748b', fontSize: 13 }}>Đang tải dữ liệu…</div>
                </td></tr>
              ) : displayedData.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: 14 }}>Không tìm thấy hồ sơ nào</td></tr>
              ) : (
                displayedData.map((item) => (
                  <tr key={item.id} style={tableBodyRowStyle}>
                    <td style={tdStyle}><span style={{ fontWeight: 700, color: '#a30d11' }}>{item.recordCode || item.id}</span></td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: '#1e293b' }}>{item.name}</td>
                    <td style={{ ...tdStyle, color: '#64748b' }}>{item.landType}</td>
                    <td style={{ ...tdStyle, color: '#64748b' }}>{item.date}</td>
                    <td style={tdStyle}><span style={getStatusBadge(item.status)}>{mapStatusToText(item.status)}</span></td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <button type="button" onClick={() => onViewDetail(item)}
                        aria-label="Xem chi tiết"
                        style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 18, cursor: 'pointer', padding: '6px 8px', borderRadius: 6 }}
                        title="Xem chi tiết"
                      >
                        <i className="bi bi-eye" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
  </>
);

export default TaxProcessingListSection;
