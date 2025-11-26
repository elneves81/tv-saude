const axios = require('axios');

const API_BASE = 'http://localhost:3002/api';

async function testarLocalidades() {
  try {
    console.log('🧪 Testando API de Localidades...\n');

    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@tvsaude.com',
      senha: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    console.log('🔑 Token obtido:', token.substring(0, 20) + '...');

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Listar localidades existentes
    console.log('\n2️⃣ Listando localidades existentes...');
    try {
      const listResponse = await axios.get(`${API_BASE}/localidades`, { headers });
      console.log('✅ Localidades encontradas:', listResponse.data.length);
      listResponse.data.forEach(loc => {
        console.log(`   📍 ID: ${loc.id} - Nome: ${loc.nome}`);
      });
    } catch (err) {
      console.log('❌ Erro ao listar localidades:', err.response?.data || err.message);
    }

    // 3. Criar nova localidade
    console.log('\n3️⃣ Criando nova localidade...');
    try {
      const novaLocalidade = {
        nome: 'Teste Localidade ' + Date.now(),
        descricao: 'Localidade de teste criada via API'
      };

      const createResponse = await axios.post(`${API_BASE}/localidades`, novaLocalidade, { headers });
      console.log('✅ Localidade criada com sucesso!');
      console.log('📋 Dados:', createResponse.data);

      // 4. Verificar se foi criada (listar novamente)
      console.log('\n4️⃣ Verificando localidades após criação...');
      const listResponse2 = await axios.get(`${API_BASE}/localidades`, { headers });
      console.log('✅ Total de localidades agora:', listResponse2.data.length);
      
      const novaLoc = listResponse2.data.find(loc => loc.id === createResponse.data.id);
      if (novaLoc) {
        console.log('✅ Nova localidade confirmada no banco:');
        console.log(`   📍 ID: ${novaLoc.id}`);
        console.log(`   📝 Nome: ${novaLoc.nome}`);
        console.log(`   📄 Descrição: ${novaLoc.descricao}`);
      }

    } catch (err) {
      console.log('❌ Erro ao criar localidade:', err.response?.data || err.message);
      if (err.response?.status === 400) {
        console.log('💡 Dica: Verifique se todos os campos obrigatórios foram enviados');
      }
    }

  } catch (err) {
    console.error('❌ Erro geral:', err.response?.data || err.message);
  }
}

// Executar teste
testarLocalidades().then(() => {
  console.log('\n🏁 Teste concluído!');
  process.exit(0);
}).catch(err => {
  console.error('💥 Erro fatal:', err);
  process.exit(1);
});
