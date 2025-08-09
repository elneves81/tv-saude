const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('../database/tv_saude.db');

console.log('🧹 Limpeza COMPLETA de comandos problemáticos...\n');

// Lista de comandos que podem ter problemas com parametros null
const comandosProblematicos = [
  'play',
  'background_music_off', 
  'background_music_on',
  'volume_set'  // outros comandos que requerem parâmetros
];

// Primeiro, ver todos os comandos problemáticos
db.all('SELECT comando, COUNT(*) as count FROM controle_tv WHERE (parametros IS NULL OR parametros = "null") GROUP BY comando ORDER BY count DESC', (err, problematicos) => {
  if (err) {
    console.error('❌ Erro ao listar comandos problemáticos:', err);
    return;
  }
  
  if (problematicos.length > 0) {
    console.log('📊 Comandos com parâmetros null encontrados:');
    problematicos.forEach(cmd => {
      console.log(`  - ${cmd.comando}: ${cmd.count}x`);
    });
    console.log('');
    
    // Remover apenas comandos específicos que realmente precisam de parâmetros
    let removidosTotal = 0;
    let comandosProcessados = 0;
    
    comandosProblematicos.forEach(comando => {
      db.run('DELETE FROM controle_tv WHERE comando = ? AND (parametros IS NULL OR parametros = "null")', [comando], function(err) {
        if (err) {
          console.error(`❌ Erro ao remover ${comando}:`, err);
        } else if (this.changes > 0) {
          console.log(`✅ Removidos ${this.changes} comandos "${comando}" problemáticos`);
          removidosTotal += this.changes;
        }
        
        comandosProcessados++;
        
        // Quando terminar de processar todos os comandos
        if (comandosProcessados === comandosProblematicos.length) {
          console.log(`\n🎯 Total removido: ${removidosTotal} comandos problemáticos`);
          
          // Verificar estado final
          db.all('SELECT comando, COUNT(*) as count FROM controle_tv WHERE (parametros IS NULL OR parametros = "null") GROUP BY comando', (err, restantes) => {
            if (err) {
              console.error('❌ Erro ao verificar comandos restantes:', err);
            } else if (restantes.length > 0) {
              console.log('\n📋 Comandos com null restantes (podem ser normais):');
              restantes.forEach(cmd => {
                console.log(`  - ${cmd.comando}: ${cmd.count}x`);
              });
            } else {
              console.log('\n✅ Todos os comandos problemáticos foram removidos!');
            }
            
            db.close();
          });
        }
      });
    });
  } else {
    console.log('✅ Nenhum comando com parâmetros null encontrado!');
    db.close();
  }
});
