from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from textblob import TextBlob
import pickle
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Initialize models
stress_model = None
stress_model_path = 'models/stress_model.pkl'

# Sample question bank for quiz generation
SAMPLE_QUESTIONS = {
    'algebra': [
        {
            'question': 'If $x + 5 = 12$, what is the value of $x$?',
            'options': ['7', '17', '2', '10'],
            'correctAnswer': 0,
            'difficulty': 'easy',
            'topic': 'algebra',
            'syllabusUnit': 'Basic Algebra',
            'marks': 1
        },
        {
            'question': 'Solve for $x$: $2x^2 - 8x + 6 = 0$',
            'options': ['$x = 1$ or $x = 3$', '$x = 2$ or $x = 4$', '$x = -1$ or $x = -3$', 'No solution'],
            'correctAnswer': 0,
            'difficulty': 'medium',
            'topic': 'algebra',
            'syllabusUnit': 'Quadratic Equations',
            'marks': 2
        }
    ],
    'geometry': [
        {
            'question': 'What is the area of a circle with radius 7 cm? (Use $\\pi = \\frac{22}{7}$)',
            'options': ['154 cm²', '44 cm²', '22 cm²', '308 cm²'],
            'correctAnswer': 0,
            'difficulty': 'easy',
            'topic': 'geometry',
            'syllabusUnit': 'Circles',
            'marks': 1
        }
    ],
    'trigonometry': [
        {
            'question': 'If $\\sin \\theta = \\frac{1}{2}$, what is the value of $\\cos \\theta$?',
            'options': ['$\\frac{\\sqrt{3}}{2}$', '$\\frac{1}{2}$', '$\\frac{\\sqrt{2}}{2}$', '1'],
            'correctAnswer': 0,
            'difficulty': 'medium',
            'topic': 'trigonometry',
            'syllabusUnit': 'Trigonometric Ratios',
            'marks': 1
        }
    ],
    'statistics': [
        {
            'question': 'What is the mean of the numbers 5, 7, 9, 11, 13?',
            'options': ['8', '9', '10', '11'],
            'correctAnswer': 1,
            'difficulty': 'easy',
            'topic': 'statistics',
            'syllabusUnit': 'Central Tendency',
            'marks': 1
        }
    ]
}

def load_or_train_stress_model():
    """Load existing stress model or train a new one"""
    global stress_model
    
    if os.path.exists(stress_model_path):
        try:
            with open(stress_model_path, 'rb') as f:
                stress_model = pickle.load(f)
            print("Loaded existing stress model")
            return
        except Exception as e:
            print(f"Error loading model: {e}")
    
    # Train a simple stress detection model
    # Using synthetic data for training
    np.random.seed(42)
    n_samples = 200
    
    # Features: [response_delay, session_duration, error_rate, time_spent_today, recent_activity]
    X = np.random.rand(n_samples, 5)
    X[:, 0] = X[:, 0] * 60  # response_delay: 0-60 seconds
    X[:, 1] = X[:, 1] * 120  # session_duration: 0-120 minutes
    X[:, 2] = X[:, 2]  # error_rate: 0-1
    X[:, 3] = X[:, 3] * 300  # time_spent_today: 0-300 minutes
    X[:, 4] = X[:, 4] * 10  # recent_activity: 0-10
    
    # Stress level: higher error rate + longer delays + very long sessions = higher stress
    y = (X[:, 2] * 0.4 + (X[:, 0] > 30) * 0.2 + (X[:, 1] > 90) * 0.2 + 
         (X[:, 3] > 240) * 0.2) * 100
    y = np.clip(y, 0, 100)
    y = (y > 50).astype(int)  # Binary: stressed (1) or not (0)
    
    # Train model
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    stress_model = DecisionTreeClassifier(max_depth=5, random_state=42)
    stress_model.fit(X_train, y_train)
    
    # Save model
    os.makedirs('models', exist_ok=True)
    with open(stress_model_path, 'wb') as f:
        pickle.dump(stress_model, f)
    
    print(f"Trained new stress model. Accuracy: {stress_model.score(X_test, y_test):.2f}")

def initialize_models():
    """Initialize all ML models"""
    load_or_train_stress_model()

# Initialize on startup
initialize_models()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'OK', 'message': 'ML Service is running'})

