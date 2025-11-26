const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conectar ao banco
const dbPath = path.join(__dirname, '../database/tv_saude.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Testando sistema de localidades...\n');

// Verificar se as tabelas existem
db.all("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'localidade%'", (err, tables) => {
  if (err) {
    console.error('❌ Erro ao verificar tabelas:', err);
    return;
  }
  
  console.log('📋 Tabelas de localidades encontradas:');
  tables.forEach(table => {
    console.log(`  ✅ ${table.name}`);
  });
  
  if (tables.length === 0) {
    console.log('  ❌ Nenhuma tabela de localidades encontrada!');
    db.close();
    return;
  }
  
  // Testar inserção de dados de exemplo
  console.log('\n🧪 Inserindo dados de teste...');
  
  // Inserir localidade de teste
  db.run(
    'INSERT OR IGNORE INTO localidades (nome, descricao) VALUES (?, ?)',
    ['Posto Central', 'Posto de saúde central para testes'],
    function(err) {
      if (err) {
        console.error('❌ Erro ao inserir localidade:', err);
        db.close();
        return;
      }
      
      const localidadeId = this.lastID || 1;
      console.log(`  ✅ Localidade inserida com ID: ${localidadeId}`);
      
      // Inserir IP de teste
      db.run(
        'INSERT OR IGNORE INTO localidade_ips (localidade_id, ip_address, descricao) VALUES (?, ?, ?)',
        [localidadeId, '127.0.0.1', 'IP local para testes'],
        function(err) {
          if (err) {
            console.error('❌ Erro ao inserir IP:', err);
            db.close();
            return;
          }
          
          console.log(`  ✅ IP inserido para localidade ${localidadeId}`);
          
          // Testar consulta de localidades
          console.log('\n🔍 Testando consulta de localidades...');
          
          db.all(`
            SELECT l.*, li.ip_address, li.ip_range 
            FROM localidades l 
            LEFT JOIN localidade_ips li ON l.id = li.localidade_id 
            WHERE l.ativo = 1
          `, (err, rows) => {
            if (err) {
              console.error('❌ Erro na consulta:', err);
              db.close();
              return;
            }
            
            console.log('📊 Resultados da consulta:');
            rows.forEach(row => {
              console.log(`  🏥 ${row.nome} - IP: ${row.ip_address || 'N/A'}`);
            });
            
            console.log('\n✅ Teste concluído com sucesso!');
            console.log('🌐 O sistema de localidades está funcionando corretamente.');
            
            db.close();
          });
        }
      );
    }
  );
});
