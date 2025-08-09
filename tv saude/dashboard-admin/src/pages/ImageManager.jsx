import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

function ImageManager() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingImage, setEditingImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    duracao: 5000,
    ordem: 0
  });

  // Buscar imagens
  const fetchImages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admin/imagens`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setImages(response.data);
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Manipular seleção de arquivo
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Enviar imagem
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile && !editingImage) {
      alert('Selecione uma imagem');
      return;
    }

    setUploading(true);
    
    try {
      const token = localStorage.getItem('token');
      const submitData = new FormData();
      
      if (selectedFile) {
        submitData.append('arquivo', selectedFile);
      }
      submitData.append('titulo', formData.titulo);
      submitData.append('descricao', formData.descricao);
      submitData.append('duracao', formData.duracao);
      submitData.append('ordem', formData.ordem);

      if (editingImage) {
        // Atualizar imagem existente
        await axios.put(`${API_BASE_URL}/admin/imagens/${editingImage.id}`, {
          titulo: formData.titulo,
          descricao: formData.descricao,
          duracao: formData.duracao,
          ordem: formData.ordem,
          ativo: 1
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Adicionar nova imagem
        await axios.post(`${API_BASE_URL}/admin/imagens`, submitData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      // Resetar form
      setFormData({ titulo: '', descricao: '', duracao: 5000, ordem: 0 });
      setSelectedFile(null);
      setPreviewUrl(null);
      setEditingImage(null);
      
      // Recarregar lista
      fetchImages();
      
      alert(editingImage ? 'Imagem atualizada com sucesso!' : 'Imagem adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar imagem:', error);
      alert('Erro ao salvar imagem');
    } finally {
      setUploading(false);
    }
  };

  // Editar imagem
  const handleEdit = (image) => {
    setEditingImage(image);
    setFormData({
      titulo: image.titulo,
      descricao: image.descricao || '',
      duracao: image.duracao,
      ordem: image.ordem
    });
    setPreviewUrl(`${API_BASE_URL}/images/${image.arquivo}`);
  };

  // Cancelar edição
  const handleCancelEdit = () => {
    setEditingImage(null);
    setFormData({ titulo: '', descricao: '', duracao: 5000, ordem: 0 });
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  // Deletar imagem
  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar esta imagem?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/admin/imagens/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchImages();
      alert('Imagem deletada com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      alert('Erro ao deletar imagem');
    }
  };

  // Toggle ativo/inativo
  const toggleActive = async (image) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/admin/imagens/${image.id}`, {
        ...image,
        ativo: image.ativo ? 0 : 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchImages();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📸 Gerenciar Imagens do Slideshow
        </h1>
        <p className="text-gray-600">
          Adicione e gerencie imagens que serão exibidas na interface da TV
        </p>
      </div>

      {/* Formulário de Upload/Edição */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingImage ? 'Editar Imagem' : 'Adicionar Nova Imagem'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload de Arquivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {editingImage ? 'Nova Imagem (opcional)' : 'Arquivo de Imagem *'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                required={!editingImage}
              />
              
              {previewUrl && (
                <div className="mt-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-32 h-24 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>

            {/* Campos do Formulário */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duração (ms)
                  </label>
                  <input
                    type="number"
                    value={formData.duracao}
                    onChange={(e) => setFormData({...formData, duracao: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="1000"
                    step="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordem
                  </label>
                  <input
                    type="number"
                    value={formData.ordem}
                    onChange={(e) => setFormData({...formData, ordem: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {uploading ? 'Salvando...' : (editingImage ? 'Atualizar' : 'Adicionar')}
            </button>
            
            {editingImage && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Lista de Imagens */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            Imagens Cadastradas ({images.length})
          </h2>
        </div>

        <div className="p-6">
          {images.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma imagem cadastrada ainda
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.map((image) => (
                <div key={image.id} className="border rounded-lg overflow-hidden">
                  <div className="relative">
                    <img
                      src={`${API_BASE_URL}/images/${image.arquivo}`}
                      alt={image.titulo}
                      className="w-full h-32 object-cover"
                    />
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${
                      image.ativo ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {image.ativo ? 'Ativo' : 'Inativo'}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-1 truncate">
                      {image.titulo}
                    </h3>
                    {image.descricao && (
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {image.descricao}
                      </p>
                    )}
                    <div className="text-xs text-gray-500 mb-3">
                      {image.duracao/1000}s • Ordem: {image.ordem}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(image)}
                        className="flex-1 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => toggleActive(image)}
                        className={`flex-1 px-3 py-1 text-xs rounded ${
                          image.ativo 
                            ? 'bg-orange-500 text-white hover:bg-orange-600' 
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {image.ativo ? 'Desativar' : 'Ativar'}
                      </button>
                      <button
                        onClick={() => handleDelete(image.id)}
                        className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
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
      </div>
    </div>
  );
}

export default ImageManager;
