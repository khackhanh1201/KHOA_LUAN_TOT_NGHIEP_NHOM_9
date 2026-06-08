import { useRef } from 'react';
import { useKeyedAsyncLoad } from '../../../../hooks/useKeyedAsyncLoad';
import {
  API_BASE,
  getAuth,
  findExemptionForYear,
  normalizeExemptStatus,
  getDeclarationTaxYear,
  LAND_PRICE_MISSING_MESSAGE,
  isLandPriceMissingError,
} from './submitDeclarationUtils';

export const useDeclarationEffects = ({ step, landTypes, cccdNumber, token, form, dispatch }) => {
  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;

  const landTypesKey = step === 2 && landTypes.length === 0 ? `land-types-${token}` : null;
  useKeyedAsyncLoad(landTypesKey, async () => {
    const res = await fetch(`${API_BASE}/master-data/land-types`, { headers: getAuth(token) });
    const json = res.ok ? await res.json() : {};
    const list = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
    dispatchRef.current({ type: 'PATCH', payload: { landTypes: list } });
    return list;
  });

  const exemptionKey =
    step === 2 && cccdNumber !== 'Chưa xác định' ? `exemption-${token}-${cccdNumber}` : null;
  useKeyedAsyncLoad(exemptionKey, async () => {
    dispatchRef.current({ type: 'PATCH', payload: { loadingExemption: true } });
    try {
      const res = await fetch(`${API_BASE}/tax/exemptions/me`, { headers: getAuth(token) });
      const list = res.ok ? await res.json() : [];
      const taxYear = getDeclarationTaxYear();
      const row = findExemptionForYear(list, taxYear);
      if (row) {
        const rate = Number(row.discountRate);
        const reason = row.exemptionReason || 'Không có';
        dispatchRef.current({
          type: 'PATCH_FORM',
          payload: {
            doiTuongMienThue: reason,
            exemptionReason: reason,
            discountRate: Number.isFinite(rate) ? String(rate) : '',
            exemptionStatus: normalizeExemptStatus(row.status),
            appliedYear: String(row.appliedYear ?? taxYear),
          },
        });
      } else {
        dispatchRef.current({
          type: 'PATCH_FORM',
          payload: {
            doiTuongMienThue: 'Không có',
            exemptionReason: '',
            discountRate: '',
            exemptionStatus: '',
            appliedYear: String(taxYear),
          },
        });
      }
      return list;
    } catch (err) {
      console.error('Lỗi tải miễn giảm:', err);
      return [];
    } finally {
      dispatchRef.current({ type: 'PATCH', payload: { loadingExemption: false } });
    }
  });

  const area = Number(form.areaSize);
  const hasValidTaxInput =
    form.landParcelId && form.areaId && form.landTypeId && area > 0;

  const taxResetKey = hasValidTaxInput
    ? null
    : `reset-${form.landParcelId}-${form.areaId}-${form.landTypeId}-${form.areaSize}`;

  useKeyedAsyncLoad(taxResetKey, async () => {
    dispatchRef.current({ type: 'RESET_TAX_ESTIMATE' });
  });

  const taxEstimateKey = hasValidTaxInput
    ? `${form.landParcelId}-${form.areaId}-${form.landTypeId}-${form.areaSize}-${token}`
    : null;

  useKeyedAsyncLoad(taxEstimateKey, async () => {
    dispatchRef.current({
      type: 'SET_TAX_ESTIMATE',
      payload: { loading: true, landPriceMissing: false, error: null },
    });
    try {
      const res = await fetch(`${API_BASE}/taxes/calculate`, {
        method: 'POST',
        headers: getAuth(token),
        body: JSON.stringify({
          areaId: Number(form.areaId),
          landTypeId: Number(form.landTypeId),
          declaredArea: area,
          taxYear: getDeclarationTaxYear(),
        }),
      });

      const text = await res.text();
      if (!res.ok) {
        if (isLandPriceMissingError(res.status, text)) {
          dispatchRef.current({
            type: 'SET_TAX_ESTIMATE',
            payload: {
              loading: false,
              landPriceMissing: true,
              error: LAND_PRICE_MISSING_MESSAGE,
              grossTaxAmount: null,
              reductionAmount: null,
              calculatedAmount: null,
              discountRate: null,
              exemptionApplied: false,
              unitPrice: null,
            },
          });
          return null;
        }
        throw new Error('Tính thuế thất bại');
      }

      const data = text ? JSON.parse(text) : {};
      dispatchRef.current({
        type: 'SET_TAX_ESTIMATE',
        payload: {
          loading: false,
          landPriceMissing: false,
          error: null,
          grossTaxAmount: data.grossTaxAmount ?? data.calculatedAmount ?? null,
          reductionAmount: data.reductionAmount ?? 0,
          calculatedAmount: data.calculatedAmount ?? null,
          discountRate: data.discountRate ?? null,
          exemptionApplied: Boolean(data.exemptionApplied),
          unitPrice: data.unitPrice ?? null,
        },
      });
      return data;
    } catch (err) {
      console.error(err);
      dispatchRef.current({ type: 'RESET_TAX_ESTIMATE' });
      throw err;
    }
  });
};
