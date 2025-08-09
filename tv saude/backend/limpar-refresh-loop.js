const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conectar ao banco de dados
const dbPath = path.join(__dirname, '../database/tv_saude.db');
const db = new sqlite3.Database(dbPath);

console.log('🚨 EMERGÊNCIA: Removendo TODOS os comandos "refresh" que causam loop infinito...');

// Remover TODOS os comandos refresh
db.run('DELETE FROM controle_tv WHERE comando = ?', ['refresh'], function(err) {
  if (err) {
    console.error('❌ Erro ao remover comandos refresh:', err);
  } else {
    console.log(`✅ Removidos ${this.changes} comandos "refresh"`);
  }
  
  // Verificar se ainda há comandos refresh
  db.all('SELECT * FROM controle_tv WHERE comando = ?', ['refresh'], (err, rows) => {
    if (err) {
      console.error('❌ Erro ao verificar:', err);
    } else {
      console.log(`📊 Comandos "refresh" restantes: ${rows.length}`);
      if (rows.length === 0) {
        console.log('🎉 SUCESSO: Todos os comandos "refresh" foram removidos!');
      }
    }
    
    // Mostrar últimos comandos
    db.all('SELECT * FROM controle_tv ORDER BY timestamp DESC LIMIT 5', (err, rows) => {
      if (err) {
        console.error('❌ Erro ao listar comandos:', err);
      } else {
        console.log('\n📋 Últimos comandos restantes:');
        console.table(rows);
      }
      
      db.close();
      console.log('\n✅ Limpeza de emergência concluída!');
      console.log('🔄 Agora teste o site novamente: http://10.0.50.79:3003/');
    });
  });
});
