@echo off
echo ===============================================
echo      QUEM ESTA ACESSANDO MINHA API?
echo ===============================================
echo.

echo 🔍 VERIFICANDO PORTA 3001 (Backend):
netstat -an | findstr ":3001"
echo.

echo 🔍 VERIFICANDO PORTA 3002 (Dashboard):
netstat -an | findstr ":3002"
echo.

echo 🔍 VERIFICANDO PORTA 3003 (TV):
netstat -an | findstr ":3003"
echo.

echo 📊 RESUMO DE CONEXOES ATIVAS:
echo ----------------------------------------------
echo Backend (3001):
for /f "tokens=2,3" %%i in ('netstat -an ^| findstr ":3001" ^| findstr "ESTABLISHED"') do (
    echo    %%i conectado de %%j
)

echo Dashboard (3002):
for /f "tokens=2,3" %%i in ('netstat -an ^| findstr ":3002" ^| findstr "ESTABLISHED"') do (
    echo    %%i conectado de %%j
)

echo TV (3003):
for /f "tokens=2,3" %%i in ('netstat -an ^| findstr ":3003" ^| findstr "ESTABLISHED"') do (
    echo    %%i conectado de %%j
)
echo.

echo 💡 Se nao aparecer nada em "ESTABLISHED", ninguem esta conectado agora.
echo 💡 "LISTENING" significa que o servidor esta aguardando conexoes.
pause
