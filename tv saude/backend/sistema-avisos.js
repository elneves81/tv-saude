// Sistema de Avisos Interativos para TV Saúde
// Exibe avisos dinâmicos e específicos para cada UBS

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class SistemaAvisos {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, '../database.sqlite'));
    this.initDatabase();
    this.activeAvisos = new Map();
    this.scheduledAvisos = new Map();
    
    // Tipos de avisos com cores e ícones
    this.tiposAvisos = {
      consulta: { 
        icon: '👨‍⚕️', 
        color: '#3498db', 
        priority: 3,
        duration: 30000 // 30 segundos
      },
      medicacao: { 
        icon: '💊', 
        color: '#27ae60', 
        priority: 2,
        duration: 25000
      },
      campanha: { 
        icon: '📢', 
        color: '#e74c3c', 
        priority: 1,
        duration: 35000
      },
      urgencia: { 
        icon: '🚨', 
        color: '#f39c12', 
        priority: 5,
        duration: 60000 // 1 minuto
      },
      informativo: { 
        icon: 'ℹ️', 
        color: '#9b59b6', 
        priority: 1,
        duration: 20000
      },
      horario: { 
        icon: '🕐', 
        color: '#34495e', 
        priority: 2,
        duration: 15000
      },
      evento: { 
        icon: '🎪', 
        color: '#16a085', 
        priority: 2,
        duration: 30000
      }
    };

    this.startScheduler();
  }

  // Inicializar tabelas do banco
  initDatabase() {
    const tables = [
      // Tabela de avisos
      `CREATE TABLE IF NOT EXISTS avisos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        mensagem TEXT NOT NULL,
        tipo TEXT NOT NULL DEFAULT 'informativo',
        ubs_id TEXT,
        ativo BOOLEAN DEFAULT 1,
        data_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
        data_fim DATETIME,
        horario_inicio TEXT,
        horario_fim TEXT,
        dias_semana TEXT,
        prioridade INTEGER DEFAULT 1,
        repeticoes INTEGER DEFAULT 1,
        intervalo_repeticao INTEGER DEFAULT 300000,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Tabela de UBS
      `CREATE TABLE IF NOT EXISTS unidades_saude (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        endereco TEXT,
        telefone TEXT,
        responsavel TEXT,
        ativo BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Log de exibições
      `CREATE TABLE IF NOT EXISTS avisos_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        aviso_id INTEGER,
        ubs_id TEXT,
        exibido_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        duracao_exibicao INTEGER,
        FOREIGN KEY (aviso_id) REFERENCES avisos(id)
      )`
    ];

    tables.forEach(tableSQL => {
      this.db.run(tableSQL, (err) => {
        if (err) {
          console.error('❌ Erro ao criar tabela:', err);
        }
      });
    });

    // Inserir UBS de exemplo
    this.inserirUBSExemplo();
    this.inserirAvisosExemplo();
  }

  // Inserir UBS de exemplo
  inserirUBSExemplo() {
    const ubsExemplo = [
      {
        id: 'ubs-centro',
        nome: 'UBS Centro',
        endereco: 'Rua das Flores, 123 - Centro',
        telefone: '(42) 3623-1234',
        responsavel: 'Dr. João Silva'
      },
      {
        id: 'ubs-vila-bela',
        nome: 'UBS Vila Bela',
        endereco: 'Av. Brasil, 456 - Vila Bela',
        telefone: '(42) 3623-5678',
        responsavel: 'Dra. Maria Santos'
      },
      {
        id: 'ubs-santana',
        nome: 'UBS Santana',
        endereco: 'Rua Santana, 789 - Bairro Santana',
        telefone: '(42) 3623-9012',
        responsavel: 'Dr. Pedro Costa'
      }
    ];

    ubsExemplo.forEach(ubs => {
      this.db.run(
        'INSERT OR IGNORE INTO unidades_saude (id, nome, endereco, telefone, responsavel) VALUES (?, ?, ?, ?, ?)',
        [ubs.id, ubs.nome, ubs.endereco, ubs.telefone, ubs.responsavel]
      );
    });
  }

  // Inserir avisos de exemplo
  inserirAvisosExemplo() {
    const avisosExemplo = [
      {
        titulo: 'Próximas Consultas',
        mensagem: 'Dr. João - Clínico Geral às 14:30\nDra. Maria - Pediatra às 15:00',
        tipo: 'consulta',
        ubs_id: 'ubs-centro',
        horario_inicio: '14:00',
        horario_fim: '16:00'
      },
      {
        titulo: 'Medicação Disponível',
        mensagem: 'Dipirona, Paracetamol e Ibuprofeno disponíveis na farmácia',
        tipo: 'medicacao',
        ubs_id: null, // Todas as UBS
        prioridade: 2
      },
      {
        titulo: 'Campanha de Vacinação',
        mensagem: 'Vacina contra Gripe até sexta-feira. Tragam cartão de vacinação!',
        tipo: 'campanha',
        ubs_id: null,
        data_fim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        prioridade: 4
      },
      {
        titulo: 'Horário de Funcionamento',
        mensagem: 'Segunda a Sexta: 7h às 17h\nSábado: 7h às 12h',
        tipo: 'horario',
        ubs_id: null,
        prioridade: 1
      }
    ];

    avisosExemplo.forEach(aviso => {
      this.db.run(
        `INSERT OR IGNORE INTO avisos 
         (titulo, mensagem, tipo, ubs_id, horario_inicio, horario_fim, data_fim, prioridade) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [aviso.titulo, aviso.mensagem, aviso.tipo, aviso.ubs_id, 
         aviso.horario_inicio, aviso.horario_fim, aviso.data_fim, aviso.prioridade]
      );
    });
  }

  // Criar novo aviso
  async criarAviso(dadosAviso) {
    return new Promise((resolve, reject) => {
      const {
        titulo, mensagem, tipo = 'informativo', ubs_id = null,
        data_inicio = null, data_fim = null, horario_inicio = null,
        horario_fim = null, dias_semana = null, prioridade = 1,
        repeticoes = 1, intervalo_repeticao = 300000
      } = dadosAviso;

      this.db.run(
        `INSERT INTO avisos 
         (titulo, mensagem, tipo, ubs_id, data_inicio, data_fim, 
          horario_inicio, horario_fim, dias_semana, prioridade, 
          repeticoes, intervalo_repeticao) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [titulo, mensagem, tipo, ubs_id, data_inicio, data_fim,
         horario_inicio, horario_fim, dias_semana, prioridade,
         repeticoes, intervalo_repeticao],
        function(err) {
          if (err) {
            reject(err);
          } else {
            console.log(`📢 Aviso criado: "${titulo}" (ID: ${this.lastID})`);
            resolve({ id: this.lastID, ...dadosAviso });
          }
        }
      );
    });
  }

  // Buscar avisos ativos para uma UBS específica
  async buscarAvisosAtivos(ubsId = null) {
    return new Promise((resolve, reject) => {
      const now = new Date();
      const currentTime = now.toTimeString().substring(0, 5);
      const currentDay = now.getDay(); // 0 = domingo, 1 = segunda...

      let query = `
        SELECT * FROM avisos 
        WHERE ativo = 1 
        AND (data_inicio IS NULL OR date(data_inicio) <= date('now'))
        AND (data_fim IS NULL OR date(data_fim) >= date('now'))
        AND (horario_inicio IS NULL OR time(horario_inicio) <= time('now', 'localtime'))
        AND (horario_fim IS NULL OR time(horario_fim) >= time('now', 'localtime'))
        AND (ubs_id IS NULL OR ubs_id = ?)
        ORDER BY prioridade DESC, created_at DESC
      `;

      this.db.all(query, [ubsId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Filtrar por dias da semana se especificado
          const avisosFiltrados = rows.filter(aviso => {
            if (!aviso.dias_semana) return true;
            
            const diasPermitidos = aviso.dias_semana.split(',').map(d => parseInt(d));
            return diasPermitidos.includes(currentDay);
          });

          resolve(avisosFiltrados);
        }
      });
    });
  }

  // Formatatar aviso para exibição
  formatarAviso(aviso) {
    const tipoInfo = this.tiposAvisos[aviso.tipo] || this.tiposAvisos.informativo;
    
    return {
      id: aviso.id,
      titulo: aviso.titulo,
      mensagem: aviso.mensagem,
      tipo: aviso.tipo,
      icon: tipoInfo.icon,
      color: tipoInfo.color,
      priority: tipoInfo.priority,
      duration: tipoInfo.duration,
      ubs_id: aviso.ubs_id,
      prioridade: aviso.prioridade,
      timestamp: new Date().toISOString()
    };
  }

  // Obter avisos para exibição na TV
  async obterAvisosParaTV(ubsId = null) {
    try {
      const avisos = await this.buscarAvisosAtivos(ubsId);
      const avisosFormatados = avisos.map(aviso => this.formatarAviso(aviso));
      
      // Ordenar por prioridade
      avisosFormatados.sort((a, b) => b.priority - a.priority);
      
      return avisosFormatados;
    } catch (error) {
      console.error('❌ Erro ao buscar avisos:', error);
      return [];
    }
  }

  // Registrar exibição de aviso
  async registrarExibicao(avisoId, ubsId, duracao) {
    this.db.run(
      'INSERT INTO avisos_log (aviso_id, ubs_id, duracao_exibicao) VALUES (?, ?, ?)',
      [avisoId, ubsId, duracao],
      (err) => {
        if (err) {
          console.error('❌ Erro ao registrar exibição:', err);
        }
      }
    );
  }

  // Agendar avisos automáticos
  agendarAviso(titulo, mensagem, tipo, ubsId, horario, duracao = 24 * 60 * 60 * 1000) {
    const agendamento = {
      titulo,
      mensagem,
      tipo,
      ubsId,
      horario, // "HH:MM"
      duracao
    };

    const timeoutId = this.calcularProximoHorario(horario, () => {
      this.criarAvisoTemporario(agendamento);
    });

    this.scheduledAvisos.set(`${titulo}-${ubsId}`, timeoutId);
    console.log(`⏰ Aviso agendado: "${titulo}" para ${horario}`);
  }

  // Calcular próximo horário de execução
  calcularProximoHorario(horario, callback) {
    const [horas, minutos] = horario.split(':').map(Number);
    const agora = new Date();
    const proximaExecucao = new Date();
    
    proximaExecucao.setHours(horas, minutos, 0, 0);
    
    // Se o horário já passou hoje, agendar para amanhã
    if (proximaExecucao <= agora) {
      proximaExecucao.setDate(proximaExecucao.getDate() + 1);
    }
    
    const delay = proximaExecucao.getTime() - agora.getTime();
    
    return setTimeout(() => {
      callback();
      // Reagendar para o próximo dia
      this.calcularProximoHorario(horario, callback);
    }, delay);
  }

  // Criar aviso temporário
  async criarAvisoTemporario(agendamento) {
    try {
      const dataFim = new Date(Date.now() + agendamento.duracao).toISOString();
      
      await this.criarAviso({
        titulo: agendamento.titulo,
        mensagem: agendamento.mensagem,
        tipo: agendamento.tipo,
        ubs_id: agendamento.ubsId,
        data_fim: dataFim,
        prioridade: 3
      });
    } catch (error) {
      console.error('❌ Erro ao criar aviso temporário:', error);
    }
  }

  // Iniciar agendador
  startScheduler() {
    // Avisos automáticos de exemplo
    this.agendarAviso(
      'Bom Dia!',
      'A UBS está aberta. Tenha um ótimo dia de atendimento!',
      'informativo',
      null,
      '07:00'
    );

    this.agendarAviso(
      'Lembrete do Almoço',
      'Horário de almoço: 12h às 13h. Atendimento retorna às 13h.',
      'horario',
      null,
      '11:45'
    );

    this.agendarAviso(
      'Encerrando Atividades',
      'A UBS encerra o atendimento em 30 minutos. Organize-se!',
      'informativo',
      null,
      '16:30'
    );

    console.log('📅 Agendador de avisos iniciado');
  }

  // Parar agendador
  stopScheduler() {
    for (const timeoutId of this.scheduledAvisos.values()) {
      clearTimeout(timeoutId);
    }
    this.scheduledAvisos.clear();
    console.log('⏹️ Agendador de avisos parado');
  }

  // Estatísticas de avisos
  async obterEstatisticas(ubsId = null, periodo = 7) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          a.tipo,
          COUNT(al.id) as total_exibicoes,
          AVG(al.duracao_exibicao) as duracao_media,
          a.titulo
        FROM avisos a
        LEFT JOIN avisos_log al ON a.id = al.aviso_id
        WHERE al.exibido_em >= datetime('now', '-${periodo} days')
        ${ubsId ? 'AND (a.ubs_id IS NULL OR a.ubs_id = ?)' : ''}
        GROUP BY a.id, a.tipo, a.titulo
        ORDER BY total_exibicoes DESC
      `;

      this.db.all(query, ubsId ? [ubsId] : [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Rotas da API
  setupRoutes(app) {
    // Obter avisos ativos
    app.get('/api/avisos/ativos/:ubsId?', async (req, res) => {
      try {
        const ubsId = req.params.ubsId;
        const avisos = await this.obterAvisosParaTV(ubsId);
        res.json({ success: true, avisos });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Criar novo aviso
    app.post('/api/avisos', async (req, res) => {
      try {
        const aviso = await this.criarAviso(req.body);
        res.json({ success: true, aviso });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Listar todos os avisos
    app.get('/api/avisos', (req, res) => {
      this.db.all(
        'SELECT * FROM avisos ORDER BY prioridade DESC, created_at DESC',
        [],
        (err, rows) => {
          if (err) {
            res.status(500).json({ success: false, error: err.message });
          } else {
            res.json({ success: true, avisos: rows });
          }
        }
      );
    });

    // Atualizar aviso
    app.put('/api/avisos/:id', (req, res) => {
      const { id } = req.params;
      const { titulo, mensagem, tipo, ativo, prioridade } = req.body;
      
      this.db.run(
        'UPDATE avisos SET titulo = ?, mensagem = ?, tipo = ?, ativo = ?, prioridade = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [titulo, mensagem, tipo, ativo, prioridade, id],
        function(err) {
          if (err) {
            res.status(500).json({ success: false, error: err.message });
          } else {
            res.json({ success: true, changes: this.changes });
          }
        }
      );
    });

    // Deletar aviso
    app.delete('/api/avisos/:id', (req, res) => {
      const { id } = req.params;
      
      this.db.run('DELETE FROM avisos WHERE id = ?', [id], function(err) {
        if (err) {
          res.status(500).json({ success: false, error: err.message });
        } else {
          res.json({ success: true, changes: this.changes });
        }
      });
    });

    // Registrar exibição
    app.post('/api/avisos/:id/exibicao', async (req, res) => {
      try {
        const { id } = req.params;
        const { ubs_id, duracao } = req.body;
        
        await this.registrarExibicao(id, ubs_id, duracao);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Obter UBS
    app.get('/api/ubs', (req, res) => {
      this.db.all('SELECT * FROM unidades_saude WHERE ativo = 1', [], (err, rows) => {
        if (err) {
          res.status(500).json({ success: false, error: err.message });
        } else {
          res.json({ success: true, ubs: rows });
        }
      });
    });

    // Estatísticas
    app.get('/api/avisos/estatisticas/:ubsId?', async (req, res) => {
      try {
        const ubsId = req.params.ubsId;
        const periodo = req.query.periodo || 7;
        const stats = await this.obterEstatisticas(ubsId, periodo);
        res.json({ success: true, estatisticas: stats });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
  }
}

module.exports = SistemaAvisos;
