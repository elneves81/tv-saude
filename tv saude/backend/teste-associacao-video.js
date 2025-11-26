const axios = require('axios');

async function testarAssociacaoVideo() {
    console.log('🧪 Testando associação de vídeo...\n');

    try {
        // Fazer login primeiro
        console.log('🔐 Fazendo login...');
        const loginResponse = await axios.post('http://10.0.50.79:3001/api/auth/login', {
            email: 'admin@tvsaude.com',
            senha: 'admin123'
        });

        const token = loginResponse.data.token;
        console.log('✅ Login realizado com sucesso');

        // Buscar localidades
        console.log('\n📍 Buscando localidades...');
        const localidadesResponse = await axios.get('http://10.0.50.79:3001/api/localidades', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (localidadesResponse.data.length === 0) {
            console.log('❌ Nenhuma localidade encontrada');
            return;
        }

        const localidade = localidadesResponse.data[0];
        console.log(`✅ Localidade encontrada: ${localidade.nome} (ID: ${localidade.id})`);

        // Buscar vídeos
        console.log('\n🎬 Buscando vídeos...');
        const videosResponse = await axios.get('http://10.0.50.79:3001/api/videos/admin', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (videosResponse.data.length === 0) {
            console.log('❌ Nenhum vídeo encontrado');
            return;
        }

        const video = videosResponse.data[0];
        console.log(`✅ Vídeo encontrado: "${video.titulo}" (ID: ${video.id})`);

        // Tentar associar vídeo
        console.log(`\n🔗 Tentando associar vídeo ${video.id} à localidade ${localidade.id}...`);
        
        try {
            const associacaoResponse = await axios.post(`http://10.0.50.79:3001/api/localidades/${localidade.id}/videos`, {
                video_id: video.id,
                prioridade: 1
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('✅ SUCESSO:', associacaoResponse.data.message);
        } catch (error) {
            if (error.response) {
                console.log('⚠️ Resposta da API:', error.response.status, error.response.data);
            } else {
                console.log('❌ Erro de rede:', error.message);
            }
        }

        // Verificar vídeos associados à localidade
        console.log(`\n📋 Verificando vídeos associados à localidade ${localidade.id}...`);
        try {
            const videosLocalidadeResponse = await axios.get(`http://10.0.50.79:3001/api/localidades/${localidade.id}/videos`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log(`✅ Vídeos associados: ${videosLocalidadeResponse.data.length}`);
            videosLocalidadeResponse.data.forEach((v, index) => {
                console.log(`   ${index + 1}. "${v.titulo}" (Prioridade: ${v.prioridade})`);
            });
        } catch (error) {
            console.log('❌ Erro ao buscar vídeos da localidade:', error.response?.data || error.message);
        }

    } catch (error) {
        console.error('❌ Erro geral:', error.response?.data || error.message);
    }
}

testarAssociacaoVideo();
