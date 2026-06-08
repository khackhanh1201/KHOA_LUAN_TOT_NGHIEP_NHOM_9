import React from 'react';
import { backdropA11yProps } from '../../../../utils/a11y';
import InfoField from './InfoField';
import { getLandTypeLabel } from './landInfoUtils';

const rdStyleBorderBorderRadiusHeight = { border: '2px dashed #cbd5e1', borderRadius: 8, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: '#f8fafc' };

const LandCertificateModal = ({ selected, user, cccdNumber, onClose }) => {
  if (!selected) return null;

  return (
    <div
      {...backdropA11yProps(onClose)}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div
        style={{ background: '#fff', width: 1000, maxWidth: '96vw', borderRadius: 12, maxHeight: '92vh', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
      >
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', textAlign: 'center' }}>
          <h5 style={{ margin: 0, color: '#a30d11', fontWeight: 700 }}>GIẤY CHỨNG NHẬN</h5>
          <p style={{ margin: 4, color: '#a30d11', fontWeight: 600 }}>
            QUYỀN SỬ DỤNG ĐẤT, QUYỀN SỞ HỮU NHÀ Ở VÀ TÀI SẢN KHÁC GẮN LIỀN VỚI ĐẤT
          </p>
        </div>

        <div style={{ padding: '28px', overflowY: 'auto', maxHeight: 'calc(92vh - 180px)' }}>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 20, marginBottom: 24 }}>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>NGƯỜI SỬ DỤNG ĐẤT, CHỦ SỞ HỮU NHÀ Ở VÀ TÀI SẢN KHÁC GẮN LIỀN VỚI ĐẤT</div>
            <div style={{ display: 'flex', gap: 60 }}>
              <div><strong>Chủ đất:</strong> {user.fullName || '—'}</div>
              <div><strong>CCCD:</strong> {cccdNumber || '—'}</div>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h6 style={{ color: '#a30d11', fontWeight: 700, marginBottom: 16 }}>THÔNG TIN THỬA ĐẤT</h6>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 40px' }}>
              <InfoField label="Thửa đất số:" value={selected.parcelNumber} />
              <InfoField label="Tờ bản đồ số:" value={selected.mapSheetNumber} />
              <InfoField label="Diện tích:" value={selected.areaSize ? `${selected.areaSize} m²` : '—'} />
              <InfoField label="Loại đất:" value={selected.landTypeId || getLandTypeLabel(selected.landTypeId)} />
              <InfoField label="Thời hạn sử dụng:" value={selected.usageDuration} />
              <InfoField label="Hình thức sử dụng:" value={selected.usageType} />
              <InfoField label="Địa chỉ:" value={selected.address} span={2} />
              <InfoField label="Nguồn gốc sử dụng:" value={selected.usageOrigin} span={2} />
              <InfoField label="Số hiệu GCN (Seri):" value={selected.certificateNumber} />
              <InfoField label="Số vào sổ cấp GCN:" value={selected.gcnBookNumber} />
            </div>
            {selected.landInfoPdf && (
              <div style={{ marginTop: 16 }}>
                <strong>File PDF thông tin gốc:</strong>{' '}
                <a href={selected.landInfoPdf} target="_blank" rel="noopener noreferrer" style={{ color: '#a30d11', textDecoration: 'underline', fontWeight: 600 }}>
                  Xem bản scan
                </a>
              </div>
            )}
          </div>

          <div style={{ marginBottom: 24 }}>
            <h6 style={{ color: '#a30d11', fontWeight: 700, marginBottom: 12 }}>TÀI SẢN GẮN LIỀN VỚI ĐẤT</h6>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
              <InfoField label="Nhà ở:" value={selected.attachedHouse} />
              <InfoField label="Công trình khác:" value={selected.attachedOther} />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h6 style={{ color: '#a30d11', fontWeight: 700, marginBottom: 12 }}>GHI CHÚ</h6>
            <p style={{ color: '#64748b' }}>{selected.notes || '—'}</p>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h6 style={{ color: '#a30d11', fontWeight: 700, marginBottom: 12 }}>SƠ ĐỒ THỬA ĐẤT, NHÀ Ở VÀ TÀI SẢN KHÁC</h6>
            <div style={rdStyleBorderBorderRadiusHeight}>
              <i className="bi bi-map" style={{ fontSize: 50, color: '#94a3b8' }} />
              <p style={{ marginTop: 12, color: '#64748b' }}>Bản vẽ được đính kèm trong hồ sơ scan</p>
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 28px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 12, background: '#f8fafc' }}>
          <button type="button" style={{ padding: '10px 24px', border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff', fontWeight: 600 }}>Tải về PDF</button>
          <button type="button" style={{ padding: '10px 24px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}>Khiếu nại</button>
          <button type="button" onClick={onClose} style={{ padding: '10px 32px', background: '#a30d11', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandCertificateModal;
