// Script para integrar o Sistema de Avisos no backend principal
// Arquivo: integrar-sistema-avisos.js

const express = require('express');
const path = require('path');
const SistemaAvisos = require('./sistema-avisos');

// Inicializar sistema de avisos
const sistemaAvisos = new SistemaAvisos();

console.log('🎯 Iniciando integração do Sistema de Avisos Interativos...');

// Função para integrar com o servidor principal
function integrarSistemaAvisos(app) {
  // Configurar rotas da API
  sistemaAvisos.setupRoutes(app);
  
  // Rota de teste
  app.get('/api/avisos/teste', (req, res) => {
    res.json({
      success: true,
      message: '🎯 Sistema de Avisos Interativos funcionando!',
      features: [
        '📢 Avisos por tipo (consulta, medicação, campanha, urgência)',
        '🏥 Específicos por UBS ou gerais',
        '⏰ Agendamento automático por horário',
        '📊 Estatísticas de exibição',
        '🎨 Interface visual interativa',
        '⭐ Sistema de prioridades',
        '📱 Responsivo para todas as telas'
      ],
      tipos_disponiveis: [
        { tipo: 'consulta', icon: '👨‍⚕️', exemplo: 'Dr. João - Clínico às 14:30' },
        { tipo: 'medicacao', icon: '💊', exemplo: 'Dipirona disponível na farmácia' },
        { tipo: 'campanha', icon: '📢', exemplo: 'Vacinação contra gripe até sexta' },
        { tipo: 'urgencia', icon: '🚨', exemplo: 'Atenção: Emergência no prédio' },
        { tipo: 'informativo', icon: 'ℹ️', exemplo: 'Horário: Segunda a Sexta 7h-17h' },
        { tipo: 'horario', icon: '🕐', exemplo: 'Pausa para almoço 12h-13h' },
        { tipo: 'evento', icon: '🎪', exemplo: 'Palestra sobre diabetes amanhã' }
      ]
    });
  });

  // Rota para criar avisos de exemplo
  app.post('/api/avisos/criar-exemplos', async (req, res) => {
    try {
      const avisosExemplo = [
        {
          titulo: 'Consulta Urgente',
          mensagem: 'Dr. Carlos - Cardiologia às 15:30\nPaciente: Maria Silva',
          tipo: 'consulta',
          ubs_id: null,
          prioridade: 4,
          horario_inicio: '15:00',
          horario_fim: '16:00'
        },
        {
          titulo: 'Medicamentos Disponíveis',
          mensagem: 'Paracetamol 500mg\nDipirona 500mg\nIbuprofeno 400mg\n\nRetirar na farmácia com receita',
          tipo: 'medicacao',
          ubs_id: null,
          prioridade: 2
        },
        {
          titulo: 'Campanha de Vacinação COVID-19',
          mensagem: 'ATENÇÃO: Vacinação contra COVID-19\n4ª dose para idosos acima de 60 anos\nDe segunda a sexta até 31/08',
          tipo: 'campanha',
          ubs_id: null,
          prioridade: 5,
          data_fim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          titulo: 'Aviso de Emergência',
          mensagem: 'URGENTE: Sistema de elevador em manutenção\nUtilizar escadas\nPrevisão: 2 horas',
          tipo: 'urgencia',
          ubs_id: null,
          prioridade: 5,
          data_fim: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        },
        {
          titulo: 'Horário de Funcionamento',
          mensagem: 'Segunda a Sexta: 7h às 17h\nSábado: 7h às 12h\nDomingo: Fechado\n\nEmergências: Hospital Municipal',
          tipo: 'horario',
          ubs_id: null,
          prioridade: 1
        },
        {
          titulo: 'Palestra sobre Diabetes',
          mensagem: 'Amanhã às 14h no auditório\n"Prevenção e Cuidados com o Diabetes"\nDra. Ana Beatriz - Endocrinologista\n\nInscrições na recepção',
          tipo: 'evento',
          ubs_id: null,
          prioridade: 3,
          horario_inicio: '13:30',
          horario_fim: '15:30'
        },
        {
          titulo: 'Informações Importantes',
          mensagem: 'Lembrete:\n• Trazer documento com foto\n• Cartão SUS atualizado\n• Chegar 15min antes da consulta\n• Máscara obrigatória',
          tipo: 'informativo',
          ubs_id: null,
          prioridade: 2
        }
      ];

      const avisosCriados = [];
      for (const avisoData of avisosExemplo) {
        const aviso = await sistemaAvisos.criarAviso(avisoData);
        avisosCriados.push(aviso);
      }

      res.json({
        success: true,
        message: `✅ ${avisosCriados.length} avisos de exemplo criados!`,
        avisos: avisosCriados
      });

    } catch (error) {
      console.error('❌ Erro ao criar avisos de exemplo:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Rota para obter avisos formatados para a TV
  app.get('/api/tv/avisos/:ubsId?', async (req, res) => {
    try {
      const ubsId = req.params.ubsId;
      const avisos = await sistemaAvisos.obterAvisosParaTV(ubsId);
      
      res.json({
        success: true,
        total: avisos.length,
        ubs_id: ubsId || 'todas',
        avisos: avisos,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Erro ao obter avisos para TV:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Rota para agendamento manual de avisos
  app.post('/api/avisos/agendar', (req, res) => {
    try {
      const { titulo, mensagem, tipo, ubsId, horario, duracao } = req.body;
      
      sistemaAvisos.agendarAviso(titulo, mensagem, tipo, ubsId, horario, duracao);
      
      res.json({
        success: true,
        message: `⏰ Aviso "${titulo}" agendado para ${horario}`,
        agendamento: {
          titulo,
          mensagem,
          tipo,
          ubsId,
          horario,
          duracao
        }
      });
    } catch (error) {
      console.error('❌ Erro ao agendar aviso:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Middleware para servir arquivos estáticos dos componentes
  app.use('/avisos-components', express.static(path.join(__dirname, '../frontend-tv/src/components')));
  app.use('/avisos-admin', express.static(path.join(__dirname, '../dashboard-admin/src/components')));

  console.log('✅ Sistema de Avisos Interativos integrado com sucesso!');
  console.log('📋 Rotas disponíveis:');
  console.log('   GET  /api/avisos/teste - Teste do sistema');
  console.log('   GET  /api/avisos/ativos/:ubsId? - Avisos ativos');
  console.log('   GET  /api/tv/avisos/:ubsId? - Avisos para TV');
  console.log('   POST /api/avisos - Criar novo aviso');
  console.log('   POST /api/avisos/criar-exemplos - Criar avisos de exemplo');
  console.log('   POST /api/avisos/agendar - Agendar aviso');
  console.log('   GET  /api/avisos - Listar todos os avisos');
  console.log('   PUT  /api/avisos/:id - Atualizar aviso');
  console.log('   DELETE /api/avisos/:id - Excluir aviso');
  console.log('   GET  /api/ubs - Listar UBS');
  console.log('   GET  /api/avisos/estatisticas - Estatísticas');

  return sistemaAvisos;
}

// Função para testar o sistema
async function testarSistema() {
  console.log('\n🧪 Executando testes do sistema...');
  
  try {
    // Teste 1: Criar aviso de teste
    const avisoTeste = await sistemaAvisos.criarAviso({
      titulo: 'Teste do Sistema',
      mensagem: 'Este é um aviso de teste do sistema de avisos interativos!',
      tipo: 'informativo',
      prioridade: 2
    });
    console.log('✅ Teste 1: Criação de aviso - PASSOU');

    // Teste 2: Buscar avisos ativos
    const avisosAtivos = await sistemaAvisos.obterAvisosParaTV();
    console.log(`✅ Teste 2: Busca de avisos ativos (${avisosAtivos.length} encontrados) - PASSOU`);

    // Teste 3: Registrar exibição
    if (avisosAtivos.length > 0) {
      await sistemaAvisos.registrarExibicao(avisosAtivos[0].id, 'ubs-teste', 5000);
      console.log('✅ Teste 3: Registro de exibição - PASSOU');
    }

    // Teste 4: Obter estatísticas
    const stats = await sistemaAvisos.obterEstatisticas();
    console.log(`✅ Teste 4: Estatísticas (${stats.length} registros) - PASSOU`);

    console.log('\n🎉 Todos os testes passaram com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

// Função principal
async function main() {
  console.log('🚀 Iniciando Sistema de Avisos Interativos...');
  
  // Se executado diretamente, rodar testes
  if (require.main === module) {
    await testarSistema();
    
    console.log('\n📖 Como usar no seu servidor principal:');
    console.log('```javascript');
    console.log('const integrarSistemaAvisos = require("./integrar-sistema-avisos");');
    console.log('const sistemaAvisos = integrarSistemaAvisos(app);');
    console.log('```');
    
    console.log('\n🎨 Para usar no Frontend (React):');
    console.log('```jsx');
    console.log('import AvisosInterativos from "./components/AvisosInterativos";');
    console.log('// No componente principal da TV:');
    console.log('<AvisosInterativos ubsId="ubs-centro" />');
    console.log('```');
    
    console.log('\n⚙️ Para gerenciar no Dashboard:');
    console.log('```jsx');
    console.log('import GerenciadorAvisos from "./components/GerenciadorAvisos";');
    console.log('// Na página de admin:');
    console.log('<GerenciadorAvisos />');
    console.log('```');
  }
}

// Exportar funções
module.exports = {
  integrarSistemaAvisos,
  SistemaAvisos,
  testarSistema
};

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}
