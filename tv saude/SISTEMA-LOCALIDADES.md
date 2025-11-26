# 🌍 Sistema de Localidades - TV Saúde

## Visão Geral

O Sistema de Localidades permite que diferentes TVs exibam conteúdo específico baseado em sua localização na rede MPLS. Cada localidade pode ter suas próprias playlists e vídeos, permitindo personalização do conteúdo por unidade de saúde.

## 🏗️ Arquitetura

### Tabelas do Banco de Dados

1. **`localidades`** - Cadastro das localidades
   - `id`, `nome`, `descricao`, `ativo`, `data_criacao`, `criado_por`

2. **`localidade_ips`** - IPs associados a cada localidade
   - `id`, `localidade_id`, `ip_address`, `ip_range`, `descricao`, `ativo`

3. **`localidade_playlists`** - Playlists específicas por localidade
   - `id`, `localidade_id`, `playlist_id`, `prioridade`, `ativo`

4. **`localidade_videos`** - Vídeos específicos por localidade (sem playlist)
   - `id`, `localidade_id`, `video_id`, `prioridade`, `ativo`

### Fluxo de Funcionamento

```
1. TV faz requisição → Backend detecta IP da TV
2. Backend consulta tabela localidade_ips → Identifica localidade
3. Backend busca conteúdo específico da localidade:
   - Playlists associadas (localidade_playlists)
   - Vídeos específicos (localidade_videos)
4. TV recebe conteúdo personalizado para sua localidade
```

## 🔧 Configuração de IPs

### Formatos Suportados

1. **IP Específico**: `192.168.1.100`
2. **CIDR**: `192.168.1.0/24`
3. **Range**: `192.168.1.1-192.168.1.100`

### Exemplos de Configuração

```javascript
// Posto Central
IP: 192.168.1.0/24
Descrição: "Posto Central - Rede principal"

// Posto Bairro A
IP: 192.168.2.100
Descrição: "Posto Bairro A - TV da recepção"

// Posto Bairro B
IP: 192.168.3.1-192.168.3.50
Descrição: "Posto Bairro B - Todas as TVs"
```

## 📺 API Endpoints

### Públicos (para TVs)

- `GET /api/localidades/conteudo` - Retorna conteúdo baseado no IP da TV

### Administrativos (autenticados)

- `GET /api/localidades` - Listar localidades
- `POST /api/localidades` - Criar localidade
- `PUT /api/localidades/:id` - Atualizar localidade
- `DELETE /api/localidades/:id` - Deletar localidade
- `POST /api/localidades/:id/ips` - Adicionar IP à localidade
- `DELETE /api/localidades/:id/ips/:ip_id` - Remover IP da localidade
- `POST /api/localidades/:id/playlists` - Associar playlist à localidade
- `DELETE /api/localidades/:id/playlists/:playlist_id` - Remover playlist da localidade

## 🎯 Lógica de Priorização

### Ordem de Busca de Conteúdo

1. **Playlists da Localidade** (maior prioridade primeiro)
2. **Vídeos Específicos da Localidade** (se não há playlists)
3. **Playlist Ativa Global** (fallback)
4. **Todos os Vídeos Ativos** (fallback final)

### Sistema de Fallback

```javascript
// Pseudocódigo da lógica
if (localidade_detectada) {
  if (localidade.playlists.length > 0) {
    return playlist_com_maior_prioridade;
  } else if (localidade.videos.length > 0) {
    return videos_especificos_da_localidade;
  }
}

// Fallback para conteúdo global
if (playlist_ativa_global) {
  return playlist_ativa_global;
} else {
  return todos_videos_ativos;
}
```

## 🖥️ Interface Administrativa

### Página de Localidades (`/localidades`)

**Funcionalidades:**
- ✅ Criar/editar/deletar localidades
- ✅ Gerenciar IPs por localidade
- ✅ Associar playlists às localidades
- ✅ Definir prioridades
- ✅ Ativar/desativar localidades

**Modais:**
- **Modal de Localidade**: Criar/editar dados básicos
- **Modal de IPs**: Gerenciar IPs e faixas de rede
- **Modal de Playlists**: Associar playlists com prioridades

