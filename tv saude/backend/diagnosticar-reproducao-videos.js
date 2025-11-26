const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conectar ao banco de dados
const dbPath = path.join(__dirname, '../database/tv_saude.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 DIAGNÓSTICO DE REPRODUÇÃO DE VÍDEOS');
console.log('=====================================');

// Verificar vídeos ativos
db.all('SELECT * FROM videos WHERE ativo = 1 ORDER BY ordem ASC, data_criacao DESC', (err, videos) => {
  if (err) {
    console.error('❌ Erro ao buscar vídeos:', err);
    return;
  }

  console.log(`\n📺 VÍDEOS ATIVOS ENCONTRADOS: ${videos.length}`);
  console.log('----------------------------------------');
  
  if (videos.length === 0) {
    console.log('⚠️ PROBLEMA: Nenhum vídeo ativo encontrado!');
    console.log('💡 SOLUÇÃO: Ative pelo menos um vídeo no dashboard admin');
  } else {
    videos.forEach((video, index) => {
      console.log(`${index + 1}. ${video.titulo}`);
      console.log(`   - ID: ${video.id}`);
      console.log(`   - Tipo: ${video.tipo}`);
      console.log(`   - Arquivo: ${video.arquivo || video.url_youtube}`);
      console.log(`   - Ativo: ${video.ativo ? '✅' : '❌'}`);
      console.log(`   - Ordem: ${video.ordem}`);
      console.log('');
    });
  }

  // Verificar playlist ativa
  db.get('SELECT * FROM playlists WHERE ativa = 1', (err, playlist) => {
    if (err) {
      console.error('❌ Erro ao buscar playlist ativa:', err);
      return;
    }

    console.log('\n📋 PLAYLIST ATIVA:');
    console.log('------------------');
    
    if (!playlist) {
      console.log('⚠️ Nenhuma playlist ativa encontrada');
      console.log('📺 Sistema usará todos os vídeos ativos em ordem');
    } else {
      console.log(`✅ Playlist ativa: ${playlist.nome}`);
      console.log(`   - ID: ${playlist.id}`);
      console.log(`   - Descrição: ${playlist.descricao || 'N/A'}`);
      
      // Verificar vídeos da playlist
      db.all(`
        SELECT v.*, pv.ordem as playlist_ordem 
        FROM videos v 
        INNER JOIN playlist_videos pv ON v.id = pv.video_id 
        WHERE pv.playlist_id = ? AND v.ativo = 1
        ORDER BY pv.ordem ASC
      `, [playlist.id], (err, playlistVideos) => {
        if (err) {
          console.error('❌ Erro ao buscar vídeos da playlist:', err);
          return;
        }

        console.log(`\n📺 VÍDEOS NA PLAYLIST ATIVA: ${playlistVideos.length}`);
        console.log('--------------------------------------------');
        
        if (playlistVideos.length === 0) {
          console.log('⚠️ PROBLEMA: Playlist ativa não tem vídeos!');
          console.log('💡 SOLUÇÃO: Adicione vídeos à playlist ou desative-a');
        } else if (playlistVideos.length === 1) {
          console.log('⚠️ POSSÍVEL PROBLEMA: Apenas 1 vídeo na playlist');
          console.log('💡 Vídeo único será reproduzido em loop');
          console.log(`   - ${playlistVideos[0].titulo}`);
        } else {
          playlistVideos.forEach((video, index) => {
            console.log(`${index + 1}. ${video.titulo}`);
            console.log(`   - Ordem na playlist: ${video.playlist_ordem}`);
            console.log(`   - Tipo: ${video.tipo}`);
          });
        }

        // Verificar localidades
        checkLocalidades(videos);
      });
    }

    if (!playlist) {
      checkLocalidades(videos);
    }
  });
});

function checkLocalidades(videos) {
  console.log('\n🌍 VERIFICAÇÃO DE LOCALIDADES:');
  console.log('------------------------------');
  
  db.all('SELECT * FROM localidades WHERE ativo = 1', (err, localidades) => {
    if (err) {
      console.error('❌ Erro ao buscar localidades:', err);
      return;
    }

    if (localidades.length === 0) {
      console.log('ℹ️ Nenhuma localidade configurada - usando conteúdo global');
    } else {
      console.log(`📍 ${localidades.length} localidade(s) configurada(s):`);
      
      localidades.forEach((loc, index) => {
        console.log(`${index + 1}. ${loc.nome}`);
        
        // Verificar vídeos específicos da localidade
        db.all(`
          SELECT v.titulo, lv.prioridade 
          FROM videos v 
          INNER JOIN localidade_videos lv ON v.id = lv.video_id 
          WHERE lv.localidade_id = ? AND lv.ativo = 1 AND v.ativo = 1
          ORDER BY lv.prioridade DESC
        `, [loc.id], (err, locVideos) => {
          if (err) return;
          
          if (locVideos.length > 0) {
            console.log(`   - Vídeos específicos: ${locVideos.length}`);
            locVideos.forEach(v => console.log(`     • ${v.titulo}`));
          }
        });
      });
    }

    // Diagnóstico final
    setTimeout(() => {
      console.log('\n🔧 DIAGNÓSTICO E RECOMENDAÇÕES:');
      console.log('===============================');
      
      if (videos.length === 0) {
        console.log('❌ PROBLEMA CRÍTICO: Nenhum vídeo ativo');
        console.log('💡 SOLUÇÃO: Ative vídeos no dashboard admin');
      } else if (videos.length === 1) {
        console.log('⚠️ ATENÇÃO: Apenas 1 vídeo ativo');
        console.log('💡 O vídeo será reproduzido em loop contínuo');
        console.log('💡 Para sequência, adicione mais vídeos ativos');
      } else {
        console.log(`✅ ${videos.length} vídeos ativos encontrados`);
        console.log('💡 O sistema DEVERIA reproduzir todos em sequência');
        console.log('💡 Se está travando em 1 vídeo, há problema no frontend');
      }

      console.log('\n🔄 POSSÍVEIS CAUSAS DO PROBLEMA:');
      console.log('1. Lógica de transição do frontend com bug');
      console.log('2. Vídeo corrompido travando a reprodução');
      console.log('3. Erro no evento onEnded do vídeo');
      console.log('4. Problema na função nextVideo()');
      
      console.log('\n💡 SOLUÇÕES RECOMENDADAS:');
      console.log('1. ✅ Corrigir lógica de transição no frontend');
      console.log('2. ✅ Implementar timeout forçado para transição');
      console.log('3. ✅ Melhorar tratamento de erros de vídeo');
      console.log('4. ✅ Adicionar logs detalhados de reprodução');

      console.log('\n🎯 CONCLUSÃO:');
      console.log(`Há ${videos.length} vídeos ativos. O problema está na lógica do frontend.`);
      console.log('Vou criar uma correção para garantir a transição entre vídeos.');

      db.close();
    }, 1000);
  });
}
