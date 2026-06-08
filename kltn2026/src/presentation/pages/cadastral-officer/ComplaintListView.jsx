import React from 'react';
import CadastralLayout from '../../components/CadastralLayout';
import { pageTitle, pageSubtitle } from '../../theme/designTokens';
import {
  getStatusBadge,
  searchWrapperStyle,
  searchIconStyle,
  searchInputStyle,
  btnDarkRedStyle,
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
} from './complaintStyles';

const TABS = ['Tất cả', 'Chờ xử lý', 'Đang xử lý', 'Chờ bổ sung', 'Đã giải quyết'];

const ComplaintListView = ({
  user,
  activeTab,
  loading,
  filteredComplaints,
  showAdvancedSearch,
  onTabChange,
  onToggleAdvancedSearch,
  onViewDetail,
}) => (
  <CadastralLayout user={user}>
    <div style={{ padding: '10px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={pageTitle}>Xử lý khiếu nại</h2>
          <p style={pageSubtitle}>Tiếp nhận và giải quyết khiếu nại về đất đai, hồ sơ địa chính</p>
        </div>

        <div style={{ display: 'flex', gap: 12, position: 'relative' }}>
          <div style={searchWrapperStyle}>
            <i className="bi bi-search" style={searchIconStyle}></i>
            <input
              type="text"
              placeholder="Tìm kiếm mã khiếu nại, tên người dân..."
              aria-label="Tìm kiếm mã khiếu nại, tên người dân"
              style={searchInputStyle}
            />
          </div>

          <button type="button" style={btnDarkRedStyle} onClick={onToggleAdvancedSearch}>
            <i className="bi bi-funnel"></i> Tìm kiếm nâng cao
          </button>
        </div>
      </div>

      <div style={tableCardStyle}>
        <div style={tabsWrapper}>
          {TABS.map((tab) => (
            <button type="button" key={tab}
              onClick={() => onTabChange(tab)}
              style={activeTab === tab ? tabActive : tabInactive}
            >
              {tab}
            </button>
          ))}
        </div>

        <table style={tableStyle}>
          <thead>
            <tr style={thRowStyle}>
              <th style={thCellStyle}>MÃ KHIẾU NẠI</th>
              <th style={thCellStyle}>NGƯỜI KHIẾU NẠI</th>
              <th style={thCellStyle}>LOẠI KHIẾU NẠI</th>
              <th style={thCellStyle}>NGÀY GỬI</th>
              <th style={thCellStyle}>TRẠNG THÁI</th>
              <th style={{ ...thCellStyle, textAlign: 'center' }}>THAO TÁC</th>
              <th style={{ ...thCellStyle, textAlign: 'center' }}>XUẤT HỒ SƠ</th>
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
                  <td style={{ ...tdCellStyle, fontWeight: 700, color: '#1e293b' }}>
                    {item.complaintCode}
                  </td>
                  <td style={{ ...tdCellStyle, fontWeight: 700 }}>{item.name}</td>
                  <td style={{ ...tdCellStyle, color: '#64748b' }}>{item.type}</td>
                  <td style={{ ...tdCellStyle, color: '#64748b' }}>{item.date}</td>
                  <td style={tdCellStyle}>
                    <span style={getStatusBadge(item.status)}>{item.statusLabel}</span>
                  </td>
                  <td style={{ ...tdCellStyle, textAlign: 'center' }}>
                    <button type="button" style={iconBtnStyle} onClick={() => onViewDetail(item)} aria-label="Xem chi tiết khiếu nại">
                      <i className="bi bi-eye"></i>
                    </button>
                  </td>
                  <td style={{ ...tdCellStyle, textAlign: 'center' }}>
                    <button type="button" style={iconBtnStyle} aria-label="Xuất hồ sơ"><i className="bi bi-download"></i></button>
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

export default ComplaintListView;