@app.route('/generate-quiz', methods=['POST'])
def generate_quiz():
    """Generate adaptive quiz based on user performance"""
    try:
        data = request.json
        user_id = data.get('userId')
        quiz_type = data.get('type', 'adaptive')
        topic = data.get('topic')
        difficulty = data.get('difficulty', 'medium')
        user_performance = data.get('userPerformance', {})
        
        # Determine difficulty based on user performance
        avg_score = user_performance.get('averageScore', 50)
        
        if avg_score >= 80:
            target_difficulty = 'hard'
        elif avg_score >= 60:
            target_difficulty = 'medium'
        else:
            target_difficulty = 'easy'
        
        # Select questions based on topic and difficulty
        selected_questions = []
        topics_to_use = [topic] if topic else ['algebra', 'geometry', 'trigonometry', 'statistics']
        
        for topic_name in topics_to_use:
            if topic_name in SAMPLE_QUESTIONS:
                topic_questions = [q for q in SAMPLE_QUESTIONS[topic_name] 
                                 if q['difficulty'] == target_difficulty or difficulty == 'mixed']
                if not topic_questions:
                    # Fallback to any difficulty
                    topic_questions = SAMPLE_QUESTIONS[topic_name]
                
                selected_questions.extend(topic_questions[:2])  # Take 2 per topic
        
        # Limit total questions
        num_questions = 10 if quiz_type == 'adaptive' else 25
        selected_questions = selected_questions[:num_questions]
        
        # Add IRT parameters (Item Response Theory)
        for i, q in enumerate(selected_questions):
            q['questionId'] = f'q_{i+1}'
            q['irtParameters'] = {
                'discrimination': np.random.uniform(0.5, 2.0),
                'difficulty': np.random.uniform(-2, 2),
                'guessing': 0.25 if len(q['options']) == 4 else 0.5
            }
            q['explanation'] = f"Explanation for question {i+1}"
        
        return jsonify({
            'success': True,
            'questions': selected_questions,
            'adaptiveParams': {
                'initialDifficulty': target_difficulty,
                'adjustments': []
            },
            'timeLimit': num_questions * 2  # 2 minutes per question
        })
    
    except Exception as e:
        print(f"Error generating quiz: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/generate-model-paper', methods=['POST'])
def generate_model_paper():
    """Generate full model paper (exam simulation)"""
    try:
        data = request.json
        user_id = data.get('userId')
        user_performance = data.get('userPerformance', {})
        
        # Model paper should have questions from all topics
        all_questions = []
        for topic, questions in SAMPLE_QUESTIONS.items():
            all_questions.extend(questions)
        
        # Select 25 questions (full exam)
        selected_questions = all_questions[:25]
        
        # Add question IDs and IRT parameters
        for i, q in enumerate(selected_questions):
            q['questionId'] = f'mp_q_{i+1}'
            q['irtParameters'] = {
                'discrimination': np.random.uniform(0.5, 2.0),
                'difficulty': np.random.uniform(-2, 2),
                'guessing': 0.25
            }
            q['explanation'] = f"Model paper question {i+1}"
        
        return jsonify({
            'success': True,
            'questions': selected_questions,
            'timeLimit': 180  # 3 hours
        })
    
    except Exception as e:
        print(f"Error generating model paper: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/analyze-stress', methods=['POST'])
def analyze_stress():
    """Analyze student behavior for stress detection using Decision Tree"""
    try:
        data = request.json
        indicators = data.get('indicators', {})
        
        # Extract features
        response_delay = indicators.get('responseDelay', 0)
        session_duration = indicators.get('avgSessionDuration', 0)
        error_rate = indicators.get('avgErrorRate', 0)
        time_spent_today = indicators.get('timeSpentToday', 0)
        recent_activity = indicators.get('recentActivity', 0)
        
        # Prepare feature vector
        features = np.array([[response_delay, session_duration, error_rate, 
                             time_spent_today, recent_activity]])
        
        # Predict using Decision Tree model
        stress_prediction = stress_model.predict(features)[0]
        stress_probability = stress_model.predict_proba(features)[0][1]
        
        # Calculate stress level (0-100)
        stress_level = stress_probability * 100
        
        # Add additional factors
        if error_rate > 0.7:
            stress_level = min(100, stress_level + 20)
        if session_duration > 120:
            stress_level = min(100, stress_level + 15)
        if time_spent_today > 240:
            stress_level = min(100, stress_level + 10)
        
        stress_level = np.clip(stress_level, 0, 100)
        
        # Generate recommendations
        if stress_level > 70:
            recommendation = 'Take a 15-minute break. Try easier practice questions when you return.'
            motivational_message = 'Remember, learning is a journey. It\'s okay to take breaks!'
        elif stress_level > 50:
            recommendation = 'Consider taking a short break. Try switching to a different topic.'
            motivational_message = 'You\'re making progress! Keep up the good work.'
        else:
            recommendation = 'Continue with your current pace. You\'re doing well!'
            motivational_message = 'Excellent work! You\'re managing your learning effectively.'
        
        return jsonify({
            'success': True,
            'stressLevel': float(stress_level),
            'recommendation': recommendation,
            'motivationalMessage': motivational_message,
            'indicators': {
                'responseDelay': float(response_delay),
                'sessionDuration': float(session_duration),
                'errorRate': float(error_rate),
                'timeSpentToday': float(time_spent_today),
                'recentActivity': int(recent_activity)
            }
        })
    
    except Exception as e:
        print(f"Error analyzing stress: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/moderate-text', methods=['POST'])
def moderate_text():
    """Moderate forum text for inappropriate content using NLP"""
    try:
        data = request.json
        text = data.get('text', '')
        text_type = data.get('type', 'post')
        
        # Simple moderation rules (can be enhanced with ML models)
        inappropriate_words = ['spam', 'inappropriate', 'offensive']  # Example words
        text_lower = text.lower()
        
        is_moderated = False
        moderation_score = 0.0
        reason = ''
        
        # Check for inappropriate content
        for word in inappropriate_words:
            if word in text_lower:
                is_moderated = True
                moderation_score = 0.8
                reason = 'Contains potentially inappropriate content'
                break
        
        # Check text length
        if len(text) < 10:
            is_moderated = True
            moderation_score = 0.9
            reason = 'Text too short'
        elif len(text) > 5000:
            is_moderated = True
            moderation_score = 0.7
            reason = 'Text too long'
        
        return jsonify({
            'success': True,
            'isModerated': is_moderated,
            'score': moderation_score,
            'reason': reason
        })
    
    except Exception as e:
        print(f"Error moderating text: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/analyze-sentiment', methods=['POST'])
def analyze_sentiment():
    """Analyze sentiment of text using TextBlob"""
    try:
        data = request.json
        text = data.get('text', '')
        
        # Use TextBlob for sentiment analysis
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity
        
        # Classify sentiment
        if polarity > 0.1:
            sentiment = 'positive'
        elif polarity < -0.1:
            sentiment = 'negative'
        else:
            sentiment = 'neutral'
        
        return jsonify({
            'success': True,
            'sentiment': sentiment,
            'polarity': float(polarity)
        })
    
    except Exception as e:
        print(f"Error analyzing sentiment: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)


