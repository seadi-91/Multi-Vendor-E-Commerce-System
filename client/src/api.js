import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
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
// If a 404 with USER_NOT_FOUND/FARMER_NOT_FOUND code is received, the account was deleted.
// Clear all auth state and send user to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const errorCode = error.response?.data?.code;
    const errorMessage = error.response?.data?.message || error.response?.data?.error;
    const isAuthRequest = error.config?.url?.includes('/auth/');
    const isLoginPage = window.location.pathname === '/login';

    // Handle 401 Unauthorized - token expired, invalid, or user deleted
    if (status === 401 && !isAuthRequest && !isLoginPage) {
      console.log('401 Unauthorized - clearing auth state and redirecting to login');

      // Check if it's due to user deletion
      const isUserDeleted = errorMessage?.includes('user not found') ||
        errorMessage?.includes('Not authorized, user not found');

      // Clear all auth state
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('auth-storage'); // Zustand persist key

      // Show appropriate message
      if (isUserDeleted) {
        alert('Your account has been removed by an administrator. You will be redirected to the login page.');
      }

      window.location.href = '/login';
    }

    // Handle 404 with account deletion codes - user/farmer was deleted
    if (
      status === 404 &&
      (errorCode === 'USER_NOT_FOUND' || errorCode === 'FARMER_NOT_FOUND') &&
      !isAuthRequest &&
      !isLoginPage
    ) {
      console.log('Account deleted - clearing auth state and redirecting to login');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('auth-storage'); // Zustand persist key

      // Show a message to the user about account deletion
      alert('Your account has been removed by an administrator. You will be redirected to the login page.');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/forgot-password`, { email }, { withCredentials: false }),
  resetPassword: (data) => axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/reset-password`, data, { withCredentials: false }),
};

// Customer APIs
export const customerAPI = {
  getProfile: () => api.get('/customer/profile'),
  updateProfile: (data) => api.put('/customer/profile', data),
  updatePhone: (data) => api.put('/customer/phone', data),
  changePassword: (data) => api.put('/customer/password', data),
  getSettings: () => api.get('/customer/settings'),
  updateSettings: (data) => api.put('/customer/settings', data),
  uploadProfileImage: (imageUrl) => api.post('/customer/settings/profile-image', { imageUrl }),
  getAddresses: () => api.get('/customer/addresses').catch((error) => {
    if (error.response?.status === 404) {
      return { data: { addresses: [] } };
    }
    throw error;
  }),
  addAddress: (address) => api.post('/customer/addresses', address),
  updateAddress: (id, address) => api.put(`/customer/addresses/${id}`, address),
  deleteAddress: (id) => api.delete(`/customer/addresses/${id}`),
  getSessions: () => api.get('/customer/sessions'),
  revokeSession: (sessionId) => api.delete(`/customer/sessions/${sessionId}`),
  deactivateAccount: () => api.post('/customer/deactivate'),
  deleteAccount: () => api.delete('/customer/account'),
};

export default api;
