# fix_missing_deps.ps1
$ErrorActionPreference = "Stop"

Write-Host "Installing missing dependencies..." -ForegroundColor Cyan

# 1. Stop processes
Get-Process -Name node, cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Navigate
Set-Location (Join-Path (Split-Path -Parent $PSScriptRoot) "mobile")

# 3. Install react-native-screens
Write-Host "Installing react-native-screens..." -ForegroundColor Cyan
npm install react-native-screens --legacy-peer-deps

Write-Host "Fix Complete." -ForegroundColor Green
Write-Host "Please run '.\start_expo_tunnel.ps1' again." -ForegroundColor Yellow
