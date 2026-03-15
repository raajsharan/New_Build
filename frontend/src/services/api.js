import axios from 'axios';

// Use relative path for API calls - works with nginx proxy
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Service
export const authService = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  register: (email, password, name) => apiClient.post('/auth/register', { email, password, name }),
};

// Asset Service
export const assetService = {
  getAssets: (params) => apiClient.get('/assets', { params }),
  getAssetById: (id) => apiClient.get(`/assets/${id}`),
  createAsset: (data) => apiClient.post('/assets', data),
  updateAsset: (id, data) => apiClient.put(`/assets/${id}`, data),
  deleteAsset: (id) => apiClient.delete(`/assets/${id}`),
  bulkImportAssets: (data) => apiClient.post('/assets/bulk/import', data),
};

// Config Service
export const configService = {
  getTables: () => apiClient.get('/config'),
  getConfigData: (table) => apiClient.get(`/config/${table}`),
  addConfigData: (table, data) => apiClient.post(`/config/${table}`, data),
  updateConfigData: (table, id, data) => apiClient.put(`/config/${table}/${id}`, data),
  deleteConfigData: (table, id) => apiClient.delete(`/config/${table}/${id}`),
};

// Dashboard Service
export const dashboardService = {
  getSummary: () => apiClient.get('/dashboard/summary'),
};

// User Service
export const userService = {
  getUsers: () => apiClient.get('/users'),
  updateUserPermission: (id, data) => apiClient.put(`/users/${id}/permission`, data),
  updateUserPageVisibility: (id, data) => apiClient.put(`/users/${id}/page-visibility`, data),
};

// Settings Service
export const settingsService = {
  getSettings: () => apiClient.get('/settings'),
  updateSetting: (data) => apiClient.post('/settings/update', data),
  updateDatabaseConfig: (data) => apiClient.post('/settings/database', data),
  updateCompanySettings: (data) => apiClient.post('/settings/company', data),
  getPasswordVisibility: () => apiClient.get('/settings/password-visibility'),
  updatePasswordVisibility: (data) => apiClient.post('/settings/password-visibility', data),
};

export default apiClient;
