# DKT Model Loading Troubleshooting Guide

## Problem: "Could not deserialize class 'Functional' because its parent module keras.src.models.functional cannot be imported"

This error occurs when there's a **Keras/TensorFlow version mismatch** between the environment where the model was saved and the current environment.

## Quick Solutions

### Solution 1: Upgrade TensorFlow/Keras (Recommended)

The model was likely saved with Keras 3.x, but your environment has TensorFlow 2.13.0 (Keras 2.x).

```bash
# Upgrade to latest TensorFlow (includes Keras 3.x)
pip install --upgrade tensorflow keras

# Or install specific compatible versions
pip install tensorflow==2.15.0 keras==2.15.0
```

Then restart the service:
```bash
python dkt_model.py
```

### Solution 2: Re-save the Model in Compatible Format

If you have access to the original training environment:

1. **Convert to H5 format** (more compatible):
```python
# In the original environment
import tensorflow as tf
model = tf.keras.models.load_model('dkt_trained_model.keras')
model.save('dkt_trained_model_converted.h5', save_format='h5')
```

2. **Or use the conversion script**:
```bash
python convert_model.py dkt_trained_model.keras
```

### Solution 3: Use SavedModel Format (Most Compatible)

```python
# In the original environment
model = tf.keras.models.load_model('dkt_trained_model.keras')
model.save('dkt_trained_model_savedmodel', save_format='tf')
```

Then update the model path in your code to point to the SavedModel directory.

### Solution 4: Check and Match Versions

1. **Check current versions**:
```bash
python -c "import tensorflow as tf; print('TF:', tf.__version__); import keras; print('Keras:', keras.__version__)"
```

2. **Check what version saved the model**:
   - Look at the error message - if it mentions `keras.src.models.functional`, it was saved with Keras 3.x
   - If it mentions `keras.engine.functional`, it was saved with Keras 2.x

3. **Match the version**:
```bash
# For Keras 3.x models
pip install tensorflow>=2.15.0

# For Keras 2.x models  
pip install tensorflow==2.13.0 keras==2.13.1
```

## Diagnostic Endpoints

The service now includes a diagnostic endpoint:

```bash
# Check service status and versions
curl http://localhost:5002/diagnose
```

This will show:
- Python version
- TensorFlow version
- Keras version
- Model file status
- Suggestions for fixing issues

## Manual Model Loading

If auto-loading fails, you can manually load the model via API:

```bash
curl -X POST http://localhost:5002/load_model \
  -H "Content-Type: application/json" \
  -d '{"model_path": "dkt_trained_model.keras"}'
```

Or try alternative formats:
```bash
# Try H5 format
curl -X POST http://localhost:5002/load_model \
  -H "Content-Type: application/json" \
  -d '{"model_path": "dkt_trained_model_converted.h5"}'

# Try SavedModel format
curl -X POST http://localhost:5002/load_model \
  -H "Content-Type: application/json" \
  -d '{"model_path": "dkt_trained_model_savedmodel"}'
```

## Common Issues

### Issue: Model loads but predictions fail

**Cause**: Model architecture mismatch or missing metadata

**Solution**: 
- Check if the model architecture matches your code
- Ensure metadata file exists (`dkt_trained_model_metadata.pkl`)
- Rebuild the model if architecture changed

### Issue: "Model not loaded" error persists

**Cause**: Model file not found or loading failed silently

**Solution**:
1. Check file exists: `ls -la ml-services/dkt_trained_model.keras`
2. Check file permissions
3. Try absolute path: `{"model_path": "/full/path/to/model.keras"}`
4. Check service logs for detailed error messages

### Issue: Different architectures between saved model and code

**Cause**: The saved model has a different architecture than `build_model()`

**Solution**:
- Option 1: Update `build_model()` to match the saved model architecture
- Option 2: Retrain the model with the current architecture
- Option 3: Load only weights (if architecture is compatible)

## Prevention

To avoid this issue in the future:

1. **Pin versions** in `requirements.txt`:
```
tensorflow==2.15.0
keras==2.15.0
```

2. **Save in multiple formats**:
```python
# Save in both .keras and .h5 formats
model.save('model.keras')
model.save('model.h5', save_format='h5')
```

3. **Document the environment**:
   - Keep a record of TensorFlow/Keras versions used for training
   - Use virtual environments
   - Consider using Docker for consistent environments

## Still Having Issues?

1. Check the full error message in the service logs
2. Run the diagnostic endpoint: `GET /diagnose`
3. Verify file paths and permissions
4. Try loading in a fresh Python environment
5. Check if the model file is corrupted (file size should be > 0)




