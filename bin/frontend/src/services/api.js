import axios from 'axios';

// Get base URL from env with fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for unified error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);

export const StudentService = {
  getAll: () => api.get('/students'),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  markLeft: (id) => api.put(`/students/${id}/leave`),
  reactivate: (id) => api.put(`/students/${id}/reactivate`),
  getRecent: () => api.get('/students/recent'),
};

export const StudyHallService = {
  getAll: () => api.get('/study-halls'),
  getById: (id) => api.get(`/study-halls/${id}`),
  create: (data) => api.post('/study-halls', data),
  update: (id, data) => api.put(`/study-halls/${id}`, data),
  delete: (id) => api.delete(`/study-halls/${id}`),
};

export const DashboardService = {
  getStats: () => api.get('/dashboard'),
};

export const FeeService = {
  calculateMonthly: () => api.post('/fees/calculate-monthly'),
  getUpcoming: () => api.get('/upcoming-fees'),
};

export const ReportService = {
  getFeeCollection: () => api.get('/reports/fee-collection'),
};

export default api;
