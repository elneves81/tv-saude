@echo off
echo ========================================
echo   TV SAUDE GUARAPUAVA - INSTALACAO
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
node --version
echo.

echo ========================================
echo    INSTALANDO DEPENDENCIAS...
echo ========================================
echo.

echo [1/3] Instalando dependencias do Backend...
cd backend
call npm install
if errorlevel 1 (
    echo ERRO: Falha na instalacao do backend
    pause
    exit /b 1
)
cd ..
echo Backend instalado com sucesso!
echo.

echo [2/3] Instalando dependencias da Interface TV...
cd frontend-tv
call npm install
if errorlevel 1 (
    echo ERRO: Falha na instalacao da interface TV
    pause
    exit /b 1
)
cd ..
echo Interface TV instalada com sucesso!
echo.

echo [3/3] Instalando dependencias do Dashboard Admin...
cd dashboard-admin
call npm install
if errorlevel 1 (
    echo ERRO: Falha na instalacao do dashboard
    pause
    exit /b 1
)
cd ..
echo Dashboard Admin instalado com sucesso!
echo.

echo ========================================
echo        INSTALACAO CONCLUIDA!
echo ========================================
echo.
echo Todas as dependencias foram instaladas com sucesso.
echo.
echo Para iniciar o sistema, execute: start-system.bat
echo.
echo Ou inicie manualmente:
echo 1. Backend:        cd backend ^&^& npm run dev
echo 2. Interface TV:   cd frontend-tv ^&^& npm run dev  
echo 3. Dashboard:      cd dashboard-admin ^&^& npm run dev
echo.
pause
