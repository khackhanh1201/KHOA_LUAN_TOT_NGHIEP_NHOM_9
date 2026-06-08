import React from 'react';

const Step2AttachedAssets = ({ form, dispatch }) => (
  <div style={{ marginBottom: 32 }}>
    <h5 style={{ fontWeight: 700, marginBottom: 16 }}>TÀI SẢN GẮN LIỀN VỚI ĐẤT</h5>
    <div style={{ background: '#f8fafc', padding: 20, borderRadius: 12 }}>
      <div style={{ marginBottom: 12 }}>
        <label htmlFor="s2-attached-house">Nhà ở</label>
        <input
          id="s2-attached-house"
          type="text"
          value={form.attachedHouse}
          onChange={(e) => dispatch({ type: 'PATCH_FORM', payload: { attachedHouse: e.target.value } })}
          style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid #e2e8f0', marginTop: 6 }}
        />
      </div>
      <div>
        <label htmlFor="s2-attached-other">Công trình khác</label>
        <input
          id="s2-attached-other"
          type="text"
          value={form.attachedOther}
          onChange={(e) => dispatch({ type: 'PATCH_FORM', payload: { attachedOther: e.target.value } })}
          style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid #e2e8f0', marginTop: 6 }}
        />
      </div>
    </div>
  </div>
);

export default Step2AttachedAssets;
