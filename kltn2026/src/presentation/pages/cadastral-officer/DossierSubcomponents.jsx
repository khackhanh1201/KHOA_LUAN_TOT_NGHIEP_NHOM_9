const rdStyleWidthMaxWidthMinHeight = {
        width: '100%',
        maxWidth: 680,
        minHeight: 820,
        backgroundColor: '#fff',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        padding: '48px 56px',
        fontFamily: '"Times New Roman", Times, serif',
        color: '#1e293b',
      };
const roleBadgeStyle = (color) => ({
  fontSize: 12,
  fontWeight: 800,
  color: '#fff',
  backgroundColor: color,
  padding: '2px 6px',
  borderRadius: 4,
  display: 'inline-block',
  marginBottom: 4,
});
const tagPillStyle = {
  backgroundColor: '#f1f5f9',
  padding: '2px 8px',
  borderRadius: 50,
  fontSize: 12,
  fontWeight: 800,
  display: 'inline-block',
  marginTop: 8,
  color: '#64748b',
};

import React from 'react';
import { downloadFileFromUrl } from '../../../utils/downloadFile';
import { display } from './dossierUtils';
import { labelStyle, inputBaseStyle } from './dossierStyles';

export function ReceiptPreviewPaper({ d, user, formatDate, formatLongDate, mapStatusLabel, ref }) {
  return (
    <div
      ref={ref}
      style={rdStyleWidthMaxWidthMinHeight}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', marginBottom: 36 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700 }}>SỞ TÀI NGUYÊN VÀ MÔI TRƯỜNG</div>
          <div style={{ fontSize: 13, fontWeight: 800 }}>VĂN PHÒNG ĐĂNG KÝ ĐẤT ĐAI</div>
          <div style={{ width: 80, height: 1, backgroundColor: '#000', margin: '4px auto 0' }} />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800 }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div style={{ fontSize: 12, fontWeight: 700 }}>Độc lập - Tự do - Hạnh phúc</div>
          <div style={{ width: 120, height: 1, backgroundColor: '#000', margin: '4px auto 0' }} />
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800 }}>PHIẾU TIẾP NHẬN HỒ SƠ</h2>
        <div style={{ fontSize: 13, fontStyle: 'italic' }}>
          Số: HS-{String(d?.recordId ?? 0).padStart(6, '0')}/PTN-VPĐKĐĐ
        </div>
      </div>

      <div style={{ fontSize: 14, lineHeight: 1.85, textAlign: 'left' }}>
        <div><b>1. Thông tin người nộp:</b> {display(d?.citizenInfo?.fullName)}</div>
        <div>
          <b>2. Số CCCD/Số tờ/Số thửa:</b>{' '}
          {display(d?.citizenInfo?.cccd)} / {display(d?.landParcelInfo?.mapSheetNumber)} / {display(d?.landParcelInfo?.parcelNumber)}
        </div>
        <div><b>3. Đối tượng miễn thuế:</b> {d?.recordInfo?.taxExemption || 'Không có'}</div>
        <div><b>4. Loại hồ sơ:</b> {display(d?.recordInfo?.recordCategory)}</div>
        <div style={{ marginTop: 6 }}><b>5. Thông tin thửa đất:</b></div>
        <div style={{ paddingLeft: 20 }}>
          - Thửa đất số: {display(d?.landParcelInfo?.parcelNumber)}; Tờ bản đồ số: {display(d?.landParcelInfo?.mapSheetNumber)}<br />
          - Diện tích: {d?.landParcelInfo?.area ? `${d.landParcelInfo.area}m²` : '—'}<br />
          - Loại đất: {display(d?.landParcelInfo?.landType)}<br />
          - Hình thức sử dụng: {display(d?.landParcelInfo?.usageType)}<br />
          - Địa chỉ: {display(d?.landParcelInfo?.address)}
        </div>
        <div style={{ marginTop: 8 }}><b>6. Danh mục tài liệu đính kèm:</b></div>
        <div style={{ paddingLeft: 20 }}>
          {d?.attachments?.length > 0 ? (
            d.attachments.map((file) => (
              <div key={file.id || file.url || file.name}>- {file.name} ({file.status || 'Đã nộp'})</div>
            ))
          ) : (
            <div style={{ color: '#64748b' }}>Không có tài liệu đính kèm</div>
          )}
        </div>
        <div style={{ marginTop: 8 }}><b>7. Ngày tiếp nhận:</b> {formatDate(d?.recordInfo?.submittedAt)}</div>
        <div style={{ marginTop: 4 }}>
          <b>8. Trạng thái:</b>{' '}
          <span style={{ color: '#2563eb', fontWeight: 700 }}>{mapStatusLabel(d?.recordInfo?.currentStatus)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 56, textAlign: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 13 }}>NGƯỜI NỘP HỒ SƠ</div>
          <div style={{ marginTop: 72, fontWeight: 700 }}>{display(d?.citizenInfo?.fullName)}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontStyle: 'italic', fontSize: 13, marginBottom: 8 }}>
            Hà Nội, {formatLongDate(d?.recordInfo?.submittedAt)}
          </div>
          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 72 }}>CÁN BỘ TIẾP NHẬN</div>
          <div style={{ fontWeight: 700 }}>{display(user?.fullName || user?.name)}</div>
        </div>
      </div>
    </div>
  );
}

