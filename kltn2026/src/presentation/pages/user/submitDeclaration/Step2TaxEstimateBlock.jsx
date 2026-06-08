import React from 'react';
import { LAND_PRICE_MISSING_MESSAGE } from './submitDeclarationUtils';

const Step2TaxEstimateBlock = ({ taxEstimate }) => (
  <div
    style={{
      marginTop: 16,
      padding: 16,
      borderRadius: 12,
      border: taxEstimate.landPriceMissing ? '1px solid #fcd34d' : '1px solid #e2e8f0',
      background: taxEstimate.landPriceMissing ? '#fffbeb' : '#f8fafc',
    }}
  >
    <span style={{ fontWeight: 700, marginBottom: 12, display: 'block' }}>
      Ước tính thuế phải nộp
    </span>
    {taxEstimate.loading ? (
      <div className="text-muted small">
        <output className="spinner-border spinner-border-sm me-2" aria-live="polite" />
        Đang tính thuế lũy tiến...
      </div>
    ) : taxEstimate.landPriceMissing ? (
      <div
        role="alert"
        style={{
          fontSize: 14,
          color: '#92400e',
          lineHeight: 1.5,
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
        }}
      >
        <i className="bi bi-exclamation-triangle-fill" style={{ marginTop: 2, flexShrink: 0 }} />
        <span>{taxEstimate.error || LAND_PRICE_MISSING_MESSAGE}</span>
      </div>
    ) : taxEstimate.calculatedAmount != null ? (
      <div style={{ display: 'grid', gap: 8, fontSize: 14 }}>
        {taxEstimate.unitPrice != null && (
          <div style={{ color: '#64748b' }}>
            Đơn giá đất:{' '}
            <strong style={{ color: '#334155' }}>
              {Number(taxEstimate.unitPrice).toLocaleString('vi-VN')} VNĐ/m²
            </strong>
          </div>
        )}
        <div>
          Tổng thuế trước miễn giảm:{' '}
          <strong>
            {Number(taxEstimate.grossTaxAmount ?? 0).toLocaleString('vi-VN')} VNĐ
          </strong>
        </div>
        {taxEstimate.exemptionApplied && Number(taxEstimate.reductionAmount) > 0 ? (
          <div style={{ color: '#15803d' }}>
            Giảm {taxEstimate.discountRate ?? 0}% (−
            {Number(taxEstimate.reductionAmount).toLocaleString('vi-VN')} VNĐ)
          </div>
        ) : (
          <div style={{ color: '#64748b', fontSize: 13 }}>
            Không áp dụng miễn giảm đã duyệt
          </div>
        )}
        <div
          style={{
            marginTop: 4,
            paddingTop: 8,
            borderTop: '1px dashed #cbd5e1',
            fontWeight: 800,
            fontSize: 16,
            color: Number(taxEstimate.calculatedAmount) <= 0 ? '#15803d' : '#a30d11',
          }}
        >
          Phải nộp:{' '}
          {Number(taxEstimate.calculatedAmount) <= 0
            ? 'Được miễn thuế'
            : `${Number(taxEstimate.calculatedAmount).toLocaleString('vi-VN')} VNĐ`}
        </div>
      </div>
    ) : (
      <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
        Nhập đủ diện tích và loại đất để xem ước tính thuế.
      </p>
    )}
  </div>
);

export default Step2TaxEstimateBlock;
