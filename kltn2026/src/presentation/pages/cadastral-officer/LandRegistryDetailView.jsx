import React from 'react';
import CadastralLayout from '../../components/CadastralLayout';
import {
  DetailField,
  EditableField,
  GcnCertificateDocument,
} from './LandRegistrySubcomponents';
import {
  detailPageStyle,
  detailHeaderStyle,
  detailActionBarStyle,
  detailBodyStyle,
  sectionCardStyle,
  sectionTitleStyle,
  grid3Style,
  readOnlyBoxStyle,
  grayBoxStyle,
  fieldLabelStyle,
  editInputStyle,
  btnPrimaryRed,
  btnWhiteOutline,
  btnBackCircleStyle,
  modalOverlayStyle,
  modalContentStyle,
  modalHeaderStyle,
  modalFooterStyle,
  iconBtnNoBgStyle,
  btnGrayOutlineStyle,
  btnRedSubmitStyle,
} from './landRegistryStyles';

const LandRegistryDetailView = ({
  user,
  record: rec,
  form,
  isEditing,
  saving,
  isAdmin,
  showGcnPreview,
  downloadingGcnPdf,
  gcnPrintRef,
  getLandTypeName,
  getAreaLabel,
  display,
  landTypes,
  areas,
  onBack,
  onStartEdit,
  onCancelEdit,
  onUpdateSubmit,
  onDelete,
  onShowGcnPreview,
  onCloseGcnPreview,
  onDownloadGcnPdf,
  onEditFormChange,
}) => (
  <CadastralLayout user={user}>
    <div style={detailPageStyle}>
      <div style={detailHeaderStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" onClick={onBack} style={btnBackCircleStyle} aria-label="Quay lại">
            <i className="bi bi-arrow-left"></i>
          </button>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Chi tiết thửa đất</h3>
            <small style={{ color: '#64748b' }}>
              Mã thửa đất: <span style={{ color: '#a30d11', fontWeight: 700 }}>TD-{rec.landParcelId}</span>
              {' · '}
              Số vào sổ GCN: <span style={{ fontWeight: 700, color: '#1e293b' }}>{display(rec.gcnBookNumber)}</span>
            </small>
          </div>
        </div>

        <div style={detailActionBarStyle}>
          <button type="button" style={btnPrimaryRed} onClick={onShowGcnPreview}>
            <i className="bi bi-file-earmark-pdf"></i> Xuất PDF
          </button>
          {!isEditing ? (
            <button type="button" style={btnPrimaryRed} onClick={onStartEdit}>
              <i className="bi bi-pencil-square"></i> Cập nhật thông tin
            </button>
          ) : (
            <>
              <button type="button" style={btnWhiteOutline} onClick={onCancelEdit} disabled={saving}>
                Hủy
              </button>
              <button type="button" style={btnPrimaryRed} onClick={onUpdateSubmit} disabled={saving}>
                <i className="bi bi-check-circle"></i> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </>
          )}
          {isAdmin && !isEditing && (
            <button
              type="button"
              style={{ ...btnPrimaryRed, background: '#64748b' }}
              onClick={() => onDelete(rec.landParcelId)}
            >
              <i className="bi bi-trash"></i> Xóa
            </button>
          )}
        </div>
      </div>

      <div style={detailBodyStyle}>
        <div style={sectionCardStyle}>
          <div style={sectionTitleStyle}>
            <i className="bi bi-person" style={{ color: '#3b82f6' }}></i>
            <span>Thông tin chủ sở hữu</span>
          </div>
          <div style={grid3Style}>
            <div style={readOnlyBoxStyle}>
              <DetailField label="CHỦ ĐẤT" value={display(rec.ownerName || rec.fullName)} strong />
            </div>
            <div style={readOnlyBoxStyle}>
              <DetailField label="CCCD / CMND" value={display(rec.ownerCccd)} strong />
            </div>
            <div style={readOnlyBoxStyle}>
              <DetailField label="MÃ THỬA ĐẤT" value={`TD-${rec.landParcelId}`} strong />
            </div>
          </div>
        </div>

        <div style={sectionCardStyle}>
          <div style={sectionTitleStyle}>
            <i className="bi bi-geo-alt" style={{ color: '#ef4444' }}></i>
            <span>Thông tin thửa đất</span>
          </div>
          <div style={grid3Style}>
            <EditableField editing={isEditing} label="THỬA ĐẤT SỐ" name="parcelNumber" value={form.parcelNumber} onChange={onEditFormChange} />
            <EditableField editing={isEditing} label="TỜ BẢN ĐỒ SỐ" name="mapSheetNumber" value={form.mapSheetNumber} onChange={onEditFormChange} />
            <EditableField editing={isEditing} label="DIỆN TÍCH (M²)" name="areaSize" type="number" value={form.areaSize} onChange={onEditFormChange} displayValue={form.areaSize ? `${form.areaSize} m²` : '—'} />
            {isEditing ? (
              <div style={grayBoxStyle}>
                <label htmlFor="landTypeId" style={fieldLabelStyle}>LOẠI ĐẤT</label>
                <select id="landTypeId" name="landTypeId" value={form.landTypeId} onChange={onEditFormChange} style={editInputStyle}>
                  {landTypes.map((t) => (
                    <option key={t.landTypeId} value={t.landTypeId}>{t.typeName}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div style={grayBoxStyle}>
                <DetailField label="LOẠI ĐẤT" value={getLandTypeName(rec.landTypeId)} strong />
              </div>
            )}
            {isEditing ? (
              <div style={grayBoxStyle}>
                <label htmlFor="areaId" style={fieldLabelStyle}>KHU VỰC</label>
                <select id="areaId" name="areaId" value={form.areaId} onChange={onEditFormChange} style={editInputStyle}>
                  {areas.map((a) => (
                    <option key={a.areaId} value={a.areaId}>{getAreaLabel(a.areaId)}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div style={grayBoxStyle}>
                <DetailField label="KHU VỰC" value={getAreaLabel(rec.areaId)} strong />
              </div>
            )}
            <EditableField editing={isEditing} label="THỜI HẠN SỬ DỤNG" name="usageDuration" value={form.usageDuration} onChange={onEditFormChange} />
            <EditableField editing={isEditing} label="HÌNH THỨC SỬ DỤNG" name="usageType" value={form.usageType} onChange={onEditFormChange} />
            <EditableField editing={isEditing} label="NGUỒN GỐC SỬ DỤNG" name="usageOrigin" value={form.usageOrigin} onChange={onEditFormChange} />
            <div style={{ gridColumn: '1 / -1' }}>
              <EditableField editing={isEditing} label="ĐỊA CHỈ THỬA ĐẤT" name="address" value={form.address} onChange={onEditFormChange} />
            </div>
          </div>
        </div>

        <div style={sectionCardStyle}>
          <div style={sectionTitleStyle}>
            <i className="bi bi-file-earmark-text" style={{ color: '#10b981' }}></i>
            <span>Giấy chứng nhận</span>
          </div>
          <div style={grid3Style}>
            <div style={readOnlyBoxStyle}>
              <DetailField label="SỐ HIỆU SỔ ĐỎ / SERI" value={display(rec.certificateNumber)} strong />
            </div>
            <div style={readOnlyBoxStyle}>
              <DetailField label="SỐ VÀO SỔ GCN" value={display(rec.gcnBookNumber)} strong />
            </div>
          </div>
        </div>

        <div style={sectionCardStyle}>
          <div style={sectionTitleStyle}>
            <i className="bi bi-house" style={{ color: '#f59e0b' }}></i>
            <span>Tài sản gắn liền với đất</span>
          </div>
          <div style={grid3Style}>
            <EditableField editing={isEditing} label="NHÀ Ở" name="attachedHouse" value={form.attachedHouse} onChange={onEditFormChange} />
            <EditableField editing={isEditing} label="CÔNG TRÌNH KHÁC" name="attachedOther" value={form.attachedOther} onChange={onEditFormChange} />
            <div style={{ gridColumn: '1 / -1' }}>
              {isEditing ? (
                <div style={grayBoxStyle}>
                  <label htmlFor="notes" style={fieldLabelStyle}>GHI CHÚ</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={form.notes}
                    onChange={onEditFormChange}
                    rows={3}
                    style={{ ...editInputStyle, resize: 'vertical' }}
                  />
                </div>
              ) : (
                <div style={grayBoxStyle}>
                  <DetailField label="GHI CHÚ" value={display(rec.notes)} strong />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

    {showGcnPreview && (
      <div style={modalOverlayStyle}>
        <div style={{ ...modalContentStyle, width: 'min(920px, 95vw)', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
          <div style={modalHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bi bi-file-earmark-pdf" style={{ color: '#a30d11' }}></i>
              <h3 style={{ margin: 0, fontWeight: 800 }}>Xem trước Giấy chứng nhận</h3>
            </div>
            <button type="button" style={iconBtnNoBgStyle} onClick={onCloseGcnPreview} aria-label="Đóng xem trước GCN">
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 32, background: '#f1f5f9' }}>
            <GcnCertificateDocument
              ref={gcnPrintRef}
              record={rec}
              getLandTypeName={getLandTypeName}
              getAreaLabel={getAreaLabel}
              display={display}
            />
          </div>

          <div style={modalFooterStyle}>
            <button type="button" style={btnGrayOutlineStyle} onClick={onCloseGcnPreview} disabled={downloadingGcnPdf}>
              Hủy bỏ
            </button>
            <button
              type="button"
              style={{ ...btnRedSubmitStyle, opacity: downloadingGcnPdf ? 0.7 : 1 }}
              onClick={onDownloadGcnPdf}
              disabled={downloadingGcnPdf}
            >
              <i className="bi bi-download"></i> {downloadingGcnPdf ? 'Đang tải...' : 'Tải file PDF'}
            </button>
          </div>
        </div>
      </div>
    )}
  </CadastralLayout>
);

export default LandRegistryDetailView;