export const FormInput = ({ label, placeholder }) => {
  const inputId = `dossier-filter-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={inputId} style={labelStyle}>{label}</label>
      <input id={inputId} type="text" placeholder={placeholder} style={inputBaseStyle} />
    </div>
  );
};

export const SectionHeader = ({ icon, title, badge, badgeColor, badgeTextColor }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #f1f5f9', paddingBottom: 16 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, color: '#b91c1c' }}>
      <i className={`bi bi-${icon}`}></i> {title}
    </div>
    {badge && <span style={{ backgroundColor: badgeColor, color: badgeTextColor, padding: '4px 10px', borderRadius: 50, fontSize: 12, fontWeight: 800 }}>{badge}</span>}
  </div>
);

export const InfoItem = ({ label, value, bold, color }) => (
  <div>
    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 800, marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 14, fontWeight: bold ? 800 : 600, color: color || '#1e293b' }}>{value}</div>
  </div>
);

export const InfoItemBox = ({ label, value, color, mismatch, masterValue }) => (
  <div
    style={{
      backgroundColor: mismatch ? '#fef2f2' : '#f8fafc',
      padding: '12px 16px',
      borderRadius: 8,
      border: mismatch ? '1px solid #fecaca' : '1px solid transparent',
    }}
  >
    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 800, marginBottom: 4 }}>
      {label}
      {mismatch && (
        <span style={{ marginLeft: 6, color: '#dc2626', fontSize: 12 }}>⚠ SAI LỆCH</span>
      )}
    </div>
    <div
      style={{
        fontSize: 14,
        fontWeight: 700,
        color: mismatch ? '#dc2626' : (color || '#1e293b'),
        textDecoration: mismatch ? 'underline' : 'none',
        textDecorationColor: mismatch ? '#dc2626' : undefined,
        textUnderlineOffset: mismatch ? '3px' : undefined,
      }}
    >
      {display(value)}
    </div>
    {mismatch && masterValue != null && masterValue !== '' && (
      <div style={{ fontSize: 12, color: '#991b1b', marginTop: 6 }}>
        Sổ địa chính: <b>{display(masterValue)}</b>
      </div>
    )}
  </div>
);

export const FileItem = ({ name, status, warning, url, fileType, onView }) => {
  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!url) return;
    await downloadFileFromUrl(url, name || 'tai-lieu');
  };

  const handleView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!url || !onView) return;
    onView({ name, url, fileType });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <i className="bi bi-check-circle-fill" style={{ color: warning ? '#f59e0b' : '#10b981' }}></i>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{name}</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: warning ? '#f59e0b' : '#10b981', marginTop: 2 }}>{status}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, color: '#64748b', fontSize: 16 }}>
        {url ? (
          <>
            <button type="button" onClick={handleView} title="Xem trước trên web" aria-label="Xem trước trên web" style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>
              <i className="bi bi-eye" />
            </button>
            <button type="button" onClick={handleDownload} title="Tải xuống" aria-label="Tải xuống" style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>
              <i className="bi bi-download" />
            </button>
          </>
        ) : (
          <>
            <i className="bi bi-eye" style={{ opacity: 0.35 }} title="Không có URL file" />
            <i className="bi bi-download" style={{ opacity: 0.35 }} title="Không có URL file" />
          </>
        )}
      </div>
    </div>
  );
};

const TIMELINE_ROLE_MAP = {
  CITIZEN: { name: 'NGƯỜI DÂN', color: '#a855f7' },
  LAND_OFFICER: { name: 'CÁN BỘ ĐỊA CHÍNH', color: '#f59e0b' },
  SYSTEM: { name: 'HỆ THỐNG', color: '#64748b' },
};

export const TimelineItem = ({ item, active }) => {
  const roleInfo = TIMELINE_ROLE_MAP[item.role] || { name: item.role, color: '#64748b' };
  const time = item.timestamp ? new Date(item.timestamp).toLocaleString('vi-VN') : '—';

  return (
    <div style={{ display: 'flex', gap: 16, position: 'relative', paddingBottom: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: active ? '#2563eb' : '#e2e8f0', zIndex: 2 }}></div>
        <div style={{ width: 2, flex: 1, backgroundColor: '#f1f5f9' }}></div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={roleBadgeStyle(roleInfo.color)}>{roleInfo.name}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: active ? '#1e293b' : '#475569' }}>{item.action}</div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{time}</div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Thực hiện bởi: {item.user}</div>
        {item.tag && <div style={tagPillStyle}>{item.tag}</div>}
      </div>
    </div>
  );
};
