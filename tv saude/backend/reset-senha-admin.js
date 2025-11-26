const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const db = new sqlite3.Database('../database/tv_saude.db');

console.log('🔐 Resetando senha do usuário admin...\n');

const email = 'admin@tvsaude.com';
const novaSenha = 'admin123';

// Gerar hash da nova senha
bcrypt.hash(novaSenha, 10, (err, hash) => {
  if (err) {
    console.error('❌ Erro ao gerar hash:', err);
    db.close();
    return;
  }
  
  console.log(`🔑 Nova senha: "${novaSenha}"`);
  console.log(`🔒 Hash gerado: ${hash.substring(0, 20)}...`);
  
  // Atualizar senha no banco
  db.run('UPDATE usuarios SET senha = ? WHERE email = ?', [hash, email], function(err) {
    if (err) {
      console.error('❌ Erro ao atualizar senha:', err);
      db.close();
      return;
    }
    
    if (this.changes === 0) {
      console.log('⚠️ Nenhum usuário foi atualizado - verifique se o email existe');
    } else {
      console.log(`✅ Senha atualizada com sucesso para ${email}`);
      console.log(`📝 Linhas afetadas: ${this.changes}`);
    }
    
    console.log('\n🧪 Testando nova senha...');
    
    // Verificar se a senha foi salva corretamente
    db.get('SELECT senha FROM usuarios WHERE email = ?', [email], (err, user) => {
      if (err) {
        console.error('❌ Erro ao verificar senha:', err);
        db.close();
        return;
      }
      
      if (!user) {
        console.log('❌ Usuário não encontrado após atualização');
        db.close();
        return;
      }
      
      // Testar a nova senha
      bcrypt.compare(novaSenha, user.senha, (err, result) => {
        if (err) {
          console.error('❌ Erro ao testar senha:', err);
        } else if (result) {
          console.log(`✅ TESTE PASSOU: Senha "${novaSenha}" funciona corretamente!`);
          console.log('\n🚀 Agora você pode fazer login com:');
          console.log(`   📧 Email: ${email}`);
          console.log(`   🔐 Senha: ${novaSenha}`);
        } else {
          console.log('❌ TESTE FALHOU: Senha não confere');
        }
        
        db.close();
      });
    });
  });
});
