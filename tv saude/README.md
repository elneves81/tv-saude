# 📺 TV Saúde Guarapuava

![Versão](https://img.shields.io/badge/versão-1.0.0-blue)
![Status](https://img.shields.io/badge/status-funcional-success)
![Node.js](https://img.shields.io/badge/node.js-6DA55F?&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?&logo=tailwind-css&logoColor=white)

Sistema de TV digital para exibição de vídeos educativos nos postos de saúde de Guarapuava - PR.

## 🎯 Sobre o Sistema

O TV Saúde é um sistema completo que permite:
- **Exibição automática** de vídeos educativos em TVs dos postos de saúde
- **Dashboard administrativo** para gerenciar conteúdo
- **Upload e organização** de vídeos por categorias
- **Controle de ativação/desativação** de conteúdo
- **Interface otimizada** para uso em TVs

## 🏗️ Arquitetura do Sistema

```
tv-saude-sistema/
├── backend/              # API Node.js + Express
├── frontend-tv/          # Interface da TV (React)
├── dashboard-admin/      # Painel administrativo (React)
├── uploads/             # Arquivos de vídeo
└── database/            # Banco SQLite
```

## 🚀 Como Executar

### 1. Instalar Dependências

**Backend:**
```bash
cd backend
npm install
```

**Frontend TV:**
```bash
cd frontend-tv
npm install
```

**Dashboard Admin:**
```bash
cd dashboard-admin
npm install
```

### 2. Instalação Automática (Recomendada)

O sistema inclui scripts para instalação fácil:

```bash
# Execute o script de instalação (instala todos os componentes de uma vez)
./install-dependencies.bat
```

### 3. Configurar Acesso de Rede (Opcional)

Para permitir acesso de outros dispositivos na rede:

```bash
# Execute como Administrador para configurar o firewall
./configurar-firewall.bat
```

### 4. Iniciar os Serviços

**Opção 1: Usando o script de inicialização**
```bash
# Inicia todos os serviços em terminais separados
./start-system.bat
```

**Opção 2: Iniciando manualmente**

**Terminal 1 - Backend (API):**
```bash
cd backend
npm run dev
```
*Servidor rodando em: http://localhost:3001*

**Terminal 2 - Interface da TV:**
```bash
cd frontend-tv
npm run dev
```
*Interface da TV em: http://localhost:3000*

**Terminal 3 - Dashboard Admin:**
```bash
cd dashboard-admin
npm run dev
```
*Dashboard em: http://localhost:3002*

## 🌐 Acesso de Rede

O sistema foi configurado para permitir acesso de qualquer dispositivo na rede local:

### URLs de Acesso Local
- **Backend API:** http://localhost:3001
- **Interface da TV:** http://localhost:3000  
- **Dashboard Admin:** http://localhost:3002

### URLs de Acesso de Rede
Substitua `[IP_DA_MAQUINA]` pelo IP mostrado no script de inicialização:
- **Backend API:** http://[IP_DA_MAQUINA]:3001
- **Interface da TV:** http://[IP_DA_MAQUINA]:3000
- **Dashboard Admin:** http://[IP_DA_MAQUINA]:3002

### Funcionalidades Disponíveis pela Rede
- ✅ Upload de vídeos de qualquer dispositivo
- ✅ Gerenciamento de playlists remotamente
- ✅ Controle remoto das TVs
- ✅ Acesso ao dashboard administrativo
- ✅ Transferência de vídeos pela rede

### Scripts de Configuração
- **`configurar-firewall.bat`**: Configura o firewall do Windows (executar como Admin)
- **`remover-firewall.bat`**: Remove as configurações do firewall (executar como Admin)

📖 **Para instruções detalhadas de acesso de rede, consulte:** `ACESSO-REDE.md`

## 📋 Como Usar

### 1. Acessar o Dashboard Administrativo
- Abra http://localhost:3002
- Use o menu lateral para navegar

### 2. Enviar Vídeos
- Clique em "Enviar Vídeo" no menu
- Arraste e solte o arquivo de vídeo ou clique para selecionar
- Preencha título, categoria e descrição
- Clique em "Enviar Vídeo"

### 3. Gerenciar Vídeos
- Acesse "Gerenciar Vídeos" no menu
- Ative/desative vídeos conforme necessário
- Edite informações clicando em "Editar"
- Delete vídeos que não são mais necessários

### 4. Visualizar na TV
- Abra http://localhost:3000 na TV ou computador conectado à TV
- Os vídeos ativos serão reproduzidos automaticamente em loop
- A interface mostra informações do vídeo e horário atual

## 🎥 Formatos de Vídeo Suportados

- **MP4** (recomendado)
- **AVI**
- **MOV**
- **WMV**

**Tamanho máximo:** 500MB por arquivo

## 📂 Categorias Disponíveis

- Prevenção
- Vacinação
- Alimentação Saudável
- Exercícios
- Saúde Mental
- Higiene
- Primeiros Socorros
- Doenças Crônicas
- Saúde da Mulher
- Saúde do Idoso
- Saúde Infantil
- Geral

## ⚙️ Configurações do Sistema

### Portas Utilizadas
- **3001:** API Backend
- **3000:** Interface da TV
- **3002:** Dashboard Administrativo

### Banco de Dados
- **SQLite** local (arquivo: `database/videos.db`)
- Criado automaticamente na primeira execução

### Armazenamento
- Vídeos salvos em: `uploads/`
- Backup recomendado desta pasta

## 🔧 Funcionalidades Técnicas

### Interface da TV
- Reprodução automática
- Loop infinito da playlist
- Transições suaves entre vídeos
- Overlay com informações
- Relógio em tempo real
- Cursor invisível (modo TV)

### Dashboard Admin
- Upload com drag & drop
- Preview de vídeos
- Filtros e busca
- Estatísticas do sistema
- Notificações em tempo real
- Interface responsiva

### API Backend
- Upload de arquivos
- CRUD completo de vídeos
- Servir arquivos estáticos
- Validação de dados
- Tratamento de erros

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 18 + Vite
- **Backend:** Node.js + Express
- **Banco:** SQLite3
- **Estilização:** Tailwind CSS
- **Upload:** Multer
- **HTTP Client:** Axios

## 📱 Responsividade

- Dashboard otimizado para desktop e tablet
- Interface da TV otimizada para telas grandes
- Layouts adaptativos

## 🔒 Segurança

- Sistema interno (sem autenticação externa)
- Validação de tipos de arquivo
- Limite de tamanho de upload
- Sanitização de dados

## 🚨 Solução de Problemas

### Vídeo não reproduz na TV
1. Verifique se o vídeo está ativo no dashboard
2. Confirme se o formato é suportado (MP4 recomendado)
3. Verifique a conexão com a API (http://localhost:3001)

### Upload falha
1. Verifique o tamanho do arquivo (máx. 500MB)
2. Confirme se é um arquivo de vídeo válido
3. Verifique se o backend está rodando

### Dashboard não carrega
1. Confirme se todos os serviços estão rodando
2. Verifique se as portas não estão em uso
3. Limpe o cache do navegador

## 📞 Suporte

Para suporte técnico:
- Verifique os logs do console do navegador
- Confirme se todos os serviços estão ativos
- Reinicie os serviços se necessário

## 📄 Licença

Sistema desenvolvido para uso interno da Secretaria de Saúde de Guarapuava - PR.

## 🖼️ Screenshots

<details>
<summary><b>Clique para ver screenshots do sistema</b></summary>

### Interface da TV
![Interface da TV](https://via.placeholder.com/800x450.png?text=TV+Interface)

### Dashboard Administrativo
![Dashboard Admin](https://via.placeholder.com/800x450.png?text=Dashboard+Admin)

### Página de Upload
![Página de Upload](https://via.placeholder.com/800x450.png?text=Upload+Page)

</details>

## 🛠️ Scripts Úteis

O sistema inclui scripts para facilitar a instalação e execução:

- **`install-dependencies.bat`**: Instala todas as dependências dos três componentes
- **`start-system.bat`**: Inicia todos os serviços de uma vez em terminais separados

---

**Versão:** 1.0.0  
**Desenvolvido para:** Postos de Saúde de Guarapuava  
**Data:** 2025  
**Repositório:** [github.com/elneves81/tv-saude](https://github.com/elneves81/tv-saude)
