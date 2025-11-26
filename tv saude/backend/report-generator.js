// Gerador de relatórios executivos para TV Saúde
// Relatórios detalhados de uso, performance e estatísticas

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class ReportGenerator {
  constructor() {
    this.reportsDir = path.join(__dirname, '../reports');
    
    // Criar diretório de relatórios se não existir
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  // Relatório executivo completo
  async generateExecutiveReport(period = 'monthly') {
    const reportData = await this.collectReportData(period);
    const filename = `relatorio-executivo-${period}-${Date.now()}.pdf`;
    const filepath = path.join(this.reportsDir, filename);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        doc.pipe(fs.createWriteStream(filepath));

        // Cabeçalho
        this.addHeader(doc, 'RELATÓRIO EXECUTIVO - TV SAÚDE GUARAPUAVA');
        this.addPeriodInfo(doc, period, reportData.period);

        // Resumo executivo
        this.addSection(doc, 'RESUMO EXECUTIVO', [
          `• Total de vídeos reproduzidos: ${reportData.totalVideos}`,
          `• Tempo total de visualização: ${this.formatDuration(reportData.totalWatchTime)}`,
          `• Usuários ativos: ${reportData.activeUsers}`,
          `• Taxa de disponibilidade: ${reportData.uptime}%`,
          `• Comandos executados: ${reportData.totalCommands}`
        ]);

        // Métricas de performance
        this.addSection(doc, 'MÉTRICAS DE PERFORMANCE', [
          `• Tempo médio de resposta: ${reportData.avgResponseTime}ms`,
          `• Erros registrados: ${reportData.totalErrors}`,
          `• Taxa de sucesso: ${reportData.successRate}%`,
          `• Uso de CPU médio: ${reportData.avgCpuUsage}%`,
          `• Uso de memória médio: ${reportData.avgMemoryUsage}MB`
        ]);

        // Top 10 vídeos mais assistidos
        if (reportData.topVideos.length > 0) {
          this.addSection(doc, 'TOP 10 VÍDEOS MAIS ASSISTIDOS');
          this.addTable(doc, 
            ['Posição', 'Título', 'Visualizações', 'Tempo Médio'],
            reportData.topVideos.map((video, index) => [
              (index + 1).toString(),
              video.titulo.substring(0, 30) + (video.titulo.length > 30 ? '...' : ''),
              video.views.toString(),
              this.formatDuration(video.avg_watch_time || 0)
            ])
          );
        }

        // Estatísticas de uso por horário
        this.addSection(doc, 'PADRÕES DE USO', [
          `• Horário de pico: ${reportData.peakHour}h`,
          `• Dia mais ativo: ${reportData.mostActiveDay}`,
          `• Média de comandos por hora: ${reportData.avgCommandsPerHour}`,
          `• Tempo médio entre comandos: ${reportData.avgTimeBetweenCommands}min`
        ]);

        // Problemas e incidentes
        if (reportData.incidents.length > 0) {
          this.addSection(doc, 'INCIDENTES E PROBLEMAS');
          reportData.incidents.forEach(incident => {
            doc.text(`• ${incident.date}: ${incident.description}`, { indent: 20 });
          });
        }

        // Recomendações
        this.addSection(doc, 'RECOMENDAÇÕES', [
          '• Realizar backup regular dos dados',
          '• Monitorar uso de recursos do servidor',
          '• Atualizar conteúdo com base nos vídeos mais assistidos',
          '• Implementar cache para melhorar performance',
          '• Considerar horários de manutenção em períodos de baixo uso'
        ]);

        // Footer com timestamp
        this.addFooter(doc);

        doc.end();

        doc.on('end', () => {
          console.log(`✅ Relatório executivo gerado: ${filename}`);
          resolve({ filename, filepath, data: reportData });
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  // Relatório técnico detalhado
  async generateTechnicalReport() {
    const reportData = await this.collectTechnicalData();
    const filename = `relatorio-tecnico-${Date.now()}.pdf`;
    const filepath = path.join(this.reportsDir, filename);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        doc.pipe(fs.createWriteStream(filepath));

        this.addHeader(doc, 'RELATÓRIO TÉCNICO - TV SAÚDE');

        // Informações do sistema
        this.addSection(doc, 'INFORMAÇÕES DO SISTEMA', [
          `• Versão do Node.js: ${process.version}`,
          `• Plataforma: ${process.platform}`,
          `• Arquitetura: ${process.arch}`,
          `• Uptime: ${this.formatDuration(process.uptime() * 1000)}`,
          `• PID: ${process.pid}`
        ]);

        // Uso de recursos
        const memUsage = process.memoryUsage();
        this.addSection(doc, 'USO DE RECURSOS', [
          `• RSS: ${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`,
          `• Heap Used: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
          `• Heap Total: ${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
          `• External: ${(memUsage.external / 1024 / 1024).toFixed(2)} MB`
        ]);

        // Logs de erro detalhados
        if (reportData.errorLogs.length > 0) {
          this.addSection(doc, 'LOGS DE ERRO (ÚLTIMAS 24H)');
          reportData.errorLogs.forEach(log => {
            doc.fontSize(9).text(`${log.timestamp}: ${log.message}`, { indent: 20 });
          });
        }

        // Performance de endpoints
        this.addSection(doc, 'PERFORMANCE DE ENDPOINTS');
        this.addTable(doc,
          ['Endpoint', 'Requests', 'Tempo Médio', 'Erros'],
          reportData.endpointStats.map(stat => [
            stat.endpoint,
            stat.requests.toString(),
            `${stat.avgTime}ms`,
            stat.errors.toString()
          ])
        );

        this.addFooter(doc);
        doc.end();

        doc.on('end', () => {
          console.log(`✅ Relatório técnico gerado: ${filename}`);
          resolve({ filename, filepath });
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  // Coletar dados para relatório
  async collectReportData(period) {
    const dateFilter = this.getDateFilter(period);
    
    return new Promise((resolve, reject) => {
      // Queries paralelas para otimizar performance
      const queries = {
        totalVideos: `SELECT COUNT(*) as count FROM video_views WHERE created_at >= ?`,
        totalWatchTime: `SELECT SUM(duration) as total FROM video_views WHERE created_at >= ?`,
        activeUsers: `SELECT COUNT(DISTINCT user_id) as count FROM controle_tv WHERE created_at >= ?`,
        totalCommands: `SELECT COUNT(*) as count FROM controle_tv WHERE created_at >= ?`,
        totalErrors: `SELECT COUNT(*) as count FROM system_logs WHERE level = 'error' AND created_at >= ?`,
        topVideos: `
          SELECT v.titulo, COUNT(*) as views, AVG(vv.duration) as avg_watch_time
          FROM videos v
          LEFT JOIN video_views vv ON v.id = vv.video_id
          WHERE vv.created_at >= ?
          GROUP BY v.id
          ORDER BY views DESC
          LIMIT 10
        `,
        peakHour: `
          SELECT strftime('%H', created_at) as hour, COUNT(*) as count
          FROM controle_tv
          WHERE created_at >= ?
          GROUP BY hour
          ORDER BY count DESC
          LIMIT 1
        `,
        commandStats: `
          SELECT comando, COUNT(*) as count
          FROM controle_tv
          WHERE created_at >= ?
          GROUP BY comando
          ORDER BY count DESC
        `
      };

      const results = {};
      let completed = 0;
      const totalQueries = Object.keys(queries).length;

      Object.entries(queries).forEach(([key, query]) => {
        db.all(query, [dateFilter], (err, rows) => {
          if (!err) {
            results[key] = rows;
          }
          completed++;
          
          if (completed === totalQueries) {
            // Processar resultados
            const reportData = {
              period: { start: dateFilter, end: new Date().toISOString() },
              totalVideos: results.totalVideos?.[0]?.count || 0,
              totalWatchTime: results.totalWatchTime?.[0]?.total || 0,
              activeUsers: results.activeUsers?.[0]?.count || 0,
              totalCommands: results.totalCommands?.[0]?.count || 0,
              totalErrors: results.totalErrors?.[0]?.count || 0,
              uptime: 99.5, // Calcular baseado em logs reais
              avgResponseTime: 85, // Calcular baseado em logs reais
              successRate: 98.2, // Calcular baseado em logs reais
              avgCpuUsage: 25, // Implementar monitoramento real
              avgMemoryUsage: 256, // Implementar monitoramento real
              topVideos: results.topVideos || [],
              peakHour: results.peakHour?.[0]?.hour || '12',
              mostActiveDay: 'Segunda-feira', // Implementar cálculo real
              avgCommandsPerHour: Math.round((results.totalCommands?.[0]?.count || 0) / 24),
              avgTimeBetweenCommands: 5, // Implementar cálculo real
              incidents: [] // Implementar coleta de incidentes
            };
            
            resolve(reportData);
          }
        });
      });
    });
  }

  // Coletar dados técnicos
  async collectTechnicalData() {
    return new Promise((resolve, reject) => {
      const queries = {
        errorLogs: `
          SELECT created_at as timestamp, message
          FROM system_logs
          WHERE level = 'error' AND created_at >= datetime('now', '-24 hours')
          ORDER BY created_at DESC
          LIMIT 50
        `,
        endpointStats: `
          SELECT endpoint, COUNT(*) as requests, AVG(response_time) as avgTime,
                 SUM(CASE WHEN status >= 400 THEN 1 ELSE 0 END) as errors
          FROM api_logs
          WHERE created_at >= datetime('now', '-24 hours')
          GROUP BY endpoint
          ORDER BY requests DESC
        `
      };

      const results = {};
      let completed = 0;

      Object.entries(queries).forEach(([key, query]) => {
        db.all(query, [], (err, rows) => {
          if (!err) {
            results[key] = rows;
          }
          completed++;
          
          if (completed === Object.keys(queries).length) {
            resolve({
              errorLogs: results.errorLogs || [],
              endpointStats: results.endpointStats || []
            });
          }
        });
      });
    });
  }

  // Métodos auxiliares para formatação do PDF
  addHeader(doc, title) {
    doc.fontSize(20).font('Helvetica-Bold').text(title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).font('Helvetica').text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
    doc.moveDown(2);
  }

  addPeriodInfo(doc, period, periodData) {
    const periodNames = {
      daily: 'Últimas 24 horas',
      weekly: 'Última semana',
      monthly: 'Último mês',
      yearly: 'Último ano'
    };

    doc.fontSize(14).font('Helvetica-Bold').text(`Período: ${periodNames[period] || period}`);
    doc.fontSize(10).text(`De: ${new Date(periodData.start).toLocaleString('pt-BR')}`);
    doc.text(`Até: ${new Date(periodData.end).toLocaleString('pt-BR')}`);
    doc.moveDown(2);
  }

  addSection(doc, title, items = []) {
    doc.fontSize(14).font('Helvetica-Bold').text(title);
    doc.moveDown(0.5);
    
    items.forEach(item => {
      doc.fontSize(11).font('Helvetica').text(item, { indent: 20 });
    });
    
    doc.moveDown(1.5);
  }

  addTable(doc, headers, rows) {
    const startX = 50;
    const startY = doc.y;
    const colWidth = (doc.page.width - 100) / headers.length;

    // Headers
    doc.fontSize(10).font('Helvetica-Bold');
    headers.forEach((header, i) => {
      doc.text(header, startX + (i * colWidth), startY, { width: colWidth, align: 'center' });
    });

    doc.moveDown(0.5);

    // Rows
    doc.font('Helvetica');
    rows.forEach((row, rowIndex) => {
      const rowY = doc.y;
      row.forEach((cell, colIndex) => {
        doc.text(cell, startX + (colIndex * colWidth), rowY, { width: colWidth, align: 'center' });
      });
      doc.moveDown(0.3);
    });

    doc.moveDown(1);
  }

  addFooter(doc) {
    doc.fontSize(8).text(
      'TV Saúde Guarapuava - Sistema de Gestão de Conteúdo Educativo em Saúde',
      50,
      doc.page.height - 50,
      { align: 'center' }
    );
  }

  getDateFilter(period) {
    const now = new Date();
    switch (period) {
      case 'daily':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case 'weekly':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case 'monthly':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case 'yearly':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  }

  formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  // Agendar relatórios automáticos
  scheduleAutomaticReports() {
    // Relatório diário às 6:00
    setInterval(async () => {
      const now = new Date();
      if (now.getHours() === 6 && now.getMinutes() === 0) {
        try {
          await this.generateExecutiveReport('daily');
          console.log('📊 Relatório diário gerado automaticamente');
        } catch (error) {
          console.error('❌ Erro ao gerar relatório diário:', error);
        }
      }
    }, 60000);

    // Relatório semanal aos domingos às 7:00
    setInterval(async () => {
      const now = new Date();
      if (now.getDay() === 0 && now.getHours() === 7 && now.getMinutes() === 0) {
        try {
          await this.generateExecutiveReport('weekly');
          console.log('📊 Relatório semanal gerado automaticamente');
        } catch (error) {
          console.error('❌ Erro ao gerar relatório semanal:', error);
        }
      }
    }, 60000);

    console.log('📅 Relatórios automáticos agendados');
  }
}

module.exports = ReportGenerator;
