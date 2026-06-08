import React from 'react';
import { formatStatus, formatDateTime } from './cadastralReportUtils';
import { cardStyle, cardHeaderStyle, thStyle, tdStyle } from './cadastralReportStyles';

const CadastralReportDetailsTable = ({ loading, stats }) => (
  <div style={{ ...cardStyle, marginTop: 24 }}>
    <div style={cardHeaderStyle}>
      <span style={{ fontWeight: 700, color: '#1e293b' }}>
        Danh sách chi tiết theo bộ lọc
        {!loading && stats?.details != null && (
          <span style={{ fontWeight: 500, color: '#64748b', marginLeft: 8 }}>
            ({stats.details.length} mục)
          </span>
        )}
      </span>
    </div>

    {loading ? (
      <div style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>Đang tải danh sách...</div>
    ) : !stats?.details?.length ? (
      <div style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: 14 }}>
        Không có hồ sơ hoặc khiếu nại nào phù hợp với bộ lọc hiện tại.
      </div>
    ) : (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
            <th style={thStyle}>MÃ</th>
            <th style={thStyle}>LOẠI</th>
            <th style={thStyle}>NỘI DUNG</th>
            <th style={thStyle}>ĐƠN VỊ</th>
            <th style={thStyle}>NGÀY TIẾP NHẬN</th>
            <th style={{ ...thStyle, textAlign: 'center' }}>TRẠNG THÁI</th>
          </tr>
        </thead>
        <tbody>
          {stats.details.map((row) => (
            <tr
              key={`${row.itemType}-${row.id}`}
              style={{
                borderBottom: '1px solid #f8fafc',
                backgroundColor: row.overdue ? '#fffbeb' : 'transparent',
              }}
            >
              <td style={{ ...tdStyle, fontWeight: 700, color: '#1e293b' }}>{row.code}</td>
              <td style={tdStyle}>{row.itemType === 'COMPLAINT' ? 'Khiếu nại' : 'Hồ sơ'}</td>
              <td style={{ ...tdStyle, color: '#475569', maxWidth: 280 }}>{row.category}</td>
              <td style={tdStyle}>{row.unit}</td>
              <td style={tdStyle}>{formatDateTime(row.submittedAt)}</td>
              <td style={{ ...tdStyle, textAlign: 'center' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    backgroundColor: row.overdue ? '#fef2f2' : '#f1f5f9',
                    color: row.overdue ? '#b91c1c' : '#475569',
                  }}
                >
                  {formatStatus(row.status)}
                  {row.overdue ? ' · Trễ hạn' : ''}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

export default CadastralReportDetailsTable;
