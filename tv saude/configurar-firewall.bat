@echo off
echo ========================================
echo   CONFIGURACAO DE FIREWALL - TV SAUDE
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

echo Configurando regras do firewall para TV Saude...
echo.

echo Adicionando regra para porta 3003 (Interface da TV)...
netsh advfirewall firewall add rule name="TV Saude - Interface TV (3003)" dir=in action=allow protocol=TCP localport=3003
if errorlevel 1 (
    echo ERRO ao adicionar regra para porta 3003
) else (
    echo ✓ Porta 3003 configurada com sucesso
)

echo.
echo Adicionando regra para porta 3001 (Backend API)...
netsh advfirewall firewall add rule name="TV Saude - Backend API (3001)" dir=in action=allow protocol=TCP localport=3001
if errorlevel 1 (
    echo ERRO ao adicionar regra para porta 3001
) else (
    echo ✓ Porta 3001 configurada com sucesso
)

echo.
echo Adicionando regra para porta 3002 (Dashboard Admin)...
netsh advfirewall firewall add rule name="TV Saude - Dashboard Admin (3002)" dir=in action=allow protocol=TCP localport=3002
if errorlevel 1 (
    echo ERRO ao adicionar regra para porta 3002
) else (
    echo ✓ Porta 3002 configurada com sucesso
)

echo.
echo ========================================
echo      CONFIGURACAO CONCLUIDA!
echo ========================================
echo.
echo As seguintes portas foram liberadas no firewall:
echo - Porta 3001: Backend API e Upload de Videos
echo - Porta 3002: Dashboard Administrativo
echo - Porta 3003: Interface da TV
echo.
echo Agora outros dispositivos na rede podem acessar o sistema!
echo.
echo Para verificar as regras criadas:
echo 1. Abra o Firewall do Windows Defender
echo 2. Va em "Configuracoes avancadas"
echo 3. Clique em "Regras de Entrada"
echo 4. Procure por "TV Saude"
echo.
echo Para remover as regras (se necessario):
echo Execute o arquivo "remover-firewall.bat"
echo.
pause
