# 📢 Sistema de Mensagens em Tempo Real - TV Saúde

## 🎯 Visão Geral

O sistema de mensagens em tempo real permite enviar avisos, informações e alertas que aparecem instantaneamente em todas as TVs da rede. As mensagens são exibidas sobre os vídeos e rotacionam automaticamente.

## 🚀 Como Usar

### 1. **Acessar o Gerenciador de Mensagens**

1. Abra o Dashboard Admin: `http://10.0.50.79:3002` (ou localhost:3002)
2. No menu lateral, clique em **"📢 Mensagens"**

### 2. **Criar Nova Mensagem**

1. Clique no botão **"📢 Nova Mensagem"**
2. Preencha os campos:
   - **Título**: Título da mensagem (obrigatório)
   - **Conteúdo**: Texto da mensagem (obrigatório)
   - **Tipo**: Escolha o tipo visual da mensagem
   - **Prioridade**: Define a ordem de exibição (1-4)
   - **Data de Expiração**: Quando a mensagem deve parar de aparecer (opcional)

### 3. **Tipos de Mensagem**

| Tipo | Ícone | Cor | Uso Recomendado |
|------|-------|-----|-----------------|
| **Informação** | ℹ️ | Azul | Avisos gerais, informações |
| **Sucesso** | ✅ | Verde | Confirmações, boas notícias |
| **Aviso** | ⚠️ | Amarelo | Alertas importantes |
| **Erro** | ❌ | Vermelho | Problemas, falhas |
| **Urgente** | 🚨 | Vermelho Escuro | Emergências, alertas críticos |

### 4. **Níveis de Prioridade**

- **1 - Baixa**: Informações gerais
- **2 - Normal**: Avisos importantes
- **3 - Alta**: Alertas urgentes
- **4 - Crítica**: Emergências

*Mensagens com prioridade maior aparecem primeiro*

## 📺 Como Aparecem nas TVs

### **Exibição Automática**
- Mensagens aparecem automaticamente em todas as TVs
- Localização: Parte superior da tela, sobre o vídeo
- Rotação: A cada 5 segundos (se houver múltiplas mensagens)
- Atualização: Novas mensagens aparecem em até 10 segundos

### **Visual na TV**
```
┌─────────────────────────────────────────┐
│ 🚨 ATENÇÃO - Manutenção Programada      │
│ O sistema ficará indisponível das       │
│ 14h às 16h para manutenção.             │
│ ● ○ ○  Prioridade 4    1/3              │
└─────────────────────────────────────────┘
```

## ⚙️ Gerenciamento de Mensagens

### **Ações Disponíveis**

1. **✏️ Editar**: Modificar título, conteúdo, tipo, etc.
2. **🟢/⚫ Ativar/Desativar**: Controlar se a mensagem aparece nas TVs
3. **🗑️ Deletar**: Remover permanentemente a mensagem

### **Status das Mensagens**

- **🟢 Ativa**: Aparece nas TVs
- **⚫ Inativa**: Não aparece nas TVs
- **⏰ Expirada**: Passou da data de expiração (removida automaticamente)

## 📋 Exemplos Práticos

### **1. Aviso de Manutenção**
```
Título: Manutenção Programada
Conteúdo: O sistema ficará indisponível das 14h às 16h para manutenção.
Tipo: Aviso (⚠️)
Prioridade: 3 - Alta
Data de Expiração: [Data da manutenção + 1 dia]
```

### **2. Campanha de Vacinação**
```
Título: Campanha de Vacinação
Conteúdo: Vacina contra gripe disponível. Procure a recepção.
Tipo: Informação (ℹ️)
Prioridade: 2 - Normal
Data de Expiração: [Final da campanha]
```

### **3. Emergência**
```
Título: EMERGÊNCIA
Conteúdo: Evacuação imediata do prédio. Siga as orientações da equipe.
Tipo: Urgente (🚨)
Prioridade: 4 - Crítica
Data de Expiração: [Não definir - permanente até remoção manual]
```

### **4. Parabéns**
```
Título: Parabéns Equipe!
Conteúdo: Nosso posto foi reconhecido como referência em atendimento.
Tipo: Sucesso (✅)
Prioridade: 1 - Baixa
Data de Expiração: [1 semana]
```

## 🔧 Funcionalidades Técnicas

### **Atualizações Automáticas**
- **Backend**: Verifica mensagens ativas a cada consulta
- **TVs**: Buscam novas mensagens a cada 10 segundos
- **Rotação**: Mensagens múltiplas rotacionam a cada 5 segundos

### **Filtragem Inteligente**
- Apenas mensagens **ativas** aparecem
- Mensagens **expiradas** são removidas automaticamente
- Ordenação por **prioridade** (maior primeiro) e **data de criação**

### **Responsividade**
- Funciona em qualquer IP da rede
- Configuração dinâmica (localhost ou IP de rede)
- Compatível com proxy corporativo

## 📊 Monitoramento

### **Indicadores na TV**
- **📢 X Mensagem(s)**: Mostra quantas mensagens estão ativas
- **Pontos de rotação**: Indicam mensagem atual (● ○ ○)
- **Contador**: Mostra posição atual (1/3)

### **Dashboard Admin**
- **Lista completa**: Todas as mensagens (ativas e inativas)
- **Status visual**: Cores indicam se está ativa ou inativa
- **Informações**: Data de criação, expiração, prioridade

## 🎯 Dicas de Uso

### **✅ Boas Práticas**
- Use títulos **curtos e claros**
- Conteúdo **objetivo e direto**
- Defina **data de expiração** para mensagens temporárias
- Use **prioridades adequadas** (não abuse da prioridade 4)
- **Teste** a mensagem antes de ativar

### **❌ Evite**
- Mensagens muito longas (podem não caber na tela)
- Muitas mensagens simultâneas (confunde o usuário)
- Deixar mensagens antigas ativas
- Usar prioridade crítica para informações normais

## 🔄 Fluxo de Trabalho Recomendado

1. **Criar** a mensagem com status inativo
2. **Revisar** o conteúdo e configurações
3. **Ativar** a mensagem
4. **Monitorar** se aparece nas TVs (até 10 segundos)
5. **Desativar/Deletar** quando não precisar mais

## 🆘 Solução de Problemas

### **Mensagem não aparece na TV**
- Verifique se está **ativa** (🟢)
- Confirme se não **expirou**
- Aguarde até **10 segundos** para sincronização
- Verifique conexão de rede da TV

### **Mensagem não some da TV**
- Verifique se foi **desativada** no dashboard
- Aguarde **10 segundos** para sincronização
- Se persistir, use o controle remoto para **recarregar**

### **Múltiplas mensagens não rotacionam**
- Rotação automática a cada **5 segundos**
- Verifique se há **múltiplas mensagens ativas**
- Pontos indicadores mostram a rotação (● ○ ○)

---

## 🎉 Resultado Final

Com o sistema de mensagens em tempo real, você pode:

- ✅ **Comunicar instantaneamente** com todos os dispositivos
- ✅ **Priorizar mensagens** por importância
- ✅ **Agendar expiração** automática
- ✅ **Gerenciar facilmente** via dashboard web
- ✅ **Monitorar status** em tempo real
- ✅ **Funcionar em qualquer IP** da rede

**O sistema está pronto para uso!** 🚀
