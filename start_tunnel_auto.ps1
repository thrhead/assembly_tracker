# start_tunnel_auto.ps1
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
    Write-Host "Error: cloudflared.exe not found."
    exit 1
}

# Kill existing cloudflared processes
Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Function to start tunnel and get URL
function Start-Tunnel {
    param (
        [int]$Port,
        [string]$LogFile
    )
    
    if (Test-Path $LogFile) {
        Remove-Item $LogFile -Force -ErrorAction SilentlyContinue
    }

    Write-Host "Starting Tunnel for port $Port..."
    $Process = Start-Process -FilePath $CloudflaredPath -ArgumentList "tunnel --url http://localhost:$Port" -PassThru -RedirectStandardError $LogFile -WindowStyle Hidden
    
    $TunnelUrl = $null
    $TimeoutSeconds = 30
    $StartTime = Get-Date

    while ($null -eq $TunnelUrl -and ((Get-Date) - $StartTime).TotalSeconds -lt $TimeoutSeconds) {
        Start-Sleep -Seconds 1
        if (Test-Path $LogFile) {
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
            } catch {}
        }
    }
    
    return $TunnelUrl
}

# 1. Start Backend Tunnel
$BackendUrl = Start-Tunnel -Port $BackendPort -LogFile $LogFileBackend
if ($null -eq $BackendUrl) {
    Write-Host "Failed to start backend tunnel."
    exit 1
}
Write-Host "Backend Tunnel: $BackendUrl"

# 2. Update api.js
if (Test-Path $ApiFile) {
    $Content = Get-Content $ApiFile
    # Regex to replace NGROK_URL value, handling null or string
    $NewContent = $Content -replace "const NGROK_URL = .*;", "const NGROK_URL = '$BackendUrl';"
    $NewContent | Set-Content $ApiFile
    Write-Host "Updated api.js"
}

# 3. Start Bundler Tunnel
$BundlerUrl = Start-Tunnel -Port $BundlerPort -LogFile $LogFileBundler
if ($null -eq $BundlerUrl) {
    Write-Host "Failed to start bundler tunnel."
    exit 1
}
Write-Host "Bundler Tunnel: $BundlerUrl"

# Keep running
Write-Host "Tunnels active. Do not close this window."
while ($true) {
    Start-Sleep -Seconds 60
}
