import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Injetar token JWT automaticamente
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('ufra_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Tratar respostas e erros globalmente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const message = error.response?.data?.message || error.message || 'Erro inesperado';

    // Token expirado → redirecionar para login
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED') {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ufra_token');
        localStorage.removeItem('ufra_user');
        window.location.href = '/login?expired=1';
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
