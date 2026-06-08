import React from 'react';
import {
  NEW_LAND_TYPE_LABEL,
  formatExemptionStatusLabel,
  getDeclarationTaxYear,
  resolveLandTypeLabel,
} from './submitDeclarationUtils';

const rdStyleFlexPaddingBackground = {
          flex: 1, padding: '14px', background: '#a30d11', color: '#fff',
          border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 16
        };

const Step4Review = ({
  user,
  cccdNumber,
  form,
  landTypes,
  taxEstimate,
  files,
  agreed,
  error,
  submitting,
  dispatch,
  onBack,
  onSubmit,
}) => (
  <div>
    <h5 style={{ fontWeight: 700, marginBottom: 24 }}>Kiểm tra & Gửi hồ sơ</h5>

    <div style={{ background: '#f8fafc', borderRadius: 12, padding: 28, border: '1px solid #e2e8f0' }}>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>NGƯỜI NỘP HỒ SƠ</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
          <span>Họ và tên</span>
          <strong>{user?.fullName || 'Nguyễn Công Việt'}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
          <span>Số CCCD</span>
          <strong>{cccdNumber ? cccdNumber.slice(0, 8) + '****' : '03709500****'}</strong>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>LOẠI HỒ SƠ</div>
        <strong style={{ color: '#a30d11' }}>{NEW_LAND_TYPE_LABEL}</strong>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>THÔNG TIN THỬA ĐẤT</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', lineHeight: 1.8 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <strong>Số vào sổ cấp GCN:</strong> {form.gcnBookNumber || '—'}
          </div>
          <div><strong>Thửa đất số:</strong> {form.parcelNumber || '—'}</div>
          <div><strong>Tờ bản đồ số:</strong> {form.mapSheetNumber || '—'}</div>
          <div><strong>Diện tích:</strong> {form.areaSize || '—'} m²</div>
          <div><strong>Loại đất:</strong>{' '}
            {form.landTypeName ||
              resolveLandTypeLabel(form.landTypeId, '', landTypes) ||
              '—'}
          </div>

          <div><strong>Thời hạn sử dụng:</strong> {form.usageDuration || '—'}</div>
          <div><strong>Hình thức sử dụng:</strong> {form.usageType || '—'}</div>
          <div><strong>Địa chỉ:</strong> {form.address || '—'}</div>
          <div style={{ gridColumn: '1 / -1' }}>
            <strong>Nguồn gốc sử dụng:</strong> {form.usageOrigin || '—'}
          </div>
          <div><strong>Số hiệu GCN (Seri):</strong> {form.certificateNumber || '—'}</div>
          <div><strong>Mã liên kết HĐ (Land ID):</strong> {form.landParcelId || '—'}</div>
          <div><strong>Năm áp dụng MG:</strong> {form.appliedYear || getDeclarationTaxYear()}</div>
          <div><strong>Đối tượng miễn giảm:</strong> {form.exemptionReason || form.doiTuongMienThue || 'Không có'}</div>
          <div><strong>Tỷ lệ miễn giảm:</strong> {form.discountRate !== '' && form.discountRate != null ? `${form.discountRate}%` : '0%'}</div>
          <div><strong>Trạng thái hồ sơ MG:</strong> {form.exemptionStatus ? formatExemptionStatusLabel(form.exemptionStatus) : '—'}</div>
          {taxEstimate.calculatedAmount != null && (
            <>
              <div>
                <strong>Thuế trước MG:</strong>{' '}
                {Number(taxEstimate.grossTaxAmount ?? 0).toLocaleString('vi-VN')} VNĐ
              </div>
              <div>
                <strong>Thuế phải nộp (ước tính):</strong>{' '}
                {Number(taxEstimate.calculatedAmount) <= 0
                  ? 'Được miễn thuế'
                  : `${Number(taxEstimate.calculatedAmount).toLocaleString('vi-VN')} VNĐ`}
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>TÀI SẢN GẮN LIỀN VỚI ĐẤT</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div><strong>Nhà ở:</strong> {form.attachedHouse || '—'}</div>
          <div><strong>Công trình khác:</strong> {form.attachedOther || '—'}</div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>TÀI LIỆU ĐÍNH KÈM</div>
        {files.length > 0 ? (
          <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
            {files.map((file) => (
              <li key={file.id || file.name} style={{ padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                📄 {file.name}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Chưa có tài liệu đính kèm</p>
        )}
      </div>

    </div>

    <div style={{ margin: '28px 0', padding: '20px', background: '#fefce8', borderRadius: 12, border: '1px solid #fef08a' }}>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => dispatch({ type: 'PATCH', payload: { agreed: e.target.checked } })}
          style={{ marginTop: 4, width: 18, height: 18, accentColor: '#ca8a04' }}
        />
        <span style={{ color: '#854d0e', lineHeight: 1.6, fontSize: 14 }}>
          Tôi cam đoan các thông tin trên là đúng sự thật và hoàn toàn chịu trách nhiệm trước pháp luật về tính chính xác của hồ sơ này.
        </span>
      </label>
    </div>

    {error && <div style={{ color: '#dc2626', background: '#fee2e2', padding: 12, borderRadius: 8, marginBottom: 16 }}>{error}</div>}

    <div style={{ display: 'flex', gap: 12 }}>
      <button type="button" onClick={onBack}
        style={{ flex: 1, padding: '14px', border: '1px solid #e2e8f0', borderRadius: 12, background: '#fff' }}
      >
        Quay lại
      </button>
      <button type="button" onClick={onSubmit}
        disabled={submitting || !agreed}
        style={rdStyleFlexPaddingBackground}
      >
        {submitting ? 'Đang gửi hồ sơ...' : 'Gửi hồ sơ ngay'}
      </button>
    </div>
  </div>
);

export default Step4Review;
