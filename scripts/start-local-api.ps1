$ErrorActionPreference = "Stop"

$root = "C:\Users\binty\OneDrive\Desktop\learner's grove\BOOKHUB"
Set-Location $root

Get-Content ".env" | ForEach-Object {
  if ($_ -match '^(?<k>[^=]+)=(?<v>.*)$') {
    [Environment]::SetEnvironmentVariable($Matches["k"], $Matches["v"], "Process")
  }
}

$env:PORT = "4000"
$env:FRONTEND_URL = "http://127.0.0.1:5173"

corepack pnpm --filter @workspace/api-server start
