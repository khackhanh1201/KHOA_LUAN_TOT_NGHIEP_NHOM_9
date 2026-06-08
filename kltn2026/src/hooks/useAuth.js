// src/hooks/useAuth.js
// Hook reactive cho session. Biến localStorage (vốn KHÔNG reactive) thành
// nguồn dữ liệu reactive cho React — mọi component dùng hook này sẽ tự
// re-render khi saveSession/clearSession được gọi, hoặc khi tab khác đổi session.
//
// Cách dùng:
//   const { user, role, token, isAuthenticated, displayName } = useAuth();

import { useSyncExternalStore } from 'react';
import {
  subscribeAuthChange,
  getCurrentUser,
  getActiveRole,
  getToken,
  getDisplayName,
} from '../usecases/authService';

/**
 * Trả về snapshot hiện tại của session.
 * Object mới mỗi lần đọc localStorage thay đổi → React phát hiện thay đổi
 * qua tham chiếu (nhưng useSyncExternalStore sẽ chỉ trigger re-render khi
 * snapshot khác snapshot trước qua Object.is).
 *
 * Vì vậy ta serialize thành string cache để Object.is hoạt động hiệu quả.
 */
let cachedKey = '';
let cachedSnapshot = createSnapshot();

function createSnapshot() {
  const user = getCurrentUser();
  const role = getActiveRole();
  const token = getToken();
  return {
    user,
    role,
    token,
    isAuthenticated: Boolean(token),
    displayName: getDisplayName(user),
  };
}

function getSnapshot() {
  // Chỉ tạo object mới khi dữ liệu THỰC SỰ đổi (so sánh qua key).
  // Tránh trigger re-render vô ích nếu mỗi lần đọc lại trả object mới.
  const key = `${getToken() || ''}|${getActiveRole() || ''}|${
    localStorage.getItem('user_info') || ''
  }`;
  if (key !== cachedKey) {
    cachedKey = key;
    cachedSnapshot = createSnapshot();
  }
  return cachedSnapshot;
}

function subscribe(callback) {
  return subscribeAuthChange(callback);
}

/**
 * Hook chính.
 * @returns {{
 *   user: object|null,
 *   role: string|null,
 *   token: string|null,
 *   isAuthenticated: boolean,
 *   displayName: string,
 * }}
 */
export const useAuth = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

useAuth;