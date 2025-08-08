import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../contexts/NotificationContext';

const API_BASE_URL = 'http://localhost:3001/api';

const Settings = () => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalVideos: 0,
    videosAtivos: 0,
    espacoUsado: 0,
    ultimaAtualizacao: null
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/videos`);
      const videos = response.data || [];
      
      const videosAtivos = videos.filter(v => v.ativo).length;
      const espacoUsado = videos.reduce((total, video) => total + (video.tamanho || 0), 0);
      const ultimaAtualizacao = videos.length > 0 
        ? Math.max(...videos.map(v => new Date(v.data_criacao).getTime()))
        : null;

      setStats({
        totalVideos: videos.length,
        videosAtivos,
        espacoUsado,
        ultimaAtualizacao: ultimaAtualizacao ? new Date(ultimaAtualizacao) : null
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const testConnection = async () => {
    try {
      setLoading(true);
      await axios.get(`${API_BASE_URL}/videos`);
      showSuccess('Conexão com o servidor OK!');
    } catch (error) {
      showError('Erro na conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const clearCache = () => {
    // Simular limpeza de cache
    localStorage.clear();
    sessionStorage.clear();
    showSuccess('Cache limpo com sucesso!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Configurações e informações do sistema</p>
      </div>

      {/* System Stats */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas do Sistema</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.totalVideos}</div>
            <div className="text-sm text-blue-800">Total de Vídeos</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.videosAtivos}</div>
            <div className="text-sm text-green-800">Vídeos Ativos</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {formatFileSize(stats.espacoUsado)}
            </div>
            <div className="text-sm text-purple-800">Espaço Usado</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-sm font-bold text-orange-600">
              {formatDate(stats.ultimaAtualizacao)}
            </div>
            <div className="text-sm text-orange-800">Última Atualização</div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações do Sistema</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Componentes</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Backend API:</span>
                <span className="text-gray-900">http://localhost:3001</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interface TV:</span>
                <span className="text-gray-900">http://localhost:3000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dashboard Admin:</span>
                <span className="text-gray-900">http://localhost:3002</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Banco de Dados:</span>
                <span className="text-gray-900">SQLite Local</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Tecnologias</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Frontend:</span>
                <span className="text-gray-900">React + Vite</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Backend:</span>
                <span className="text-gray-900">Node.js + Express</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estilização:</span>
                <span className="text-gray-900">Tailwind CSS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Upload:</span>
                <span className="text-gray-900">Multer</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações do Sistema</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={testConnection}
            disabled={loading}
            className="flex items-center justify-center space-x-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            <span className="text-2xl">🔗</span>
            <div className="text-left">
              <div className="font-medium text-blue-900">Testar Conexão</div>
              <div className="text-sm text-blue-700">Verificar comunicação com API</div>
            </div>
          </button>
          
          <button
            onClick={clearCache}
            className="flex items-center justify-center space-x-2 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-200"
          >
            <span className="text-2xl">🧹</span>
            <div className="text-left">
              <div className="font-medium text-orange-900">Limpar Cache</div>
              <div className="text-sm text-orange-700">Remover dados temporários</div>
            </div>
          </button>
          
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center justify-center space-x-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            <span className="text-2xl">🔄</span>
            <div className="text-left">
              <div className="font-medium text-green-900">Atualizar Stats</div>
              <div className="text-sm text-green-700">Recarregar estatísticas</div>
            </div>
          </button>
          
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200"
          >
            <span className="text-2xl">📺</span>
            <div className="text-left">
              <div className="font-medium text-purple-900">Abrir TV</div>
              <div className="text-sm text-purple-700">Visualizar interface da TV</div>
            </div>
          </a>
        </div>
      </div>

      {/* Configuration Options */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Configurações de Exibição</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Reprodução Automática</h3>
              <p className="text-sm text-gray-600">Vídeos iniciam automaticamente na TV</p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Loop Contínuo</h3>
              <p className="text-sm text-gray-600">Repetir playlist infinitamente</p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Mostrar Informações</h3>
              <p className="text-sm text-gray-600">Exibir título e descrição dos vídeos</p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <div className="text-center">
          <div className="text-4xl mb-4">🏥</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">TV Saúde Guarapuava</h2>
          <p className="text-gray-600 mb-4">
            Sistema de TV educativa para postos de saúde
          </p>
          <div className="text-sm text-gray-500">
            <p>Versão 1.0.0</p>
            <p>Desenvolvido para Secretaria de Saúde de Guarapuava</p>
            <p className="mt-2">© 2025 - Sistema interno de uso exclusivo</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
