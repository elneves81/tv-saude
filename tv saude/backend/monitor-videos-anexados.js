const axios = require('axios');

console.log('🔍 Monitorando sistema de vídeos anexados...\n');

// Função para verificar se o sistema está funcionando
async function verificarSistema() {
    try {
        console.log('📡 Verificando API de localidades...');
        const response = await axios.get('http://10.0.50.79:3001/api/localidades/conteudo', {
            timeout: 5000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.data && response.data.videos && response.data.videos.length > 0) {
            const videos = response.data.videos;
            console.log(`✅ API funcionando: ${videos.length} vídeo(s) encontrado(s)`);
            
            videos.forEach((video, index) => {
                console.log(`   📹 Vídeo ${index + 1}: "${video.titulo}" (${video.tipo})`);
                if (video.tipo === 'local') {
                    console.log(`      📁 Arquivo: ${video.arquivo}`);
                    console.log(`      🔗 URL: http://10.0.50.79:3001/uploads/${video.arquivo}`);
                }
            });

            // Verificar se o frontend está acessível
            try {
                const frontendResponse = await axios.get('http://10.0.50.79:3003', {
                    timeout: 5000
                });
                if (frontendResponse.status === 200) {
                    console.log('✅ Frontend da TV acessível');
                } else {
                    console.log('⚠️ Frontend da TV com problemas');
                }
            } catch (frontendError) {
                console.log('❌ Frontend da TV não acessível');
            }

            return {
                status: 'ok',
                videos: videos.length,
                hasLocalVideos: videos.some(v => v.tipo === 'local')
            };
        } else {
            console.log('⚠️ Nenhum vídeo encontrado na resposta da API');
            return { status: 'no_videos' };
        }
    } catch (error) {
        console.error('❌ Erro ao verificar sistema:', error.message);
        return { status: 'error', error: error.message };
    }
}

// Função para verificar arquivo de vídeo
async function verificarArquivoVideo(arquivo) {
    try {
        const response = await axios.head(`http://10.0.50.79:3001/uploads/${arquivo}`, {
            timeout: 3000
        });
        
        if (response.status === 200) {
            console.log(`✅ Arquivo de vídeo acessível: ${arquivo}`);
            return true;
        } else {
            console.log(`⚠️ Arquivo de vídeo com problemas: ${arquivo}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Arquivo de vídeo não acessível: ${arquivo} - ${error.message}`);
        return false;
    }
}

// Executar verificação
async function executarVerificacao() {
    console.log(`🕐 ${new Date().toLocaleString('pt-BR')} - Executando verificação...`);
    
    const resultado = await verificarSistema();
    
    if (resultado.status === 'ok') {
        console.log('\n📊 Status do Sistema:');
        console.log(`   📹 Total de vídeos: ${resultado.videos}`);
        console.log(`   💾 Vídeos locais: ${resultado.hasLocalVideos ? 'Sim' : 'Não'}`);
        console.log(`   🌐 Sistema: Funcionando`);
        
        // Verificar arquivos de vídeo se existirem
        try {
            const response = await axios.get('http://10.0.50.79:3001/api/localidades/conteudo');
            const videosLocais = response.data.videos.filter(v => v.tipo === 'local');
            
            for (const video of videosLocais) {
                await verificarArquivoVideo(video.arquivo);
            }
        } catch (err) {
            console.log('⚠️ Erro ao verificar arquivos:', err.message);
        }
        
    } else if (resultado.status === 'no_videos') {
        console.log('⚠️ PROBLEMA: Nenhum vídeo encontrado');
    } else {
        console.log('❌ PROBLEMA: Sistema com falhas');
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
}

// Executar verificação inicial
executarVerificacao();

// Configurar verificação a cada 30 segundos
setInterval(executarVerificacao, 30000);

console.log('🔄 Monitor iniciado - verificação a cada 30 segundos');
console.log('📺 Para testar o sistema: http://10.0.50.79:3003');
console.log('⚙️ Para acessar o dashboard: http://10.0.50.79:3002');
console.log('📡 API de localidades: http://10.0.50.79:3001/api/localidades/conteudo');
console.log('\nPressione Ctrl+C para parar o monitor\n');
