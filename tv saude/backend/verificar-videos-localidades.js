const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../database/tv_saude.db');

console.log('📹 Verificando vídeos por localidade...\n');

db.all('SELECT l.id, l.nome, COUNT(lv.video_id) as total_videos FROM localidades l LEFT JOIN localidade_videos lv ON l.id = lv.localidade_id WHERE l.ativo = 1 GROUP BY l.id, l.nome', [], (err, rows) => {
  if (err) {
    console.error('❌ Erro:', err);
    return;
  }
  
  rows.forEach(row => {
    console.log(`📍 ${row.nome} (ID: ${row.id}): ${row.total_videos} vídeos`);
  });
  
  console.log('\n🎬 Detalhes dos vídeos por localidade:');
  
  // Primeiro verificar estrutura da tabela
  db.all('PRAGMA table_info(videos)', [], (err, columns) => {
    if (err) {
      console.error('❌ Erro ao verificar estrutura:', err);
      return;
    }
    
    console.log('\n📋 Colunas da tabela videos:');
    columns.forEach(col => {
      console.log(`   - ${col.name} (${col.type})`);
    });
    
    console.log('\n🎬 Detalhes dos vídeos por localidade:');
    
    db.all(`
      SELECT l.nome as localidade, v.titulo, v.tipo, v.ativo, lv.prioridade
      FROM localidades l 
      JOIN localidade_videos lv ON l.id = lv.localidade_id 
      JOIN videos v ON lv.video_id = v.id 
      WHERE l.ativo = 1 
      ORDER BY l.nome, lv.prioridade
    `, [], (err, videos) => {
    if (err) {
      console.error('❌ Erro ao buscar vídeos:', err);
      db.close();
      return;
    }
    
    videos.forEach(video => {
      console.log(`   📹 ${video.localidade}: ${video.titulo} (${video.tipo}) - Prioridade: ${video.prioridade} - Ativo: ${video.ativo ? 'Sim' : 'Não'}`);
    });
    
    console.log(`\n✅ Total de vídeos encontrados: ${videos.length}`);
    db.close();
    });
  });
});
