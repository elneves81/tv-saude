const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('../database/tv_saude.db');

console.log('🧹 Limpando comandos background_music_off problemáticos...\n');

// Primeiro, vamos ver quantos comandos problemáticos existem
db.all('SELECT COUNT(*) as count FROM controle_tv WHERE comando = ? AND (parametros IS NULL OR parametros = "null")', ['background_music_off'], (err, rows) => {
  if (err) {
    console.error('❌ Erro ao contar comandos:', err);
    return;
  }
  
  const count = rows[0].count;
  console.log(`📊 Encontrados ${count} comandos background_music_off problemáticos`);
  
  if (count > 0) {
    // Remover os comandos problemáticos
    db.run('DELETE FROM controle_tv WHERE comando = ? AND (parametros IS NULL OR parametros = "null")', ['background_music_off'], function(err) {
      if (err) {
        console.error('❌ Erro ao remover comandos:', err);
      } else {
        console.log(`✅ Removidos ${this.changes} comandos background_music_off problemáticos`);
        
        // Verificar se ainda há outros comandos problemáticos
        db.all('SELECT comando, parametros, COUNT(*) as count FROM controle_tv WHERE (parametros IS NULL OR parametros = "null") GROUP BY comando', (err, problematicos) => {
          if (err) {
            console.error('❌ Erro ao verificar outros comandos:', err);
          } else if (problematicos.length > 0) {
            console.log('\n⚠️ Outros comandos problemáticos encontrados:');
            problematicos.forEach(cmd => {
              console.log(`  - ${cmd.comando} (null) - ${cmd.count}x`);
            });
          } else {
            console.log('\n✅ Banco limpo - sem comandos problemáticos!');
          }
          
          db.close();
        });
      }
    });
  } else {
    console.log('✅ Nenhum comando problemático encontrado!');
    db.close();
  }
});
