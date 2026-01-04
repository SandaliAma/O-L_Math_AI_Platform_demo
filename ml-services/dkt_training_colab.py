"""
Deep Knowledge Tracing (DKT) Model Training Script for Google Colab
Copy and paste this into Colab cells
"""

# ============================================================================
# CELL 1: Install Dependencies
# ============================================================================
"""
!pip install tensorflow pandas numpy scikit-learn
"""

# ============================================================================
# CELL 2: Upload Files
# ============================================================================
"""
# Upload dkt_model.py and training data
from google.colab import files
files.upload()  # Upload dkt_model.py and dkt_training_data.json
"""

# ============================================================================
# CELL 3: Import Libraries
# ============================================================================
"""
import sys
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from dkt_model import DKTModel
import matplotlib.pyplot as plt
"""

# ============================================================================
# CELL 4: Load Data
# ============================================================================
"""
# Load exported training data
with open('dkt_training_data.json', 'r') as f:
    training_data = json.load(f)

print(f"Loaded {len(training_data)} student sequences")
print(f"Sample sequence length: {len(training_data[0]['interactions']) if training_data else 0}")
"""

# ============================================================================
# CELL 5: Determine Model Parameters
# ============================================================================
"""
# Find unique question and topic IDs
all_question_ids = set()
all_topic_ids = set()

for student_data in training_data:
    for interaction in student_data['interactions']:
        all_question_ids.add(interaction.get('question_id', 0))
        all_topic_ids.add(interaction.get('topic_id', 0))

num_questions = max(all_question_ids) + 1 if all_question_ids else 1000
num_skills = max(all_topic_ids) + 1 if all_topic_ids else 100

print(f"Number of unique questions: {num_questions}")
print(f"Number of unique topics/skills: {num_skills}")
"""

# ============================================================================
# CELL 6: Initialize Model
# ============================================================================
"""
# Initialize DKT model
dkt_model = DKTModel(
    num_skills=num_skills,
    num_questions=num_questions,
    embedding_dim=50,
    hidden_dim=128,
    num_layers=2,
    use_gru=True
)

# Build model
model = dkt_model.build_model()
model.summary()
"""

# ============================================================================
# CELL 7: Split Data
# ============================================================================
"""
# Split into train and validation
train_data, val_data = train_test_split(
    training_data,
    test_size=0.2,
    random_state=42
)

print(f"Training samples: {len(train_data)}")
print(f"Validation samples: {len(val_data)}")
"""

# ============================================================================
# CELL 8: Train Model
# ============================================================================
"""
# Train model
history = dkt_model.train(
    train_data=train_data,
    val_data=val_data,
    epochs=50,
    batch_size=32,
    save_path='models/dkt_model'
)
"""

# ============================================================================
# CELL 9: Plot Training History
# ============================================================================
"""
# Plot training curves
plt.figure(figsize=(12, 4))

plt.subplot(1, 2, 1)
plt.plot(history.history['loss'], label='Train Loss')
plt.plot(history.history['val_loss'], label='Val Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()
plt.title('Model Loss')

plt.subplot(1, 2, 2)
plt.plot(history.history['accuracy'], label='Train Accuracy')
plt.plot(history.history['val_accuracy'], label='Val Accuracy')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.legend()
plt.title('Model Accuracy')

plt.tight_layout()
plt.show()
"""

# ============================================================================
# CELL 10: Test Prediction
# ============================================================================
"""
# Test with sample history
sample_history = [
    {'question_id': 1, 'topic_id': 0, 'is_correct': 1, 'time_taken': 30, 'attempts': 1},
    {'question_id': 2, 'topic_id': 0, 'is_correct': 0, 'time_taken': 60, 'attempts': 2},
    {'question_id': 3, 'topic_id': 1, 'is_correct': 1, 'time_taken': 25, 'attempts': 1}
]

knowledge_vector = dkt_model.predict_knowledge_state(sample_history)
print(f"Knowledge vector shape: {knowledge_vector.shape}")
print(f"Sample mastery scores: {knowledge_vector[:5]}")
"""

# ============================================================================
# CELL 11: Download Model
# ============================================================================
"""
# Create zip file
!zip -r dkt_model.zip models/

# Download
from google.colab import files
files.download('dkt_model.zip')
"""





