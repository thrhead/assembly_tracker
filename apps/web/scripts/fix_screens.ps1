# fix_screens.ps1
$ErrorActionPreference = "Stop"

Write-Host "Fixing react-native-screens version..." -ForegroundColor Cyan

# 1. Stop processes
Get-Process -Name node, cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Navigate
Set-Location (Join-Path (Split-Path -Parent $PSScriptRoot) "mobile")

# 3. Install correct version via Expo
Write-Host "Installing react-native-screens via Expo..." -ForegroundColor Cyan
npx expo install react-native-screens --fix

Write-Host "Fix Complete." -ForegroundColor Green
Write-Host "Please run '.\start_expo_tunnel.ps1' again." -ForegroundColor Yellow
