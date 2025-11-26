console.log('🎯 === DEMONSTRAÇÃO MONITOR DE STATUS IP ===\n');

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function demonstrarFuncionalidades() {
    console.log('📡 Sistema de Monitoramento de Status IP - TV Saúde');
    console.log('================================================\n');
    
    // 1. Testar endpoint individual
    console.log('1️⃣ TESTE DE IP INDIVIDUAL:');
    console.log('   Endpoint: GET /api/ip/verificar/{ip}');
    
    try {
        const { stdout } = await execAsync('curl --noproxy "*" -s "http://localhost:3001/api/ip/verificar/10.0.50.79"');
        const result = JSON.parse(stdout);
        
        console.log(`   ✅ IP 10.0.50.79: ${result.data.online ? 'ONLINE' : 'OFFLINE'}`);
        if (result.data.responseTime) {
            console.log(`   📊 Tempo de resposta: ${result.data.responseTime}`);
        }
        console.log(`   📅 Timestamp: ${new Date(result.data.timestamp).toLocaleString()}`);
    } catch (error) {
        console.log('   ❌ Erro no teste individual:', error.message);
    }
    
    console.log('\n---\n');
    
    // 2. Testar status das localidades
    console.log('2️⃣ STATUS DAS LOCALIDADES:');
    console.log('   Endpoint: GET /api/localidades/status');
    
    try {
        const { stdout } = await execAsync('curl --noproxy "*" -s "http://localhost:3001/api/localidades/status"');
        const result = JSON.parse(stdout);
        
        if (result.success) {
            const { data } = result;
            console.log(`   📊 Resumo: ${data.total} localidades | ${data.online} online | ${data.offline} offline`);
            
            data.localidades.forEach(loc => {
                const status = loc.online ? '✅ ONLINE' : '❌ OFFLINE';
                const ping = loc.responseTime ? ` (${loc.responseTime})` : '';
                console.log(`   📍 ${loc.nome} (${loc.ip}): ${status}${ping}`);
            });
        }
    } catch (error) {
        console.log('   ❌ Erro no teste de localidades:', error.message);
    }
    
    console.log('\n---\n');
    
    // 3. Demonstrar múltiplos IPs
    console.log('3️⃣ TESTE MÚLTIPLOS IPs:');
    console.log('   Endpoint: POST /api/ip/verificar-multiplos');
    
    const ipsParaTestar = ['127.0.0.1', '10.0.50.79', '8.8.8.8'];
    const payload = JSON.stringify({ ips: ipsParaTestar });
    
    try {
        const { stdout } = await execAsync(`curl --noproxy "*" -s -X POST "http://localhost:3001/api/ip/verificar-multiplos" -H "Content-Type: application/json" -d '${payload}'`);
        const result = JSON.parse(stdout);
        
        if (result.success) {
            const { data } = result;
            console.log(`   📊 Testados: ${data.total} IPs | ${data.online} online | ${data.offline} offline`);
            
            data.resultados.forEach(ip => {
                const status = ip.online ? '✅ ONLINE' : '❌ OFFLINE';
                const ping = ip.responseTime ? ` (${ip.responseTime})` : '';
                console.log(`   🌐 ${ip.ip}: ${status}${ping}`);
            });
        }
    } catch (error) {
        console.log('   ❌ Erro no teste múltiplo:', error.message);
    }
    
    console.log('\n================================================');
    console.log('🎯 FUNCIONALIDADES IMPLEMENTADAS:');
    console.log('');
    console.log('✅ BACKEND:');
    console.log('   • Verificação de IP individual via ping');
    console.log('   • Verificação de múltiplos IPs');
    console.log('   • Status das localidades cadastradas');
    console.log('   • Tempo de resposta em milissegundos');
    console.log('   • Timestamps para rastreamento');
    console.log('');
    console.log('✅ FRONTEND (Dashboard):');
    console.log('   • Interface visual para status IP');
    console.log('   • Auto-refresh configurável (10s, 30s, 1m, 5m)');
    console.log('   • Resumo com contadores e percentuais');
    console.log('   • Teste de IP customizado');
    console.log('   • Indicadores visuais (online/offline)');
    console.log('   • Menu "Status IP" na sidebar');
    console.log('');
    console.log('🔗 ACESSO:');
    console.log('   • Backend: http://localhost:3001/api');
    console.log('   • Dashboard: http://localhost:3002/status');
    console.log('   • Com IP: http://10.0.50.79:3002/status');
    console.log('');
    console.log('🚀 SISTEMA PRONTO PARA USO!');
}

if (require.main === module) {
    demonstrarFuncionalidades();
}
