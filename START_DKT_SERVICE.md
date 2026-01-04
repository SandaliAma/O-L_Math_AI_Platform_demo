# How to Start the DKT Service

The DKT (Deep Knowledge Tracing) service is a **separate Python Flask service** that must be running for adaptive recommendations to work.

## Quick Start

### Windows:
1. Open a **new terminal/command prompt**
2. Navigate to the ml-services directory:
   ```bash
   cd ml-services
   ```
3. Run the startup script:
   ```bash
   start_dkt_service.bat
   ```
   
   OR run directly:
   ```bash
   python dkt_model.py
   ```

### Linux/Mac:
1. Open a **new terminal**
2. Navigate to the ml-services directory:
   ```bash
   cd ml-services
   ```
3. Make script executable (first time only):
   ```bash
   chmod +x start_dkt_service.sh
   ```
4. Run the startup script:
   ```bash
   ./start_dkt_service.sh
   ```
   
   OR run directly:
   ```bash
   python3 dkt_model.py
   ```

## Verify It's Running

You should see output like:
```
✓ DKT model loaded successfully from dkt_trained_model.keras
==================================================
🚀 Starting DKT Service on port 5002
==================================================
 * Running on http://0.0.0.0:5002
```

## Test the Service

Open a browser or use curl:
```bash
curl http://localhost:5002/health
```

Expected response:
```json
{
  "status": "OK",
  "model_loaded": true
}
```

## Required Services

For the full system to work, you need **3 services running**:

1. **MongoDB** - Database (usually runs as a service)
2. **Node.js Backend** - Main API server (port 5000)
   ```bash
   npm run dev
   ```
3. **DKT Python Service** - ML predictions (port 5002) ⬅️ **This one!**
   ```bash
   cd ml-services
   python dkt_model.py
   ```

## Troubleshooting

### "Connection refused" error
- Make sure the DKT service is running on port 5002
- Check if another process is using port 5002
- Verify the service started successfully (check for error messages)

### "Model not loaded" warning
- Ensure `dkt_trained_model.keras` exists in `ml-services/` directory
- Check file permissions
- Verify TensorFlow is installed: `pip install tensorflow`

### Port already in use
- Change the port in `ml-services/dkt_model.py` (line 558)
- Update `DKT_SERVICE_URL` in `server/.env` to match

## What Happens Without DKT Service?

The system will still work but will:
- Use fallback rule-based recommendations
- Show warnings in server logs
- Not provide ML-powered adaptive learning features

## Need Help?

Check the logs in the terminal where you started the DKT service for detailed error messages.




