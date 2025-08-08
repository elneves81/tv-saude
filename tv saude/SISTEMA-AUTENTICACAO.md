# Sistema de Autenticação - TV Saúde

## 📋 Visão Geral

O sistema TV Saúde agora possui um sistema completo de autenticação com controle de usuários e permissões.

## 🔐 Funcionalidades Implementadas

### Backend (API)
- ✅ **Autenticação JWT**: Tokens seguros com expiração de 24 horas
- ✅ **Criptografia de senhas**: Usando bcryptjs com salt
- ✅ **Middleware de proteção**: Rotas protegidas por autenticação
- ✅ **Controle de permissões**: Diferenciação entre Admin e Operador
- ✅ **Tabela de usuários**: SQLite com campos completos
- ✅ **Rastreamento de atividade**: Último login e auditoria

### Frontend (Dashboard Admin)
- ✅ **Tela de login**: Interface moderna e responsiva
- ✅ **Contexto de autenticação**: Gerenciamento global de estado
- ✅ **Proteção de rotas**: Redirecionamento automático para login
- ✅ **Gerenciamento de usuários**: CRUD completo (apenas admins)
- ✅ **Logout seguro**: Limpeza de tokens e redirecionamento

### Interface TV (Público)
- ✅ **Acesso livre**: Não requer autenticação
- ✅ **APIs públicas**: Vídeos e mensagens acessíveis sem login

## 👥 Tipos de Usuário

### Administrador
- **Permissões**: Acesso total ao sistema
- **Funcionalidades**:
  - Gerenciar usuários (criar, editar, deletar)
  - Gerenciar vídeos e playlists
  - Gerenciar mensagens
  - Controle remoto das TVs
  - Configurações do sistema

### Operador
- **Permissões**: Acesso limitado
- **Funcionalidades**:
  - Gerenciar vídeos e playlists
  - Gerenciar mensagens
  - Controle remoto das TVs
  - **Não pode**: Gerenciar usuários

## 🚀 Credenciais Padrão

### Usuário Administrador
- **Email**: `admin@tvsaude.com`
- **Senha**: `admin123`
- **Tipo**: Administrador

> ⚠️ **IMPORTANTE**: Altere a senha padrão após o primeiro acesso!

## 🔧 Configuração Técnica

### Variáveis de Ambiente
```bash
JWT_SECRET=tv-saude-secret-key-2024
PORT=3001
```

### Estrutura do Token JWT
```json
{
  "id": 1,
  "email": "admin@tvsaude.com",
  "nome": "Administrador",
  "tipo": "admin",
  "exp": 1234567890
}
```

### Headers de Autenticação
```
Authorization: Bearer <token_jwt>
```

## 📊 Tabela de Usuários

```sql
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  tipo TEXT DEFAULT 'operador' CHECK(tipo IN ('admin', 'operador')),
  ativo BOOLEAN DEFAULT 1,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  ultimo_login DATETIME
);
```

## 🛡️ Rotas Protegidas

### Rotas que Requerem Autenticação
- `POST /api/videos` - Criar vídeo
- `PUT /api/videos/:id` - Atualizar vídeo
- `DELETE /api/videos/:id` - Deletar vídeo
- `POST /api/playlists` - Criar playlist
- `PUT /api/playlists/:id` - Atualizar playlist
- `DELETE /api/playlists/:id` - Deletar playlist
- `POST /api/controle` - Enviar comando
- `POST /api/mensagens` - Criar mensagem
- `PUT /api/mensagens/:id` - Atualizar mensagem
- `DELETE /api/mensagens/:id` - Deletar mensagem

### Rotas que Requerem Admin
- `GET /api/usuarios` - Listar usuários
- `POST /api/usuarios` - Criar usuário
- `PUT /api/usuarios/:id` - Atualizar usuário
- `DELETE /api/usuarios/:id` - Deletar usuário

### Rotas Públicas (Sem Autenticação)
- `GET /api/videos` - Listar vídeos ativos
- `GET /api/playlists/ativa/videos` - Playlist ativa
- `GET /api/controle/ultimo` - Último comando
- `GET /api/mensagens` - Mensagens ativas
- `POST /api/auth/login` - Login
- `GET /api/test` - Teste da API

## 🔄 Fluxo de Autenticação

### 1. Login
```
POST /api/auth/login
{
  "email": "admin@tvsaude.com",
  "senha": "admin123"
}
```

### 2. Resposta
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nome": "Administrador",
    "email": "admin@tvsaude.com",
    "tipo": "admin",
    "ativo": true
  }
}
```

### 3. Uso do Token
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Verificação
```
GET /api/auth/verify
Authorization: Bearer <token>
```

### 5. Logout
```
POST /api/auth/logout
```

## 🎯 Recursos de Segurança

### Implementados
- ✅ **Hashing de senhas**: bcryptjs com salt
- ✅ **Tokens JWT**: Assinados e com expiração
- ✅ **Middleware de autenticação**: Verificação automática
- ✅ **Controle de permissões**: Admin vs Operador
- ✅ **Validação de entrada**: Sanitização de dados
- ✅ **CORS configurado**: Acesso controlado
- ✅ **Sessões seguras**: Configuração adequada

### Recomendações Futuras
- 🔄 **HTTPS**: Implementar SSL/TLS em produção
- 🔄 **Rate limiting**: Limitar tentativas de login
- 🔄 **2FA**: Autenticação de dois fatores
- 🔄 **Logs de auditoria**: Registro detalhado de ações
- 🔄 **Recuperação de senha**: Sistema de reset

## 📱 Interface do Usuário

### Tela de Login
- Design moderno e responsivo
- Validação de formulário
- Feedback visual de loading
- Credenciais padrão visíveis
- Mensagens de erro claras

### Dashboard Autenticado
- Sidebar com informações do usuário
- Menu contextual baseado em permissões
- Botão de logout visível
- Indicador de tipo de usuário

### Gerenciamento de Usuários
- Lista completa de usuários
- Formulário de criação/edição
- Controle de status (ativo/inativo)
- Prevenção de auto-exclusão
- Histórico de último login

## 🚨 Tratamento de Erros

### Códigos de Status
- `200` - Sucesso
- `400` - Dados inválidos
- `401` - Não autenticado
- `403` - Sem permissão
- `404` - Não encontrado
- `500` - Erro interno

### Mensagens de Erro
```json
{
  "error": "Email ou senha incorretos"
}
```

## 🔧 Manutenção

### Backup do Banco
```bash
# Fazer backup da base de dados
cp "tv saude/database/tv_saude.db" "backup_$(date +%Y%m%d).db"
```

### Logs do Sistema
- Logs de autenticação no console
- Criação de usuário admin automática
- Erros de validação registrados

## 📞 Suporte

Para dúvidas ou problemas com o sistema de autenticação:

1. Verifique as credenciais padrão
2. Confirme se o servidor backend está rodando
3. Verifique os logs do console
4. Teste as rotas da API diretamente

---

**Sistema TV Saúde - Versão 2.0 com Autenticação**  
*Guarapuava - PR*
