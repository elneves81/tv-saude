@echo off
echo ========================================
echo    TV SAUDE GUARAPUAVA - INICIANDO
echo ========================================
echo.

echo Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado!
    echo Por favor, instale o Node.js em https://nodejs.org
    pause
    exit /b 1
)

echo Node.js encontrado!
echo.

echo Obtendo IP da maquina...
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4" ^| findstr "10\."') do set IP=%%i
if "%IP%"=="" (
    for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4" ^| findstr "192\.168\."') do set IP=%%i
)
if "%IP%"=="" (
    for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do set IP=%%i
)
for /f "tokens=1" %%i in ("%IP%") do set IP=%%i

echo Iniciando Backend API...
start "Backend API" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

echo Iniciando Interface da TV...
start "TV Interface" cmd /k "cd frontend-tv && npm run dev"
timeout /t 3 /nobreak >nul

echo Iniciando Dashboard Admin...
start "Dashboard Admin" cmd /k "cd dashboard-admin && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo           SISTEMA INICIADO!
echo ========================================
echo.
echo ACESSO LOCAL:
echo - Backend API:      http://localhost:3001
echo - Interface da TV:  http://localhost:3003
echo - Dashboard Admin:  http://localhost:3002
echo.
echo ACESSO NA REDE LOCAL:
echo - Backend API:      http://%IP%:3001
echo - Interface da TV:  http://%IP%:3003
echo - Dashboard Admin:  http://%IP%:3002
echo.
echo UPLOAD DE VIDEOS:
echo - Local:  http://localhost:3001/uploads
echo - Rede:   http://%IP%:3001/uploads
echo.
echo ========================================
echo  INSTRUCOES PARA ACESSO DE REDE:
echo ========================================
echo.
echo 1. Outros dispositivos na mesma rede podem acessar usando o IP: %IP%
echo 2. Para upload de videos, use o Dashboard Admin
echo 3. Certifique-se de que o firewall permite as portas 3001, 3002 e 3003
echo 4. Se nao conseguir acessar, verifique as configuracoes de rede
echo.
echo Aguarde alguns segundos para os servicos iniciarem...
echo.
echo Para parar o sistema, feche todas as janelas do terminal.
echo.
pause
