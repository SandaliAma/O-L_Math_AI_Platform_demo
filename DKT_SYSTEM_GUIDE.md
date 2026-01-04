# Deep Knowledge Tracing (DKT) System - Complete Guide

## Overview

The DKT system implements adaptive goal setting and topic prioritization using deep learning to predict student mastery and recommend optimal next actions.

## System Architecture

```
MongoDB (Performance Data)
    ↓
Node.js (Data Aggregation)
    ↓
Python DKT Service (Model Inference)
    ↓
Node.js (Recommendation API)
    ↓
Frontend (Display Recommendations)
```

## Components

### 1. Python DKT Model (`ml-services/dkt_model.py`)

**Features**:
- LSTM/GRU-based recurrent neural network
- Predicts mastery state from learning history
- Recommends optimal next questions/topics
- Flask API for Node.js integration

**Model Architecture**:
- Input: Question ID, Topic ID, Correctness, Time, Attempts
- Embedding layers for discrete features
- 2-layer GRU for temporal dependencies
- Output: Mastery probabilities for all topics

### 2. Node.js Services

**DKT Service** (`server/services/dktService.js`):
- Communicates with Python DKT service
- Handles API calls and error handling
- Provides fallback recommendations

**Progress Controller** (`server/services/progressController.js`):
- Aggregates student learning history
- Calls DKT service for predictions
- Implements adaptive goal setting logic
- Updates user profiles with recommendations

### 3. API Endpoints (`server/routes/recommendations.js`)

- `GET /api/recommendations/adaptive` - Get adaptive recommendation
- `GET /api/recommendations/knowledge-state` - Get current knowledge state
- `GET /api/recommendations/dkt-health` - Check DKT service status

### 4. Data Export (`database/exportDKTData.js`)

Exports MongoDB performance data to JSON format for training.

## Workflow

### Training Phase (Google Colab)

1. **Export Data**:
   ```bash
   node database/exportDKTData.js
   ```

2. **Upload to Colab**:
   - Upload `dkt_model.py`
   - Upload `dkt_training_data.json`
   - Follow `dkt_training_colab.py` cells

3. **Train Model**:
   - Model trains on student sequences
   - Saves weights and metadata

4. **Download Model**:
   - Download `dkt_model.zip`
   - Extract to `ml-services/models/`

### Inference Phase (Production)

1. **Start DKT Service**:
   ```bash
   cd ml-services
   python dkt_model.py
   ```

2. **Load Model**:
   ```bash
   curl -X POST http://localhost:5002/load_model \
     -H "Content-Type: application/json" \
     -d '{"model_path": "models/dkt_model"}'
   ```

3. **Use Recommendations**:
   - Frontend calls `/api/recommendations/adaptive`
   - System predicts knowledge state
   - Returns optimal next action

## Data Flow

### Student History Aggregation

```javascript
PerformanceData → Aggregation Pipeline → Sequence Array
```

**Sequence Format**:
```javascript
[
  {
    question_id: 1,
    topic_id: 0,
    is_correct: 1,
    time_taken: 30,
    attempts: 1
  },
  // ... more interactions
]
```

### Knowledge State Prediction

```javascript
Sequence → DKT Model → Knowledge Vector
```

**Knowledge Vector**: Array of mastery probabilities (0-1) for each topic

### Action Recommendation

```javascript
Knowledge Vector + Unattempted Questions → Recommendation
```

**Recommendation Format**:
```javascript
{
  optimal_question_id: "Q000123",
  recommended_topic: "Algebra",
  predicted_success_rate: 0.75,
  mastery_level: 0.65,
  recommended_action: "Take Practice Quiz"
}
```

## Adaptive Goal Setting

The system uses predicted success rates to set goals:

### High Risk (< 0.6)
- **Goal**: Review concepts
- **Action**: Review fundamental concepts
- **Priority**: High

### Optimal Zone (0.6 - 0.8)
- **Goal**: Practice topics
- **Action**: Take practice quiz
- **Priority**: Medium

