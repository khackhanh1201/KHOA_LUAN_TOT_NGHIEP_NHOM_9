/** Màu đồng bộ với giao diện VNeID / Land Tax */
export const DIALOG_THEME = {
  primary: '#a30d11',
  primaryDark: '#8a0a0e',
  primaryLight: '#fff1f2',
  headerBg: '#a30d11',
  headerText: '#ffffff',
  overlay: 'rgba(15, 23, 42, 0.55)',
  bodyBg: '#ffffff',
  text: '#1e293b',
  textMuted: '#64748b',
  border: '#e2e8f0',
  success: '#16a34a',
  successBg: '#dcfce7',
  error: '#dc2626',
  errorBg: '#fee2e2',
  warning: '#d97706',
  warningBg: '#fef3c7',
  info: '#2563eb',
  infoBg: '#dbeafe',
};

export const VARIANT_CONFIG = {
  success: {
    icon: 'bi-check-circle-fill',
    accent: DIALOG_THEME.success,
    iconBg: DIALOG_THEME.successBg,
  },
  error: {
    icon: 'bi-x-circle-fill',
    accent: DIALOG_THEME.error,
    iconBg: DIALOG_THEME.errorBg,
  },
  warning: {
    icon: 'bi-exclamation-triangle-fill',
    accent: DIALOG_THEME.warning,
    iconBg: DIALOG_THEME.warningBg,
  },
  info: {
    icon: 'bi-info-circle-fill',
    accent: DIALOG_THEME.info,
    iconBg: DIALOG_THEME.infoBg,
  },
};
