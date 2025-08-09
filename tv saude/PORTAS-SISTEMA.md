# 🔌 Configuração de Portas - TV Saúde

## 📋 Portas Oficiais do Sistema

### ✅ Configuração Correta:
- **Backend API**: Porta **3001**
- **Dashboard Admin**: Porta **3002** 
- **Interface da TV**: Porta **3003**

## 🔧 Arquivos de Configuração

### Backend (server.js)
```javascript
const PORT = process.env.PORT || 3001;
```

### Dashboard Admin (vite.config.js)
```javascript
server: {
  port: 3002,
  host: true
}
```

### Frontend TV (vite.config.js)
```javascript
server: {
  port: 3003,
  host: true
}
```

## 🌐 URLs de Acesso

### Local (localhost):
- Backend API: `http://localhost:3001`
- Dashboard Admin: `http://localhost:3002`
- Interface da TV: `http://localhost:3003`

### Rede (substitua [IP] pelo IP da máquina):
- Backend API: `http://[IP]:3001`
- Dashboard Admin: `http://[IP]:3002`
- Interface da TV: `http://[IP]:3003`

## 🔥 Configuração do Firewall

### Portas que devem ser liberadas:
```cmd
netsh advfirewall firewall add rule name="TV Saude Port 3001" dir=in action=allow protocol=TCP localport=3001
netsh advfirewall firewall add rule name="TV Saude Port 3002" dir=in action=allow protocol=TCP localport=3002
netsh advfirewall firewall add rule name="TV Saude Port 3003" dir=in action=allow protocol=TCP localport=3003
```

## ⚠️ Importante

**NUNCA** altere essas portas sem atualizar todos os arquivos relacionados:
- `start-system.bat`
- `configurar-firewall.bat`
- `ACESSO-REDE.md`
- `TESTE-ACESSO-REDE.md`
- Arquivos de configuração do frontend (`api.js`)

---

**Última Atualização**: 08/08/2025  
**Status**: ✅ Portas corrigidas e documentadas
