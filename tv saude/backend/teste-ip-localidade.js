const axios = require('axios');

async function testarDeteccaoIP() {
    console.log('🧪 Testando detecção de localidade por IP...\n');

    try {
        // Testar com IP cadastrado
        console.log('1️⃣ Testando com IP cadastrado (10.0.50.45)...');
        
        const response1 = await axios.get('http://localhost:3001/api/localidades/conteudo', {
            headers: {
                'X-Forwarded-For': '10.0.50.45',
                'X-Real-IP': '10.0.50.45'
            }
        });
        
        console.log('✅ Resposta para IP cadastrado:');
        console.log('📍 Localidade detectada:', response1.data.localidade?.nome || 'Nenhuma');
        console.log('📺 Vídeos encontrados:', response1.data.videos?.length || 0);
        console.log('🎵 Áudios encontrados:', response1.data.audioTracks?.length || 0);
        console.log('---\n');

        // Testar com IP não cadastrado
        console.log('2️⃣ Testando com IP não cadastrado (192.168.1.100)...');
        
        const response2 = await axios.get('http://localhost:3001/api/localidades/conteudo', {
            headers: {
                'X-Forwarded-For': '192.168.1.100',
                'X-Real-IP': '192.168.1.100'
            }
        });
        
        console.log('✅ Resposta para IP não cadastrado:');
        console.log('📍 Localidade detectada:', response2.data.localidade?.nome || 'Nenhuma (conteúdo padrão)');
        console.log('📺 Vídeos encontrados:', response2.data.videos?.length || 0);
        console.log('🎵 Áudios encontrados:', response2.data.audioTracks?.length || 0);
        console.log('---\n');

        // Testar sem cabeçalhos de IP (localhost)
        console.log('3️⃣ Testando sem cabeçalhos de IP (localhost)...');
        
        const response3 = await axios.get('http://localhost:3001/api/localidades/conteudo');
        
        console.log('✅ Resposta para localhost:');
        console.log('📍 Localidade detectada:', response3.data.localidade?.nome || 'Nenhuma (conteúdo padrão)');
        console.log('📺 Vídeos encontrados:', response3.data.videos?.length || 0);
        console.log('🎵 Áudios encontrados:', response3.data.audioTracks?.length || 0);
        
        console.log('\n🎉 Teste de detecção por IP concluído com sucesso!');

    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
        if (error.response) {
            console.error('📄 Status:', error.response.status);
            console.error('📝 Dados:', error.response.data);
        }
    }
}

// Aguardar um momento para garantir que o servidor esteja rodando
setTimeout(testarDeteccaoIP, 1000);
