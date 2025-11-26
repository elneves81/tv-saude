const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const ytdl = require('ytdl-core');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'tv-saude-secret-key-2024';

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar sessões
app.use(session({
  secret: JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // true apenas para HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Servir arquivos estáticos (vídeos, áudio e imagens)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/audio', express.static(path.join(__dirname, '../audio')));
app.use('/images', express.static(path.join(__dirname, '../images')));
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Servidor TV Saúde funcionando corretamente'
  });
});

// Importar verificador de IP
const { verificarIPOnline, verificarMultiplosIPs } = require('./ip-checker');

// Importar Sistema de Avisos Interativos
const { integrarSistemaAvisos } = require('./integrar-sistema-avisos');

// Importar Sincronizador de Avisos
const { integrarSincronizadorAvisos } = require('./integrar-sincronizador');

// 🎯 Integrar Sistema de Avisos Interativos
console.log('🎯 Integrando Sistema de Avisos Interativos...');
const sistemaAvisos = integrarSistemaAvisos(app);
console.log('✅ Sistema de Avisos integrado com sucesso!');

// 🔄 Integrar Sincronizador de Avisos
console.log('🔄 Integrando Sincronizador para Frontend TV...');
const sincronizador = integrarSincronizadorAvisos(app);
console.log('✅ Sincronizador integrado com sucesso!');

