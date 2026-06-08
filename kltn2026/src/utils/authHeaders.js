import { getToken } from '../usecases/authService';

/** Header JSON + Bearer — đọc token một lần mỗi lần gọi. */
export const getJsonAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/** Chỉ Bearer (upload FormData, không set Content-Type). */
export const getBearerAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
