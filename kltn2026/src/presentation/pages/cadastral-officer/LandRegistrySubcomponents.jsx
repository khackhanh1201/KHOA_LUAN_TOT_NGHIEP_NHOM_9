import React from 'react';
import {
  fieldLabelStyle,
  grayBoxStyle,
  editInputStyle,
} from './landRegistryStyles';

export const DetailField = ({ label, value, color, strong }) => (
  <div>
    <div style={fieldLabelStyle}>{label}</div>
    <div style={{ fontSize: strong ? 15 : 14, fontWeight: strong ? 700 : 600, color: color || '#1e293b', lineHeight: 1.5 }}>
      {value ?? '—'}
    </div>
  </div>
);

export const EditableField = ({ editing, label, name, value, onChange, type = 'text', displayValue }) => {
  if (editing) {
    return (
      <div style={grayBoxStyle}>
        <label style={fieldLabelStyle} htmlFor={name}>{label}</label>
        <input
          id={name}
          name={name}
          type={type}
          value={value ?? ''}
          onChange={onChange}
          style={editInputStyle}
        />
      </div>
    );
  }
  return (
    <div style={grayBoxStyle}>
      <DetailField label={label} value={displayValue ?? value ?? '—'} strong />
    </div>
  );
};

const rdStyleMaxWidthMarginBackground = {
      maxWidth: 780,
      margin: '0 auto',
      background: '#fff',
      padding: '48px 56px',
      fontFamily: '"Times New Roman", Georgia, serif',
      boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
      borderRadius: 4,
    };

const GcnSection = ({ title, children }) => (
  <div style={{ marginBottom: 24 }}>
    <h4 style={{ color: '#1e293b', borderBottom: '2px solid #b91c1c', paddingBottom: 8, fontSize: 15, fontWeight: 800, margin: '0 0 14px' }}>
      {title}
    </h4>
    {children}
  </div>
);

const GcnRow = ({ label, value }) => (
  <div style={{ display: 'flex', marginBottom: 10, fontSize: 14, lineHeight: 1.6 }}>
    <div style={{ width: 220, fontWeight: 600, color: '#334155', flexShrink: 0 }}>{label}:</div>
    <div style={{ flex: 1, color: '#1e293b' }}>{value}</div>
  </div>
);

export function GcnCertificateDocument({ record, getLandTypeName, getAreaLabel, display, ref }) {
  return (
  <div
    ref={ref}
    style={rdStyleMaxWidthMarginBackground}
  >
    <div style={{ textAlign: 'center', marginBottom: 28, borderBottom: '2px solid #b91c1c', paddingBottom: 20 }}>
      <h2 style={{ color: '#b91c1c', fontWeight: 800, fontSize: 22, margin: '0 0 8px', letterSpacing: 0.5 }}>
        GIẤY CHỨNG NHẬN
      </h2>
      <p style={{ color: '#b91c1c', fontSize: 13, margin: 0, fontWeight: 600, lineHeight: 1.5 }}>
        QUYỀN SỬ DỤNG ĐẤT, QUYỀN SỞ HỮU NHÀ Ở VÀ TÀI SẢN KHÁC GẮN LIỀN VỚI ĐẤT
      </p>
    </div>

    <GcnSection title="THÔNG TIN CHỦ SỞ HỮU">
      <GcnRow label="Chủ đất" value={display(record.ownerName || record.fullName)} />
      <GcnRow label="CCCD / CMND" value={display(record.ownerCccd)} />
    </GcnSection>

    <GcnSection title="THÔNG TIN THỬA ĐẤT">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
        <div>
          <GcnRow label="Mã thửa đất" value={display(record.landParcelId)} />
          <GcnRow label="Thửa đất số" value={display(record.parcelNumber)} />
          <GcnRow label="Tờ bản đồ số" value={display(record.mapSheetNumber)} />
          <GcnRow label="Diện tích" value={record.areaSize ? `${record.areaSize} m²` : '—'} />
          <GcnRow label="Loại đất" value={getLandTypeName(record.landTypeId)} />
          <GcnRow label="Khu vực" value={getAreaLabel(record.areaId)} />
        </div>
        <div>
          <GcnRow label="Địa chỉ" value={display(record.address)} />
          <GcnRow label="Thời hạn sử dụng" value={display(record.usageDuration)} />
          <GcnRow label="Hình thức sử dụng" value={display(record.usageType)} />
          <GcnRow label="Nguồn gốc sử dụng" value={display(record.usageOrigin)} />
        </div>
      </div>
    </GcnSection>

    <GcnSection title="GIẤY CHỨNG NHẬN">
      <GcnRow label="Số hiệu Sổ đỏ / Seri" value={display(record.certificateNumber)} />
      <GcnRow label="Số vào sổ GCN" value={display(record.gcnBookNumber)} />
    </GcnSection>

    <GcnSection title="TÀI SẢN GẮN LIỀN VỚI ĐẤT">
      <GcnRow label="Nhà ở" value={display(record.attachedHouse)} />
      <GcnRow label="Công trình khác" value={display(record.attachedOther)} />
    </GcnSection>

    <GcnSection title="GHI CHÚ">
      <p style={{ fontStyle: 'italic', color: '#475569', margin: 0, fontSize: 14 }}>{display(record.notes)}</p>
    </GcnSection>
  </div>
  );
}
