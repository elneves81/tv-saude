# Script para testar endpoint de localidades
Write-Host "=== TESTE ENDPOINT LOCALIDADES ===" -ForegroundColor Green

# Verificar se servidor está rodando
$porta = 3001
$serverRunning = $false

try {
    $response = Invoke-WebRequest -Uri "http://localhost:$porta/api/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
    $serverRunning = $true
    Write-Host "✅ Servidor está rodando na porta $porta" -ForegroundColor Green
} catch {
    Write-Host "❌ Servidor não está respondendo na porta $porta" -ForegroundColor Red
}

if ($serverRunning) {
    Write-Host "`n--- Testando com localhost ---" -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3001/api/localidades/conteudo" -Method GET -TimeoutSec 10
        Write-Host "✅ Sucesso com localhost:" -ForegroundColor Green
        Write-Host ($response | ConvertTo-Json -Depth 3)
    } catch {
        Write-Host "❌ Erro com localhost: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host "`n--- Testando com IP específico (10.0.50.79) ---" -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "http://10.0.50.79:3001/api/localidades/conteudo" -Method GET -TimeoutSec 10
        Write-Host "✅ Sucesso com IP específico:" -ForegroundColor Green
        Write-Host ($response | ConvertTo-Json -Depth 3)
    } catch {
        Write-Host "❌ Erro com IP específico: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "💡 Isso pode indicar que o IP 10.0.50.79 não está acessível desta máquina" -ForegroundColor Cyan
    }

    Write-Host "`n--- Testando com IP local da máquina ---" -ForegroundColor Yellow
    $localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "10.*" -or $_.IPAddress -like "192.168.*"}).IPAddress | Select-Object -First 1
    if ($localIP) {
        Write-Host "🔍 IP local detectado: $localIP" -ForegroundColor Cyan
        try {
            $response = Invoke-RestMethod -Uri "http://${localIP}:3001/api/localidades/conteudo" -Method GET -TimeoutSec 10
            Write-Host "✅ Sucesso com IP local:" -ForegroundColor Green
            Write-Host ($response | ConvertTo-Json -Depth 3)
        } catch {
            Write-Host "❌ Erro com IP local: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n=== FIM DO TESTE ===" -ForegroundColor Green
