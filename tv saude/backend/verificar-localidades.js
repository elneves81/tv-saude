const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../database/tv_saude.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Verificando localidades no banco...\n');

// Verificar localidades
db.all('SELECT * FROM localidades', [], (err, localidades) => {
  if (err) {
    console.error('❌ Erro ao buscar localidades:', err);
  } else {
    console.log(`📍 Total de localidades: ${localidades.length}`);
    
    if (localidades.length > 0) {
      console.log('\n📋 Localidades encontradas:');
      localidades.forEach(loc => {
        console.log(`   ID: ${loc.id} | Nome: ${loc.nome} | Ativo: ${loc.ativo ? 'Sim' : 'Não'}`);
        console.log(`   Descrição: ${loc.descricao || 'Sem descrição'}`);
        console.log(`   Criado em: ${loc.data_criacao}`);
        console.log(`   ---`);
      });
    } else {
      console.log('📭 Nenhuma localidade encontrada');
    }
  }
  
  // Verificar usuários
  db.all('SELECT email, nome, tipo FROM usuarios WHERE ativo = 1', [], (err, usuarios) => {
    if (err) {
      console.error('❌ Erro ao buscar usuários:', err);
    } else {
      console.log(`\n👥 Total de usuários ativos: ${usuarios.length}`);
      usuarios.forEach(user => {
        console.log(`   📧 ${user.email} | ${user.nome} | Tipo: ${user.tipo}`);
      });
    }
    
    db.close(() => {
      console.log('\n✅ Verificação concluída!');
    });
  });
});
