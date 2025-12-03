$keyPath = Resolve-Path ".\temp_ssh_key"
$acl = Get-Acl $keyPath
# Disable inheritance and remove all inherited rules
$acl.SetAccessRuleProtection($true, $false)
# Get current user
$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
# Create new rule for current user
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule($currentUser, "FullControl", "Allow")
$acl.SetAccessRule($rule)
# Apply
Set-Acl $keyPath $acl
Write-Host "Permissions fixed for $keyPath"
