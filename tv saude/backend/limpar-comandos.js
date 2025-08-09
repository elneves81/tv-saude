const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/tv_saude.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Limpando comandos problemáticos...');

// Remover comandos "play" com parametros null
db.run('DELETE FROM controle_tv WHERE comando = ? AND (parametros IS NULL OR parametros = "null")', ['play'], function(err) {
  if (err) {
    console.error('❌ Erro ao limpar comandos:', err);
  } else {
    console.log('✅ Comandos removidos:', this.changes);
  }
  
  // Verificar comandos restantes
  db.all('SELECT * FROM controle_tv ORDER BY timestamp DESC LIMIT 5', (err, rows) => {
    if (err) {
      console.error('❌ Erro ao consultar:', err);
    } else {
      console.log('📋 Últimos comandos restantes:');
      console.table(rows);
    }
    
    db.close();
    console.log('✅ Limpeza concluída!');
  });
});
