import axios from 'axios';

const api = axios.create({
  baseURL: 'https://portifolio-api-b1ml.onrender.com' // Mantém a URL do seu back-end para as requisições normais
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 1. Interceptor de Requisição (Envia o token do Google para o seu Back-end)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('user_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Interceptor de Resposta (Renova o token direto na API do Google)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se o seu back-end rejeitar a requisição porque o token do Google expirou
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('google_refresh_token');
        
        if (!refreshToken) {
          throw new Error("Refresh token do Google não encontrado no localStorage.");
        }

        // Requisição DIRETA para o servidor do Google
        const response = await axios.post('https://oauth2.googleapis.com/token', {
          client_id: 'SEU_CLIENT_ID_DO_GOOGLE.apps.googleusercontent.com', // Substiua pelo seu Client ID do Google Cloud
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        });

        // O Google retorna o novo token sob o nome 'access_token'
        const newToken = response.data.access_token; 
        
        // Atualiza o token antigo no localStorage
        localStorage.setItem('user_token', newToken);

        processQueue(null, newToken);
        isRefreshing = false;

        // Refaz a chamada que tinha falhado com o seu back-end usando o token novo
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Se o refresh falhar, limpa os tokens para forçar o usuário a logar de novo
        localStorage.removeItem('user_token');
        localStorage.removeItem('google_refresh_token');
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;MRe