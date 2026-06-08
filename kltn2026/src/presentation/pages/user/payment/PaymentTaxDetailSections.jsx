import React from 'react';
import {
  normalizeExemptStatus,
  EXEMPT_STATUS_APPROVED,
} from '../../../../utils/taxExempt';
import {
  formatCurrency,
  formatPayableAmount,
  getAmountDisplayClass,
  isFullTaxExempt,
} from './paymentPageUtils';

export const PaymentTaxDetailHeader = ({ selectedDetail }) => (
  <div className="row g-3 mb-3">
    <div className="col-6">
      <small className="text-muted fw-semibold">THỬA ĐẤT SỐ</small>
      <div className="fw-bold">{selectedDetail.taxCode}</div>
    </div>
    <div className="col-6 text-end">
      <small className="text-muted fw-semibold">HẠN NỘP</small>
      <div className="fw-bold">{selectedDetail.dueDate}</div>
    </div>
  </div>
);

export const PaymentTaxLandInfoSection = ({ selectedDetail }) => (
  <div className="bg-light rounded-3 p-3 mb-3">
    <div className="fw-bold mb-2">THÔNG TIN ĐẤT ĐAI</div>
    <div>Thửa đất số: <strong>{selectedDetail.parcelLabel}</strong></div>
    <div>Địa chỉ: <strong>{selectedDetail.address}</strong></div>
    <div>Diện tích:
      <strong>
        {selectedDetail.area != null && selectedDetail.area !== '—'
          ? `${Number(selectedDetail.area).toLocaleString('vi-VN')} m²`
          : '—'}
      </strong>
    </div>
  </div>
);

export const PaymentTaxTierSection = ({ selectedDetail }) => (
  <>
    <div className="bg-light rounded-3 p-3 mb-3">
      <div className="fw-bold mb-2">BƯỚC 1 — GIÁ TRỊ ĐẤT</div>
      <div className="d-flex justify-content-between">
        <span>Đơn giá đất</span>
        <strong>
          {selectedDetail.unitPrice != null
            ? `${Number(selectedDetail.unitPrice).toLocaleString('vi-VN')} đ/m²`
            : '—'}
        </strong>
      </div>
      <div className="d-flex justify-content-between mt-2">
        <span>Giá trị đất (đơn giá × diện tích)</span>
        <strong>
          {selectedDetail.landValue != null
            ? formatCurrency(selectedDetail.landValue)
            : '—'}
        </strong>
      </div>
    </div>

    <div className="bg-light rounded-3 p-3 mb-3">
      <div className="fw-bold mb-2">BƯỚC 2 — THUẾ LŨY TIẾN</div>
      <div className="small text-muted mb-2">
        Biểu thuế: Bậc 1 ≤ 180 m²: 0,03%; Bậc 2: 0,07%; Bậc 3: 0,15%
      </div>
      {selectedDetail.tierBreakdown?.length > 0 ? (
        <>
          {selectedDetail.tierBreakdown.map((tier) => (
            <div key={tier.tier} className="mb-2 pb-2 border-bottom border-light">
              <div className="small fw-semibold">{tier.label}</div>
              <div className="font-monospace small text-secondary">{tier.formula}</div>
              <div className="d-flex justify-content-between small mt-1">
                <span>Tiền bậc {tier.tier}</span>
                <strong>{formatCurrency(Math.round(tier.lineAmount))}</strong>
              </div>
            </div>
          ))}
          <div className="d-flex justify-content-between mt-2 pt-1">
            <span className="fw-semibold">Tổng thuế trước miễn giảm</span>
            <strong className="text-danger">
              {selectedDetail.taxBeforeExempt != null
                ? formatCurrency(Math.round(selectedDetail.taxBeforeExempt))
                : '—'}
            </strong>
          </div>
        </>
      ) : (
        <div className="small text-muted">Chưa đủ dữ liệu đơn giá / diện tích để tính chi tiết.</div>
      )}
    </div>
  </>
);

