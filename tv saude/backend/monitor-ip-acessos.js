const express = require('express');
const app = express();
const PORT = 3010; // Porta diferente para não conflitar

// Middleware para capturar IPs de acesso
const logIPAccess = (req, res, next) => {
    const clientIP = req.ip || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress ||
                     (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                     req.headers['x-forwarded-for'] ||
                     req.headers['x-real-ip'] ||
                     'IP não identificado';
    
    const timestamp = new Date().toLocaleString('pt-BR');
    const userAgent = req.headers['user-agent'] || 'User-Agent não identificado';
    const referer = req.headers.referer || 'Acesso direto';
    
    console.log(`\n🌐 NOVO ACESSO DETECTADO!`);
    console.log(`⏰ Data/Hora: ${timestamp}`);
    console.log(`📍 IP Cliente: ${clientIP}`);
    console.log(`🔗 URL: ${req.method} ${req.originalUrl}`);
    console.log(`🖥️ User-Agent: ${userAgent}`);
    console.log(`📄 Referer: ${referer}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    next();
};

app.use(logIPAccess);

// Endpoint para testar
app.get('/api/test', (req, res) => {
    res.json({
        message: 'Monitor de IP funcionando!',
        yourIP: req.ip,
        timestamp: new Date().toISOString()
    });
});

// Middleware para APIs da TV Saúde (proxy reverso)
app.use('/api/*', (req, res) => {
    // Apenas log, não faz proxy real
    res.json({
        message: 'IP registrado com sucesso',
        detected_ip: req.ip,
        original_url: req.originalUrl,
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🎯 MONITOR DE IPs DA API TV SAÚDE`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📡 Monitor rodando em: http://0.0.0.0:${PORT}`);
    console.log(`🌐 Acesse para testar: http://10.0.50.79:${PORT}/api/test`);
    console.log(`📊 Aguardando acessos na API...`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
});

// Interceptar SIGINT (Ctrl+C)
process.on('SIGINT', () => {
    console.log(`\n🛑 Monitor de IPs encerrado.`);
    process.exit(0);
});
