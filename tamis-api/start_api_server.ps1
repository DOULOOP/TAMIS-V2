#!/usr/bin/env powershell
# PowerShell startup script for Hatay Earthquake API Server

Write-Host "HATAY EARTHQUAKE API SERVER STARTUP" -ForegroundColor Green
Write-Host "=" * 50

# Check if Python is available
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "Python not found. Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Check if we're in the right directory
if (-not (Test-Path "api_server.py")) {
    Write-Host "Error: api_server.py not found in current directory" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory" -ForegroundColor Yellow
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
try {
    python -m pip install -r requirements.txt
    Write-Host "Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Check data directory
$dataDir = "1c__Hatay_Enkaz_Bina_Etiketleme"
if (-not (Test-Path $dataDir)) {
    Write-Host "Warning: Data directory not found: $dataDir" -ForegroundColor Yellow
    Write-Host "Some API endpoints may not work without the data files" -ForegroundColor Yellow
} else {
    Write-Host "Data directory found" -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting API Server..." -ForegroundColor Green
Write-Host "=" * 50
Write-Host "📡 API Documentation: http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host "🔄 API ReDoc: http://127.0.0.1:8000/redoc" -ForegroundColor Cyan
Write-Host "🏥 Health Check: http://127.0.0.1:8000/health" -ForegroundColor Cyan
Write-Host "Data Info: http://127.0.0.1:8000/data/info" -ForegroundColor Cyan
Write-Host "=" * 50
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
try {
    python api_server.py
} catch {
    Write-Host "Server error occurred" -ForegroundColor Red
}
