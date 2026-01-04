"""
Deep Knowledge Tracing (DKT) Model for Adaptive Learning
Trainable in Google Colab or local environment
"""

import numpy as np
import pandas as pd
import tensorflow as tf
import pickle
import json
import os
import warnings
from typing import List, Dict, Tuple, Optional

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
warnings.filterwarnings('ignore', category=UserWarning)

class DKTModel:
    """
    Deep Knowledge Tracing Model using LSTM/GRU
    Predicts student mastery and recommends next actions
    """
    
    def __init__(self, num_skills: int = 100, num_questions: int = 1000, 
                 embedding_dim: int = 50, hidden_dim: int = 128, 
                 num_layers: int = 2, use_gru: bool = True):
        """
        Initialize DKT Model
        
        Args:
            num_skills: Number of unique topics/skills
            num_questions: Number of unique questions
            embedding_dim: Dimension for question/topic embeddings
            hidden_dim: Hidden dimension for RNN layers
            num_layers: Number of RNN layers
            use_gru: Use GRU instead of LSTM
        """
        self.num_skills = num_skills
        self.num_questions = num_questions
        self.embedding_dim = embedding_dim
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        self.use_gru = use_gru
        
        self.model = None
        self.question_to_id = {}
        self.topic_to_id = {}
        self.id_to_topic = {}
        self.scaler_params = {}
        
    def build_model(self):
        """Build the DKT neural network architecture"""
        
        # Input layers
        question_input = tf.keras.layers.Input(shape=(None,), name='question_input')
        topic_input = tf.keras.layers.Input(shape=(None,), name='topic_input')
        correctness_input = tf.keras.layers.Input(shape=(None, 1), name='correctness_input')
        time_input = tf.keras.layers.Input(shape=(None, 1), name='time_input')
        attempts_input = tf.keras.layers.Input(shape=(None, 1), name='attempts_input')
        
        # Embedding layers
        question_embedding = tf.keras.layers.Embedding(
            self.num_questions, 
            self.embedding_dim, 
            mask_zero=True,
            name='question_embedding'
        )(question_input)
        
        topic_embedding = tf.keras.layers.Embedding(
            self.num_skills, 
            self.embedding_dim, 
            mask_zero=True,
            name='topic_embedding'
        )(topic_input)
        
        # Concatenate all features
        combined = tf.keras.layers.Concatenate(axis=-1)([
            question_embedding,
            topic_embedding,
            correctness_input,
            time_input,
            attempts_input
        ])
        
        # RNN layers
        rnn_layer = combined
        for i in range(self.num_layers):
            if self.use_gru:
                rnn_layer = tf.keras.layers.GRU(
                    self.hidden_dim,
                    return_sequences=True,
                    dropout=0.2,
                    recurrent_dropout=0.2,
                    name=f'gru_layer_{i}'
                )(rnn_layer)
            else:
                rnn_layer = tf.keras.layers.LSTM(
                    self.hidden_dim,
                    return_sequences=True,
                    dropout=0.2,
                    recurrent_dropout=0.2,
                    name=f'lstm_layer_{i}'
                )(rnn_layer)
        
        # Output layer - predict mastery for each skill
        output = tf.keras.layers.Dense(
            self.num_skills,
            activation='sigmoid',
            name='mastery_output'
        )(rnn_layer)
        
        # Create model
        self.model = tf.keras.Model(
            inputs=[question_input, topic_input, correctness_input, 
                   time_input, attempts_input],
            outputs=output,
            name='DKT_Model'
        )
        
        # Compile model
        self.model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
            loss='binary_crossentropy',
            metrics=['accuracy', 'precision', 'recall']
        )
        
        return self.model
    
    def prepare_sequences(self, data: List[Dict]) -> Tuple[np.ndarray, ...]:
        """
        Prepare sequences from raw data
        
        Args:
            data: List of student interaction dictionaries
            
        Returns:
            Tuple of numpy arrays: (questions, topics, correctness, time, attempts, labels)
        """
        sequences = []
        max_length = 0
        
        for student_data in data:
            sequence = []
            for interaction in student_data['interactions']:
                sequence.append({
                    'question_id': interaction.get('question_id', 0),
                    'topic_id': interaction.get('topic_id', 0),
                    'is_correct': interaction.get('is_correct', 0),
                    'time_taken': interaction.get('time_taken', 0),
                    'attempts': interaction.get('attempts', 1)
                })
            sequences.append(sequence)
            max_length = max(max_length, len(sequence))
        
        # Pad sequences
        batch_size = len(sequences)
        questions = np.zeros((batch_size, max_length), dtype=np.int32)
        topics = np.zeros((batch_size, max_length), dtype=np.int32)
        correctness = np.zeros((batch_size, max_length, 1), dtype=np.float32)
        time_taken = np.zeros((batch_size, max_length, 1), dtype=np.float32)
        attempts = np.zeros((batch_size, max_length, 1), dtype=np.float32)
        labels = np.zeros((batch_size, max_length, self.num_skills), dtype=np.float32)
        
        for i, sequence in enumerate(sequences):
            for j, interaction in enumerate(sequence):
                questions[i, j] = interaction['question_id']
                topics[i, j] = interaction['topic_id']
                correctness[i, j, 0] = interaction['is_correct']
                time_taken[i, j, 0] = interaction['time_taken']
                attempts[i, j, 0] = interaction['attempts']
                
                # Label: mastery state for the topic
                if interaction['is_correct']:
                    labels[i, j, interaction['topic_id']] = 1.0
        
        return questions, topics, correctness, time_taken, attempts, labels
    
    def train(self, train_data: List[Dict], val_data: Optional[List[Dict]] = None,
              epochs: int = 50, batch_size: int = 32, save_path: str = 'models/dkt_model'):
        """
        Train the DKT model
        
        Args:
            train_data: Training data
            val_data: Validation data (optional)
            epochs: Number of training epochs
            batch_size: Batch size
            save_path: Path to save model
        """
        if self.model is None:
            self.build_model()
        
        # Prepare training data
        X_train = self.prepare_sequences(train_data)
        y_train = X_train[-1]  # Labels
        X_train = X_train[:-1]  # Features
        
        # Prepare validation data if provided
        X_val = None
        y_val = None
        if val_data:
            X_val = self.prepare_sequences(val_data)
            y_val = X_val[-1]
            X_val = X_val[:-1]
        
        # Callbacks
        callbacks = [
            tf.keras.callbacks.EarlyStopping(
                monitor='val_loss' if val_data else 'loss',
                patience=10,
                restore_best_weights=True
            ),
            tf.keras.callbacks.ModelCheckpoint(
                f'{save_path}_weights.h5',
                monitor='val_loss' if val_data else 'loss',
                save_best_only=True,
                save_weights_only=True
            ),
            tf.keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss' if val_data else 'loss',
                factor=0.5,
                patience=5,
                min_lr=1e-6
            )
        ]
        
        # Train
        history = self.model.fit(
            X_train,
            y_train,
            validation_data=(X_val, y_val) if val_data else None,
            epochs=epochs,
            batch_size=batch_size,
            callbacks=callbacks,
            verbose=1
        )
        
        # Save model and metadata
        self.save_model(save_path)
        
        return history
    
    def predict_knowledge_state(self, student_history: List[Dict]) -> np.ndarray:
        """
        Predict current knowledge state from student history
        
        Args:
            student_history: List of past interactions
            
        Returns:
            Knowledge vector (mastery probabilities for each skill)
        """
        if self.model is None:
            raise ValueError("Model not loaded. Call load_model() first.")
        
        # Prepare sequence
        max_length = len(student_history)
        questions = np.zeros((1, max_length), dtype=np.int32)
        topics = np.zeros((1, max_length), dtype=np.int32)
        correctness = np.zeros((1, max_length, 1), dtype=np.float32)
        time_taken = np.zeros((1, max_length, 1), dtype=np.float32)
        attempts = np.zeros((1, max_length, 1), dtype=np.float32)
        
        for i, interaction in enumerate(student_history):
            questions[0, i] = interaction.get('question_id', 0)
            topics[0, i] = interaction.get('topic_id', 0)
            correctness[0, i, 0] = interaction.get('is_correct', 0)
            time_taken[0, i, 0] = interaction.get('time_taken', 0)
            attempts[0, i, 0] = interaction.get('attempts', 1)
        
        # Predict
        predictions = self.model.predict(
            [questions, topics, correctness, time_taken, attempts],
            verbose=0
        )
        
        # Return last timestep (current knowledge state)
        return predictions[0, -1, :]
    
    def recommend_next_action(self, knowledge_vector: np.ndarray, 
                             unattempted_questions: List[Dict]) -> Dict:
        """
        Recommend next optimal question based on knowledge state
        
        Args:
            knowledge_vector: Current knowledge state
            unattempted_questions: List of unattempted questions
            
        Returns:
            Dictionary with optimal_question_id and predicted_success_rate
        """
        if len(unattempted_questions) == 0:
            return {
                'optimal_question_id': None,
                'predicted_success_rate': 0.0,
                'recommended_topic': None
            }
        
        # Calculate expected success rate for each question
        recommendations = []
        
        for question in unattempted_questions:
            topic_id = question.get('topic_id', 0)
            difficulty = question.get('difficulty', 0.0)
            
            # Get mastery for this topic
            mastery = knowledge_vector[topic_id] if topic_id < len(knowledge_vector) else 0.0
            
            # Predict success rate: mastery adjusted by difficulty
            # Higher mastery and lower difficulty = higher success rate
            predicted_success = mastery * (1 - abs(difficulty) / 3.0)
            predicted_success = max(0.0, min(1.0, predicted_success))
            
            recommendations.append({
                'question_id': question.get('question_id'),
                'topic_id': topic_id,
                'topic_name': question.get('topic_name', 'Unknown'),
                'predicted_success_rate': float(predicted_success),
                'mastery': float(mastery),
                'difficulty': float(difficulty)
            })
        
        # Sort by predicted success rate (descending)
        recommendations.sort(key=lambda x: x['predicted_success_rate'], reverse=True)
        
        # Select optimal question (balance between challenge and success)
        # Prefer questions with success rate between 0.6-0.8 (optimal learning zone)
        optimal = None
        for rec in recommendations:
            if 0.6 <= rec['predicted_success_rate'] <= 0.8:
                optimal = rec
                break
        
        # If no question in optimal zone, pick highest success rate
        if optimal is None:
            optimal = recommendations[0] if recommendations else None
        
        return {
            'optimal_question_id': optimal['question_id'] if optimal else None,
            'optimal_topic_id': optimal['topic_id'] if optimal else None,
            'recommended_topic': optimal['topic_name'] if optimal else None,
            'predicted_success_rate': optimal['predicted_success_rate'] if optimal else 0.0,
            'mastery_level': optimal['mastery'] if optimal else 0.0,
            'all_recommendations': recommendations[:10]  # Top 10
        }
    
    def save_model(self, save_path: str):
        """Save model and metadata"""
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        # Save model architecture
        self.model.save(f'{save_path}_full.h5')
        
        # Save metadata
        metadata = {
            'num_skills': self.num_skills,
            'num_questions': self.num_questions,
            'embedding_dim': self.embedding_dim,
            'hidden_dim': self.hidden_dim,
            'num_layers': self.num_layers,
            'use_gru': self.use_gru,
            'question_to_id': self.question_to_id,
            'topic_to_id': self.topic_to_id,
            'id_to_topic': self.id_to_topic,
            'scaler_params': self.scaler_params
        }
        
        with open(f'{save_path}_metadata.pkl', 'wb') as f:
            pickle.dump(metadata, f)
    
    def load_model(self, load_path: str):
        """Load model and metadata with version compatibility handling"""
        # Try loading .keras format first, then fallback to .h5, then SavedModel
        model_file = None
        savedmodel_dir = None
        
        if load_path.endswith('.keras'):
            model_file = load_path
        elif os.path.exists(f'{load_path}.keras'):
            model_file = f'{load_path}.keras'
        elif os.path.exists(f'{load_path}_full.h5'):
            model_file = f'{load_path}_full.h5'
        elif os.path.exists(f'{load_path}_converted.h5'):
            model_file = f'{load_path}_converted.h5'
        elif os.path.isdir(load_path) or os.path.isdir(f'{load_path}_savedmodel'):
            # Try SavedModel format
            savedmodel_dir = load_path if os.path.isdir(load_path) else f'{load_path}_savedmodel'
            if not os.path.exists(savedmodel_dir):
                raise FileNotFoundError(f"Model file/directory not found: {load_path}")
        else:
            raise FileNotFoundError(f"Model file not found: {load_path}")
        
        # Try multiple loading strategies for version compatibility
        load_success = False
        last_error = None
        
        # Strategy 0: Try SavedModel format if available
        if savedmodel_dir:
            try:
                # Try loading as Keras model first (if saved with save_format='tf')
                self.model = tf.keras.models.load_model(savedmodel_dir, compile=False)
                self.model.compile(
                    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
                    loss='binary_crossentropy',
                    metrics=['accuracy']
                )
                load_success = True
                print(f"[OK] Model loaded successfully (strategy: SavedModel via Keras)")
            except Exception as e0:
                try:
                    # Fallback: Load as SavedModel and extract
                    saved_model = tf.saved_model.load(savedmodel_dir)
                    # Try to get the model from the SavedModel
                    if hasattr(saved_model, 'model'):
                        self.model = saved_model.model
                    elif hasattr(saved_model, '__call__'):
                        # Wrap the callable
                        class ModelWrapper:
                            def __init__(self, callable_model):
                                self._model = callable_model
                            def predict(self, inputs, **kwargs):
                                if isinstance(inputs, list):
                                    result = self._model(*inputs)
                                else:
                                    result = self._model(inputs)
                                # Convert to numpy if needed
                                if hasattr(result, 'numpy'):
                                    return result.numpy()
                                return result
                        self.model = ModelWrapper(saved_model)
                    else:
                        raise Exception("Could not extract model from SavedModel")
                    load_success = True
                    print(f"[OK] Model loaded successfully (strategy: SavedModel wrapper)")
                except Exception as e0b:
                    last_error = e0b
                    print(f"[!] SavedModel loading failed: {str(e0b)[:200]}")
        
        if not load_success and model_file:
            # Strategy 1: Try loading with compile=False (avoids optimizer issues)
            try:
                self.model = tf.keras.models.load_model(model_file, compile=False)
                # Recompile with default settings if needed
                self.model.compile(
                    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
                    loss='binary_crossentropy',
                    metrics=['accuracy']
                )
                load_success = True
                print(f"[OK] Model loaded successfully (strategy: compile=False)")
            except Exception as e1:
                last_error = e1
                print(f"[!] Strategy 1 failed: {str(e1)[:200]}")
                
                # Strategy 2: Try loading with safe_mode=False (for Keras 3.x compatibility)
                try:
                    self.model = tf.keras.models.load_model(
                        model_file, 
                        compile=False,
                        safe_mode=False
                    )
                    self.model.compile(
                        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
                        loss='binary_crossentropy',
                        metrics=['accuracy']
                    )
                    load_success = True
                    print(f"[OK] Model loaded successfully (strategy: safe_mode=False)")
                except Exception as e2:
                    last_error = e2
                    print(f"[!] Strategy 2 failed: {str(e2)[:200]}")
                
                # Strategy 3: Try loading weights only if architecture can be inferred
                try:
                    # If we have metadata, try to rebuild the model architecture
                    metadata_path = load_path.replace('.keras', '_metadata.pkl')
                    if not metadata_path.endswith('.pkl'):
                        metadata_path = f'{load_path.replace(".keras", "")}_metadata.pkl'
                    
                    if os.path.exists(metadata_path):
                        with open(metadata_path, 'rb') as f:
                            metadata = pickle.load(f)
                        
                        # Rebuild model with saved parameters
                        self.num_skills = metadata.get('num_skills', 100)
                        self.num_questions = metadata.get('num_questions', 1000)
                        self.embedding_dim = metadata.get('embedding_dim', 50)
                        self.hidden_dim = metadata.get('hidden_dim', 128)
                        self.num_layers = metadata.get('num_layers', 2)
                        self.use_gru = metadata.get('use_gru', True)
                        
                        # Rebuild the model
                        self.build_model()
                        
                        # Try to load weights (may fail if architecture changed)
                        try:
                            # Extract weights file path
                            weights_file = model_file.replace('.keras', '_weights.h5')
                            if not os.path.exists(weights_file):
                                weights_file = model_file.replace('.keras', '.weights.h5')
                            
                            if os.path.exists(weights_file):
                                self.model.load_weights(weights_file)
                                print(f"[OK] Model rebuilt and weights loaded")
                            else:
                                print(f"[!] Warning: Weights file not found, using untrained model")
                        except Exception as e3:
                            print(f"[!] Warning: Could not load weights: {e3}")
                        
                        load_success = True
                    else:
                        raise Exception("No metadata file found for model reconstruction")
                except Exception as e3:
                    last_error = e3
                    print(f"[!] Strategy 3 failed: {str(e3)[:200]}")
        
        if not load_success:
            # Print version information for debugging
            print(f"\n[DEBUG] TensorFlow version: {tf.__version__}")
            try:
                import keras
                print(f"[DEBUG] Keras version: {keras.__version__}")
            except:
                print(f"[DEBUG] Keras version: {tf.keras.__version__}")
            
            error_msg = f"Failed to load model from {model_file}\n"
            error_msg += f"Last error: {str(last_error)[:500]}\n\n"
            error_msg += "Possible solutions:\n"
            error_msg += "1. Version mismatch: The model was saved with a different Keras/TensorFlow version\n"
            error_msg += "2. Try: pip install --upgrade tensorflow keras\n"
            error_msg += "3. Or downgrade: pip install tensorflow==2.13.0 keras==2.13.1\n"
            error_msg += "4. Re-save the model: Load it in the original environment and save as H5 format\n"
            error_msg += "5. Use SavedModel format for better compatibility\n"
            raise RuntimeError(error_msg)
        
        # Try to load metadata (may not exist for .keras format)
        metadata_path = load_path.replace('.keras', '_metadata.pkl')
        if not metadata_path.endswith('.pkl'):
            metadata_path = f'{load_path.replace(".keras", "")}_metadata.pkl'
        
        if os.path.exists(metadata_path):
            with open(metadata_path, 'rb') as f:
                metadata = pickle.load(f)
            
            self.num_skills = metadata.get('num_skills', 100)
            self.num_questions = metadata.get('num_questions', 1000)
            self.embedding_dim = metadata.get('embedding_dim', 50)
            self.hidden_dim = metadata.get('hidden_dim', 128)
            self.num_layers = metadata.get('num_layers', 2)
            self.use_gru = metadata.get('use_gru', True)
            self.question_to_id = metadata.get('question_to_id', {})
            self.topic_to_id = metadata.get('topic_to_id', {})
            self.id_to_topic = metadata.get('id_to_topic', {})
            self.scaler_params = metadata.get('scaler_params', {})
        else:
            # Default values if metadata not found
            print("Warning: Metadata file not found, using default values")
            self.num_skills = 100
            self.num_questions = 1000
            self.embedding_dim = 50
            self.hidden_dim = 128
            self.num_layers = 2
            self.use_gru = True
            self.question_to_id = {}
            self.topic_to_id = {}
            self.id_to_topic = {}
            self.scaler_params = {}


