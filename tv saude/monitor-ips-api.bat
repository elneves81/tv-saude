@echo off
title Monitor de IPs Acessando API TV Saude
color 0A

echo ===============================================
echo      MONITOR DE IPs ACESSANDO A API
echo ===============================================
echo.
echo 📡 Monitorando conexoes na porta 3001...
echo 🔍 Pressione Ctrl+C para parar
echo.

:loop
echo ==========================================
echo %date% %time%
echo.

echo 🌐 CONEXOES ATIVAS NA PORTA 3001:
netstat -an | findstr ":3001" | findstr "ESTABLISHED"
echo.

echo 🔗 TODAS AS CONEXOES NA PORTA 3001:
netstat -an | findstr ":3001"
echo.

echo 📊 IPs CONECTADOS (resumo):
for /f "tokens=3" %%i in ('netstat -an ^| findstr ":3001" ^| findstr "ESTABLISHED"') do (
    for /f "tokens=1 delims=:" %%j in ("%%i") do echo    - %%j
)
echo.

timeout /t 5 /nobreak >nul
goto loop
