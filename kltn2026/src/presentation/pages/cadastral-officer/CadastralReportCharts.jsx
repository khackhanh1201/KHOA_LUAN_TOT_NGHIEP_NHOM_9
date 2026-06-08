import React from 'react';
import { formatShortCount } from './cadastralReportUtils';
import {
  sectionTitleStyle,
  topCardStyle,
  chartsWrapper,
  chartCardStyle,
  chartContainer,
  chartCenterText,
  statsGrid,
  chartTitle,
  yAxis,
  axisLabel,
  tableThStyle,
  tableTdStyle,
} from './cadastralReportStyles';

const StatItem = ({ dotColor, label, value, color }) => (
  <div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor }} />
      <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>{label}</span>
    </div>
    <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
  </div>
);

const rdStyleHeightWidthDisplay = { height: 200, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', position: 'relative', paddingLeft: 40, marginTop: 20 };

const CadastralReportCharts = ({ stats, chartData }) => {
  const {
    changeSubtext,
    resolvedSubtext,
    monthlyTrend,
    maxMonthly,
    maxMonthlyVal,
    yTicks,
    linePoints,
    linePathD,
    top5Areas,
    maxAreaVal,
    barTicks,
    pctResolved,
    pctProcessing,
    pctOverdue,
    pctOther,
    completionRate,
    circ,
    lenResolved,
    lenProcessing,
    lenOverdue,
    lenOther,
    angleResolved,
    angleProcessing,
    angleOverdue,
    angleOther,
  } = chartData;

  return (
    <>
      <div style={topCardStyle}>
        <h4 style={{ ...sectionTitleStyle, marginBottom: 20 }}>Tổng quan xử lý hồ sơ</h4>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', width: '100%', flexWrap: 'wrap', gap: 24 }}>
          <div style={chartContainer}>
            <svg width="180" height="180" viewBox="0 0 180 180">
              <circle cx="90" cy="90" r="70" fill="none" stroke="#f1f5f9" strokeWidth="20" />
              {pctResolved > 0 && (
                <circle cx="90" cy="90" r="70" fill="none" stroke="#10b981" strokeWidth="20"
                  strokeDasharray={`${lenResolved} ${circ}`} transform={`rotate(${angleResolved} 90 90)`} />
              )}
              {pctProcessing > 0 && (
                <circle cx="90" cy="90" r="70" fill="none" stroke="#f59e0b" strokeWidth="20"
                  strokeDasharray={`${lenProcessing} ${circ}`} transform={`rotate(${angleProcessing} 90 90)`} />
              )}
              {pctOverdue > 0 && (
                <circle cx="90" cy="90" r="70" fill="none" stroke="#ef4444" strokeWidth="20"
                  strokeDasharray={`${lenOverdue} ${circ}`} transform={`rotate(${angleOverdue} 90 90)`} />
              )}
              {pctOther > 0 && (
                <circle cx="90" cy="90" r="70" fill="none" stroke="#94a3b8" strokeWidth="20"
                  strokeDasharray={`${lenOther} ${circ}`} transform={`rotate(${angleOther} 90 90)`} />
              )}
            </svg>
            <div style={chartCenterText}>
              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700 }}>TỶ LỆ HOÀN THÀNH</div>
              <div style={{ fontSize: 24, color: '#10b981', fontWeight: 800 }}>{completionRate}%</div>
            </div>
          </div>
          <div style={statsGrid}>
            <StatItem dotColor="#1e293b" label="TỔNG TIẾP NHẬN" value={stats.totalReceived ?? 0} color="#1e293b" />
            <StatItem dotColor="#10b981" label="ĐÃ GIẢI QUYẾT" value={stats.totalResolved ?? 0} color="#10b981" />
            <StatItem dotColor="#f59e0b" label="ĐANG XỬ LÝ" value={stats.totalProcessing ?? 0} color="#f59e0b" />
            <StatItem dotColor="#ef4444" label="HỒ SƠ TRỄ HẠN" value={stats.totalOverdue ?? 0} color="#ef4444" />
          </div>
        </div>
        <p style={{ margin: '16px 0 0', fontSize: 12, color: '#64748b', textAlign: 'center' }}>
          {changeSubtext} · {resolvedSubtext}
        </p>
      </div>

      <div style={chartsWrapper}>
        <div style={chartCardStyle}>
          <h4 style={chartTitle}>Biến động tiếp nhận hồ sơ theo thời gian</h4>
          <div style={{ height: 200, width: '100%', position: 'relative', marginTop: 20 }}>
            <svg width="100%" height="100%" viewBox="0 0 500 150" preserveAspectRatio="none">
              <defs>
                <linearGradient id="cadastralAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#b91c1c" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#b91c1c" stopOpacity="0" />
                </linearGradient>
              </defs>
              {yTicks.map((tick, idx) => {
                const y = 125 - (tick / maxMonthlyVal) * 110;
                return (
                  <g key={tick}>
                    <line x1="40" y1={y} x2="480" y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="35" y={y + 3} textAnchor="end" fontSize="9" fill="#94a3b8" fontWeight="600">
                      {formatShortCount(tick)}
                    </text>
                  </g>
                );
              })}
              {linePoints.length > 0 && maxMonthly > 0 && (
                <path
                  d={`${linePathD} L ${linePoints[linePoints.length - 1].x} 125 L ${linePoints[0].x} 125 Z`}
                  fill="url(#cadastralAreaGrad)"
                />
              )}
              {linePoints.length > 0 && maxMonthly > 0 && (
                <path d={linePathD} fill="none" stroke="#b91c1c" strokeWidth="2.5" />
              )}
              {linePoints.map((p) => (
                <g key={`month-${p.month}`}>
                  <circle cx={p.x} cy={p.y} r="4.5" fill="#b91c1c" stroke="#fff" strokeWidth="1.5" />
                  {p.amount > 0 && (
                    <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="8" fontWeight="700" fill="#475569">
                      {formatShortCount(p.amount)}
                    </text>
                  )}
                </g>
              ))}
              <line x1="40" y1="125" x2="480" y2="125" stroke="#cbd5e1" strokeWidth="1" />
              {monthlyTrend.map((d, i) => (
                <text key={d.month} x={40 + i * 40} y="142" textAnchor="middle" fontSize="9" fill="#64748b" fontWeight="600">
                  {`T${d.month}`}
                </text>
              ))}
            </svg>
          </div>
        </div>

        <div style={chartCardStyle}>
          <h4 style={chartTitle}>So sánh hồ sơ giữa các khu vực (Top 5)</h4>
          <div style={rdStyleHeightWidthDisplay}>
            <div style={yAxis}>
              {barTicks.map((tick) => (
                <span key={tick}>{formatShortCount(tick)}</span>
              ))}
            </div>
            {top5Areas.length === 0 ? (
              <div style={{ fontSize: 13, color: '#94a3b8', margin: 'auto' }}>Không có dữ liệu</div>
            ) : (
              top5Areas.map((item, index) => {
                const heightPercent = maxAreaVal > 0 ? (item.total / maxAreaVal) * 75 : 0;
                return (
                  <div key={item.wardCode || item.wardName} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>{formatShortCount(item.total)}</span>
                    <div
                      style={{
                        width: 32,
                        height: `${heightPercent}%`,
                        background: 'linear-gradient(to top, #10b981, #34d399)',
                        borderRadius: '6px 6px 0 0',
                        minHeight: 4,
                      }}
                      title={`${item.unit}: ${item.total}`}
                    />
                    <span style={{ ...axisLabel, maxWidth: 65, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.unit}>
                      {item.unit}
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
          <h4 style={chartTitle}>Bảng dữ liệu chi tiết theo đơn vị hành chính</h4>
          <span style={{ fontSize: 13, color: '#64748b' }}>
            Có <b>{stats.areaStats?.length ?? 0}</b> đơn vị
          </span>
        </div>
        <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={tableThStyle}>STT</th>
                <th style={tableThStyle}>Đơn vị hành chính</th>
                <th style={{ ...tableThStyle, textAlign: 'center' }}>Tổng</th>
                <th style={{ ...tableThStyle, textAlign: 'center' }}>Đã giải quyết</th>
                <th style={{ ...tableThStyle, textAlign: 'center' }}>Đang xử lý</th>
                <th style={{ ...tableThStyle, textAlign: 'center' }}>Tỷ lệ hoàn thành</th>
              </tr>
            </thead>
            <tbody>
              {!stats.areaStats?.length ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
                    Không có dữ liệu thống kê cho bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                stats.areaStats.map((row, index) => (
                  <tr key={row.wardCode || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={tableTdStyle}>{index + 1}</td>
                    <td style={{ ...tableTdStyle, fontWeight: 700, color: '#1e293b' }}>{row.unit}</td>
                    <td style={{ ...tableTdStyle, textAlign: 'center', fontWeight: 600 }}>{row.total}</td>
                    <td style={{ ...tableTdStyle, textAlign: 'center', fontWeight: 600, color: '#10b981' }}>{row.resolved}</td>
                    <td style={{ ...tableTdStyle, textAlign: 'center', fontWeight: 600, color: '#f59e0b' }}>{row.pending}</td>
                    <td style={{ ...tableTdStyle, textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <div style={{ width: 60, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${row.rate}%`, height: '100%', background: '#10b981' }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>{row.rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default CadastralReportCharts;
