$ErrorActionPreference = "Stop"

Set-Location (Split-Path -Parent $PSScriptRoot)

if (-not (Test-Path .env)) {
  Copy-Item .env.example .env
}

if (Test-Path package-lock.json) {
  npm ci
} else {
  npm install
}

npm run db:generate

Write-Host "Configuration initiale terminee. Lancez 'docker compose up -d postgres', puis 'npm run db:migrate' et 'npm run dev'."
