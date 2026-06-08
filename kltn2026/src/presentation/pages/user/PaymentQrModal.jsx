import React from 'react';
import { backdropA11yProps } from '../../../utils/a11y';
import { colors, radius, shadow } from '../../theme/designTokens';
import QrModalHeader from './paymentQr/QrModalHeader';
import QrLeftPanel from './paymentQr/QrLeftPanel';
import QrRightPanel from './paymentQr/QrRightPanel';
import QrModalFooter from './paymentQr/QrModalFooter';

const rdStylePositionInsetBackground = {
      position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(6px)',
      zIndex: 2600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    };

const PaymentQrModal = ({ open, data, item, copiedField, onClose, onCopy, onConfirmTransfer }) => {
  if (!open) return null;

  const d = data || {};
  const payAmount = d.totalPayable ?? d.amount ?? item?.totalPayable ?? item?.amount ?? 0;
  const baseAmount = d.baseAmount ?? item?.baseAmount;
  const penaltyAmount = d.penaltyAmount ?? item?.penaltyAmount ?? 0;

  const copyRowsList = [
    { key: 'account', icon: 'bi-credit-card-2-front', label: 'Số tài khoản', value: d.accountNumber || '—', copy: d.accountNumber },
    { key: 'amount', icon: 'bi-cash-stack', label: 'Số tiền chuyển', value: `${Number(payAmount).toLocaleString('vi-VN')} ₫`, copy: String(payAmount) },
    { key: 'memo', icon: 'bi-chat-left-text', label: 'Nội dung chuyển khoản', value: d.description || '—', copy: d.description },
  ];

  const metaRows = [
    item?.paymentId != null && { label: 'Mã hóa đơn', value: `#${item.paymentId}` },
    item?.taxYear != null && { label: 'Năm thuế', value: String(item.taxYear) },
    item?.address && { label: 'Thửa đất', value: item.address },
  ].filter(Boolean);

  return (
    <div {...backdropA11yProps(onClose)} style={rdStylePositionInsetBackground}>
      <div style={{
        width: 'min(860px, 96vw)', background: colors.bgSurface, borderRadius: radius.xl,
        overflow: 'hidden', boxShadow: shadow.modal, display: 'flex', flexDirection: 'column',
      }}>
        <QrModalHeader onClose={onClose} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', minHeight: 400 }}>
          <QrLeftPanel payAmount={payAmount} baseAmount={baseAmount} penaltyAmount={penaltyAmount} qrCodeValue={d.qrCode} />
          <QrRightPanel
            metaRows={metaRows}
            copyRows={{ bankName: d.bankName, accountName: d.accountName, rows: copyRowsList }}
            copiedField={copiedField}
            onCopy={onCopy}
          />
        </div>
        <QrModalFooter onClose={onClose} onConfirmTransfer={onConfirmTransfer} />
      </div>
    </div>
  );
};

export default PaymentQrModal;
