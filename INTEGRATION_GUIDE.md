# Full System Integration Guide

## Overview

This guide explains how the Adaptive Learning Projection System is integrated with the full-stack application.

## Architecture

```
┌─────────────────┐
│  React Frontend │
│  (Client)       │
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼────────┐
│  Node.js Server │
│  (Express API)  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────────┐
│  DKT  │ │ Projection│
│Service│ │  Service   │
└───┬───┘ └──┬─────────┘
    │        │
    │        │ Python subprocess
    │        │
┌───▼────────▼────────┐
│  Python ML Services │
│  - DKT Model        │
│  - XAI Service      │
│  - Simulation       │
└─────────────────────┘
```

## Backend Integration

### 1. Projection Service (`server/services/projectionService.js`)

**Purpose**: Communicates with Python projection system

**Key Methods**:
- `runProjection(params)` - Runs simulation
- `getProjectionReport()` - Retrieves results
- `getXAIExplanation()` - Gets XAI explanations
- `getVisualizations()` - Lists available visualizations

### 2. Projection Routes (`server/routes/projections.js`)

**Endpoints**:
- `POST /api/projections/run` - Run projection simulation
- `GET /api/projections/report` - Get projection report
- `GET /api/projections/visualizations` - List visualizations
- `GET /api/projections/visualization/:filename` - Serve image

### 3. Updated Recommendations Route

**Enhanced Endpoint**:
- `GET /api/recommendations/adaptive?xai=true` - Now includes XAI explanations

## Frontend Integration

### 1. API Utilities (`client/src/utils/api.js`)

**New APIs**:
```javascript
recommendationsAPI.getAdaptive(includeXAI)
projectionsAPI.runProjection(params)
projectionsAPI.getReport()
projectionsAPI.getVisualizations()
```

### 2. Components

#### XAIExplanation Component
- **Location**: `client/src/components/Recommendations/XAIExplanation.js`
- **Purpose**: Displays explainable AI explanations
- **Props**: `explanation`, `onClose`

#### AdaptiveRecommendation Component
- **Location**: `client/src/components/Recommendations/AdaptiveRecommendation.js`
- **Purpose**: Shows adaptive recommendations with XAI
- **Usage**: Add to Dashboard or Progress page

#### ProjectionVisualization Component
- **Location**: `client/src/components/Projections/ProjectionVisualization.js`
- **Purpose**: Displays projection results and visualizations
- **Usage**: Add to admin/research dashboard

## Usage Examples

### Display Recommendations with XAI

```jsx
import AdaptiveRecommendation from './components/Recommendations/AdaptiveRecommendation';

// In Dashboard component
<AdaptiveRecommendation user={user} />
```

### Display Projections

```jsx
import ProjectionVisualization from './components/Projections/ProjectionVisualization';

// In admin/research page
<ProjectionVisualization />
```

### Fetch XAI Explanation Programmatically

```javascript
import { recommendationsAPI } from './utils/api';

const response = await recommendationsAPI.getAdaptive(true);
const xaiExplanation = response.data.xai_explanation;
```

## Environment Variables

Add to `server/.env`:

```env
# DKT Service (Python Flask)
DKT_SERVICE_URL=http://localhost:5002

# ML Service (Python Flask)
ML_SERVICE_URL=http://localhost:5001

# Python executable path (if not in PATH)
PYTHON_PATH=python3
```

## Running the System

### 1. Start Python ML Services

```bash
# Terminal 1: DKT Service
cd ml-services
python dkt_model.py
# Runs on http://localhost:5002

# Terminal 2: ML Service (if needed)
cd ml-services
python app.py
# Runs on http://localhost:5001
```

### 2. Start Node.js Server

```bash
cd server
npm start
# Runs on http://localhost:5000
```

### 3. Start React Frontend

```bash
cd client
npm start
# Runs on http://localhost:3000
```

## API Flow Examples

### Getting Adaptive Recommendation with XAI

```
1. Frontend: GET /api/recommendations/adaptive?xai=true
2. Backend: Calls progressController.getAdaptiveRecommendation()
3. Backend: Calls dktService.predictKnowledgeState()
4. Backend: Calls dktService.recommendNextAction()
5. Backend: Calls projectionService.getXAIExplanation()
6. Backend: Returns recommendation + XAI explanation
7. Frontend: Displays recommendation with XAI component
```

### Running Projection

```
1. Frontend: POST /api/projections/run
2. Backend: Calls projectionService.runProjection()
3. Backend: Spawns Python process: python run_projection.py
4. Python: Runs simulation, generates report and visualizations
5. Backend: Reads simulation_report.json
6. Backend: Returns report data
7. Frontend: Displays results in ProjectionVisualization component
```

## Adding to Dashboard

Update `client/src/components/Dashboard/Dashboard.js`:

```jsx
import AdaptiveRecommendation from '../Recommendations/AdaptiveRecommendation';

// Add after Quick Actions section
<AdaptiveRecommendation user={user} />
```

## Adding Projection Page

Create new route in `client/src/App.js`:

```jsx
import ProjectionVisualization from './components/Projections/ProjectionVisualization';

// Add route
<Route
  path="/projections"
  element={<ProjectionVisualization />}
/>
```

## Troubleshooting

### Python Service Not Found

**Error**: `DKT service unavailable`

**Solution**:
1. Check if Python service is running on port 5002
2. Verify `DKT_SERVICE_URL` in `.env`
3. Check Python dependencies are installed

### Projection Fails

**Error**: `Failed to start projection`

**Solution**:
1. Verify Python is in PATH or set `PYTHON_PATH`
2. Check `ml-services/` directory exists
3. Ensure `dkt_trained_model.keras` is present (optional)

### XAI Not Showing

**Error**: No XAI explanation in response

**Solution**:
1. Check `?xai=true` parameter is included
2. Verify DKT service `/explain_recommendation` endpoint works
3. Check browser console for errors

## Testing

### Test Recommendations API

```bash
curl -X GET "http://localhost:5000/api/recommendations/adaptive?xai=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Projections API

```bash
curl -X POST "http://localhost:5000/api/projections/run" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"numStudents": 50, "numSessions": 25}'
```

## Next Steps

1. **Add to Dashboard**: Integrate `AdaptiveRecommendation` component
2. **Create Admin Page**: Add `ProjectionVisualization` for research
3. **Add Translations**: Update i18n files for new text
4. **Style Customization**: Adjust colors/styling to match theme
5. **Performance**: Cache projection results, optimize API calls

## Support

- **Backend Issues**: Check `server/services/projectionService.js`
- **Frontend Issues**: Check component files in `client/src/components/`
- **Python Issues**: Check `ml-services/` directory logs

