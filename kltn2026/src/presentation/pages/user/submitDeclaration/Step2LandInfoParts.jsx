import React from 'react';
import { NEW_LAND_TYPE_LABEL, resolveLandTypeLabel } from './submitDeclarationUtils';

const fieldStyle = { width: '100%', padding: '12px', borderRadius: 8, border: '1px solid #e2e8f0', marginTop: 6 };

export const Step2TypeAndGcn = ({
  form,
  gcnLookupError,
  gcnLookingUp,
  dispatch,
  onGcnBlur,
}) => (
  <>
    <div style={{ marginBottom: 20 }}>
      <span id="s2-land-type-label" style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>
        Loại hồ sơ
      </span>
      <div
        aria-labelledby="s2-land-type-label"
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: 10,
          border: '1px solid #e2e8f0',
          background: '#f8fafc',
          fontWeight: 600,
          color: '#a30d11',
        }}
      >
        {NEW_LAND_TYPE_LABEL}
      </div>
    </div>

    <div style={{ marginBottom: 28 }}>
      <label htmlFor="s2-gcn-book-number" style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>
        Số vào sổ cấp GCN <span style={{ color: 'red' }}>*</span>
      </label>
      <input
        id="s2-gcn-book-number"
        type="text"
        value={form.gcnBookNumber}
        onChange={(e) => {
          dispatch({
            type: 'PATCH_FORM',
            payload: { gcnBookNumber: e.target.value, landParcelId: '' },
          });
          dispatch({ type: 'PATCH', payload: { gcnLookupError: '' } });
        }}
        onBlur={(e) => onGcnBlur(e.target.value)}
        placeholder="VD: GCN-2026-00123"
        disabled={gcnLookingUp}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: 10,
          border: '1px solid #e2e8f0',
        }}
      />
      <p style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
        Nhập số GCN trùng với thửa trên sổ địa chính. Rời ô nhập để tra cứu — bạn có thể điều chỉnh diện tích khai báo nếu cần.
      </p>
      {gcnLookingUp && (
        <p style={{ fontSize: 12, color: '#3b82f6', marginTop: 4 }}>Đang tra cứu...</p>
      )}
      {gcnLookupError && (
        <p style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>{gcnLookupError}</p>
      )}
      {form.landParcelId && !gcnLookupError && (
        <p style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>
          Đã liên kết thửa đất #{form.landParcelId} trên sổ địa chính.
        </p>
      )}
    </div>
  </>
);

export const Step2ParcelGrid = ({ form, landTypes, dispatch }) => (
  <>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
      <div>
        <label htmlFor="s2-parcel-number">Thửa đất số</label>
        <input id="s2-parcel-number" type="text" value={form.parcelNumber || ''} onChange={e => dispatch({ type: 'PATCH_FORM', payload: { parcelNumber: e.target.value } })} style={fieldStyle} />
      </div>
      <div>
        <label htmlFor="s2-usage-duration">Thời hạn sử dụng</label>
        <input
          id="s2-usage-duration"
          type="text"
          value={form.usageDuration ?? ''}
          onChange={(e) => dispatch({ type: 'PATCH_FORM', payload: { usageDuration: e.target.value } })}
          placeholder="VD: Lâu dài, 50 năm, Đến năm 2050"
          style={fieldStyle}
        />
      </div>
      <div>
        <label htmlFor="s2-map-sheet-number">Tờ bản đồ số</label>
        <input id="s2-map-sheet-number" type="text" value={form.mapSheetNumber || ''} onChange={e => dispatch({ type: 'PATCH_FORM', payload: { mapSheetNumber: e.target.value } })} style={fieldStyle} />
      </div>
      <div>
        <label htmlFor="s2-usage-type">Hình thức sử dụng</label>
        <input id="s2-usage-type" type="text" value={form.usageType || ''} onChange={e => dispatch({ type: 'PATCH_FORM', payload: { usageType: e.target.value } })} style={fieldStyle} />
      </div>
      <div>
        <label htmlFor="s2-area-size">Diện tích</label>
        <input id="s2-area-size" type="number" value={form.areaSize || ''} onChange={e => dispatch({ type: 'PATCH_FORM', payload: { areaSize: e.target.value } })} style={fieldStyle} />
      </div>
      <div>
        <label htmlFor="s2-land-type">Loại đất</label>
        <input
          id="s2-land-type"
          type="text"
          readOnly
          value={
            form.landTypeName ||
            resolveLandTypeLabel(form.landTypeId, '', landTypes) ||
            '—'
          }
          placeholder="Chọn thửa đất hoặc tra cứu GCN"
          style={{ ...fieldStyle, background: '#f1f5f9', color: '#334155' }}
        />
      </div>
    </div>

    <div style={{ marginTop: 16 }}>
      <label htmlFor="s2-address">Địa chỉ (address)</label>
      <input id="s2-address" type="text" value={form.address || ''} onChange={e => dispatch({ type: 'PATCH_FORM', payload: { address: e.target.value } })} style={fieldStyle} />
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
      <div>
        <label htmlFor="s2-usage-origin">Nguồn gốc sử dụng</label>
        <input id="s2-usage-origin" type="text" value={form.usageOrigin || ''} onChange={e => dispatch({ type: 'PATCH_FORM', payload: { usageOrigin: e.target.value } })} style={fieldStyle} />
      </div>
      <div>
        <label htmlFor="s2-certificate-number">Số hiệu Sổ đỏ / Seri</label>
        <input id="s2-certificate-number" type="text" value={form.certificateNumber || ''} onChange={e => dispatch({ type: 'PATCH_FORM', payload: { certificateNumber: e.target.value } })} style={fieldStyle} />
      </div>
    </div>
  </>
);
