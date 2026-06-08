import React from 'react';
import {
  formatPayableAmount,
  getAmountDisplayClass,
  isFullTaxExempt,
} from './paymentPageUtils';

const PaymentCard = ({
  item,
  isHistoryTab,
  creatingPaymentLink,
  onOpenDetail,
  onDownloadReceipt,
  onPayment,
}) => (
  <div key={item.paymentId} className="col-12">
    <div className="card h-100 shadow-sm" style={{ borderRadius: '16px', border: '1px solid #f1f5f9' }}>
      <div className="card-body p-4 p-md-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-4 gap-3">
          <div>
            <h5 className="fw-bold mb-1 text-dark">{item.type}</h5>
            <div className="text-muted font-monospace small">Mã tham chiếu: {item.code}</div>
            {item.installmentLabel && (
              <span className="badge bg-info bg-opacity-10 text-info border border-info mt-2 px-2 py-1">
                {item.installmentLabel}
              </span>
            )}
            {item.annualTaxTotal != null && item.annualTaxTotal > 0 && (
              <div className="text-muted small mt-1">
                Tổng thuế năm {item.taxYear}: {Number(item.annualTaxTotal).toLocaleString('vi-VN')} ₫
              </div>
            )}
          </div>
          {isHistoryTab ? (
            <span className="badge bg-success bg-opacity-10 text-success border border-success px-3 py-2 rounded-pill fw-semibold">
              <i className="bi bi-check-circle me-1"></i> Đã thanh toán · {item.paidAt}
            </span>
          ) : (
            <span className="badge bg-warning bg-opacity-10 text-warning border border-warning px-3 py-2 rounded-pill fw-semibold">
              <i className="bi bi-clock-history me-1"></i> Hạn nộp: {item.dueDate}
            </span>
          )}
        </div>

        <div className="bg-light rounded-4 p-4 mb-4 border">
          <div className="row g-3">
            <div className="col-md-6">
              <small className="text-muted fw-semibold">THỬA ĐẤT LIÊN QUAN</small>
              <div className="fw-bold text-dark mt-1">{item.parcel}</div>
            </div>
            <div className="col-6 col-md-3">
              <small className="text-muted fw-semibold">DIỆN TÍCH</small>
              <div className="fw-bold text-dark mt-1">
                {item.area != null && item.area !== '—'
                  ? `${Number(item.area).toLocaleString('vi-VN')} m²`
                  : '—'}
              </div>
            </div>
            <div className="col-6 col-md-3">
              <small className="text-muted fw-semibold">THUẾ SUẤT</small>
              <div className="fw-bold text-dark mt-1">{item.taxRate || '—'}</div>
            </div>
          </div>
        </div>

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-4">
          <div>
            <small className="text-muted fw-bold">
              {isHistoryTab ? 'SỐ TIỀN ĐÃ NỘP' : 'SỐ TIỀN CẦN NỘP'}
            </small>
            <h3 className={`fw-bold mb-0 mt-1 ${getAmountDisplayClass(item)}`}>
              {formatPayableAmount(item)}
            </h3>
            {isFullTaxExempt(item) && item.exemptionReason && (
              <small className="text-muted">{item.exemptionReason}</small>
            )}
            {!isFullTaxExempt(item) &&
              item.discountRate > 0 &&
              item.discountRate < 100 && (
                <small className="text-success d-block mt-1">
                  Miễn giảm {item.discountRate}% — {item.exemptionReason || 'Đã duyệt'}
                </small>
              )}
          </div>

          <div className="d-flex gap-2 w-100 w-md-auto flex-wrap">
            <button type="button" className="btn btn-outline-danger fw-semibold flex-grow-1 flex-md-grow-0 px-4 py-2"
              style={{ borderRadius: '8px' }}
              onClick={() => onOpenDetail(item)}
            >
              Xem chi tiết
            </button>
            {isHistoryTab ? (
              <button type="button" className="btn btn-outline-secondary fw-semibold flex-grow-1 flex-md-grow-0 px-4 py-2"
                style={{ borderRadius: '8px' }}
                onClick={() => onDownloadReceipt(item.paymentId)}
              >
                <i className="bi bi-download me-1"></i> Tải biên lai
              </button>
            ) : !isFullTaxExempt(item) ? (
              <button type="button" className="btn btn-danger fw-semibold flex-grow-1 flex-md-grow-0 px-4 py-2 d-flex justify-content-center align-items-center gap-2"
                style={{ borderRadius: '8px' }}
                onClick={() => onPayment(item)}
                disabled={!item.canPay || creatingPaymentLink}
              >
                <i className="bi bi-credit-card"></i> Thanh toán ngay
              </button>
            ) : (
              <span className="badge bg-success bg-opacity-10 text-success border border-success px-4 py-2 rounded-pill fw-semibold">
                <i className="bi bi-shield-check me-1"></i> Được miễn thuế
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default PaymentCard;
