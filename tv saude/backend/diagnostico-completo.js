const axios = require('axios');

async function testarRota404() {
    console.log('🧪 Diagnóstico completo da API...\n');

    const baseUrl = 'http://127.0.0.1:3001';
    
    // Testar rotas existentes
    const rotas = [
        '/api/test',
        '/api/localidades/conteudo',
        '/',
        '/api',
        '/api/localidades'
    ];

    for (const rota of rotas) {
        console.log(`🔍 Testando rota: ${rota}`);
        try {
            const response = await axios.get(`${baseUrl}${rota}`, {
                timeout: 3000,
                proxy: false
            });
            
            console.log(`✅ ${rota}: Status ${response.status}`);
            console.log(`   Dados: ${JSON.stringify(response.data).substring(0, 100)}...`);
            
        } catch (error) {
            console.log(`❌ ${rota}: ${error.message}`);
            if (error.response) {
                console.log(`   Status: ${error.response.status}`);
                console.log(`   Erro: ${JSON.stringify(error.response.data)}`);
            }
        }
        console.log('---');
    }

    // Testar com token
    console.log('\n🔑 Testando com autenticação...');
    try {
        // Fazer login
        const loginResponse = await axios.post(`${baseUrl}/api/auth/login`, {
            email: 'admin@tvsaude.com',
            senha: 'admin123'
        }, { proxy: false });

        const token = loginResponse.data.token;
        console.log('✅ Login realizado com sucesso');

        // Testar endpoint com token
        const response = await axios.get(`${baseUrl}/api/localidades/conteudo`, {
            headers: { Authorization: `Bearer ${token}` },
            proxy: false
        });

        console.log(`✅ Com token: Status ${response.status}`);
        console.log(`   Localidade: ${response.data.localidade?.nome || 'Nenhuma'}`);
        console.log(`   Vídeos: ${response.data.videos?.length || 0}`);

    } catch (error) {
        console.log(`❌ Com token: ${error.message}`);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Erro: ${JSON.stringify(error.response.data)}`);
        }
    }
}

testarRota404();
