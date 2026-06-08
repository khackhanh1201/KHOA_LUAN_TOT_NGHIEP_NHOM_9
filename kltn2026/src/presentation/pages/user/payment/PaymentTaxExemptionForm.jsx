import React from 'react';

const PaymentTaxExemptionForm = ({
  exemptionReason,
  exemptionDiscountRate,
  exemptionEvidenceName,
  submittingExemption,
  dispatch,
  onSubmitExemption,
}) => (
  <div className="border border-warning-subtle rounded-3 p-3 mb-3 bg-warning-subtle">
    <h6 className="fw-bold mb-3">Đơn xin miễn giảm thuế</h6>
    <div className="mb-3">
      <label htmlFor="exemptionReason" className="form-label small fw-semibold">Lý do miễn giảm</label>
      <textarea
        id="exemptionReason"
        className="form-control"
        rows={3}
        placeholder="Lý do miễn giảm (VD: Hộ nghèo, thương binh...)"
        value={exemptionReason}
        onChange={(e) => dispatch({ type: 'PATCH', payload: { exemptionReason: e.target.value } })}
      />
    </div>
    <div className="mb-3">
      <label htmlFor="exemptionDiscountRate" className="form-label small fw-semibold">Tỷ lệ miễn giảm (%)</label>
      <select
        id="exemptionDiscountRate"
        name="exemptionDiscountRate"
        className="form-select"
        value={exemptionDiscountRate}
        onChange={(e) => dispatch({ type: 'PATCH', payload: { exemptionDiscountRate: e.target.value } })}
      >
        <option value="50">50%</option>
        <option value="100">100%</option>
      </select>
    </div>
    <div className="mb-3">
      <label htmlFor="exemptionEvidenceInput" className="form-label small fw-semibold">Bằng chứng (tùy chọn)</label>
      <input
        id="exemptionEvidenceInput"
        type="file"
        className="form-control"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => {
          const file = e.target.files?.[0];
          dispatch({ type: 'PATCH', payload: { exemptionEvidenceName: file ? file.name : '' } });
        }}
      />
      {exemptionEvidenceName && (
        <small className="text-muted d-block mt-1">Đã chọn: {exemptionEvidenceName}</small>
      )}
    </div>
    <div className="d-flex gap-2 justify-content-end">
      <button
        type="button"
        className="btn btn-outline-secondary"
        onClick={() => dispatch({ type: 'RESET_EXEMPTION_FORM' })}
      >
        Hủy
      </button>
      <button
        type="button"
        className="btn btn-warning fw-semibold"
        disabled={submittingExemption}
        onClick={onSubmitExemption}
      >
        {submittingExemption ? 'Đang gửi...' : 'Gửi yêu cầu'}
      </button>
    </div>
  </div>
);

export default PaymentTaxExemptionForm;