export const PaymentTaxExemptionSection = ({ selectedDetail }) => (
  <div className="bg-light rounded-3 p-3 mb-3">
    <div className="fw-bold mb-2">BƯỚC 3 — MIỄN GIẢM</div>
    {selectedDetail.discountRate > 0 &&
    normalizeExemptStatus(selectedDetail.exemptionStatus) === EXEMPT_STATUS_APPROVED ? (
      <>
        <div className="d-flex justify-content-between">
          <span>Đối tượng</span>
          <strong className="text-end" style={{ maxWidth: '60%' }}>
            {selectedDetail.exemptionReason || '—'}
          </strong>
        </div>
        <div className="d-flex justify-content-between mt-2">
          <span>Tỷ lệ miễn giảm</span>
          <strong className="text-success">{selectedDetail.discountRate}%</strong>
        </div>
        <div className="d-flex justify-content-between mt-2">
          <span>Số tiền được giảm</span>
          <strong className="text-success">
            {formatCurrency(selectedDetail.exemptionAmount ?? 0)}
          </strong>
        </div>
        {selectedDetail.amountAfterExempt != null && (
          <div className="d-flex justify-content-between mt-2">
            <span>Thuế sau miễn giảm (tính toán)</span>
            <strong>{formatCurrency(Math.round(selectedDetail.amountAfterExempt))}</strong>
          </div>
        )}
      </>
    ) : selectedDetail.exemptionStatus &&
      normalizeExemptStatus(selectedDetail.exemptionStatus) !== EXEMPT_STATUS_APPROVED ? (
      <div className="small text-warning">
        Đơn miễn giảm: {selectedDetail.exemptionStatusLabel || selectedDetail.exemptionStatus}
        {selectedDetail.exemptionReason ? ` — ${selectedDetail.exemptionReason}` : ''}
        . Chưa áp dụng % giảm trên hóa đơn.
      </div>
    ) : (
      <div className="small text-muted">Không áp dụng miễn giảm (0%)</div>
    )}
  </div>
);

export const PaymentTaxPenaltySection = ({ selectedDetail }) => {
  if (isFullTaxExempt(selectedDetail) || !(Number(selectedDetail.penaltyAmount) > 0)) {
    return null;
  }
  return (
    <div className="bg-light rounded-3 p-3 mb-3 border border-danger-subtle">
      <div className="fw-bold mb-2 text-danger">PHẠT CHẬM NỘP</div>
      <div className="d-flex justify-content-between small">
        <span>Tiền thuế gốc trên hóa đơn</span>
        <strong>{formatCurrency(selectedDetail.baseAmount ?? selectedDetail.amount)}</strong>
      </div>
      <div className="d-flex justify-content-between small mt-2">
        <span>
          Phạt ({selectedDetail.overdueDays} ngày quá hạn × 0,03%/ngày)
        </span>
        <strong className="text-danger">
          +{formatCurrency(selectedDetail.penaltyAmount)}
        </strong>
      </div>
      <div className="small text-muted mt-2 mb-0">
        Công thức: Tiền gốc × 0,03%/ngày × Số ngày quá hạn (tính từ ngày sau hạn nộp).
      </div>
    </div>
  );
};

export const PaymentTaxTotalSection = ({ selectedDetail }) => (
  <div className="mb-3">
    <small className="text-muted">BƯỚC 4 — TỔNG SỐ TIỀN PHẢI NỘP</small>
    <h4 className={`fw-bold mb-0 ${getAmountDisplayClass(selectedDetail)}`}>
      {formatPayableAmount(selectedDetail)}
    </h4>
    {isFullTaxExempt(selectedDetail) && (
      <p className="small text-success mb-0 mt-1">
        {selectedDetail.exemptionReason || 'Đối tượng được miễn giảm thuế 100%'}
      </p>
    )}
    {!isFullTaxExempt(selectedDetail) &&
      selectedDetail.discountRate > 0 &&
      normalizeExemptStatus(selectedDetail.exemptionStatus) === EXEMPT_STATUS_APPROVED && (
        <p className="small text-muted mb-0 mt-1">
          Đã trừ miễn giảm {selectedDetail.discountRate}% so với tổng thuế trước miễn giảm.
        </p>
      )}
    {!isFullTaxExempt(selectedDetail) &&
      !(selectedDetail.discountRate > 0 &&
        normalizeExemptStatus(selectedDetail.exemptionStatus) === EXEMPT_STATUS_APPROVED) &&
      selectedDetail.taxBeforeExempt != null && (
        <p className="small text-muted mb-0 mt-1">
          Bằng tổng thuế lũy tiến (chưa áp dụng miễn giảm).
        </p>
      )}
  </div>
);
