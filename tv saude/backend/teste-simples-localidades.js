const axios = require('axios');

async function testeSimples() {
  console.log('🧪 Teste simples da API de Localidades\n');
  
  try {
    // Testar se servidor está respondendo
    console.log('1️⃣ Testando se servidor está ativo...');
    const healthResponse = await axios.get('http://localhost:3001/api/playlists');
    console.log('✅ Servidor está respondendo!');
    
    // Fazer login
    console.log('\n2️⃣ Fazendo login...');
    const loginData = {
      email: 'admin@tvsaude.com',
      senha: 'admin123'
    };
    
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', loginData);
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso!');
    
    // Testar listar localidades
    console.log('\n3️⃣ Listando localidades...');
    const headers = { Authorization: `Bearer ${token}` };
    const localidadesResponse = await axios.get('http://localhost:3001/api/localidades', { headers });
    
    console.log(`✅ Encontradas ${localidadesResponse.data.length} localidades:`);
    localidadesResponse.data.forEach(loc => {
      console.log(`   📍 ${loc.nome} (ID: ${loc.id})`);
    });
    
    // Testar criar nova localidade
    console.log('\n4️⃣ Criando nova localidade...');
    const novaLocalidade = {
      nome: `Teste API ${new Date().getTime()}`,
      descricao: 'Localidade criada via teste de API'
    };
    
    const createResponse = await axios.post('http://localhost:3001/api/localidades', novaLocalidade, { headers });
    console.log('✅ Nova localidade criada!');
    console.log(`   📍 Nome: ${createResponse.data.nome}`);
    console.log(`   🆔 ID: ${createResponse.data.id}`);
    
    console.log('\n🎉 Teste concluído com sucesso! A API de localidades está funcionando perfeitamente.');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('💡 Problema de autenticação - verifique as credenciais');
    }
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Servidor não está rodando - inicie o backend primeiro');
    }
  }
}

testeSimples();
