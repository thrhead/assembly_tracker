# downgrade_to_sdk52.ps1
$ErrorActionPreference = "Stop"

Write-Host "Stopping existing Node/Expo processes..." -ForegroundColor Yellow
Get-Process -Name node, cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "Navigating to mobile directory..." -ForegroundColor Cyan
Set-Location "mobile"

Write-Host "Installing Expo SDK 52..." -ForegroundColor Cyan
npm install expo@^52.0.0

Write-Host "Aligning dependencies with SDK 52..." -ForegroundColor Cyan
npx expo install --fix

Write-Host "Cleaning Metro cache..." -ForegroundColor Cyan
# Removing .metro folder if it exists in temp (optional, but good practice)
# We'll rely on the user pressing 'shift+r' later.

Write-Host "Downgrade complete." -ForegroundColor Green
Write-Host "Please run '.\start_expo_tunnel.ps1' again." -ForegroundColor Yellow
