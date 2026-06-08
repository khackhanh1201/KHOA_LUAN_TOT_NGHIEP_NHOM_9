import React from 'react';
import { PAYMENT_TAB } from './paymentPageUtils';
import PaymentCard from './PaymentCard';

const tabButtonStyle = (activeTab, tabKey) => ({
  padding: '6px 16px',
  borderRadius: 20,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  border: activeTab === tabKey ? '2px solid #a30d11' : '2px solid #e2e8f0',
  background: activeTab === tabKey ? '#fff1f2' : '#fff',
  color: activeTab === tabKey ? '#a30d11' : '#64748b',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
});

const tabBadgeStyle = (activeTab, tabKey) => ({
  background: activeTab === tabKey ? '#a30d11' : '#e2e8f0',
  color: activeTab === tabKey ? '#fff' : '#64748b',
  fontSize: 12,
  fontWeight: 700,
  padding: '1px 7px',
  borderRadius: 10,
  minWidth: 20,
  textAlign: 'center',
});

const PaymentTabPanel = ({
  activeTab,
  pendingCount,
  loading,
  isHistoryTab,
  displayedPayments,
  creatingPaymentLink,
  dispatch,
  onOpenDetail,
  onDownloadReceipt,
  onPayment,
}) => (
  <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
    <div style={{ display: 'flex', gap: 4, padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
      {[
        { key: PAYMENT_TAB.PENDING, label: 'Chờ thanh toán' },
        { key: PAYMENT_TAB.HISTORY, label: 'Lịch sử giao dịch' },
      ].map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => dispatch({ type: 'PATCH', payload: { activeTab: t.key } })}
          style={tabButtonStyle(activeTab, t.key)}
        >
          {t.label}
          {t.key === PAYMENT_TAB.PENDING && pendingCount > 0 && (
            <span style={tabBadgeStyle(activeTab, t.key)}>
              {pendingCount}
            </span>
          )}
        </button>
      ))}
    </div>

    <div style={{ padding: '16px' }}>
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3 text-muted mb-0">
            {isHistoryTab ? 'Đang tải lịch sử giao dịch...' : 'Đang tải danh sách khoản phải nộp...'}
          </p>
        </div>
      ) : displayedPayments.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className={`bi ${isHistoryTab ? 'bi-receipt' : 'bi-check-circle-fill'}`}
            style={{ fontSize: '3rem', color: isHistoryTab ? '#94a3b8' : '#10b981' }} />
          <h5 className="mt-3 fw-bold text-dark">{isHistoryTab ? 'Chưa có giao dịch' : 'Tuyệt vời!'}</h5>
          <p className="mb-0" style={{ fontSize: 13 }}>
            {isHistoryTab ? 'Bạn chưa có khoản thuế nào được thanh toán.' : 'Bạn không có khoản thuế nào đang chờ thanh toán.'}
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {displayedPayments.map((item) => (
            <PaymentCard
              key={item.paymentId}
              item={item}
              isHistoryTab={isHistoryTab}
              creatingPaymentLink={creatingPaymentLink}
              onOpenDetail={onOpenDetail}
              onDownloadReceipt={onDownloadReceipt}
              onPayment={onPayment}
            />
          ))}
        </div>
      )}
    </div>
  </div>
);

export default PaymentTabPanel;
