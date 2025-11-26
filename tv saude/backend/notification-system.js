// Sistema de notificações push para TV Saúde
// Alertas em tempo real para administradores

class NotificationSystem {
  constructor() {
    this.subscribers = new Map();
    this.notificationQueue = [];
  }

  // Registrar cliente para notificações
  subscribe(userId, response) {
    this.subscribers.set(userId, response);
    
    // Enviar notificações pendentes
    const pendingNotifications = this.notificationQueue.filter(n => 
      n.targetUsers.includes(userId) || n.targetUsers.includes('all')
    );
    
    pendingNotifications.forEach(notification => {
      this.sendToClient(userId, notification);
    });
  }

  // Enviar notificação para clientes específicos
  broadcast(notification) {
    const {
      type = 'info',
      title,
      message,
      targetUsers = ['all'],
      priority = 'normal',
      persistent = false
    } = notification;

    const notificationData = {
      id: Date.now(),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      priority,
      persistent
    };

    // Salvar no banco se persistente
    if (persistent) {
      db.run(`
        INSERT INTO notifications (type, title, message, target_users, priority, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [type, title, message, JSON.stringify(targetUsers), priority, new Date().toISOString()]);
    }

    // Enviar para clientes conectados
    this.subscribers.forEach((response, userId) => {
      if (targetUsers.includes('all') || targetUsers.includes(userId)) {
        this.sendToClient(userId, notificationData);
      }
    });

    // Adicionar à fila se há usuários offline
    if (persistent) {
      this.notificationQueue.push({
        ...notificationData,
        targetUsers
      });
    }
  }

  // Enviar para cliente específico
  sendToClient(userId, notification) {
    const response = this.subscribers.get(userId);
    if (response) {
      try {
        response.write(`data: ${JSON.stringify(notification)}\n\n`);
      } catch (error) {
        console.error('Erro ao enviar notificação:', error);
        this.subscribers.delete(userId);
      }
    }
  }

  // Notificações predefinidas para eventos do sistema
  systemNotifications = {
    // Vídeo com erro
    videoError: (videoTitle, error) => {
      this.broadcast({
        type: 'error',
        title: 'Erro no Vídeo',
        message: `Erro ao reproduzir "${videoTitle}": ${error}`,
        targetUsers: ['admin'],
        priority: 'high',
        persistent: true
      });
    },

    // Sistema offline
    systemOffline: () => {
      this.broadcast({
        type: 'critical',
        title: 'Sistema Offline',
        message: 'A TV Saúde está enfrentando problemas de conectividade',
        targetUsers: ['all'],
        priority: 'critical',
        persistent: true
      });
    },

    // Novo vídeo adicionado
    newVideo: (videoTitle, addedBy) => {
      this.broadcast({
        type: 'success',
        title: 'Novo Vídeo',
        message: `"${videoTitle}" foi adicionado por ${addedBy}`,
        targetUsers: ['admin'],
        priority: 'normal',
        persistent: false
      });
    },

    // Controle remoto usado
    remoteControl: (command, user) => {
      this.broadcast({
        type: 'info',
        title: 'Controle Remoto',
        message: `${user} executou comando: ${command}`,
        targetUsers: ['admin'],
        priority: 'low',
        persistent: false
      });
    },

    // Playlist alterada
    playlistChanged: (playlistName, user) => {
      this.broadcast({
        type: 'info',
        title: 'Playlist Alterada',
        message: `Playlist "${playlistName}" foi modificada por ${user}`,
        targetUsers: ['admin'],
        priority: 'normal',
        persistent: true
      });
    }
  }
}

// Instância global
const notificationSystem = new NotificationSystem();

// Endpoint SSE para receber notificações
const setupNotificationRoutes = (app) => {
  // Conectar ao stream de notificações
  app.get('/api/notifications/stream', authenticateToken, (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    notificationSystem.subscribe(req.user.id, res);

    // Cleanup quando cliente desconecta
    req.on('close', () => {
      notificationSystem.subscribers.delete(req.user.id);
    });
  });

  // Endpoint para enviar notificação manual
  app.post('/api/notifications/send', authenticateToken, requireAdmin, (req, res) => {
    const { type, title, message, targetUsers, priority, persistent } = req.body;

    notificationSystem.broadcast({
      type,
      title,
      message,
      targetUsers,
      priority,
      persistent
    });

    res.json({ success: true, message: 'Notificação enviada' });
  });

  // Obter histórico de notificações
  app.get('/api/notifications/history', authenticateToken, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    db.all(`
      SELECT * FROM notifications
      WHERE target_users LIKE ? OR target_users LIKE ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [`%"${req.user.id}"%`, '%"all"%', limit, offset], (err, notifications) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(notifications);
    });
  });

  // Marcar notificação como lida
  app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
    db.run(`
      UPDATE notifications 
      SET read_by = COALESCE(read_by, '') || ? || ','
      WHERE id = ?
    `, [req.user.id, req.params.id], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true });
    });
  });
};

module.exports = {
  notificationSystem,
  setupNotificationRoutes
};
