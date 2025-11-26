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
  const [editandoAviso, setEditandoAviso] = useState(null);
  const [statusSync, setStatusSync] = useState({ online: false, ultimo_sync: null });
  const [carregando, setCarregando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    carregarAvisos();
    carregarUbs();
    verificarStatusSync();
    
    // Verificar status a cada 30 segundos
    const interval = setInterval(verificarStatusSync, 30000);
    return () => clearInterval(interval);
  }, []);

  const carregarAvisos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/avisos`);
      if (response.ok) {
        const data = await response.json();
        // Garantir que data é um array
        setAvisos(Array.isArray(data) ? data : []);
      } else {
        console.error('Erro ao carregar avisos - Status:', response.status);
        setAvisos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar avisos:', error);
      setAvisos([]);
    }
  };

  const carregarUbs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ubs`);
      if (response.ok) {
        const data = await response.json();
        // Garantir que data é um array
        setUbs(Array.isArray(data) ? data : []);
      } else {
        console.error('Erro ao carregar UBS - Status:', response.status);
        setUbs([]);
      }
    } catch (error) {
      console.error('Erro ao carregar UBS:', error);
      setUbs([]);
    }
  };

  const verificarStatusSync = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sync/status`);
      if (response.ok) {
        const status = await response.json();
        setStatusSync(status);
      } else {
        setStatusSync({ online: false, ultimo_sync: null });
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      setStatusSync({ online: false, ultimo_sync: null });
    }
  };

  const sincronizarAgora = async () => {
    setCarregando(true);
    try {
      const response = await fetch(`${API_BASE_URL}/sync/manual`, {
        method: 'POST'
      });
      if (response.ok) {
        alert('Sincronização executada com sucesso!');
        verificarStatusSync();
      } else {
        alert('Erro na sincronização');
      }
    } catch (error) {
      alert('Erro na sincronização: ' + error.message);
    }
    setCarregando(false);
  };

  const criarAviso = async (e) => {
    e.preventDefault();
    setCarregando(true);
    try {
      const response = await fetch(`${API_BASE_URL}/avisos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(novoAviso),
      });
      
      if (response.ok) {
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
        setMostrarFormulario(false);
        carregarAvisos();
        alert('Aviso criado com sucesso!');
      } else {
        alert('Erro ao criar aviso');
      }
    } catch (error) {
      console.error('Erro ao criar aviso:', error);
      alert('Erro ao criar aviso');
    }
    setCarregando(false);
  };

  const editarAviso = async (e) => {
    e.preventDefault();
    setCarregando(true);
    try {
      const response = await fetch(`${API_BASE_URL}/avisos/${editandoAviso.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editandoAviso),
      });
      
      if (response.ok) {
        setEditandoAviso(null);
        carregarAvisos();
        alert('Aviso atualizado com sucesso!');
      } else {
        alert('Erro ao editar aviso');
      }
    } catch (error) {
      console.error('Erro ao editar aviso:', error);
      alert('Erro ao editar aviso');
    }
    setCarregando(false);
  };

  const excluirAviso = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este aviso?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/avisos/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          carregarAvisos();
          alert('Aviso excluído com sucesso!');
        } else {
          alert('Erro ao excluir aviso');
        }
      } catch (error) {
        console.error('Erro ao excluir aviso:', error);
        alert('Erro ao excluir aviso');
      }
    }
  };

  const alternarStatus = async (id, ativo) => {
    try {
      const response = await fetch(`${API_BASE_URL}/avisos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ativo: !ativo }),
      });
      
      if (response.ok) {
        carregarAvisos();
      } else {
        alert('Erro ao alterar status');
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const criarAvisosExemplo = async () => {
    setCarregando(true);
    try {
      const response = await fetch(`${API_BASE_URL}/avisos/criar-exemplos`, {
        method: 'POST',
      });
      
      if (response.ok) {
        carregarAvisos();
        alert('Avisos de exemplo criados com sucesso!');
      } else {
        alert('Erro ao criar avisos de exemplo');
      }
    } catch (error) {
      console.error('Erro ao criar avisos de exemplo:', error);
      alert('Erro ao criar avisos de exemplo');
    }
    setCarregando(false);
  };

  return (
    <div className="gerenciador-avisos">
      {/* Header com Status e Controles */}
      <div className="avisos-header">
        <h1>🎯 Avisos Interativos</h1>
        <div className="header-actions">
          <div className="status-container">
            <div className={`status-indicator ${statusSync.online ? 'online' : 'offline'}`}>
              <span className="status-dot"></span>
              <span className="status-text">
                {statusSync.online ? 'Sistema Online' : 'Sistema Offline'}
              </span>
              {statusSync.ultimo_sync && (
                <small className="last-sync">
                  Último sync: {new Date(statusSync.ultimo_sync).toLocaleString()}
                </small>
              )}
            </div>
          </div>
          
          <div className="control-buttons">
            <button 
              onClick={verificarStatusSync} 
              disabled={carregando}
              className="btn-verificar"
            >
              🔄 Verificar Status
            </button>
            <button 
              onClick={sincronizarAgora} 
              disabled={carregando}
              className="btn-sync"
            >
              {carregando ? '⏳ Sincronizando...' : '🚀 Sync Manual'}
            </button>
            <button 
              onClick={criarAvisosExemplo} 
              disabled={carregando}
              className="btn-exemplo"
            >
              📝 Criar Exemplos
            </button>
            <button 
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className="btn-novo-aviso"
            >
              ➕ Novo Aviso
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard de Estatísticas */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{Array.isArray(avisos) ? avisos.length : 0}</h3>
            <p>Total de Avisos</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{Array.isArray(avisos) ? avisos.filter(a => a.ativo).length : 0}</h3>
            <p>Avisos Ativos</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏥</div>
          <div className="stat-content">
            <h3>{Array.isArray(ubs) ? ubs.length : 0}</h3>
            <p>UBS Cadastradas</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <h3>{statusSync.online ? 'ON' : 'OFF'}</h3>
            <p>Sincronização</p>
          </div>
        </div>
      </div>

      {/* Formulário de Criação/Edição */}
      {(mostrarFormulario || editandoAviso) && (
        <div className="form-container">
          <div className="form-header">
            <h2>
              {editandoAviso ? '✏️ Editar Aviso' : '➕ Criar Novo Aviso'}
            </h2>
            <button 
              onClick={() => {
                setMostrarFormulario(false);
                setEditandoAviso(null);
              }}
              className="btn-close"
            >
              ❌
            </button>
          </div>
          
          <form onSubmit={editandoAviso ? editarAviso : criarAviso} className="aviso-form">
            <div className="form-grid">
              <div className="form-group">
                <label>📝 Título:</label>
                <input
                  type="text"
                  value={editandoAviso ? editandoAviso.titulo : novoAviso.titulo}
                  onChange={(e) => {
                    const valor = e.target.value;
                    if (editandoAviso) {
                      setEditandoAviso({...editandoAviso, titulo: valor});
                    } else {
                      setNovoAviso({...novoAviso, titulo: valor});
                    }
                  }}
                  required
                  placeholder="Digite o título do aviso..."
                />
              </div>

              <div className="form-group full-width">
                <label>💬 Mensagem:</label>
                <textarea
                  value={editandoAviso ? editandoAviso.mensagem : novoAviso.mensagem}
                  onChange={(e) => {
                    const valor = e.target.value;
                    if (editandoAviso) {
                      setEditandoAviso({...editandoAviso, mensagem: valor});
                    } else {
                      setNovoAviso({...novoAviso, mensagem: valor});
                    }
                  }}
                  required
                  rows="4"
                  placeholder="Digite a mensagem do aviso..."
                />
              </div>

              <div className="form-group">
                <label>🏷️ Tipo:</label>
                <select
                  value={editandoAviso ? editandoAviso.tipo : novoAviso.tipo}
                  onChange={(e) => {
                    const valor = e.target.value;
                    if (editandoAviso) {
                      setEditandoAviso({...editandoAviso, tipo: valor});
                    } else {
                      setNovoAviso({...novoAviso, tipo: valor});
                    }
                  }}
                >
                  <option value="informativo">📢 Informativo</option>
                  <option value="urgente">⚠️ Urgente</option>
                  <option value="manutencao">🔧 Manutenção</option>
                  <option value="emergencia">🚨 Emergência</option>
                </select>
              </div>

              <div className="form-group">
                <label>🏥 UBS:</label>
                <select
                  value={editandoAviso ? editandoAviso.ubs_id || '' : novoAviso.ubs_id || ''}
                  onChange={(e) => {
                    const valor = e.target.value || null;
                    if (editandoAviso) {
                      setEditandoAviso({...editandoAviso, ubs_id: valor});
                    } else {
                      setNovoAviso({...novoAviso, ubs_id: valor});
                    }
                  }}
                >
                  <option value="">🌐 Todas as UBS</option>
                  {Array.isArray(ubs) && ubs.map(unidade => (
                    <option key={unidade.id} value={unidade.id}>
                      {unidade.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>⭐ Prioridade:</label>
                <select
                  value={editandoAviso ? editandoAviso.prioridade : novoAviso.prioridade}
                  onChange={(e) => {
                    const valor = parseInt(e.target.value);
                    if (editandoAviso) {
                      setEditandoAviso({...editandoAviso, prioridade: valor});
                    } else {
                      setNovoAviso({...novoAviso, prioridade: valor});
                    }
                  }}
                >
                  <option value={1}>🔵 Baixa</option>
                  <option value={2}>🟡 Média</option>
                  <option value={3}>🔴 Alta</option>
                </select>
              </div>

              <div className="form-group">
                <label>📅 Data Início:</label>
                <input
                  type="date"
                  value={editandoAviso ? editandoAviso.data_inicio : novoAviso.data_inicio}
                  onChange={(e) => {
                    const valor = e.target.value;
                    if (editandoAviso) {
                      setEditandoAviso({...editandoAviso, data_inicio: valor});
                    } else {
                      setNovoAviso({...novoAviso, data_inicio: valor});
                    }
                  }}
                />
              </div>

              <div className="form-group">
                <label>📅 Data Fim:</label>
                <input
                  type="date"
                  value={editandoAviso ? editandoAviso.data_fim : novoAviso.data_fim}
                  onChange={(e) => {
                    const valor = e.target.value;
                    if (editandoAviso) {
                      setEditandoAviso({...editandoAviso, data_fim: valor});
                    } else {
                      setNovoAviso({...novoAviso, data_fim: valor});
                    }
                  }}
                />
              </div>

              <div className="form-group">
                <label>🕐 Horário Início:</label>
                <input
                  type="time"
                  value={editandoAviso ? editandoAviso.horario_inicio : novoAviso.horario_inicio}
                  onChange={(e) => {
                    const valor = e.target.value;
                    if (editandoAviso) {
                      setEditandoAviso({...editandoAviso, horario_inicio: valor});
                    } else {
                      setNovoAviso({...novoAviso, horario_inicio: valor});
                    }
                  }}
                />
              </div>

              <div className="form-group">
                <label>🕐 Horário Fim:</label>
                <input
                  type="time"
                  value={editandoAviso ? editandoAviso.horario_fim : novoAviso.horario_fim}
                  onChange={(e) => {
                    const valor = e.target.value;
                    if (editandoAviso) {
                      setEditandoAviso({...editandoAviso, horario_fim: valor});
                    } else {
                      setNovoAviso({...novoAviso, horario_fim: valor});
                    }
                  }}
                />
              </div>

              <div className="form-group">
                <label>🎨 Cor de Fundo:</label>
                <input
                  type="color"
                  value={editandoAviso ? editandoAviso.cor_fundo : novoAviso.cor_fundo}
                  onChange={(e) => {
                    const valor = e.target.value;
                    if (editandoAviso) {
                      setEditandoAviso({...editandoAviso, cor_fundo: valor});
                    } else {
                      setNovoAviso({...novoAviso, cor_fundo: valor});
                    }
                  }}
                />
              </div>

              <div className="form-group">
                <label>🎨 Cor do Texto:</label>
                <input
                  type="color"
                  value={editandoAviso ? editandoAviso.cor_texto : novoAviso.cor_texto}
                  onChange={(e) => {
                    const valor = e.target.value;
                    if (editandoAviso) {
                      setEditandoAviso({...editandoAviso, cor_texto: valor});
                    } else {
                      setNovoAviso({...novoAviso, cor_texto: valor});
                    }
                  }}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-salvar" disabled={carregando}>
                {carregando ? '⏳ Salvando...' : (editandoAviso ? '💾 Atualizar' : '💾 Criar Aviso')}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setMostrarFormulario(false);
                  setEditandoAviso(null);
                }}
                className="btn-cancelar"
              >
                ❌ Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Avisos */}
      <div className="avisos-list-container">
        <div className="list-header">
          <h2>📋 Avisos Cadastrados ({Array.isArray(avisos) ? avisos.length : 0})</h2>
        </div>
        
        <div className="avisos-grid">
          {!Array.isArray(avisos) || avisos.length === 0 ? (
            <div className="no-avisos">
              <div className="no-avisos-icon">📝</div>
              <h3>Nenhum aviso cadastrado</h3>
              <p>Clique em "Criar Exemplos" para começar ou "Novo Aviso" para criar um aviso personalizado.</p>
            </div>
          ) : (
            avisos.map(aviso => (
              <div key={aviso.id} className={`aviso-card ${aviso.ativo ? 'ativo' : 'inativo'}`}>
                <div className="aviso-header">
                  <h3>{aviso.titulo}</h3>
                  <div className="aviso-badges">
                    <span className={`badge badge-${aviso.tipo}`}>
                      {aviso.tipo === 'informativo' && '📢'}
                      {aviso.tipo === 'urgente' && '⚠️'}
                      {aviso.tipo === 'manutencao' && '🔧'}
                      {aviso.tipo === 'emergencia' && '🚨'}
                      {aviso.tipo}
                    </span>
                    <span className={`badge badge-prioridade-${aviso.prioridade}`}>
                      {aviso.prioridade === 1 && '🔵'}
                      {aviso.prioridade === 2 && '🟡'}
                      {aviso.prioridade === 3 && '🔴'}
                      Prioridade {aviso.prioridade}
                    </span>
                    <span className={`badge badge-${aviso.ativo ? 'ativo' : 'inativo'}`}>
                      {aviso.ativo ? '✅ Ativo' : '❌ Inativo'}
                    </span>
                  </div>
                </div>
                
                <div className="aviso-content">
                  <p className="aviso-mensagem">{aviso.mensagem}</p>
                  <div className="aviso-info">
                    <small>
                      🏥 UBS: {aviso.ubs_nome || 'Todas'} | 
                      📅 {aviso.data_inicio ? new Date(aviso.data_inicio).toLocaleDateString() : 'Sem data'} - {aviso.data_fim ? new Date(aviso.data_fim).toLocaleDateString() : 'Sem data'} |
                      🕐 {aviso.horario_inicio || 'Sem horário'} - {aviso.horario_fim || 'Sem horário'}
                    </small>
                  </div>
                </div>
                
                <div className="aviso-actions">
                  <button 
                    onClick={() => setEditandoAviso(aviso)} 
                    className="btn-action btn-edit"
                    title="Editar aviso"
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    onClick={() => alternarStatus(aviso.id, aviso.ativo)} 
                    className={`btn-action ${aviso.ativo ? 'btn-deactivate' : 'btn-activate'}`}
                    title={aviso.ativo ? 'Desativar aviso' : 'Ativar aviso'}
                  >
                    {aviso.ativo ? '🔇 Desativar' : '🔊 Ativar'}
                  </button>
                  <button 
                    onClick={() => excluirAviso(aviso.id)} 
                    className="btn-action btn-delete"
                    title="Excluir aviso"
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GerenciadorAvisos;
