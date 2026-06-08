import React from 'react';

const formatCurrency = (v) => (v != null ? `${Number(v).toLocaleString('vi-VN')} ₫` : '—');
const formatDate = (v) => (v ? new Date(v).toLocaleDateString('vi-VN') : '—');

const tabButtonStyle = (activeTab, tabKey) => ({
  background: 'none',
  border: 'none',
  padding: '8px 16px',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: activeTab === tabKey ? 700 : 400,
  color: activeTab === tabKey ? '#f97316' : '#94a3b8',
  borderBottom: activeTab === tabKey ? '2px solid #f97316' : '2px solid transparent',
  marginBottom: -1,
  transition: 'border-color 0.2s, color 0.2s',
});

const LandTaxRecentActivity = ({
  cardStyle,
  taxRecords,
  declarations,
  activeTab,
  onTabChange,
  onRefresh,
  StatusBadge,
}) => (
  <div style={cardStyle}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <h5 style={{ fontWeight: 700, color: '#1e293b', margin: 0, fontSize: 15 }}>Hoạt động gần đây</h5>
      <button type="button" onClick={onRefresh} style={{ background: 'none', border: 'none', color: '#f97316', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
        <i className="bi bi-arrow-clockwise me-1" />Làm mới
      </button>
    </div>

    <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #f1f5f9', marginBottom: 16 }}>
      {[
        { key: 'tax', label: 'Lịch sử hóa đơn thuế' },
        { key: 'declarations', label: 'Lịch sử tờ khai' },
      ].map((tab) => (
        <button type="button" key={tab.key} onClick={() => onTabChange(tab.key)} style={tabButtonStyle(activeTab, tab.key)}>
          {tab.label}
        </button>
      ))}
    </div>

    {activeTab === 'tax' && (
      taxRecords.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8' }}>
          <i className="bi bi-inbox" style={{ fontSize: 32 }} />
          <p style={{ marginTop: 8, fontSize: 13 }}>Chưa có bản ghi thuế nào</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Mã thanh toán', 'Ngày cập nhật', 'Thửa đất', 'Năm thuế', 'Số tiền', 'Trạng thái'].map((h) => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 12, borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {taxRecords.map((r, i) => (
                <tr key={r.taxId} style={{ borderBottom: '1px solid #f8fafc', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1e293b' }}>PAY-{String(r.taxId).padStart(3, '0')}</td>
                  <td style={{ padding: '10px 14px', color: '#64748b' }}>{formatDate(r.createdAt)}</td>
                  <td style={{ padding: '10px 14px', color: '#64748b' }}>{r.parcelCode || `Thửa #${r.parcelId}`}</td>
                  <td style={{ padding: '10px 14px', color: '#475569' }}>Thuế đất năm {r.taxYear}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1e293b' }}>{formatCurrency(r.taxAmount)}</td>
                  <td style={{ padding: '10px 14px' }}><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    )}

    {activeTab === 'declarations' && (
      declarations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8' }}>
          <i className="bi bi-inbox" style={{ fontSize: 32 }} />
          <p style={{ marginTop: 8, fontSize: 13 }}>Chưa có tờ khai nào</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Mã tờ khai', 'Ngày nộp', 'Thửa đất', 'Năm thuế', 'Diện tích (m²)', 'Mục đích', 'Trạng thái'].map((h) => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 12, borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {declarations.map((d, i) => (
                <tr key={d.declarationId} style={{ borderBottom: '1px solid #f8fafc', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1e293b' }}>TK-{String(d.declarationId).padStart(3, '0')}</td>
                  <td style={{ padding: '10px 14px', color: '#64748b' }}>{formatDate(d.createdAt)}</td>
                  <td style={{ padding: '10px 14px', color: '#64748b' }}>{d.parcelCode || `Thửa #${d.parcelId}`}</td>
                  <td style={{ padding: '10px 14px', color: '#475569' }}>{d.taxYear}</td>
                  <td style={{ padding: '10px 14px', color: '#475569' }}>{d.declaredArea?.toLocaleString('vi-VN')}</td>
                  <td style={{ padding: '10px 14px', color: '#475569' }}>{d.declaredPurpose || '—'}</td>
                  <td style={{ padding: '10px 14px' }}><StatusBadge status={d.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    )}
  </div>
);

export default LandTaxRecentActivity;
