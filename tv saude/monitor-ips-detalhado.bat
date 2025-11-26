@echo off
title Monitor Detalhado de IPs - API TV Saude
color 0B

echo ===============================================
echo    MONITOR DETALHADO DE IPs ACESSANDO API
echo ===============================================
echo.
echo 📡 Backend rodando em: http://10.0.50.79:3001
echo 📺 Frontend TV em: http://10.0.50.79:3003  
echo 🎛️ Dashboard em: http://10.0.50.79:3002
echo.
echo 🔍 Pressione Ctrl+C para parar
echo.

:loop
cls
echo ===============================================
echo    MONITOR DE IPs - %date% %time%
echo ===============================================
echo.

echo 🌐 CONEXOES ESTABELECIDAS NA PORTA 3001:
echo ----------------------------------------------
netstat -ano | findstr ":3001" | findstr "ESTABLISHED" | findstr /v "127.0.0.1" | findstr /v "0.0.0.0"
echo.

echo 🔗 TODAS AS CONEXOES NA PORTA 3001:
echo ----------------------------------------------
netstat -ano | findstr ":3001"
echo.

echo 📊 PROCESSOS USANDO PORTA 3001:
echo ----------------------------------------------
for /f "tokens=5" %%i in ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING"') do (
    tasklist /FI "PID eq %%i" /FO TABLE | findstr /v "PID"
)
echo.

echo 🎯 IPs EXTERNOS CONECTADOS:
echo ----------------------------------------------
for /f "tokens=3" %%i in ('netstat -ano ^| findstr ":3001" ^| findstr "ESTABLISHED" ^| findstr /v "127.0.0.1" ^| findstr /v "0.0.0.0"') do (
    for /f "tokens=1 delims=:" %%j in ("%%i") do (
        echo    📱 Cliente: %%j
    )
)
echo.

echo 💡 Dica: IPs 10.0.50.x sao da sua rede local
echo    - 10.0.50.79 = Seu computador (servidor)
echo    - Outros IPs = Clientes acessando a TV
echo.

timeout /t 5 /nobreak >nul
goto loop