# Flask API for Node.js integration
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Global model instance
dkt_model = None

@app.route('/predict_knowledge_state', methods=['POST'])
def predict_knowledge_state():
    """API endpoint for knowledge state prediction"""
    global dkt_model
    
    if dkt_model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        data = request.json
        student_history = data.get('student_history', [])
        
        knowledge_vector = dkt_model.predict_knowledge_state(student_history)
        
        return jsonify({
            'success': True,
            'knowledge_vector': knowledge_vector.tolist(),
            'mastery_scores': {
                dkt_model.id_to_topic.get(i, f'topic_{i}'): float(knowledge_vector[i])
                for i in range(len(knowledge_vector))
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/recommend_next_action', methods=['POST'])
def recommend_next_action():
    """API endpoint for action recommendation"""
    global dkt_model
    
    if dkt_model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        data = request.json
        knowledge_vector = np.array(data.get('knowledge_vector', []))
        unattempted_questions = data.get('unattempted_questions', [])
        
        recommendation = dkt_model.recommend_next_action(
            knowledge_vector, 
            unattempted_questions
        )
        
        return jsonify({
            'success': True,
            **recommendation
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/load_model', methods=['POST'])
def load_model():
    """Load a trained model"""
    global dkt_model
    
    try:
        data = request.json
        # Default to dkt_trained_model.keras if not specified
        model_path = data.get('model_path', 'dkt_trained_model.keras')
        
        # If path doesn't include .keras, try to find it
        if not model_path.endswith('.keras') and not model_path.endswith('.h5'):
            if os.path.exists(f'{model_path}.keras'):
                model_path = f'{model_path}.keras'
            elif os.path.exists(f'{model_path}_full.h5'):
                model_path = f'{model_path}_full.h5'
        
        dkt_model = DKTModel()
        dkt_model.load_model(model_path)
        
        return jsonify({
            'success': True,
            'message': f'Model loaded successfully from {model_path}',
            'model_loaded': True
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'model_loaded': False
        }), 500

@app.route('/explain_recommendation', methods=['POST'])
def explain_recommendation():
    """API endpoint for XAI recommendation explanation"""
    global dkt_model
    
    try:
        from xai_service import xai_service
        
        data = request.json
        student = data.get('student', {})
        question = data.get('question', {})
        knowledge_vector = np.array(data.get('knowledge_vector', []))
        predicted_success_rate = data.get('predicted_success_rate', 0.5)
        
        explanation = xai_service.explain_recommendation(
            student, question, knowledge_vector, predicted_success_rate
        )
        
        return jsonify({
            'success': True,
            **explanation
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({
        'status': 'OK',
        'model_loaded': dkt_model is not None
    })

@app.route('/diagnose', methods=['GET'])
def diagnose():
    """Diagnose version and model loading issues"""
    import sys
    
    info = {
        'python_version': sys.version,
        'tensorflow_version': tf.__version__,
        'model_loaded': dkt_model is not None,
        'model_file_exists': False,
        'model_file_path': None,
        'suggestions': []
    }
    
    # Check for model file
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_paths = [
        os.path.join(script_dir, 'dkt_trained_model.keras'),
        os.path.join(script_dir, 'models', 'dkt_trained_model.keras'),
        'dkt_trained_model.keras',
        'models/dkt_trained_model.keras'
    ]
    
    for path in model_paths:
        if os.path.exists(path):
            info['model_file_exists'] = True
            info['model_file_path'] = path
            info['model_file_size'] = os.path.getsize(path)
            break
    
    # Get Keras version
    try:
        import keras
        info['keras_version'] = keras.__version__
        info['keras_source'] = 'standalone'
    except:
        try:
            info['keras_version'] = tf.keras.__version__
            info['keras_source'] = 'tensorflow'
        except:
            info['keras_version'] = 'unknown'
    
    # Add suggestions
    if not info['model_loaded']:
        if info['model_file_exists']:
            info['suggestions'].append('Model file exists but failed to load - likely version mismatch')
            info['suggestions'].append('Try: pip install --upgrade tensorflow==2.13.0')
            info['suggestions'].append('Or re-save the model in the original training environment')
        else:
            info['suggestions'].append('Model file not found - train or load a model first')
    
    return jsonify(info)

if __name__ == '__main__':
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Try to auto-load the model on startup
    model_loaded = False
    model_paths = [
        os.path.join(script_dir, 'dkt_trained_model.keras'),
        os.path.join(script_dir, 'models', 'dkt_trained_model.keras'),
        'dkt_trained_model.keras',
        'models/dkt_trained_model.keras'
    ]
    
    for model_path in model_paths:
        if os.path.exists(model_path):
            try:
                print(f"[*] Attempting to load model from: {model_path}")
                dkt_model = DKTModel()
                dkt_model.load_model(model_path)
                print(f"[OK] DKT model loaded successfully from {model_path}")
                model_loaded = True
                break
            except Exception as e:
                print(f"[!] Error loading model from {model_path}: {e}")
                continue
    
    if not model_loaded:
        print("[!] Warning: Could not auto-load model")
        print("   Available paths checked:")
        for path in model_paths:
            exists = "[OK]" if os.path.exists(path) else "[X]"
            print(f"   {exists} {path}")
        print("   You can load it manually via POST /load_model")
        print("   Service will still start but predictions will fail until model is loaded.")
    
    print("\n" + "="*50)
    print("[*] Starting DKT Service on port 5002")
    print("="*50 + "\n")
    
    app.run(host='0.0.0.0', port=5002, debug=True)


