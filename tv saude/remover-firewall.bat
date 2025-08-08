@echo off
echo ========================================
echo   REMOCAO DE FIREWALL - TV SAUDE
echo ========================================
echo.

echo Verificando privilegios de administrador...
net session >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERRO: Este script precisa ser executado como Administrador!
    echo.
    echo Como executar como Administrador:
    echo 1. Clique com o botao direito no arquivo
    echo 2. Selecione "Executar como administrador"
    echo.
    pause
    exit /b 1
)

echo Privilegios de administrador confirmados!
echo.

echo Removendo regras do firewall para TV Saude...
echo.

echo Removendo regra para porta 3003 (Interface da TV)...
netsh advfirewall firewall delete rule name="TV Saude - Interface TV (3003)"
if errorlevel 1 (
    echo Regra para porta 3003 nao encontrada ou ja removida
) else (
    echo ✓ Regra da porta 3003 removida com sucesso
)

echo.
echo Removendo regra para porta 3001 (Backend API)...
netsh advfirewall firewall delete rule name="TV Saude - Backend API (3001)"
if errorlevel 1 (
    echo Regra para porta 3001 nao encontrada ou ja removida
) else (
    echo ✓ Regra da porta 3001 removida com sucesso
)

echo.
echo Removendo regra para porta 3002 (Dashboard Admin)...
netsh advfirewall firewall delete rule name="TV Saude - Dashboard Admin (3002)"
if errorlevel 1 (
    echo Regra para porta 3002 nao encontrada ou ja removida
) else (
    echo ✓ Regra da porta 3002 removida com sucesso
)

echo.
echo ========================================
echo       REMOCAO CONCLUIDA!
echo ========================================
echo.
echo As regras do firewall para TV Saude foram removidas.
echo.
echo ATENCAO: Apos remover as regras, outros dispositivos
echo na rede NAO conseguirao mais acessar o sistema.
echo.
echo Para reativar o acesso de rede:
echo Execute o arquivo "configurar-firewall.bat"
echo.
pause
