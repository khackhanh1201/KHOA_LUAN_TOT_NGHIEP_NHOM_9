import React from 'react';
import { formatTaxRecordCode } from '../../../utils/taxRecordCode';
import {
  advBtnTrigger, advPopover, advTitle, advFieldGroup,
  advFieldLabel, advFieldInput, advFooter, advBtnReset, advBtnClose,
} from './_designTokens';
import {
  searchWrapperStyle,
  searchIconStyle,
  searchInputStyle,
  tableCardStyle,
  tabsWrapperStyle,
  tabContainer,
  tabActive,
  tabInactive,
  tableStyle,
  thRowStyle,
  thCellStyle,
  tdRowStyle,
  tdCellStyle,
  btnActionStyle,
  getStatusBadge,
} from './complaintManagementUtils';

const ComplaintManagementListView = ({
  searchTerm,
  advFilters,
  showAdvancedSearch,
  activeTab,
  loading,
  filteredComplaints,
  dispatch,
  onViewDetail,
}) => (
  <div style={{ padding: '24px 32px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.01em' }}>Xử lý khiếu nại</h2>
        <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>
          Tiếp nhận và giải quyết các khiếu nại về nghĩa vụ thuế
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, position: 'relative' }}>
        <div style={searchWrapperStyle}>
          <i className="bi bi-search" style={searchIconStyle} />
          <input
            type="text"
            aria-label="Tìm kiếm mã khiếu nại, CCCD, tên người dân"
            value={searchTerm}
            onChange={(e) => dispatch({ type: 'patch', payload: { searchTerm: e.target.value } })}
            placeholder="Tìm kiếm mã khiếu nại, CCCD, tên người dân..."
            style={searchInputStyle}
          />
        </div>

        <button type="button" style={advBtnTrigger}
          onClick={() => dispatch({ type: 'patch', payload: { showAdvancedSearch: !showAdvancedSearch } })}
        >
          <i className="bi bi-sliders" /> Tìm kiếm nâng cao
        </button>

        {showAdvancedSearch && (
          <div style={advPopover}>
            <h4 style={advTitle}>Tìm kiếm nâng cao</h4>
            <div style={advFieldGroup}>
              <label htmlFor="cm-adv-code" style={advFieldLabel}>Mã khiếu nại</label>
              <input id="cm-adv-code" type="text" placeholder="Nhập mã khiếu nại..." style={advFieldInput} value={advFilters.code} onChange={(e) => dispatch({ type: 'patch', payload: { advFilters: { ...advFilters, code: e.target.value } } })} />
            </div>
            <div style={advFieldGroup}>
              <label htmlFor="cm-adv-name" style={advFieldLabel}>Tên người khiếu nại</label>
              <input id="cm-adv-name" type="text" placeholder="Nhập tên người khiếu nại..." style={advFieldInput} value={advFilters.name} onChange={(e) => dispatch({ type: 'patch', payload: { advFilters: { ...advFilters, name: e.target.value } } })} />
            </div>
            <div style={advFieldGroup}>
              <label htmlFor="cm-adv-cccd" style={advFieldLabel}>Số CCCD</label>
              <input id="cm-adv-cccd" type="text" placeholder="Nhập số CCCD..." style={advFieldInput} value={advFilters.cccd} onChange={(e) => dispatch({ type: 'patch', payload: { advFilters: { ...advFilters, cccd: e.target.value } } })} />
            </div>
            <div style={{ ...advFieldGroup, marginBottom: 0 }}>
              <label htmlFor="cm-adv-type" style={advFieldLabel}>Loại khiếu nại</label>
              <select id="cm-adv-type" style={advFieldInput} value={advFilters.type} onChange={(e) => dispatch({ type: 'patch', payload: { advFilters: { ...advFilters, type: e.target.value } } })}>
                <option>Tất cả</option>
                <option>Khiếu nại về thuế</option>
                <option>Khiếu nại đất đai</option>
                <option>Khiếu nại chung</option>
              </select>
            </div>
            <div style={advFooter}>
              <button type="button" style={advBtnReset} onClick={() => dispatch({ type: 'resetFilters' })}>Xóa bộ lọc</button>
              <button type="button" style={advBtnClose} onClick={() => dispatch({ type: 'patch', payload: { showAdvancedSearch: false } })}>Đóng</button>
            </div>
          </div>
        )}
      </div>
    </div>

    <div style={tableCardStyle}>
      <div style={tabsWrapperStyle}>
        <div style={tabContainer}>
          {['Tất cả', 'Chờ xử lý', 'Đang xử lý', 'Chờ bổ sung', 'Đã giải quyết'].map((tab) => (
            <button type="button" key={tab}
              onClick={() => dispatch({ type: 'patch', payload: { activeTab: tab } })}
              style={activeTab === tab ? tabActive : tabInactive}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <table style={tableStyle}>
        <thead>
          <tr style={thRowStyle}>
            <th style={thCellStyle}>Mã khiếu nại</th>
            <th style={thCellStyle}>Người khiếu nại</th>
            <th style={thCellStyle}>Loại khiếu nại</th>
            <th style={thCellStyle}>Ngày gửi</th>
            <th style={thCellStyle}>Trạng thái</th>
            <th style={{ ...thCellStyle, textAlign: 'center' }}>Thao tác</th>
            <th style={{ ...thCellStyle, textAlign: 'center' }}>Xuất hồ sơ</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
                Đang tải dữ liệu...
              </td>
            </tr>
          ) : filteredComplaints.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
                Không có khiếu nại nào
              </td>
            </tr>
          ) : (
            filteredComplaints.map((item) => (
              <tr key={item.id} style={tdRowStyle}>
                <td style={tdCellStyle}>
                  <span style={{ fontWeight: 700, color: '#a30d11' }}>{item.complaintCode}</span>
                </td>
                <td style={tdCellStyle}>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>CCCD: {item.cccdNumber}</div>
                </td>
                <td style={tdCellStyle}>
                  <div style={{ fontWeight: 500, color: '#1e293b' }}>{item.type}</div>
                  {item.recordId && (
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      Hồ sơ {formatTaxRecordCode(item.recordId, item.createdAtRaw)}
                    </div>
                  )}
                </td>
                <td style={{ ...tdCellStyle, color: '#64748b' }}>{item.date}</td>
                <td style={{ ...tdCellStyle, textAlign: 'center' }}>
                  <span style={getStatusBadge(item.status)}>{item.statusLabel}</span>
                </td>
                <td style={{ ...tdCellStyle, textAlign: 'center' }}>
                  <button type="button" onClick={() => onViewDetail(item)} aria-label="Xem chi tiết" title="Xem chi tiết" style={btnActionStyle}>
                    <i className="bi bi-eye" />
                  </button>
                </td>
                <td style={{ ...tdCellStyle, textAlign: 'center' }}>
                  <button type="button" aria-label="Tải xuống" title="Tải xuống" style={btnActionStyle}>
                    <i className="bi bi-download" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default ComplaintManagementListView;
