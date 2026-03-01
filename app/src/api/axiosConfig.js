import axios from 'axios';

const api = axios.create({
  baseURL: 'https://sua-api.com' // Sua URL base
});

// "Pedágio": Antes de qualquer requisição, ele checa se tem token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('user_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;