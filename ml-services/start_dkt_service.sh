#!/bin/bash

echo "========================================"
echo "Starting DKT Service (Port 5002)"
echo "========================================"
echo ""

# Get the directory where this script is located
cd "$(dirname "$0")"

# Check if Python is available
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "ERROR: Python is not installed or not in PATH"
    echo "Please install Python 3.8+ and try again"
    exit 1
fi

# Use python3 if available, otherwise python
PYTHON_CMD=$(command -v python3 || command -v python)

# Check if model file exists
if [ -f "dkt_trained_model.keras" ]; then
    echo "Found model file: dkt_trained_model.keras"
else
    echo "WARNING: Model file dkt_trained_model.keras not found"
    echo "Service will start but model needs to be loaded manually"
fi

echo ""
echo "Starting Flask service..."
echo "Service will be available at: http://localhost:5002"
echo "Press Ctrl+C to stop the service"
echo ""

$PYTHON_CMD dkt_model.py




