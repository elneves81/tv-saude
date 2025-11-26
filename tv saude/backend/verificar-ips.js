const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'tv_saude.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Verificando IPs cadastrados...\n');

// Verificar IPs das localidades
db.all(`
    SELECT 
        li.id,
        li.ip_address,
        li.localidade_id,
        l.nome as localidade_nome,
        li.data_criacao
    FROM localidade_ips li
    JOIN localidades l ON li.localidade_id = l.id
    ORDER BY l.nome, li.ip_address
`, (err, ips) => {
    if (err) {
        console.error('❌ Erro ao buscar IPs:', err.message);
        return;
    }

    console.log(`📊 Total de IPs cadastrados: ${ips.length}\n`);

    if (ips.length > 0) {
        console.log('📋 IPs por localidade:');
        ips.forEach(ip => {
            console.log(`   🌐 IP: ${ip.ip_address}`);
            console.log(`   📍 Localidade: ${ip.localidade_nome} (ID: ${ip.localidade_id})`);
            console.log(`   📅 Criado em: ${ip.data_criacao}`);
            console.log('   ---');
        });
    } else {
        console.log('⚠️  Nenhum IP cadastrado!');
        console.log('💡 Para testar, você precisa adicionar IPs às localidades.');
    }

    // Verificar playlists das localidades
    db.all(`
        SELECT 
            lp.id,
            lp.localidade_id,
            l.nome as localidade_nome,
            lp.playlist_id,
            p.nome as playlist_nome
        FROM localidade_playlists lp
        JOIN localidades l ON lp.localidade_id = l.id
        LEFT JOIN playlists p ON lp.playlist_id = p.id
        ORDER BY l.nome
    `, (err, playlists) => {
        if (err) {
            console.error('❌ Erro ao buscar playlists:', err.message);
            return;
        }

        console.log(`\n📺 Total de associações localidade-playlist: ${playlists.length}\n`);

        if (playlists.length > 0) {
            console.log('📋 Playlists por localidade:');
            playlists.forEach(pl => {
                console.log(`   📍 Localidade: ${pl.localidade_nome} (ID: ${pl.localidade_id})`);
                console.log(`   📺 Playlist: ${pl.playlist_nome || 'Não encontrada'} (ID: ${pl.playlist_id})`);
                console.log('   ---');
            });
        } else {
            console.log('⚠️  Nenhuma playlist associada às localidades!');
        }

        db.close();
        console.log('\n✅ Verificação concluída!');
    });
});
