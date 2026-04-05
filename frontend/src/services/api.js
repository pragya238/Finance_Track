import axios from 'axios';

// Base URL — with CRA proxy set to localhost:5000, '/api' works in dev
const API = axios.create({
  baseURL: "https://finance-track-u836.onrender.com/api",
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: attach JWT token automatically ──────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: handle 401 globally ───────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth endpoints ───────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
};

// ─── Transaction endpoints ────────────────────────────────────
export const transactionAPI = {
  getAll: (params) => API.get('/transactions', { params }),
  getById: (id) => API.get(`/transactions/${id}`),
  create: (data) => API.post('/transactions', data),
  update: (id, data) => API.put(`/transactions/${id}`, data),
  delete: (id) => API.delete(`/transactions/${id}`),
};

// ─── Dashboard endpoints ──────────────────────────────────────
export const dashboardAPI = {
  getSummary: () => API.get('/dashboard'),
  getInsights: () => API.get('/dashboard/insights'),
};

export default API;
