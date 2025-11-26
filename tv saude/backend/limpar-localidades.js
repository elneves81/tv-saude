const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conectar ao banco
const dbPath = path.join(__dirname, '../database/tv_saude.db');
const db = new sqlite3.Database(dbPath);

console.log('🧹 Limpando dados de localidades duplicados...\n');

db.serialize(() => {
  // 1. Remover todas as associações de playlists
  db.run('DELETE FROM localidade_playlists', function(err) {
    if (err) {
      console.error('❌ Erro ao limpar associações de playlists:', err);
    } else {
      console.log(`✅ ${this.changes} associações de playlists removidas`);
    }
  });

  // 2. Remover todas as associações de vídeos
  db.run('DELETE FROM localidade_videos', function(err) {
    if (err) {
      console.error('❌ Erro ao limpar associações de vídeos:', err);
    } else {
      console.log(`✅ ${this.changes} associações de vídeos removidas`);
    }
  });

  // 3. Remover todos os IPs
  db.run('DELETE FROM localidade_ips', function(err) {
    if (err) {
      console.error('❌ Erro ao limpar IPs:', err);
    } else {
      console.log(`✅ ${this.changes} IPs removidos`);
    }
  });

  // 4. Remover todas as localidades
  db.run('DELETE FROM localidades', function(err) {
    if (err) {
      console.error('❌ Erro ao limpar localidades:', err);
    } else {
      console.log(`✅ ${this.changes} localidades removidas`);
    }
  });

  // 5. Resetar os contadores de ID
  db.run('DELETE FROM sqlite_sequence WHERE name IN ("localidades", "localidade_ips", "localidade_playlists", "localidade_videos")', function(err) {
    if (err) {
      console.error('❌ Erro ao resetar contadores:', err);
    } else {
      console.log('✅ Contadores de ID resetados');
    }
  });

  // 6. Criar uma localidade de exemplo limpa
  db.run(
    'INSERT INTO localidades (nome, descricao, ativo) VALUES (?, ?, ?)',
    ['Posto Central', 'Localidade de exemplo para testes', 1],
    function(err) {
      if (err) {
        console.error('❌ Erro ao criar localidade de exemplo:', err);
      } else {
        console.log(`✅ Localidade de exemplo criada com ID: ${this.lastID}`);
        
        // Adicionar IP de exemplo
        db.run(
          'INSERT INTO localidade_ips (localidade_id, ip_address, descricao, ativo) VALUES (?, ?, ?, ?)',
          [this.lastID, '127.0.0.1', 'IP local para testes', 1],
          function(err) {
            if (err) {
              console.error('❌ Erro ao criar IP de exemplo:', err);
            } else {
              console.log('✅ IP de exemplo adicionado');
            }
            
            // Verificar resultado final
            db.all('SELECT COUNT(*) as total FROM localidades', (err, result) => {
              if (err) {
                console.error('❌ Erro ao verificar resultado:', err);
              } else {
                console.log(`\n📊 Total de localidades após limpeza: ${result[0].total}`);
              }
              
              console.log('\n✅ Limpeza concluída com sucesso!');
              console.log('🔄 Reinicie o servidor para aplicar as mudanças.');
              
              db.close();
            });
          }
        );
      }
    }
  );
});
