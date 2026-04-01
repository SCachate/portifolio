import axios from 'axios';

const api = axios.create({
  baseURL: 'https://supreme-acorn-gpxrgxr74v4hv45w-3000.app.github.dev' 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('user_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;