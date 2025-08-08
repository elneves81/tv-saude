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

// Função para obter URL de uploads
export const getUploadsUrl = (filename) => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return `http://localhost:3001/uploads/${filename}`;
  }
  return `http://${window.location.hostname}:3001/uploads/${filename}`;
};

export default API_BASE_URL;
