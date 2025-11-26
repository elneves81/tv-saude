// Analytics avançado para TV Saúde
// Monitoramento de performance e uso do sistema

const Analytics = {
  // Métricas de vídeos
  videoMetrics: {
    // Vídeos mais assistidos
    getMostWatchedVideos: async () => {
      const stats = await db.all(`
        SELECT v.titulo, v.id, COUNT(*) as views, 
               AVG(CASE WHEN duration > 0 THEN duration ELSE NULL END) as avg_watch_time
        FROM videos v
        LEFT JOIN video_views vv ON v.id = vv.video_id
        WHERE vv.created_at >= datetime('now', '-30 days')
        GROUP BY v.id
        ORDER BY views DESC
        LIMIT 10
      `);
      return stats;
    },

    // Taxa de conclusão por vídeo
    getCompletionRates: async () => {
      const rates = await db.all(`
        SELECT v.titulo, 
               COUNT(CASE WHEN vv.completed = 1 THEN 1 END) * 100.0 / COUNT(*) as completion_rate
        FROM videos v
        LEFT JOIN video_views vv ON v.id = vv.video_id
        GROUP BY v.id
        ORDER BY completion_rate DESC
      `);
      return rates;
    },

    // Horários de pico de visualização
    getPeakHours: async () => {
      const hours = await db.all(`
        SELECT strftime('%H', created_at) as hour, COUNT(*) as views
        FROM video_views
        WHERE created_at >= datetime('now', '-7 days')
        GROUP BY hour
        ORDER BY views DESC
      `);
      return hours;
    }
  },

  // Métricas do sistema
  systemHealth: {
    // Uptime e disponibilidade
    getUptime: () => {
      return {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      };
    },

    // Erros e problemas
    getErrorStats: async () => {
      const errors = await db.all(`
        SELECT error_type, COUNT(*) as count, MAX(created_at) as last_occurrence
        FROM system_logs
        WHERE level = 'error' AND created_at >= datetime('now', '-24 hours')
        GROUP BY error_type
        ORDER BY count DESC
      `);
      return errors;
    },

    // Performance de API
    getAPIPerformance: async () => {
      const performance = await db.all(`
        SELECT endpoint, AVG(response_time) as avg_time, COUNT(*) as requests
        FROM api_logs
        WHERE created_at >= datetime('now', '-1 hour')
        GROUP BY endpoint
        ORDER BY avg_time DESC
      `);
      return performance;
    }
  },

  // Métricas de usuários
  userEngagement: {
    // Uso por usuário
    getUserActivity: async () => {
      const activity = await db.all(`
        SELECT u.nome, COUNT(cl.id) as commands_sent, MAX(cl.created_at) as last_activity
        FROM usuarios u
        LEFT JOIN controle_tv cl ON u.id = cl.user_id
        WHERE cl.created_at >= datetime('now', '-30 days')
        GROUP BY u.id
        ORDER BY commands_sent DESC
      `);
      return activity;
    },

    // Comandos mais usados
    getMostUsedCommands: async () => {
      const commands = await db.all(`
        SELECT comando, COUNT(*) as usage_count
        FROM controle_tv
        WHERE created_at >= datetime('now', '-30 days')
        GROUP BY comando
        ORDER BY usage_count DESC
      `);
      return commands;
    }
  }
};

module.exports = Analytics;
