# force_stable_sdk52.ps1
$ErrorActionPreference = "Stop"

Write-Host "Stopping existing Node/Expo processes..." -ForegroundColor Yellow
Get-Process -Name node, cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "Navigating to mobile directory..." -ForegroundColor Cyan
Set-Location "mobile"

Write-Host "Removing node_modules and package-lock.json..." -ForegroundColor Cyan
if (Test-Path "node_modules") { Remove-Item "node_modules" -Recurse -Force }
if (Test-Path "package-lock.json") { Remove-Item "package-lock.json" -Force }

Write-Host "Installing dependencies (Strict Mode)..." -ForegroundColor Cyan
# Using --save-exact to respect the pinned versions in package.json
# Using --legacy-peer-deps to avoid ERESOLVE errors
npm install --save-exact --legacy-peer-deps

Write-Host "SKIPPING 'npx expo install --fix' to prevent auto-upgrade..." -ForegroundColor Yellow

Write-Host "Installation complete." -ForegroundColor Green
Write-Host "Please run '.\start_expo_tunnel.ps1' again." -ForegroundColor Yellow
