import React, { useState, useReducer, useEffect, useRef, useCallback, useEffectEvent } from 'react';
import { authRepository } from '../../infrastructure/authRepository';
import { saveSession, refreshSessionFromProfile } from '../../usecases/authService';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoginFormPanel from './login/LoginFormPanel';
import QrLoginPanel from './login/QrLoginPanel';
import ActivationForm from './login/ActivationForm';
import { loginReducer, activationReducer, qrReducer, loginStyles } from './login/loginParts';

const LoginPage = ({ onLoginSuccess }) => {
  const [view, setView] = useState('login');

  const [loginState, dispatchLogin] = useReducer(loginReducer, {
    citizenId: '', password: '', showPassword: false, loginLoading: false, loginError: '', accountStatusBlock: null,
  });
  const { citizenId, password, showPassword, loginLoading, loginError, accountStatusBlock } = loginState;

  const [activationState, dispatchActivation] = useReducer(activationReducer, {
    activationStep: 1, cccdNumber: '', phoneNumber: '', email: '', otpCode: '', newPassword: '',
    maskedEmail: '', activationLoading: false, activationMessage: '', activationError: '',
  });
  const {
    activationStep, cccdNumber, phoneNumber, email, otpCode, newPassword,
    maskedEmail, activationLoading, activationMessage, activationError,
  } = activationState;

  const [qrState, dispatchQr] = useReducer(qrReducer, {
    qrPhase: 'generating', qrBase64: '', qrToken: '', qrError: '',
  });
  const { qrPhase, qrBase64, qrToken, qrError } = qrState;

  const pollRef = useRef(null);

  const generateQr = useCallback(async () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    dispatchQr({ type: 'START_GENERATE' });
    try {
      const res = await authRepository.generateQr();
      if (res.success) {
        dispatchQr({ type: 'PATCH', payload: { qrBase64: res.data.qrBase64Image, qrToken: res.data.qrToken, qrPhase: 'polling' } });
      } else {
        dispatchQr({ type: 'PATCH', payload: { qrError: res.message || 'Không thể tạo mã QR', qrPhase: 'error' } });
      }
    } catch (err) {
      dispatchQr({ type: 'PATCH', payload: { qrError: err.message || 'Lỗi kết nối khi tạo QR', qrPhase: 'error' } });
    }
  }, []);

  const onLoginSuccessEvent = useEffectEvent((data) => {
    if (onLoginSuccess) onLoginSuccess(data);
  });

  const regenerateQrEvent = useEffectEvent(() => {
    generateQr();
  });

  useEffect(() => {
    if (qrPhase !== 'polling' || !qrToken) return;
    const intervalId = setInterval(async () => {
      try {
        const res = await authRepository.checkQrStatus(qrToken);
        const isExpired = res?.data?.status === 'EXPIRED' || res?.errorCode === 'EXPIRED';
        if (isExpired) {
          clearInterval(intervalId);
          pollRef.current = null;
          dispatchQr({ type: 'PATCH', payload: { qrPhase: 'expired' } });
          setTimeout(regenerateQrEvent, 2000);
          return;
        }
        if (!res.success) return;
        const status = res?.data?.status;
        if (status === 'SUCCESS' || status === 'CONFIRMED') {
          const loginRes = await authRepository.qrLogin(qrToken);
          const token = loginRes?.data?.token;
          if (!token) throw new Error('Không nhận được token từ /auth/qr-login');
          clearInterval(intervalId);
          pollRef.current = null;
          saveSession(loginRes.data, token);
          await refreshSessionFromProfile();
          dispatchQr({ type: 'PATCH', payload: { qrPhase: 'confirmed' } });
          onLoginSuccessEvent(loginRes.data);
        }
      } catch (err) {
        console.error('[QR] poll error:', err);
      }
    }, 2000);
    pollRef.current = intervalId;
    return () => {
      clearInterval(intervalId);
      pollRef.current = null;
    };
  }, [qrPhase, qrToken]);

  useEffect(() => {
    if (view === 'login') regenerateQrEvent();
  }, [view]);

  const resetActivationForm = (prefillCccd = '') => {
    dispatchActivation({ type: 'RESET_FORM', prefillCccd });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatchLogin({ type: 'PATCH', payload: { loginLoading: true, loginError: '', accountStatusBlock: null } });
    try {
      const res = await authRepository.login(citizenId, password);
      const token = res.data?.token || res.token;
      if (!token) throw new Error('Không nhận được token');
      saveSession(res.data, token);
      await refreshSessionFromProfile();
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      if (err.code === 'ACCOUNT_INACTIVE' || err.code === 'ACCOUNT_LOCKED') {
        dispatchLogin({ type: 'PATCH', payload: { accountStatusBlock: { code: err.code, message: err.message }, loginError: '' } });
      } else {
        dispatchLogin({ type: 'PATCH', payload: { loginError: err.message || 'Số định danh hoặc mật khẩu không đúng' } });
      }
    } finally {
      dispatchLogin({ type: 'PATCH', payload: { loginLoading: false } });
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    dispatchActivation({ type: 'PATCH', payload: { activationError: '', activationMessage: '' } });
    const trimmedCccd = cccdNumber.trim();
    const trimmedPhone = phoneNumber.trim();
    const trimmedEmail = email.trim();
    if (!/^\d{12}$/.test(trimmedCccd)) {
      dispatchActivation({ type: 'PATCH', payload: { activationError: 'Số CCCD phải đúng 12 chữ số' } });
      return;
    }
    if (!trimmedPhone || !/^\d{9,11}$/.test(trimmedPhone)) {
      dispatchActivation({ type: 'PATCH', payload: { activationError: 'Số điện thoại không hợp lệ (9-11 số)' } });
      return;
    }
    if (!trimmedEmail || !/\S+@\S+\.\S+/.test(trimmedEmail)) {
      dispatchActivation({ type: 'PATCH', payload: { activationError: 'Email không hợp lệ' } });
      return;
    }
    dispatchActivation({ type: 'PATCH', payload: { activationLoading: true } });
    try {
      const response = await authRepository.activateRequestOtp({ cccdNumber: trimmedCccd, phoneNumber: trimmedPhone, email: trimmedEmail });
      if (response.success) {
        dispatchActivation({ type: 'PATCH', payload: { maskedEmail: response.data.maskedEmail, activationMessage: 'Mã OTP đã được gửi đến email của bạn', activationStep: 2 } });
      }
    } catch (err) {
      const msg = err.message;
      if (msg.includes('đã được kích hoạt')) {
        dispatchActivation({ type: 'PATCH', payload: { activationError: 'Tài khoản đã kích hoạt. Vui lòng đăng nhập!' } });
        setTimeout(() => setView('login'), 3000);
      } else {
        dispatchActivation({ type: 'PATCH', payload: { activationError: msg || 'Không thể gửi OTP' } });
      }
    } finally {
      dispatchActivation({ type: 'PATCH', payload: { activationLoading: false } });
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    dispatchActivation({ type: 'PATCH', payload: { activationLoading: true, activationError: '' } });
    try {
      const response = await authRepository.activateVerifyOtp({ cccdNumber: cccdNumber.trim(), otpCode: otpCode.trim() });
      if (response.success) {
        dispatchActivation({ type: 'PATCH', payload: { activationMessage: 'Mã OTP hợp lệ. Vui lòng thiết lập mật khẩu.', activationStep: 3 } });
      }
    } catch (err) {
      dispatchActivation({ type: 'PATCH', payload: { activationError: err.message || 'Mã OTP không đúng hoặc hết hạn.' } });
    } finally {
      dispatchActivation({ type: 'PATCH', payload: { activationLoading: false } });
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    dispatchActivation({ type: 'PATCH', payload: { activationLoading: true, activationError: '' } });
    try {
      const response = await authRepository.activateSetPassword({ cccdNumber: cccdNumber.trim(), password: newPassword });
      if (response.success) {
        dispatchActivation({ type: 'PATCH', payload: { activationMessage: 'Kích hoạt thành công! Đang chuyển về đăng nhập...' } });
        setTimeout(() => { resetActivationForm(); setView('login'); }, 2500);
      }
    } catch (err) {
      dispatchActivation({ type: 'PATCH', payload: { activationError: err.message || 'Không thể kích hoạt tài khoản.' } });
    } finally {
      dispatchActivation({ type: 'PATCH', payload: { activationLoading: false } });
    }
  };

  return (
    <div style={loginStyles.container}>
      <div className="text-center mb-4">
        <img src="https://vneid.gov.vn/_next/static/media/logo-full-vneid.c28b5b54.png" alt="VNeID Logo" style={{ width: '230px' }} />
      </div>
      <div className="card shadow-lg border-0" style={loginStyles.card}>
        <div className="card-body p-5">
          {view === 'login' ? (
            <div className="row">
              <LoginFormPanel
                citizenId={citizenId}
                password={password}
                showPassword={showPassword}
                loginLoading={loginLoading}
                loginError={loginError}
                accountStatusBlock={accountStatusBlock}
                onCitizenIdChange={(v) => dispatchLogin({ type: 'PATCH', payload: { citizenId: v } })}
                onPasswordChange={(v) => dispatchLogin({ type: 'PATCH', payload: { password: v } })}
                onTogglePassword={() => dispatchLogin({ type: 'PATCH', payload: { showPassword: !showPassword } })}
                onSubmit={handleLogin}
                onGoActivate={() => { setView('activate'); resetActivationForm(); }}
                onActivateFromBlock={() => {
                  setView('activate');
                  resetActivationForm(citizenId);
                  dispatchLogin({ type: 'PATCH', payload: { accountStatusBlock: null } });
                }}
              />
              <QrLoginPanel qrPhase={qrPhase} qrBase64={qrBase64} qrError={qrError} onGenerateQr={generateQr} />
            </div>
          ) : (
            <ActivationForm
              activationStep={activationStep}
              cccdNumber={cccdNumber}
              phoneNumber={phoneNumber}
              email={email}
              otpCode={otpCode}
              newPassword={newPassword}
              maskedEmail={maskedEmail}
              activationLoading={activationLoading}
              activationMessage={activationMessage}
              activationError={activationError}
              onBack={() => { setView('login'); resetActivationForm(); }}
              onFieldChange={(patch) => dispatchActivation({ type: 'PATCH', payload: patch })}
              onRequestOtp={handleRequestOtp}
              onVerifyOtp={handleVerifyOtp}
              onSetPassword={handleSetPassword}
              onGoStep1={() => dispatchActivation({ type: 'PATCH', payload: { activationStep: 1 } })}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
