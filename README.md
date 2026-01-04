# AI-Enhanced Learning Platform for Sri Lankan O-Level Mathematics Students

**Project ID:** 25-26J-485  
**Year:** 2025  
**Research Group:** CoEAI – Centre of Excellence for AI  
**Specialization:** Software Engineering (SE)

## Project Overview

This platform addresses the high failure rates (30%+) in Sri Lanka's GCE O/L Mathematics examination by providing an AI-powered, personalized learning system. The platform integrates adaptive learning, emotional analytics, and collaborative tools to improve student outcomes.

## Key Features

1. **Adaptive Quiz Generator** - ML-based quiz generation with Item Response Theory
2. **Model Paper Creator** - Full exam simulation aligned with O/L syllabus
3. **Stress Detection System** - Decision Tree-based emotional analytics
4. **AI-Moderated Forum** - LaTeX-enabled peer discussions with NLP moderation
5. **Progress Tracker** - Real-time analytics and gamified metrics
6. **Portfolio Generator** - Auto-generated CV-style academic summary

## Technology Stack

### Frontend
- React.js
- Tailwind CSS
- MathJax (LaTeX rendering)

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication

### Machine Learning
- Python
- Scikit-learn (Decision Trees, Item Response Theory)
- TextBlob (NLP/Sentiment Analysis)
- BERT (Advanced NLP tasks)

## Project Structure

```
├── client/                 # React frontend application
├── server/                 # Node.js/Express backend
├── ml-services/            # Python ML services
├── database/               # MongoDB schemas and seed data
└── docs/                   # Project documentation
```

## Component Assignments

| Member | Component | Technologies |
|--------|-----------|--------------|
| MORAYES C M S R D | Stress Detection | Decision Tree ML, React UI |
| BIMSARA B S | Quiz & Model Papers | ML Selection, Item Response Theory |
| KONARA K M H G S A | Peer Forum | LaTeX, NLP Moderation |
| GAYASHAN W G D D | Progress Tracker & Portfolio | Dashboard, CV Generator |

## Installation

For detailed setup instructions, please see [SETUP.md](SETUP.md)

### Quick Start

1. **Install Dependencies:**
   ```bash
   npm install
   cd client && npm install && cd ..
   cd ml-services && pip install -r requirements.txt && cd ..
   ```

2. **Set Up Environment Variables:**
   ```bash
   cp server/.env.example server/.env
   # Edit server/.env with your configuration
   ```

3. **Start MongoDB:**
   ```bash
   # Ensure MongoDB is running on your system
   ```

4. **Run Services (in separate terminals):**
   ```bash
   # Terminal 1: Backend
   npm run dev
   
   # Terminal 2: ML Service
   cd ml-services && python app.py
   
   # Terminal 3: Frontend
   cd client && npm start
   ```

5. **Access the Application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - ML Service: http://localhost:5001

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Quiz
- `GET /api/quiz/generate` - Generate adaptive quiz
- `POST /api/quiz/submit` - Submit quiz answers
- `GET /api/quiz/model-paper` - Generate model paper

### Forum
- `GET /api/forum/posts` - Get forum posts
- `POST /api/forum/posts` - Create new post
- `POST /api/forum/posts/:id/comments` - Add comment

### Progress
- `GET /api/progress/dashboard` - Get student dashboard data
- `GET /api/progress/portfolio` - Generate portfolio/CV

### Stress Detection
- `POST /api/stress/analyze` - Analyze student behavior for stress

## Development

The project follows a modular architecture with clear separation of concerns:
- **Backend:** RESTful API with Express.js
- **Frontend:** Component-based React application
- **ML Services:** Python microservice for ML operations

## Contributing

This is a research project by CoEAI. For contributions, please follow the component assignments above.

## License

MIT License - Research Project 25-26J-485

## Contact

Research Group: CoEAI – Centre of Excellence for AI  
Year: 2025

