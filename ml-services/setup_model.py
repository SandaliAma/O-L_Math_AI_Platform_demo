"""
Quick setup script to verify and configure the DKT model
Run this after placing your dkt_trained_model.keras file
"""

import os
import sys

def check_model_file():
    """Check if model file exists"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(script_dir, 'dkt_trained_model.keras')
    
    if os.path.exists(model_path):
        size = os.path.getsize(model_path) / (1024 * 1024)  # MB
        print(f"✅ Model file found: {model_path}")
        print(f"   Size: {size:.2f} MB")
        return model_path
    else:
        print(f"❌ Model file not found: {model_path}")
        print("\nPlease:")
        print("1. Extract dkt_trained_model_final.zip from Colab")
        print("2. Place dkt_trained_model.keras in the ml-services folder")
        return None

def check_versions():
    """Check TensorFlow and Keras versions"""
    print("\n" + "="*60)
    print("Checking Python Environment...")
    print("="*60)
    
    print(f"Python version: {sys.version.split()[0]}")
    
    try:
        import tensorflow as tf
        print(f"✅ TensorFlow: {tf.__version__}")
    except ImportError:
        print("❌ TensorFlow not installed")
        print("   Install: pip install tensorflow")
        return False
    
    try:
        import keras
        print(f"✅ Keras: {keras.__version__}")
        keras_source = "standalone"
    except ImportError:
        try:
            keras_version = tf.keras.__version__
            print(f"✅ Keras (via TF): {keras_version}")
            keras_source = "tensorflow"
        except:
            print("❌ Keras not available")
            return False
    
    # Check compatibility
    tf_major = int(tf.__version__.split('.')[0])
    tf_minor = int(tf.__version__.split('.')[1])
    
    if tf_major >= 2 and tf_minor >= 15:
        print("✅ Version looks compatible with Keras 3.x models")
    elif tf_major == 2 and tf_minor == 13:
        print("⚠️  TensorFlow 2.13.0 detected - may have compatibility issues")
        print("   Recommendation: Upgrade to TensorFlow 2.15.0+")
        print("   Command: pip install --upgrade tensorflow keras")
    else:
        print("⚠️  Older TensorFlow version - may need upgrade")
    
    return True

def test_model_loading(model_path):
    """Test if model can be loaded"""
    print("\n" + "="*60)
    print("Testing Model Loading...")
    print("="*60)
    
    if not model_path:
        print("❌ Cannot test - model file not found")
        return False
    
    try:
        from dkt_model import DKTModel
        
        print(f"[*] Attempting to load: {model_path}")
        dkt = DKTModel()
        dkt.load_model(model_path)
        print("✅ Model loaded successfully!")
        print(f"   Model architecture: {dkt.model.summary() if hasattr(dkt.model, 'summary') else 'Available'}")
        return True
    except Exception as e:
        print(f"❌ Failed to load model: {str(e)[:300]}")
        print("\n💡 Solutions:")
        print("1. Upgrade TensorFlow: pip install --upgrade tensorflow keras")
        print("2. Or convert model in Colab to H5 format")
        print("3. See TROUBLESHOOTING.md for detailed help")
        return False

def main():
    print("="*60)
    print("DKT Model Setup Verification")
    print("="*60)
    
    # Check model file
    model_path = check_model_file()
    
    # Check versions
    versions_ok = check_versions()
    
    # Test loading
    if model_path and versions_ok:
        test_model_loading(model_path)
    
    print("\n" + "="*60)
    print("Next Steps:")
    print("="*60)
    
    if not model_path:
        print("1. Place dkt_trained_model.keras in ml-services folder")
    elif not versions_ok:
        print("1. Install/upgrade TensorFlow: pip install --upgrade tensorflow keras")
    else:
        print("1. Start the service: python dkt_model.py")
        print("2. Test the API: curl http://localhost:5002/health")
    
    print("3. Read SETUP_MODEL.md for detailed instructions")
    print("="*60)

if __name__ == '__main__':
    main()




