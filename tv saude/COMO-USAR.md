# 🚀 Como Usar o Sistema TV Saúde - Guia Rápido

## ⚡ Instalação Rápida

### Opção 1: Automática (Recomendada)
1. Execute: `install-dependencies.bat`
2. Aguarde a instalação de todas as dependências
3. Execute: `start-system.bat`

### Opção 2: Manual
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Interface TV
cd frontend-tv
npm install
npm run dev

# Terminal 3 - Dashboard Admin
cd dashboard-admin
npm install
npm run dev
```

## 🌐 Acessos do Sistema

| Componente | URL | Descrição |
|------------|-----|-----------|
| **Dashboard Admin** | http://localhost:3002 | Painel para gerenciar vídeos |
| **Interface TV** | http://localhost:3000 | Tela que será exibida na TV |
| **API Backend** | http://localhost:3001 | Servidor de dados |

## 📋 Primeiros Passos

### 1. Acessar o Dashboard
- Abra http://localhost:3002 no navegador
- Use o menu lateral para navegar

### 2. Enviar Primeiro Vídeo
- Clique em "Enviar Vídeo"
- Arraste o arquivo de vídeo ou clique para selecionar
- Preencha as informações:
  - **Título**: Nome do vídeo
  - **Categoria**: Tipo de conteúdo
  - **Descrição**: Resumo do vídeo
- Clique em "Enviar Vídeo"

### 3. Configurar a TV
- Abra http://localhost:3000 na TV ou computador conectado
- Os vídeos começarão a reproduzir automaticamente
- Para tela cheia: pressione F11

## 🎥 Formatos Suportados

✅ **Recomendados:**
- MP4 (melhor compatibilidade)
- Resolução: 1920x1080 ou menor
- Tamanho: até 500MB

✅ **Outros formatos:**
- AVI, MOV, WMV

## 🔧 Gerenciamento de Vídeos

### Ativar/Desativar Vídeos
- Acesse "Gerenciar Vídeos"
- Use os botões "Ativar/Desativar"
- Apenas vídeos ativos aparecem na TV

### Editar Informações
- Clique em "Editar" ao lado do vídeo
- Altere título, categoria ou descrição
- Salve as alterações

### Organizar por Ordem
- Use o campo "Ordem de Exibição"
- Menor número = maior prioridade
- Vídeos são reproduzidos em ordem crescente

## 📊 Categorias Disponíveis

- 🛡️ Prevenção
- 💉 Vacinação
- 🥗 Alimentação Saudável
- 🏃 Exercícios
- 🧠 Saúde Mental
- 🧼 Higiene
- 🚑 Primeiros Socorros
- 💊 Doenças Crônicas
- 👩 Saúde da Mulher
- 👴 Saúde do Idoso
- 👶 Saúde Infantil
- 📋 Geral

## 🚨 Solução de Problemas

### Vídeo não aparece na TV
1. ✅ Verifique se está ativo no dashboard
2. ✅ Confirme se o backend está rodando (porta 3001)
3. ✅ Recarregue a página da TV (F5)

### Upload não funciona
1. ✅ Verifique o tamanho do arquivo (máx. 500MB)
2. ✅ Confirme se é um arquivo de vídeo
3. ✅ Verifique se o backend está ativo

### Dashboard não carrega
1. ✅ Confirme se todos os 3 serviços estão rodando
2. ✅ Verifique se as portas não estão ocupadas
3. ✅ Limpe o cache do navegador (Ctrl+F5)

## 💡 Dicas de Uso

### Para Melhor Experiência na TV:
- Use vídeos em MP4
- Mantenha duração entre 2-10 minutos
- Use títulos claros e descritivos
- Organize por categorias

### Para Administração:
- Desative vídeos antigos em vez de deletar
- Use a ordem de exibição para priorizar conteúdo
- Monitore o espaço usado nas configurações
- Faça backup da pasta `uploads/`

## 📞 Suporte Técnico

### Verificar Status do Sistema:
- Dashboard → Configurações → "Testar Conexão"
- Verifique se todos os 3 serviços estão "Online"

### Logs de Erro:
- Abra o console do navegador (F12)
- Verifique mensagens de erro
- Reinicie os serviços se necessário

### Reiniciar Sistema:
1. Feche todas as janelas do terminal
2. Execute novamente `start-system.bat`
3. Aguarde todos os serviços iniciarem

---

## 📋 Checklist de Funcionamento

- [ ] Backend rodando na porta 3001
- [ ] Interface TV rodando na porta 3000
- [ ] Dashboard rodando na porta 3002
- [ ] Pelo menos 1 vídeo ativo no sistema
- [ ] TV configurada para tela cheia
- [ ] Reprodução automática funcionando

**✅ Sistema pronto para uso!**

---

*Sistema TV Saúde Guarapuava v1.0.0*  
*Desenvolvido para Secretaria de Saúde de Guarapuava - PR*
