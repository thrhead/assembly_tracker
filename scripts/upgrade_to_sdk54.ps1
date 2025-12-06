# upgrade_to_sdk54.ps1
$ErrorActionPreference = "Stop"

Write-Host "UPGRADING TO SDK 54 (Canary)..." -ForegroundColor Magenta

# 1. Stop processes
Get-Process -Name node, cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Navigate
Set-Location (Join-Path (Split-Path -Parent $PSScriptRoot) "mobile")

# 3. Clean
if (Test-Path "node_modules") { Remove-Item "node_modules" -Recurse -Force }
if (Test-Path "package-lock.json") { Remove-Item "package-lock.json" -Force }

# 4. Install SDK 54
Write-Host "Installing Expo SDK 54..." -ForegroundColor Cyan
npm install expo@next react@18.3.1 react-dom@18.3.1 --legacy-peer-deps

Write-Host "Aligning dependencies..." -ForegroundColor Cyan
npx expo install --fix

Write-Host "Upgrade Complete." -ForegroundColor Green
Write-Host "Please run '.\start_expo_tunnel.ps1' again." -ForegroundColor Yellow
