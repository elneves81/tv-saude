import React, { useState, useEffect } from 'react';
import './ConfiguracaoAvancada.css';

// Interface avançada de configuração do sistema
const ConfiguracaoAvancada = () => {
  const [configuracoes, setConfiguracoes] = useState({
    // Configurações de reprodução
    autoplay: {
      enabled: true,
      delay: 3000,
      requireInteraction: true,
      fallbackMode: 'overlay'
    },
    
    // Configurações de display
    display: {
      resolution: '1920x1080',
      aspectRatio: '16:9',
      brightness: 100,
      contrast: 100,
      saturation: 100,
      fullscreen: true,
      screenSaver: {
        enabled: true,
        timeout: 600000, // 10 minutos
        type: 'slideshow'
      }
    },

    // Configurações de rede
    network: {
      connectionTimeout: 5000,
      retryAttempts: 3,
      bandwidth: 'auto',
      proxy: {
        enabled: false,
        host: '',
        port: '',
        auth: false,
        username: '',
        password: ''
      }
    },

    // Configurações de segurança
    security: {
      sessionTimeout: 28800000, // 8 horas
      maxLoginAttempts: 5,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true
      },
      twoFactorAuth: {
        enabled: false,
        method: 'totp'
      },
      auditLog: {
        enabled: true,
        retention: 90 // dias
      }
    },

    // Configurações de backup
    backup: {
      automatic: {
        enabled: true,
        frequency: 'daily',
        time: '02:00',
        retention: 30
      },
      location: 'local',
      compression: true,
      encryption: true
    },

    // Configurações de notificações
    notifications: {
      email: {
        enabled: false,
        smtp: {
          host: '',
          port: 587,
          secure: false,
          user: '',
          password: ''
        },
        recipients: []
      },
      system: {
        enabled: true,
        types: ['error', 'warning', 'info'],
        persistence: true
      }
    },

    // Configurações de performance
    performance: {
      caching: {
        enabled: true,
        duration: 3600000, // 1 hora
        maxSize: 500 // MB
      },
      preloading: {
        enabled: true,
        nextVideos: 2
      },
      compression: {
        enabled: true,
        quality: 80
      }
    },

    // Configurações de logs
    logging: {
      level: 'info',
      rotation: {
        enabled: true,
        maxSize: '100MB',
        maxFiles: 5
      },
      destinations: ['file', 'console']
    }
  });

  const [activeTab, setActiveTab] = useState('autoplay');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Carregar configurações do servidor
  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    try {
      const response = await fetch('/api/configuracoes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const configs = await response.json();
        setConfiguracoes(prev => ({ ...prev, ...configs }));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      showMessage('Erro ao carregar configurações', 'error');
    }
  };

  const salvarConfiguracoes = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/configuracoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(configuracoes)
      });

      if (response.ok) {
        showMessage('Configurações salvas com sucesso!', 'success');
      } else {
        throw new Error('Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      showMessage('Erro ao salvar configurações', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const updateConfig = (section, key, value) => {
    setConfiguracoes(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const updateNestedConfig = (section, subsection, key, value) => {
    setConfiguracoes(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [key]: value
        }
      }
    }));
  };

  const testConnection = async () => {
    try {
      const response = await fetch('/api/test-connection');
      if (response.ok) {
        showMessage('Conexão testada com sucesso!', 'success');
      } else {
        showMessage('Falha no teste de conexão', 'error');
      }
    } catch (error) {
      showMessage('Erro ao testar conexão', 'error');
    }
  };

  const exportarConfiguracoes = () => {
    const dataStr = JSON.stringify(configuracoes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tv-saude-config-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importarConfiguracoes = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const configs = JSON.parse(e.target.result);
          setConfiguracoes(configs);
          showMessage('Configurações importadas com sucesso!', 'success');
        } catch (error) {
          showMessage('Erro ao importar configurações', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  const resetarConfiguracoes = () => {
    if (window.confirm('Tem certeza que deseja resetar todas as configurações para os valores padrão?')) {
      carregarConfiguracoes();
      showMessage('Configurações resetadas', 'warning');
    }
  };

  const tabs = [
    { id: 'autoplay', label: '🎬 Autoplay', icon: '▶️' },
    { id: 'display', label: '🖥️ Display', icon: '📺' },
    { id: 'network', label: '🌐 Rede', icon: '🔗' },
    { id: 'security', label: '🔒 Segurança', icon: '🛡️' },
    { id: 'backup', label: '💾 Backup', icon: '💿' },
    { id: 'notifications', label: '🔔 Notificações', icon: '📢' },
    { id: 'performance', label: '⚡ Performance', icon: '🚀' },
    { id: 'logging', label: '📊 Logs', icon: '📝' }
  ];

  return (
    <div className="configuracao-avancada">
      <header className="config-header">
        <h1>🛠️ Configurações Avançadas</h1>
        <div className="config-actions">
          <button onClick={exportarConfiguracoes} className="btn-export">
            📤 Exportar
          </button>
          <label className="btn-import">
            📥 Importar
            <input
              type="file"
              accept=".json"
              onChange={importarConfiguracoes}
              style={{ display: 'none' }}
            />
          </label>
          <button onClick={resetarConfiguracoes} className="btn-reset">
            🔄 Resetar
          </button>
          <button 
            onClick={salvarConfiguracoes} 
            className="btn-save"
            disabled={saving}
          >
            {saving ? '💾 Salvando...' : '💾 Salvar'}
          </button>
        </div>
      </header>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="config-content">
        <nav className="config-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="config-panel">
          {/* Configurações de Autoplay */}
          {activeTab === 'autoplay' && (
            <div className="config-section">
              <h2>🎬 Configurações de Autoplay</h2>
              
              <div className="config-group">
                <label className="config-item">
                  <input
                    type="checkbox"
                    checked={configuracoes.autoplay.enabled}
                    onChange={(e) => updateConfig('autoplay', 'enabled', e.target.checked)}
                  />
                  <span>Habilitar autoplay automático</span>
                </label>

                <label className="config-item">
                  <span>Delay antes do autoplay (ms):</span>
                  <input
                    type="number"
                    value={configuracoes.autoplay.delay}
                    onChange={(e) => updateConfig('autoplay', 'delay', parseInt(e.target.value))}
                    min="0"
                    max="10000"
                  />
                </label>

                <label className="config-item">
                  <input
                    type="checkbox"
                    checked={configuracoes.autoplay.requireInteraction}
                    onChange={(e) => updateConfig('autoplay', 'requireInteraction', e.target.checked)}
                  />
                  <span>Exigir interação do usuário para autoplay</span>
                </label>

                <label className="config-item">
                  <span>Modo fallback quando autoplay falhar:</span>
                  <select
                    value={configuracoes.autoplay.fallbackMode}
                    onChange={(e) => updateConfig('autoplay', 'fallbackMode', e.target.value)}
                  >
                    <option value="overlay">Mostrar overlay</option>
                    <option value="silent">Reproduzir sem som</option>
                    <option value="manual">Aguardar clique manual</option>
                  </select>
                </label>
              </div>
            </div>
          )}

          {/* Configurações de Display */}
          {activeTab === 'display' && (
            <div className="config-section">
              <h2>🖥️ Configurações de Display</h2>
              
              <div className="config-group">
                <label className="config-item">
                  <span>Resolução:</span>
                  <select
                    value={configuracoes.display.resolution}
                    onChange={(e) => updateConfig('display', 'resolution', e.target.value)}
                  >
                    <option value="1920x1080">1920x1080 (Full HD)</option>
                    <option value="1366x768">1366x768 (HD)</option>
                    <option value="1280x720">1280x720 (HD Ready)</option>
                    <option value="auto">Automático</option>
                  </select>
                </label>

                <label className="config-item">
                  <span>Brilho: {configuracoes.display.brightness}%</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={configuracoes.display.brightness}
                    onChange={(e) => updateConfig('display', 'brightness', parseInt(e.target.value))}
                  />
                </label>

                <label className="config-item">
                  <span>Contraste: {configuracoes.display.contrast}%</span>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={configuracoes.display.contrast}
                    onChange={(e) => updateConfig('display', 'contrast', parseInt(e.target.value))}
                  />
                </label>

                <label className="config-item">
                  <input
                    type="checkbox"
                    checked={configuracoes.display.fullscreen}
                    onChange={(e) => updateConfig('display', 'fullscreen', e.target.checked)}
                  />
                  <span>Modo tela cheia por padrão</span>
                </label>

                <div className="subsection">
                  <h3>Protetor de Tela</h3>
                  <label className="config-item">
                    <input
                      type="checkbox"
                      checked={configuracoes.display.screenSaver.enabled}
                      onChange={(e) => updateNestedConfig('display', 'screenSaver', 'enabled', e.target.checked)}
                    />
                    <span>Habilitar protetor de tela</span>
                  </label>

                  <label className="config-item">
                    <span>Timeout (minutos):</span>
                    <input
                      type="number"
                      value={configuracoes.display.screenSaver.timeout / 60000}
                      onChange={(e) => updateNestedConfig('display', 'screenSaver', 'timeout', parseInt(e.target.value) * 60000)}
                      min="1"
                      max="60"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Configurações de Rede */}
          {activeTab === 'network' && (
            <div className="config-section">
              <h2>🌐 Configurações de Rede</h2>
              
              <div className="config-group">
                <label className="config-item">
                  <span>Timeout de conexão (ms):</span>
                  <input
                    type="number"
                    value={configuracoes.network.connectionTimeout}
                    onChange={(e) => updateConfig('network', 'connectionTimeout', parseInt(e.target.value))}
                    min="1000"
                    max="30000"
                  />
                </label>

                <label className="config-item">
                  <span>Tentativas de retry:</span>
                  <input
                    type="number"
                    value={configuracoes.network.retryAttempts}
                    onChange={(e) => updateConfig('network', 'retryAttempts', parseInt(e.target.value))}
                    min="1"
                    max="10"
                  />
                </label>

                <div className="config-actions">
                  <button onClick={testConnection} className="btn-test">
                    🔍 Testar Conexão
                  </button>
                </div>

                <div className="subsection">
                  <h3>Configurações de Proxy</h3>
                  <label className="config-item">
                    <input
                      type="checkbox"
                      checked={configuracoes.network.proxy.enabled}
                      onChange={(e) => updateNestedConfig('network', 'proxy', 'enabled', e.target.checked)}
                    />
                    <span>Usar proxy</span>
                  </label>

                  {configuracoes.network.proxy.enabled && (
                    <>
                      <label className="config-item">
                        <span>Host:</span>
                        <input
                          type="text"
                          value={configuracoes.network.proxy.host}
                          onChange={(e) => updateNestedConfig('network', 'proxy', 'host', e.target.value)}
                          placeholder="proxy.exemplo.com"
                        />
                      </label>

                      <label className="config-item">
                        <span>Porta:</span>
                        <input
                          type="number"
                          value={configuracoes.network.proxy.port}
                          onChange={(e) => updateNestedConfig('network', 'proxy', 'port', e.target.value)}
                          placeholder="8080"
                        />
                      </label>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Configurações de Segurança */}
          {activeTab === 'security' && (
            <div className="config-section">
              <h2>🔒 Configurações de Segurança</h2>
              
              <div className="config-group">
                <label className="config-item">
                  <span>Timeout de sessão (horas):</span>
                  <input
                    type="number"
                    value={configuracoes.security.sessionTimeout / 3600000}
                    onChange={(e) => updateConfig('security', 'sessionTimeout', parseInt(e.target.value) * 3600000)}
                    min="1"
                    max="24"
                  />
                </label>

                <label className="config-item">
                  <span>Máximo de tentativas de login:</span>
                  <input
                    type="number"
                    value={configuracoes.security.maxLoginAttempts}
                    onChange={(e) => updateConfig('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    min="3"
                    max="10"
                  />
                </label>

                <div className="subsection">
                  <h3>Política de Senhas</h3>
                  <label className="config-item">
                    <span>Comprimento mínimo:</span>
                    <input
                      type="number"
                      value={configuracoes.security.passwordPolicy.minLength}
                      onChange={(e) => updateNestedConfig('security', 'passwordPolicy', 'minLength', parseInt(e.target.value))}
                      min="6"
                      max="32"
                    />
                  </label>

                  <label className="config-item">
                    <input
                      type="checkbox"
                      checked={configuracoes.security.passwordPolicy.requireUppercase}
                      onChange={(e) => updateNestedConfig('security', 'passwordPolicy', 'requireUppercase', e.target.checked)}
                    />
                    <span>Exigir letra maiúscula</span>
                  </label>

                  <label className="config-item">
                    <input
                      type="checkbox"
                      checked={configuracoes.security.passwordPolicy.requireSymbols}
                      onChange={(e) => updateNestedConfig('security', 'passwordPolicy', 'requireSymbols', e.target.checked)}
                    />
                    <span>Exigir símbolos especiais</span>
                  </label>
                </div>

                <div className="subsection">
                  <h3>Autenticação em Duas Etapas</h3>
                  <label className="config-item">
                    <input
                      type="checkbox"
                      checked={configuracoes.security.twoFactorAuth.enabled}
                      onChange={(e) => updateNestedConfig('security', 'twoFactorAuth', 'enabled', e.target.checked)}
                    />
                    <span>Habilitar 2FA</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Configurações de Backup */}
          {activeTab === 'backup' && (
            <div className="config-section">
              <h2>💾 Configurações de Backup</h2>
              
              <div className="config-group">
                <label className="config-item">
                  <input
                    type="checkbox"
                    checked={configuracoes.backup.automatic.enabled}
                    onChange={(e) => updateNestedConfig('backup', 'automatic', 'enabled', e.target.checked)}
                  />
                  <span>Backup automático</span>
                </label>

                <label className="config-item">
                  <span>Frequência:</span>
                  <select
                    value={configuracoes.backup.automatic.frequency}
                    onChange={(e) => updateNestedConfig('backup', 'automatic', 'frequency', e.target.value)}
                  >
                    <option value="daily">Diário</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                  </select>
                </label>

                <label className="config-item">
                  <span>Horário:</span>
                  <input
                    type="time"
                    value={configuracoes.backup.automatic.time}
                    onChange={(e) => updateNestedConfig('backup', 'automatic', 'time', e.target.value)}
                  />
                </label>

                <label className="config-item">
                  <span>Retenção (dias):</span>
                  <input
                    type="number"
                    value={configuracoes.backup.automatic.retention}
                    onChange={(e) => updateNestedConfig('backup', 'automatic', 'retention', parseInt(e.target.value))}
                    min="7"
                    max="365"
                  />
                </label>

                <label className="config-item">
                  <input
                    type="checkbox"
                    checked={configuracoes.backup.compression}
                    onChange={(e) => updateConfig('backup', 'compression', e.target.checked)}
                  />
                  <span>Compressão</span>
                </label>

                <label className="config-item">
                  <input
                    type="checkbox"
                    checked={configuracoes.backup.encryption}
                    onChange={(e) => updateConfig('backup', 'encryption', e.target.checked)}
                  />
                  <span>Criptografia</span>
                </label>
              </div>
            </div>
          )}

          {/* Outras abas seguem o mesmo padrão... */}
        </div>
      </div>
    </div>
  );
};

export default ConfiguracaoAvancada;
