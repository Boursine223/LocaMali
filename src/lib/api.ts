import axios from 'axios';

// In production (Vercel), use same-origin so frontend calls /api on the same domain
// In development, use VITE_API_URL if provided, else default localhost:4000
const API_BASE = import.meta.env.PROD
  ? ''
  : (import.meta.env.VITE_API_URL || 'http://localhost:4000');

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
});

// Interceptor global: si 401 -> on nettoie le token et on redirige vers /admin/login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);
