import axios from 'axios';

// Configuração dinâmica da API baseada no ambiente
const getApiBaseUrl = () => {
  // Se estamos em desenvolvimento local
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001/api';
  }
  
  // Se estamos acessando via IP da rede, usar o mesmo IP para a API
  return `http://${window.location.hostname}:3001/api`;
};

export const API_BASE_URL = getApiBaseUrl();

// Criar instância do axios configurada
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Função para obter URL de uploads
export const getUploadsUrl = (filename) => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return `http://localhost:3001/uploads/${filename}`;
  }
  return `http://${window.location.hostname}:3001/uploads/${filename}`;
};

export default api;
