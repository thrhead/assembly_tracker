# nuclear_fix.ps1
$ErrorActionPreference = "Stop"

Write-Host "INITIATING NUCLEAR FIX..." -ForegroundColor Red
Write-Host "This will delete all caches and reinstall everything." -ForegroundColor Yellow

# 1. Stop all processes
Write-Host "Stopping processes..." -ForegroundColor Cyan
Get-Process -Name node, cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Navigate to mobile
Set-Location "mobile"

# 3. Delete everything
Write-Host "Deleting node_modules..." -ForegroundColor Cyan
if (Test-Path "node_modules") { Remove-Item "node_modules" -Recurse -Force }

Write-Host "Deleting package-lock.json..." -ForegroundColor Cyan
if (Test-Path "package-lock.json") { Remove-Item "package-lock.json" -Force }

Write-Host "Deleting .expo folder..." -ForegroundColor Cyan
if (Test-Path ".expo") { Remove-Item ".expo" -Recurse -Force }

Write-Host "Deleting .metro folder..." -ForegroundColor Cyan
if (Test-Path ".metro") { Remove-Item ".metro" -Recurse -Force }

# 4. Reinstall Strict
Write-Host "Installing dependencies (Strict Mode)..." -ForegroundColor Cyan
npm install --save-exact --legacy-peer-deps

# 5. Verify
Write-Host "Verifying Expo version..." -ForegroundColor Cyan
npm list expo

Write-Host "NUCLEAR FIX COMPLETE." -ForegroundColor Green
Write-Host "Please run '.\start_expo_tunnel.ps1' again." -ForegroundColor Yellow
