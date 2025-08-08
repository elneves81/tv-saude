# 🌐 Acesso de Rede - TV Saúde Guarapuava

## 📋 Configuração Concluída

O sistema TV Saúde foi configurado para permitir acesso de qualquer dispositivo na rede local. Agora você pode:

- ✅ Acessar o sistema de qualquer computador, tablet ou smartphone na mesma rede
- ✅ Fazer upload de vídeos remotamente
- ✅ Controlar as TVs de qualquer dispositivo
- ✅ Gerenciar playlists remotamente

## 🔧 Alterações Realizadas

### 1. Servidor Backend (server.js)
- **CORS configurado** para aceitar requisições de qualquer origem
- **Servidor configurado** para escutar em `0.0.0.0` (todas as interfaces de rede)
- **Logs melhorados** para mostrar URLs de acesso local e de rede

### 2. Aplicações Frontend
- **Vite configurado** com `host: true` (já estava configurado)
- **Dashboard Admin** acessível pela rede na porta 3002
- **Interface da TV** acessível pela rede na porta 3000

### 3. Script de Inicialização
- **Detecção automática** do IP da máquina
- **Instruções claras** para acesso de rede
- **URLs completas** para todos os serviços

## 🚀 Como Usar

### 1. Iniciar o Sistema
Execute o arquivo `start-system.bat` como sempre. Agora ele mostrará:
- URLs para acesso local (localhost)
- URLs para acesso de rede (IP da máquina)
- Instruções detalhadas

### 2. Acessar de Outros Dispositivos
Substitua `[IP_DA_MAQUINA]` pelo IP mostrado no script:

**Dashboard Admin (Gerenciamento):**
```
http://[IP_DA_MAQUINA]:3002
```

**Interface da TV:**
```
http://[IP_DA_MAQUINA]:3000
```

**API Backend:**
```
http://[IP_DA_MAQUINA]:3001/api
```

**Upload de Vídeos:**
```
http://[IP_DA_MAQUINA]:3001/uploads
```

### 3. Exemplo Prático
Se o IP da máquina for `192.168.1.100`:
- Dashboard: `http://192.168.1.100:3002`
- TV: `http://192.168.1.100:3000`
- API: `http://192.168.1.100:3001/api`

## 🔒 Configurações de Firewall

### Windows Defender Firewall
Se não conseguir acessar de outros dispositivos, configure o firewall:

1. **Abrir Firewall do Windows:**
   - Painel de Controle → Sistema e Segurança → Firewall do Windows Defender

2. **Configurações Avançadas:**
   - Clique em "Configurações avançadas"

3. **Regras de Entrada:**
   - Clique em "Regras de Entrada" → "Nova Regra"
   - Tipo: Porta
   - Protocolo: TCP
   - Portas: 3000, 3001, 3002
   - Ação: Permitir conexão
   - Perfil: Todos
   - Nome: "TV Saude - Acesso Rede"

### Comando Rápido (Execute como Administrador)
```cmd
netsh advfirewall firewall add rule name="TV Saude Port 3000" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="TV Saude Port 3001" dir=in action=allow protocol=TCP localport=3001
netsh advfirewall firewall add rule name="TV Saude Port 3002" dir=in action=allow protocol=TCP localport=3002
```

## 📱 Funcionalidades Disponíveis pela Rede

### Dashboard Admin (Porta 3002)
- ✅ Upload de vídeos locais
- ✅ Adição de vídeos do YouTube
- ✅ Gerenciamento de playlists
- ✅ Controle remoto das TVs
- ✅ Configurações do sistema

### Interface da TV (Porta 3000)
- ✅ Reprodução de vídeos
- ✅ Recebimento de comandos remotos
- ✅ Exibição de playlists ativas

### API Backend (Porta 3001)
- ✅ Upload de arquivos de vídeo
- ✅ Gerenciamento de dados
- ✅ Servir arquivos estáticos
- ✅ Controle remoto via API

## 🔍 Solução de Problemas

### Não Consegue Acessar de Outros Dispositivos?

1. **Verifique o IP:**
   - Execute `ipconfig` no prompt de comando
   - Use o IP IPv4 da interface de rede ativa

2. **Teste a Conectividade:**
   ```cmd
   ping [IP_DA_MAQUINA]
   ```

3. **Verifique as Portas:**
   ```cmd
   netstat -an | findstr :3001
   ```

4. **Desative Temporariamente o Firewall:**
   - Para testar se é problema de firewall
   - Lembre-se de reativar depois

### Problemas de Upload?

1. **Verifique Permissões:**
   - A pasta `uploads` deve ter permissões de escrita

2. **Tamanho do Arquivo:**
   - Limite atual: 500MB por arquivo
   - Para arquivos maiores, edite `server.js`

3. **Formato do Arquivo:**
   - Apenas arquivos de vídeo são aceitos
   - Formatos suportados: MP4, AVI, MOV, etc.

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs nos terminais abertos
2. Teste primeiro o acesso local (localhost)
3. Confirme que todos os dispositivos estão na mesma rede
4. Verifique as configurações de firewall

---

**Sistema TV Saúde Guarapuava**  
*Configurado para acesso completo de rede* 🌐
