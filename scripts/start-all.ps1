param(
    [switch]$UseNpm
)

<#
  start-all.ps1
  - Starts a local MongoDB container (named `mongodb`) if Docker is available
  - Launches the backend (uvicorn) in a new PowerShell window
  - Launches the frontend (yarn or npm) in a new PowerShell window

  Usage:
    .\start-all.ps1           # prefer yarn when available
    .\start-all.ps1 -UseNpm   # force npm (uses --legacy-peer-deps)
#>

try {
    $repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
} catch {
    $repoRoot = Get-Location
}

Set-Location $repoRoot

$backendPath = Join-Path $repoRoot 'backend'
$frontendPath = Join-Path $repoRoot 'frontend'

Write-Output "Repository root: $repoRoot"

# Start MongoDB via Docker if Docker is available
try {
    docker version > $null 2>&1
    $dockerAvailable = $true
} catch {
    $dockerAvailable = $false
}

if ($dockerAvailable) {
    Write-Output "Docker detected. Ensuring 'mongodb' container is running..."
    $isRunning = (docker ps --filter "name=^/mongodb$" --format "{{.Names}}") -eq 'mongodb'
    if (-not $isRunning) {
        $exists = (docker ps -a --filter "name=^/mongodb$" --format "{{.Names}}") -eq 'mongodb'
        if ($exists) {
            Write-Output "Starting existing 'mongodb' container..."
            docker start mongodb | Out-Null
        } else {
            Write-Output "Creating and starting 'mongodb' container (mongo:6)..."
            docker run -d --name mongodb -p 27017:27017 -v mongodb_data:/data/db mongo:6 | Out-Null
        }
    } else {
        Write-Output "'mongodb' container already running."
    }
} else {
    Write-Output "Docker not found. Please ensure MongoDB is running locally (e.g. as a service) on port 27017." 
}

# Launch backend in a new PowerShell window
$backendCmd = "Set-Location -LiteralPath '$backendPath'; if (Test-Path '.venv\\Scripts\\Activate.ps1') { . .\\.venv\\Scripts\\Activate.ps1 } ; uvicorn server:app --reload --host 0.0.0.0 --port 8000"
Write-Output "Starting backend in a new PowerShell window..."
Start-Process -FilePath 'powershell' -ArgumentList '-NoExit','-Command',$backendCmd

# Launch frontend in a new PowerShell window
if ($UseNpm) {
    $frontendCmd = "Set-Location -LiteralPath '$frontendPath'; npm install --legacy-peer-deps; `$env:PORT=3001; npm start"
} else {
    $frontendCmd = "Set-Location -LiteralPath '$frontendPath'; if (Test-Path 'yarn.lock') { yarn install; yarn start } else { npm install --legacy-peer-deps; `$env:PORT=3001; npm start }"
}

Write-Output "Starting frontend in a new PowerShell window..."
Start-Process -FilePath 'powershell' -ArgumentList '-NoExit','-Command',$frontendCmd

Write-Output "All processes started. Backend: http://localhost:8000 | Frontend: http://localhost:3000 (or 3001 if 3000 was taken) | MongoDB: mongodb://localhost:27017"