## 🔍 Detecção de IP

### Fontes de IP Consultadas

```javascript
const clientIp = req.ip || 
                 req.connection.remoteAddress || 
                 req.socket.remoteAddress || 
                 req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                 req.headers['x-real-ip'] ||
                 '127.0.0.1';
```

### Algoritmo de Matching

```javascript
// CIDR (192.168.1.0/24)
if (range.includes('/')) {
  const [network, prefixLength] = range.split('/');
  // Comparação binária com máscara de rede
}

// Range (192.168.1.1-192.168.1.100)
if (range.includes('-')) {
  const [startIp, endIp] = range.split('-');
  // Verificação se IP está no intervalo
}

// IP exato
return ip === range;
```

## 📊 Logs e Monitoramento

### Logs do Frontend TV

```javascript
console.log(`🌍 Localidade detectada: ${localidade.nome} (IP: ${ip_cliente})`);
console.log(`📺 Carregando ${videos.length} vídeos específicos da localidade`);
```

### Logs do Backend

```javascript
console.log(`🌍 Detectando localidade para IP: ${clientIp}`);
console.log(`📍 Localidade detectada: ${localidade.nome}`);
```

## 🚀 Casos de Uso

### Cenário 1: Posto com Conteúdo Específico
- **Localidade**: "Posto Central"
- **IP**: `192.168.1.0/24`
- **Playlist**: "Educação Diabetes" (prioridade 1)
- **Resultado**: TVs do Posto Central exibem apenas vídeos sobre diabetes

### Cenário 2: Posto com Múltiplas Playlists
- **Localidade**: "Posto Materno-Infantil"
- **IP**: `192.168.2.100`
- **Playlists**: 
  - "Saúde da Mulher" (prioridade 3)
  - "Saúde Infantil" (prioridade 2)
  - "Vacinação" (prioridade 1)
- **Resultado**: TV exibe playlist "Vacinação" (maior prioridade)

### Cenário 3: TV sem Localidade Específica
- **IP**: `192.168.99.100` (não cadastrado)
- **Resultado**: TV exibe playlist ativa global ou todos os vídeos ativos

## 🔧 Configuração para MPLS

### Exemplo de Configuração de Rede

```
Sede Principal: 192.168.0.0/16
├── Posto Central: 192.168.1.0/24
├── Posto Norte: 192.168.2.0/24
├── Posto Sul: 192.168.3.0/24
├── Posto Leste: 192.168.4.0/24
└── Posto Oeste: 192.168.5.0/24
```

### Configuração no Sistema

1. **Criar Localidades** para cada posto
2. **Configurar IPs/Ranges** para cada localidade
3. **Criar Playlists Específicas** por especialidade
4. **Associar Playlists** às localidades com prioridades
5. **Testar** acessando de diferentes IPs

## 🛠️ Manutenção

### Comandos Úteis

```bash
# Verificar detecção de localidade
curl http://localhost:3001/api/localidades/conteudo

# Listar localidades (com token)
curl -H "Authorization: Bearer TOKEN" http://localhost:3001/api/localidades
```

### Troubleshooting

1. **TV não detecta localidade**:
   - Verificar se IP está cadastrado
   - Verificar se localidade está ativa
   - Verificar logs do backend

2. **Conteúdo errado sendo exibido**:
   - Verificar prioridades das playlists
   - Verificar se playlists estão ativas
   - Verificar associações localidade-playlist

3. **Fallback não funciona**:
   - Verificar se há playlist ativa global
   - Verificar se há vídeos ativos no sistema

## 📈 Benefícios

- ✅ **Personalização** por unidade de saúde
- ✅ **Gestão centralizada** via dashboard
- ✅ **Fallback automático** para conteúdo global
- ✅ **Flexibilidade** de configuração de IPs
- ✅ **Priorização** de conteúdo
- ✅ **Logs detalhados** para monitoramento
- ✅ **Interface intuitiva** para administradores

---

**Versão**: 1.0.0  
**Data**: Janeiro 2025  
**Compatível com**: TV Saúde v1.0.0+
