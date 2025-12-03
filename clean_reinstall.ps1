# clean_reinstall.ps1
$ErrorActionPreference = "Stop"

Write-Host "Stopping existing Node/Expo processes..." -ForegroundColor Yellow
Get-Process -Name node, cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "Navigating to mobile directory..." -ForegroundColor Cyan
Set-Location "mobile"

Write-Host "Removing node_modules and package-lock.json..." -ForegroundColor Cyan
if (Test-Path "node_modules") { Remove-Item "node_modules" -Recurse -Force }
if (Test-Path "package-lock.json") { Remove-Item "package-lock.json" -Force }

Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install

Write-Host "Fixing Expo dependencies..." -ForegroundColor Cyan
npx expo install --fix

Write-Host "Reinstall complete." -ForegroundColor Green
Write-Host "Please run '.\start_expo_tunnel.ps1' again." -ForegroundColor Yellow
