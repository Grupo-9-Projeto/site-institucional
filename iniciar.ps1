$ArgosRoot = $PSScriptRoot
$usuario = $env:USERNAME


Write-Host "Rodando o backend node..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ArgosRoot\web-data-viz'; npm i; npm run dev"
Write-Host "web data viz no jeito" -ForegroundColor Green
Write-Host "----------------------------------------"

Write-Host "Rodando o site institucional..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ArgosRoot\site-institucional'; npm i; npm run dev"
Write-Host "site institucional no jeito" -ForegroundColor Green

Write-Host "Rodando o backend java..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ArgosRoot\java-spring-email'; & 'C:\Users\$usuario\apache-maven-3.9.16-bin\apache-maven-3.9.16\bin\mvn.cmd' spring-boot:run"
Write-Host "site institucional no jeito" -ForegroundColor Green