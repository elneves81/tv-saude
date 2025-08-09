# 📸 Sistema de Slideshow de Imagens

## ✨ **Nova Funcionalidade Implementada**

Sistema completo para exibir imagens com animação na interface TV, permitindo aos administradores gerenciar um slideshow de imagens que aparece no canto inferior direito da tela.

## 🎯 **Funcionalidades**

### 📺 **Interface TV (Frontend)**
- **Slideshow automático** de imagens no canto inferior direito
- **Animações suaves** entre transições
- **Duração configurável** para cada imagem
- **Informações sobrepostas** (título e descrição)
- **Indicadores de progresso** com pontos e contador
- **Responsivo** e elegante

### 🛠️ **Dashboard Administrativo**
- **Upload de imagens** (JPG, PNG, GIF, etc.)
- **Gerenciamento completo** (adicionar, editar, deletar)
- **Preview em tempo real** das imagens
- **Configuração de duração** individual por imagem
- **Sistema de ordenação** das imagens
- **Ativar/Desativar** imagens individualmente

## 📋 **Estrutura do Banco de Dados**

### Tabela: `imagens_slideshow`
```sql
CREATE TABLE imagens_slideshow (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,              -- Título da imagem
  descricao TEXT,                    -- Descrição opcional
  arquivo TEXT NOT NULL,             -- Nome do arquivo
  ativo BOOLEAN DEFAULT 1,           -- Se está ativa ou não
  ordem INTEGER DEFAULT 0,           -- Ordem de exibição
  duracao INTEGER DEFAULT 5000,      -- Duração em millisegundos
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  criado_por INTEGER,                -- ID do usuário que criou
  FOREIGN KEY (criado_por) REFERENCES usuarios (id)
);
```

## 🚀 **Como Usar**

### 1. **Acessar o Dashboard**
- Login no dashboard: `http://10.0.50.79:3002/`
- Ir para **"📸 Imagens"** no menu lateral

### 2. **Adicionar Nova Imagem**
1. Clique em **"Adicionar Nova Imagem"**
2. Selecione o arquivo de imagem
3. Preencha:
   - **Título**: Nome da imagem (obrigatório)
   - **Descrição**: Texto explicativo (opcional)
   - **Duração**: Tempo de exibição em millisegundos
   - **Ordem**: Posição no slideshow
4. Clique em **"Adicionar"**

### 3. **Gerenciar Imagens**
- **✏️ Editar**: Alterar informações da imagem
- **🔄 Ativar/Desativar**: Controlar visibilidade
- **🗑️ Deletar**: Remover imagem permanentemente

## 🎨 **Configurações Visuais**

### **Posicionamento**
- **Localização**: Canto inferior direito da tela
- **Tamanho**: 320x240 pixels (80x60 em Tailwind)
- **Estilo**: Bordas arredondadas com sombra

### **Animações**
- **Transição**: Fade suave (1 segundo)
- **Overlay**: Gradiente escuro na parte inferior
- **Indicadores**: Pontos com animação de transição

### **Responsive Design**
- Adapta-se automaticamente ao tamanho da tela
- Mantém proporções das imagens
- Interface elegante e profissional

## 📁 **Estrutura de Arquivos**

```
tv-saude/
├── backend/
│   └── server.js              ← Rotas da API de imagens
├── images/                    ← Pasta para armazenar imagens
├── frontend-tv/
│   └── src/
│       └── App.jsx           ← Componente de slideshow
└── dashboard-admin/
    └── src/
        ├── pages/
        │   └── ImageManager.jsx  ← Página de gerenciamento
        ├── components/
        │   └── Sidebar.jsx       ← Menu lateral atualizado
        └── App.jsx               ← Rotas atualizadas
```

## 🔌 **Endpoints da API**

### **Públicos (Para TV)**
- `GET /api/imagens` - Listar imagens ativas

### **Administrativos (Protegidos)**
- `GET /api/admin/imagens` - Listar todas as imagens
- `POST /api/admin/imagens` - Adicionar nova imagem
- `PUT /api/admin/imagens/:id` - Atualizar imagem
- `DELETE /api/admin/imagens/:id` - Deletar imagem

### **Arquivos Estáticos**
- `GET /images/:filename` - Servir arquivos de imagem

## ⚡ **Performance**

### **Otimizações Implementadas**
- **Lazy Loading**: Imagens carregadas apenas quando necessário
- **Error Handling**: Fallback para imagens com erro
- **Cache Inteligente**: Reutilização de imagens carregadas
- **Intervalo Eficiente**: Busca novas imagens a cada 30 segundos

### **Limites de Upload**
- **Tamanho máximo**: 10MB por imagem
- **Formatos suportados**: JPG, PNG, GIF, WEBP
- **Validação automática**: Apenas arquivos de imagem

## 🛡️ **Segurança**

- **Autenticação JWT** para todas as operações administrativas
- **Validação de tipo de arquivo** no upload
- **Sanitização de nomes** de arquivo
- **Controle de acesso** baseado em roles

## 🎯 **Casos de Uso**

### **Informações de Saúde**
- Campanhas de vacinação
- Dicas de prevenção
- Horários de funcionamento
- Novos serviços

### **Avisos e Comunicados**
- Mudanças de horário
- Eventos especiais
- Orientações importantes
- Contatos de emergência

### **Materiais Educativos**
- Infográficos de saúde
- Guias de prevenção
- Procedimentos médicos
- Alimentação saudável

## 📊 **Métricas de Exibição**

### **Configurações Padrão**
- **Duração padrão**: 5 segundos por imagem
- **Intervalo de atualização**: 30 segundos
- **Máximo recomendado**: 10-15 imagens para melhor performance

### **Personalização**
- Duração individual por imagem (1-60 segundos)
- Ordem personalizada de exibição
- Ativação/desativação seletiva

---

## ✅ **Status de Implementação**

- ✅ **Backend**: API completa implementada
- ✅ **Frontend TV**: Slideshow funcionando
- ✅ **Dashboard**: Página de gerenciamento completa
- ✅ **Banco de Dados**: Tabela criada e configurada
- ✅ **Upload**: Sistema de upload funcional
- ✅ **Validação**: Segurança e validações ativas

**Data de Implementação**: 09/08/2025  
**Status**: ✅ **FUNCIONAL E PRONTO PARA USO**  
**Versão**: v3.0.0
