# ==============================================================================
# DistributionBridge Local E2E Audit & Integration Test Runner (PowerShell)
# ==============================================================================

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $ProjectRoot "backend"
$FrontendDir = Join-Path $ProjectRoot "frontend"

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "Starting DistributionBridge Local Audit Test Suite" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan

# 1. Start Backend Worker on Port 8787
Write-Host "`nStarting Backend Worker on port 8787..." -ForegroundColor Yellow
$BackendProc = Start-Process -FilePath "npm.cmd" -ArgumentList "run", "dev" -WorkingDirectory $BackendDir -PassThru -NoNewWindow

# 2. Start Frontend Next.js on Port 3000
Write-Host "Starting Next.js Frontend on port 3000..." -ForegroundColor Yellow
$FrontendProc = Start-Process -FilePath "npm.cmd" -ArgumentList "run", "dev" -WorkingDirectory $FrontendDir -PassThru -NoNewWindow

try {
    # 3. Wait for Backend
    Write-Host "`nWaiting for Backend Worker on http://127.0.0.1:8787/health..." -ForegroundColor Gray
    $BackendReady = $false
    for ($i = 0; $i -lt 30; $i++) {
        try {
            $res = Invoke-RestMethod -Uri "http://127.0.0.1:8787/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($res.status -eq "online") {
                $BackendReady = $true
                break
            }
        } catch {
            Start-Sleep -Milliseconds 800
        }
    }

    if (-not $BackendReady) {
        Write-Error "Timeout waiting for Backend on http://127.0.0.1:8787"
        exit 1
    }
    Write-Host "[PASS] Backend Worker is healthy on http://127.0.0.1:8787" -ForegroundColor Green

    # 4. Wait for Frontend
    Write-Host "Waiting for Next.js Frontend on http://localhost:3000..." -ForegroundColor Gray
    $FrontendReady = $false
    for ($i = 0; $i -lt 30; $i++) {
        try {
            $res = Invoke-WebRequest -Uri "http://localhost:3000/" -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($res.StatusCode -eq 200) {
                $FrontendReady = $true
                break
            }
        } catch {
            Start-Sleep -Milliseconds 800
        }
    }

    if (-not $FrontendReady) {
        Write-Error "Timeout waiting for Frontend on http://localhost:3000"
        exit 1
    }
    Write-Host "[PASS] Next.js Frontend is healthy on http://localhost:3000" -ForegroundColor Green

    # 5. Run Spec
    Write-Host "`nExecuting Local Audit Spec (frontend/local-audit.spec.js)...`n" -ForegroundColor Cyan
    Set-Location $FrontendDir
    node local-audit.spec.js

} finally {
    Write-Host "`nCleaning up background test processes..." -ForegroundColor Gray
    if ($BackendProc -and -not $BackendProc.HasExited) {
        Stop-Process -Id $BackendProc.Id -Force -ErrorAction SilentlyContinue
    }
    if ($FrontendProc -and -not $FrontendProc.HasExited) {
        Stop-Process -Id $FrontendProc.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "[DONE] Cleanup complete." -ForegroundColor Green
}
