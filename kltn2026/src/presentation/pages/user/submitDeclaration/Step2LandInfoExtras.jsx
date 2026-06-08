import React from 'react';
import {
  EXEMPT_STATUS_APPROVED,
  EXEMPT_STATUS_PENDING,
  formatExemptionStatusLabel,
  getDeclarationTaxYear,
} from './submitDeclarationUtils';

const readOnlyInputStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  marginTop: 6,
  background: '#f1f5f9',
  color: '#334155',
  fontWeight: 600,
};

const readOnlyInputCenterStyle = {
  ...readOnlyInputStyle,
  textAlign: 'center',
};

const exemptionStatusInputStyle = (form) => ({
  ...readOnlyInputStyle,
  color:
    form.exemptionStatus === EXEMPT_STATUS_APPROVED
      ? '#15803d'
      : form.exemptionStatus === EXEMPT_STATUS_PENDING
        ? '#b45309'
        : '#334155',
});

export const Step2ExemptionBlock = ({ form, loadingExemption }) => (
  <div style={{ marginTop: 16 }}>
    <span style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>Đối tượng miễn giảm thuế</span>
    {loadingExemption ? (
      <div className="text-muted small py-2">
        <output className="spinner-border spinner-border-sm me-2" aria-live="polite" />
        Đang tải thông tin miễn giảm từ hệ thống...
      </div>
    ) : (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: '88px 1fr 120px 110px', gap: 16 }}>
          <div>
            <label htmlFor="s2-exemption-applied-year" style={{ fontSize: 12, color: '#64748b' }}>Năm áp dụng</label>
            <input
              id="s2-exemption-applied-year"
              type="text"
              readOnly
              value={form.appliedYear || getDeclarationTaxYear()}
              style={readOnlyInputCenterStyle}
            />
          </div>
          <div>
            <label htmlFor="s2-exemption-reason" style={{ fontSize: 12, color: '#64748b' }}>Lý do / đối tượng</label>
            <input
              id="s2-exemption-reason"
              type="text"
              readOnly
              value={form.exemptionReason || form.doiTuongMienThue || 'Không có'}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                marginTop: 6,
                background: '#f1f5f9',
                color: '#334155',
              }}
            />
          </div>
          <div>
            <label htmlFor="s2-exemption-discount-rate" style={{ fontSize: 12, color: '#64748b' }}>Tỷ lệ miễn giảm (%)</label>
            <input
              id="s2-exemption-discount-rate"
              type="text"
              readOnly
              value={
                form.discountRate !== '' && form.discountRate != null
                  ? `${form.discountRate}%`
                  : '0%'
              }
              style={readOnlyInputStyle}
            />
          </div>
          <div>
            <label htmlFor="s2-exemption-status" style={{ fontSize: 12, color: '#64748b' }}>Trạng thái</label>
            <input
              id="s2-exemption-status"
              type="text"
              readOnly
              value={
                form.exemptionStatus
                  ? formatExemptionStatusLabel(form.exemptionStatus)
                  : '—'
              }
              style={exemptionStatusInputStyle(form)}
            />
          </div>
        </div>
        <p style={{ fontSize: 12, color: '#64748b', marginTop: 8, marginBottom: 0 }}>
          Chỉ hiển thị miễn giảm của năm nộp tờ khai ({getDeclarationTaxYear()}). Hồ sơ các năm
          trước không áp dụng cho tờ khai này.
          {form.exemptionStatus === EXEMPT_STATUS_PENDING &&
            ' Hồ sơ đang chờ duyệt — số thuế ước tính bên dưới chưa trừ miễn giảm.'}
        </p>
      </>
    )}
  </div>
);

export { default as Step2TaxEstimateBlock } from './Step2TaxEstimateBlock';
export { default as Step2AttachedAssets } from './Step2AttachedAssets';
