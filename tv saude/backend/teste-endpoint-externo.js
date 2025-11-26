const axios = require('axios');

async function testarEndpointExterno() {
    console.log('🧪 Testando endpoint externo para LocalidadeManager...\n');

    const configs = [
        {
            name: 'IP Local (10.0.50.79)',
            url: 'http://10.0.50.79:3001/api/localidades/conteudo'
        },
        {
            name: 'Localhost',
            url: 'http://localhost:3001/api/localidades/conteudo'
        },
        {
            name: '127.0.0.1',
            url: 'http://127.0.0.1:3001/api/localidades/conteudo'
        }
    ];

    for (const config of configs) {
        console.log(`🔍 Testando: ${config.name}`);
        try {
            const response = await axios.get(config.url, {
                timeout: 5000,
                proxy: false
            });
            
            console.log(`✅ ${config.name}: SUCESSO!`);
            console.log(`   Status: ${response.status}`);
            console.log(`   Localidade: ${response.data.localidade?.nome || 'Nenhuma'}`);
            console.log(`   Vídeos: ${response.data.videos?.length || 0}`);
            
        } catch (error) {
            console.log(`❌ ${config.name}: ERRO`);
            console.log(`   Erro: ${error.message}`);
            if (error.response) {
                console.log(`   Status: ${error.response.status}`);
                console.log(`   Dados: ${JSON.stringify(error.response.data)}`);
            }
        }
        console.log('---');
    }

    // Verificar se o servidor está respondendo na porta 3001
    console.log('\n🔍 Verificando servidor...');
    try {
        const response = await axios.get('http://127.0.0.1:3001/', {
            timeout: 3000,
            proxy: false
        });
        console.log('✅ Servidor está respondendo');
    } catch (error) {
        console.log('❌ Servidor não está respondendo');
        console.log('   Erro:', error.message);
    }
}

testarEndpointExterno();
