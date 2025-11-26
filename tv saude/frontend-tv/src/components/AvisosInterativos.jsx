import React, { useState, useEffect } from 'react';
import './AvisosInterativos.css';

// Componente de Avisos Interativos para a Interface TV
const AvisosInterativos = ({ ubsId = null }) => {
  const [avisos, setAvisos] = useState([]);
  const [avisoAtual, setAvisoAtual] = useState(null);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [mostrandoAviso, setMostrandoAviso] = useState(false);
  const [config, setConfig] = useState({
    intervaloRotacao: 15000, // 15 segundos
    tempoExibicao: 5000,     // 5 segundos por aviso
    posicao: 'bottom-right',  // posição na tela
    animacao: 'slide-in',     // tipo de animação
    autoHide: true            // esconder automaticamente
  });

  // Buscar avisos ativos
  useEffect(() => {
    const buscarAvisos = async () => {
      try {
        const url = ubsId 
          ? `/api/avisos/ativos/${ubsId}`
          : '/api/avisos/ativos';
          
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success && data.avisos.length > 0) {
          setAvisos(data.avisos);
          console.log(`📢 ${data.avisos.length} avisos carregados`);
        } else {
          setAvisos([]);
        }
      } catch (error) {
        console.error('❌ Erro ao buscar avisos:', error);
        setAvisos([]);
      }
    };

    buscarAvisos();
    
    // Atualizar avisos a cada 2 minutos
    const interval = setInterval(buscarAvisos, 120000);
    return () => clearInterval(interval);
  }, [ubsId]);

  // Rotacionar avisos
  useEffect(() => {
    if (avisos.length === 0) {
      setMostrandoAviso(false);
      return;
    }

    const mostrarProximoAviso = () => {
      const aviso = avisos[indiceAtual];
      setAvisoAtual(aviso);
      setMostrandoAviso(true);
      
      // Registrar exibição
      registrarExibicao(aviso.id, config.tempoExibicao);
      
      // Esconder após tempo configurado
      if (config.autoHide) {
        setTimeout(() => {
          setMostrandoAviso(false);
        }, aviso.duration || config.tempoExibicao);
      }
      
      // Próximo aviso
      setTimeout(() => {
        setIndiceAtual((prev) => (prev + 1) % avisos.length);
      }, (aviso.duration || config.tempoExibicao) + 2000); // 2s de pausa
    };

    const timer = setTimeout(mostrarProximoAviso, 1000);
    return () => clearTimeout(timer);
  }, [avisos, indiceAtual, config]);

  // Registrar exibição do aviso
  const registrarExibicao = async (avisoId, duracao) => {
    try {
      await fetch(`/api/avisos/${avisoId}/exibicao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ubs_id: ubsId,
          duracao: duracao
        })
      });
    } catch (error) {
      console.error('❌ Erro ao registrar exibição:', error);
    }
  };

  // Fechar aviso manualmente
  const fecharAviso = () => {
    setMostrandoAviso(false);
  };

  // Próximo aviso manual
  const proximoAviso = () => {
    setIndiceAtual((prev) => (prev + 1) % avisos.length);
  };

  // Aviso anterior manual
  const avisoAnterior = () => {
    setIndiceAtual((prev) => (prev - 1 + avisos.length) % avisos.length);
  };

  // Formatar mensagem com quebras de linha
  const formatarMensagem = (mensagem) => {
    return mensagem.split('\n').map((linha, index) => (
      <React.Fragment key={index}>
        {linha}
        {index < mensagem.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  // Obter classe CSS baseada no tipo
  const obterClasseTipo = (tipo) => {
    const classes = {
      consulta: 'aviso-consulta',
      medicacao: 'aviso-medicacao', 
      campanha: 'aviso-campanha',
      urgencia: 'aviso-urgencia',
      informativo: 'aviso-informativo',
      horario: 'aviso-horario',
      evento: 'aviso-evento'
    };
    return classes[tipo] || 'aviso-informativo';
  };

  // Não renderizar se não há avisos
  if (avisos.length === 0) {
    return null;
  }

  return (
    <div className="avisos-container">
      {/* Indicador de avisos disponíveis */}
      {avisos.length > 0 && !mostrandoAviso && (
        <div className="avisos-indicator">
          <span className="indicator-icon">📢</span>
          <span className="indicator-count">{avisos.length}</span>
        </div>
      )}

      {/* Aviso atual */}
      {mostrandoAviso && avisoAtual && (
        <div 
          className={`aviso-popup ${obterClasseTipo(avisoAtual.tipo)} ${config.animacao} ${config.posicao}`}
          style={{ borderLeftColor: avisoAtual.color }}
        >
          {/* Cabeçalho do aviso */}
          <div className="aviso-header">
            <div className="aviso-tipo">
              <span className="tipo-icon">{avisoAtual.icon}</span>
              <span className="tipo-label">{avisoAtual.tipo.toUpperCase()}</span>
            </div>
            
            <div className="aviso-controles">
              {avisos.length > 1 && (
                <>
                  <button 
                    onClick={avisoAnterior}
                    className="controle-btn"
                    title="Aviso anterior"
                  >
                    ◀
                  </button>
                  <span className="aviso-contador">
                    {indiceAtual + 1}/{avisos.length}
                  </span>
                  <button 
                    onClick={proximoAviso}
                    className="controle-btn"
                    title="Próximo aviso"
                  >
                    ▶
                  </button>
                </>
              )}
              <button 
                onClick={fecharAviso}
                className="fechar-btn"
                title="Fechar aviso"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Conteúdo do aviso */}
          <div className="aviso-conteudo">
            <h3 className="aviso-titulo">{avisoAtual.titulo}</h3>
            <p className="aviso-mensagem">
              {formatarMensagem(avisoAtual.mensagem)}
            </p>
          </div>

          {/* Rodapé com horário */}
          <div className="aviso-rodape">
            <span className="aviso-horario">
              🕐 {new Date().toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
            {avisoAtual.prioridade > 3 && (
              <span className="aviso-prioridade">
                ⚡ URGENTE
              </span>
            )}
          </div>

          {/* Barra de progresso */}
          <div className="aviso-progresso">
            <div 
              className="progresso-barra"
              style={{
                animationDuration: `${avisoAtual.duration || config.tempoExibicao}ms`
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Painel de configurações (oculto por padrão) */}
      <div className="avisos-config" style={{ display: 'none' }}>
        <h4>⚙️ Configurações de Avisos</h4>
        
        <label>
          Intervalo de Rotação (ms):
          <input
            type="number"
            value={config.intervaloRotacao}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              intervaloRotacao: parseInt(e.target.value)
            }))}
            min="5000"
            max="60000"
            step="1000"
          />
        </label>

        <label>
          Tempo de Exibição (ms):
          <input
            type="number"
            value={config.tempoExibicao}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              tempoExibicao: parseInt(e.target.value)
            }))}
            min="3000"
            max="30000"
            step="1000"
          />
        </label>

        <label>
          Posição na Tela:
          <select
            value={config.posicao}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              posicao: e.target.value
            }))}
          >
            <option value="top-left">Superior Esquerda</option>
            <option value="top-right">Superior Direita</option>
            <option value="bottom-left">Inferior Esquerda</option>
            <option value="bottom-right">Inferior Direita</option>
            <option value="center">Centro</option>
          </select>
        </label>

        <label>
          <input
            type="checkbox"
            checked={config.autoHide}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              autoHide: e.target.checked
            }))}
          />
          Esconder Automaticamente
        </label>
      </div>

      {/* Lista de avisos em espera */}
      {avisos.length > 1 && (
        <div className="avisos-fila">
          <h5>📋 Próximos Avisos:</h5>
          <ul>
            {avisos
              .slice(indiceAtual + 1, indiceAtual + 4)
              .concat(avisos.slice(0, Math.max(0, indiceAtual + 4 - avisos.length)))
              .map((aviso, index) => (
                <li key={`${aviso.id}-${index}`} className="aviso-fila-item">
                  <span className="fila-icon">{aviso.icon}</span>
                  <span className="fila-titulo">{aviso.titulo}</span>
                </li>
              ))
            }
          </ul>
        </div>
      )}
    </div>
  );
};

export default AvisosInterativos;
