import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
});

export function setAuthToken(token?: string) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('admin_token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('admin_token');
  }
}

export function loadAuthTokenFromStorage() {
  const token = localStorage.getItem('admin_token');
  if (token) setAuthToken(token);
  return token;
}

export function hasAuthToken() {
  return Boolean(localStorage.getItem('admin_token'));
}

// Interceptor global: si 401 -> on nettoie le token et on redirige vers /admin/login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      setAuthToken(undefined);
      if (typeof window !== 'undefined' && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);
