import React from 'react';
import { Step2TypeAndGcn, Step2ParcelGrid } from './Step2LandInfoParts';
import {
  Step2ExemptionBlock,
  Step2TaxEstimateBlock,
  Step2AttachedAssets,
} from './Step2LandInfoExtras';

const Step2LandInfo = ({
  form,
  landTypes,
  gcnLookupError,
  gcnLookingUp,
  loadingExemption,
  taxEstimate,
  dispatch,
  onGcnBlur,
  onBack,
  onContinue,
  canContinue,
}) => (
  <div>
    <h5 style={{ fontWeight: 700, marginBottom: 24 }}>Thông tin hồ sơ</h5>

    <Step2TypeAndGcn
      form={form}
      gcnLookupError={gcnLookupError}
      gcnLookingUp={gcnLookingUp}
      dispatch={dispatch}
      onGcnBlur={onGcnBlur}
    />

    <div style={{ marginBottom: 28 }}>
      <h5 style={{ fontWeight: 700, marginBottom: 16 }}>THÔNG TIN THỬA ĐẤT</h5>
      <div style={{ background: '#f8fafc', padding: 24, borderRadius: 12 }}>
        <Step2ParcelGrid form={form} landTypes={landTypes} dispatch={dispatch} />
        <Step2ExemptionBlock form={form} loadingExemption={loadingExemption} />
        <Step2TaxEstimateBlock taxEstimate={taxEstimate} />
      </div>
    </div>

    <Step2AttachedAssets form={form} dispatch={dispatch} />

    <div style={{ display: 'flex', gap: 12 }}>
      <button type="button" onClick={onBack} style={{ flex: 1, padding: '14px', border: '1px solid #e2e8f0', borderRadius: 12, background: '#fff' }}>Quay lại</button>
      <button type="button" onClick={onContinue}
        disabled={!canContinue}
        style={{ flex: 1, padding: '14px', background: '#a30d11', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700 }}
      >
        Tiếp tục
      </button>
    </div>
  </div>
);

export default Step2LandInfo;
