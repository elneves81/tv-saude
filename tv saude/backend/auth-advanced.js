// Sistema de autenticação avançada com múltiplos níveis de acesso
// Inclui 2FA, tokens de sessão, auditoria e controle granular de permissões

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');

class AdvancedAuthSystem {
  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'tv-saude-secret-key-2024';
    this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'tv-saude-refresh-secret-2024';
    this.SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 horas
    this.MAX_LOGIN_ATTEMPTS = 5;
    this.LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutos
    
    // Níveis de permissão
    this.PERMISSIONS = {
      SUPER_ADMIN: 'super_admin',
      ADMIN: 'admin',
      OPERATOR: 'operator',
      VIEWER: 'viewer'
    };

    // Ações e permissões necessárias
    this.ACTIONS = {
      'videos:create': [this.PERMISSIONS.SUPER_ADMIN, this.PERMISSIONS.ADMIN],
      'videos:edit': [this.PERMISSIONS.SUPER_ADMIN, this.PERMISSIONS.ADMIN],
      'videos:delete': [this.PERMISSIONS.SUPER_ADMIN],
      'videos:view': [this.PERMISSIONS.SUPER_ADMIN, this.PERMISSIONS.ADMIN, this.PERMISSIONS.OPERATOR, this.PERMISSIONS.VIEWER],
      'system:control': [this.PERMISSIONS.SUPER_ADMIN, this.PERMISSIONS.ADMIN, this.PERMISSIONS.OPERATOR],
      'users:manage': [this.PERMISSIONS.SUPER_ADMIN],
      'reports:view': [this.PERMISSIONS.SUPER_ADMIN, this.PERMISSIONS.ADMIN],
      'logs:view': [this.PERMISSIONS.SUPER_ADMIN, this.PERMISSIONS.ADMIN],
      'backup:create': [this.PERMISSIONS.SUPER_ADMIN, this.PERMISSIONS.ADMIN],
      'backup:restore': [this.PERMISSIONS.SUPER_ADMIN]
    };

