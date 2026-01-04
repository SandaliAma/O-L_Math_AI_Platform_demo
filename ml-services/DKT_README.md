# Deep Knowledge Tracing (DKT) Model

## Overview

The DKT model predicts student mastery states and recommends optimal next actions for adaptive learning.

## Architecture

### Model Components

1. **Input Features**:
   - Question ID (embedded)
   - Topic ID (embedded)
   - Correctness (binary)
   - Time taken (normalized)
   - Attempts count (normalized)

2. **Neural Network**:
   - Embedding layers for discrete features
   - 2-layer GRU/LSTM for temporal dependencies
   - Dense output layer with sigmoid activation

3. **Output**:
   - Knowledge vector (mastery probabilities for each topic)
   - Recommendation (optimal next question/topic)

## Training in Google Colab

### Step 1: Export Data from MongoDB

```bash
node database/exportDKTData.js
```

This creates `database/dkt_training_data.json` with student learning sequences.

### Step 2: Upload to Colab

1. Open `ml-services/dkt_training_colab.ipynb` in Google Colab
2. Upload `dkt_training_data.json`
3. Run all cells

### Step 3: Download Trained Model

After training, download `dkt_model.zip` and extract to `ml-services/models/`

## Running the DKT Service

### Prerequisites

1. **Python 3.8+** installed
2. **TensorFlow 2.13+** installed (see `requirements.txt`)
3. **Model file** `dkt_trained_model.keras` in `ml-services/` directory

### Start Python Service

**Option 1: Using startup script (Recommended)**

**Windows:**
```bash
cd ml-services
start_dkt_service.bat
```

**Linux/Mac:**
```bash
cd ml-services
chmod +x start_dkt_service.sh
./start_dkt_service.sh
```

**Option 2: Direct Python command**
```bash
cd ml-services
python dkt_model.py
```

Service runs on `http://localhost:5002`

### Verify Service is Running

Check health endpoint:
```bash
curl http://localhost:5002/health
```

Expected response:
```json
{
  "status": "OK",
  "model_loaded": true
}
```

### Troubleshooting

**Model not loading:**
- Ensure `dkt_trained_model.keras` is in the `ml-services/` directory
- Check file permissions
- Verify TensorFlow is installed: `python -c "import tensorflow; print(tensorflow.__version__)"`

**Port already in use:**
- Change port in `dkt_model.py` line 558: `app.run(host='0.0.0.0', port=5002, debug=True)`
- Update `DKT_SERVICE_URL` in `server/.env` to match new port

### Load Model

```bash
curl -X POST http://localhost:5002/load_model \
  -H "Content-Type: application/json" \
  -d '{"model_path": "models/dkt_model"}'
```

## API Endpoints

### Predict Knowledge State

```bash
POST /predict_knowledge_state
{
  "student_history": [
    {
      "question_id": 1,
      "topic_id": 0,
      "is_correct": 1,
      "time_taken": 30,
      "attempts": 1
    }
  ]
}
```

### Recommend Next Action

```bash
POST /recommend_next_action
{
  "knowledge_vector": [0.8, 0.6, 0.4, ...],
  "unattempted_questions": [
    {
      "question_id": 10,
      "topic_id": 1,
      "topic_name": "Algebra",
      "difficulty": 0.5
    }
  ]
}
```

## Node.js Integration

### Get Adaptive Recommendation

```javascript
GET /api/recommendations/adaptive
```

Returns:
- Optimal question/topic
- Predicted success rate
- Goal setting information
- Knowledge state summary

### Get Knowledge State

```javascript
GET /api/recommendations/knowledge-state
```

Returns:
- Mastery scores for all topics
- Top performing topics
- Weak topics

## Environment Variables

```env
DKT_SERVICE_URL=http://localhost:5002
```

## Model Parameters

- **num_skills**: Number of topics (default: 100)
- **num_questions**: Number of questions (default: 1000)
- **embedding_dim**: Embedding dimension (default: 50)
- **hidden_dim**: GRU/LSTM hidden dimension (default: 128)
- **num_layers**: Number of RNN layers (default: 2)

## Adaptive Goal Setting

The system uses predicted success rates to set goals:

- **< 0.6**: High risk → Review concepts
- **0.6 - 0.8**: Optimal zone → Practice
- **> 0.8**: Ready for challenge → Model paper

## Performance Considerations

- Model inference: ~100-200ms per prediction
- Batch processing for multiple students
- Caching knowledge states for active sessions
- Fallback to rule-based recommendations if service unavailable


