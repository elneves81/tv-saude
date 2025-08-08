import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNotification } from '../contexts/NotificationContext';

const API_BASE_URL = 'http://localhost:3001/api';

const VideoList = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, inactive
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, video: null });
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/videos`);
      setVideos(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar vídeos:', error);
      showError('Erro ao carregar vídeos');
    } finally {
      setLoading(false);
    }
  };

  const toggleVideoStatus = async (videoId, currentStatus) => {
    try {
      const video = videos.find(v => v.id === videoId);
      await axios.put(`${API_BASE_URL}/videos/${videoId}`, {
        ...video,
        ativo: !currentStatus
      });
      
      setVideos(videos.map(v => 
        v.id === videoId ? { ...v, ativo: !currentStatus } : v
      ));
      
      showSuccess(`Vídeo ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`);
    } catch (error) {
      console.error('Erro ao alterar status do vídeo:', error);
      showError('Erro ao alterar status do vídeo');
    }
  };

  const deleteVideo = async (videoId) => {
    try {
      await axios.delete(`${API_BASE_URL}/videos/${videoId}`);
      setVideos(videos.filter(v => v.id !== videoId));
      setDeleteModal({ show: false, video: null });
      showSuccess('Vídeo deletado com sucesso');
    } catch (error) {
      console.error('Erro ao deletar vídeo:', error);
      showError('Erro ao deletar vídeo');
    }
  };

  const filteredVideos = videos.filter(video => {
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && video.ativo) || 
      (filter === 'inactive' && !video.ativo);
    
    const matchesSearch = video.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (video.categoria && video.categoria.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Vídeos</h1>
          <p className="text-gray-600">Lista de todos os vídeos do sistema</p>
        </div>
        <Link
          to="/upload"
          className="mt-4 sm:mt-0 btn-primary inline-flex items-center"
        >
          <span className="mr-2">📤</span>
          Enviar Novo Vídeo
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Buscar por título ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Filter buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todos ({videos.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'active' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Ativos ({videos.filter(v => v.ativo).length})
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'inactive' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Inativos ({videos.filter(v => !v.ativo).length})
            </button>
          </div>
        </div>
      </div>

      {/* Videos Table */}
      <div className="card overflow-hidden">
        {filteredVideos.length > 0 ? (
          <div className="table-responsive">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Vídeo</th>
                  <th className="table-header">Categoria</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Data</th>
                  <th className="table-header">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVideos.map((video) => (
                  <tr key={video.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-20">
                          <div className="h-12 w-20 bg-gray-300 rounded flex items-center justify-center">
                            <span className="text-gray-500">🎥</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {video.titulo}
                          </div>
                          {video.descricao && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {video.descricao}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      {video.categoria && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {video.categoria}
                        </span>
                      )}
                    </td>
                    <td className="table-cell">
                      <span className={video.ativo ? 'status-active' : 'status-inactive'}>
                        {video.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="table-cell text-sm text-gray-500">
                      {formatDate(video.data_criacao)}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/edit/${video.id}`}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => toggleVideoStatus(video.id, video.ativo)}
                          className={`text-sm font-medium ${
                            video.ativo 
                              ? 'text-yellow-600 hover:text-yellow-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {video.ativo ? 'Desativar' : 'Ativar'}
                        </button>
                        <button
                          onClick={() => setDeleteModal({ show: true, video })}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Deletar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📹</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filter !== 'all' ? 'Nenhum vídeo encontrado' : 'Nenhum vídeo cadastrado'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filter !== 'all' 
                ? 'Tente ajustar os filtros de busca' 
                : 'Comece enviando seu primeiro vídeo educativo'
              }
            </p>
            {!searchTerm && filter === 'all' && (
              <Link to="/upload" className="btn-primary">
                Enviar Primeiro Vídeo
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirmar Exclusão
            </h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja deletar o vídeo "{deleteModal.video?.titulo}"? 
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModal({ show: false, video: null })}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteVideo(deleteModal.video.id)}
                className="btn-danger"
              >
                Deletar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoList;