// Endpoint para verificar se um IP específico está online
app.get('/api/ip/verificar/:ip', async (req, res) => {
  try {
    const ip = req.params.ip;
    console.log(`🔍 Verificando conectividade do IP: ${ip}`);
    
    const resultado = await verificarIPOnline(ip);
    
    res.json({
      success: true,
      data: resultado
    });
  } catch (error) {
    console.error('❌ Erro ao verificar IP:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para verificar múltiplos IPs
app.post('/api/ip/verificar-multiplos', async (req, res) => {
  try {
    const { ips } = req.body;
    
    if (!Array.isArray(ips) || ips.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Lista de IPs é obrigatória'
      });
    }
    
    console.log(`🔍 Verificando conectividade de ${ips.length} IPs`);
    
    const resultado = await verificarMultiplosIPs(ips);
    
    res.json({
      success: true,
      data: resultado
    });
  } catch (error) {
    console.error('❌ Erro ao verificar múltiplos IPs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para verificar status das localidades
app.get('/api/localidades/status', async (req, res) => {
  try {
    // Buscar todos os IPs das localidades (corrigido nome da coluna)
    db.all(`
      SELECT l.id, l.nome, li.ip_address as ip 
      FROM localidades l 
      LEFT JOIN localidade_ips li ON l.id = li.localidade_id
      WHERE li.ip_address IS NOT NULL
    `, async (err, localidades) => {
      if (err) {
        console.error('❌ Erro ao buscar localidades:', err);
        return res.status(500).json({
          success: false,
          error: 'Erro ao buscar localidades'
        });
      }
      
      console.log(`🔍 Encontradas ${localidades.length} localidades com IP configurado`);
      
      // Verificar conectividade de cada localidade
      const resultados = [];
      
      for (const localidade of localidades) {
        console.log(`🔍 Verificando IP ${localidade.ip} da localidade ${localidade.nome}`);
        const statusIP = await verificarIPOnline(localidade.ip);
        resultados.push({
          id: localidade.id,
          nome: localidade.nome,
          ip: localidade.ip,
          online: statusIP.online,
          responseTime: statusIP.responseTime,
          message: statusIP.message,
          timestamp: statusIP.timestamp
        });
      }
      
      res.json({
        success: true,
        data: {
          timestamp: new Date().toISOString(),
          total: resultados.length,
          online: resultados.filter(r => r.online).length,
          offline: resultados.filter(r => !r.online).length,
          localidades: resultados
        }
      });
    });
  } catch (error) {
    console.error('❌ Erro ao verificar status das localidades:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Configuração do banco de dados SQLite
const dbPath = path.join(__dirname, '../database/tv_saude.db');
const db = new sqlite3.Database(dbPath);

// Criar tabelas se não existirem
db.serialize(() => {
  // Tabela de usuários
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      tipo TEXT DEFAULT 'operador' CHECK(tipo IN ('admin', 'operador')),
      ativo BOOLEAN DEFAULT 1,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      ultimo_login DATETIME
    )
  `);

  // Criar usuário admin padrão se não existir
  db.get('SELECT id FROM usuarios WHERE email = ?', ['admin@tvsaude.com'], (err, row) => {
    if (!row) {
      const senhaHash = bcrypt.hashSync('admin123', 10);
      db.run(
        'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
        ['Administrador', 'admin@tvsaude.com', senhaHash, 'admin'],
        function(err) {
          if (err) {
            console.error('Erro ao criar usuário admin:', err);
          } else {
            console.log('👤 Usuário admin criado: admin@tvsaude.com / admin123');
          }
        }
      );
    }
  });

  // Tabela de vídeos
  db.run(`
    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descricao TEXT,
      categoria TEXT,
      arquivo TEXT,
      url_youtube TEXT,
      tipo TEXT DEFAULT 'local',
      duracao INTEGER,
      ativo BOOLEAN DEFAULT 1,
      ordem INTEGER DEFAULT 0,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      criado_por INTEGER,
      FOREIGN KEY (criado_por) REFERENCES usuarios (id)
    )
  `);
  
  // Tabela de playlists
  db.run(`
    CREATE TABLE IF NOT EXISTS playlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT,
      ativa BOOLEAN DEFAULT 0,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      criado_por INTEGER,
      FOREIGN KEY (criado_por) REFERENCES usuarios (id)
    )
  `);
  
  // Tabela de relacionamento playlist-videos
  db.run(`
    CREATE TABLE IF NOT EXISTS playlist_videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      playlist_id INTEGER NOT NULL,
      video_id INTEGER NOT NULL,
      ordem INTEGER DEFAULT 0,
      FOREIGN KEY (playlist_id) REFERENCES playlists (id) ON DELETE CASCADE,
      FOREIGN KEY (video_id) REFERENCES videos (id) ON DELETE CASCADE
    )
  `);
  
  // Tabela para controle remoto
  db.run(`
    CREATE TABLE IF NOT EXISTS controle_tv (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      comando TEXT NOT NULL,
      parametros TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      enviado_por INTEGER,
      FOREIGN KEY (enviado_por) REFERENCES usuarios (id)
    )
  `);

  // Tabela de mensagens em tempo real
  db.run(`
    CREATE TABLE IF NOT EXISTS mensagens_tempo_real (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      conteudo TEXT NOT NULL,
      tipo TEXT DEFAULT 'info' CHECK(tipo IN ('info', 'success', 'warning', 'error', 'urgent')),
      prioridade INTEGER DEFAULT 1 CHECK(prioridade BETWEEN 1 AND 4),
      ativo BOOLEAN DEFAULT 1,
      data_expiracao DATETIME,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      criado_por INTEGER,
      FOREIGN KEY (criado_por) REFERENCES usuarios (id)
    )
  `);

  // Tabela de imagens para slideshow
  db.run(`
    CREATE TABLE IF NOT EXISTS imagens_slideshow (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descricao TEXT,
      arquivo TEXT NOT NULL,
      ativo BOOLEAN DEFAULT 1,
      ordem INTEGER DEFAULT 0,
      duracao INTEGER DEFAULT 5000,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      criado_por INTEGER,
      FOREIGN KEY (criado_por) REFERENCES usuarios (id)
    )
  `);

  // Tabela de localidades
  db.run(`
    CREATE TABLE IF NOT EXISTS localidades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT,
      ativo BOOLEAN DEFAULT 1,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      criado_por INTEGER,
      FOREIGN KEY (criado_por) REFERENCES usuarios (id)
    )
  `);

  // Tabela de IPs por localidade
  db.run(`
    CREATE TABLE IF NOT EXISTS localidade_ips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      localidade_id INTEGER NOT NULL,
      ip_address TEXT NOT NULL,
      ip_range TEXT,
      descricao TEXT,
      ativo BOOLEAN DEFAULT 1,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (localidade_id) REFERENCES localidades (id) ON DELETE CASCADE
    )
  `);

  // Tabela de relacionamento localidade-playlists
  db.run(`
    CREATE TABLE IF NOT EXISTS localidade_playlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      localidade_id INTEGER NOT NULL,
      playlist_id INTEGER NOT NULL,
      prioridade INTEGER DEFAULT 1,
      ativo BOOLEAN DEFAULT 1,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (localidade_id) REFERENCES localidades (id) ON DELETE CASCADE,
      FOREIGN KEY (playlist_id) REFERENCES playlists (id) ON DELETE CASCADE
    )
  `);

  // Tabela de relacionamento localidade-vídeos (para vídeos específicos sem playlist)
  db.run(`
    CREATE TABLE IF NOT EXISTS localidade_videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      localidade_id INTEGER NOT NULL,
      video_id INTEGER NOT NULL,
      prioridade INTEGER DEFAULT 1,
      ativo BOOLEAN DEFAULT 1,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (localidade_id) REFERENCES localidades (id) ON DELETE CASCADE,
      FOREIGN KEY (video_id) REFERENCES videos (id) ON DELETE CASCADE
    )
  `);

  // Tabela de relacionamento localidade-imagens (para imagens específicas por localidade)
  db.run(`
    CREATE TABLE IF NOT EXISTS localidade_imagens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      localidade_id INTEGER NOT NULL,
      imagem_id INTEGER NOT NULL,
      prioridade INTEGER DEFAULT 1,
      ativo BOOLEAN DEFAULT 1,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (localidade_id) REFERENCES localidades (id) ON DELETE CASCADE,
      FOREIGN KEY (imagem_id) REFERENCES imagens_slideshow (id) ON DELETE CASCADE
    )
  `);
  
  // Adicionar colunas se não existirem (para compatibilidade com banco existente)
  db.run(`ALTER TABLE videos ADD COLUMN url_youtube TEXT`, () => {});
  db.run(`ALTER TABLE videos ADD COLUMN tipo TEXT DEFAULT 'local'`, () => {});
  db.run(`ALTER TABLE videos ADD COLUMN criado_por INTEGER`, () => {});
  db.run(`ALTER TABLE playlists ADD COLUMN criado_por INTEGER`, () => {});
  db.run(`ALTER TABLE controle_tv ADD COLUMN enviado_por INTEGER`, () => {});
  db.run(`ALTER TABLE mensagens_tempo_real ADD COLUMN criado_por INTEGER`, () => {});
});

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Middleware para verificar se é admin
const requireAdmin = (req, res, next) => {
  if (req.user.tipo !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  next();
};

// ===== ROTAS DE AUTENTICAÇÃO =====

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  db.get(
    'SELECT * FROM usuarios WHERE email = ? AND ativo = 1',
    [email],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!user || !bcrypt.compareSync(senha, user.senha)) {
        return res.status(401).json({ error: 'Email ou senha incorretos' });
      }

      // Atualizar último login
      db.run(
        'UPDATE usuarios SET ultimo_login = CURRENT_TIMESTAMP WHERE id = ?',
        [user.id]
      );

      // Gerar token JWT
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          nome: user.nome, 
          tipo: user.tipo 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Remover senha da resposta
      const { senha: _, ...userWithoutPassword } = user;

      res.json({
        message: 'Login realizado com sucesso',
        token,
        user: userWithoutPassword
      });
    }
  );
});

// Verificar token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  db.get(
    'SELECT id, nome, email, tipo, ativo, data_criacao, ultimo_login FROM usuarios WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!user || !user.ativo) {
        return res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
      }
      res.json({ user });
    }
  );
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logout realizado com sucesso' });
});

// ===== ROTAS DE USUÁRIOS =====

// Listar usuários (apenas admin)
app.get('/api/usuarios', authenticateToken, requireAdmin, (req, res) => {
  db.all(
    'SELECT id, nome, email, tipo, ativo, data_criacao, ultimo_login FROM usuarios ORDER BY data_criacao DESC',
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Criar usuário (apenas admin)
app.post('/api/usuarios', authenticateToken, requireAdmin, (req, res) => {
  const { nome, email, senha, tipo } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
  }

  if (!['admin', 'operador'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo deve ser "admin" ou "operador"' });
  }

  const senhaHash = bcrypt.hashSync(senha, 10);

  db.run(
    'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
    [nome, email, senhaHash, tipo || 'operador'],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Email já está em uso' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.json({
        id: this.lastID,
        nome,
        email,
        tipo: tipo || 'operador',
        message: 'Usuário criado com sucesso!'
      });
    }
  );
});

// Atualizar usuário (apenas admin)
app.put('/api/usuarios/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { nome, email, senha, tipo, ativo } = req.body;

  let query = 'UPDATE usuarios SET nome = ?, email = ?, tipo = ?, ativo = ?, data_atualizacao = CURRENT_TIMESTAMP';
  let params = [nome, email, tipo, ativo];

  if (senha) {
    const senhaHash = bcrypt.hashSync(senha, 10);
    query += ', senha = ?';
    params.push(senhaHash);
  }

  query += ' WHERE id = ?';
  params.push(id);

  db.run(query, params, function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Email já está em uso' });
      }
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json({ message: 'Usuário atualizado com sucesso!' });
  });
});

// Deletar usuário (apenas admin)
app.delete('/api/usuarios/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  // Não permitir deletar o próprio usuário
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: 'Não é possível deletar seu próprio usuário' });
  }

  db.run('DELETE FROM usuarios WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json({ message: 'Usuário deletado com sucesso!' });
  });
});

// Configuração do Multer para upload de vídeos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Aceitar apenas arquivos de vídeo
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de vídeo são permitidos!'), false);
    }
  },
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limite
  }
});

// Configuração do Multer para upload de imagens
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../images');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadImage = multer({
  storage: imageStorage,
  fileFilter: (req, file, cb) => {
    // Aceitar apenas arquivos de imagem
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limite para imagens
  }
});

// ROTAS DA API

// Listar todos os vídeos ativos (público - para as TVs)
app.get('/api/videos', (req, res) => {
  db.all(
    'SELECT * FROM videos WHERE ativo = 1 ORDER BY ordem ASC, data_criacao DESC',
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Listar todos os vídeos (admin - para o dashboard)
app.get('/api/videos/admin', authenticateToken, (req, res) => {
  db.all(
    'SELECT v.*, u.nome as criado_por_nome FROM videos v LEFT JOIN usuarios u ON v.criado_por = u.id ORDER BY v.data_criacao DESC',
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Obter vídeo por ID
app.get('/api/videos/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM videos WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Vídeo não encontrado' });
      return;
    }
    res.json(row);
  });
});

// Função para extrair ID do YouTube da URL
const extractYouTubeId = (url) => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Função para validar URL do YouTube
const isValidYouTubeUrl = (url) => {
  return extractYouTubeId(url) !== null;
};

// Upload de novo vídeo (protegido)
app.post('/api/videos', authenticateToken, upload.single('video'), async (req, res) => {
  const { titulo, descricao, categoria, ordem, tipo, url_youtube } = req.body;

  try {
    if (tipo === 'youtube') {
      // Validar URL do YouTube
      if (!url_youtube || !isValidYouTubeUrl(url_youtube)) {
        return res.status(400).json({ error: 'URL do YouTube inválida' });
      }

      // Extrair informações do vídeo do YouTube
      let videoInfo;
      try {
        videoInfo = await ytdl.getInfo(url_youtube);
      } catch (error) {
        return res.status(400).json({ error: 'Não foi possível acessar o vídeo do YouTube. Verifique se o vídeo é público.' });
      }

      const youtubeTitle = videoInfo.videoDetails.title;
      const youtubeDuration = parseInt(videoInfo.videoDetails.lengthSeconds);
      const youtubeDescription = videoInfo.videoDetails.description;

      db.run(
        'INSERT INTO videos (titulo, descricao, categoria, url_youtube, tipo, duracao, ordem, criado_por) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          titulo || youtubeTitle,
          descricao || youtubeDescription.substring(0, 500),
          categoria || 'Geral',
          url_youtube,
          'youtube',
          youtubeDuration,
          ordem || 0,
          req.user.id
        ],
        function(err) {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json({
            id: this.lastID,
            titulo: titulo || youtubeTitle,
            descricao: descricao || youtubeDescription.substring(0, 500),
            categoria: categoria || 'Geral',
            url_youtube,
            tipo: 'youtube',
            duracao: youtubeDuration,
            ordem: ordem || 0,
            message: 'Vídeo do YouTube adicionado com sucesso!'
          });
        }
      );
    } else {
      // Upload local (comportamento original)
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo de vídeo enviado' });
      }

      const arquivo = req.file.filename;

      db.run(
        'INSERT INTO videos (titulo, descricao, categoria, arquivo, tipo, ordem, criado_por) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [titulo, descricao || '', categoria || 'Geral', arquivo, 'local', ordem || 0, req.user.id],
        function(err) {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json({
            id: this.lastID,
            titulo,
            descricao,
            categoria,
            arquivo,
            tipo: 'local',
            ordem: ordem || 0,
            message: 'Vídeo enviado com sucesso!'
          });
        }
      );
    }
  } catch (error) {
    console.error('Erro ao processar vídeo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar vídeo (protegido)
app.put('/api/videos/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { titulo, descricao, categoria, ativo, ordem, url_youtube } = req.body;

  try {
    // Se for atualização de URL do YouTube, validar
    if (url_youtube && !isValidYouTubeUrl(url_youtube)) {
      return res.status(400).json({ error: 'URL do YouTube inválida' });
    }

    db.run(
      'UPDATE videos SET titulo = ?, descricao = ?, categoria = ?, ativo = ?, ordem = ?, url_youtube = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?',
      [titulo, descricao, categoria, ativo, ordem, url_youtube || null, id],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        if (this.changes === 0) {
          res.status(404).json({ error: 'Vídeo não encontrado' });
          return;
        }
        res.json({ message: 'Vídeo atualizado com sucesso!' });
      }
    );
  } catch (error) {
    console.error('Erro ao atualizar vídeo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar vídeo (protegido)
app.delete('/api/videos/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  // Primeiro, obter informações do vídeo
  db.get('SELECT arquivo, tipo FROM videos WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Vídeo não encontrado' });
      return;
    }

    // Deletar arquivo físico apenas se for vídeo local
    if (row.tipo === 'local' && row.arquivo) {
      const filePath = path.join(__dirname, '../uploads', row.arquivo);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Deletar registro do banco
    db.run('DELETE FROM videos WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Vídeo deletado com sucesso!' });
    });
  });
});

// Listar categorias disponíveis
app.get('/api/categorias', (req, res) => {
  db.all(
    'SELECT DISTINCT categoria FROM videos WHERE ativo = 1 AND categoria IS NOT NULL',
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      const categorias = rows.map(row => row.categoria);
      res.json(categorias);
    }
  );
});

// ===== ROTAS DE PLAYLISTS =====

// Listar todas as playlists
app.get('/api/playlists', (req, res) => {
  db.all(
    'SELECT * FROM playlists ORDER BY data_criacao DESC',
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Obter playlist por ID com seus vídeos
app.get('/api/playlists/:id', (req, res) => {
  const { id } = req.params;
  
  // Buscar dados da playlist
  db.get('SELECT * FROM playlists WHERE id = ?', [id], (err, playlist) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!playlist) {
      res.status(404).json({ error: 'Playlist não encontrada' });
      return;
    }

    // Buscar vídeos da playlist
    db.all(`
      SELECT v.*, pv.ordem as playlist_ordem 
      FROM videos v 
      INNER JOIN playlist_videos pv ON v.id = pv.video_id 
      WHERE pv.playlist_id = ? 
      ORDER BY pv.ordem ASC
    `, [id], (err, videos) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.json({
        ...playlist,
        videos: videos || []
      });
    });
  });
});

// Obter playlist ativa com seus vídeos (público - para as TVs)
app.get('/api/playlists/ativa/videos', (req, res) => {
  // Buscar playlist ativa
  db.get('SELECT * FROM playlists WHERE ativa = 1', (err, playlist) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!playlist) {
      // Se não há playlist ativa, retornar todos os vídeos ativos
      db.all(
        'SELECT * FROM videos WHERE ativo = 1 ORDER BY ordem ASC, data_criacao DESC',
        (err, videos) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json({
            playlist: null,
            videos: videos || []
          });
        }
      );
      return;
    }

    // Buscar vídeos da playlist ativa
    db.all(`
      SELECT v.*, pv.ordem as playlist_ordem 
      FROM videos v 
      INNER JOIN playlist_videos pv ON v.id = pv.video_id 
      WHERE pv.playlist_id = ? AND v.ativo = 1
      ORDER BY pv.ordem ASC
    `, [playlist.id], (err, videos) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.json({
        playlist,
        videos: videos || []
      });
    });
  });
});

// Criar nova playlist (protegido)
app.post('/api/playlists', authenticateToken, (req, res) => {
  const { nome, descricao } = req.body;
  
  if (!nome || !nome.trim()) {
    return res.status(400).json({ error: 'Nome da playlist é obrigatório' });
  }

  db.run(
    'INSERT INTO playlists (nome, descricao, criado_por) VALUES (?, ?, ?)',
    [nome.trim(), descricao || '', req.user.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        id: this.lastID,
        nome: nome.trim(),
        descricao: descricao || '',
        ativa: false,
        message: 'Playlist criada com sucesso!'
      });
    }
  );
});

// Atualizar playlist (protegido)
app.put('/api/playlists/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { nome, descricao, ativa } = req.body;

  if (!nome || !nome.trim()) {
    return res.status(400).json({ error: 'Nome da playlist é obrigatório' });
  }

  // Se esta playlist está sendo ativada, desativar todas as outras
  if (ativa) {
    db.run('UPDATE playlists SET ativa = 0', (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Agora ativar esta playlist
      db.run(
        'UPDATE playlists SET nome = ?, descricao = ?, ativa = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?',
        [nome.trim(), descricao || '', ativa ? 1 : 0, id],
        function(err) {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          if (this.changes === 0) {
            res.status(404).json({ error: 'Playlist não encontrada' });
            return;
          }
          res.json({ message: 'Playlist atualizada com sucesso!' });
        }
      );
    });
  } else {
    db.run(
      'UPDATE playlists SET nome = ?, descricao = ?, ativa = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?',
      [nome.trim(), descricao || '', ativa ? 1 : 0, id],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        if (this.changes === 0) {
          res.status(404).json({ error: 'Playlist não encontrada' });
          return;
        }
        res.json({ message: 'Playlist atualizada com sucesso!' });
      }
    );
  }
});

// Deletar playlist (protegido)
app.delete('/api/playlists/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  // Primeiro deletar relacionamentos
  db.run('DELETE FROM playlist_videos WHERE playlist_id = ?', [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Depois deletar a playlist
    db.run('DELETE FROM playlists WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Playlist não encontrada' });
        return;
      }
      res.json({ message: 'Playlist deletada com sucesso!' });
    });
  });
});

// Adicionar vídeo à playlist (protegido)
app.post('/api/playlists/:id/videos', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { video_id, ordem } = req.body;

  if (!video_id) {
    return res.status(400).json({ error: 'ID do vídeo é obrigatório' });
  }

  // Verificar se o vídeo existe
  db.get('SELECT id FROM videos WHERE id = ?', [video_id], (err, video) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!video) {
      res.status(404).json({ error: 'Vídeo não encontrado' });
      return;
    }

    // Verificar se o vídeo já está na playlist
    db.get('SELECT id FROM playlist_videos WHERE playlist_id = ? AND video_id = ?', [id, video_id], (err, existing) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (existing) {
        res.status(400).json({ error: 'Vídeo já está na playlist' });
        return;
      }

      // Adicionar vídeo à playlist
      db.run(
        'INSERT INTO playlist_videos (playlist_id, video_id, ordem) VALUES (?, ?, ?)',
        [id, video_id, ordem || 0],
        function(err) {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json({ message: 'Vídeo adicionado à playlist com sucesso!' });
        }
      );
    });
  });
});

// Remover vídeo da playlist (protegido)
app.delete('/api/playlists/:id/videos/:video_id', authenticateToken, (req, res) => {
  const { id, video_id } = req.params;

  db.run('DELETE FROM playlist_videos WHERE playlist_id = ? AND video_id = ?', [id, video_id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Vídeo não encontrado na playlist' });
      return;
    }
    res.json({ message: 'Vídeo removido da playlist com sucesso!' });
  });
});

// Atualizar ordem dos vídeos na playlist (protegido)
app.put('/api/playlists/:id/videos/ordem', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { videos } = req.body; // Array de { video_id, ordem }

  if (!Array.isArray(videos)) {
    return res.status(400).json({ error: 'Lista de vídeos inválida' });
  }

  // Atualizar ordem de cada vídeo
  const updatePromises = videos.map(({ video_id, ordem }) => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE playlist_videos SET ordem = ? WHERE playlist_id = ? AND video_id = ?',
        [ordem, id, video_id],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  });

  Promise.all(updatePromises)
    .then(() => {
      res.json({ message: 'Ordem dos vídeos atualizada com sucesso!' });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

// ===== ROTAS DE IMAGENS SLIDESHOW =====

// Listar todas as imagens ativas (público - para as TVs)
app.get('/api/imagens', (req, res) => {
  db.all(
    'SELECT * FROM imagens_slideshow WHERE ativo = 1 ORDER BY ordem ASC, data_criacao DESC',
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Listar todas as imagens (protegido - para admin)
app.get('/api/admin/imagens', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM imagens_slideshow ORDER BY ordem ASC, data_criacao DESC',
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Adicionar nova imagem (protegido)
app.post('/api/admin/imagens', authenticateToken, uploadImage.single('arquivo'), (req, res) => {
  const { titulo, descricao, duracao, ordem } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ error: 'Arquivo de imagem é obrigatório' });
  }

  db.run(
    'INSERT INTO imagens_slideshow (titulo, descricao, arquivo, duracao, ordem, criado_por) VALUES (?, ?, ?, ?, ?, ?)',
    [titulo, descricao, req.file.filename, duracao || 5000, ordem || 0, req.user.id],
    function(err) {
      if (err) {
        // Remover arquivo se erro no banco
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {}
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ 
        id: this.lastID, 
        message: 'Imagem adicionada com sucesso',
        arquivo: req.file.filename 
      });
    }
  );
});

// Atualizar imagem (protegido)
app.put('/api/admin/imagens/:id', authenticateToken, (req, res) => {
  const { titulo, descricao, duracao, ordem, ativo } = req.body;
  const imagemId = req.params.id;

  db.run(
    'UPDATE imagens_slideshow SET titulo = ?, descricao = ?, duracao = ?, ordem = ?, ativo = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?',
    [titulo, descricao, duracao, ordem, ativo, imagemId],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Imagem não encontrada' });
        return;
      }
      res.json({ message: 'Imagem atualizada com sucesso' });
    }
  );
});

// Deletar imagem (protegido)
app.delete('/api/admin/imagens/:id', authenticateToken, (req, res) => {
  const imagemId = req.params.id;

  // Buscar arquivo para deletar
  db.get('SELECT arquivo FROM imagens_slideshow WHERE id = ?', [imagemId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: 'Imagem não encontrada' });
      return;
    }

    // Deletar registro do banco
    db.run('DELETE FROM imagens_slideshow WHERE id = ?', [imagemId], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Deletar arquivo físico
      try {
        const filePath = path.join(__dirname, '../images', row.arquivo);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (e) {
        console.error('Erro ao deletar arquivo:', e);
      }

      res.json({ message: 'Imagem deletada com sucesso' });
    });
  });
});

// ===== ROTAS DE CONTROLE REMOTO =====

// Enviar comando para TV (protegido)
app.post('/api/controle', authenticateToken, (req, res) => {
  const { comando, parametros } = req.body;

  if (!comando) {
    return res.status(400).json({ error: 'Comando é obrigatório' });
  }

  db.run(
    'INSERT INTO controle_tv (comando, parametros, enviado_por) VALUES (?, ?, ?)',
    [comando, parametros ? JSON.stringify(parametros) : null, req.user.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ 
        id: this.lastID,
        comando,
        parametros,
        message: 'Comando enviado com sucesso!' 
      });
    }
  );
});

// Obter último comando (público - para a TV consultar)
app.get('/api/controle/ultimo', (req, res) => {
  // Buscar último comando que não seja problemático - INCLUINDO BLOQUEIO DE REFRESH
  db.get(
    `SELECT * FROM controle_tv 
     WHERE NOT (
       (comando = 'play' AND (parametros IS NULL OR parametros = 'null')) OR
       (comando = 'background_music_off' AND (parametros IS NULL OR parametros = 'null')) OR
       (comando = 'background_music_on' AND (parametros IS NULL OR parametros = 'null')) OR
       (comando = 'refresh')
     )
     ORDER BY timestamp DESC LIMIT 1`,
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (row && row.parametros) {
        try {
          row.parametros = JSON.parse(row.parametros);
        } catch (e) {
          row.parametros = null;
        }
      }
      
      res.json(row || null);
    }
  );
});

// ===== ROTAS DE CONTROLE DE ÁUDIO AVANÇADO =====

// Listar faixas de áudio disponíveis
app.get('/api/audio/tracks', (req, res) => {
  const fs = require('fs');
  const audioPath = path.join(__dirname, '../audio');
  
  try {
    // Ler todos os arquivos da pasta audio
    const files = fs.readdirSync(audioPath);
    
    // Filtrar apenas arquivos .mp3
    const mp3Files = files.filter(file => 
      file.toLowerCase().endsWith('.mp3') && 
      !file.includes('.placeholder')
    );
    
    // Criar lista de tracks dinamicamente
    const tracks = mp3Files.map((file, index) => {
      // Criar nome amigável removendo extensão e formatando
      const name = file
        .replace('.mp3', '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      
      return {
        id: `track-${index + 1}`,
        name: name,
        url: `/audio/${file}`,
        description: `Música ambiente: ${name}`
      };
    });
    
    res.json(tracks);
  } catch (error) {
    console.error('Erro ao listar faixas de áudio:', error);
    res.status(500).json({ error: 'Erro ao carregar faixas de áudio' });
  }
});

// Controle de áudio de fundo
app.post('/api/audio/background', authenticateToken, (req, res) => {
  const { action, trackId, volume } = req.body;
  
  let comando;
  let parametros = {};
  
  switch(action) {
    case 'toggle':
      comando = 'toggle_background_music';
      break;
    case 'on':
      comando = 'background_music_on';
      break;
    case 'off':
      comando = 'background_music_off';
      break;
    case 'change_track':
      comando = 'change_background_track';
      parametros.trackId = trackId;
      break;
    case 'volume_up':
      comando = 'background_volume_up';
      break;
    case 'volume_down':
      comando = 'background_volume_down';
      break;
    case 'auto_balance':
      comando = 'auto_balance_audio';
      break;
    default:
      return res.status(400).json({ error: 'Ação inválida' });
  }
  
  db.run(
    'INSERT INTO controle_tv (comando, parametros, enviado_por) VALUES (?, ?, ?)',
    [comando, Object.keys(parametros).length ? JSON.stringify(parametros) : null, req.user.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ 
        id: this.lastID,
        comando,
        parametros,
        message: `Comando de áudio ${action} enviado com sucesso!` 
      });
    }
  );
});

// Controle do visualizador de áudio
app.post('/api/audio/visualizer', authenticateToken, (req, res) => {
  const { action, type } = req.body;
  
  let comando;
  let parametros = {};
  
  switch(action) {
    case 'toggle':
      comando = 'toggle_audio_visualizer';
      break;
    case 'change_type':
      comando = 'change_visualizer_type';
      parametros.type = type;
      break;
    default:
      return res.status(400).json({ error: 'Ação inválida' });
  }
  
  db.run(
    'INSERT INTO controle_tv (comando, parametros, enviado_por) VALUES (?, ?, ?)',
    [comando, Object.keys(parametros).length ? JSON.stringify(parametros) : null, req.user.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ 
        id: this.lastID,
        comando,
        parametros,
        message: `Comando de visualizador ${action} enviado com sucesso!` 
      });
    }
  );
});

// Limpar comandos antigos (protegido)
app.delete('/api/controle/limpar', authenticateToken, (req, res) => {
  // Manter apenas os últimos 10 comandos
  db.run(
    'DELETE FROM controle_tv WHERE id NOT IN (SELECT id FROM controle_tv ORDER BY timestamp DESC LIMIT 10)',
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: `${this.changes} comandos antigos removidos` });
    }
  );
});

// ===== ROTAS DE MENSAGENS EM TEMPO REAL =====

// Listar mensagens ativas (público - para as TVs)
app.get('/api/mensagens', (req, res) => {
  db.all(
    `SELECT * FROM mensagens_tempo_real 
     WHERE ativo = 1 AND (data_expiracao IS NULL OR data_expiracao > datetime('now'))
     ORDER BY prioridade DESC, data_criacao ASC`,
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Listar todas as mensagens (admin - para o dashboard)
app.get('/api/mensagens/admin', authenticateToken, (req, res) => {
  db.all(
    `SELECT m.*, u.nome as criado_por_nome 
     FROM mensagens_tempo_real m 
     LEFT JOIN usuarios u ON m.criado_por = u.id 
     ORDER BY m.data_criacao DESC`,
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Criar nova mensagem (protegido)
app.post('/api/mensagens', authenticateToken, (req, res) => {
  const { titulo, conteudo, tipo, prioridade, data_expiracao } = req.body;

  if (!titulo || !conteudo) {
    return res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });
  }

  const tiposValidos = ['info', 'success', 'warning', 'error', 'urgent'];
  if (tipo && !tiposValidos.includes(tipo)) {
    return res.status(400).json({ error: 'Tipo inválido' });
  }

  const prioridadeNum = parseInt(prioridade) || 1;
  if (prioridadeNum < 1 || prioridadeNum > 4) {
    return res.status(400).json({ error: 'Prioridade deve ser entre 1 e 4' });
  }

  db.run(
    'INSERT INTO mensagens_tempo_real (titulo, conteudo, tipo, prioridade, data_expiracao, criado_por) VALUES (?, ?, ?, ?, ?, ?)',
    [titulo, conteudo, tipo || 'info', prioridadeNum, data_expiracao || null, req.user.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        id: this.lastID,
        titulo,
        conteudo,
        tipo: tipo || 'info',
        prioridade: prioridadeNum,
        data_expiracao,
        message: 'Mensagem criada com sucesso!'
      });
    }
  );
});

// Atualizar mensagem (protegido)
app.put('/api/mensagens/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { titulo, conteudo, tipo, prioridade, ativo, data_expiracao } = req.body;

  if (!titulo || !conteudo) {
    return res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });
  }

  const tiposValidos = ['info', 'success', 'warning', 'error', 'urgent'];
  if (tipo && !tiposValidos.includes(tipo)) {
    return res.status(400).json({ error: 'Tipo inválido' });
  }

  const prioridadeNum = parseInt(prioridade) || 1;
  if (prioridadeNum < 1 || prioridadeNum > 4) {
    return res.status(400).json({ error: 'Prioridade deve ser entre 1 e 4' });
  }

  db.run(
    'UPDATE mensagens_tempo_real SET titulo = ?, conteudo = ?, tipo = ?, prioridade = ?, ativo = ?, data_expiracao = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?',
    [titulo, conteudo, tipo || 'info', prioridadeNum, ativo, data_expiracao || null, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Mensagem não encontrada' });
        return;
      }
      res.json({ message: 'Mensagem atualizada com sucesso!' });
    }
  );
});

// Ativar/Desativar mensagem (protegido)
app.patch('/api/mensagens/:id/toggle', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.get('SELECT ativo FROM mensagens_tempo_real WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Mensagem não encontrada' });
      return;
    }

    const novoStatus = !row.ativo;
    db.run(
      'UPDATE mensagens_tempo_real SET ativo = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?',
      [novoStatus, id],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ 
          message: `Mensagem ${novoStatus ? 'ativada' : 'desativada'} com sucesso!`,
          ativo: novoStatus
        });
      }
    );
  });
});

// Deletar mensagem (protegido)
app.delete('/api/mensagens/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM mensagens_tempo_real WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Mensagem não encontrada' });
      return;
    }
    res.json({ message: 'Mensagem deletada com sucesso!' });
  });
});

// ===== ROTAS DE LOCALIDADES =====

// Função para verificar se um IP está em uma faixa
const isIpInRange = (ip, range) => {
  if (!range) return false;
  
  // Suporte para CIDR (ex: 192.168.1.0/24)
  if (range.includes('/')) {
    const [network, prefixLength] = range.split('/');
    const networkParts = network.split('.').map(Number);
    const ipParts = ip.split('.').map(Number);
    const prefix = parseInt(prefixLength);
    
    // Converter para binário e comparar
    const networkBinary = (networkParts[0] << 24) + (networkParts[1] << 16) + (networkParts[2] << 8) + networkParts[3];
    const ipBinary = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
    const mask = (-1 << (32 - prefix)) >>> 0;
    
    return (networkBinary & mask) === (ipBinary & mask);
  }
  
  // Suporte para range simples (ex: 192.168.1.1-192.168.1.100)
  if (range.includes('-')) {
    const [startIp, endIp] = range.split('-');
    const startParts = startIp.split('.').map(Number);
    const endParts = endIp.split('.').map(Number);
    const ipParts = ip.split('.').map(Number);
    
    const startBinary = (startParts[0] << 24) + (startParts[1] << 16) + (startParts[2] << 8) + startParts[3];
    const endBinary = (endParts[0] << 24) + (endParts[1] << 16) + (endParts[2] << 8) + endParts[3];
    const ipBinary = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
    
    return ipBinary >= startBinary && ipBinary <= endBinary;
  }
  
  // IP exato
  return ip === range;
};

// Função para detectar localidade baseada no IP
const detectLocalidade = (clientIp) => {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT l.*, li.ip_address, li.ip_range 
      FROM localidades l 
      INNER JOIN localidade_ips li ON l.id = li.localidade_id 
      WHERE l.ativo = 1 AND li.ativo = 1
    `, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      // Procurar por correspondência de IP
      for (const row of rows) {
        if (row.ip_address === clientIp || isIpInRange(clientIp, row.ip_range)) {
          resolve({
            id: row.id,
            nome: row.nome,
            descricao: row.descricao,
            ip_matched: row.ip_address || row.ip_range
          });
          return;
        }
      }
      
      // Nenhuma localidade encontrada
      resolve(null);
    });
  });
};

