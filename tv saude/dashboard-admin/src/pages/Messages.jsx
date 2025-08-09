import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import api from '../config/api';

const Messages = () => {
  const { showSuccess, showError } = useNotification();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    conteudo: '',
    tipo: 'info',
    prioridade: 1,
    data_fim: ''
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get('/mensagens/admin');
      setMessages(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      showError('Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titulo.trim() || !formData.conteudo.trim()) {
      showError('Título e conteúdo são obrigatórios');
      return;
    }

    try {
      const data = {
        titulo: formData.titulo,
        conteudo: formData.conteudo,
        tipo: formData.tipo,
        prioridade: formData.prioridade,
        data_expiracao: formData.data_fim || null
      };

      if (editingMessage) {
        await api.put(`/mensagens/${editingMessage.id}`, {
          ...data,
          ativo: editingMessage.ativo
        });
        showSuccess('Mensagem atualizada com sucesso!');
      } else {
        await api.post('/mensagens', data);
        showSuccess('Mensagem criada com sucesso!');
      }

      resetForm();
      fetchMessages();
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
      showError('Erro ao salvar mensagem');
    }
  };

  const handleEdit = (message) => {
    setEditingMessage(message);
    setFormData({
      titulo: message.titulo,
      conteudo: message.conteudo,
      tipo: message.tipo,
      prioridade: message.prioridade,
      data_fim: message.data_fim ? message.data_fim.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar esta mensagem?')) {
      return;
    }

    try {
      await api.delete(`/mensagens/${id}`);
      showSuccess('Mensagem deletada com sucesso!');
      fetchMessages();
    } catch (error) {
      console.error('Erro ao deletar mensagem:', error);
      showError('Erro ao deletar mensagem');
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/mensagens/${id}/toggle`);
      showSuccess('Status da mensagem alterado!');
      fetchMessages();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      showError('Erro ao alterar status da mensagem');
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      conteudo: '',
      tipo: 'info',
      prioridade: 1,
      data_fim: ''
    });
    setEditingMessage(null);
    setShowForm(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sem prazo';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (tipo) => {
    switch (tipo) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'urgent': return '🚨';
      default: return 'ℹ️';
    }
  };

  const getTypeColor = (tipo) => {
    switch (tipo) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-red-200 text-red-900';
      default: return 'bg-blue-100 text-blue-800';
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mensagens em Tempo Real</h1>
          <p className="text-gray-600">Gerencie mensagens que aparecem nas TVs</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          📢 Nova Mensagem
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {editingMessage ? 'Editar Mensagem' : 'Nova Mensagem'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="input"
                  placeholder="Título da mensagem"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Conteúdo *
                </label>
                <textarea
                  value={formData.conteudo}
                  onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                  className="input"
                  rows="3"
                  placeholder="Conteúdo da mensagem"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Tipo
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="input"
                  >
                    <option value="info">ℹ️ Informação</option>
                    <option value="success">✅ Sucesso</option>
                    <option value="warning">⚠️ Aviso</option>
                    <option value="error">❌ Erro</option>
                    <option value="urgent">🚨 Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Prioridade
                  </label>
                  <select
                    value={formData.prioridade}
                    onChange={(e) => setFormData({ ...formData, prioridade: parseInt(e.target.value) })}
                    className="input"
                  >
                    <option value="1">1 - Baixa</option>
                    <option value="2">2 - Normal</option>
                    <option value="3">3 - Alta</option>
                    <option value="4">4 - Crítica</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Data de Expiração (opcional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.data_fim}
                  onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                  className="input"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Deixe em branco para mensagem permanente
                </p>
              </div>

              <div className="flex pt-4 space-x-3">
                <button
                  type="submit"
                  className="flex-1 btn btn-primary"
                >
                  {editingMessage ? 'Atualizar' : 'Criar'} Mensagem
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Mensagens ({messages.length})
          </h2>
        </div>

        {messages.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <div className="mb-2 text-4xl">📢</div>
            <p>Nenhuma mensagem criada</p>
            <p className="text-sm">Crie a primeira mensagem para os dispositivos</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-lg border-l-4 ${
                  message.ativa 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2 space-x-2">
                      <span className="text-lg">{getTypeIcon(message.tipo)}</span>
                      <h3 className="font-semibold text-gray-900">
                        {message.titulo}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(message.tipo)}`}>
                        {message.tipo}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">
                        Prioridade {message.prioridade}
                      </span>
                    </div>
                    
                    <p className="mb-2 text-gray-700">{message.conteudo}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>
                        📅 Criada: {formatDate(message.data_criacao)}
                      </span>
                      {message.data_fim && (
                        <span>
                          ⏰ Expira: {formatDate(message.data_fim)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center ml-4 space-x-2">
                    <button
                      onClick={() => handleToggle(message.id)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        message.ativa
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {message.ativa ? '🟢 Ativa' : '⚫ Inativa'}
                    </button>
                    
                    <button
                      onClick={() => handleEdit(message)}
                      className="p-2 text-blue-600 rounded hover:bg-blue-100"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    
                    <button
                      onClick={() => handleDelete(message.id)}
                      className="p-2 text-red-600 rounded hover:bg-red-100"
                      title="Deletar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="border-blue-200 card bg-blue-50">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">💡</div>
          <div>
            <h3 className="mb-2 font-semibold text-blue-900">Como funciona</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Mensagens ativas aparecem em todas as TVs da rede</li>
              <li>• Prioridade alta aparece primeiro</li>
              <li>• Mensagens com data de expiração são removidas automaticamente</li>
              <li>• Use tipos diferentes para cores e ícones específicos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
