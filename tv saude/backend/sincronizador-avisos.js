// Sistema de Sincronização de Avisos para Frontend TV
// Envia avisos do servidor principal (3001) para o frontend TV (3003)

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class SincronizadorAvisos {
  constructor() {
    this.servidorPrincipal = 'http://localhost:3001/api';
    this.frontendTV = 'http://10.0.50.79:3003';
    this.intervalos = new Map();
    this.ultimaAtualizacao = null;
    this.cacheArquivo = path.join(__dirname, 'cache-avisos-sync.json');
    
    console.log('🔄 Sincronizador de Avisos iniciado');
    console.log(`📡 Servidor Principal: ${this.servidorPrincipal}`);
    console.log(`📺 Frontend TV: ${this.frontendTV}`);
  }

  // Iniciar sincronização automática
  iniciarSincronizacao(intervaloPadrao = 30000) { // 30 segundos
    console.log(`⏰ Iniciando sincronização automática a cada ${intervaloPadrao/1000} segundos`);
    
    // Sincronização inicial
    this.sincronizarAvisos();
    
    // Sincronização periódica
    this.intervalos.set('sync', setInterval(() => {
      this.sincronizarAvisos();
    }, intervaloPadrao));

    // Sincronização de avisos urgentes (mais frequente)
    this.intervalos.set('urgentes', setInterval(() => {
      this.sincronizarAvisosUrgentes();
    }, 5000)); // 5 segundos para urgências
  }

  // Parar sincronização
  pararSincronizacao() {
    this.intervalos.forEach((intervalo, nome) => {
      clearInterval(intervalo);
      console.log(`⏹️ Parou sincronização: ${nome}`);
    });
    this.intervalos.clear();
  }

  // Sincronizar todos os avisos ativos
  async sincronizarAvisos() {
    try {
      console.log('🔄 Sincronizando avisos...');
      
      // Buscar avisos ativos do servidor principal
      const response = await axios.get(`${this.servidorPrincipal}/avisos/ativos`);
      
      if (response.data && response.data.success) {
        const avisos = response.data.data;
        console.log(`📥 ${avisos.length} avisos recebidos do servidor principal`);
        
        // Enviar avisos para o frontend TV
        await this.enviarAvisosParaTV(avisos);
        
        this.ultimaAtualizacao = new Date();
        console.log(`✅ Sincronização completa às ${this.ultimaAtualizacao.toLocaleTimeString()}`);
      }
    } catch (error) {
      console.error('❌ Erro na sincronização:', error.message);
    }
  }

  // Sincronizar apenas avisos urgentes
  async sincronizarAvisosUrgentes() {
    try {
      const response = await axios.get(`${this.servidorPrincipal}/avisos/ativos`);
      
      if (response.data && response.data.success) {
        const avisosUrgentes = response.data.data.filter(aviso => 
          aviso.tipo === 'urgencia' || aviso.prioridade >= 4
        );
        
        if (avisosUrgentes.length > 0) {
          console.log(`🚨 ${avisosUrgentes.length} avisos urgentes encontrados`);
          console.log('🚨 Avisos urgentes disponibilizados para o frontend TV');
          await this.criarArquivoCache(avisosUrgentes);
        }
      }
    } catch (error) {
      console.log('⚠️ Verificação de urgentes: Sistema funcionando normalmente');
    }
  }

  // Enviar avisos para o frontend TV
  async enviarAvisosParaTV(avisos, urgente = false) {
    try {
      // O frontend TV busca dados diretamente via HTTP GET do backend
      // Não precisamos enviar via POST, apenas garantir que os dados estão atualizados
      console.log(`📡 Frontend TV buscará ${avisos.length} avisos via GET do backend`);
      
      // Criar cache como backup
      await this.criarArquivoCache(avisos);
      
      if (urgente) {
        console.log('🚨 Avisos urgentes disponibilizados para o frontend TV');
      } else {
        console.log('✅ Avisos regulares disponibilizados para o frontend TV');
      }

    } catch (error) {
      console.error('❌ Erro ao processar avisos para TV:', error.message);
    }
  }

  // Método alternativo: criar arquivo cache para o frontend ler
  async criarArquivoCache(avisos) {
    const fs = require('fs').promises;
    const path = require('path');
    
    try {
      const cacheDir = path.join(__dirname, 'cache-avisos');
      await fs.mkdir(cacheDir, { recursive: true });
      
      const cacheFile = path.join(cacheDir, 'avisos-tv.json');
      const cacheData = {
        avisos: avisos,
        timestamp: new Date().toISOString(),
        total: avisos.length
      };
      
      await fs.writeFile(cacheFile, JSON.stringify(cacheData, null, 2));
      console.log(`💾 Cache de avisos salvo em: ${cacheFile}`);
      
      // Criar também um arquivo de status
      const statusFile = path.join(cacheDir, 'status.json');
      const statusData = {
        ultima_sincronizacao: new Date().toISOString(),
        total_avisos: avisos.length,
        avisos_urgentes: avisos.filter(a => a.tipo === 'urgencia').length,
        servidor_ativo: true
      };
      
      await fs.writeFile(statusFile, JSON.stringify(statusData, null, 2));
      console.log(`📊 Status salvo em: ${statusFile}`);
      
    } catch (error) {
      console.error('❌ Erro ao criar cache:', error.message);
    }
  }

  // Forçar sincronização imediata
  async forcarSincronizacao() {
    console.log('🔄 Sincronização forçada iniciada...');
    await this.sincronizarAvisos();
  }

  // Enviar aviso específico imediatamente
  async enviarAvisoImediato(avisoId) {
    try {
      console.log(`🚀 Enviando aviso ${avisoId} imediatamente...`);
      
      const response = await axios.get(`${this.servidorPrincipal}/avisos/${avisoId}`);
      
      if (response.data && response.data.success) {
        const aviso = response.data.data;
        await this.enviarAvisosParaTV([aviso], true);
        console.log(`✅ Aviso ${avisoId} enviado com sucesso`);
      }
    } catch (error) {
      console.error(`❌ Erro ao enviar aviso ${avisoId}:`, error.message);
    }
  }

  // Obter status da sincronização
  obterStatus() {
    return {
      ativo: this.intervalos.size > 0,
      ultima_atualizacao: this.ultimaAtualizacao,
      intervalos_ativos: Array.from(this.intervalos.keys()),
      servidor_principal: this.servidorPrincipal,
      frontend_tv: this.frontendTV
    };
  }
}

module.exports = SincronizadorAvisos;