// Listar todas as localidades (protegido)
app.get('/api/localidades', authenticateToken, (req, res) => {
  db.all(
    `SELECT l.*, u.nome as criado_por_nome,
     COUNT(li.id) as total_ips
     FROM localidades l 
     LEFT JOIN usuarios u ON l.criado_por = u.id
     LEFT JOIN localidade_ips li ON l.id = li.localidade_id AND li.ativo = 1
     GROUP BY l.id
     ORDER BY l.data_criacao DESC`,
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Obter conteúdo por localidade baseado no IP (público - para as TVs)
// IMPORTANTE: Esta rota deve vir ANTES de /api/localidades/:id
app.get('/api/localidades/conteudo', async (req, res) => {
  try {
    // Obter IP do cliente
    const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 
                    (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                    req.headers['x-real-ip'] ||
                    '127.0.0.1';

    console.log(`🌍 Detectando localidade para IP: ${clientIp}`);

    // Detectar localidade
    const localidade = await detectLocalidade(clientIp);
    
    if (!localidade) {
      // Se não encontrou localidade específica, retornar conteúdo padrão
      console.log(`📍 Nenhuma localidade específica encontrada para IP ${clientIp}, usando conteúdo padrão`);
      
      // Buscar playlist ativa global
      db.get('SELECT * FROM playlists WHERE ativa = 1', (err, playlist) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        if (!playlist) {
          // Retornar todos os vídeos ativos
          db.all(
            'SELECT * FROM videos WHERE ativo = 1 ORDER BY ordem ASC, data_criacao DESC',
            (err, videos) => {
              if (err) {
                res.status(500).json({ error: err.message });
                return;
              }
              res.json({
                localidade: null,
                playlist: null,
                videos: videos || [],
                ip_cliente: clientIp
              });
            }
          );
          return;
        }

        // Buscar vídeos da playlist ativa
        db.all(`
          SELECT v.*, pv.ordem as playlist_ordem 
          FROM videos v 
          INNER JOIN playlist_videos pv ON v.id = pv.video_id 
          WHERE pv.playlist_id = ? AND v.ativo = 1
          ORDER BY pv.ordem ASC
        `, [playlist.id], (err, videos) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          
          res.json({
            localidade: null,
            playlist,
            videos: videos || [],
            ip_cliente: clientIp
          });
        });
      });
      return;
    }

    console.log(`📍 Localidade detectada: ${localidade.nome} (IP: ${localidade.ip_matched})`);

    // Buscar playlists associadas à localidade
    db.all(`
      SELECT p.*, lp.prioridade 
      FROM playlists p 
      INNER JOIN localidade_playlists lp ON p.id = lp.playlist_id 
      WHERE lp.localidade_id = ? AND lp.ativo = 1 AND p.ativa = 1
      ORDER BY lp.prioridade DESC
    `, [localidade.id], (err, playlists) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (playlists.length === 0) {
        // Se não há playlists específicas, buscar vídeos e imagens específicos da localidade
        db.all(`
          SELECT v.*, lv.prioridade 
          FROM videos v 
          INNER JOIN localidade_videos lv ON v.id = lv.video_id 
          WHERE lv.localidade_id = ? AND lv.ativo = 1 AND v.ativo = 1
          ORDER BY lv.prioridade DESC, v.ordem ASC
        `, [localidade.id], (err, videos) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }

          // Buscar imagens específicas da localidade
          db.all(`
            SELECT i.*, li.prioridade 
            FROM imagens_slideshow i 
            INNER JOIN localidade_imagens li ON i.id = li.imagem_id 
            WHERE li.localidade_id = ? AND li.ativo = 1 AND i.ativo = 1
            ORDER BY li.prioridade DESC, i.ordem ASC
          `, [localidade.id], (err, imagens) => {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }

            res.json({
              localidade,
              playlist: null,
              videos: videos || [],
              imagens: imagens || [],
              ip_cliente: clientIp
            });
          });
        });
        return;
      }

      // Usar a playlist de maior prioridade
      const playlistPrincipal = playlists[0];
      
      // Buscar vídeos da playlist
      db.all(`
        SELECT v.*, pv.ordem as playlist_ordem 
        FROM videos v 
        INNER JOIN playlist_videos pv ON v.id = pv.video_id 
        WHERE pv.playlist_id = ? AND v.ativo = 1
        ORDER BY pv.ordem ASC
      `, [playlistPrincipal.id], (err, videos) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        res.json({
          localidade,
          playlist: playlistPrincipal,
          videos: videos || [],
          ip_cliente: clientIp
        });
      });
    });

  } catch (error) {
    console.error('Erro ao detectar localidade:', error);
    res.status(500).json({ error: 'Erro ao detectar localidade' });
  }
});

