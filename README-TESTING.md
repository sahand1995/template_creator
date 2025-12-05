# Testing the Template Microservice

## Quick Start

### Option 1: Direct Node Command (Recommended for Testing)

```powershell
node src/server.js
```

This will show all output immediately. Press `Ctrl+C` to stop.

### Option 2: Using npm start

```powershell
npm start
```

### Option 3: Using PowerShell Script

```powershell
.\start.ps1
```

### Option 4: Development Mode with Auto-Reload

```powershell
npm run dev
```

**Note**: If you don't see output in PowerShell, try:
1. Run `node src/server.js` directly to see output
2. Or open a new terminal and test: `Invoke-WebRequest -Uri http://localhost:3001/health`

## Verify Server is Running

Once started, you should see:
```
Template Microservice running on port 3001
Environment: development
Django Base URL: http://localhost:8000
```

Test it in another terminal:
```powershell
Invoke-WebRequest -Uri http://localhost:3001/health -Method GET
```

Expected response:
```json
{
  "status": "ok",
  "service": "template-microservice",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Common Issues

### Server starts but no output shown
- This is a PowerShell output buffering issue
- The server is likely running - test with the health endpoint
- Use `node src/server.js` directly to see output

### Port 3001 already in use
- Stop any existing Node processes: `Get-Process node | Stop-Process`
- Or change the port in `.env` file

### Module not found errors
- Run: `npm install --ignore-scripts`
- Then: `npx puppeteer browsers install chrome`

