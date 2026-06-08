import React from 'react';
import { backdropA11yProps } from '../../../../utils/a11y';
import { isFullTaxExempt } from './paymentPageUtils';
import {
  PaymentTaxDetailHeader,
  PaymentTaxLandInfoSection,
  PaymentTaxTierSection,
  PaymentTaxExemptionSection,
  PaymentTaxPenaltySection,
  PaymentTaxTotalSection,
} from './PaymentTaxDetailSections';
import PaymentTaxExemptionForm from './PaymentTaxExemptionForm';

const rdStyleBackgroundBorderRadiusWidth = {
          background: '#fff', borderRadius: 16, width: 620, maxWidth: '92vw',
          maxHeight: '90vh', overflow: 'auto', padding: 24,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        };

const PaymentTaxDetailModal = ({
  selectedDetail,
  showExemptionForm,
  exemptionReason,
  exemptionDiscountRate,
  exemptionEvidenceName,
  submittingExemption,
  dispatch,
  onClose,
  canRequestExemptionOnDetail,
  onSubmitExemption,
  onPayment,
  onDownloadReceipt,
  showAlert,
}) => {
  if (!selectedDetail) return null;

  return (
    <div
      {...backdropA11yProps(onClose)}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        style={rdStyleBackgroundBorderRadiusWidth}
      >
        <h5 className="fw-bold text-center mb-4">Chi tiết thông báo thuế</h5>

        {selectedDetail?.loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-danger" />
          </div>
        ) : (
          <>
            <PaymentTaxDetailHeader selectedDetail={selectedDetail} />
            <PaymentTaxLandInfoSection selectedDetail={selectedDetail} />
            <PaymentTaxTierSection selectedDetail={selectedDetail} />
            <PaymentTaxExemptionSection selectedDetail={selectedDetail} />
            <PaymentTaxPenaltySection selectedDetail={selectedDetail} />
            <PaymentTaxTotalSection selectedDetail={selectedDetail} />

            {canRequestExemptionOnDetail(selectedDetail) && !showExemptionForm && (
              <div className="mb-3">
                <button
                  type="button"
                  className="btn btn-outline-warning fw-semibold"
                  onClick={() => dispatch({ type: 'PATCH', payload: { showExemptionForm: true } })}
                >
                  <i className="bi bi-percent me-1" />
                  Xin miễn giảm thuế
                </button>
              </div>
            )}

            {showExemptionForm && (
              <PaymentTaxExemptionForm
                exemptionReason={exemptionReason}
                exemptionDiscountRate={exemptionDiscountRate}
                exemptionEvidenceName={exemptionEvidenceName}
                submittingExemption={submittingExemption}
                dispatch={dispatch}
                onSubmitExemption={onSubmitExemption}
              />
            )}

            <div className="d-flex gap-2 justify-content-end">
              <button type="button" className="btn btn-outline-secondary"
                onClick={() => {
                  dispatch({ type: 'PATCH', payload: { showExemptionForm: false, selectedDetail: null } });
                }}
              >
                Đóng
              </button>
              {!isFullTaxExempt(selectedDetail) && selectedDetail.status !== 'PAID' ? (
                <button type="button" className="btn btn-danger"
                  disabled={!selectedDetail.canPay}
                  onClick={async () => {
                    if (!selectedDetail.canPay) {
                      await showAlert({
                        title: 'Chưa thể thanh toán',
                        message: 'Hóa đơn chưa sẵn sàng. Vui lòng chờ cán bộ thuế duyệt (AWAITING_PAYMENT).',
                        variant: 'warning',
                      });
                      return;
                    }
                    onPayment(selectedDetail);
                  }}
                >
                  Thanh toán ngay
                </button>
              ) : selectedDetail.status === 'PAID' ? (
                <button type="button" className="btn btn-outline-secondary"
                  onClick={() => onDownloadReceipt(selectedDetail.paymentId)}
                >
                  <i className="bi bi-download me-1"></i> Tải biên lai
                </button>
              ) : (
                <span className="badge bg-success bg-opacity-10 text-success border border-success px-3 py-2">
                  <i className="bi bi-shield-check me-1"></i> Được miễn thuế
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentTaxDetailModal;
