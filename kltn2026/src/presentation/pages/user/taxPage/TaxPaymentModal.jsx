import React from 'react';
import { backdropA11yProps } from '../../../../utils/a11y';
import {
  getLandTypeLabel,
  formatParcelDisplay,
  formatVND,
} from './taxPageUtils';

const rdStyleWidthBackgroundColor2 = { width: '100%', background: '#a30d11', color: '#fff', border: 'none', padding: '14px', fontSize: 16, fontWeight: 700, borderRadius: 10, marginBottom: 16 };
const rdStyleWidthBackgroundColor = { width: '100%', background: '#10b981', color: '#fff', border: 'none', padding: '14px', fontSize: 16, fontWeight: 700, borderRadius: 10, marginBottom: 16 };

const TaxPaymentModal = ({
  selectedPayment,
  paymentLink,
  creatingLink,
  onClose,
  onCreatePaymentLink,
}) => {
  if (!selectedPayment) return null;

  return (
    <div
      {...backdropA11yProps(onClose)}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 3000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: '#f8fafc', borderRadius: 16, width: 1100, maxWidth: '96%',
          maxHeight: '92vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}
      >
        <div style={{ padding: '20px 30px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
          <h3 style={{ margin: 0 }}>Thanh toán thuế đất đai</h3>
          <button type="button" onClick={onClose} style={{ fontSize: 28, background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ padding: '30px', display: 'flex', gap: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <h4 style={{ margin: '0 0 20px 0', fontWeight: 700 }}>Thông tin thanh toán</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 8px', lineHeight: 2 }}>
                <div style={{ color: '#666' }}>Loại đất</div>
                <div style={{ fontWeight: 600 }}>{getLandTypeLabel(selectedPayment)}</div>
                <div style={{ color: '#666' }}>Mã thửa đất</div>
                <div style={{ fontWeight: 600 }}>{formatParcelDisplay(selectedPayment)}</div>
                <div style={{ color: '#666' }}>Kỳ tính thuế</div>
                <div style={{ fontWeight: 600 }}>Năm {selectedPayment.taxYear}</div>
                <div style={{ color: '#666' }}>Thửa đất</div>
                <div style={{ fontWeight: 600 }}>{formatParcelDisplay(selectedPayment)}</div>
              </div>
            </div>
          </div>

          <div style={{ width: 380 }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#666', fontSize: 15 }}>Số tiền cần nộp:</p>
              <h1 style={{ color: '#a30d11', fontSize: 42, fontWeight: 800, margin: '12px 0 20px 0' }}>
                {formatVND(selectedPayment.taxAmount)}
              </h1>
              {!paymentLink ? (
                <button type="button" onClick={() => onCreatePaymentLink(selectedPayment.taxId)}
                  disabled={creatingLink}
                  style={rdStyleWidthBackgroundColor2}
                >
                  {creatingLink ? 'Đang tạo link...' : 'Thanh toán'}
                </button>
              ) : (
                <button type="button" onClick={() => window.open(paymentLink.checkoutUrl, '_blank', 'noopener,noreferrer')}
                  style={rdStyleWidthBackgroundColor}
                >
                  Mở PayOS trong tab mới
                </button>
              )}
              <p style={{ fontSize: 13, color: '#10b981', marginTop: 8 }}>🔒 Giao dịch được bảo mật bởi VNeID</p>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 30px 30px' }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
            <h5 style={{ margin: '0 0 16px 0' }}>Thanh toán PayOS</h5>
            {!paymentLink?.checkoutUrl ? (
              <div style={{ color: '#64748b' }}>Chưa có checkoutUrl</div>
            ) : (
              <>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
                  Nếu iframe bị chặn, bạn có thể bấm “Mở PayOS trong tab mới”.
                </div>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', height: 560 }}>
                  <iframe src={paymentLink.checkoutUrl} title="PayOS Checkout" sandbox="allow-scripts allow-forms allow-popups" style={{ border: 'none', width: '100%', height: '100%' }} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxPaymentModal;
