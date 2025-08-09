const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho para o banco de dados
const dbPath = path.join(__dirname, '../database/tv_saude.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Corrigindo estrutura da tabela mensagens_tempo_real...');

db.serialize(() => {
  // Verificar se a tabela existe
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='mensagens_tempo_real'", (err, row) => {
    if (err) {
      console.error('❌ Erro ao verificar tabela:', err.message);
      return;
    }

    if (!row) {
      console.log('📋 Criando tabela mensagens_tempo_real...');
      // Criar tabela completa se não existir
      db.run(`
        CREATE TABLE mensagens_tempo_real (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          titulo TEXT NOT NULL,
          conteudo TEXT NOT NULL,
          tipo TEXT DEFAULT 'info',
          prioridade INTEGER DEFAULT 1,
          ativo BOOLEAN DEFAULT 1,
          data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
          data_expiracao DATETIME,
          data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('❌ Erro ao criar tabela:', err.message);
        } else {
          console.log('✅ Tabela mensagens_tempo_real criada com sucesso!');
        }
        db.close();
      });
    } else {
      console.log('📋 Tabela existe. Verificando colunas...');
      
      // Verificar estrutura atual
      db.all("PRAGMA table_info(mensagens_tempo_real)", (err, columns) => {
        if (err) {
          console.error('❌ Erro ao verificar colunas:', err.message);
          db.close();
          return;
        }

        console.log('📊 Colunas atuais:', columns.map(col => col.name).join(', '));

        const hasAtivo = columns.some(col => col.name === 'ativo');
        const hasDataExpiracao = columns.some(col => col.name === 'data_expiracao');
        const hasDataAtualizacao = columns.some(col => col.name === 'data_atualizacao');

        let alterations = [];

        if (!hasAtivo) {
          alterations.push("ALTER TABLE mensagens_tempo_real ADD COLUMN ativo BOOLEAN DEFAULT 1");
        }
        if (!hasDataExpiracao) {
          alterations.push("ALTER TABLE mensagens_tempo_real ADD COLUMN data_expiracao DATETIME");
        }
        if (!hasDataAtualizacao) {
          alterations.push("ALTER TABLE mensagens_tempo_real ADD COLUMN data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP");
        }

        if (alterations.length === 0) {
          console.log('✅ Tabela já está com a estrutura correta!');
          db.close();
          return;
        }

        console.log(`🔧 Adicionando ${alterations.length} colunas...`);

        // Executar alterações sequencialmente
        let completed = 0;
        alterations.forEach((sql, index) => {
          db.run(sql, (err) => {
            if (err) {
              console.error(`❌ Erro na alteração ${index + 1}:`, err.message);
            } else {
              console.log(`✅ Alteração ${index + 1} concluída`);
            }
            
            completed++;
            if (completed === alterations.length) {
              console.log('🎉 Todas as alterações concluídas!');
              
              // Verificar estrutura final
              db.all("PRAGMA table_info(mensagens_tempo_real)", (err, finalColumns) => {
                if (!err) {
                  console.log('📊 Estrutura final:', finalColumns.map(col => `${col.name} (${col.type})`).join(', '));
                }
                db.close();
              });
            }
          });
        });
      });
    }
  });
});

// Tratamento de erros
db.on('error', (err) => {
  console.error('❌ Erro no banco de dados:', err.message);
});
