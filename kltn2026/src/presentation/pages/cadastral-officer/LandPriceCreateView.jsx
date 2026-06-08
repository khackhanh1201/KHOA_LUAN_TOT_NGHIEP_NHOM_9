import React from 'react';
import CadastralLayout from '../../components/CadastralLayout';
import { interactiveDivProps } from '../../../utils/a11y';
import {
  formatAreaOptionLabel,
  formatAreaWardLabel,
  formatAreaDistrictLabel,
} from '../../../utils/areaLabels';
import { SectionTitle } from './LandPriceFormParts';
import {
  containerStyle,
  btnBackStyle,
  cardStyle,
  labelStyle,
  inputBaseStyle,
  inputDisabledStyle,
  uploadDashBoxStyle,
  btnCancelStyle,
  btnPrimarySubmitStyle,
} from './landPriceStyles';

const LandPriceCreateView = ({
  user,
  managedAreaLabel,
  createForm,
  decisionFile,
  creating,
  masterAreas,
  masterLandTypes,
  districtLabelMap,
  onBack,
  onFormChange,
  onSubmit,
  onDecisionFileChange,
}) => (
  <CadastralLayout user={user}>
    <div style={containerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 30 }}>
        <button type="button" onClick={onBack} style={btnBackStyle} aria-label="Quay lại">
          <i className="bi bi-arrow-left"></i>
        </button>
        <div>
          <h2 style={{ margin: 0, fontWeight: 800, color: '#1e293b' }}>Nhập giá đất quy định</h2>
          <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>Khu vực quản lý: <b>{managedAreaLabel}</b></p>
        </div>
      </div>

      <div style={{ ...cardStyle, maxWidth: 800 }}>
        <div style={{ paddingBottom: 16, borderBottom: '1px solid #f1f5f9', marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e293b' }}>Thông tin cập nhật giá đất</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Nhập thông tin bảng giá đất mới cho khu vực quản lý</p>
        </div>

        <form onSubmit={onSubmit}>
          <SectionTitle icon="geo-alt" title="1. THÔNG TIN VỊ TRÍ" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label htmlFor="landPriceAreaId" style={labelStyle}>Khu vực / Tuyến đường <span style={{ color: 'red' }}>*</span></label>
              <select
                id="landPriceAreaId"
                name="areaId"
                value={createForm.areaId}
                onChange={onFormChange}
                style={inputBaseStyle}
                required
              >
                <option value="">Chọn khu vực / tuyến đường</option>
                {masterAreas.map((a) => (
                  <option key={a.areaId} value={a.areaId}>
                    {formatAreaOptionLabel(a)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="landPriceWard" style={labelStyle}>Xã/Phường</label>
              <input
                id="landPriceWard"
                type="text"
                value={formatAreaWardLabel(masterAreas.find((a) => a.areaId === Number(createForm.areaId)))}
                readOnly
                style={inputDisabledStyle}
              />
            </div>
            <div>
              <label htmlFor="landPriceDistrict" style={labelStyle}>Quận/Huyện</label>
              <input
                id="landPriceDistrict"
                type="text"
                value={formatAreaDistrictLabel(
                  masterAreas.find((a) => a.areaId === Number(createForm.areaId)),
                  districtLabelMap
                )}
                readOnly
                style={inputDisabledStyle}
              />
            </div>
          </div>

          <SectionTitle icon="bank" title="2. PHÂN LOẠI & MỨC GIÁ QUY ĐỊNH" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label htmlFor="landPriceLandTypeId" style={labelStyle}>Loại đất <span style={{ color: 'red' }}>*</span></label>
              <select
                id="landPriceLandTypeId"
                name="landTypeId"
                value={createForm.landTypeId}
                onChange={onFormChange}
                style={inputBaseStyle}
                required
              >
                <option value="">Chọn loại đất</option>
                {masterLandTypes.map((lt) => (
                  <option key={lt.landTypeId} value={lt.landTypeId}>
                    {lt.typeName} ({lt.typeCode})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="landPriceUnitPrice" style={labelStyle}>Mức giá (VNĐ/m²) <span style={{ color: 'red' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  id="landPriceUnitPrice"
                  type="number"
                  name="unitPrice"
                  value={createForm.unitPrice}
                  onChange={onFormChange}
                  placeholder="45000000"
                  style={{ ...inputBaseStyle, color: '#dc2626', fontWeight: 600 }}
                  required
                />
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#94a3b8', fontWeight: 700 }}>VNĐ</span>
              </div>
            </div>
            <div>
              <label htmlFor="landPriceAppliedFrom" style={labelStyle}>Ngày áp dụng <span style={{ color: 'red' }}>*</span></label>
              <input
                id="landPriceAppliedFrom"
                type="date"
                name="appliedFrom"
                value={createForm.appliedFrom}
                onChange={onFormChange}
                style={inputBaseStyle}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label htmlFor="landPriceDecisionReference" style={labelStyle}>Căn cứ / Quyết định tham chiếu</label>
            <input
              id="landPriceDecisionReference"
              type="text"
              name="decisionReference"
              value={createForm.decisionReference}
              onChange={onFormChange}
              placeholder="Ví dụ: Quyết định số 12/2024/QĐ-UBND"
              style={inputBaseStyle}
            />
          </div>

          <div style={{ marginBottom: 30 }}>
            <label htmlFor="landPriceDecisionInput" style={labelStyle}>File đính kèm Quyết định</label>
            <div
              {...interactiveDivProps(
                () => document.getElementById('landPriceDecisionInput')?.click(),
                'Chọn file quyết định'
              )}
              style={{ ...uploadDashBoxStyle, cursor: 'pointer' }}
            >
              <i className="bi bi-file-earmark-arrow-up" style={{ fontSize: 24, color: '#94a3b8', marginBottom: 8 }}></i>
              <div style={{ fontWeight: 600, color: '#475569', fontSize: 13 }}>Click để chọn file hoặc kéo thả file vào đây</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Hỗ trợ: PDF, JPG, PNG (Tối đa 10MB)</div>
              {decisionFile && (
                <div style={{ fontSize: 12, color: '#16a34a', marginTop: 8, fontWeight: 600 }}>
                  <i className="bi bi-check-lg" /> {decisionFile.name}
                </div>
              )}
            </div>
            <input
              id="landPriceDecisionInput"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files?.[0]) onDecisionFileChange(e.target.files[0]);
              }}
            />
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" style={btnCancelStyle} onClick={onBack}>Hủy bỏ</button>
            <button type="submit" style={btnPrimarySubmitStyle} disabled={creating}>
              {creating ? 'Đang lưu...' : 'Lưu giá đất'}
            </button>
          </div>
        </form>
      </div>
    </div>
  </CadastralLayout>
);

export default LandPriceCreateView;
