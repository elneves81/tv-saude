import axios from 'axios';

// Configuração SEM PROXY - Conexões diretas apenas
// Proxy removido para resolver problemas de conectividade

// Configuração dinâmica da API baseada no ambiente
const getApiBaseUrl = () => {
  // SOLUÇÃO: Primeiro tentar localhost, depois IP da rede
  
  // Durante desenvolvimento, sempre usar localhost primeiro
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001/api';
  }
  
  // Se já estamos acessando via IP da rede, usar o mesmo IP para a API
  const hostname = window.location.hostname;
  return `http://${hostname}:3001/api`;
};

export const API_BASE_URL = getApiBaseUrl();

// Criar instância do axios SEM PROXY
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  // REMOVIDO PROXY - Conexões diretas apenas
  proxy: false, // Garantir que não usa proxy
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log para debug (pode ser removido em produção)
    console.log('🔗 API Request (SEM PROXY):', config.baseURL + config.url);
    
    return config;
  },
  (error) => {
    console.error('❌ Erro na requisição:', error);
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
  // SOLUÇÃO PARA FIREWALL: Sempre usar IP da rede
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // IP da rede detectado: 10.0.50.79
    return `http://10.0.50.79:3001/uploads/${filename}`;
  }
  return `http://${hostname}:3001/uploads/${filename}`;
};

export default api;
