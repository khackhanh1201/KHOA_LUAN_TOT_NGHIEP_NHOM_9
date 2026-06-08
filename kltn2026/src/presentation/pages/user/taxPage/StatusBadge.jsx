import React from 'react';

const StatusBadge = ({ status }) => {
  const cfg = status === 'PAID'
    ? { label: 'Đã thanh toán', bg: '#dcfce7', color: '#16a34a' }
    : status === 'UNPAID'
    ? { label: 'Chưa thanh toán', bg: '#fef9c3', color: '#ca8a04' }
    : status === 'AWAITING_PAYMENT'
    ? { label: 'Chờ thanh toán', bg: '#fef3c7', color: '#d97706' }
    : status === 'OVERDUE'
    ? { label: 'Trễ hạn', bg: '#fee2e2', color: '#dc2626' }
    : status === 'APPROVED'
    ? { label: 'Đã duyệt', bg: '#dbeafe', color: '#2563eb' }
    : { label: 'Chờ duyệt', bg: '#e2e8f0', color: '#475569' };

  return (
    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
