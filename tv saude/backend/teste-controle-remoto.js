const axios = require('axios');

const API_BASE_URL = 'http://10.0.50.79:3001/api';

// Lista de comandos para testar
const comandos = [
  { comando: 'play', descricao: 'Reproduzir' },
  { comando: 'pause', descricao: 'Pausar' },
  { comando: 'next', descricao: 'Próximo vídeo' },
  { comando: 'previous', descricao: 'Vídeo anterior' },
  { comando: 'restart', descricao: 'Reiniciar vídeo' },
  { comando: 'volume_up', descricao: 'Aumentar volume' },
  { comando: 'volume_down', descricao: 'Diminuir volume' },
  { comando: 'mute', descricao: 'Mute/Unmute' },
  { comando: 'reload_playlist', descricao: 'Recarregar playlist' },
  { comando: 'refresh', descricao: 'Atualizar TV' }
];

// Fazer login e obter token
async function obterToken() {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@tvsaude.com',
      senha: 'admin123'
    });
    return response.data.token;
  } catch (error) {
    console.error('❌ Erro ao fazer login:', error.response?.data || error.message);
    return null;
  }
}

async function testarComando(comando, descricao, token) {
  try {
    console.log(`\n🧪 Testando: ${descricao} (${comando})`);
    
    const response = await axios.post(`${API_BASE_URL}/controle`, {
      comando: comando,
      parametros: null
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`✅ Comando "${comando}" enviado com sucesso!`);
    
    // Aguardar um pouco para o comando ser processado
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verificar se o comando foi processado
    const ultimoComando = await axios.get(`${API_BASE_URL}/controle/ultimo`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (ultimoComando.data && ultimoComando.data.comando === comando) {
      console.log(`✅ Comando "${comando}" confirmado na TV`);
    } else {
      console.log(`⚠️ Comando "${comando}" pode não ter sido processado`);
    }
    
  } catch (error) {
    console.error(`❌ Erro ao testar comando "${comando}":`, error.response?.data || error.message);
  }
}

async function testarTodosOsComandos() {
  console.log('🎮 TESTE AUTOMÁTICO DO CONTROLE REMOTO');
  console.log('=====================================');
  console.log('📺 TV deve estar rodando em: http://10.0.50.79:3003');
  console.log('🎛️ Dashboard deve estar em: http://10.0.50.79:3002/controle');
  
  console.log('\n🔐 Fazendo login...');
  const token = await obterToken();
  if (!token) {
    console.error('❌ Não foi possível obter token de acesso');
    return;
  }
  console.log('✅ Login realizado com sucesso!');
  
  console.log('\nIniciando testes em 3 segundos...\n');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  for (const { comando, descricao } of comandos) {
    await testarComando(comando, descricao, token);
  }
  
  console.log('\n🏁 TESTE CONCLUÍDO!');
  console.log('✅ Verifique se todos os comandos funcionaram na TV');
  console.log('📊 Se algum comando não funcionou, ele deve aparecer como "⚠️ Comando desconhecido" no console da TV');
}

// Executar o teste
testarTodosOsComandos().catch(console.error);
