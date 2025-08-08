const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (vídeos)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Configuração do banco de dados SQLite
const dbPath = path.join(__dirname, '../database/tv_saude.db');
const db = new sqlite3.Database(dbPath);

// Criar tabela de vídeos se não existir
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descricao TEXT,
      categoria TEXT,
      arquivo TEXT NOT NULL,
      duracao INTEGER,
      ativo BOOLEAN DEFAULT 1,
      ordem INTEGER DEFAULT 0,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
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

// ROTAS DA API

// Listar todos os vídeos ativos
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

// Upload de novo vídeo
app.post('/api/videos', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo de vídeo enviado' });
  }

  const { titulo, descricao, categoria, ordem } = req.body;
  const arquivo = req.file.filename;

  db.run(
    'INSERT INTO videos (titulo, descricao, categoria, arquivo, ordem) VALUES (?, ?, ?, ?, ?)',
    [titulo, descricao || '', categoria || 'Geral', arquivo, ordem || 0],
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
        ordem: ordem || 0,
        message: 'Vídeo enviado com sucesso!'
      });
    }
  );
});

// Atualizar vídeo
app.put('/api/videos/:id', (req, res) => {
  const { id } = req.params;
  const { titulo, descricao, categoria, ativo, ordem } = req.body;

  db.run(
    'UPDATE videos SET titulo = ?, descricao = ?, categoria = ?, ativo = ?, ordem = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?',
    [titulo, descricao, categoria, ativo, ordem, id],
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
});

// Deletar vídeo
app.delete('/api/videos/:id', (req, res) => {
  const { id } = req.params;

  // Primeiro, obter o nome do arquivo para deletar
  db.get('SELECT arquivo FROM videos WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Vídeo não encontrado' });
      return;
    }

    // Deletar arquivo físico
    const filePath = path.join(__dirname, '../uploads', row.arquivo);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
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
app.listen(PORT, () => {
  console.log(`🚀 Servidor TV Saúde rodando na porta ${PORT}`);
  console.log(`📺 API disponível em: http://localhost:${PORT}/api`);
  console.log(`📁 Uploads em: http://localhost:${PORT}/uploads`);
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
