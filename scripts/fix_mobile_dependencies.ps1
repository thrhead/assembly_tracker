# fix_mobile_dependencies.ps1
$ErrorActionPreference = "Stop"

Write-Host "Stopping existing Node/Expo processes..." -ForegroundColor Yellow
Get-Process -Name node, cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "Navigating to mobile directory..." -ForegroundColor Cyan
Set-Location (Join-Path (Split-Path -Parent $PSScriptRoot) "mobile")

Write-Host "Removing corrupted react-native-svg..." -ForegroundColor Cyan
if (Test-Path "node_modules\react-native-svg") {
    Remove-Item "node_modules\react-native-svg" -Recurse -Force
}

Write-Host "Installing react-native-svg@15.12.1..." -ForegroundColor Cyan
npm install react-native-svg@15.12.1

Write-Host "Clearing Metro cache..." -ForegroundColor Cyan
# We can't easily run expo start -c here without blocking, so we'll just advise it.
# Or we can try to delete .metro folder if it exists (usually in temp or localappdata)

Write-Host "Done. You can now run '.\start_expo_tunnel.ps1' again." -ForegroundColor Green
Write-Host "IMPORTANT: When Expo starts, press 'r' to reload or 'shift+r' to restart bundler and clear cache." -ForegroundColor Yellow
