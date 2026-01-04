# ML Services - Python Flask API

This directory contains the Python-based machine learning services for the AI-Enhanced Learning Platform.

## Features

1. **Adaptive Quiz Generation** - ML-based quiz generation with Item Response Theory
2. **Model Paper Generation** - Full exam simulation
3. **Stress Detection** - Decision Tree-based emotional analytics
4. **Text Moderation** - NLP-based content moderation
5. **Sentiment Analysis** - TextBlob-based sentiment analysis

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Download NLTK data (for TextBlob):
```python
import nltk
nltk.download('punkt')
nltk.download('brown')
```

3. Run the service:
```bash
python app.py
```

The service will run on `http://localhost:5001`

## API Endpoints

- `POST /generate-quiz` - Generate adaptive quiz
- `POST /generate-model-paper` - Generate model paper
- `POST /analyze-stress` - Analyze student stress levels
- `POST /moderate-text` - Moderate forum text
- `POST /analyze-sentiment` - Analyze text sentiment

## Models

- **Stress Detection Model**: Decision Tree Classifier (saved in `models/stress_model.pkl`)
- **Item Response Theory**: Used for adaptive quiz question selection

## Environment Variables

- `PORT` - Port number (default: 5001)


