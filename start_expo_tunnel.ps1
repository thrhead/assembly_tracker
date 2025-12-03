# start_expo_tunnel.ps1
$ErrorActionPreference = "Stop"

# Configuration
$CloudflaredPath = ".\cloudflared.exe"
$BackendPort = 3000
$BundlerPort = 8081
$ApiFile = "mobile\src\services\api.js"
$LogFileBackend = "cloudflared_backend.log"
$LogFileBundler = "cloudflared_bundler.log"

# Check if cloudflared exists
if (-not (Test-Path $CloudflaredPath)) {
    Write-Host "Error: cloudflared.exe not found in current directory." -ForegroundColor Red
    exit 1
}

# Kill existing cloudflared processes
Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force

# Function to start tunnel and get URL
function Start-Tunnel {
    param (
        [int]$Port,
        [string]$LogFile
    )
    
    # Clear existing log file
    if (Test-Path $LogFile) {
        Remove-Item $LogFile -Force
    }

    Write-Host "Starting Cloudflare Tunnel for port $Port..." -ForegroundColor Cyan
    $Process = Start-Process -FilePath $CloudflaredPath -ArgumentList "tunnel --url http://localhost:$Port" -PassThru -RedirectStandardError $LogFile -WindowStyle Hidden
    
    $TunnelUrl = $null
    $TimeoutSeconds = 45 # Increased timeout
    $StartTime = Get-Date

    while ($null -eq $TunnelUrl -and ((Get-Date) - $StartTime).TotalSeconds -lt $TimeoutSeconds) {
        Start-Sleep -Seconds 1
        if (Test-Path $LogFile) {
            # Read the file with shared access to avoid locking issues
            try {
                $Content = Get-Content $LogFile -Tail 20 -ErrorAction SilentlyContinue
                if ($Content) {
                    foreach ($Line in $Content) {
                        if ($Line -match "https://[-a-zA-Z0-9]+\.trycloudflare\.com") {
                            $TunnelUrl = $matches[0]
                            break
                        }
                    }
                }
            } catch {
                # Ignore read errors (file might be locked briefly)
            }
        }
    }
    
    return $TunnelUrl
}

# 1. Start Backend Tunnel
$BackendUrl = Start-Tunnel -Port $BackendPort -LogFile $LogFileBackend

if ($null -eq $BackendUrl) {
    Write-Host "Failed to start backend tunnel. Check $LogFileBackend." -ForegroundColor Red
    exit 1
}

Write-Host "Backend Tunnel: $BackendUrl" -ForegroundColor Green

# 2. Update api.js
if (Test-Path $ApiFile) {
    $Content = Get-Content $ApiFile
    $NewContent = $Content -replace "const NGROK_URL = '.*';", "const NGROK_URL = '$BackendUrl';"
    $NewContent | Set-Content $ApiFile
    Write-Host "Updated api.js with new backend URL." -ForegroundColor Gray
} else {
    Write-Host "Warning: $ApiFile not found. You may need to update the API URL manually." -ForegroundColor Yellow
}

# 3. Start Bundler Tunnel
$BundlerUrl = Start-Tunnel -Port $BundlerPort -LogFile $LogFileBundler

if ($null -eq $BundlerUrl) {
    Write-Host "Failed to start bundler tunnel. Check $LogFileBundler." -ForegroundColor Red
    Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force
    exit 1
}

Write-Host "Bundler Tunnel: $BundlerUrl" -ForegroundColor Green

# 4. Configure Expo
$TunnelHostname = $BundlerUrl.Replace("https://", "")
$env:REACT_NATIVE_PACKAGER_HOSTNAME = $TunnelHostname
# Try to force the URL to be the tunnel URL without port 8081
$env:EXPO_PACKAGER_PROXY_URL = $BundlerUrl

Write-Host "Starting Expo..." -ForegroundColor Cyan
Write-Host "--------------------------------------------------" -ForegroundColor Yellow
Write-Host "MANUAL CONNECTION INFO:" -ForegroundColor Yellow
Write-Host "If the QR code below doesn't work, enter this URL manually in Expo Go:" -ForegroundColor Yellow
$ExpUrl = $BundlerUrl.Replace("https://", "exp://")
Write-Host $ExpUrl -ForegroundColor Magenta
Write-Host "--------------------------------------------------" -ForegroundColor Yellow

# Generate QR Code for the correct URL
Write-Host "Generating Correct QR Code..." -ForegroundColor Cyan
node generate_qr.js $BundlerUrl

Write-Host "Starting Expo Server..." -ForegroundColor Cyan
Write-Host "Press Enter to start Expo (Note: Expo might clear this screen)..." -ForegroundColor Green
Read-Host

# Change to mobile directory
Set-Location "mobile"

# Start Expo
cmd /c "npx expo start"

# Cleanup on exit (this part only runs if the script finishes, but npx expo start blocks)
# Ideally, user should close the window to kill everything, but PS script termination might leave cloudflared running.
# We can't easily fix that without a wrapper or trap.
# Adding a trap for cleanup
Register-EngineEvent -SourceIdentifier PowerShell.Exiting -SupportEvent -Action {
    Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force
}
