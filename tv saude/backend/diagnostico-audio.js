const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔊 DIAGNÓSTICO DE ÁUDIO DOS VÍDEOS');
console.log('================================');

const uploadsDir = path.join(__dirname, '../uploads');

try {
    // Verificar se a pasta uploads existe
    if (!fs.existsSync(uploadsDir)) {
        console.log('❌ Pasta uploads não encontrada!');
        return;
    }

    // Listar arquivos de vídeo
    const videoFiles = fs.readdirSync(uploadsDir).filter(file => 
        file.toLowerCase().endsWith('.mp4') || 
        file.toLowerCase().endsWith('.avi') || 
        file.toLowerCase().endsWith('.mov') ||
        file.toLowerCase().endsWith('.mkv')
    );

    console.log(`📹 Encontrados ${videoFiles.length} arquivo(s) de vídeo:\n`);

    if (videoFiles.length === 0) {
        console.log('⚠️ Nenhum arquivo de vídeo encontrado na pasta uploads!');
        return;
    }

    videoFiles.forEach((file, index) => {
        console.log(`🎬 Vídeo ${index + 1}: ${file}`);
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        
        console.log(`   📏 Tamanho: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   📅 Modificado: ${stats.mtime.toLocaleString('pt-BR')}`);
        
        // Verificar informações de áudio com ffprobe (se disponível)
        try {
            const ffprobeCmd = `ffprobe -v quiet -select_streams a:0 -show_entries stream=codec_name,channels,sample_rate -of csv=p=0 "${filePath}"`;
            const audioInfo = execSync(ffprobeCmd, { encoding: 'utf8', timeout: 5000 }).trim();
            
            if (audioInfo) {
                const [codec, channels, sampleRate] = audioInfo.split(',');
                console.log(`   🔊 Áudio: ${codec || 'Desconhecido'}`);
                console.log(`   🎵 Canais: ${channels || 'Desconhecido'}`);
                console.log(`   📊 Sample Rate: ${sampleRate || 'Desconhecido'} Hz`);
            } else {
                console.log('   🔇 SEM ÁUDIO detectado!');
            }
        } catch (error) {
            console.log('   ⚠️ Não foi possível verificar áudio (ffprobe não disponível)');
            console.log('   💡 Instale FFmpeg para análise detalhada');
        }
        
        console.log('   ────────────────────────────────');
    });

    console.log('\n💡 SOLUÇÕES PARA PROBLEMAS DE ÁUDIO:');
    console.log('===================================');
    console.log('1. 🔇 Se vídeo não tem áudio:');
    console.log('   - Regravar com áudio ativado');
    console.log('   - Adicionar faixas de áudio com editor');
    console.log('');
    console.log('2. 🔉 Se áudio está muito baixo:');
    console.log('   - Usar controles de volume da TV');
    console.log('   - Aumentar volume do sistema');
    console.log('');
    console.log('3. 🚫 Se codec não é compatível:');
    console.log('   - Converter para MP4 com AAC');
    console.log('   - Usar: ffmpeg -i input.avi -c:v libx264 -c:a aac output.mp4');
    console.log('');
    console.log('✅ CONFIGURAÇÕES APLICADAS:');
    console.log('- Propriedade "muted" removida dos vídeos');
    console.log('- Volume configurado para 100%');
    console.log('- Controles de volume funcionando');

} catch (error) {
    console.error('❌ Erro ao analisar vídeos:', error.message);
}

console.log('\n🎯 PRÓXIMOS PASSOS:');
console.log('- Acesse: http://10.0.50.79:3003');
console.log('- Verifique se há som');
console.log('- Use controle remoto para ajustar volume');
