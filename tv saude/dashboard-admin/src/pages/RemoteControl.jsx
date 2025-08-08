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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Status da TV</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className={`text-2xl font-bold ${tvStatus.isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {tvStatus.isConnected ? '🟢' : '🔴'}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {tvStatus.isConnected ? 'Conectada' : 'Desconectada'}
            </div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className={`text-2xl font-bold ${tvStatus.isPlaying ? 'text-blue-600' : 'text-gray-600'}`}>
              {tvStatus.isPlaying ? '▶️' : '⏸️'}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {tvStatus.isPlaying ? 'Reproduzindo' : 'Pausado'}
            </div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              📺
            </div>
            <div className="text-sm text-gray-600 mt-1">
              TV Saúde
            </div>
          </div>
        </div>

        {lastCommand && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Último Comando</h3>
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Controles de Reprodução</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => sendCommand('play')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-6 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <div className="text-3xl mb-2">▶️</div>
            <div className="text-sm font-medium text-green-800">Reproduzir</div>
          </button>

          <button
            onClick={() => sendCommand('pause')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-6 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <div className="text-3xl mb-2">⏸️</div>
            <div className="text-sm font-medium text-yellow-800">Pausar</div>
          </button>

          <button
            onClick={() => sendCommand('next')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-6 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <div className="text-3xl mb-2">⏭️</div>
            <div className="text-sm font-medium text-blue-800">Próximo</div>
          </button>

          <button
            onClick={() => sendCommand('previous')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-6 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <div className="text-3xl mb-2">⏮️</div>
            <div className="text-sm font-medium text-purple-800">Anterior</div>
          </button>
        </div>
      </div>

      {/* Controles Avançados */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Controles Avançados</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => sendCommand('restart')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-6 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <div className="text-3xl mb-2">🔄</div>
            <div className="text-sm font-medium text-orange-800">Reiniciar Vídeo</div>
          </button>

          <button
            onClick={() => sendCommand('reload_playlist')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-6 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <div className="text-3xl mb-2">📋</div>
            <div className="text-sm font-medium text-indigo-800">Recarregar Playlist</div>
          </button>

          <button
            onClick={() => sendCommand('refresh')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-6 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <div className="text-3xl mb-2">🔃</div>
            <div className="text-sm font-medium text-teal-800">Atualizar TV</div>
          </button>
        </div>
      </div>

      {/* Controles de Volume (Simulado) */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Controles de Volume</h2>
        
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => sendCommand('volume_down')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-6 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <div className="text-3xl mb-2">🔉</div>
            <div className="text-sm font-medium text-red-800">Volume -</div>
          </button>

          <button
            onClick={() => sendCommand('mute')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <div className="text-3xl mb-2">🔇</div>
            <div className="text-sm font-medium text-gray-800">Mudo</div>
          </button>

          <button
            onClick={() => sendCommand('volume_up')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-6 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <div className="text-3xl mb-2">🔊</div>
            <div className="text-sm font-medium text-green-800">Volume +</div>
          </button>
        </div>
      </div>

      {/* Utilitários */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Utilitários</h2>
        
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
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            🛑 Parada de Emergência
          </button>
        </div>
      </div>

      {/* Instruções */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-medium text-blue-900 mb-3">📖 Como usar o Controle Remoto</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Reproduzir/Pausar:</strong> Controla a reprodução do vídeo atual</li>
          <li>• <strong>Próximo/Anterior:</strong> Navega entre os vídeos da playlist</li>
          <li>• <strong>Reiniciar Vídeo:</strong> Volta o vídeo atual para o início</li>
          <li>• <strong>Recarregar Playlist:</strong> Atualiza a lista de vídeos na TV</li>
          <li>• <strong>Atualizar TV:</strong> Força a TV a recarregar completamente</li>
          <li>• <strong>Parada de Emergência:</strong> Para tudo imediatamente</li>
        </ul>
        
        <div className="mt-4 p-3 bg-blue-100 rounded">
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