// Obter localidade por ID com IPs (protegido)
app.get('/api/localidades/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  // Buscar dados da localidade
  db.get('SELECT * FROM localidades WHERE id = ?', [id], (err, localidade) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!localidade) {
      res.status(404).json({ error: 'Localidade não encontrada' });
      return;
    }

    // Buscar IPs da localidade
    db.all(`
      SELECT * FROM localidade_ips 
      WHERE localidade_id = ? AND ativo = 1
      ORDER BY data_criacao ASC
    `, [id], (err, ips) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.json({
        ...localidade,
        ips: ips || []
      });
    });
  });
});

// Criar nova localidade (protegido)
app.post('/api/localidades', authenticateToken, (req, res) => {
  const { nome, descricao } = req.body;
  
  if (!nome || !nome.trim()) {
    return res.status(400).json({ error: 'Nome da localidade é obrigatório' });
  }

  db.run(
    'INSERT INTO localidades (nome, descricao, criado_por) VALUES (?, ?, ?)',
    [nome.trim(), descricao || '', req.user.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        id: this.lastID,
        nome: nome.trim(),
        descricao: descricao || '',
        ativo: true,
        message: 'Localidade criada com sucesso!'
      });
    }
  );
});

// Atualizar localidade (protegido)
app.put('/api/localidades/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { nome, descricao, ativo } = req.body;

  if (!nome || !nome.trim()) {
    return res.status(400).json({ error: 'Nome da localidade é obrigatório' });
  }

  db.run(
    'UPDATE localidades SET nome = ?, descricao = ?, ativo = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?',
    [nome.trim(), descricao || '', ativo, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Localidade não encontrada' });
        return;
      }
      res.json({ message: 'Localidade atualizada com sucesso!' });
    }
  );
});

