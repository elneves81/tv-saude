const { axiosLocal, axiosWithProxy, createSmartAxios } = require('./axios-proxy-config');

async function testarLocalidadesComProxy() {
    console.log('🧪 Testando API de localidades com configuração de proxy...\n');

    const smartAxios = createSmartAxios();

    try {
        // Passo 1: Fazer login para obter token
        console.log('1️⃣ Fazendo login...');
        const loginData = {
            email: 'admin@tvsaude.com',
            senha: 'admin123'
        };

        const loginResponse = await smartAxios.post(
            'http://127.0.0.1:3001/api/auth/login',
            loginData
        );

        const token = loginResponse.data.token;
        console.log('✅ Login realizado com sucesso!');
        console.log(`🔑 Token obtido: ${token.substring(0, 20)}...`);
        console.log('---\n');

        // Passo 2: Testar endpoint de localidades autenticado
        console.log('2️⃣ Testando endpoint de localidades...');
        const localidadesResponse = await smartAxios.get(
            'http://127.0.0.1:3001/api/localidades',
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        console.log('✅ Localidades obtidas com sucesso!');
        console.log(`📊 Total de localidades: ${localidadesResponse.data.length}`);
        localidadesResponse.data.forEach(loc => {
            console.log(`   📍 ${loc.nome} (ID: ${loc.id}) - ${loc.ativo ? 'Ativo' : 'Inativo'}`);
        });
        console.log('---\n');

        // Passo 3: Testar endpoint de conteúdo (sem autenticação)
        console.log('3️⃣ Testando endpoint de conteúdo...');
        const conteudoResponse = await smartAxios.get('http://127.0.0.1:3001/api/localidades/conteudo');

        console.log('✅ Conteúdo obtido com sucesso!');
        console.log(`📍 Localidade detectada: ${conteudoResponse.data.localidade?.nome || 'Nenhuma (padrão)'}`);
        console.log(`📺 Total de vídeos: ${conteudoResponse.data.videos?.length || 0}`);
        console.log(`🎵 Total de áudios: ${conteudoResponse.data.audioTracks?.length || 0}`);
        console.log('---\n');

        // Passo 4: Criar nova localidade
        console.log('4️⃣ Testando criação de localidade...');
        const novaLocalidade = {
            nome: 'TESTE PROXY',
            descricao: 'Localidade criada via teste de proxy',
            ativo: true
        };

        const criacaoResponse = await smartAxios.post(
            'http://127.0.0.1:3001/api/localidades',
            novaLocalidade,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        console.log('✅ Localidade criada com sucesso!');
        console.log(`📍 Nova localidade: ${criacaoResponse.data.nome} (ID: ${criacaoResponse.data.id})`);
        console.log('---\n');

        console.log('🎉 Todos os testes PASSARAM! Axios com proxy está funcionando perfeitamente!');

    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
        if (error.response) {
            console.error('📄 Status:', error.response.status);
            console.error('📝 Dados:', error.response.data);
        }
        
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Verifique se o servidor está rodando na porta 3001');
        }
    }
}

testarLocalidadesComProxy();
