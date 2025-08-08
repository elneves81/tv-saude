import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, getUploadsUrl } from '../config/api';
import { useNotification } from '../contexts/NotificationContext';



const VideoUpload = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoria: '',
    ordem: 0,
    url_youtube: ''
  });
  
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [uploadType, setUploadType] = useState('local'); // 'local' ou 'youtube'

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('video/')) {
      setFile(selectedFile);
      
      // Se não há título, usar o nome do arquivo
      if (!formData.titulo) {
        const fileName = selectedFile.name.replace(/\.[^/.]+$/, "");
        setFormData(prev => ({
          ...prev,
          titulo: fileName
        }));
      }
    } else {
      showError('Por favor, selecione um arquivo de vídeo válido');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    handleFileSelect(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  // Validar URL do YouTube
  const isValidYouTubeUrl = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    return regex.test(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (uploadType === 'local') {
      if (!file) {
        showError('Por favor, selecione um arquivo de vídeo');
        return;
      }
    } else if (uploadType === 'youtube') {
      if (!formData.url_youtube.trim()) {
        showError('Por favor, informe a URL do YouTube');
        return;
      }
      if (!isValidYouTubeUrl(formData.url_youtube)) {
        showError('Por favor, informe uma URL válida do YouTube');
        return;
      }
    }
    
    if (!formData.titulo.trim()) {
      showError('Por favor, informe o título do vídeo');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      if (uploadType === 'youtube') {
        // Envio de vídeo do YouTube
        const response = await axios.post(`${API_BASE_URL}/videos`, {
          titulo: formData.titulo,
          descricao: formData.descricao,
          categoria: formData.categoria || 'Geral',
          ordem: formData.ordem,
          tipo: 'youtube',
          url_youtube: formData.url_youtube
        });

        showSuccess('Vídeo do YouTube adicionado com sucesso!');
        navigate('/videos');
      } else {
        // Upload local (comportamento original)
        const uploadData = new FormData();
        uploadData.append('video', file);
        uploadData.append('titulo', formData.titulo);
        uploadData.append('descricao', formData.descricao);
        uploadData.append('categoria', formData.categoria || 'Geral');
        uploadData.append('ordem', formData.ordem);
        uploadData.append('tipo', 'local');

        const response = await axios.post(`${API_BASE_URL}/videos`, uploadData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          },
        });

        showSuccess('Vídeo enviado com sucesso!');
        navigate('/videos');
      }
      
    } catch (error) {
      console.error('Erro ao enviar vídeo:', error);
      showError(error.response?.data?.error || 'Erro ao enviar vídeo');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Enviar Novo Vídeo</h1>
        <p className="text-gray-600">Adicione conteúdo educativo para a TV Saúde</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de Upload */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tipo de Conteúdo</h2>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => {
                setUploadType('local');
                setFile(null);
                setFormData(prev => ({ ...prev, url_youtube: '' }));
              }}
              className={`flex-1 p-4 border-2 rounded-lg transition-colors ${
                uploadType === 'local'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">📁</div>
                <div className="font-medium">Upload Local</div>
                <div className="text-sm text-gray-500">Enviar arquivo do computador</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                setUploadType('youtube');
                setFile(null);
              }}
              className={`flex-1 p-4 border-2 rounded-lg transition-colors ${
                uploadType === 'youtube'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">📺</div>
                <div className="font-medium">YouTube</div>
                <div className="text-sm text-gray-500">Adicionar vídeo do YouTube</div>
              </div>
            </button>
          </div>
        </div>

        {/* Upload Local */}
        {uploadType === 'local' && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Arquivo de Vídeo</h2>
            
            <div
              className={`drag-area ${dragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="text-center">
                  <div className="text-4xl mb-2">🎥</div>
                  <p className="text-lg font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(file.size)} • {file.type}
                  </p>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remover arquivo
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-4xl mb-4">📤</div>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Arraste e solte seu vídeo aqui
                  </p>
                  <p className="text-gray-500 mb-4">ou</p>
                  <label className="btn-primary cursor-pointer">
                    Selecionar Arquivo
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Formatos suportados: MP4, AVI, MOV, WMV (máx. 500MB)
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* URL do YouTube */}
        {uploadType === 'youtube' && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Vídeo do YouTube</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL do YouTube *
                </label>
                <input
                  type="url"
                  name="url_youtube"
                  value={formData.url_youtube}
                  onChange={handleInputChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="input-field"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cole aqui o link do vídeo do YouTube
                </p>
              </div>
              
              {formData.url_youtube && isValidYouTubeUrl(formData.url_youtube) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <div className="text-green-600 mr-2">✅</div>
                    <div className="text-sm text-green-800">URL válida do YouTube</div>
                  </div>
                </div>
              )}
              
              {formData.url_youtube && !isValidYouTubeUrl(formData.url_youtube) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <div className="text-red-600 mr-2">❌</div>
                    <div className="text-sm text-red-800">URL inválida. Use o formato: https://www.youtube.com/watch?v=...</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Video Information */}
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
          </div>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Enviando Vídeo...</h3>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              {uploadProgress}% concluído
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/videos')}
            className="btn-secondary"
            disabled={uploading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={uploading || (uploadType === 'local' && !file) || (uploadType === 'youtube' && !formData.url_youtube)}
          >
            {uploading ? 'Processando...' : uploadType === 'youtube' ? 'Adicionar Vídeo' : 'Enviar Vídeo'}
          </button>
        </div>
      </form>

      {/* Tips */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-medium text-blue-900 mb-3">💡 Dicas para um bom conteúdo</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use títulos claros e descritivos</li>
          {uploadType === 'local' ? (
            <>
              <li>• Prefira vídeos em formato MP4 para melhor compatibilidade</li>
              <li>• Mantenha os arquivos abaixo de 500MB</li>
            </>
          ) : (
            <>
              <li>• Certifique-se de que o vídeo do YouTube é público</li>
              <li>• Copie a URL completa do vídeo (com https://)</li>
              <li>• Vídeos privados ou restritos não funcionarão</li>
            </>
          )}
          <li>• Mantenha os vídeos entre 2-10 minutos para melhor engajamento</li>
          <li>• Use categorias para organizar o conteúdo</li>
          <li>• A ordem de exibição determina a sequência na TV</li>
        </ul>
      </div>
    </div>
  );
};

export default VideoUpload;
