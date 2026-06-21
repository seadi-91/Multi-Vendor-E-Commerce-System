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

export default api;
