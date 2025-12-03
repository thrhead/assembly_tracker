$url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
$output = "cloudflared.exe"
Write-Host "Downloading Cloudflared from $url..."
Invoke-WebRequest -Uri $url -OutFile $output
Write-Host "Download complete: $output"
