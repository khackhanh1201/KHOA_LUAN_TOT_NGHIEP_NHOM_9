import React from 'react';
import {
  formatDateVN,
  formatVND,
  formatShortVND,
  StatItem,
  containerStyle,
  headerStyle,
  btnPrimary,
  topCardStyle,
  chartsWrapper,
  chartCardStyle,
  chartContainer,
  chartCenterText,
  statsGrid,
  chartTitle,
  yAxis,
  axisLabel,
  thStyle,
  tdStyle,
} from './reportManagementUtils';

const rdStyleDisplayAlignItemsGap = { display: 'flex', alignItems: 'center', gap: 12, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 16px', marginBottom: 20 };
const rdStyleBackgroundBorderColor = { background: 'none', border: 'none', color: '#1d4ed8', fontWeight: 700, fontSize: 13, cursor: 'pointer', textDecoration: 'underline', padding: 0 };
const rdStyleHeightWidthDisplay = { height: 200, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', position: 'relative', paddingLeft: 40, marginTop: 20 };

const streetBarStyle = (heightPercent) => ({
  width: '100%',
  height: '100%',
  transform: `scaleY(${heightPercent / 100})`,
  transformOrigin: 'bottom',
  background: 'linear-gradient(to top, #10b981, #34d399)',
  borderRadius: '6px 6px 0 0',
  minHeight: 4,
  transition: 'transform 0.5s ease-out',
});

const ReportOverviewView = ({
  appliedFilters,
  hasActiveFilters,
  onClearFilters,
  onCreateReport,
  stats,
  donut,
  revenueData,
  chartData,
  streetDataList,
  top5Streets,
  maxPaidStreetVal,
  barTicks,
}) => (
  <div style={containerStyle}>
    <div style={headerStyle}>
      <div>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.01em' }}>
          Báo cáo tổng quát hệ thống
        </h2>
        <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>Kết quả tổng hợp dữ liệu báo cáo thống kê.</p>
      </div>
      <button type="button" style={btnPrimary} onClick={onCreateReport}>
        <i className="bi bi-bar-chart-fill" /> Tạo báo cáo thống kê
      </button>
    </div>

    {hasActiveFilters && (
      <div style={rdStyleDisplayAlignItemsGap}>
        <span style={{ fontSize: 13, color: '#1e40af', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <i className="bi bi-funnel-fill" /> Đang áp dụng lọc:
          {appliedFilters.street !== 'Tất cả' && ` [Tuyến: ${appliedFilters.street}]`}
          {appliedFilters.taxType !== 'Tất cả' && ` [Loại: ${appliedFilters.taxType}]`}
          {appliedFilters.startDate && ` [Từ: ${formatDateVN(appliedFilters.startDate)}]`}
          {appliedFilters.endDate && ` [Đến: ${formatDateVN(appliedFilters.endDate)}]`}
        </span>
        <button
          type="button"
          onClick={onClearFilters}
          style={rdStyleBackgroundBorderColor}
        >
          Xóa bộ lọc
        </button>
      </div>
    )}

    <div style={topCardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', width: '100%', flexWrap: 'wrap', gap: 24 }}>
        <div style={chartContainer}>
          <svg width="180" height="180" viewBox="0 0 180 180">
            <circle cx="90" cy="90" r={donut.r} fill="none" stroke="#f1f5f9" strokeWidth="20" />
            {stats.paid > 0 && (
              <circle cx="90" cy="90" r={donut.r} fill="none" stroke="#10b981" strokeWidth="20" strokeDasharray={`${donut.lenPaid} ${donut.circ}`} transform={`rotate(${donut.anglePaid} 90 90)`} />
            )}
            {stats.unpaid > 0 && (
              <circle cx="90" cy="90" r={donut.r} fill="none" stroke="#3b82f6" strokeWidth="20" strokeDasharray={`${donut.lenUnpaid} ${donut.circ}`} transform={`rotate(${donut.angleUnpaid} 90 90)`} />
            )}
            {stats.overdue > 0 && (
              <circle cx="90" cy="90" r={donut.r} fill="none" stroke="#ef4444" strokeWidth="20" strokeDasharray={`${donut.lenOverdue} ${donut.circ}`} transform={`rotate(${donut.angleOverdue} 90 90)`} />
            )}
          </svg>
          <div style={chartCenterText}>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700 }}>TỶ LỆ HOÀN THÀNH</div>
            <div style={{ fontSize: 24, color: '#10b981', fontWeight: 800 }}>{stats.completionRate.toFixed(1)}%</div>
          </div>
        </div>
        <div style={statsGrid}>
          <StatItem dotColor="#1e293b" label="TỔNG PHẢI THU" value={formatVND(stats.totalDue)} color="#1e293b" />
          <StatItem dotColor="#10b981" label="ĐÃ THU (THỰC THU)" value={formatVND(stats.paid)} color="#10b981" />
          <StatItem dotColor="#3b82f6" label="CHƯA THANH TOÁN" value={formatVND(stats.unpaid)} color="#3b82f6" />
          <StatItem dotColor="#ef4444" label="QUÁ HẠN" value={formatVND(stats.overdue)} color="#ef4444" />
        </div>
      </div>
    </div>

    <div style={chartsWrapper}>
      <div style={chartCardStyle}>
        <h4 style={chartTitle}>Biến động thu theo thời gian</h4>
        <div style={{ height: 200, width: '100%', position: 'relative', marginTop: 20 }}>
          <svg width="100%" height="100%" viewBox="0 0 500 150" preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a30d11" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#a30d11" stopOpacity="0.00" />
              </linearGradient>
            </defs>
            {chartData.yTicks.map((tick, idx) => {
              const y = 125 - (tick / chartData.maxAmountVal) * 110;
              return (
                <g key={tick}>
                  <line x1="40" y1={y} x2="480" y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="35" y={y + 3} textAnchor="end" fontSize="9" fill="#94a3b8" fontWeight="600">
                    {formatShortVND(tick)}
                  </text>
                </g>
              );
            })}
            {chartData.points.length > 0 && (
              <path d={`${chartData.pathD} L ${chartData.points[chartData.points.length - 1].x} 125 L ${chartData.points[0].x} 125 Z`} fill="url(#areaGrad)" />
            )}
            {chartData.points.length > 0 && (
              <path d={chartData.pathD} fill="none" stroke="#a30d11" strokeWidth="2.5" />
            )}
            {chartData.points.map((p, i) => (
              <g key={`T${revenueData[i]?.month ?? p.x}`}>
                <circle cx={p.x} cy={p.y} r="4.5" fill="#a30d11" stroke="#fff" strokeWidth="1.5" style={{ cursor: 'pointer' }} />
                {revenueData[i].amount > 0 && (
                  <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="8" fontWeight="700" fill="#475569">
                    {formatShortVND(revenueData[i].amount)}
                  </text>
                )}
              </g>
            ))}
            <line x1="40" y1="125" x2="480" y2="125" stroke="#cbd5e1" strokeWidth="1" />
            {revenueData.map((d, i) => (
              <text key={`month-${d.month}`} x={40 + i * 40} y="142" textAnchor="middle" fontSize="9" fill="#64748b" fontWeight="600">
                {`T${d.month}`}
              </text>
            ))}
          </svg>
        </div>
      </div>

      <div style={chartCardStyle}>
        <h4 style={chartTitle}>So sánh số thu giữa các khu vực (Top 5)</h4>
        <div style={rdStyleHeightWidthDisplay}>
          <div style={yAxis}>
            {barTicks.map((tick) => (
              <span key={tick}>{formatShortVND(tick)}</span>
            ))}
          </div>
          {top5Streets.length === 0 ? (
            <div style={{ fontSize: 13, color: '#94a3b8', margin: 'auto' }}>Không có dữ liệu thu</div>
          ) : (
            top5Streets.map((item) => {
              const heightPercent = maxPaidStreetVal > 0 ? (item.paid / maxPaidStreetVal) * 75 : 0;
              return (
                <div key={item.street} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end', position: 'relative' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>{formatShortVND(item.paid)}</span>
                  <div style={{ width: 32, height: '75%', display: 'flex', alignItems: 'flex-end' }}>
                    <div
                      style={streetBarStyle(heightPercent)}
                      title={`${item.paid.toLocaleString('vi-VN')} đ`}
                    />
                  </div>
                  <span style={{ ...axisLabel, maxWidth: 65, textAlign: 'center', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={item.street}>
                    {item.street}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>

    <div style={{ ...chartCardStyle, marginTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h4 style={chartTitle}>Bảng dữ liệu chi tiết theo tuyến đường</h4>
        <span style={{ fontSize: 13, color: '#64748b' }}>
          Có <b>{streetDataList.length}</b> khu vực được tìm thấy
        </span>
      </div>
      <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #e2e8f0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={thStyle}>STT</th>
              <th style={thStyle}>Tuyến đường/Khu vực</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Tổng phải thu</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Đã thu (Thực thu)</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Chưa thanh toán</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Quá hạn</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Tỷ lệ hoàn thành</th>
            </tr>
          </thead>
          <tbody>
            {streetDataList.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                  Không có dữ liệu thống kê nào cho các bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              streetDataList.map((item, index) => {
                const rate = item.totalDue > 0 ? (item.paid / item.totalDue) * 100 : 0;
                return (
                  <tr key={item.street} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={tdStyle}>{index + 1}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#1e293b' }}>{item.street}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>{formatVND(item.totalDue)}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, color: '#10b981' }}>{formatVND(item.paid)}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, color: '#3b82f6' }}>{formatVND(item.unpaid)}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, color: '#ef4444' }}>{formatVND(item.overdue)}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <div style={{ width: 60, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${rate}%`, height: '100%', background: '#10b981', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', minWidth: 35 }}>{rate.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default ReportOverviewView;
