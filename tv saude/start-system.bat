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
echo Servicos disponiveis:
echo - Backend API:      http://localhost:3001
echo - Interface da TV:  http://localhost:3000
echo - Dashboard Admin:  http://localhost:3002
echo.
echo Aguarde alguns segundos para os servicos iniciarem...
echo.
echo Para parar o sistema, feche todas as janelas do terminal.
echo.
pause
