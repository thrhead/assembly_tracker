# install_sdk54.ps1
$ErrorActionPreference = "Stop"

Write-Host "INSTALLING SDK 54 DEPENDENCIES..." -ForegroundColor Magenta

# 1. Stop processes
Get-Process -Name node, cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Navigate
Set-Location "mobile"

# 3. Install
Write-Host "Running npm install..." -ForegroundColor Cyan
npm install --legacy-peer-deps

# 4. Fix dependencies
Write-Host "Aligning dependencies with SDK 54..." -ForegroundColor Cyan
npx expo install --fix

Write-Host "Installation Complete." -ForegroundColor Green
Write-Host "Please run '.\start_expo_tunnel.ps1' again." -ForegroundColor Yellow
