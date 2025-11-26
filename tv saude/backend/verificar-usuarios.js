const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../database/tv_saude.db');

console.log('👥 Verificando usuários ativos...\n');

db.all('SELECT email, nome, tipo FROM usuarios WHERE ativo = 1', [], (err, rows) => {
  if (err) {
    console.error('❌ Erro:', err);
    return;
  }
  
  console.log('📋 Usuários ativos:');
  rows.forEach(row => {
    console.log(`   📧 ${row.email} - ${row.nome} (${row.tipo})`);
  });
  
  console.log(`\n✅ Total: ${rows.length} usuários`);
  db.close();
});
