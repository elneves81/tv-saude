# Teste PowerShell para endpoint de localidades com IP específico
Write-Host "🧪 Testando endpoint com IP específico..." -ForegroundColor Cyan

# IP da máquina
$IP = "10.0.50.79"
$PORT = "3001"

# URLs para testar
$urls = @(
    "http://$IP`:$PORT/api/localidades/conteudo",
    "http://localhost:$PORT/api/localidades/conteudo", 
    "http://127.0.0.1:$PORT/api/localidades/conteudo"
)

foreach ($url in $urls) {
    Write-Host "`n🔍 Testando: $url" -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method GET -TimeoutSec 5
        Write-Host "✅ SUCESSO!" -ForegroundColor Green
        Write-Host "   Status: OK" -ForegroundColor Green
        Write-Host "   Localidade: $($response.localidade.nome -or 'Nenhuma')" -ForegroundColor White
        Write-Host "   Videos: $($response.videos.Count -or 0)" -ForegroundColor White
        Write-Host "   Audios: $($response.audioTracks.Count -or 0)" -ForegroundColor White
    }
    catch {
        Write-Host "❌ ERRO!" -ForegroundColor Red
        Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            Write-Host "   Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        }
    }
    Write-Host "---" -ForegroundColor Gray
}

# Teste adicional com cabeçalhos de IP
Write-Host "`n🔍 Testando com IP simulado nos headers..." -ForegroundColor Yellow

$headers = @{
    'X-Forwarded-For' = '10.0.50.45'
    'X-Real-IP' = '10.0.50.45'
}

try {
    $response = Invoke-RestMethod -Uri "http://$IP`:$PORT/api/localidades/conteudo" -Method GET -Headers $headers -TimeoutSec 5
    Write-Host "✅ SUCESSO com headers!" -ForegroundColor Green
    Write-Host "   Localidade detectada: $($response.localidade.nome -or 'Nenhuma')" -ForegroundColor White
    Write-Host "   IP simulado: 10.0.50.45" -ForegroundColor White
}
catch {
    Write-Host "❌ ERRO com headers!" -ForegroundColor Red
    Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 RESUMO:" -ForegroundColor Cyan
Write-Host "- IP da máquina: $IP" -ForegroundColor White
Write-Host "- Porta do backend: $PORT" -ForegroundColor White
Write-Host "- Endpoint testado: /api/localidades/conteudo" -ForegroundColor White
