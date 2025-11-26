const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// Função para verificar se um IP está online
async function verificarIPOnline(ip) {
    try {
        // Usar ping para verificar conectividade
        const command = process.platform === 'win32' 
            ? `ping -n 1 -w 1000 ${ip}` 
            : `ping -c 1 -W 1 ${ip}`;
        
        const { stdout, stderr } = await execAsync(command);
        
        // Verificar se o ping foi bem-sucedido
        const isOnline = process.platform === 'win32' 
            ? stdout.includes('TTL=') || stdout.includes('tempo<')
            : stdout.includes('1 packets transmitted, 1 received');
        
        return {
            ip: ip,
            online: isOnline,
            timestamp: new Date().toISOString(),
            responseTime: isOnline ? extrairTempoResposta(stdout) : null,
            message: isOnline ? 'IP está online' : 'IP está offline ou inacessível'
        };
    } catch (error) {
        return {
            ip: ip,
            online: false,
            timestamp: new Date().toISOString(),
            responseTime: null,
            message: `Erro ao verificar IP: ${error.message}`,
            error: error.message
        };
    }
}

// Função para extrair tempo de resposta do ping
function extrairTempoResposta(stdout) {
    try {
        if (process.platform === 'win32') {
            // Windows: "tempo=1ms" ou "tempo<1ms"
            const match = stdout.match(/tempo[=<](\d+)ms/i);
            return match ? `${match[1]}ms` : null;
        } else {
            // Linux/Mac: "time=1.234 ms"
            const match = stdout.match(/time=(\d+\.?\d*)\s*ms/i);
            return match ? `${parseFloat(match[1]).toFixed(1)}ms` : null;
        }
    } catch (error) {
        return null;
    }
}

// Função para verificar múltiplos IPs
async function verificarMultiplosIPs(ips) {
    const resultados = [];
    
    for (const ip of ips) {
        const resultado = await verificarIPOnline(ip);
        resultados.push(resultado);
    }
    
    return {
        timestamp: new Date().toISOString(),
        total: ips.length,
        online: resultados.filter(r => r.online).length,
        offline: resultados.filter(r => !r.online).length,
        resultados: resultados
    };
}

// Função para teste rápido
async function testeRapidoIP() {
    console.log('🔍 === TESTE DE CONECTIVIDADE IP ===\n');
    
    const ipsParaTestar = [
        '10.0.50.79',     // IP específico da rede
        '127.0.0.1',      // Localhost
        '10.0.2.1',       // Gateway/Proxy
        '8.8.8.8',        // Google DNS (teste externo)
        '192.168.1.1'     // Gateway comum
    ];
    
    console.log('📡 Testando conectividade dos IPs...\n');
    
    for (const ip of ipsParaTestar) {
        process.stdout.write(`🔍 Testando ${ip}... `);
        const resultado = await verificarIPOnline(ip);
        
        if (resultado.online) {
            console.log(`✅ ONLINE ${resultado.responseTime ? `(${resultado.responseTime})` : ''}`);
        } else {
            console.log(`❌ OFFLINE`);
        }
    }
    
    console.log('\n🎯 Teste concluído!');
}

module.exports = {
    verificarIPOnline,
    verificarMultiplosIPs,
    testeRapidoIP
};

// Se executado diretamente, fazer teste
if (require.main === module) {
    testeRapidoIP();
}
