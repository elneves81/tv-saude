import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalVideos: 0,
    videosAtivos: 0,
    videosInativos: 0,
    categorias: 0
  });
  const [recentVideos, setRecentVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar todos os vídeos para calcular estatísticas
      const videosResponse = await axios.get(`${API_BASE_URL}/videos`);
      const allVideos = videosResponse.data || [];
      
      // Buscar categorias
      const categoriasResponse = await axios.get(`${API_BASE_URL}/categorias`);
      const categorias = categoriasResponse.data || [];
      
      // Calcular estatísticas
      const videosAtivos = allVideos.filter(video => video.ativo).length;
      const videosInativos = allVideos.length - videosAtivos;
      
      setStats({
        totalVideos: allVideos.length,
        videosAtivos,
        videosInativos,
        categorias: categorias.length
      });
      
      // Pegar os 5 vídeos mais recentes
      const recent = allVideos
        .sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao))
        .slice(0, 5);
      
      setRecentVideos(recent);
      
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StatCard = ({ title, value, icon, color, description }) => (
    <div className="card">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} mr-4`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do sistema TV Saúde</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Vídeos"
          value={stats.totalVideos}
          icon="🎥"
          color="bg-blue-100"
          description="Todos os vídeos no sistema"
        />
        <StatCard
          title="Vídeos Ativos"
          value={stats.videosAtivos}
          icon="✅"
          color="bg-green-100"
          description="Sendo exibidos na TV"
        />
        <StatCard
          title="Vídeos Inativos"
          value={stats.videosInativos}
          icon="⏸️"
          color="bg-yellow-100"
          description="Não estão sendo exibidos"
        />
        <StatCard
          title="Categorias"
          value={stats.categorias}
          icon="📂"
          color="bg-purple-100"
          description="Diferentes categorias"
        />
      </div>

      {/* Recent Videos and Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Videos */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Vídeos Recentes</h2>
            <a href="/videos" className="text-sm font-medium text-blue-600 hover:text-blue-800">
              Ver todos →
            </a>
          </div>
          
          {recentVideos.length > 0 ? (
            <div className="space-y-3">
              {recentVideos.map((video) => (
                <div key={video.id} className="flex items-center p-3 space-x-3 rounded-lg bg-gray-50">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-8 bg-gray-300 rounded">
                      <span className="text-xs">🎥</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {video.titulo}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(video.data_criacao)}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      video.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {video.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <span className="block mb-2 text-4xl">📹</span>
              <p>Nenhum vídeo encontrado</p>
              <p className="text-sm">Faça upload do primeiro vídeo</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Ações Rápidas</h2>
          
          <div className="space-y-3">
            <a
              href="/upload"
              className="flex items-center p-4 space-x-3 transition-colors duration-200 rounded-lg bg-blue-50 hover:bg-blue-100"
            >
              <div className="flex-shrink-0">
                <span className="text-2xl">📤</span>
              </div>
              <div>
                <p className="font-medium text-blue-900">Enviar Novo Vídeo</p>
                <p className="text-sm text-blue-700">Adicionar conteúdo educativo</p>
              </div>
            </a>
            
            <a
              href="/videos"
              className="flex items-center p-4 space-x-3 transition-colors duration-200 rounded-lg bg-green-50 hover:bg-green-100"
            >
              <div className="flex-shrink-0">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <p className="font-medium text-green-900">Gerenciar Vídeos</p>
                <p className="text-sm text-green-700">Editar, ativar ou desativar</p>
              </div>
            </a>
            
            <div className="flex items-center p-4 space-x-3 rounded-lg bg-purple-50">
              <div className="flex-shrink-0">
                <span className="text-2xl">📺</span>
              </div>
              <div>
                <p className="font-medium text-purple-900">Visualizar TV</p>
                <p className="text-sm text-purple-700">
                  <a 
                    href="http://localhost:3003"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Abrir interface da TV →
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="card">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Status do Sistema</h2>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="font-medium text-gray-900">API Backend</p>
              <p className="text-sm text-gray-500">Funcionando normalmente</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="font-medium text-gray-900">Interface TV</p>
              <p className="text-sm text-gray-500">Porta 3003</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="font-medium text-gray-900">Dashboard Admin</p>
              <p className="text-sm text-gray-500">Porta 3002</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
