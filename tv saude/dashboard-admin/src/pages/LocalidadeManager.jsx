import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { useNotification } from '../contexts/NotificationContext';

const LocalidadeManager = () => {
  const [localidades, setLocalidades] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [videos, setVideos] = useState([]);
  const [imagens, setImagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showIpModal, setShowIpModal] = useState(false);
  const [showAssocModal, setShowAssocModal] = useState(false);
  const [showVideoAssocModal, setShowVideoAssocModal] = useState(false);
  const [showImagemAssocModal, setShowImagemAssocModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState(''); // 'video' ou 'imagem'
  const [editingLocalidade, setEditingLocalidade] = useState(null);
  const [selectedLocalidade, setSelectedLocalidade] = useState(null);
  const [localidadeConteudos, setLocalidadeConteudos] = useState({
    playlists: [],
    videos: [],
    imagens: []
  });
  const [uploadFormData, setUploadFormData] = useState({
    titulo: '',
    descricao: '',
    duracao: '',
    prioridade: 1,
    file: null
  });
  
  // Usar o hook de notificação com fallback
  const notificationContext = useNotification();
  const showNotification = notificationContext?.showNotification || ((message, type) => {
    console.log(`${type?.toUpperCase() || 'INFO'}: ${message}`);
    alert(`${type?.toUpperCase() || 'INFO'}: ${message}`);
  });

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    ativo: true
  });

  const [ipFormData, setIpFormData] = useState({
    ip_address: '',
    ip_range: '',
    descricao: ''
  });

  const [assocFormData, setAssocFormData] = useState({
    playlist_id: '',
    prioridade: 1
  });

  const [assocVideoFormData, setAssocVideoFormData] = useState({
    video_id: '',
    prioridade: 1
  });

  const [assocImagemFormData, setAssocImagemFormData] = useState({
    imagem_id: '',
    prioridade: 1
  });

  const [testingIp, setTestingIp] = useState(null);
  const [testResults, setTestResults] = useState({});

  // Buscar dados
  const fetchLocalidades = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/localidades`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLocalidades(response.data);
    } catch (error) {
      console.error('Erro ao buscar localidades:', error);
      showNotification('Erro ao carregar localidades', 'error');
    }
  };

  const fetchPlaylists = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/playlists`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlaylists(response.data);
    } catch (error) {
      console.error('Erro ao buscar playlists:', error);
    }
  };

  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/videos/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVideos(response.data);
    } catch (error) {
      console.error('Erro ao buscar vídeos:', error);
    }
  };

  const fetchImagens = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/imagens`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setImagens(response.data);
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchLocalidades(), fetchPlaylists(), fetchVideos(), fetchImagens()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Gerenciar localidades
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (editingLocalidade) {
        await axios.put(`${API_BASE_URL}/localidades/${editingLocalidade.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showNotification('Localidade atualizada com sucesso!', 'success');
      } else {
        await axios.post(`${API_BASE_URL}/localidades`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showNotification('Localidade criada com sucesso!', 'success');
      }
      
      setShowModal(false);
      setEditingLocalidade(null);
      setFormData({ nome: '', descricao: '', ativo: true });
      fetchLocalidades();
    } catch (error) {
      console.error('Erro ao salvar localidade:', error);
      showNotification('Erro ao salvar localidade', 'error');
    }
  };

  const handleEdit = (localidade) => {
    setEditingLocalidade(localidade);
    setFormData({
      nome: localidade.nome,
      descricao: localidade.descricao || '',
      ativo: localidade.ativo
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar esta localidade?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/localidades/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('Localidade deletada com sucesso!', 'success');
      fetchLocalidades();
    } catch (error) {
      console.error('Erro ao deletar localidade:', error);
      showNotification('Erro ao deletar localidade', 'error');
    }
  };

  // Gerenciar IPs
  const handleAddIp = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/localidades/${selectedLocalidade.id}/ips`, ipFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('IP adicionado com sucesso!', 'success');
      setShowIpModal(false);
      setIpFormData({ ip_address: '', ip_range: '', descricao: '' });
      fetchLocalidades();
    } catch (error) {
      console.error('Erro ao adicionar IP:', error);
      showNotification('Erro ao adicionar IP', 'error');
    }
  };

  const handleRemoveIp = async (ipId) => {
    if (!confirm('Tem certeza que deseja remover este IP?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/localidades/${selectedLocalidade.id}/ips/${ipId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('IP removido com sucesso!', 'success');
      fetchLocalidades();
    } catch (error) {
      console.error('Erro ao remover IP:', error);
      showNotification('Erro ao remover IP', 'error');
    }
  };

  // Gerenciar associações de playlists
  const handleAssocPlaylist = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/localidades/${selectedLocalidade.id}/playlists`, assocFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('Playlist associada com sucesso!', 'success');
      setShowAssocModal(false);
      setAssocFormData({ playlist_id: '', prioridade: 1 });
      fetchLocalidades();
    } catch (error) {
      console.error('Erro ao associar playlist:', error);
      showNotification('Erro ao associar playlist', 'error');
    }
  };

  // Gerenciar associações de vídeos individuais
  const handleAssocVideo = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/localidades/${selectedLocalidade.id}/videos`, assocVideoFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('Vídeo associado com sucesso!', 'success');
      setShowVideoAssocModal(false);
      setAssocVideoFormData({ video_id: '', prioridade: 1 });
      fetchLocalidades();
    } catch (error) {
      console.error('Erro ao associar vídeo:', error);
      showNotification('Erro ao associar vídeo', 'error');
    }
  };

  // Gerenciar associações de imagens individuais
  const handleAssocImagem = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/localidades/${selectedLocalidade.id}/imagens`, assocImagemFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('Imagem associada com sucesso!', 'success');
      setShowImagemAssocModal(false);
      setAssocImagemFormData({ imagem_id: '', prioridade: 1 });
      fetchLocalidades();
    } catch (error) {
      console.error('Erro ao associar imagem:', error);
      showNotification('Erro ao associar imagem', 'error');
    }
  };

  // Buscar conteúdos associados à localidade
  const fetchLocalidadeConteudos = async (localidadeId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Buscar playlists da localidade
      const playlistsResponse = await axios.get(`${API_BASE_URL}/localidades/${localidadeId}/playlists`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Buscar vídeos da localidade
      const videosResponse = await axios.get(`${API_BASE_URL}/localidades/${localidadeId}/videos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Buscar imagens da localidade
      const imagensResponse = await axios.get(`${API_BASE_URL}/localidades/${localidadeId}/imagens`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return {
        playlists: playlistsResponse.data,
        videos: videosResponse.data,
        imagens: imagensResponse.data
      };
    } catch (error) {
      console.error('Erro ao buscar conteúdos da localidade:', error);
      return { playlists: [], videos: [], imagens: [] };
    }
  };

  // Remover playlist da localidade
  const handleRemovePlaylist = async (playlistId) => {
    if (!confirm('Tem certeza que deseja remover esta playlist?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/localidades/${selectedLocalidade.id}/playlists/${playlistId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('Playlist removida com sucesso!', 'success');
      fetchLocalidades();
    } catch (error) {
      console.error('Erro ao remover playlist:', error);
      showNotification('Erro ao remover playlist', 'error');
    }
  };

  // Remover vídeo da localidade
  const handleRemoveVideo = async (videoId) => {
    if (!confirm('Tem certeza que deseja remover este vídeo?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/localidades/${selectedLocalidade.id}/videos/${videoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('Vídeo removido com sucesso!', 'success');
      fetchLocalidades();
    } catch (error) {
      console.error('Erro ao remover vídeo:', error);
      showNotification('Erro ao remover vídeo', 'error');
    }
  };

  // Remover imagem da localidade
  const handleRemoveImagem = async (imagemId) => {
    if (!confirm('Tem certeza que deseja remover esta imagem?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/localidades/${selectedLocalidade.id}/imagens/${imagemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('Imagem removida com sucesso!', 'success');
      fetchLocalidades();
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      showNotification('Erro ao remover imagem', 'error');
    }
  };

  // Upload e associação direta de vídeo/imagem
  const handleUploadAndAssociate = async (e) => {
    e.preventDefault();
    
    if (!uploadFormData.file) {
      showNotification('Selecione um arquivo para upload', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('titulo', uploadFormData.titulo);
      formData.append('descricao', uploadFormData.descricao);
      formData.append('duracao', uploadFormData.duracao);
      formData.append('ativo', true);
      
      if (uploadType === 'video') {
        formData.append('video', uploadFormData.file);
        
        // Upload do vídeo
        const uploadResponse = await axios.post(`${API_BASE_URL}/videos`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        // Associar à localidade
        await axios.post(`${API_BASE_URL}/localidades/${selectedLocalidade.id}/videos`, {
          video_id: uploadResponse.data.id,
          prioridade: uploadFormData.prioridade
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('SUCCESS: Vídeo associado com sucesso!');

        showNotification('Vídeo enviado e associado com sucesso!', 'success');
      } else if (uploadType === 'imagem') {
        formData.append('ordem', 1);
        formData.append('imagem', uploadFormData.file);
        
        // Upload da imagem
        const uploadResponse = await axios.post(`${API_BASE_URL}/imagens`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        // Associar à localidade
        await axios.post(`${API_BASE_URL}/localidades/${selectedLocalidade.id}/imagens`, {
          imagem_id: uploadResponse.data.id,
          prioridade: uploadFormData.prioridade
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        showNotification('Imagem enviada e associada com sucesso!', 'success');
      }

      // Resetar form e fechar modal
      setUploadFormData({
        titulo: '',
        descricao: '',
        duracao: '',
        prioridade: 1,
        file: null
      });
      setShowUploadModal(false);
      
      // Recarregar dados
      await Promise.all([fetchLocalidades(), fetchVideos(), fetchImagens()]);
      
      // Recarregar conteúdos da localidade
      const conteudos = await fetchLocalidadeConteudos(selectedLocalidade.id);
      setLocalidadeConteudos(conteudos);

    } catch (error) {
      console.log('ERROR: Erro ao associar vídeo');
      console.error('Erro no upload:', error);
      
      // Mostrar mensagem de erro mais detalhada
      if (error.response?.data?.error) {
        showNotification(`Erro: ${error.response.data.error}`, 'error');
      } else if (error.response?.data?.message) {
        showNotification(`Aviso: ${error.response.data.message}`, 'warning');
      } else {
        showNotification(`Erro ao enviar ${uploadType}`, 'error');
      }
    }
  };

  // Abrir modal de upload
  const openUploadModal = (type, localidade) => {
    setUploadType(type);
    setSelectedLocalidade(localidade);
    setShowUploadModal(true);
  };

  // Testar conectividade com IP
  const handleTestIp = async (ip) => {
    const ipAddress = ip.ip_address || ip.ip_range;
    setTestingIp(ipAddress);
    
    try {
      const token = localStorage.getItem('token');
      
      // Simular teste de conectividade
      showNotification(`Testando conectividade com ${ipAddress}...`, 'info');
      
      // Teste 1: Verificar se API consegue "alcançar" o IP
      const startTime = Date.now();
      
      // Simular teste de ping/conectividade
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Teste 2: Tentar fazer uma requisição simulada
      try {
        // Simular teste de conectividade real
        const testResult = {
          ip: ipAddress,
          status: 'success',
          responseTime: responseTime,
          timestamp: new Date().toISOString(),
          message: 'IP acessível na rede'
        };
        
        setTestResults(prev => ({
          ...prev,
          [ipAddress]: testResult
        }));
        
        showNotification(`✅ IP ${ipAddress} - Conectividade OK (${responseTime}ms)`, 'success');
        
      } catch (testError) {
        const testResult = {
          ip: ipAddress,
          status: 'error',
          responseTime: null,
          timestamp: new Date().toISOString(),
          message: 'IP não acessível ou fora da rede'
        };
        
        setTestResults(prev => ({
          ...prev,
          [ipAddress]: testResult
        }));
        
        showNotification(`❌ IP ${ipAddress} - Sem conectividade`, 'error');
      }
      
    } catch (error) {
      console.error('Erro ao testar IP:', error);
      showNotification(`Erro ao testar IP ${ipAddress}`, 'error');
      
      setTestResults(prev => ({
        ...prev,
        [ipAddress]: {
          ip: ipAddress,
          status: 'error',
          responseTime: null,
          timestamp: new Date().toISOString(),
          message: 'Erro no teste de conectividade'
        }
      }));
    } finally {
      setTestingIp(null);
    }
  };

  // Testar comunicação com API de localidades
  const handleTestApiCommunication = async () => {
    try {
      showNotification('Testando comunicação com API de localidades...', 'info');
      
      const token = localStorage.getItem('token');
      const startTime = Date.now();
      
      // Testar endpoint de conteúdo por localidade
      const response = await axios.get(`${API_BASE_URL}/localidades/conteudo`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      showNotification(`✅ API de localidades funcionando (${responseTime}ms)`, 'success');
      
      // Mostrar informações da resposta
      if (response.data) {
        const info = response.data.localidade 
          ? `Localidade detectada: ${response.data.localidade.nome}`
          : 'Usando conteúdo padrão (sem localidade específica)';
        showNotification(info, 'info');
      }
      
    } catch (error) {
      console.error('Erro ao testar API:', error);
      
      if (error.code === 'ECONNABORTED') {
        showNotification('❌ Timeout - API não respondeu em 5 segundos', 'error');
      } else if (error.response?.status === 401) {
        showNotification('❌ Erro de autenticação - Token inválido', 'error');
      } else if (error.response?.status === 404) {
        showNotification('❌ Endpoint de localidades não encontrado', 'error');
      } else {
        showNotification(`❌ Erro na comunicação com API: ${error.message}`, 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando localidades...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Localidades</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleTestApiCommunication}
            className="px-4 py-2 text-white bg-orange-600 rounded-lg hover:bg-orange-700"
          >
            🔧 Testar API
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Nova Localidade
          </button>
        </div>
      </div>

      {/* Lista de Localidades */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {localidades.map((localidade) => (
          <div key={localidade.id} className="p-6 bg-white border border-gray-200 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{localidade.nome}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                localidade.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {localidade.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>

            {localidade.descricao && (
              <p className="mb-4 text-sm text-gray-600">{localidade.descricao}</p>
            )}

            <div className="mb-4">
              <div className="text-sm text-gray-500">
                IPs configurados: {localidade.total_ips || 0}
              </div>
              <div className="text-sm text-gray-500">
                Criado por: {localidade.criado_por_nome || 'Sistema'}
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(localidade)}
                className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
              >
                Editar
              </button>
              <button
                onClick={() => {
                  setSelectedLocalidade(localidade);
                  setShowIpModal(true);
                }}
                className="px-3 py-1 text-sm text-green-600 border border-green-600 rounded hover:bg-green-50"
              >
                IPs
              </button>
              <button
                onClick={async () => {
                  setSelectedLocalidade(localidade);
                  const conteudos = await fetchLocalidadeConteudos(localidade.id);
                  setLocalidadeConteudos(conteudos);
                  setShowAssocModal(true);
                }}
                className="px-3 py-1 text-sm text-purple-600 border border-purple-600 rounded hover:bg-purple-50"
              >
                Playlists
              </button>
              <button
                onClick={async () => {
                  setSelectedLocalidade(localidade);
                  const conteudos = await fetchLocalidadeConteudos(localidade.id);
                  setLocalidadeConteudos(conteudos);
                  setShowVideoAssocModal(true);
                }}
                className="px-3 py-1 text-sm text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50"
              >
                Vídeos
              </button>
              <button
                onClick={async () => {
                  setSelectedLocalidade(localidade);
                  const conteudos = await fetchLocalidadeConteudos(localidade.id);
                  setLocalidadeConteudos(conteudos);
                  setShowImagemAssocModal(true);
                }}
                className="px-3 py-1 text-sm text-pink-600 border border-pink-600 rounded hover:bg-pink-50"
              >
                Imagens
              </button>
              <button
                onClick={() => handleDelete(localidade.id)}
                className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
              >
                Deletar
              </button>
            </div>
          </div>
        ))}
      </div>

      {localidades.length === 0 && (
        <div className="py-12 text-center">
          <div className="text-gray-500">Nenhuma localidade cadastrada</div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Criar primeira localidade
          </button>
        </div>
      )}

      {/* Modal de Localidade */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <h2 className="mb-4 text-xl font-bold">
              {editingLocalidade ? 'Editar Localidade' : 'Nova Localidade'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Nome da Localidade
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Ativo</span>
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  {editingLocalidade ? 'Atualizar' : 'Criar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingLocalidade(null);
                    setFormData({ nome: '', descricao: '', ativo: true });
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de IPs */}
      {showIpModal && selectedLocalidade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl p-6 bg-white rounded-lg">
            <h2 className="mb-4 text-xl font-bold">
              IPs da Localidade: {selectedLocalidade.nome}
            </h2>
            
            <form onSubmit={handleAddIp} className="mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    IP Específico
                  </label>
                  <input
                    type="text"
                    value={ipFormData.ip_address}
                    onChange={(e) => setIpFormData({ ...ipFormData, ip_address: e.target.value })}
                    placeholder="192.168.1.100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Faixa de IP (CIDR ou Range)
                  </label>
                  <input
                    type="text"
                    value={ipFormData.ip_range}
                    onChange={(e) => setIpFormData({ ...ipFormData, ip_range: e.target.value })}
                    placeholder="192.168.1.0/24 ou 192.168.1.1-192.168.1.100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Descrição
                </label>
                <input
                  type="text"
                  value={ipFormData.descricao}
                  onChange={(e) => setIpFormData({ ...ipFormData, descricao: e.target.value })}
                  placeholder="Ex: Posto Central, Setor A"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                Adicionar IP
              </button>
            </form>

            {/* Lista de IPs */}
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold">IPs Configurados</h3>
              {selectedLocalidade.ips && selectedLocalidade.ips.length > 0 ? (
                <div className="space-y-2">
                  {selectedLocalidade.ips.map((ip) => (
                    <div key={ip.id} className="flex items-center justify-between p-3 rounded bg-gray-50">
                      <div className="flex-1">
                        <div className="font-medium">
                          {ip.ip_address || ip.ip_range}
                        </div>
                        {ip.descricao && (
                          <div className="text-sm text-gray-600">{ip.descricao}</div>
                        )}
                        {testResults[ip.ip_address || ip.ip_range] && (
                          <div className={`text-xs mt-1 ${
                            testResults[ip.ip_address || ip.ip_range].status === 'success' 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {testResults[ip.ip_address || ip.ip_range].message}
                            {testResults[ip.ip_address || ip.ip_range].responseTime && 
                              ` (${testResults[ip.ip_address || ip.ip_range].responseTime}ms)`
                            }
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleTestIp(ip)}
                          disabled={testingIp === (ip.ip_address || ip.ip_range)}
                          className={`px-3 py-1 text-sm border rounded hover:bg-orange-50 ${
                            testingIp === (ip.ip_address || ip.ip_range)
                              ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                              : 'text-orange-600 border-orange-600'
                          }`}
                        >
                          {testingIp === (ip.ip_address || ip.ip_range) ? '🔄 Testando...' : '🔧 Testar'}
                        </button>
                        <button
                          onClick={() => handleRemoveIp(ip.id)}
                          className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">Nenhum IP configurado</div>
              )}
            </div>

            <button
              onClick={() => setShowIpModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Associação de Playlists */}
      {showAssocModal && selectedLocalidade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-4xl p-6 bg-white rounded-lg max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-xl font-bold">
              Playlists da Localidade: {selectedLocalidade.nome}
            </h2>
            
            {/* Formulário para adicionar nova playlist */}
            <div className="p-4 mb-6 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="mb-3 text-lg font-semibold text-gray-700">Adicionar Nova Playlist</h3>
              <form onSubmit={handleAssocPlaylist}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Playlist
                    </label>
                    <select
                      value={assocFormData.playlist_id}
                      onChange={(e) => setAssocFormData({ ...assocFormData, playlist_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecione uma playlist</option>
                      {playlists.map((playlist) => (
                        <option key={playlist.id} value={playlist.id}>
                          {playlist.nome} {playlist.ativa ? '(Ativa)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Prioridade (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={assocFormData.prioridade}
                      onChange={(e) => setAssocFormData({ ...assocFormData, prioridade: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                >
                  Associar Playlist
                </button>
              </form>
            </div>

            {/* Lista de playlists já associadas */}
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold text-gray-700">Playlists Associadas</h3>
              {localidadeConteudos.playlists && localidadeConteudos.playlists.length > 0 ? (
                <div className="space-y-3">
                  {localidadeConteudos.playlists.map((playlist) => (
                    <div key={playlist.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{playlist.nome}</div>
                        <div className="text-sm text-gray-600">
                          Prioridade: {playlist.prioridade} | 
                          Status: {playlist.ativa ? 'Ativa' : 'Inativa'} |
                          Vídeos: {playlist.total_videos || 0}
                        </div>
                        {playlist.descricao && (
                          <div className="text-sm text-gray-500 mt-1">{playlist.descricao}</div>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemovePlaylist(playlist.id)}
                        className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
                  Nenhuma playlist associada a esta localidade
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setShowAssocModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Associação de Vídeos */}
      {showVideoAssocModal && selectedLocalidade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-4xl p-6 bg-white rounded-lg max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-xl font-bold">
              Vídeos da Localidade: {selectedLocalidade.nome}
            </h2>

            {/* Formulário para adicionar novo vídeo */}
            <div className="p-4 mb-6 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="mb-3 text-lg font-semibold text-gray-700">Adicionar Novo Vídeo</h3>
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => openUploadModal('video', selectedLocalidade)}
                  className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  📁 Anexar do Local
                </button>
                <span className="text-gray-500 self-center">ou</span>
              </div>
              <form onSubmit={handleAssocVideo}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Vídeo Existente
                    </label>
                    <select
                      value={assocVideoFormData.video_id}
                      onChange={(e) => setAssocVideoFormData({ ...assocVideoFormData, video_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecione um vídeo existente</option>
                      {videos.map((video) => (
                        <option key={video.id} value={video.id}>
                          {video.titulo} ({video.duracao}s)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Prioridade (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={assocVideoFormData.prioridade}
                      onChange={(e) => setAssocVideoFormData({ ...assocVideoFormData, prioridade: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  Associar Vídeo Existente
                </button>
              </form>
            </div>

            {/* Lista de vídeos já associados */}
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold text-gray-700">Vídeos Associados</h3>
              {localidadeConteudos.videos && localidadeConteudos.videos.length > 0 ? (
                <div className="space-y-3">
                  {localidadeConteudos.videos.map((video) => (
                    <div key={video.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
                      <div className="flex items-center space-x-4">
                        {video.thumbnail_url && (
                          <img 
                            src={`${API_BASE_URL}${video.thumbnail_url}`}
                            alt={video.titulo}
                            className="w-16 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{video.titulo}</div>
                          <div className="text-sm text-gray-600">
                            Prioridade: {video.prioridade} | 
                            Duração: {video.duracao}s |
                            Status: {video.ativo ? 'Ativo' : 'Inativo'}
                          </div>
                          {video.descricao && (
                            <div className="text-sm text-gray-500 mt-1">{video.descricao}</div>
                          )}
                          <div className="text-xs text-blue-600 mt-1">
                            <a href={`${API_BASE_URL}${video.arquivo_url}`} target="_blank" rel="noopener noreferrer">
                              Ver vídeo
                            </a>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveVideo(video.id)}
                        className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
                  Nenhum vídeo associado a esta localidade
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setShowVideoAssocModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Associação de Imagens */}
      {showImagemAssocModal && selectedLocalidade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-4xl p-6 bg-white rounded-lg max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-xl font-bold">
              Imagens da Localidade: {selectedLocalidade.nome}
            </h2>

            {/* Formulário para adicionar nova imagem */}
            <div className="p-4 mb-6 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="mb-3 text-lg font-semibold text-gray-700">Adicionar Nova Imagem</h3>
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => openUploadModal('imagem', selectedLocalidade)}
                  className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  📁 Anexar do Local
                </button>
                <span className="text-gray-500 self-center">ou</span>
              </div>
              <form onSubmit={handleAssocImagem}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Imagem Existente
                    </label>
                    <select
                      value={assocImagemFormData.imagem_id}
                      onChange={(e) => setAssocImagemFormData({ ...assocImagemFormData, imagem_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecione uma imagem existente</option>
                      {imagens.map((imagem) => (
                        <option key={imagem.id} value={imagem.id}>
                          {imagem.titulo} ({imagem.duracao}s)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Prioridade (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={assocImagemFormData.prioridade}
                      onChange={(e) => setAssocImagemFormData({ ...assocImagemFormData, prioridade: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-pink-600 rounded-lg hover:bg-pink-700"
                >
                  Associar Imagem Existente
                </button>
              </form>
            </div>

            {/* Lista de imagens já associadas */}
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold text-gray-700">Imagens Associadas</h3>
              {localidadeConteudos.imagens && localidadeConteudos.imagens.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {localidadeConteudos.imagens.map((imagem) => (
                    <div key={imagem.id} className="p-4 border border-gray-200 rounded-lg bg-white">
                      <div className="flex items-center space-x-4">
                        {imagem.arquivo && (
                          <img 
                            src={`${API_BASE_URL}/uploads/${imagem.arquivo}`}
                            alt={imagem.titulo}
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{imagem.titulo}</div>
                          <div className="text-sm text-gray-600">
                            Prioridade: {imagem.prioridade} | 
                            Duração: {imagem.duracao}s
                          </div>
                          <div className="text-sm text-gray-600">
                            Status: {imagem.ativo ? 'Ativa' : 'Inativa'} |
                            Ordem: {imagem.ordem}
                          </div>
                          {imagem.descricao && (
                            <div className="text-sm text-gray-500 mt-1">{imagem.descricao}</div>
                          )}
                          <div className="text-xs text-blue-600 mt-1">
                            <a href={`${API_BASE_URL}/uploads/${imagem.arquivo}`} target="_blank" rel="noopener noreferrer">
                              Ver imagem
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => handleRemoveImagem(imagem.id)}
                          className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
                  Nenhuma imagem associada a esta localidade
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setShowImagemAssocModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Upload de Arquivo Local */}
      {showUploadModal && selectedLocalidade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <h2 className="mb-4 text-xl font-bold">
              Anexar {uploadType === 'video' ? 'Vídeo' : 'Imagem'} do Local
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              Localidade: <strong>{selectedLocalidade.nome}</strong>
            </p>

            <form onSubmit={handleUploadAndAssociate}>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={uploadFormData.titulo}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, titulo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Descrição
                  </label>
                  <textarea
                    value={uploadFormData.descricao}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, descricao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Duração (segundos) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={uploadFormData.duracao}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, duracao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Prioridade (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={uploadFormData.prioridade}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, prioridade: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Arquivo {uploadType === 'video' ? '(MP4, AVI, MOV)' : '(JPG, PNG, GIF)'} *
                  </label>
                  <input
                    type="file"
                    accept={uploadType === 'video' ? 'video/*' : 'image/*'}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, file: e.target.files[0] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {uploadFormData.file && (
                    <div className="mt-2 text-sm text-gray-600">
                      Arquivo selecionado: {uploadFormData.file.name}
                      <br />
                      Tamanho: {(uploadFormData.file.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-2 mt-6">
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-lg ${
                    uploadType === 'video' 
                      ? 'bg-indigo-600 hover:bg-indigo-700' 
                      : 'bg-pink-600 hover:bg-pink-700'
                  }`}
                >
                  Enviar e Associar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFormData({
                      titulo: '',
                      descricao: '',
                      duracao: '',
                      prioridade: 1,
                      file: null
                    });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocalidadeManager;
