// Script de teste para verificar se a solução de autoplay está funcionando
// Este script deve ser executado no console do navegador

console.log('🧪 Iniciando teste de autoplay...');

// Verificar se o overlay de interação está presente
const overlay = document.querySelector('div[class*="fixed inset-0"]');
if (overlay) {
    console.log('✅ Overlay de interação encontrado');
    console.log('🖱️ Simulando clique no overlay...');
    overlay.click();
    
    setTimeout(() => {
        console.log('📹 Verificando se o vídeo está reproduzindo...');
        const video = document.querySelector('video');
        const youtube = document.querySelector('iframe[src*="youtube"]');
        
        if (video) {
            console.log(`📺 Vídeo local encontrado - Pausado: ${video.paused}, Tempo: ${video.currentTime}s`);
            if (!video.paused) {
                console.log('✅ Vídeo local reproduzindo com sucesso!');
            } else {
                console.log('❌ Vídeo local não está reproduzindo');
            }
        }
        
        if (youtube) {
            console.log('📺 Vídeo do YouTube encontrado');
            console.log('✅ YouTube carregado (player interno controla reprodução)');
        }
        
        if (!video && !youtube) {
            console.log('⚠️ Nenhum elemento de vídeo encontrado');
        }
    }, 2000);
} else {
    console.log('ℹ️ Overlay não encontrado - usuário já interagiu ou está desabilitado');
    
    // Verificar status atual do vídeo
    const video = document.querySelector('video');
    if (video) {
        console.log(`📺 Status do vídeo: Pausado: ${video.paused}, Tempo: ${video.currentTime}s, Volume: ${video.volume}`);
    }
}

// Testar comandos de controle remoto
setTimeout(() => {
    console.log('🎮 Testando comando de play via API...');
    
    fetch('http://10.0.50.79:3001/api/controle/comando', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
            comando: 'play',
            parametros: null
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('✅ Comando de play enviado:', data);
    })
    .catch(error => {
        console.error('❌ Erro ao enviar comando:', error);
    });
}, 3000);

console.log('🧪 Teste de autoplay configurado. Aguarde os resultados...');
