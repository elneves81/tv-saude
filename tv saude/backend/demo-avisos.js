// Demonstração prática do Sistema de Avisos Interativos
// Execute este arquivo para ver o sistema funcionando

const express = require('express');
const path = require('path');
const { integrarSistemaAvisos } = require('./integrar-sistema-avisos');

const app = express();
const PORT = 3005;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Integrar sistema de avisos
console.log('🎯 Iniciando demonstração do Sistema de Avisos...');
const sistemaAvisos = integrarSistemaAvisos(app);

// Página de demonstração
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🎯 Demo - Sistema de Avisos Interativos</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                min-height: 100vh;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
            }
            .header {
                text-align: center;
                margin-bottom: 40px;
            }
            .demo-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            .demo-card {
                background: rgba(255, 255, 255, 0.95);
                color: #2c3e50;
                border-radius: 15px;
                padding: 20px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                text-align: center;
            }
            .demo-card h3 {
                margin: 0 0 15px 0;
                color: #2c3e50;
            }
            .demo-card p {
                margin: 0 0 15px 0;
                font-size: 14px;
                color: #666;
            }
            .btn {
                background: linear-gradient(45deg, #3498db, #2980b9);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                margin: 5px;
                transition: all 0.3s ease;
            }
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            }
            .btn.green { background: linear-gradient(45deg, #27ae60, #2ecc71); }
            .btn.red { background: linear-gradient(45deg, #e74c3c, #c0392b); }
            .btn.orange { background: linear-gradient(45deg, #f39c12, #d68910); }
            .btn.purple { background: linear-gradient(45deg, #9b59b6, #8e44ad); }
            .response {
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 15px;
                border-radius: 8px;
                margin-top: 15px;
                font-family: monospace;
                font-size: 12px;
                white-space: pre-wrap;
                display: none;
            }
            .apis-list {
                background: rgba(255, 255, 255, 0.95);
                color: #2c3e50;
                border-radius: 15px;
                padding: 20px;
                margin-top: 20px;
            }
            .apis-list h3 {
                margin: 0 0 15px 0;
            }
            .api-item {
                background: #f8f9fa;
                padding: 10px;
                border-radius: 5px;
                margin: 5px 0;
                font-family: monospace;
                font-size: 13px;
            }
            .api-item .method {
                font-weight: bold;
                color: #e74c3c;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎯 Sistema de Avisos Interativos</h1>
                <h2>📺 TV Saúde Guarapuava</h2>
                <p>Demonstração completa do sistema de avisos para postos de saúde</p>
            </div>

            <div class="demo-grid">
                <div class="demo-card">
                    <h3>📢 Testar Sistema</h3>
                    <p>Verificar se todas as funcionalidades estão operacionais</p>
                    <button class="btn" onclick="testarSistema()">🧪 Executar Testes</button>
                    <div id="teste-response" class="response"></div>
                </div>

                <div class="demo-card">
                    <h3>🎨 Criar Avisos de Exemplo</h3>
                    <p>Gerar avisos de demonstração para cada tipo disponível</p>
                    <button class="btn green" onclick="criarExemplos()">➕ Criar Exemplos</button>
                    <div id="exemplos-response" class="response"></div>
                </div>

                <div class="demo-card">
                    <h3>📋 Ver Avisos Ativos</h3>
                    <p>Listar todos os avisos atualmente ativos no sistema</p>
                    <button class="btn purple" onclick="verAvisosAtivos()">👁️ Ver Avisos</button>
                    <div id="ativos-response" class="response"></div>
                </div>

                <div class="demo-card">
                    <h3>🏥 Avisos por UBS</h3>
                    <p>Visualizar avisos específicos para cada unidade de saúde</p>
                    <button class="btn" onclick="verAvisosPorUBS('ubs-centro')">🏥 UBS Centro</button>
                    <button class="btn" onclick="verAvisosPorUBS('ubs-vila-bela')">🏥 Vila Bela</button>
                    <div id="ubs-response" class="response"></div>
                </div>

                <div class="demo-card">
                    <h3>📊 Estatísticas</h3>
                    <p>Relatório de exibições e performance dos avisos</p>
                    <button class="btn orange" onclick="verEstatisticas()">📈 Ver Stats</button>
                    <div id="stats-response" class="response"></div>
                </div>

                <div class="demo-card">
                    <h3>🚨 Aviso Urgente</h3>
                    <p>Criar aviso de urgência para teste imediato</p>
                    <button class="btn red" onclick="criarAvisoUrgente()">🚨 Criar Urgência</button>
                    <div id="urgente-response" class="response"></div>
                </div>
            </div>

            <div class="apis-list">
                <h3>🔗 APIs Disponíveis</h3>
                <div class="api-item"><span class="method">GET</span> /api/avisos/teste - Teste do sistema</div>
                <div class="api-item"><span class="method">GET</span> /api/avisos/ativos/:ubsId? - Avisos ativos</div>
                <div class="api-item"><span class="method">GET</span> /api/tv/avisos/:ubsId? - Avisos para TV</div>
                <div class="api-item"><span class="method">POST</span> /api/avisos - Criar novo aviso</div>
                <div class="api-item"><span class="method">POST</span> /api/avisos/criar-exemplos - Criar exemplos</div>
                <div class="api-item"><span class="method">POST</span> /api/avisos/agendar - Agendar aviso</div>
                <div class="api-item"><span class="method">GET</span> /api/avisos - Listar todos os avisos</div>
                <div class="api-item"><span class="method">PUT</span> /api/avisos/:id - Atualizar aviso</div>
                <div class="api-item"><span class="method">DELETE</span> /api/avisos/:id - Excluir aviso</div>
                <div class="api-item"><span class="method">GET</span> /api/ubs - Listar UBS</div>
                <div class="api-item"><span class="method">GET</span> /api/avisos/estatisticas - Estatísticas</div>
            </div>
        </div>

        <script>
            function showResponse(elementId, data) {
                const element = document.getElementById(elementId);
                element.textContent = JSON.stringify(data, null, 2);
                element.style.display = 'block';
            }

            async function testarSistema() {
                try {
                    const response = await fetch('/api/avisos/teste');
                    const data = await response.json();
                    showResponse('teste-response', data);
                } catch (error) {
                    showResponse('teste-response', { error: error.message });
                }
            }

            async function criarExemplos() {
                try {
                    const response = await fetch('/api/avisos/criar-exemplos', { method: 'POST' });
                    const data = await response.json();
                    showResponse('exemplos-response', data);
                } catch (error) {
                    showResponse('exemplos-response', { error: error.message });
                }
            }

            async function verAvisosAtivos() {
                try {
                    const response = await fetch('/api/avisos/ativos');
                    const data = await response.json();
                    showResponse('ativos-response', data);
                } catch (error) {
                    showResponse('ativos-response', { error: error.message });
                }
            }

            async function verAvisosPorUBS(ubsId) {
                try {
                    const response = await fetch('/api/tv/avisos/' + ubsId);
                    const data = await response.json();
                    showResponse('ubs-response', data);
                } catch (error) {
                    showResponse('ubs-response', { error: error.message });
                }
            }

            async function verEstatisticas() {
                try {
                    const response = await fetch('/api/avisos/estatisticas');
                    const data = await response.json();
                    showResponse('stats-response', data);
                } catch (error) {
                    showResponse('stats-response', { error: error.message });
                }
            }

            async function criarAvisoUrgente() {
                try {
                    const avisoUrgente = {
                        titulo: 'URGÊNCIA - Teste Demo',
                        mensagem: 'Este é um aviso de urgência criado pela demonstração.\\nHorário: ' + new Date().toLocaleTimeString(),
                        tipo: 'urgencia',
                        prioridade: 5,
                        ativo: true
                    };
                    
                    const response = await fetch('/api/avisos', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(avisoUrgente)
                    });
                    
                    const data = await response.json();
                    showResponse('urgente-response', data);
                } catch (error) {
                    showResponse('urgente-response', { error: error.message });
                }
            }
        </script>
    </body>
    </html>
  `);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🚀 Demonstração rodando em: http://localhost:${PORT}`);
  console.log(`📺 Acesse no navegador para testar o sistema!`);
  console.log(`\n🎯 Funcionalidades disponíveis:`);
  console.log(`   • Criar avisos de exemplo`);
  console.log(`   • Testar todas as APIs`);
  console.log(`   • Ver avisos por UBS`);
  console.log(`   • Criar avisos urgentes`);
  console.log(`   • Ver estatísticas`);
  console.log(`\n💡 Para parar: Ctrl+C`);
});

// Criar alguns avisos iniciais após 2 segundos
setTimeout(async () => {
  console.log('\n🎨 Criando avisos iniciais de demonstração...');
  
  try {
    const response = await fetch(`http://localhost:${PORT}/api/avisos/criar-exemplos`, {
      method: 'POST'
    });
    const data = await response.json();
    console.log(`✅ ${data.avisos?.length || 0} avisos criados automaticamente!`);
  } catch (error) {
    console.log('ℹ️ Avisos serão criados quando acessar a página web');
  }
}, 2000);
