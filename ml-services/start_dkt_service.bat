@echo off
echo ========================================
echo Starting DKT Service (Port 5002)
echo ========================================
echo.

cd /d %~dp0

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

REM Check if model file exists
if exist "dkt_trained_model.keras" (
    echo Found model file: dkt_trained_model.keras
) else (
    echo WARNING: Model file dkt_trained_model.keras not found
    echo Service will start but model needs to be loaded manually
)

echo.
echo Starting Flask service...
echo Service will be available at: http://localhost:5002
echo Press Ctrl+C to stop the service
echo.

python dkt_model.py

pause




