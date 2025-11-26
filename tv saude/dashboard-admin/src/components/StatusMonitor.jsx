import React, { useState, useEffect } from 'react';
import api from '../config/api';

const StatusMonitor = () => {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // segundos
  const [customIP, setCustomIP] = useState('');
  const [testingCustomIP, setTestingCustomIP] = useState(false);

  // Função para verificar status das localidades
  const verificarStatusLocalidades = async () => {
    setLoading(true);
    try {
      console.log('🔍 Verificando status das localidades...');
      const response = await api.get('/localidades/status');
      
      if (response.data.success) {
        setStatusData(response.data.data);
        console.log('✅ Status atualizado:', response.data.data);
      }
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para testar IP customizado
  const testarIPCustomizado = async () => {
    if (!customIP) return;
    
    setTestingCustomIP(true);
    try {
      console.log(`🔍 Testando IP customizado: ${customIP}`);
      const response = await api.get(`/ip/verificar/${customIP}`);
      
      if (response.data.success) {
        const resultado = response.data.data;
        alert(`IP ${customIP}:\n${resultado.online ? '✅ ONLINE' : '❌ OFFLINE'}\n${resultado.message}${resultado.responseTime ? `\nTempo: ${resultado.responseTime}` : ''}`);
      }
    } catch (error) {
      console.error('❌ Erro ao testar IP:', error);
      alert(`Erro ao testar IP ${customIP}: ${error.message}`);
    } finally {
      setTestingCustomIP(false);
    }
  };

  // Auto-refresh
  useEffect(() => {
    // Carregar dados iniciais
    verificarStatusLocalidades();

    // Configurar auto-refresh se habilitado
    if (autoRefresh) {
      const interval = setInterval(verificarStatusLocalidades, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  // Componente para status individual
  const StatusItem = ({ localidade }) => {
    const isOnline = localidade.online;
    
    return (
      <div
        className={`bg-white rounded-lg shadow-md p-4 border-l-4 transition-all duration-300 ${
          isOnline ? 'border-green-500' : 'border-red-500'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            <div>
              <h3 className="font-semibold text-gray-800">{localidade.nome}</h3>
              <p className="text-sm text-gray-600">{localidade.ip}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isOnline ? '✅ ONLINE' : '❌ OFFLINE'}
            </div>
            {isOnline && localidade.responseTime && (
              <p className="text-xs text-gray-500 mt-1">Ping: {localidade.responseTime}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {new Date(localidade.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
        
        {!isOnline && (
          <div className="mt-2 text-sm text-red-600">
            {localidade.message}
          </div>
        )}
      </div>
    );
  };

  // Componente de resumo
  const StatusSummary = () => {
    if (!statusData) return null;
    
    const { total, online, offline } = statusData;
    const onlinePercentage = total > 0 ? Math.round((online / total) * 100) : 0;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">🌐</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Total</p>
              <p className="text-2xl font-bold text-blue-900">{total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600">Online</p>
              <p className="text-2xl font-bold text-green-900">{online}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-2xl">❌</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-600">Offline</p>
              <p className="text-2xl font-bold text-red-900">{offline}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-600">Disponibilidade</p>
              <p className="text-2xl font-bold text-purple-900">{onlinePercentage}%</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monitor de Status IP</h1>
          <p className="text-gray-600">Monitoramento em tempo real da conectividade das localidades</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Controles de auto-refresh */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Auto-refresh:</label>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              disabled={!autoRefresh}
              className="text-sm border rounded px-2 py-1"
            >
              <option value={10}>10s</option>
              <option value={30}>30s</option>
              <option value={60}>1m</option>
              <option value={300}>5m</option>
            </select>
          </div>
          
          <button
            onClick={verificarStatusLocalidades}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verificando...
              </>
            ) : (
              <>
                🔄 Atualizar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Resumo do status */}
      <StatusSummary />

      {/* Teste de IP customizado */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Testar IP Customizado</h3>
        <div className="flex items-center space-x-3">
          <input
            type="text"
            placeholder="Digite um IP (ex: 192.168.1.1)"
            value={customIP}
            onChange={(e) => setCustomIP(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2"
          />
          <button
            onClick={testarIPCustomizado}
            disabled={testingCustomIP || !customIP}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {testingCustomIP ? '🔍 Testando...' : '🧪 Testar'}
          </button>
        </div>
      </div>

      {/* Lista de status */}
      <div className="space-y-4">
        {statusData?.localidades?.map((localidade, index) => (
          <StatusItem key={`localidade-${localidade.id}-${index}`} localidade={localidade} />
        ))}
        
        {statusData?.localidades?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl">📍</span>
            <p className="mt-2">Nenhuma localidade com IP configurado encontrada</p>
          </div>
        )}
        
        {!statusData && !loading && (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl">🔍</span>
            <p className="mt-2">Clique em "Atualizar" para verificar o status dos IPs</p>
          </div>
        )}
      </div>
      
      {statusData && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Última atualização: {new Date(statusData.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default StatusMonitor;
