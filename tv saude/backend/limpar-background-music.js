const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('../database/tv_saude.db');

console.log('🧹 Limpando comandos de áudio problemáticos...\n');

// Lista de comandos problemáticos relacionados ao áudio
const comandosProblematicos = [
  'background_music_off',
  'background_music_on',
  'play',
  'refresh'
];

// Função para processar cada comando
function processarComando(comando) {
  return new Promise((resolve) => {
    // Primeiro, contar quantos comandos problemáticos existem
    db.all('SELECT COUNT(*) as count FROM controle_tv WHERE comando = ? AND (parametros IS NULL OR parametros = "null")', [comando], (err, rows) => {
      if (err) {
        console.error(`❌ Erro ao contar comandos ${comando}:`, err);
        resolve();
        return;
      }
      
      const count = rows[0].count;
      if (count > 0) {
        console.log(`📊 Encontrados ${count} comandos ${comando} problemáticos`);
        
        // Remover os comandos problemáticos
        db.run('DELETE FROM controle_tv WHERE comando = ? AND (parametros IS NULL OR parametros = "null")', [comando], function(err) {
          if (err) {
            console.error(`❌ Erro ao remover comandos ${comando}:`, err);
          } else {
            console.log(`✅ Removidos ${this.changes} comandos ${comando} problemáticos`);
          }
          resolve();
        });
      } else {
        console.log(`✅ Nenhum comando ${comando} problemático encontrado`);
        resolve();
      }
    });
  });
}

// Processar todos os comandos sequencialmente
async function limparTodos() {
  for (const comando of comandosProblematicos) {
    await processarComando(comando);
  }
  
  console.log('\n🎉 Limpeza de comandos de áudio concluída!');
  console.log('🔄 Agora teste o sistema de áudio no painel da TV');
  
  db.close();
}

// Executar limpeza
limparTodos().catch(err => {
  console.error('❌ Erro durante a limpeza:', err);
  db.close();
});
