import React from 'react';
import { interactiveDivProps } from '../../../utils/a11y';
import {
  modalOverlayStyle,
  modalContentStyle,
  modalHeaderStyle,
  modalBodyStyle,
  modalFooterStyle,
  iconBtnNoBgStyle,
  optionCardStyle,
  iconSquareStyle,
  btnOutlineFullStyle,
  btnRedFullStyle,
  infoAlertStyle,
  labelStyle,
  inputStyle,
  grid2ColStyle,
  dashedUploadAreaStyle,
  btnGrayOutlineStyle,
  btnRedSubmitStyle,
} from './landRegistryStyles';

const LandRegistryPushModal = ({
  show,
  pushDataMethod,
  uploading,
  selectedExcelFile,
  manualForm,
  landTypes,
  areas,
  excelFileInputRef,
  getAreaLabel,
  onClose,
  onBackToMethodSelect,
  onSelectMethod,
  onDownloadTemplate,
  onExcelFileSelect,
  onClearExcelSelection,
  onConfirmExcelImport,
  onManualSubmit,
  onManualFormChange,
}) => {
  if (!show) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={{ ...modalContentStyle, width: 600, maxWidth: '95%', display: 'flex', flexDirection: 'column' }}>
        <div style={modalHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {pushDataMethod && (
              <button type="button" style={iconBtnNoBgStyle} onClick={onBackToMethodSelect} aria-label="Quay lại">
                <i className="bi bi-arrow-left" style={{ fontSize: 20, color: '#64748b' }}></i>
              </button>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bi bi-upload" style={{ color: '#b91c1c', fontSize: 18 }}></i>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1e293b' }}>
                Đẩy dữ liệu đất đai mới
              </h2>
            </div>
          </div>
          <button type="button" style={iconBtnNoBgStyle} onClick={onClose} aria-label="Đóng">
            <i className="bi bi-x" style={{ fontSize: 24, color: '#64748b' }}></i>
          </button>
        </div>

        <div style={modalBodyStyle}>
          {!pushDataMethod && (
            <>
              <p style={{ color: '#64748b', marginBottom: 20, fontSize: 15 }}>
                Vui lòng chọn hình thức cập nhật dữ liệu sổ địa chính lên hệ thống.
              </p>

              <div {...interactiveDivProps(() => onSelectMethod('excel'), 'Đẩy dữ liệu bằng Excel')} style={optionCardStyle}>
                <div style={{ ...iconSquareStyle, background: '#ecfdf5', color: '#10b981' }}>
                  <i className="bi bi-file-earmark-spreadsheet" style={{ fontSize: 24 }}></i>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: 16, color: '#1e293b' }}>Đẩy dữ liệu bằng Excel (.xlsx, .csv)</h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: 14, lineHeight: 1.5 }}>
                    Tải lên danh sách nhiều thửa đất cùng lúc theo biểu mẫu chuẩn của hệ thống.
                  </p>
                </div>
              </div>

              <div {...interactiveDivProps(() => onSelectMethod('manual'), 'Nhập dữ liệu thủ công')} style={optionCardStyle}>
                <div style={{ ...iconSquareStyle, background: '#eff6ff', color: '#3b82f6' }}>
                  <i className="bi bi-keyboard" style={{ fontSize: 24 }}></i>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: 16, color: '#1e293b' }}>Nhập dữ liệu thủ công</h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: 14, lineHeight: 1.5 }}>
                    Điền thông tin chi tiết cho một bản ghi sổ địa chính mới trực tiếp trên hệ thống.
                  </p>
                </div>
              </div>
            </>
          )}

          {pushDataMethod === 'excel' && (
            <div style={{ textAlign: 'center', padding: '20px 40px' }}>
              <div style={{ ...iconSquareStyle, background: '#ecfdf5', color: '#10b981', margin: '0 auto 20px auto', width: 64, height: 64 }}>
                <i className="bi bi-file-earmark-spreadsheet" style={{ fontSize: 32 }}></i>
              </div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: 18, color: '#1e293b' }}>Tải lên tệp Excel dữ liệu</h3>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                Vui lòng tải xuống biểu mẫu chuẩn nếu chưa có, hoặc tải lên tệp dữ liệu đã điền chuẩn cấu trúc.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button type="button" style={btnOutlineFullStyle} onClick={onDownloadTemplate}>
                  <i className="bi bi-download"></i> Tải biểu mẫu chuẩn (.xlsx)
                </button>
                <label htmlFor="registryExcelFile" style={{ ...btnRedFullStyle, cursor: 'pointer' }}>
                  <i className="bi bi-upload"></i> Kéo thả hoặc chọn tệp
                  <input
                    id="registryExcelFile"
                    ref={excelFileInputRef}
                    type="file"
                    accept=".xlsx"
                    hidden
                    onChange={onExcelFileSelect}
                  />
                </label>
              </div>
              {selectedExcelFile && (
                <p style={{ marginTop: 16, fontSize: 14, color: '#334155' }}>
                  <i className="bi bi-file-earmark-excel" style={{ color: '#10b981', marginRight: 6 }} />
                  Đã chọn: <strong>{selectedExcelFile.name}</strong>{' '}
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', fontSize: 13 }}
                    onClick={onClearExcelSelection}
                  >
                    (Bỏ chọn)
                  </button>
                </p>
              )}
              {uploading && <p style={{ marginTop: 15, color: '#3b82f6' }}>Đang đẩy dữ liệu...</p>}
            </div>
          )}

          {pushDataMethod === 'manual' && (
            <form id="manual-form" onSubmit={onManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={infoAlertStyle}>
                <i className="bi bi-info-circle"></i>
                Nhập thủ công đầy đủ thông tin Sổ địa chính số để ghi nhận lên hệ thống cơ sở dữ liệu quốc gia.
              </div>
              <div style={infoAlertStyle}>
                <i className="bi bi-info-circle"></i>
                Thửa đất thêm mới <strong>chưa có chủ</strong>. Công dân sẽ khai báo sở hữu bằng đúng số vào sổ GCN bên dưới.
              </div>

              <div style={grid2ColStyle}>
                <div>
                  <label htmlFor="manualGcnBookNumber" style={labelStyle}>Số vào sổ cấp GCN <span style={{ color: '#ef4444' }}>*</span></label>
                  <input id="manualGcnBookNumber" name="gcnBookNumber" placeholder="VD: GCN-2026-00123" value={manualForm.gcnBookNumber} style={inputStyle} onChange={onManualFormChange} />
                </div>
                <div>
                  <label htmlFor="manualCertificateNumber" style={labelStyle}>Số seri GCN (tùy chọn)</label>
                  <input id="manualCertificateNumber" name="certificateNumber" placeholder="Ví dụ: CH12345" value={manualForm.certificateNumber} style={inputStyle} onChange={onManualFormChange} />
                </div>
              </div>

              <div style={grid2ColStyle}>
                <div>
                  <label htmlFor="manualParcelNumber" style={labelStyle}>Thửa đất số</label>
                  <input id="manualParcelNumber" name="parcelNumber" placeholder="Số thửa..." value={manualForm.parcelNumber} style={inputStyle} onChange={onManualFormChange} />
                </div>
                <div>
                  <label htmlFor="manualMapSheetNumber" style={labelStyle}>Tờ bản đồ số</label>
                  <input id="manualMapSheetNumber" name="mapSheetNumber" placeholder="Số tờ..." value={manualForm.mapSheetNumber} style={inputStyle} onChange={onManualFormChange} />
                </div>
              </div>
              <div style={grid2ColStyle}>
                <div>
                  <label htmlFor="manualLandTypeId" style={labelStyle}>Loại đất</label>
                  <select id="manualLandTypeId" name="landTypeId" value={manualForm.landTypeId} onChange={onManualFormChange} style={inputStyle}>
                    <option value="">-- Chọn loại đất --</option>
                    {landTypes.map((t) => (
                      <option key={t.landTypeId} value={t.landTypeId}>{t.typeName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="manualAreaId" style={labelStyle}>Khu vực</label>
                  <select id="manualAreaId" name="areaId" value={manualForm.areaId} onChange={onManualFormChange} style={inputStyle}>
                    <option value="">-- Chọn khu vực --</option>
                    {areas.map((a) => (
                      <option key={a.areaId} value={a.areaId}>{getAreaLabel(a.areaId)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="manualAreaSize" style={labelStyle}>Diện tích (m²)</label>
                <input id="manualAreaSize" name="areaSize" type="number" placeholder="Ví dụ: 120" value={manualForm.areaSize} style={inputStyle} onChange={onManualFormChange} />
              </div>
              <div>
                <label htmlFor="manualAddress" style={labelStyle}>Địa chỉ thửa đất</label>
                <input id="manualAddress" name="address" placeholder="Số nhà, đường, phường/xã..." value={manualForm.address} style={inputStyle} onChange={onManualFormChange} />
              </div>

              <div>
                <div style={labelStyle}>Tệp đính kèm (Sơ đồ, bản vẽ)</div>
                <div style={dashedUploadAreaStyle}>
                  <i className="bi bi-upload" style={{ fontSize: 24, color: '#ef4444', marginBottom: 8, display: 'block' }}></i>
                  <div style={{ fontWeight: 600, color: '#334155' }}>Nhấn để tải lên hoặc kéo thả tệp</div>
                  <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>PDF, JPG, PNG (Tối đa 10MB)</div>
                </div>
              </div>
            </form>
          )}
        </div>

        {pushDataMethod && (
          <div style={modalFooterStyle}>
            <button type="button" style={btnGrayOutlineStyle} onClick={onClose}>
              Hủy bỏ
            </button>

            {pushDataMethod === 'manual' ? (
              <button type="submit" form="manual-form" style={btnRedSubmitStyle} disabled={uploading}>
                <i className="bi bi-check-circle" style={{ marginRight: 6 }} />
                {uploading ? 'Đang xử lý...' : 'Xác nhận đẩy dữ liệu'}
              </button>
            ) : (
              <button
                type="button"
                style={btnRedSubmitStyle}
                onClick={onConfirmExcelImport}
                disabled={uploading || !selectedExcelFile}
              >
                <i className="bi bi-check-circle" style={{ marginRight: 6 }} />
                {uploading ? 'Đang xử lý...' : 'Xác nhận đẩy dữ liệu'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LandRegistryPushModal;
