const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('../database/tv_saude.db');

console.log('🔍 Verificando estado do banco de dados...\n');

// Listar tabelas
db.all('SELECT name FROM sqlite_master WHERE type="table"', (err, tables) => {
  if (err) {
    console.error('❌ Erro ao listar tabelas:', err);
    return;
  }
  
  console.log('📊 Tabelas encontradas:');
  tables.forEach(table => {
    console.log(`  - ${table.name}`);
  });
  
  // Verificar comandos na tabela de controle
  const controleTable = tables.find(t => t.name.includes('controle'));
  if (controleTable) {
    console.log(`\n🎮 Comandos na tabela "${controleTable.name}":`);
    
    db.all(`SELECT comando, parametros, COUNT(*) as count FROM ${controleTable.name} GROUP BY comando, parametros ORDER BY count DESC`, (err, commands) => {
      if (err) {
        console.error('❌ Erro ao listar comandos:', err);
      } else {
        commands.forEach(cmd => {
          const params = cmd.parametros || 'null';
          console.log(`  - ${cmd.comando} (${params}) - ${cmd.count}x`);
        });
        
        // Verificar se ainda há comandos problemáticos
        const problematicos = commands.filter(cmd => cmd.comando === 'play' && (cmd.parametros === null || cmd.parametros === 'null'));
        if (problematicos.length > 0) {
          console.log('\n⚠️ AINDA HÁ COMANDOS PROBLEMÁTICOS!');
        } else {
          console.log('\n✅ Banco limpo - sem comandos problemáticos!');
        }
      }
      
      db.close();
    });
  } else {
    console.log('\n❌ Tabela de controle não encontrada!');
    db.close();
  }
});
