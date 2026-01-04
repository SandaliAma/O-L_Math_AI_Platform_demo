"""
Helper script to convert DKT model to compatible format
Run this in the environment where the model was originally saved
"""

import os
import sys
import tensorflow as tf
import numpy as np

def convert_model(input_path, output_path=None):
    """
    Convert a .keras model to .h5 format for better compatibility
    
    Args:
        input_path: Path to the .keras model file
        output_path: Path to save the converted .h5 model (optional)
    """
    if output_path is None:
        output_path = input_path.replace('.keras', '_converted.h5')
    
    print(f"[*] Loading model from: {input_path}")
    print(f"[*] TensorFlow version: {tf.__version__}")
    
    try:
        # Try loading the model
        model = tf.keras.models.load_model(input_path, compile=False)
        print("[OK] Model loaded successfully")
        
        # Save in H5 format (more compatible)
        print(f"[*] Saving converted model to: {output_path}")
        model.save(output_path, save_format='h5')
        print("[OK] Model converted and saved successfully!")
        
        # Also save weights separately
        weights_path = output_path.replace('.h5', '_weights.h5')
        model.save_weights(weights_path)
        print(f"[OK] Weights saved to: {weights_path}")
        
        return True
    except Exception as e:
        print(f"[!] Error: {e}")
        print("\nTroubleshooting steps:")
        print("1. Ensure you're using the same TensorFlow/Keras version as when the model was saved")
        print("2. Try: pip install --upgrade tensorflow keras")
        print("3. If using Keras 3.x, try: pip install tensorflow==2.13.0")
        return False

def save_as_savedmodel(input_path, output_dir=None):
    """
    Convert model to SavedModel format (most compatible)
    
    Args:
        input_path: Path to the .keras model file
        output_dir: Directory to save SavedModel (optional)
    """
    if output_dir is None:
        output_dir = input_path.replace('.keras', '_savedmodel')
    
    print(f"[*] Loading model from: {input_path}")
    
    try:
        model = tf.keras.models.load_model(input_path, compile=False)
        print("[OK] Model loaded successfully")
        
        print(f"[*] Saving as SavedModel to: {output_dir}")
        model.save(output_dir, save_format='tf')
        print("[OK] SavedModel created successfully!")
        
        return True
    except Exception as e:
        print(f"[!] Error: {e}")
        return False

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python convert_model.py <model_path> [output_path]")
        print("Example: python convert_model.py dkt_trained_model.keras")
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None
    
    if not os.path.exists(input_path):
        print(f"[!] Error: Model file not found: {input_path}")
        sys.exit(1)
    
    # Try H5 conversion first
    print("=" * 60)
    print("Attempting H5 conversion...")
    print("=" * 60)
    success = convert_model(input_path, output_path)
    
    if success:
        print("\n" + "=" * 60)
        print("Model conversion completed successfully!")
        print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print("H5 conversion failed. Trying SavedModel format...")
        print("=" * 60)
        savedmodel_dir = output_path.replace('.h5', '_savedmodel') if output_path else None
        save_as_savedmodel(input_path, savedmodel_dir)




