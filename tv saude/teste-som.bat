@echo off
title Teste de Som - TV Saude
color 0E

echo ===============================================
echo           TESTE DE SOM - TV SAUDE
echo ===============================================
echo.
echo 🔊 Configuracoes de som aplicadas:
echo.
echo ✅ Videos locais (.mp4):
echo    - Propriedade 'muted' removida
echo    - Volume configurado para 100%%
echo    - Som ativado automaticamente
echo.
echo ✅ Videos do YouTube:
echo    - Parametro 'mute: 0' adicionado
echo    - Volume configurado para 100%%
echo    - Funcao unMute() ativada
echo.
echo 🎯 COMO TESTAR:
echo ----------------------------------------------
echo 1. Abra a TV: http://10.0.50.79:3003
echo 2. Verifique se o som esta funcionando
echo 3. Use o controle remoto para:
echo    - Volume + : Aumentar volume
echo    - Volume - : Diminuir volume  
echo    - Mute     : Ligar/desligar som
echo.
echo 🔧 COMANDOS PARA TESTAR SOM:

echo.
echo Testando comando de volume...
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer %1" -d "{\"comando\":\"volume_up\",\"parametros\":null}" http://10.0.50.79:3001/api/controle
echo Volume aumentado!

timeout /t 2 /nobreak >nul

curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer %1" -d "{\"comando\":\"volume_down\",\"parametros\":null}" http://10.0.50.79:3001/api/controle
echo Volume diminuido!

echo.
echo 💡 DICAS IMPORTANTES:
echo ----------------------------------------------
echo - Se ainda nao ouvir som, verifique:
echo   1. Volume do Windows
echo   2. Som do navegador nao mutado
echo   3. Alto-falantes conectados
echo   4. Codec do video compativel
echo.
echo 📋 PROXIMOS PASSOS:
echo - Acesse: http://10.0.50.79:3002/controle
echo - Teste os botoes de volume
echo - O som deve funcionar agora!
echo.
pause