// Deletar localidade (protegido)
app.delete('/api/localidades/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  // Primeiro deletar relacionamentos
  db.run('DELETE FROM localidade_ips WHERE localidade_id = ?', [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    db.run('DELETE FROM localidade_playlists WHERE localidade_id = ?', [id], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      db.run('DELETE FROM localidade_videos WHERE localidade_id = ?', [id], (err) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        // Depois deletar a localidade
        db.run('DELETE FROM localidades WHERE id = ?', [id], function(err) {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          if (this.changes === 0) {
            res.status(404).json({ error: 'Localidade não encontrada' });
            return;
          }
          res.json({ message: 'Localidade deletada com sucesso!' });
        });
      });
    });
  });
});

// Adicionar IP à localidade (protegido)
app.post('/api/localidades/:id/ips', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { ip_address, ip_range, descricao } = req.body;

  if (!ip_address && !ip_range) {
    return res.status(400).json({ error: 'IP ou faixa de IP é obrigatório' });
  }

  // Verificar se a localidade existe
  db.get('SELECT id FROM localidades WHERE id = ?', [id], (err, localidade) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!localidade) {
      res.status(404).json({ error: 'Localidade não encontrada' });
      return;
    }

    db.run(
      'INSERT INTO localidade_ips (localidade_id, ip_address, ip_range, descricao) VALUES (?, ?, ?, ?)',
      [id, ip_address || null, ip_range || null, descricao || ''],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ 
          id: this.lastID,
          message: 'IP adicionado à localidade com sucesso!' 
        });
      }
    );
  });
});

