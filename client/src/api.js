import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

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
