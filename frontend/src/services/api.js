import axios from 'axios';

const configuredUrl = process.env.REACT_APP_API_URL || 'https://finance-track-u836.onrender.com/api';
const API_BASE_URL = configuredUrl.replace(/\\/$/, '').endsWith('/api')
  ? configuredUrl.replace(/\\/$/, '')
  : `${configuredUrl.replace(/\\/$/, '')}/api`;

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const isAuthRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

    // A bad password should stay on the login page so the form can show the API message.
    if (status === 401 && !isAuthRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('finance:session-expired'));
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
};

export const transactionAPI = {
  getAll: (params) => API.get('/transactions', { params }),
  getById: (id) => API.get(`/transactions/${id}`),
  create: (data) => API.post('/transactions', data),
  update: (id, data) => API.put(`/transactions/${id}`, data),
  delete: (id) => API.delete(`/transactions/${id}`),
};

export const dashboardAPI = {
  getSummary: () => API.get('/dashboard'),
  getInsights: () => API.get('/dashboard/insights'),
};

export default API;