// Remover IP da localidade (protegido)
app.delete('/api/localidades/:id/ips/:ip_id', authenticateToken, (req, res) => {
  const { id, ip_id } = req.params;

  db.run('DELETE FROM localidade_ips WHERE id = ? AND localidade_id = ?', [ip_id, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'IP não encontrado na localidade' });
      return;
    }
    res.json({ message: 'IP removido da localidade com sucesso!' });
  });
});

// Associar playlist à localidade (protegido)
app.post('/api/localidades/:id/playlists', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { playlist_id, prioridade } = req.body;

  if (!playlist_id) {
    return res.status(400).json({ error: 'ID da playlist é obrigatório' });
  }

  // Verificar se a playlist existe
  db.get('SELECT id FROM playlists WHERE id = ?', [playlist_id], (err, playlist) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!playlist) {
      res.status(404).json({ error: 'Playlist não encontrada' });
      return;
    }

    // Verificar se já existe associação
    db.get('SELECT id FROM localidade_playlists WHERE localidade_id = ? AND playlist_id = ?', [id, playlist_id], (err, existing) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (existing) {
        res.status(400).json({ error: 'Playlist já está associada a esta localidade' });
        return;
      }

      db.run(
        'INSERT INTO localidade_playlists (localidade_id, playlist_id, prioridade) VALUES (?, ?, ?)',
        [id, playlist_id, prioridade || 1],
        function(err) {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json({ message: 'Playlist associada à localidade com sucesso!' });
        }
      );
    });
  });
});

