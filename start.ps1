# PowerShell script to start the Template Microservice

Write-Host "Starting Template Microservice..." -ForegroundColor Cyan
Write-Host ""

# Start the server in the current PowerShell session
node src/server.js

