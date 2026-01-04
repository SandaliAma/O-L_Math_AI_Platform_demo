# Setting Up Your Colab-Trained DKT Model

## Step 1: Extract and Place the Model File

If you downloaded `dkt_trained_model_final.zip` from Colab:

1. **Extract the zip file** to get `dkt_trained_model.keras`
2. **Place it in the `ml-services` folder**:
   ```
   ml-services/
   ├── dkt_trained_model.keras  ← Your model file should be here
   ├── dkt_model.py
   └── ...
   ```

✅ **Check**: The file should already be there! (`dkt_trained_model.keras` exists)

## Step 2: Choose Your Approach

You have **2 options** to fix the version compatibility issue:

### Option A: Upgrade Your Environment (Recommended - Easiest)

This matches your Colab environment (likely Keras 3.x):

```bash
# Navigate to ml-services directory
cd ml-services

# Upgrade TensorFlow and Keras to latest versions
pip install --upgrade tensorflow keras

# Or install specific compatible versions
pip install tensorflow==2.15.0 keras==2.15.0

# Verify installation
python -c "import tensorflow as tf; print('TF:', tf.__version__); import keras; print('Keras:', keras.__version__)"
```

**Then start the service:**
```bash
python dkt_model.py
```

### Option B: Convert Model to Compatible Format (If you can't upgrade)

If you need to keep TensorFlow 2.13.0, convert the model in Colab first:

**In Google Colab, add this cell after training:**

```python
# Convert model to H5 format (more compatible)
model.save("dkt_trained_model.h5", save_format='h5')

# Or save as SavedModel (most compatible)
model.save("dkt_trained_model_savedmodel", save_format='tf')

# Zip and download
!zip -r dkt_trained_model_compatible.zip dkt_trained_model.h5 dkt_trained_model_savedmodel
from google.colab import files
files.download("dkt_trained_model_compatible.zip")
```

Then use the converted model in your local environment.

## Step 3: Test the Model Loading

### Quick Test

```bash
cd ml-services
python -c "from dkt_model import DKTModel; m = DKTModel(); m.load_model('dkt_trained_model.keras'); print('✅ Model loaded successfully!')"
```

### Start the Service

```bash
cd ml-services
python dkt_model.py
```

You should see:
```
[OK] DKT model loaded successfully from ...
[*] Starting DKT Service on port 5002
```

### Check Service Health

Open a new terminal and run:
```bash
# Check if service is running
curl http://localhost:5002/health

# Get diagnostic information
curl http://localhost:5002/diagnose
```

## Step 4: Verify It Works

Test a prediction:

```bash
curl -X POST http://localhost:5002/predict_knowledge_state \
  -H "Content-Type: application/json" \
  -d '{
    "student_history": [
      {"question_id": 1, "topic_id": 0, "is_correct": 1, "time_taken": 30, "attempts": 1},
      {"question_id": 2, "topic_id": 0, "is_correct": 0, "time_taken": 45, "attempts": 2}
    ]
  }'
```

## Troubleshooting

### If model still won't load:

1. **Check versions match:**
   ```bash
   python -c "import tensorflow as tf; print(tf.__version__)"
   ```
   Should be 2.15.0+ for Keras 3.x models

2. **Try manual loading via API:**
   ```bash
   curl -X POST http://localhost:5002/load_model \
     -H "Content-Type: application/json" \
     -d '{"model_path": "dkt_trained_model.keras"}'
   ```

3. **Check the diagnostic endpoint:**
   ```bash
   curl http://localhost:5002/diagnose
   ```

4. **See detailed troubleshooting:**
   - Read `TROUBLESHOOTING.md` for more solutions

## What's Next?

Once the model loads successfully:

1. ✅ Your Node.js service will be able to call the DKT predictions
2. ✅ The `/api/recommendations/adaptive` endpoint will work
3. ✅ No more "Model not loaded" errors!

## Quick Reference

| Task | Command |
|------|---------|
| Upgrade TF/Keras | `pip install --upgrade tensorflow keras` |
| Start service | `python dkt_model.py` |
| Check health | `curl http://localhost:5002/health` |
| Get diagnostics | `curl http://localhost:5002/diagnose` |
| Manual load | `curl -X POST http://localhost:5002/load_model -H "Content-Type: application/json" -d '{"model_path": "dkt_trained_model.keras"}'` |