// Remover playlist da localidade (protegido)
app.delete('/api/localidades/:id/playlists/:playlist_id', authenticateToken, (req, res) => {
  const { id, playlist_id } = req.params;

  db.run('DELETE FROM localidade_playlists WHERE localidade_id = ? AND playlist_id = ?', [id, playlist_id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Associação não encontrada' });
      return;
    }
    res.json({ message: 'Playlist removida da localidade com sucesso!' });
  });
});

// Listar playlists de uma localidade (protegido)
app.get('/api/localidades/:id/playlists', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.all(`
    SELECT p.*, lp.prioridade, u.nome as criado_por_nome,
           (SELECT COUNT(*) FROM playlist_videos pv WHERE pv.playlist_id = p.id) as total_videos
    FROM playlists p
    INNER JOIN localidade_playlists lp ON p.id = lp.playlist_id
    LEFT JOIN usuarios u ON p.criado_por = u.id
    WHERE lp.localidade_id = ?
    ORDER BY lp.prioridade ASC, p.nome ASC
  `, [id], (err, playlists) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(playlists);
  });
});

// ===== ROTAS DE VÍDEOS INDIVIDUAIS POR LOCALIDADE =====

// Associar vídeo individual à localidade (protegido)
app.post('/api/localidades/:id/videos', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { video_id, prioridade } = req.body;

  console.log(`📹 Tentando associar vídeo ${video_id} à localidade ${id} com prioridade ${prioridade}`);

  if (!video_id) {
    return res.status(400).json({ error: 'ID do vídeo é obrigatório' });
  }

  // Verificar se o vídeo existe
  db.get('SELECT id, titulo FROM videos WHERE id = ?', [video_id], (err, video) => {
    if (err) {
      console.error('❌ Erro ao buscar vídeo:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    if (!video) {
      console.error(`❌ Vídeo ${video_id} não encontrado`);
      res.status(404).json({ error: 'Vídeo não encontrado' });
      return;
    }

    console.log(`✅ Vídeo encontrado: "${video.titulo}"`);

    // Verificar se já existe associação
    db.get('SELECT id FROM localidade_videos WHERE localidade_id = ? AND video_id = ?', [id, video_id], (err, existing) => {
      if (err) {
        console.error('❌ Erro ao verificar associação existente:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      if (existing) {
        console.log(`⚠️ Vídeo ${video_id} já está associado à localidade ${id}`);
        // Em vez de erro, atualizar a prioridade
        db.run(
          'UPDATE localidade_videos SET prioridade = ? WHERE localidade_id = ? AND video_id = ?',
          [prioridade || 1, id, video_id],
          function(err) {
            if (err) {
              console.error('❌ Erro ao atualizar prioridade:', err);
              res.status(500).json({ error: err.message });
              return;
            }
            console.log(`✅ Prioridade do vídeo ${video_id} atualizada para ${prioridade || 1}`);
            res.json({ message: 'Vídeo já estava associado - prioridade atualizada com sucesso!' });
          }
        );
        return;
      }

      console.log(`🔗 Criando nova associação...`);
      db.run(
        'INSERT INTO localidade_videos (localidade_id, video_id, prioridade) VALUES (?, ?, ?)',
        [id, video_id, prioridade || 1],
        function(err) {
          if (err) {
            console.error('❌ Erro ao criar associação:', err);
            res.status(500).json({ error: err.message });
            return;
          }
          console.log(`✅ Vídeo ${video_id} associado à localidade ${id} com sucesso!`);
          res.json({ message: 'Vídeo associado à localidade com sucesso!' });
        }
      );
    });
  });
});

// Remover vídeo da localidade (protegido)
app.delete('/api/localidades/:id/videos/:video_id', authenticateToken, (req, res) => {
  const { id, video_id } = req.params;

  db.run('DELETE FROM localidade_videos WHERE localidade_id = ? AND video_id = ?', [id, video_id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Associação não encontrada' });
      return;
    }
    res.json({ message: 'Vídeo removido da localidade com sucesso!' });
  });
});

