# Quick Start: Using Your Colab-Trained Model

## 🚀 Fast Setup (3 Steps)

### Step 1: Extract Model File
If you downloaded `dkt_trained_model_final.zip` from Colab:
- Extract it
- Place `dkt_trained_model.keras` in the `ml-services` folder

✅ **Already done?** The file is already there!

### Step 2: Upgrade TensorFlow (Required)
Your Colab model was saved with Keras 3.x, but your local environment has TensorFlow 2.13.0.

```bash
cd ml-services
pip install --upgrade tensorflow keras
```

### Step 3: Test & Run
```bash
# Verify setup
python setup_model.py

# Start the service
python dkt_model.py
```

You should see: `[OK] DKT model loaded successfully`

## ✅ That's It!

Your Node.js service will now be able to use the DKT model for predictions.

## 🔍 Verify It Works

```bash
# In a new terminal
curl http://localhost:5002/health
```

Should return: `{"status":"OK","model_loaded":true}`

## ❌ Having Issues?

1. **Run the setup checker:**
   ```bash
   python setup_model.py
   ```

2. **Check diagnostics:**
   ```bash
   curl http://localhost:5002/diagnose
   ```

3. **Read detailed guides:**
   - `SETUP_MODEL.md` - Complete setup instructions
   - `TROUBLESHOOTING.md` - Fix common issues

## 📝 Alternative: Convert Model in Colab

If you can't upgrade TensorFlow, convert the model in Colab:

```python
# Add this cell in Colab after training
model.save("dkt_trained_model.h5", save_format='h5')
!zip dkt_trained_model_compatible.zip dkt_trained_model.h5
from google.colab import files
files.download("dkt_trained_model_compatible.zip")
```

Then use the `.h5` file instead.




