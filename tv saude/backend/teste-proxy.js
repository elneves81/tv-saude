const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

// Configurar proxy se necessário
const proxyUrl = 'http://10.0.2.1:3128';
const agent = new HttpsProxyAgent(proxyUrl);

async function testarComProxy() {
    console.log('🧪 Testando com configuração de proxy...\n');

    try {
        // Criar instância do axios com proxy
        const axiosWithProxy = axios.create({
            // proxy: {
            //     host: '10.0.2.1',
            //     port: 3128
            // },
            timeout: 5000
        });

        // Testar direto sem proxy primeiro
        console.log('1️⃣ Testando SEM proxy...');
        const response = await axios.get('http://127.0.0.1:3001/api/localidades/conteudo', {
            timeout: 5000
        });
        
        console.log('✅ Sucesso! Status:', response.status);
        console.log('📍 Localidade:', response.data.localidade?.nome || 'Nenhuma');
        console.log('📺 Vídeos:', response.data.videos?.length || 0);

    } catch (error) {
        console.error('❌ Erro:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Servidor não está rodando na porta 3001');
        } else if (error.response?.status === 514) {
            console.log('🔒 Proxy corporativo está bloqueando');
            console.log('💡 Solicite liberação das portas 3001-3003 no proxy');
        }
    }
}

// Verificar se servidor está rodando primeiro
async function verificarServidor() {
    console.log('🔍 Verificando se servidor está rodando...\n');
    
    try {
        const response = await axios.get('http://127.0.0.1:3001/api/test', {
            timeout: 3000
        });
        console.log('✅ Servidor rodando!');
        return true;
    } catch (error) {
        console.log('❌ Servidor não está rodando na porta 3001');
        console.log('💡 Execute: node server.js');
        return false;
    }
}

async function main() {
    const serverRunning = await verificarServidor();
    
    if (serverRunning) {
        await testarComProxy();
    }
}

main();
