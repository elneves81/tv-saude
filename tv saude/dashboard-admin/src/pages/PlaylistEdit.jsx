import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, getUploadsUrl } from '../config/api';
import { useNotification } from '../contexts/NotificationContext';



const PlaylistEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  
  const [playlist, setPlaylist] = useState(null);
  const [allVideos, setAllVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    ativa: false
  });

  // Carregar dados da playlist e todos os vídeos
  const fetchData = async () => {
    try {
      setLoading(true);
      const [playlistResponse, videosResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/playlists/${id}`),
        axios.get(`${API_BASE_URL}/videos`)
      ]);
      
      const playlistData = playlistResponse.data;
      setPlaylist(playlistData);
      setFormData({
        nome: playlistData.nome,
        descricao: playlistData.descricao || '',
        ativa: playlistData.ativa
      });
      
      setAllVideos(videosResponse.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showError('Erro ao carregar dados da playlist');
      navigate('/playlists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Salvar alterações da playlist
  const handleSavePlaylist = async (e) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      showError('Nome da playlist é obrigatório');
      return;
    }

    try {
      setSaving(true);
      await axios.put(`${API_BASE_URL}/playlists/${id}`, formData);
      showSuccess('Playlist atualizada com sucesso!');
      fetchData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao salvar playlist:', error);
      showError(error.response?.data?.error || 'Erro ao salvar playlist');
    } finally {
      setSaving(false);
    }
  };

  // Adicionar vídeo à playlist
  const addVideoToPlaylist = async (videoId) => {
    try {
      const nextOrder = playlist.videos.length;
      await axios.post(`${API_BASE_URL}/playlists/${id}/videos`, {
        video_id: videoId,
        ordem: nextOrder
      });
      
      showSuccess('Vídeo adicionado à playlist!');
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      console.error('Erro ao adicionar vídeo:', error);
      showError(error.response?.data?.error || 'Erro ao adicionar vídeo');
    }
  };

  // Remover vídeo da playlist
  const removeVideoFromPlaylist = async (videoId) => {
    try {
      await axios.delete(`${API_BASE_URL}/playlists/${id}/videos/${videoId}`);
      showSuccess('Vídeo removido da playlist!');
      fetchData();
    } catch (error) {
      console.error('Erro ao remover vídeo:', error);
      showError(error.response?.data?.error || 'Erro ao remover vídeo');
    }
  };

  // Atualizar ordem dos vídeos
  const updateVideoOrder = async (newOrder) => {
    try {
      const videosWithOrder = newOrder.map((video, index) => ({
        video_id: video.id,
        ordem: index
      }));

      await axios.put(`${API_BASE_URL}/playlists/${id}/videos/ordem`, {
        videos: videosWithOrder
      });

      // Atualizar estado local
      setPlaylist(prev => ({
        ...prev,
        videos: newOrder
      }));
      
      showSuccess('Ordem dos vídeos atualizada!');
    } catch (error) {
      console.error('Erro ao atualizar ordem:', error);
      showError('Erro ao atualizar ordem dos vídeos');
    }
  };

  // Funções de Drag & Drop
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedItem === null || draggedItem === dropIndex) {
      setDraggedItem(null);
      return;
    }

    const newVideos = [...playlist.videos];
    const draggedVideo = newVideos[draggedItem];
    
    // Remover o item da posição original
    newVideos.splice(draggedItem, 1);
    
    // Inserir na nova posição
    newVideos.splice(dropIndex, 0, draggedVideo);
    
    // Atualizar ordem no servidor
    updateVideoOrder(newVideos);
    
    setDraggedItem(null);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Filtrar vídeos que não estão na playlist
  const availableVideos = allVideos.filter(video => 
    !playlist?.videos.some(pv => pv.id === video.id)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Playlist não encontrada
        </h3>
        <button
          onClick={() => navigate('/playlists')}
          className="btn-primary"
        >
          Voltar às Playlists
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/playlists')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-2"
          >
            ← Voltar às Playlists
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Editar Playlist</h1>
          <p className="text-gray-600">Configure os detalhes e organize os vídeos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações da Playlist */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações da Playlist</h2>
          
          <form onSubmit={handleSavePlaylist} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Playlist *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                rows={3}
                className="input-field resize-none"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="ativa"
                checked={formData.ativa}
                onChange={(e) => setFormData(prev => ({ ...prev, ativa: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="ativa" className="ml-2 block text-sm text-gray-900">
                Playlist ativa (será reproduzida na TV)
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full"
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>
        </div>

        {/* Estatísticas */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {playlist.videos.length}
              </div>
              <div className="text-sm text-blue-800">Vídeos</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.floor(playlist.videos.reduce((total, video) => total + (video.duracao || 0), 0) / 60)}min
              </div>
              <div className="text-sm text-green-800">Duração Total</div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <strong>Status:</strong> {playlist.ativa ? 'Ativa' : 'Inativa'}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              <strong>Criada em:</strong> {new Date(playlist.data_criacao).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>
      </div>

      {/* Vídeos da Playlist */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Vídeos da Playlist ({playlist.videos.length})
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
            disabled={availableVideos.length === 0}
          >
            + Adicionar Vídeo
          </button>
        </div>

        {playlist.videos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📹</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum vídeo na playlist
            </h3>
            <p className="text-gray-600 mb-4">
              Adicione vídeos para começar a organizar sua playlist
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
              disabled={availableVideos.length === 0}
            >
              Adicionar Primeiro Vídeo
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-sm text-gray-600 mb-4">
              💡 Arraste e solte os vídeos para reordenar a sequência de reprodução
            </div>
            
            {playlist.videos.map((video, index) => (
              <div
                key={video.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`flex items-center justify-between p-4 bg-white border rounded-lg hover:bg-gray-50 cursor-move transition-colors ${
                  draggedItem === index ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {video.titulo}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        video.tipo === 'youtube' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {video.tipo === 'youtube' ? 'YouTube' : 'Local'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      {video.categoria && (
                        <span>{video.categoria}</span>
                      )}
                      <span>Duração: {formatDuration(video.duracao)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 cursor-move">⋮⋮</span>
                  <button
                    onClick={() => removeVideoFromPlaylist(video.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para Adicionar Vídeos */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-4xl">
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900">
                Adicionar Vídeos à Playlist
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {availableVideos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    Todos os vídeos já estão nesta playlist ou não há vídeos disponíveis.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {availableVideos.map((video) => (
                    <div
                      key={video.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {video.titulo}
                          </h4>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            video.tipo === 'youtube' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {video.tipo === 'youtube' ? 'YouTube' : 'Local'}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          {video.categoria && (
                            <span>{video.categoria}</span>
                          )}
                          <span>Duração: {formatDuration(video.duracao)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => addVideoToPlaylist(video.id)}
                        className="btn-primary text-sm"
                      >
                        Adicionar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-secondary"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistEdit;
