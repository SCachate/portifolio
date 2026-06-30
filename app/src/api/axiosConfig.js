import axios from 'axios';

const api = axios.create({
  baseURL: 'https://portifolio-api-b1ml.onrender.com' // Sua URL base
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('user_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
