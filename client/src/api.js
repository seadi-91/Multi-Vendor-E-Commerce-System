import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

// ─── REQUEST INTERCEPTOR ─────────────────────────────────────────────────────
// Attach the JWT token to every outgoing API request.
// The backend ONLY checks req.headers.authorization — cookies are NOT used.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR ────────────────────────────────────────────────────
// If a 401 is received on a protected route, the token is expired or invalid.
// Clear all auth state and send user to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRequest = error.config?.url?.includes('/auth/');
      const isLoginPage = window.location.pathname === '/login';

      if (!isAuthRequest && !isLoginPage) {
        // Wipe ALL auth state so the app starts fresh
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage'); // Zustand persist key
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  forgotPassword: (email) => axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/forgot-password`, { email }, { withCredentials: false }),
  resetPassword: (data) => axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/reset-password`, data, { withCredentials: false }),
};

// Customer APIs
export const customerAPI = {
  getProfile: () => api.get('/customer/profile'),
  updateProfile: (data) => api.put('/customer/profile', data),
  updatePhone: (data) => api.put('/customer/phone', data),
  changePassword: (data) => api.put('/customer/password', data),
  deleteAccount: () => api.delete('/customer/account'),
};

export default api;
