import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
  withCredentials: true,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh access token on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'}/auth/refresh`,
          { refreshToken },
          { withCredentials: true }
        );
        const newAccess = typeof data.accessToken === 'string' ? data.accessToken : '';
        const newRefresh = typeof data.refreshToken === 'string' ? data.refreshToken : '';
        if (!newAccess || !newRefresh) throw new Error('Invalid token response');
        localStorage.setItem('accessToken', newAccess);
        localStorage.setItem('refreshToken', newRefresh);
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
