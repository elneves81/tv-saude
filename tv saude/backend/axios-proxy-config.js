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
            timeout: 5000
        });
        console.log('✅ Sucesso PROXY!');
        console.log(`📍 Status: ${response2.status}`);
        console.log('🌐 Proxy configurado corretamente');
    } catch (error) {
        console.log('❌ Erro PROXY:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Proxy não está disponível');
        }
    }
    console.log('---\n');

    // Teste 3: Detectar configuração automática
    console.log('3️⃣ Testando AUTO-DETECÇÃO...');
    try {
        // Tentar primeiro sem proxy
        let response;
        try {
            response = await axiosLocal.get('http://127.0.0.1:3001/api/localidades/conteudo');
            console.log('✅ Conexão LOCAL funcionando!');
        } catch (localError) {
            // Se falhar, tentar com proxy
            try {
                response = await axiosWithProxy.get('http://localhost:3001/api/localidades/conteudo');
                console.log('✅ Conexão via PROXY funcionando!');
            } catch (proxyError) {
                console.log('❌ Ambas as configurações falharam');
                console.log('Local:', localError.message);
                console.log('Proxy:', proxyError.message);
                return;
            }
        }

        if (response) {
            console.log('📊 Dados recebidos:');
            console.log(`   📍 Localidade: ${response.data.localidade?.nome || 'Padrão'}`);
            console.log(`   📺 Vídeos: ${response.data.videos?.length || 0}`);
            console.log(`   🎵 Áudios: ${response.data.audioTracks?.length || 0}`);
        }

    } catch (error) {
        console.log('❌ Erro na auto-detecção:', error.message);
    }
}

// Função para criar axios inteligente
function createSmartAxios() {
    return {
        async get(url, config = {}) {
            // Se for localhost, usar sem proxy
            if (url.includes('localhost') || url.includes('127.0.0.1')) {
                return axiosLocal.get(url, config);
            } else {
                // Para URLs externas, usar com proxy
                return axiosWithProxy.get(url, config);
            }
        },
        
        async post(url, data, config = {}) {
            if (url.includes('localhost') || url.includes('127.0.0.1')) {
                return axiosLocal.post(url, data, config);
            } else {
                return axiosWithProxy.post(url, data, config);
            }
        }
    };
}

// Exportar configurações
module.exports = {
    axiosWithProxy,
    axiosLocal,
    createSmartAxios,
    PROXY_CONFIG
};

// Se executado diretamente, fazer teste
if (require.main === module) {
    testarConfiguracaoProxy();
}