    this.activeSessions = new Map();
    this.loginAttempts = new Map();
    this.initDatabase();
  }

  // Inicializar tabelas do banco
  initDatabase() {
    const tables = [
      // Usuários com 2FA
      `CREATE TABLE IF NOT EXISTS users_advanced (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        permission_level TEXT NOT NULL DEFAULT 'viewer',
        two_fa_secret TEXT,
        two_fa_enabled BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        is_active BOOLEAN DEFAULT 1,
        failed_attempts INTEGER DEFAULT 0,
        locked_until DATETIME
      )`,

      // Sessões ativas
      `CREATE TABLE IF NOT EXISTS user_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        session_token TEXT UNIQUE NOT NULL,
        refresh_token TEXT UNIQUE NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users_advanced(id)
      )`,

      // Log de auditoria
      `CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action TEXT NOT NULL,
        resource TEXT,
        details TEXT,
        ip_address TEXT,
        user_agent TEXT,
        success BOOLEAN NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users_advanced(id)
      )`,

      // Tokens de recuperação de senha
      `CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users_advanced(id)
      )`
    ];

    tables.forEach(tableSQL => {
      db.run(tableSQL, (err) => {
        if (err) {
          console.error('❌ Erro ao criar tabela de autenticação:', err);
        }
      });
    });

    // Criar usuário super admin padrão se não existir
    this.createDefaultSuperAdmin();
  }

  // Criar usuário super admin padrão
  async createDefaultSuperAdmin() {
    const defaultUsername = 'superadmin';
    const defaultPassword = 'TvSaude2024!@#';
    const defaultEmail = 'admin@tvsaude.local';

    try {
      const user = await this.getUserByUsername(defaultUsername);
      if (!user) {
        const hashedPassword = await bcrypt.hash(defaultPassword, 12);
        
        db.run(
          'INSERT INTO users_advanced (username, email, password_hash, permission_level) VALUES (?, ?, ?, ?)',
          [defaultUsername, defaultEmail, hashedPassword, this.PERMISSIONS.SUPER_ADMIN],
          (err) => {
            if (!err) {
              console.log('👑 Super Admin criado - Username: superadmin, Password: TvSaude2024!@#');
              console.log('⚠️  IMPORTANTE: Altere a senha padrão após o primeiro login!');
            }
          }
        );
      }
    } catch (error) {
      console.error('❌ Erro ao criar super admin:', error);
    }
  }

  // Registro de usuário com validação avançada
  async registerUser(userData) {
    const { username, email, password, permissionLevel = this.PERMISSIONS.VIEWER } = userData;

    // Validações
    if (!this.validatePassword(password)) {
      throw new Error('Senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo');
    }

    if (!this.validateEmail(email)) {
      throw new Error('Email inválido');
    }

    if (!this.validateUsername(username)) {
      throw new Error('Username deve ter 3-30 caracteres alfanuméricos');
    }

    // Verificar se usuário já existe
    const existingUser = await this.getUserByUsername(username);
    if (existingUser) {
      throw new Error('Username já existe');
    }

    const existingEmail = await this.getUserByEmail(email);
    if (existingEmail) {
      throw new Error('Email já cadastrado');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users_advanced (username, email, password_hash, permission_level) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, permissionLevel],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, username, email, permissionLevel });
          }
        }
      );
    });
  }

  // Login com 2FA opcional
  async login(username, password, twoFACode = null, clientInfo = {}) {
    try {
      // Verificar tentativas de login
      const attempts = this.loginAttempts.get(username) || { count: 0, lockedUntil: null };
      
      if (attempts.lockedUntil && new Date() < attempts.lockedUntil) {
        throw new Error('Conta temporariamente bloqueada. Tente novamente em alguns minutos.');
      }

      // Buscar usuário
      const user = await this.getUserByUsername(username);
      if (!user || !user.is_active) {
        this.incrementLoginAttempts(username);
        throw new Error('Credenciais inválidas');
      }

      // Verificar se conta está bloqueada no banco
      if (user.locked_until && new Date() < new Date(user.locked_until)) {
        throw new Error('Conta bloqueada. Contate o administrador.');
      }

      // Verificar senha
      const passwordValid = await bcrypt.compare(password, user.password_hash);
      if (!passwordValid) {
        this.incrementLoginAttempts(username);
        await this.incrementFailedAttempts(user.id);
        this.logAuditEvent(user.id, 'login_failed', null, clientInfo, false);
        throw new Error('Credenciais inválidas');
      }

      // Verificar 2FA se habilitado
      if (user.two_fa_enabled) {
        if (!twoFACode) {
          throw new Error('Código 2FA obrigatório');
        }

        const verified = speakeasy.totp.verify({
          secret: user.two_fa_secret,
          encoding: 'base32',
          token: twoFACode,
          window: 2
        });

        if (!verified) {
          this.incrementLoginAttempts(username);
          this.logAuditEvent(user.id, 'login_2fa_failed', null, clientInfo, false);
          throw new Error('Código 2FA inválido');
        }
      }

      // Login bem-sucedido
      this.loginAttempts.delete(username);
      await this.resetFailedAttempts(user.id);
      await this.updateLastLogin(user.id);

      // Criar sessão
      const sessionData = await this.createSession(user, clientInfo);
      
      this.logAuditEvent(user.id, 'login_success', null, clientInfo, true);

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          permissionLevel: user.permission_level,
          twoFAEnabled: user.two_fa_enabled
        },
        ...sessionData
      };

    } catch (error) {
      throw error;
    }
  }

  // Configurar 2FA
  async setup2FA(userId) {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const secret = speakeasy.generateSecret({
      name: `TV Saúde (${user.username})`,
      issuer: 'TV Saúde Guarapuava'
    });

    // Salvar secret temporariamente (só ativa após verificação)
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users_advanced SET two_fa_secret = ? WHERE id = ?',
        [secret.base32, userId],
        (err) => err ? reject(err) : resolve()
      );
    });

    // Gerar QR Code
    const qrCodeURL = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode: qrCodeURL,
      manualEntryKey: secret.base32
    };
  }

  // Verificar e ativar 2FA
  async verify2FA(userId, token) {
    const user = await this.getUserById(userId);
    if (!user || !user.two_fa_secret) {
      throw new Error('2FA não configurado');
    }

    const verified = speakeasy.totp.verify({
      secret: user.two_fa_secret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      throw new Error('Código inválido');
    }

    // Ativar 2FA
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users_advanced SET two_fa_enabled = 1 WHERE id = ?',
        [userId],
        (err) => err ? reject(err) : resolve()
      );
    });

    this.logAuditEvent(userId, '2fa_enabled', null, {}, true);
    return { success: true };
  }

  // Criar sessão
  async createSession(user, clientInfo) {
    const sessionToken = this.generateSecureToken();
    const refreshToken = this.generateSecureToken();
    const expiresAt = new Date(Date.now() + this.SESSION_TIMEOUT);

    const sessionData = {
      sessionToken,
      refreshToken,
      expiresAt,
      user: {
        id: user.id,
        username: user.username,
        permissionLevel: user.permission_level
      }
    };

    // Salvar no banco
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO user_sessions (user_id, session_token, refresh_token, ip_address, user_agent, expires_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user.id, sessionToken, refreshToken, clientInfo.ip, clientInfo.userAgent, expiresAt.toISOString()],
        (err) => err ? reject(err) : resolve()
      );
    });

    // Manter em memória para acesso rápido
    this.activeSessions.set(sessionToken, sessionData);

    return { sessionToken, refreshToken, expiresAt };
  }

  // Verificar permissão
  async checkPermission(sessionToken, action) {
    const session = await this.getActiveSession(sessionToken);
    if (!session) {
      throw new Error('Sessão inválida');
    }

    const requiredPermissions = this.ACTIONS[action];
    if (!requiredPermissions) {
      throw new Error('Ação não reconhecida');
    }

    if (!requiredPermissions.includes(session.user.permissionLevel)) {
      this.logAuditEvent(session.user.id, 'permission_denied', action, {}, false);
      throw new Error('Permissão insuficiente');
    }

    // Atualizar última atividade
    await this.updateSessionActivity(sessionToken);
    return session;
  }

  // Middleware de autenticação
  authMiddleware() {
    return async (req, res, next) => {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
          return res.status(401).json({ error: 'Token de acesso obrigatório' });
        }

        const session = await this.getActiveSession(token);
        if (!session) {
          return res.status(401).json({ error: 'Sessão inválida ou expirada' });
        }

        req.user = session.user;
        req.session = session;
        next();
      } catch (error) {
        res.status(401).json({ error: error.message });
      }
    };
  }

  // Middleware de autorização
  requirePermission(action) {
    return async (req, res, next) => {
      try {
        const session = await this.checkPermission(req.session.sessionToken, action);
        req.user = session.user;
        next();
      } catch (error) {
        res.status(403).json({ error: error.message });
      }
    };
  }

  // Métodos auxiliares
  async getUserByUsername(username) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users_advanced WHERE username = ?', [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async getUserById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users_advanced WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async getUserByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users_advanced WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async getActiveSession(sessionToken) {
    // Primeiro verificar memória
    let session = this.activeSessions.get(sessionToken);
    if (session && new Date() < new Date(session.expiresAt)) {
      return session;
    }

    // Verificar banco de dados
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT s.*, u.username, u.permission_level
         FROM user_sessions s
         JOIN users_advanced u ON s.user_id = u.id
         WHERE s.session_token = ? AND s.is_active = 1 AND s.expires_at > datetime('now')`,
        [sessionToken],
        (err, row) => {
          if (err) reject(err);
          else if (row) {
            const sessionData = {
              sessionToken: row.session_token,
              refreshToken: row.refresh_token,
              expiresAt: row.expires_at,
              user: {
                id: row.user_id,
                username: row.username,
                permissionLevel: row.permission_level
              }
            };
            this.activeSessions.set(sessionToken, sessionData);
            resolve(sessionData);
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  async updateSessionActivity(sessionToken) {
    db.run(
      'UPDATE user_sessions SET last_activity = CURRENT_TIMESTAMP WHERE session_token = ?',
      [sessionToken]
    );
  }

  generateSecureToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  incrementLoginAttempts(username) {
    const attempts = this.loginAttempts.get(username) || { count: 0, lockedUntil: null };
    attempts.count++;
    
    if (attempts.count >= this.MAX_LOGIN_ATTEMPTS) {
      attempts.lockedUntil = new Date(Date.now() + this.LOCKOUT_TIME);
    }
    
    this.loginAttempts.set(username, attempts);
  }

  async incrementFailedAttempts(userId) {
    db.run(
      'UPDATE users_advanced SET failed_attempts = failed_attempts + 1 WHERE id = ?',
      [userId]
    );
  }

  async resetFailedAttempts(userId) {
    db.run(
      'UPDATE users_advanced SET failed_attempts = 0, locked_until = NULL WHERE id = ?',
      [userId]
    );
  }

  async updateLastLogin(userId) {
    db.run(
      'UPDATE users_advanced SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [userId]
    );
  }

  logAuditEvent(userId, action, resource, clientInfo, success) {
    db.run(
      'INSERT INTO audit_log (user_id, action, resource, ip_address, user_agent, success) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, action, resource, clientInfo.ip, clientInfo.userAgent, success ? 1 : 0]
    );
  }

  // Validações
  validatePassword(password) {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && hasUpper && hasLower && hasNumber && hasSymbol;
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validateUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    return usernameRegex.test(username);
  }

  // Logout
  async logout(sessionToken) {
    // Remover da memória
    this.activeSessions.delete(sessionToken);
    
    // Marcar como inativa no banco
    db.run(
      'UPDATE user_sessions SET is_active = 0 WHERE session_token = ?',
      [sessionToken]
    );
  }

  // Limpeza de sessões expiradas
  cleanupExpiredSessions() {
    setInterval(() => {
      // Limpar memória
      for (const [token, session] of this.activeSessions.entries()) {
        if (new Date() >= new Date(session.expiresAt)) {
          this.activeSessions.delete(token);
        }
      }

      // Limpar banco
      db.run(
        'UPDATE user_sessions SET is_active = 0 WHERE expires_at < datetime("now")'
      );
    }, 60000); // A cada minuto
  }
}

module.exports = AdvancedAuthSystem;
