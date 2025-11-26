import React, { useState, useEffect } from 'react';
import './AvisosSincronizados.css';

// Componente para exibir avisos sincronizados do servidor principal
const AvisosSincronizados = () => {
  const [avisos, setAvisos] = useState([]);
  const [avisoAtual, setAvisoAtual] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);

  const SERVIDOR_PRINCIPAL = 'http://localhost:3001/api';
  const INTERVALO_SINCRONIZACAO = 30000; // 30 segundos
  const INTERVALO_ROTACAO = 8000; // 8 segundos

  // Buscar avisos do servidor principal
  const buscarAvisos = async () => {
    try {
      const response = await fetch(`${SERVIDOR_PRINCIPAL}/avisos/ativos`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const avisosAtivos = data.data.filter(aviso => aviso.ativo);
        setAvisos(avisosAtivos);
        console.log(`📥 ${avisosAtivos.length} avisos sincronizados`);
        
        // Reset para primeiro aviso se lista mudou
        setAvisoAtual(0);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar avisos:', error);
      
      // Tentar ler do cache local como fallback
      await lerCacheLocal();
    } finally {
      setLoading(false);
    }
  };

  // Ler cache local como fallback
  const lerCacheLocal = async () => {
    try {
      // Tentar ler arquivo de cache se disponível
      const response = await fetch('/cache-avisos/avisos-tv.json');
      if (response.ok) {
        const cacheData = await response.json();
        setAvisos(cacheData.avisos || []);
        console.log('📂 Avisos carregados do cache local');
      }
    } catch (error) {
      console.log('⚠️ Cache local não disponível');
    }
  };

  // Verificar status da sincronização
  const verificarStatus = async () => {
    try {
      const response = await fetch(`${SERVIDOR_PRINCIPAL}/sync/status`);
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.data);
      }
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
    }
  };

  // Configurar sincronização automática
  useEffect(() => {
    // Busca inicial
    buscarAvisos();
    verificarStatus();

    // Sincronização periódica
    const intervaloBusca = setInterval(buscarAvisos, INTERVALO_SINCRONIZACAO);
    const intervaloStatus = setInterval(verificarStatus, 60000); // 1 minuto

    return () => {
      clearInterval(intervaloBusca);
      clearInterval(intervaloStatus);
    };
  }, []);

  // Configurar rotação de avisos
  useEffect(() => {
    if (avisos.length === 0) return;

    const intervaloRotacao = setInterval(() => {
      setAvisoAtual(atual => (atual + 1) % avisos.length);
    }, INTERVALO_ROTACAO);

    return () => clearInterval(intervaloRotacao);
  }, [avisos.length]);

  // Obter cor do tipo de aviso
  const obterCorTipo = (tipo) => {
    const cores = {
      'informativo': '#3498db',
      'consulta': '#2980b9', 
      'medicacao': '#27ae60',
      'campanha': '#e74c3c',
      'urgencia': '#f39c12',
      'horario': '#34495e',
      'evento': '#16a085'
    };
    return cores[tipo] || '#95a5a6';
  };

  // Obter ícone do tipo
  const obterIconeTipo = (tipo) => {
    const icones = {
      'informativo': '📋',
      'consulta': '👨‍⚕️',
      'medicacao': '💊',
      'campanha': '📢',
      'urgencia': '🚨',
      'horario': '🕐',
      'evento': '🎪'
    };
    return icones[tipo] || 'ℹ️';
  };

  // Renderização condicional
  if (loading) {
    return (
      <div className="avisos-loading">
        <div className="loading-spinner"></div>
        <p>Sincronizando avisos...</p>
      </div>
    );
  }

  if (avisos.length === 0) {
    return (
      <div className="avisos-vazio">
        <div className="icone-vazio">📭</div>
        <p>Nenhum aviso disponível</p>
        {status && (
          <small>
            Última sincronização: {new Date(status.ultima_atualizacao).toLocaleTimeString()}
          </small>
        )}
      </div>
    );
  }

  const aviso = avisos[avisoAtual];

  return (
    <div className="avisos-sincronizados">
      <div 
        className={`aviso-card ${aviso.tipo} ${aviso.tipo === 'urgencia' ? 'urgente' : ''}`}
        style={{ borderLeftColor: obterCorTipo(aviso.tipo) }}
      >
        {/* Header do aviso */}
        <div className="aviso-header">
          <div className="aviso-tipo">
            <span className="tipo-icone">{obterIconeTipo(aviso.tipo)}</span>
            <span className="tipo-nome">{aviso.tipo.toUpperCase()}</span>
          </div>
          {aviso.tipo === 'urgencia' && (
            <div className="badge-urgente">URGENTE</div>
          )}
        </div>

        {/* Conteúdo do aviso */}
        <div className="aviso-conteudo">
          <h2 className="aviso-titulo">{aviso.titulo}</h2>
          <div className="aviso-mensagem">
            {aviso.mensagem.split('\n').map((linha, index) => (
              <p key={index}>{linha}</p>
            ))}
          </div>
        </div>

        {/* Rodapé com informações */}
        <div className="aviso-footer">
          <div className="aviso-info">
            {aviso.horario_inicio && (
              <span className="horario">
                🕐 {aviso.horario_inicio}
                {aviso.horario_fim && ` - ${aviso.horario_fim}`}
              </span>
            )}
            {aviso.data_fim && (
              <span className="validade">
                📅 Até {new Date(aviso.data_fim).toLocaleDateString()}
              </span>
            )}
          </div>
          
          <div className="contador-avisos">
            {avisoAtual + 1} / {avisos.length}
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              animationDuration: `${INTERVALO_ROTACAO}ms`,
              backgroundColor: obterCorTipo(aviso.tipo)
            }}
          ></div>
        </div>
      </div>

      {/* Indicador de sincronização */}
      {status && (
        <div className="status-sync">
          <div className={`sync-indicator ${status.ativo ? 'ativo' : 'inativo'}`}>
            <span className="sync-icon">🔄</span>
            <span className="sync-text">
              {status.ativo ? 'Sincronizado' : 'Desconectado'}
            </span>
            {status.ultima_atualizacao && (
              <span className="sync-time">
                {new Date(status.ultima_atualizacao).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Controles manuais (ocultos, apenas para desenvolvimento) */}
      <div className="controles-dev" style={{ display: 'none' }}>
        <button onClick={() => setAvisoAtual(Math.max(0, avisoAtual - 1))}>
          ⬅️ Anterior
        </button>
        <button onClick={buscarAvisos}>
          🔄 Atualizar
        </button>
        <button onClick={() => setAvisoAtual(Math.min(avisos.length - 1, avisoAtual + 1))}>
          ➡️ Próximo
        </button>
      </div>
    </div>
  );
};

export default AvisosSincronizados;
