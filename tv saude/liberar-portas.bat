@echo off
echo ========================================
echo   LIBERANDO PORTAS DO TV SAUDE
echo ========================================
echo.

echo 🔥 Liberando porta 3001 (Backend/API)...
netsh advfirewall firewall add rule name="TV Saude Backend" dir=in action=allow protocol=TCP localport=3001
netsh advfirewall firewall add rule name="TV Saude Backend OUT" dir=out action=allow protocol=TCP localport=3001

echo 🔥 Liberando porta 3002 (Dashboard Admin)...
netsh advfirewall firewall add rule name="TV Saude Dashboard" dir=in action=allow protocol=TCP localport=3002
netsh advfirewall firewall add rule name="TV Saude Dashboard OUT" dir=out action=allow protocol=TCP localport=3002

echo 🔥 Liberando porta 3003 (Frontend TV)...
netsh advfirewall firewall add rule name="TV Saude Frontend" dir=in action=allow protocol=TCP localport=3003
netsh advfirewall firewall add rule name="TV Saude Frontend OUT" dir=out action=allow protocol=TCP localport=3003

echo.
echo ✅ Portas liberadas com sucesso!
echo.
echo 📋 Portas configuradas:
echo    - 3001: Backend/API
echo    - 3002: Dashboard Admin  
echo    - 3003: Frontend TV
echo.
pause
