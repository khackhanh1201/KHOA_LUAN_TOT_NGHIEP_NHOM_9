import React, { useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import LandTaxLayout from '../../components/LandTaxLayout';
import { useUserInfo } from '../../../hooks/useUserInfo';
import { userApi } from '../../../infrastructure/api/userApi';
import { getToken } from '../../../usecases/authService';
import { notifyPendingDeclarationsChanged } from '../../../hooks/usePendingDeclarationCount';
import {
  INITIAL_DECLARATION_STATE,
  declarationPageReducer,
  canGoStep3,
  lookupParcelByGcn,
  submitDeclaration,
  LAND_PRICE_MISSING_MESSAGE,
} from './submitDeclaration/submitDeclarationUtils';
import { useDeclarationEffects } from './submitDeclaration/useDeclarationEffects';
import DeclarationStepper from './submitDeclaration/DeclarationStepper';
import DeclarationSuccessView from './submitDeclaration/DeclarationSuccessView';
import Step1Verification from './submitDeclaration/Step1Verification';
import Step2LandInfo from './submitDeclaration/Step2LandInfo';
import Step3Documents from './submitDeclaration/Step3Documents';
import Step4Review from './submitDeclaration/Step4Review';

const SubmitDeclarationPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useUserInfo();

  const [state, dispatch] = useReducer(declarationPageReducer, INITIAL_DECLARATION_STATE);
  const {
    step,
    landTypes,
    form,
    gcnLookupError,
    gcnLookingUp,
    loadingExemption,
    taxEstimate,
    files,
    agreed,
    submitting,
    error,
    success,
    declarationCode,
  } = state;

  const token = getToken() || '';
  let cccdNumberFromToken = '';
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      cccdNumberFromToken = payload?.cccdNumber || payload?.sub || '';
    }
  } catch (e) {}

  const cccdNumber = cccdNumberFromToken || user?.cccdNumber || 'Chưa xác định';

  useDeclarationEffects({ step, landTypes, cccdNumber, token, form, dispatch });

  if (loading || !user) {
    return (
      <LandTaxLayout user={user}>
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <output className="spinner-border text-danger" aria-live="polite"></output>
          <p className="mt-3">Đang tải thông tin người dùng...</p>
        </div>
      </LandTaxLayout>
    );
  }

  const handleFileSelect = (e) => {
    if (e.target.files) {
      dispatch({ type: 'PATCH', payload: { files: [...files, ...Array.from(e.target.files)] } });
    }
  };

  const handleGcnLookup = async (gcn) => {
    const trimmed = String(gcn || '').trim();
    if (!trimmed) {
      dispatch({ type: 'PATCH', payload: { gcnLookupError: '' } });
      return;
    }
    dispatch({ type: 'PATCH', payload: { gcnLookingUp: true, gcnLookupError: '' } });
    try {
      const result = await lookupParcelByGcn(gcn, token, landTypes);
      dispatch({ type: 'PATCH', payload: { gcnLookupError: result.gcnLookupError } });
      if (result.formPatch) dispatch({ type: 'PATCH_FORM', payload: result.formPatch });
    } catch (e) {
      console.error(e);
      dispatch({ type: 'PATCH', payload: { gcnLookupError: 'Không tra cứu được thửa đất. Vui lòng thử lại.' } });
    } finally {
      dispatch({ type: 'PATCH', payload: { gcnLookingUp: false } });
    }
  };

  const removeFile = (index) => {
    dispatch({ type: 'PATCH', payload: { files: files.filter((_, i) => i !== index) } });
  };

  const handleSubmit = async () => {
    let attachmentIds = [];
    if (files.length > 0) {
      const uploadResults = await Promise.all(
        files.map((file) => userApi.uploadFile(file))
      );
      attachmentIds = uploadResults.map((res) => Number(res.documentId));
    }
    if (!form.gcnBookNumber.trim()) {
      dispatch({ type: 'PATCH', payload: { error: 'Vui lòng nhập Số vào sổ cấp GCN' } });
      return;
    }
    if (!form.landParcelId) {
      dispatch({
        type: 'PATCH',
        payload: { error: 'Vui lòng tra cứu GCN để liên kết thửa đất trên sổ địa chính.' },
      });
      return;
    }

    const parsedArea = Number(form.areaSize);
    if (!form.areaSize || isNaN(parsedArea) || parsedArea <= 0) {
      dispatch({ type: 'PATCH', payload: { error: 'Vui lòng nhập diện tích là một con số hợp lệ và lớn hơn 0!' } });
      return;
    }

    if (!agreed) {
      dispatch({ type: 'PATCH', payload: { error: 'Vui lòng đồng ý với cam kết' } });
      return;
    }

    if (taxEstimate.landPriceMissing) {
      dispatch({ type: 'PATCH', payload: { error: LAND_PRICE_MISSING_MESSAGE } });
      return;
    }

    dispatch({ type: 'PATCH', payload: { submitting: true, error: '' } });

    try {
      const code = await submitDeclaration(form, attachmentIds);
      dispatch({ type: 'PATCH', payload: { declarationCode: code, success: true } });
      window.dispatchEvent(new CustomEvent('notifications-changed'));
      notifyPendingDeclarationsChanged();
    } catch (err) {
      dispatch({ type: 'PATCH', payload: { error: err.message || 'Nộp hồ sơ thất bại. Vui lòng thử lại sau.' } });
      console.error(err);
    } finally {
      dispatch({ type: 'PATCH', payload: { submitting: false } });
    }
  };

  if (success) {
    return (
      <LandTaxLayout user={user}>
        <DeclarationSuccessView
          declarationCode={declarationCode}
          onNavigate={() => navigate('/property-declaration')}
        />
      </LandTaxLayout>
    );
  }

  return (
    <LandTaxLayout user={user}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <button type="button" onClick={() => step > 1 ? dispatch({ type: 'PATCH', payload: { step: step - 1 } }) : navigate('/property-declaration')}
            style={{ background: 'none', border: 'none', fontSize: 26, color: '#64748b' }}
          >
            ←
          </button>
          <div>
            <h4 style={{ margin: 0, fontWeight: 800 }}>Tạo hồ sơ mới</h4>
            <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>Hoàn thành các bước để gửi hồ sơ</p>
          </div>
        </div>

        <DeclarationStepper step={step} />

        <div style={{ background: '#fff', borderRadius: 16, padding: '40px 48px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          {step === 1 && (
            <Step1Verification
              user={user}
              cccdNumber={cccdNumber}
              onContinue={() => dispatch({ type: 'PATCH', payload: { step: 2 } })}
            />
          )}
          {step === 2 && (
            <Step2LandInfo
              form={form}
              landTypes={landTypes}
              gcnLookupError={gcnLookupError}
              gcnLookingUp={gcnLookingUp}
              loadingExemption={loadingExemption}
              taxEstimate={taxEstimate}
              dispatch={dispatch}
              onGcnBlur={handleGcnLookup}
              onBack={() => dispatch({ type: 'PATCH', payload: { step: 1 } })}
              onContinue={() => dispatch({ type: 'PATCH', payload: { step: 3 } })}
              canContinue={canGoStep3(form, taxEstimate)}
            />
          )}
          {step === 3 && (
            <Step3Documents
              files={files}
              onFileSelect={handleFileSelect}
              onRemoveFile={removeFile}
              onBack={() => dispatch({ type: 'PATCH', payload: { step: 2 } })}
              onContinue={() => dispatch({ type: 'PATCH', payload: { step: 4 } })}
            />
          )}
          {step === 4 && (
            <Step4Review
              user={user}
              cccdNumber={cccdNumber}
              form={form}
              landTypes={landTypes}
              taxEstimate={taxEstimate}
              files={files}
              agreed={agreed}
              error={error}
              submitting={submitting}
              dispatch={dispatch}
              onBack={() => dispatch({ type: 'PATCH', payload: { step: 3 } })}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </LandTaxLayout>
  );
};

export default SubmitDeclarationPage;
