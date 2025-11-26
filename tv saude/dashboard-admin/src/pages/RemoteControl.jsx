import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, getUploadsUrl } from '../config/api';
import { useNotification } from '../contexts/NotificationContext';



const RemoteControl = () => {
  const { showSuccess, showError } = useNotification();
  const [tvStatus, setTvStatus] = useState({
    isConnected: false,
    currentVideo: null,
    isPlaying: false,
    playlist: null
  });
  const [lastCommand, setLastCommand] = useState(null);
  const [loading, setLoading] = useState(false);

  // Verificar status da TV
  const checkTvStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/controle/ultimo`);
      setLastCommand(response.data);
      
      // Simular status da TV baseado no último comando
      if (response.data) {
        setTvStatus(prev => ({
          ...prev,
          isConnected: true
        }));
      }
    } catch (error) {
      console.error('Erro ao verificar status da TV:', error);
      setTvStatus(prev => ({
        ...prev,
        isConnected: false
      }));
    }
  };

  useEffect(() => {
    checkTvStatus();
    
    // Verificar status a cada 5 segundos
    const interval = setInterval(checkTvStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Enviar comando para a TV
  const sendCommand = async (comando, parametros = null) => {
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/controle`, {
        comando,
        parametros
      });
      
      showSuccess(`Comando "${comando}" enviado para a TV!`);
      
      // Atualizar status local
      setTvStatus(prev => ({
        ...prev,
        isConnected: true,
        isPlaying: comando === 'play' ? true : comando === 'pause' ? false : prev.isPlaying
      }));
      
      // Verificar status após enviar comando
      setTimeout(checkTvStatus, 1000);
      
    } catch (error) {
      console.error('Erro ao enviar comando:', error);
      showError(error.response?.data?.error || 'Erro ao enviar comando para a TV');
    } finally {
      setLoading(false);
    }
  };

  // Enviar comando de áudio de fundo
  const sendAudioCommand = async (action, trackId = null, volume = null) => {
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/audio/background`, {
        action,
        trackId,
        volume
      });
      
      showSuccess(`Comando de áudio "${action}" enviado para a TV!`);
      setTimeout(checkTvStatus, 1000);
      
    } catch (error) {
      console.error('Erro ao enviar comando de áudio:', error);
      showError(error.response?.data?.error || 'Erro ao enviar comando de áudio para a TV');
    } finally {
      setLoading(false);
    }
  };

  // Enviar comando de visualizador
  const sendVisualizerCommand = async (action, type = null) => {
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/audio/visualizer`, {
        action,
        type
      });
      
      showSuccess(`Comando de visualizador "${action}" enviado para a TV!`);
      setTimeout(checkTvStatus, 1000);
      
    } catch (error) {
      console.error('Erro ao enviar comando de visualizador:', error);
      showError(error.response?.data?.error || 'Erro ao enviar comando de visualizador para a TV');
    } finally {
      setLoading(false);
    }
  };

  // Limpar comandos antigos
  const clearOldCommands = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/controle/limpar`);
      showSuccess('Comandos antigos removidos');
      checkTvStatus();
    } catch (error) {
      console.error('Erro ao limpar comandos:', error);
      showError('Erro ao limpar comandos');
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Controle Remoto da TV</h1>
        <p className="text-gray-600">Controle a reprodução dos vídeos na TV remotamente</p>
      </div>

      {/* Status da TV */}
      <div className="card">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Status da TV</h2>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="p-4 text-center rounded-lg bg-gray-50">
            <div className={`text-2xl font-bold ${tvStatus.isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {tvStatus.isConnected ? '🟢' : '🔴'}
            </div>
            <div className="mt-1 text-sm text-gray-600">
              {tvStatus.isConnected ? 'Conectada' : 'Desconectada'}
            </div>
          </div>
          
          <div className="p-4 text-center rounded-lg bg-gray-50">
            <div className={`text-2xl font-bold ${tvStatus.isPlaying ? 'text-blue-600' : 'text-gray-600'}`}>
              {tvStatus.isPlaying ? '▶️' : '⏸️'}
            </div>
            <div className="mt-1 text-sm text-gray-600">
              {tvStatus.isPlaying ? 'Reproduzindo' : 'Pausado'}
            </div>
          </div>
          
          <div className="p-4 text-center rounded-lg bg-gray-50">
            <div className="text-2xl font-bold text-purple-600">
              📺
            </div>
            <div className="mt-1 text-sm text-gray-600">
              TV Saúde
            </div>
          </div>
        </div>

        {lastCommand && (
          <div className="p-4 mt-4 rounded-lg bg-blue-50">
            <h3 className="mb-2 text-sm font-medium text-blue-900">Último Comando</h3>
            <div className="text-sm text-blue-800">
              <div><strong>Comando:</strong> {lastCommand.comando}</div>
              <div><strong>Enviado em:</strong> {formatTimestamp(lastCommand.timestamp)}</div>
              {lastCommand.parametros && (
                <div><strong>Parâmetros:</strong> {JSON.stringify(lastCommand.parametros)}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controles Básicos */}
      <div className="card">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Controles de Reprodução</h2>
        
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <button
            onClick={() => sendCommand('play')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-6 transition-colors border border-green-200 rounded-lg bg-green-50 hover:bg-green-100 disabled:opacity-50"
          >
            <div className="mb-2 text-3xl">▶️</div>
            <div className="text-sm font-medium text-green-800">Reproduzir</div>
          </button>

          <button
            onClick={() => sendCommand('pause')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-6 transition-colors border border-yellow-200 rounded-lg bg-yellow-50 hover:bg-yellow-100 disabled:opacity-50"
          >
            <div className="mb-2 text-3xl">⏸️</div>
            <div className="text-sm font-medium text-yellow-800">Pausar</div>
          </button>

          <button
            onClick={() => sendCommand('next')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-6 transition-colors border border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100 disabled:opacity-50"
          >
            <div className="mb-2 text-3xl">⏭️</div>
            <div className="text-sm font-medium text-blue-800">Próximo</div>
          </button>

          <button
            onClick={() => sendCommand('previous')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-6 transition-colors border border-purple-200 rounded-lg bg-purple-50 hover:bg-purple-100 disabled:opacity-50"
          >
            <div className="mb-2 text-3xl">⏮️</div>
            <div className="text-sm font-medium text-purple-800">Anterior</div>
          </button>
        </div>
      </div>

      {/* Controles Avançados */}
      <div className="card">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Controles Avançados</h2>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <button
            onClick={() => sendCommand('restart')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-6 transition-colors border border-orange-200 rounded-lg bg-orange-50 hover:bg-orange-100 disabled:opacity-50"
          >
            <div className="mb-2 text-3xl">🔄</div>
            <div className="text-sm font-medium text-orange-800">Reiniciar Vídeo</div>
          </button>

          <button
            onClick={() => sendCommand('reload_playlist')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-6 transition-colors border border-indigo-200 rounded-lg bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50"
          >
            <div className="mb-2 text-3xl">📋</div>
            <div className="text-sm font-medium text-indigo-800">Recarregar Playlist</div>
          </button>

          <button
            onClick={() => sendCommand('refresh')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-6 transition-colors border border-teal-200 rounded-lg bg-teal-50 hover:bg-teal-100 disabled:opacity-50"
          >
            <div className="mb-2 text-3xl">🔃</div>
            <div className="text-sm font-medium text-teal-800">Atualizar TV</div>
          </button>
        </div>
      </div>

      {/* Controles de Volume */}
      <div className="card">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Controles de Volume</h2>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => sendCommand('volume_down')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-6 transition-colors border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 disabled:opacity-50"
          >
            <div className="mb-2 text-3xl">🔉</div>
            <div className="text-sm font-medium text-red-800">Volume -</div>
          </button>

          <button
            onClick={() => sendCommand('mute')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-6 transition-colors border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
          >
            <div className="mb-2 text-3xl">🔇</div>
            <div className="text-sm font-medium text-gray-800">Mudo</div>
          </button>

          <button
            onClick={() => sendCommand('volume_up')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-6 transition-colors border border-green-200 rounded-lg bg-green-50 hover:bg-green-100 disabled:opacity-50"
          >
            <div className="mb-2 text-3xl">🔊</div>
            <div className="text-sm font-medium text-green-800">Volume +</div>
          </button>
        </div>

        {/* Controles de Áudio de Fundo */}
        <div className="pt-4 border-t">
          <h3 className="mb-3 font-medium text-gray-800 text-md">🎵 Áudio de Fundo</h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <button
              onClick={() => sendCommand('background_music_on')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-4 transition-colors border border-green-200 rounded-lg bg-green-50 hover:bg-green-100 disabled:opacity-50"
            >
              <div className="mb-1 text-2xl">🎵</div>
              <div className="text-xs font-medium text-green-800">Ligar</div>
            </button>

            <button
              onClick={() => sendCommand('background_music_off')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-4 transition-colors border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 disabled:opacity-50"
            >
              <div className="mb-1 text-2xl">🔇</div>
              <div className="text-xs font-medium text-red-800">Desligar</div>
            </button>

            <button
              onClick={() => sendCommand('background_volume_up')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-4 transition-colors border border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100 disabled:opacity-50"
            >
              <div className="mb-1 text-2xl">🔊</div>
              <div className="text-xs font-medium text-blue-800">Vol +</div>
            </button>

            <button
              onClick={() => sendCommand('background_volume_down')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-4 transition-colors border border-orange-200 rounded-lg bg-orange-50 hover:bg-orange-100 disabled:opacity-50"
            >
              <div className="mb-1 text-2xl">🔉</div>
              <div className="text-xs font-medium text-orange-800">Vol -</div>
            </button>
          </div>
        </div>
      </div>

      {/* Controles de Áudio Avançados */}
      <div className="card">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">🎚️ Controles de Áudio Avançados</h2>
        
        <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
          <button
            onClick={() => sendAudioCommand('auto_balance')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-6 transition-colors border border-purple-200 rounded-lg bg-purple-50 hover:bg-purple-100 disabled:opacity-50"
          >
            <div className="mb-2 text-3xl">⚖️</div>
            <div className="text-sm font-medium text-purple-800">Balanceamento Automático</div>
          </button>

          <button
            onClick={() => sendAudioCommand('toggle')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-6 transition-colors border border-indigo-200 rounded-lg bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50"
          >
            <div className="mb-2 text-3xl">🎼</div>
            <div className="text-sm font-medium text-indigo-800">Alternar Música de Fundo</div>
          </button>
        </div>

        {/* Seleção de Faixa de Fundo */}
        <div className="pt-4 border-t">
          <h3 className="mb-3 font-medium text-gray-800 text-md">🎶 Faixas de Áudio</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <button
              onClick={() => sendAudioCommand('change_track', 'ambient-1')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-4 transition-colors border border-teal-200 rounded-lg bg-teal-50 hover:bg-teal-100 disabled:opacity-50"
            >
              <div className="mb-1 text-2xl">🌿</div>
              <div className="text-xs font-medium text-teal-800">Ambiente Relaxante</div>
            </button>

            <button
              onClick={() => sendAudioCommand('change_track', 'ambient-2')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-4 transition-colors border rounded-lg bg-emerald-50 hover:bg-emerald-100 border-emerald-200 disabled:opacity-50"
            >
              <div className="mb-1 text-2xl">🌊</div>
              <div className="text-xs font-medium text-emerald-800">Natureza Calma</div>
            </button>

            <button
              onClick={() => sendAudioCommand('change_track', 'ambient-3')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-4 transition-colors border rounded-lg bg-cyan-50 hover:bg-cyan-100 border-cyan-200 disabled:opacity-50"
            >
              <div className="mb-1 text-2xl">🧘</div>
              <div className="text-xs font-medium text-cyan-800">Meditação</div>
            </button>
          </div>
        </div>
      </div>

      {/* Controles de Visualização de Áudio */}
      <div className="card">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">📊 Visualizador de Áudio</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4 md:grid-cols-4">
          <button
            onClick={() => sendVisualizerCommand('toggle')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-4 transition-colors border border-pink-200 rounded-lg bg-pink-50 hover:bg-pink-100 disabled:opacity-50"
          >
            <div className="mb-1 text-2xl">👁️</div>
            <div className="text-xs font-medium text-pink-800">Alternar Visualizador</div>
          </button>

          <button
            onClick={() => sendVisualizerCommand('change_type', 'bars')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-4 transition-colors border rounded-lg bg-violet-50 hover:bg-violet-100 border-violet-200 disabled:opacity-50"
          >
            <div className="mb-1 text-2xl">📊</div>
            <div className="text-xs font-medium text-violet-800">Barras</div>
          </button>

          <button
            onClick={() => sendVisualizerCommand('change_type', 'wave')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-4 transition-colors border rounded-lg bg-fuchsia-50 hover:bg-fuchsia-100 border-fuchsia-200 disabled:opacity-50"
          >
            <div className="mb-1 text-2xl">〰️</div>
            <div className="text-xs font-medium text-fuchsia-800">Ondas</div>
          </button>

          <button
            onClick={() => sendVisualizerCommand('change_type', 'circle')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-4 transition-colors border rounded-lg bg-rose-50 hover:bg-rose-100 border-rose-200 disabled:opacity-50"
          >
            <div className="mb-1 text-2xl">⭕</div>
            <div className="text-xs font-medium text-rose-800">Circular</div>
          </button>
        </div>
      </div>

      {/* Utilitários */}
      <div className="card">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Utilitários</h2>
        
        <div className="flex flex-wrap gap-4">
          <button
            onClick={checkTvStatus}
            disabled={loading}
            className="btn-secondary"
          >
            🔍 Verificar Status
          </button>

          <button
            onClick={clearOldCommands}
            disabled={loading}
            className="btn-secondary"
          >
            🧹 Limpar Comandos Antigos
          </button>

          <button
            onClick={() => sendCommand('emergency_stop')}
            disabled={loading}
            className="px-4 py-2 font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            🛑 Parada de Emergência
          </button>
        </div>
      </div>

      {/* Instruções */}
      <div className="border-blue-200 card bg-blue-50">
        <h3 className="mb-3 text-lg font-medium text-blue-900">📖 Como usar o Controle Remoto</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• <strong>Reproduzir/Pausar:</strong> Controla a reprodução do vídeo atual</li>
          <li>• <strong>Próximo/Anterior:</strong> Navega entre os vídeos da playlist</li>
          <li>• <strong>Reiniciar Vídeo:</strong> Volta o vídeo atual para o início</li>
          <li>• <strong>Recarregar Playlist:</strong> Atualiza a lista de vídeos na TV</li>
          <li>• <strong>Atualizar TV:</strong> Força a TV a recarregar completamente</li>
          <li>• <strong>Parada de Emergência:</strong> Para tudo imediatamente</li>
        </ul>
        
        <div className="p-3 mt-4 bg-blue-100 rounded">
          <p className="text-sm text-blue-900">
            <strong>💡 Dica:</strong> Os comandos são enviados para a TV em tempo real. 
            Aguarde alguns segundos para ver o efeito na tela da TV.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RemoteControl;
