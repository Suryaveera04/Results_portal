import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const queueAPI = {
  join: () => api.post('/queue/join'),
  getStatus: (token) => api.get(`/queue/status/${token}`),
  leave: (token) => api.delete(`/queue/leave/${token}`)
};

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout')
};

export const resultAPI = {
  get: () => api.get('/result'),
  download: () => api.get('/result/download', { responseType: 'blob' }),
  email: () => api.post('/result/email')
};
