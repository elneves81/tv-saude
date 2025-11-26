import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import './GerenciadorAvisos.css';

// Componente para gerenciar avisos no Dashboard Admin
const GerenciadorAvisos = () => {
  const [avisos, setAvisos] = useState([]);
  const [ubs, setUbs] = useState([]);
  const [novoAviso, setNovoAviso] = useState({
    titulo: '',
    mensagem: '',
    tipo: 'informativo',
    ubs_id: null,
    data_inicio: '',
    data_fim: '',
    horario_inicio: '',
    horario_fim: '',
    prioridade: 1,
    ativo: true,
    cor_fundo: '#ffffff',
    cor_texto: '#000000'
  });
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoAviso, setEditandoAviso] = useState(null);
  const [loading, setLoading] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    carregarAvisos();
    carregarUBS();
  }, []);

  // Carregar avisos
  const carregarAvisos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/avisos`);
      
      if (response.ok) {
        const data = await response.json();
        setAvisos(data.data || []);
      } else {
        console.error('Erro ao carregar avisos');
      }
    } catch (error) {
      console.error('Erro ao carregar avisos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar UBS
  const carregarUBS = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ubs`);
      
      if (response.ok) {
        const data = await response.json();
        setUbs(data.data || []);
      } else {
        console.error('Erro ao carregar UBS');
      }
    } catch (error) {
      console.error('Erro ao carregar UBS:', error);
    }
  };

  // Criar novo aviso
  const criarAviso = async () => {
    try {
      setLoading(true);
      
      // Validações básicas
      if (!novoAviso.titulo.trim() || !novoAviso.mensagem.trim()) {
        alert('Título e mensagem são obrigatórios!');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/avisos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(novoAviso)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Aviso criado:', data);
        
        // Recarregar lista
        await carregarAvisos();
        
        // Fechar modal
        setModalAberto(false);
        
        // Resetar formulário
        setNovoAviso({
          titulo: '',
          mensagem: '',
          tipo: 'informativo',
          ubs_id: null,
          data_inicio: '',
          data_fim: '',
          horario_inicio: '',
          horario_fim: '',
          prioridade: 1,
          ativo: true,
          cor_fundo: '#ffffff',
          cor_texto: '#000000'
        });
        
        alert('✅ Aviso criado com sucesso!');
      } else {
        const errorData = await response.json();
        console.error('Erro ao criar aviso:', errorData);
        alert(`❌ Erro ao criar aviso: ${errorData.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('❌ Erro ao criar aviso:', error);
      alert('❌ Erro ao criar aviso');
    } finally {
      setLoading(false);
    }
  };

  // Atualizar aviso
  const atualizarAviso = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/avisos/${editandoAviso.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(novoAviso)
      });

      if (response.ok) {
        await carregarAvisos();
        setModalAberto(false);
        setEditandoAviso(null);
        alert('✅ Aviso atualizado com sucesso!');
      } else {
        const errorData = await response.json();
        alert(`❌ Erro ao atualizar aviso: ${errorData.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar aviso:', error);
      alert('❌ Erro ao atualizar aviso');
    } finally {
      setLoading(false);
    }
  };

  // Excluir aviso
  const excluirAviso = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este aviso?')) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/avisos/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await carregarAvisos();
        alert('✅ Aviso excluído com sucesso!');
      } else {
        const errorData = await response.json();
        alert(`❌ Erro ao excluir aviso: ${errorData.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('❌ Erro ao excluir aviso:', error);
      alert('❌ Erro ao excluir aviso');
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para edição
  const abrirModalEdicao = (aviso) => {
    setEditandoAviso(aviso);
    setNovoAviso({
      titulo: aviso.titulo,
      mensagem: aviso.mensagem,
      tipo: aviso.tipo,
      ubs_id: aviso.ubs_id,
      data_inicio: aviso.data_inicio,
      data_fim: aviso.data_fim,
      horario_inicio: aviso.horario_inicio,
      horario_fim: aviso.horario_fim,
      prioridade: aviso.prioridade,
      ativo: aviso.ativo,
      cor_fundo: aviso.cor_fundo || '#ffffff',
      cor_texto: aviso.cor_texto || '#000000'
    });
    setModalAberto(true);
  };

  // Fechar modal
  const fecharModal = () => {
    setModalAberto(false);
    setEditandoAviso(null);
    setNovoAviso({
      titulo: '',
      mensagem: '',
      tipo: 'informativo',
      ubs_id: null,
      data_inicio: '',
      data_fim: '',
      horario_inicio: '',
      horario_fim: '',
      prioridade: 1,
      ativo: true,
      cor_fundo: '#ffffff',
      cor_texto: '#000000'
    });
  };

  // Funções de sincronização manual
  const forcarSincronizacao = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sync/forcar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`✅ Sincronização forçada! Status: ${result.ativo ? 'Ativo' : 'Inativo'}`);
      } else {
        throw new Error('Erro na sincronização');
      }
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      alert('❌ Erro ao forçar sincronização');
    }
  };

  const verificarStatusSync = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sync/status`);
      
      if (response.ok) {
        const status = await response.json();
        const ultimaSync = status.ultima_atualizacao || status.ultimaAtualizacao
          ? new Date(status.ultima_atualizacao || status.ultimaAtualizacao).toLocaleString('pt-BR')
          : 'Nunca';
          
        const intervalosAtivos = status.intervalos_ativos || status.intervalosAtivos || [];
          
        alert(`📊 Status da Sincronização:
        
🔄 Ativo: ${status.ativo ? 'Sim' : 'Não'}
⏰ Última sync: ${ultimaSync}
📡 Servidor: ${status.servidor_principal || status.servidorPrincipal || 'N/A'}
📺 Frontend TV: ${status.frontend_tv || status.frontendTV || 'N/A'}
🔗 Intervalos ativos: ${intervalosAtivos.length > 0 ? intervalosAtivos.join(', ') : 'Nenhum'}`);
      } else {
        throw new Error('Erro ao verificar status');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      alert('❌ Erro ao verificar status da sincronização');
    }
  };

  const enviarAvisoEspecifico = async (avisoId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sync/aviso/${avisoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`✅ Aviso ${avisoId} enviado para TV!`);
      } else {
        throw new Error('Erro ao enviar aviso');
      }
    } catch (error) {
      console.error('❌ Erro ao enviar aviso:', error);
      alert('❌ Erro ao enviar aviso para TV');
    }
  };

  // Formatar data para exibição
  const formatarData = (data) => {
    if (!data) return 'N/A';
    try {
      return new Date(data).toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  // Obter nome da UBS
  const obterNomeUBS = (ubsId) => {
    if (!ubsId) return 'Todas as UBS';
    const ubsEncontrada = ubs.find(u => u.id === ubsId);
    return ubsEncontrada ? ubsEncontrada.nome : 'UBS não encontrada';
  };

  return (
    <div className="gerenciador-avisos">
      {/* Header */}
      <div className="avisos-header">
        <h1>🎯 Gerenciador de Avisos Interativos</h1>
        <div className="header-actions">
          <div className="sync-buttons">
            <button onClick={verificarStatusSync} className="btn-status-sync">
              📊 Status Sync
            </button>
            <button onClick={forcarSincronizacao} className="btn-forcar-sync">
              🚀 Sincronizar TV
            </button>
          </div>
          <button 
            onClick={() => setModalAberto(true)} 
            className="btn-novo-aviso"
            disabled={loading}
          >
            ➕ Novo Aviso
          </button>
          <button 
            onClick={carregarAvisos} 
            className="btn-atualizar"
            disabled={loading}
          >
            🔄 Atualizar
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando...</p>
        </div>
      )}

      {/* Lista de Avisos */}
      <div className="avisos-lista">
        <h2>📋 Avisos Cadastrados ({avisos.length})</h2>
        
        {avisos.length === 0 ? (
          <div className="sem-avisos">
            <p>📢 Nenhum aviso cadastrado ainda.</p>
            <button onClick={() => setModalAberto(true)} className="btn-criar-primeiro">
              ➕ Criar Primeiro Aviso
            </button>
          </div>
        ) : (
          <div className="avisos-grid">
            {avisos.map((aviso) => (
              <div 
                key={aviso.id} 
                className={`aviso-card ${aviso.tipo} ${aviso.ativo ? 'ativo' : 'inativo'}`}
                style={{
                  backgroundColor: aviso.cor_fundo || '#ffffff',
                  color: aviso.cor_texto || '#000000'
                }}
              >
                <div className="aviso-header">
                  <h3>{aviso.titulo}</h3>
                  <div className="aviso-badges">
                    <span className={`badge-tipo ${aviso.tipo}`}>
                      {aviso.tipo === 'informativo' && '📢'}
                      {aviso.tipo === 'urgencia' && '🚨'}
                      {aviso.tipo === 'evento' && '📅'}
                      {aviso.tipo === 'consulta' && '👩‍⚕️'}
                      {aviso.tipo}
                    </span>
                    <span className={`badge-status ${aviso.ativo ? 'ativo' : 'inativo'}`}>
                      {aviso.ativo ? '✅ Ativo' : '❌ Inativo'}
                    </span>
                    <span className="badge-prioridade">
                      🔥 {aviso.prioridade}
                    </span>
                  </div>
                </div>

                <div className="aviso-conteudo">
                  <p className="aviso-mensagem">{aviso.mensagem}</p>
                  
                  <div className="aviso-detalhes">
                    <div className="detalhe">
                      <strong>🏥 UBS:</strong> {obterNomeUBS(aviso.ubs_id)}
                    </div>
                    
                    {aviso.data_inicio && (
                      <div className="detalhe">
                        <strong>📅 Período:</strong> 
                        {formatarData(aviso.data_inicio)} - {formatarData(aviso.data_fim)}
                      </div>
                    )}
                    
                    {aviso.horario_inicio && (
                      <div className="detalhe">
                        <strong>🕐 Horário:</strong> 
                        {aviso.horario_inicio} - {aviso.horario_fim}
                      </div>
                    )}
                  </div>
                </div>

                <div className="aviso-acoes">
                  <button 
                    onClick={() => abrirModalEdicao(aviso)}
                    className="btn-editar"
                    disabled={loading}
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    onClick={() => excluirAviso(aviso.id)}
                    className="btn-excluir"
                    disabled={loading}
                  >
                    🗑️ Excluir
                  </button>
                  <button 
                    onClick={() => enviarAvisoEspecifico(aviso.id)}
                    className="btn-enviar-tv"
                    disabled={loading}
                  >
                    📺 Enviar p/ TV
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Criação/Edição */}
      {modalAberto && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editandoAviso ? '✏️ Editar Aviso' : '➕ Novo Aviso'}
              </h2>
              <button onClick={fecharModal} className="btn-fechar-modal">
                ✖️
              </button>
            </div>

            <div className="modal-body aviso-form-modal">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="titulo">📝 Título *</label>
                  <input
                    type="text"
                    id="titulo"
                    value={novoAviso.titulo}
                    onChange={(e) => setNovoAviso({...novoAviso, titulo: e.target.value})}
                    placeholder="Ex: Campanha de Vacinação"
                    maxLength="200"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tipo">🏷️ Tipo</label>
                  <select
                    id="tipo"
                    value={novoAviso.tipo}
                    onChange={(e) => setNovoAviso({...novoAviso, tipo: e.target.value})}
                  >
                    <option value="informativo">📢 Informativo</option>
                    <option value="urgencia">🚨 Urgência</option>
                    <option value="evento">📅 Evento</option>
                    <option value="consulta">👩‍⚕️ Consulta</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="mensagem">💬 Mensagem *</label>
                <textarea
                  id="mensagem"
                  value={novoAviso.mensagem}
                  onChange={(e) => setNovoAviso({...novoAviso, mensagem: e.target.value})}
                  placeholder="Digite a mensagem do aviso..."
                  rows="4"
                  maxLength="500"
                />
                <small className="char-count">
                  {novoAviso.mensagem.length}/500 caracteres
                </small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="ubs">🏥 UBS</label>
                  <select
                    id="ubs"
                    value={novoAviso.ubs_id || ''}
                    onChange={(e) => setNovoAviso({...novoAviso, ubs_id: e.target.value || null})}
                  >
                    <option value="">Todas as UBS</option>
                    {ubs.map((unidade) => (
                      <option key={unidade.id} value={unidade.id}>
                        {unidade.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="prioridade">🔥 Prioridade</label>
                  <select
                    id="prioridade"
                    value={novoAviso.prioridade}
                    onChange={(e) => setNovoAviso({...novoAviso, prioridade: parseInt(e.target.value)})}
                  >
                    <option value="1">1 - Baixa</option>
                    <option value="2">2 - Normal</option>
                    <option value="3">3 - Alta</option>
                    <option value="4">4 - Crítica</option>
                    <option value="5">5 - Urgente</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="data_inicio">📅 Data de Início</label>
                  <input
                    type="date"
                    id="data_inicio"
                    value={novoAviso.data_inicio}
                    onChange={(e) => setNovoAviso({...novoAviso, data_inicio: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="data_fim">📅 Data de Fim</label>
                  <input
                    type="date"
                    id="data_fim"
                    value={novoAviso.data_fim}
                    onChange={(e) => setNovoAviso({...novoAviso, data_fim: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="horario_inicio">🕐 Horário de Início</label>
                  <input
                    type="time"
                    id="horario_inicio"
                    value={novoAviso.horario_inicio}
                    onChange={(e) => setNovoAviso({...novoAviso, horario_inicio: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="horario_fim">🕐 Horário de Fim</label>
                  <input
                    type="time"
                    id="horario_fim"
                    value={novoAviso.horario_fim}
                    onChange={(e) => setNovoAviso({...novoAviso, horario_fim: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cor_fundo">🎨 Cor de Fundo</label>
                  <input
                    type="color"
                    id="cor_fundo"
                    value={novoAviso.cor_fundo}
                    onChange={(e) => setNovoAviso({...novoAviso, cor_fundo: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cor_texto">🖋️ Cor do Texto</label>
                  <input
                    type="color"
                    id="cor_texto"
                    value={novoAviso.cor_texto}
                    onChange={(e) => setNovoAviso({...novoAviso, cor_texto: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={novoAviso.ativo}
                    onChange={(e) => setNovoAviso({...novoAviso, ativo: e.target.checked})}
                  />
                  <span className="checkmark"></span>
                  ✅ Aviso ativo (será exibido nas TVs)
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={fecharModal} className="btn-cancelar">
                ❌ Cancelar
              </button>
              <button 
                onClick={editandoAviso ? atualizarAviso : criarAviso}
                className="btn-salvar"
                disabled={loading || !novoAviso.titulo.trim() || !novoAviso.mensagem.trim()}
              >
                {loading ? '⏳ Salvando...' : (editandoAviso ? '💾 Atualizar' : '➕ Criar Aviso')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GerenciadorAvisos;
