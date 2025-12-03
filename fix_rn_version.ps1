# fix_rn_version.ps1
$ErrorActionPreference = "Stop"

Write-Host "Stopping existing Node/Expo processes..." -ForegroundColor Yellow
Get-Process -Name node, cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "Navigating to mobile directory..." -ForegroundColor Cyan
Set-Location "mobile"

Write-Host "Reinstalling dependencies with pinned React Native version..." -ForegroundColor Cyan
npm install

Write-Host "Fixing Expo dependencies (again)..." -ForegroundColor Cyan
npx expo install --fix

Write-Host "Done. Please run '.\start_expo_tunnel.ps1' again." -ForegroundColor Green
