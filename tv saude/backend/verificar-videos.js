const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/tv_saude.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Verificando vídeos no banco de dados...\n');

// Verificar total de vídeos
db.get('SELECT COUNT(*) as total FROM videos', (err, row) => {
  if (err) {
    console.error('❌ Erro ao contar vídeos:', err);
    return;
  }
  console.log(`📊 Total de vídeos no banco: ${row.total}`);
});

// Verificar vídeos ativos
db.get('SELECT COUNT(*) as ativos FROM videos WHERE ativo = 1', (err, row) => {
  if (err) {
    console.error('❌ Erro ao contar vídeos ativos:', err);
    return;
  }
  console.log(`✅ Vídeos ativos: ${row.ativos}`);
});

// Listar todos os vídeos
db.all('SELECT id, titulo, arquivo, ativo, tipo FROM videos ORDER BY id DESC', (err, rows) => {
  if (err) {
    console.error('❌ Erro ao listar vídeos:', err);
    return;
  }
  
  console.log('\n📋 Lista de vídeos:');
  if (rows.length === 0) {
    console.log('⚠️ Nenhum vídeo encontrado no banco!');
  } else {
    rows.forEach(video => {
      const status = video.ativo ? '✅' : '❌';
      const tipo = video.tipo || 'local';
      console.log(`${status} ID: ${video.id} | ${video.titulo} | ${tipo} | ${video.arquivo || 'N/A'}`);
    });
  }
  
  db.close();
});
