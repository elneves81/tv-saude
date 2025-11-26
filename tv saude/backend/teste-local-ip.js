const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'tv_saude.db');
const db = new sqlite3.Database(dbPath);

// Função para detectar localidade (cópia da função do servidor)
function detectLocalidade(clientIp) {
    return new Promise((resolve, reject) => {
        console.log(`🔍 Buscando localidade para IP: ${clientIp}`);
        
        const query = `
            SELECT l.*, li.ip_address 
            FROM localidades l
            JOIN localidade_ips li ON l.id = li.localidade_id
            WHERE li.ip_address = ? AND l.ativo = 1
        `;
        
        db.get(query, [clientIp], (err, row) => {
            if (err) {
                console.error('❌ Erro na consulta:', err.message);
                reject(err);
                return;
            }
            
            if (row) {
                console.log(`✅ Localidade encontrada: ${row.nome} (ID: ${row.id})`);
                resolve(row);
            } else {
                console.log(`❌ Nenhuma localidade encontrada para IP: ${clientIp}`);
                resolve(null);
            }
        });
    });
}

async function testarDeteccaoLocal() {
    console.log('🧪 Testando detecção de localidade LOCALMENTE...\n');

    try {
        // Testar com IP cadastrado
        console.log('1️⃣ Testando com IP cadastrado (10.0.50.45)...');
        const localidade1 = await detectLocalidade('10.0.50.45');
        
        if (localidade1) {
            console.log(`✅ Sucesso! Localidade detectada: ${localidade1.nome}`);
            console.log(`📍 ID: ${localidade1.id}`);
            console.log(`📝 Descrição: ${localidade1.descricao || 'Sem descrição'}`);
        } else {
            console.log('❌ Falha! Nenhuma localidade detectada');
        }
        console.log('---\n');

        // Testar com IP não cadastrado
        console.log('2️⃣ Testando com IP não cadastrado (192.168.1.100)...');
        const localidade2 = await detectLocalidade('192.168.1.100');
        
        if (localidade2) {
            console.log(`✅ Localidade detectada: ${localidade2.nome}`);
        } else {
            console.log('✅ Correto! Nenhuma localidade para IP não cadastrado');
        }
        console.log('---\n');

        // Testar com localhost
        console.log('3️⃣ Testando com localhost (127.0.0.1)...');
        const localidade3 = await detectLocalidade('127.0.0.1');
        
        if (localidade3) {
            console.log(`✅ Localidade detectada: ${localidade3.nome}`);
        } else {
            console.log('✅ Correto! Nenhuma localidade para localhost');
        }
        console.log('---\n');

        // Listar todos os IPs cadastrados
        console.log('4️⃣ Listando todos os IPs cadastrados...');
        db.all(`
            SELECT 
                li.ip_address,
                l.nome as localidade_nome,
                l.id as localidade_id,
                l.ativo
            FROM localidade_ips li
            JOIN localidades l ON li.localidade_id = l.id
            ORDER BY l.nome, li.ip_address
        `, (err, ips) => {
            if (err) {
                console.error('❌ Erro:', err.message);
                return;
            }

            console.log(`📊 Total de IPs cadastrados: ${ips.length}`);
            ips.forEach(ip => {
                console.log(`   🌐 ${ip.ip_address} → ${ip.localidade_nome} (${ip.ativo ? 'Ativo' : 'Inativo'})`);
            });

            db.close();
            console.log('\n🎉 Teste de detecção LOCAL concluído!');
        });

    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
        db.close();
    }
}

testarDeteccaoLocal();