### Ready for Challenge (> 0.8)
- **Goal**: Challenge yourself
- **Action**: Try model paper simulation
- **Priority**: Low

## API Usage Examples

### Get Adaptive Recommendation

```javascript
// Frontend
const response = await axios.get('/api/recommendations/adaptive');
const { recommendation, goal, knowledge_state } = response.data;

// Response
{
  success: true,
  recommendation: {
    optimal_question_id: "Q000123",
    recommended_topic: "Algebra",
    predicted_success_rate: 0.75,
    mastery_level: 0.65,
    recommended_action: "Take Practice Quiz",
    priority: "medium"
  },
  goal: {
    title: "Practice Algebra",
    description: "You're ready for practice!",
    priority: "medium",
    type: "practice"
  },
  knowledge_state: {
    mastery_scores: { "Algebra": 0.65, ... },
    top_topics: [...],
    weak_topics: [...]
  }
}
```

### Get Knowledge State

```javascript
const response = await axios.get('/api/recommendations/knowledge-state');

// Response
{
  success: true,
  knowledge_state: {
    mastery_scores: {
      "Algebra": 0.75,
      "Geometry": 0.60,
      ...
    },
    top_topics: [
      { topic: "Algebra", mastery: 75 },
      ...
    ],
    weak_topics: [
      { topic: "Trigonometry", mastery: 40 },
      ...
    ]
  }
}
```

## Environment Setup

### Backend (.env)

```env
DKT_SERVICE_URL=http://localhost:5002
```

### Python Service

```python
# In dkt_model.py
app.run(host='0.0.0.0', port=5002)
```

## Testing

### 1. Test DKT Service

```bash
# Health check
curl http://localhost:5002/health

# Load model
curl -X POST http://localhost:5002/load_model \
  -H "Content-Type: application/json" \
  -d '{"model_path": "models/dkt_model"}'

# Predict
curl -X POST http://localhost:5002/predict_knowledge_state \
  -H "Content-Type: application/json" \
  -d '{
    "student_history": [
      {"question_id": 1, "topic_id": 0, "is_correct": 1, "time_taken": 30, "attempts": 1}
    ]
  }'
```

### 2. Test Node.js Integration

```bash
# Get recommendation
curl http://localhost:5000/api/recommendations/adaptive \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get knowledge state
curl http://localhost:5000/api/recommendations/knowledge-state \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Performance Considerations

- **Model Inference**: ~100-200ms per prediction
- **Data Aggregation**: ~50-100ms per student
- **Caching**: Consider caching knowledge states for active sessions
- **Fallback**: Rule-based recommendations if DKT service unavailable

## Troubleshooting

### DKT Service Not Available

The system includes fallback logic:
- Returns default recommendations
- Uses rule-based prioritization
- Logs errors for debugging

### Model Not Loaded

```bash
# Check service health
curl http://localhost:5002/health

# Load model
curl -X POST http://localhost:5002/load_model \
  -H "Content-Type: application/json" \
  -d '{"model_path": "models/dkt_model"}'
```

### No Student History

For new students:
- Returns welcome message
- Suggests starting with practice quiz
- No DKT prediction needed

## Next Steps

1. ✅ Train model in Google Colab
2. ✅ Deploy DKT service
3. ✅ Integrate with frontend
4. ✅ Test with synthetic students
5. ✅ Monitor recommendations quality
6. ✅ Fine-tune model based on feedback

## Files Structure

```
ml-services/
  ├── dkt_model.py              # DKT model and Flask API
  ├── dkt_training_colab.py     # Colab training script
  └── DKT_README.md             # DKT documentation

server/
  ├── services/
  │   ├── dktService.js         # DKT service client
  │   └── progressController.js # Recommendation logic
  └── routes/
      └── recommendations.js    # API endpoints

database/
  └── exportDKTData.js          # Data export script
```

## References

- Deep Knowledge Tracing Paper: Piech et al. (2015)
- TensorFlow/Keras Documentation
- MongoDB Aggregation Framework