// Listar vídeos de uma localidade (protegido)
app.get('/api/localidades/:id/videos', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.all(`
    SELECT v.*, lv.prioridade, lv.id as associacao_id
    FROM videos v 
    INNER JOIN localidade_videos lv ON v.id = lv.video_id 
    WHERE lv.localidade_id = ? AND lv.ativo = 1
    ORDER BY lv.prioridade DESC, v.ordem ASC
  `, [id], (err, videos) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(videos || []);
  });
});

// ===== ROTAS DE IMAGENS INDIVIDUAIS POR LOCALIDADE =====

// Associar imagem individual à localidade (protegido)
app.post('/api/localidades/:id/imagens', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { imagem_id, prioridade } = req.body;

  console.log(`🖼️ Tentando associar imagem ${imagem_id} à localidade ${id} com prioridade ${prioridade}`);

  if (!imagem_id) {
    return res.status(400).json({ error: 'ID da imagem é obrigatório' });
  }

  // Verificar se a imagem existe
  db.get('SELECT id, titulo FROM imagens_slideshow WHERE id = ?', [imagem_id], (err, imagem) => {
    if (err) {
      console.error('❌ Erro ao buscar imagem:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    if (!imagem) {
      console.error(`❌ Imagem ${imagem_id} não encontrada`);
      res.status(404).json({ error: 'Imagem não encontrada' });
      return;
    }

    console.log(`✅ Imagem encontrada: "${imagem.titulo}"`);

    // Verificar se já existe associação
    db.get('SELECT id FROM localidade_imagens WHERE localidade_id = ? AND imagem_id = ?', [id, imagem_id], (err, existing) => {
      if (err) {
        console.error('❌ Erro ao verificar associação existente:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      if (existing) {
        console.log(`⚠️ Imagem ${imagem_id} já está associada à localidade ${id}`);
        // Em vez de erro, atualizar a prioridade
        db.run(
          'UPDATE localidade_imagens SET prioridade = ? WHERE localidade_id = ? AND imagem_id = ?',
          [prioridade || 1, id, imagem_id],
          function(err) {
            if (err) {
              console.error('❌ Erro ao atualizar prioridade:', err);
              res.status(500).json({ error: err.message });
              return;
            }
            console.log(`✅ Prioridade da imagem ${imagem_id} atualizada para ${prioridade || 1}`);
            res.json({ message: 'Imagem já estava associada - prioridade atualizada com sucesso!' });
          }
        );
        return;
      }

      console.log(`🔗 Criando nova associação...`);
      db.run(
        'INSERT INTO localidade_imagens (localidade_id, imagem_id, prioridade) VALUES (?, ?, ?)',
        [id, imagem_id, prioridade || 1],
        function(err) {
          if (err) {
            console.error('❌ Erro ao criar associação:', err);
            res.status(500).json({ error: err.message });
            return;
          }
          console.log(`✅ Imagem ${imagem_id} associada à localidade ${id} com sucesso!`);
          res.json({ message: 'Imagem associada à localidade com sucesso!' });
        }
      );
    });
  });
});

// Remover imagem da localidade (protegido)
app.delete('/api/localidades/:id/imagens/:imagem_id', authenticateToken, (req, res) => {
  const { id, imagem_id } = req.params;

  db.run('DELETE FROM localidade_imagens WHERE localidade_id = ? AND imagem_id = ?', [id, imagem_id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Associação não encontrada' });
      return;
    }
    res.json({ message: 'Imagem removida da localidade com sucesso!' });
  });
});

// Listar imagens de uma localidade (protegido)
app.get('/api/localidades/:id/imagens', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.all(`
    SELECT i.*, li.prioridade, li.id as associacao_id
    FROM imagens_slideshow i 
    INNER JOIN localidade_imagens li ON i.id = li.imagem_id 
    WHERE li.localidade_id = ? AND li.ativo = 1
    ORDER BY li.prioridade DESC, i.ordem ASC
  `, [id], (err, imagens) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(imagens || []);
  });
});

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'API TV Saúde funcionando!', timestamp: new Date().toISOString() });
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Arquivo muito grande. Máximo 500MB.' });
    }
  }
  res.status(500).json({ error: error.message });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor TV Saúde rodando na porta ${PORT}`);
  console.log(`📺 API disponível em:`);
  console.log(`   - Local: http://localhost:${PORT}/api`);
  console.log(`   - Rede: http://0.0.0.0:${PORT}/api`);
  console.log(`📁 Uploads disponíveis em:`);
  console.log(`   - Local: http://localhost:${PORT}/uploads`);
  console.log(`   - Rede: http://0.0.0.0:${PORT}/uploads`);
  console.log(`🌐 Servidor acessível de qualquer IP da rede local`);
  console.log(`🔐 Sistema de autenticação ativo`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando servidor...');
  db.close((err) => {
    if (err) {
      console.error('Erro ao fechar banco de dados:', err.message);
    } else {
      console.log('✅ Banco de dados fechado.');
    }
    process.exit(0);
  });
});

 
