// Integração do Sincronizador de Avisos ao Servidor Principal
// Adiciona rotas e funcionalidades de sincronização com o frontend TV

const SincronizadorAvisos = require('./sincronizador-avisos');

function integrarSincronizadorAvisos(app) {
  console.log('🔗 Integrando Sincronizador de Avisos...');
  
  // Instância do sincronizador
  const sincronizador = new SincronizadorAvisos();
  
  // Iniciar sincronização automática
  sincronizador.iniciarSincronizacao();
  
  // Rota para status da sincronização
  app.get('/api/sync/status', (req, res) => {
    try {
      const status = sincronizador.obterStatus();
      res.json({
        success: true,
        data: status,
        message: 'Status da sincronização obtido com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Rota para forçar sincronização
  app.post('/api/sync/forcar', async (req, res) => {
    try {
      await sincronizador.forcarSincronizacao();
      res.json({
        success: true,
        message: 'Sincronização forçada executada com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Rota para enviar aviso específico imediatamente
  app.post('/api/sync/aviso/:id', async (req, res) => {
    try {
      const avisoId = req.params.id;
      await sincronizador.enviarAvisoImediato(avisoId);
      res.json({
        success: true,
        message: `Aviso ${avisoId} enviado para o frontend TV`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Rota para configurar frontend TV
  app.post('/api/sync/configurar', (req, res) => {
    try {
      const { frontendURL, intervalo } = req.body;
      
      if (frontendURL) {
        sincronizador.frontendTV = frontendURL;
        console.log(`📺 Frontend TV configurado para: ${frontendURL}`);
      }
      
      if (intervalo) {
        sincronizador.pararSincronizacao();
        sincronizador.iniciarSincronizacao(intervalo * 1000);
        console.log(`⏰ Intervalo de sincronização alterado para: ${intervalo} segundos`);
      }
      
      res.json({
        success: true,
        message: 'Configuração atualizada com sucesso',
        config: {
          frontendTV: sincronizador.frontendTV,
          intervalo: intervalo
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Interceptar criação de avisos para sincronização imediata
  const criarAvisoOriginal = app._router.stack.find(layer => 
    layer.route && layer.route.path === '/api/avisos' && 
    layer.route.methods.post
  );

  // Hook para sincronizar quando aviso é criado
  app.post('/api/avisos/sync-hook', async (req, res, next) => {
    try {
      // Executar a criação do aviso normalmente
      next();
      
      // Após criar, sincronizar imediatamente
      setTimeout(async () => {
        console.log('🔄 Sincronização automática após criação de aviso');
        await sincronizador.forcarSincronizacao();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Erro no hook de sincronização:', error);
      next();
    }
  });

  // Middleware para sincronização automática em mudanças
  app.use('/api/avisos', (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Executar resposta original
      originalSend.call(this, data);
      
      // Se foi uma operação de modificação (POST, PUT, DELETE), sincronizar
      if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
        setTimeout(async () => {
          console.log(`🔄 Auto-sincronização após ${req.method} em avisos`);
          await sincronizador.forcarSincronizacao();
        }, 1000);
      }
    };
    
    next();
  });

  console.log('✅ Sincronizador de Avisos integrado com sucesso!');
  console.log('📋 Rotas de sincronização disponíveis:');
  console.log('   GET  /api/sync/status - Status da sincronização');
  console.log('   POST /api/sync/forcar - Forçar sincronização');
  console.log('   POST /api/sync/aviso/:id - Enviar aviso específico');
  console.log('   POST /api/sync/configurar - Configurar sincronização');
  
  return sincronizador;
}

module.exports = { integrarSincronizadorAvisos };
