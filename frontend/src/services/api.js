import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

let refreshRequest = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {};
    const url = original.url || '';
    const isAuthCall = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh-token') || url.includes('/auth/reset-password');
    if (error.response?.status === 401 && !original._retry && !isAuthCall) {
      original._retry = true;
      try {
        refreshRequest = refreshRequest || api.post('/auth/refresh-token');
        await refreshRequest;
        refreshRequest = null;
        return api(original);
      } catch (refreshError) {
        refreshRequest = null;
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export function errorMessage(error, fallback = 'Something went wrong') {
  return error?.response?.data?.message || fallback;
}
