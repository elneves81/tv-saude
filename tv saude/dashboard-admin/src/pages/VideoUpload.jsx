import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useNotification } from '../contexts/NotificationContext';

const API_BASE_URL = 'http://localhost:3001/api';

const VideoUpload = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoria: '',
    ordem: 0
  });
  
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      showError('Por favor, selecione um arquivo de vídeo');
      return;
    }
    
    if (!formData.titulo.trim()) {
      showError('Por favor, informe o título do vídeo');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadData = new FormData();
      uploadData.append('video', file);
      uploadData.append('titulo', formData.titulo);
      uploadData.append('descricao', formData.descricao);
      uploadData.append('categoria', formData.categoria || 'Geral');
      uploadData.append('ordem', formData.ordem);

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
        {/* File Upload Area */}
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
            disabled={uploading || !file}
          >
            {uploading ? 'Enviando...' : 'Enviar Vídeo'}
          </button>
        </div>
      </form>

      {/* Tips */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-medium text-blue-900 mb-3">💡 Dicas para um bom vídeo</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use títulos claros e descritivos</li>
          <li>• Prefira vídeos em formato MP4 para melhor compatibilidade</li>
          <li>• Mantenha os vídeos entre 2-10 minutos para melhor engajamento</li>
          <li>• Use categorias para organizar o conteúdo</li>
          <li>• A ordem de exibição determina a sequência na TV</li>
        </ul>
      </div>
    </div>
  );
};

export default VideoUpload;
