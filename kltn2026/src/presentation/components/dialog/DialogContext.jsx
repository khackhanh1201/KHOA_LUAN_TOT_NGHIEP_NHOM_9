import React, { createContext, use, useCallback, useEffect, useRef, useState } from 'react';
import { DIALOG_THEME, VARIANT_CONFIG } from './dialogTheme';

const alertIconCircleStyle = (cfg) => ({
  width: 44,
  height: 44,
  borderRadius: '50%',
  background: cfg.iconBg,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

const dialogPanelStyle = {
  border: 'none',
  padding: 0,
  margin: 'auto',
  maxWidth: 440,
  width: 'calc(100% - 48px)',
  borderRadius: 16,
  overflow: 'hidden',
  background: 'transparent',
};

const DialogContext = createContext(null);

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: DIALOG_THEME.overlay,
  zIndex: 10000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
  backdropFilter: 'blur(4px)',
};

const panelStyle = {
  background: DIALOG_THEME.bodyBg,
  borderRadius: 16,
  width: '100%',
  maxWidth: 440,
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  overflow: 'hidden',
  border: `1px solid ${DIALOG_THEME.border}`,
};

const headerStyle = {
  background: DIALOG_THEME.headerBg,
  color: DIALOG_THEME.headerText,
  padding: '16px 24px',
  fontWeight: 800,
  fontSize: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const bodyStyle = {
  padding: '24px',
  color: DIALOG_THEME.text,
  fontSize: 14,
  lineHeight: 1.6,
};

const footerStyle = {
  padding: '16px 24px 24px',
  display: 'flex',
  gap: 12,
  justifyContent: 'flex-end',
  flexWrap: 'wrap',
};

const btnPrimary = {
  background: DIALOG_THEME.primary,
  color: '#fff',
  border: 'none',
  padding: '10px 22px',
  borderRadius: 8,
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
};

const btnSecondary = {
  background: '#f1f5f9',
  color: DIALOG_THEME.text,
  border: `1px solid ${DIALOG_THEME.border}`,
  padding: '10px 22px',
  borderRadius: 8,
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
};

function DialogPanel({ state, onClose }) {
  const dialogRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const promptKey = state?.type === 'prompt'
    ? `${state.title}|${state.message}|${state.defaultValue ?? ''}`
    : null;

  useEffect(() => {
    if (state?.type === 'prompt') {
      setInputValue(state.defaultValue ?? '');
    }
  }, [promptKey, state?.type, state?.defaultValue]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return undefined;
    if (state) {
      if (!el.open) el.showModal();
    } else if (el.open) {
      el.close();
    }
    return undefined;
  }, [Boolean(state)]);

  if (!state) return null;

  const variant = state.variant || 'info';
  const cfg = VARIANT_CONFIG[variant] || VARIANT_CONFIG.info;

  const handlePrimary = () => {
    if (state.type === 'prompt') {
      const v = inputValue.trim();
      if (state.required && !v) return;
      onClose(v);
      return;
    }
    if (state.type === 'confirm') {
      onClose(true);
      return;
    }
    onClose(true);
  };

  const handleCancel = () => {
    if (state.type === 'confirm') onClose(false);
    else if (state.type === 'prompt') onClose(null);
    else onClose(false);
  };

  return (
    <dialog
      ref={dialogRef}
      style={dialogPanelStyle}
      aria-label={state.title || 'Thông báo'}
      onCancel={(e) => {
        e.preventDefault();
        if (state.dismissible !== false) handleCancel();
      }}
    >
      <div style={panelStyle}>
        <div style={headerStyle}>
          <span>{state.title || 'Thông báo'}</span>
          {state.dismissible !== false && (
            <button
              type="button"
              onClick={handleCancel}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: 20,
                cursor: 'pointer',
                lineHeight: 1,
                opacity: 0.9,
              }}
              aria-label="Đóng"
            >
              <i className="bi bi-x-lg" />
            </button>
          )}
        </div>

        <div style={bodyStyle}>
          {state.type === 'alert' && (
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={alertIconCircleStyle(cfg)}>
                <i className={`bi ${cfg.icon}`} style={{ fontSize: 22, color: cfg.accent }} />
              </div>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap', flex: 1 }}>{state.message}</p>
            </div>
          )}

          {(state.type === 'confirm' || state.type === 'prompt') && (
            <>
              {state.message && (
                <p style={{ margin: state.type === 'prompt' ? '0 0 16px' : 0, whiteSpace: 'pre-wrap' }}>
                  {state.message}
                </p>
              )}
              {state.type === 'prompt' && (
                <textarea
                  className="form-control"
                  rows={4}
                  value={inputValue}
                  placeholder={state.placeholder || ''}
                  aria-label="Nhập nội dung"
                  onChange={(e) => setInputValue(e.target.value)}
                  style={{
                    borderRadius: 8,
                    border: `1px solid ${DIALOG_THEME.border}`,
                    fontSize: 14,
                    resize: 'vertical',
                  }}
                />
              )}
            </>
          )}
        </div>

        <div style={footerStyle}>
          {(state.type === 'confirm' || state.type === 'prompt') && (
            <button type="button" style={btnSecondary} onClick={handleCancel}>
              {state.cancelLabel || 'Hủy'}
            </button>
          )}
          <button type="button" style={btnPrimary} onClick={handlePrimary}>
            {state.confirmLabel ||
              (state.type === 'confirm' ? 'Xác nhận' : state.type === 'prompt' ? 'Gửi' : 'Đóng')}
          </button>
        </div>
      </div>
    </dialog>
  );
}

export function DialogProvider({ children }) {
  const [state, setState] = useState(null);

  const close = useCallback((result) => {
    setState((prev) => {
      prev?.resolve?.(result);
      return null;
    });
  }, []);

  const showAlert = useCallback(
    ({ title = 'Thông báo', message = '', variant = 'info', dismissible = true } = {}) =>
      new Promise((resolve) => {
        setState({
          type: 'alert',
          title,
          message,
          variant,
          dismissible,
          resolve: () => resolve(true),
        });
      }),
    []
  );

  const showConfirm = useCallback(
    ({
      title = 'Xác nhận',
      message = '',
      confirmLabel = 'Xác nhận',
      cancelLabel = 'Hủy',
      variant = 'warning',
    } = {}) =>
      new Promise((resolve) => {
        setState({
          type: 'confirm',
          title,
          message,
          confirmLabel,
          cancelLabel,
          variant,
          dismissible: true,
          resolve,
        });
      }),
    []
  );

  const showPrompt = useCallback(
    ({
      title = 'Nhập thông tin',
      message = '',
      placeholder = '',
      defaultValue = '',
      required = false,
      confirmLabel = 'Xác nhận',
      cancelLabel = 'Hủy',
    } = {}) =>
      new Promise((resolve) => {
        setState({
          type: 'prompt',
          title,
          message,
          placeholder,
          defaultValue,
          required,
          confirmLabel,
          cancelLabel,
          variant: 'info',
          dismissible: true,
          resolve,
        });
      }),
    []
  );

  const value = { showAlert, showConfirm, showPrompt };

  return (
    <DialogContext.Provider value={value}>
      {children}
      <DialogPanel state={state} onClose={close} />
    </DialogContext.Provider>
  );
}

export function useAppDialog() {
  const ctx = use(DialogContext);
  if (!ctx) {
    throw new Error('useAppDialog must be used within DialogProvider');
  }
  return ctx;
}
