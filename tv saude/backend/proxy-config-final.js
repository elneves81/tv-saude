const axios = require('axios');

// Configuração do proxy
const axiosConfig = {
    // Para localhost - SEM proxy
    local: axios.create({
        proxy: false,
        timeout: 5000
    }),
    
    // Para externo - COM proxy
    external: axios.create({
        proxy: {
            host: '10.0.2.1',
            port: 3128,
            protocol: 'http'
        },
        timeout: 10000
    })
};

async function testeSimples() {
    console.log('🧪 Teste Simples de Proxy\n');

    // Teste 1: Verificar se servidor responde
    try {
        console.log('1️⃣ Testando conexão básica...');
        const response = await axiosConfig.local.get('http://127.0.0.1:3001/api/localidades/conteudo');
        console.log('✅ Conexão funcionando!');
        console.log('Status:', response.status);
        console.log('Dados:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log('❌ Erro:', error.message);
        console.log('Código:', error.code);
        if (error.response) {
            console.log('Status HTTP:', error.response.status);
            console.log('Dados da resposta:', error.response.data);
        }
    }
    
    console.log('\n📋 CONFIGURAÇÃO RECOMENDADA PARA SEU SISTEMA:');
    console.log('');
    console.log('// Em qualquer arquivo que use axios:');
    console.log('const axios = require("axios");');
    console.log('');
    console.log('// Para APIs locais (seu sistema)');
    console.log('const apiLocal = axios.create({');
    console.log('    baseURL: "http://127.0.0.1:3001",');
    console.log('    proxy: false, // Sem proxy para localhost');
    console.log('    timeout: 5000');
    console.log('});');
    console.log('');
    console.log('// Para APIs externas (internet)');
    console.log('const apiExterna = axios.create({');
    console.log('    proxy: {');
    console.log('        host: "10.0.2.1",');
    console.log('        port: 3128');
    console.log('    },');
    console.log('    timeout: 10000');
    console.log('});');
    console.log('');
    console.log('// Uso:');
    console.log('// apiLocal.get("/api/localidades")');
    console.log('// apiExterna.get("https://api.externa.com/dados")');
}

testeSimples();
