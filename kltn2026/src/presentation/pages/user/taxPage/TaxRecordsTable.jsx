import React from 'react';
import StatusBadge from './StatusBadge';
import {
  formatParcelDisplay,
  getLandTypeLabel,
  formatPayableAmount,
  formatDate,
  getAmountDisplayClass,
  isFullTaxExempt,
  hasPartialExemption,
} from './taxPageUtils';

const tabButtonStyle = (activeTab, tabKey) => ({
  padding: '6px 16px',
  borderRadius: 20,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  border: activeTab === tabKey ? '2px solid #a30d11' : '2px solid #e2e8f0',
  background: activeTab === tabKey ? '#fff1f2' : '#fff',
  color: activeTab === tabKey ? '#a30d11' : '#64748b',
});
const rdStyleBackgroundColorBorder = { background: '#a30d11', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' };

const TaxRecordsTable = ({ loading, tab, filtered, onTabChange, onSelectDetail, onNavigatePayment }) => (
  <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
    <div style={{ display: 'flex', gap: 4, padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
      {[{ key: 'all', label: 'Tất cả' }, { key: 'unpaid', label: 'Chưa thanh toán' }, { key: 'paid', label: 'Đã thanh toán' }].map((t) => (
        <button type="button" key={t.key}
          onClick={() => onTabChange(t.key)}
          style={tabButtonStyle(tab, t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>

    {loading ? (
      <div style={{ textAlign: 'center', padding: '60px' }}>Đang tải dữ liệu...</div>
    ) : (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#fafafa', borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ padding: '16px', textAlign: 'left' }}>MÃ THỬA ĐẤT</th>
            <th style={{ padding: '16px', textAlign: 'left' }}>LOẠI ĐẤT</th>
            <th style={{ padding: '16px', textAlign: 'left' }}>NĂM</th>
            <th style={{ padding: '16px', textAlign: 'right' }}>SỐ TIỀN</th>
            <th style={{ padding: '16px', textAlign: 'left' }}>NGÀY NỘP</th>
            <th style={{ padding: '16px', textAlign: 'center' }}>TRẠNG THÁI</th>
            <th style={{ padding: '16px', textAlign: 'center' }}>THAO TÁC</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '80px', color: '#94a3b8' }}>Không có tờ khai thuế nào</td></tr>
          ) : (
            filtered.map((r) => (
              <tr key={r.taxId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px', fontWeight: 700 }}>{formatParcelDisplay(r)}</td>
                <td style={{ padding: '16px' }}>{getLandTypeLabel(r)}</td>
                <td style={{ padding: '16px' }}>{r.taxYear}</td>
                <td style={{ padding: '16px', fontWeight: 700, textAlign: 'right' }} className={getAmountDisplayClass(r)}>
                  {formatPayableAmount(r)}
                </td>
                <td style={{ padding: '16px' }}>{formatDate(r.submittedAt)}</td>
                <td style={{ padding: '16px', textAlign: 'center' }}><StatusBadge status={r.status} /></td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <button type="button" onClick={() => onSelectDetail(r)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }} aria-label="Xem chi tiết tờ khai thuế">
                      <i className="bi bi-eye" />
                    </button>
                    {['AWAITING_PAYMENT', 'OVERDUE'].includes(r.status) && !isFullTaxExempt(r) && r.taxAmount > 0 && (
                      <button type="button" onClick={() => onNavigatePayment(r.taxId)}
                        style={rdStyleBackgroundColorBorder}
                      >
                        Thanh toán
                      </button>
                    )}
                    {isFullTaxExempt(r) && (
                      <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>Được miễn thuế</span>
                    )}
                    {hasPartialExemption(r) && (
                      <span style={{ fontSize: 12, color: '#15803d', fontWeight: 600 }}>Giảm {r.discountRate}%</span>
                    )}
                    {r.status === 'UNPAID' && (
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>Chờ duyệt hồ sơ</span>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    )}
  </div>
);

export default TaxRecordsTable;
