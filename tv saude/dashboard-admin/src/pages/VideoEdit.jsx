import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useNotification } from '../contexts/NotificationContext';

const API_BASE_URL = 'http://localhost:3001/api';

const VideoEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [video, setVideo] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoria: '',
    ordem: 0,
    ativo: true
  });

  const categorias = [
    'Prevenção',
    'Vacinação',
    'Alimentação Saudável',
    'Exercícios',
    'Saúde Mental',
    'Higiene',
    'Primeiros Socorros',
    'Doenças Crônicas',
    'Saúde da Mulher',
    'Saúde do Idoso',
    'Saúde Infantil',
    'Geral'
  ];

  useEffect(() => {
    fetchVideo();
  }, [id]);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/videos/${id}`);
      const videoData = response.data;
      
      setVideo(videoData);
      setFormData({
        titulo: videoData.titulo || '',
        descricao: videoData.descricao || '',
        categoria: videoData.categoria || '',
        ordem: videoData.ordem || 0,
        ativo: videoData.ativo !== undefined ? videoData.ativo : true
      });
    } catch (error) {
      console.error('Erro ao buscar vídeo:', error);
      showError('Erro ao carregar dados do vídeo');
      navigate('/videos');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titulo.trim()) {
      showError('Por favor, informe o título do vídeo');
      return;
    }

    setSaving(true);

    try {
      await axios.put(`${API_BASE_URL}/videos/${id}`, {
        ...video,
        ...formData,
        ordem: parseInt(formData.ordem) || 0
      });

      showSuccess('Vídeo atualizado com sucesso!');
      navigate('/videos');
      
    } catch (error) {
      console.error('Erro ao atualizar vídeo:', error);
      showError(error.response?.data?.error || 'Erro ao atualizar vídeo');
    } finally {
      setSaving(false);
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

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl mb-4 block">❌</span>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Vídeo não encontrado
        </h3>
        <p className="text-gray-500 mb-4">
          O vídeo que você está tentando editar não existe.
        </p>
        <button
          onClick={() => navigate('/videos')}
          className="btn-primary"
        >
          Voltar para Lista
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar Vídeo</h1>
        <p className="text-gray-600">Altere as informações do vídeo</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Video Preview */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview do Vídeo</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Video Player */}
            <div>
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <video
                  controls
                  className="w-full h-full object-cover"
                  poster="/api/placeholder/640/360"
                >
                  <source 
                    src={`http://localhost:3001/uploads/${video.arquivo}`} 
                    type="video/mp4" 
                  />
                  Seu navegador não suporta reprodução de vídeo.
                </video>
              </div>
            </div>

            {/* Video Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Arquivo</h3>
                <p className="text-sm text-gray-900">{video.arquivo}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700">Tamanho</h3>
                <p className="text-sm text-gray-900">{formatFileSize(video.tamanho)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700">Data de Upload</h3>
                <p className="text-sm text-gray-900">{formatDate(video.data_criacao)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700">Status Atual</h3>
                <span className={video.ativo ? 'status-active' : 'status-inactive'}>
                  {video.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações do Vídeo</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Título */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                placeholder="Ex: Como lavar as mãos corretamente"
                className="input-field"
                required
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map(categoria => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>

            {/* Ordem */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordem de Exibição
              </label>
              <input
                type="number"
                name="ordem"
                value={formData.ordem}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                Menor número = maior prioridade
              </p>
            </div>

            {/* Descrição */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleInputChange}
                rows={4}
                placeholder="Descreva o conteúdo do vídeo..."
                className="input-field resize-none"
              />
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="ativo"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">
                  Vídeo ativo (será exibido na TV)
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Desmarque para pausar a exibição sem deletar o vídeo
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/videos')}
            className="btn-secondary"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>

      {/* Additional Actions */}
      <div className="card bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Ações Adicionais</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              const newWindow = window.open('', '_blank');
              newWindow.document.write(`
                <html>
                  <head><title>${video.titulo}</title></head>
                  <body style="margin:0;background:#000;">
                    <video controls autoplay style="width:100%;height:100vh;object-fit:contain;">
                      <source src="http://localhost:3001/uploads/${video.arquivo}" type="video/mp4">
                    </video>
                  </body>
                </html>
              `);
            }}
            className="btn-secondary text-sm"
          >
            🔍 Visualizar em Tela Cheia
          </button>
          
          <a
            href={`http://localhost:3001/uploads/${video.arquivo}`}
            download={video.titulo}
            className="btn-secondary text-sm"
          >
            💾 Baixar Vídeo
          </a>
        </div>
      </div>
    </div>
  );
};

export default VideoEdit;
