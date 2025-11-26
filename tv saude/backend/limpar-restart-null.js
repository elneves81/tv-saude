const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'tv_saude.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Limpando comandos "restart" com parâmetros null...');

// Remover comandos restart com parâmetros null
db.run(`DELETE FROM controle_tv WHERE comando = 'restart' AND parametros IS NULL`, function(err) {
  if (err) {
    console.error('❌ Erro ao limpar comandos:', err);
    return;
  }
  
  console.log(`✅ Comandos "restart null" removidos: ${this.changes}`);
  
  // Mostrar comandos restantes
  db.all(`SELECT * FROM controle_tv ORDER BY timestamp DESC LIMIT 5`, (err, rows) => {
    if (err) {
      console.error('❌ Erro ao consultar comandos:', err);
      return;
    }
    
    console.log('📋 Últimos comandos restantes:');
    console.table(rows);
    
    db.close();
    console.log('✅ Limpeza concluída!');
  });
});
