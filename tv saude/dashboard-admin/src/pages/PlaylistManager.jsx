import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, getUploadsUrl } from '../config/api';
import { useNotification } from '../contexts/NotificationContext';



const PlaylistManager = () => {
  const { showSuccess, showError } = useNotification();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, playlist: null });
  const [formData, setFormData] = useState({
    nome: '',
    descricao: ''
  });

  // Carregar playlists
  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/playlists`);
      setPlaylists(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar playlists:', error);
      showError('Erro ao carregar playlists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  // Criar nova playlist
  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      showError('Nome da playlist é obrigatório');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/playlists`, formData);
      showSuccess('Playlist criada com sucesso!');
      setShowCreateModal(false);
      setFormData({ nome: '', descricao: '' });
      fetchPlaylists();
    } catch (error) {
      console.error('Erro ao criar playlist:', error);
      showError(error.response?.data?.error || 'Erro ao criar playlist');
    }
  };

  // Ativar/desativar playlist
  const togglePlaylistStatus = async (playlistId, currentStatus, playlist) => {
    try {
      await axios.put(`${API_BASE_URL}/playlists/${playlistId}`, {
        ...playlist,
        ativa: !currentStatus
      });
      
      showSuccess(
        !currentStatus 
          ? 'Playlist ativada com sucesso!' 
          : 'Playlist desativada com sucesso!'
      );
      fetchPlaylists();
    } catch (error) {
      console.error('Erro ao alterar status da playlist:', error);
      showError(error.response?.data?.error || 'Erro ao alterar status da playlist');
    }
  };

  // Deletar playlist
  const deletePlaylist = async (playlistId) => {
    try {
      await axios.delete(`${API_BASE_URL}/playlists/${playlistId}`);
      setPlaylists(playlists.filter(p => p.id !== playlistId));
      setDeleteModal({ show: false, playlist: null });
      showSuccess('Playlist deletada com sucesso');
    } catch (error) {
      console.error('Erro ao deletar playlist:', error);
      showError(error.response?.data?.error || 'Erro ao deletar playlist');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Playlists</h1>
          <p className="text-gray-600">Organize seus vídeos em sequências personalizadas</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          + Nova Playlist
        </button>
      </div>

      {/* Lista de Playlists */}
      <div className="card">
        {playlists.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma playlist criada
            </h3>
            <p className="text-gray-600 mb-6">
              Crie sua primeira playlist para organizar os vídeos
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Criar Primeira Playlist
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Descrição</th>
                  <th>Status</th>
                  <th>Criada em</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {playlists.map((playlist) => (
                  <tr key={playlist.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {playlist.nome}
                        </div>
                        {playlist.ativa && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Ativa
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      {playlist.descricao && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {playlist.descricao}
                        </div>
                      )}
                    </td>
                    <td className="table-cell">
                      <span className={playlist.ativa ? 'status-active' : 'status-inactive'}>
                        {playlist.ativa ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="table-cell text-sm text-gray-500">
                      {formatDate(playlist.data_criacao)}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-3">
                        <Link
                          to={`/playlists/${playlist.id}/edit`}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => togglePlaylistStatus(playlist.id, playlist.ativa, playlist)}
                          className={`text-sm font-medium ${
                            playlist.ativa
                              ? 'text-yellow-600 hover:text-yellow-900'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {playlist.ativa ? 'Desativar' : 'Ativar'}
                        </button>
                        <button
                          onClick={() => setDeleteModal({ show: true, playlist })}
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
        )}
      </div>

      {/* Modal de Criação */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900">
                Nova Playlist
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreatePlaylist}>
              <div className="modal-body space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Playlist *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Vídeos de Prevenção"
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
                    placeholder="Descreva o conteúdo desta playlist..."
                    className="input-field resize-none"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Criar Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deleteModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900">
                Confirmar Exclusão
              </h3>
              <button
                onClick={() => setDeleteModal({ show: false, playlist: null })}
                className="modal-close"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja deletar a playlist "{deleteModal.playlist?.nome}"?
                Esta ação não pode ser desfeita.
              </p>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setDeleteModal({ show: false, playlist: null })}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={() => deletePlaylist(deleteModal.playlist.id)}
                className="btn-danger"
              >
                Deletar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dicas */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-medium text-blue-900 mb-3">💡 Como usar Playlists</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Crie playlists para organizar vídeos por tema ou categoria</li>
          <li>• Apenas uma playlist pode estar ativa por vez</li>
          <li>• A playlist ativa será reproduzida na TV em sequência</li>
          <li>• Se nenhuma playlist estiver ativa, todos os vídeos ativos serão reproduzidos</li>
          <li>• Use a função "Editar" para adicionar/remover vídeos e reordenar</li>
        </ul>
      </div>
    </div>
  );
};

export default PlaylistManager;
