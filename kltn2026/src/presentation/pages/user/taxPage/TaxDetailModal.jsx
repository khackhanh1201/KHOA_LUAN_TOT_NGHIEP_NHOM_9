import React from 'react';
import { backdropA11yProps } from '../../../../utils/a11y';
import StatusBadge from './StatusBadge';
import {
  getLandTypeLabel,
  formatParcelDisplay,
  formatPayableAmount,
  isFullTaxExempt,
  hasPartialExemption,
} from './taxPageUtils';

const rdStyleBackgroundBorderRadiusWidth = { background: '#fff', borderRadius: 16, width: 580, maxWidth: '92vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' };
const rdStyleBackgroundBorderCursor = { background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 16, padding: 0, display: 'flex', alignItems: 'center' };

const TaxDetailModal = ({ selectedDetail, onClose }) => {
  if (!selectedDetail) return null;

  return (
    <div {...backdropA11yProps(onClose)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={rdStyleBackgroundBorderRadiusWidth}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button type="button" onClick={onClose} aria-label="Quay lại" style={rdStyleBackgroundBorderCursor}>
              <i className="bi bi-arrow-left" />
            </button>
            <span style={{ fontWeight: 700, fontSize: 16 }}>Chi tiết khoản thuế</span>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 20 }}>×</button>
        </div>

        <div style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '24px', marginBottom: 20 }}>
            <h5 style={{ textAlign: 'center', fontWeight: 800, fontSize: 16 }}>BIÊN LAI / THÔNG BÁO THUẾ</h5>
            <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', margin: '0 0 20px' }}>
              Mã tham chiếu: TAX-{selectedDetail.taxYear}-{String(selectedDetail.taxId).padStart(5, '0')}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 12, color: '#94a3b8' }}>Loại đất</p>
                <p style={{ fontWeight: 600 }}>{getLandTypeLabel(selectedDetail)}</p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: '#94a3b8' }}>Năm tính thuế</p>
                <p style={{ fontWeight: 600 }}>Năm {selectedDetail.taxYear}</p>
              </div>
            </div>

            <p style={{ fontSize: 13, color: '#475569' }}>
              Mã thửa đất: <strong>{formatParcelDisplay(selectedDetail)}</strong>
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
              <div>
                <p style={{ fontSize: 12, color: '#94a3b8' }}>Số tiền phải nộp</p>
                <p style={{ fontWeight: 800, fontSize: 18, color: isFullTaxExempt(selectedDetail) ? '#16a34a' : '#a30d11' }}>
                  {formatPayableAmount(selectedDetail)}
                </p>
                {isFullTaxExempt(selectedDetail) && (
                  <p style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>
                    {selectedDetail.exemptionReason || 'Được miễn thuế 100%'}
                  </p>
                )}
                {hasPartialExemption(selectedDetail) && (
                  <p style={{ fontSize: 12, color: '#15803d', marginTop: 4 }}>
                    Đã giảm {selectedDetail.discountRate}% theo hồ sơ miễn giảm
                    {selectedDetail.exemptionReason ? `: ${selectedDetail.exemptionReason}` : ''}
                  </p>
                )}
              </div>
              <div>
                <p style={{ fontSize: 12, color: '#94a3b8' }}>Trạng thái</p>
                <StatusBadge status={selectedDetail.status} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button type="button" onClick={onClose} style={{ padding: '10px 18px', background: '#fff', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 8 }}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaxDetailModal;
