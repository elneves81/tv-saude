const axios = require('axios');

// Configuração REMOVIDA - SEM PROXY
// O proxy foi removido para resolver problemas de conectividade local
console.log('📡 Axios configurado SEM PROXY - Conexões diretas apenas');

// Criar instância do axios SEM proxy (padrão)
const axiosDefault = axios.create({
    proxy: false, // DESABILITADO - sem proxy
    timeout: 10000,
    headers: {
        'User-Agent': 'TV-Saude-System/1.0'
    }
});

// Instância para localhost (mesma configuração)
const axiosLocal = axios.create({
    proxy: false, // DESABILITADO - sem proxy
    timeout: 5000,
    headers: {
        'User-Agent': 'TV-Saude-Local/1.0'
    }
});

async function testarConfiguracaoSemProxy() {
    console.log('🧪 Testando configuração SEM PROXY...\n');

    // Teste 1: Conexão local
    console.log('1️⃣ Testando conexão LOCAL...');
    try {
        const response1 = await axiosLocal.get('http://localhost:3001/api/health');
        console.log('✅ Sucesso LOCAL!');
        console.log(`📍 Status: ${response1.status}`);
        console.log(`📍 Mensagem: ${response1.data.message}`);
    } catch (error) {
        console.log('❌ Erro LOCAL:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Servidor não está rodando na porta 3001');
        }
    }
    console.log('---\n');

    // Teste 2: Endpoint de localidades
    console.log('2️⃣ Testando endpoint de localidades...');
    try {
        const response2 = await axiosLocal.get('http://localhost:3001/api/localidades/conteudo');
        console.log('✅ Sucesso LOCALIDADES!');
        console.log(`📍 Status: ${response2.status}`);
        console.log(`📍 IP Cliente: ${response2.data.ip_cliente}`);
        console.log(`📺 Vídeos: ${response2.data.videos?.length || 0}`);
    } catch (error) {
        console.log('❌ Erro LOCALIDADES:', error.message);
    }
    console.log('---\n');

    // Teste 3: Com IP específico
    console.log('3️⃣ Testando com IP específico (10.0.50.79)...');
    try {
        const response3 = await axiosDefault.get('http://10.0.50.79:3001/api/localidades/conteudo');
        console.log('✅ Sucesso IP ESPECÍFICO!');
        console.log(`📍 Status: ${response3.status}`);
        console.log(`📍 IP Cliente: ${response3.data.ip_cliente}`);
        console.log(`📺 Vídeos: ${response3.data.videos?.length || 0}`);
    } catch (error) {
        console.log('❌ Erro IP ESPECÍFICO:', error.message);
    }
}

// Função para criar axios simples (sempre sem proxy)
function createSimpleAxios() {
    return {
        async get(url, config = {}) {
            return axiosDefault.get(url, config);
        },
        
        async post(url, data, config = {}) {
            return axiosDefault.post(url, data, config);
        },

        async put(url, data, config = {}) {
            return axiosDefault.put(url, data, config);
        },

        async delete(url, config = {}) {
            return axiosDefault.delete(url, config);
        }
    };
}

// Exportar configurações (SEM PROXY)
module.exports = {
    axiosDefault, // Axios principal sem proxy
    axiosLocal,   // Axios local sem proxy
    createSimpleAxios, // Função para criar axios sem proxy
    // Proxy foi REMOVIDO - todas as conexões são diretas
};

// Se executado diretamente, fazer teste
if (require.main === module) {
    testarConfiguracaoSemProxy();
}
