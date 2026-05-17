$ErrorActionPreference = "Stop"

$root = "C:\Users\binty\OneDrive\Desktop\learner's grove\BOOKHUB"
Set-Location $root

$env:PORT = "5173"
$env:VITE_API_URL = "http://127.0.0.1:4000"

corepack pnpm --filter @workspace/bookstore dev
