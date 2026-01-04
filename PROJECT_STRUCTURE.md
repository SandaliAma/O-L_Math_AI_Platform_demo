# Project Structure

## Overview

This is a full-stack AI-Enhanced Learning Platform for Sri Lankan O-Level Mathematics Students, built using the MERN stack with Python ML services.

## Directory Structure

```
reserch/
│
├── client/                          # React Frontend Application
│   ├── public/
│   │   └── index.html              # HTML template with MathJax
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.js        # User login component
│   │   │   │   └── Register.js     # User registration component
│   │   │   ├── Dashboard/
│   │   │   │   └── Dashboard.js    # Main dashboard with stats
│   │   │   ├── Quiz/
│   │   │   │   ├── QuizGenerator.js # Generate adaptive quizzes
│   │   │   │   └── QuizTaking.js    # Take quiz interface
│   │   │   ├── Forum/
│   │   │   │   ├── Forum.js         # Forum listing
│   │   │   │   └── ForumPost.js     # Individual post view
│   │   │   ├── Progress/
│   │   │   │   ├── ProgressTracker.js # Progress dashboard
│   │   │   │   └── Portfolio.js     # CV/Portfolio generator
│   │   │   ├── Stress/
│   │   │   │   └── StressIndicator.js # Stress level indicator
│   │   │   └── Layout/
│   │   │       └── Navbar.js        # Navigation bar
│   │   ├── utils/
│   │   │   ├── api.js              # API utility functions
│   │   │   └── mathjax.js          # MathJax configuration
│   │   ├── App.js                   # Main app component
│   │   ├── App.css                  # App styles
│   │   ├── index.js                 # React entry point
│   │   └── index.css                # Global styles
│   ├── package.json                 # Frontend dependencies
│   ├── tailwind.config.js           # Tailwind CSS config
│   └── postcss.config.js            # PostCSS config
│
├── server/                          # Node.js/Express Backend
│   ├── models/
│   │   ├── User.js                  # User schema (MongoDB)
│   │   ├── Quiz.js                  # Quiz schema
│   │   └── ForumPost.js             # Forum post schema
│   ├── routes/
│   │   ├── auth.js                  # Authentication routes
│   │   ├── quiz.js                  # Quiz routes
│   │   ├── forum.js                 # Forum routes
│   │   ├── progress.js              # Progress tracking routes
│   │   └── stress.js                # Stress detection routes
│   ├── middleware/
│   │   └── auth.js                  # JWT authentication middleware
│   ├── index.js                     # Express server entry point
│   └── .env.example                 # Environment variables template
│
├── ml-services/                     # Python ML Services
│   ├── models/
│   │   └── stress_model.pkl         # Trained stress detection model (auto-generated)
│   ├── app.py                       # Flask ML service
│   ├── requirements.txt             # Python dependencies
│   └── README.md                    # ML service documentation
│
├── database/
│   └── seed.js                      # Database seeding script
│
├── package.json                     # Backend dependencies
├── .gitignore                       # Git ignore file
├── README.md                        # Main project documentation
├── SETUP.md                         # Detailed setup instructions
└── PROJECT_STRUCTURE.md             # This file

```

## Component Breakdown

### Frontend Components (React)

#### Authentication (`client/src/components/Auth/`)
- **Login.js**: User login form with email/password
- **Register.js**: User registration with profile information

#### Dashboard (`client/src/components/Dashboard/`)
- **Dashboard.js**: Main dashboard displaying:
  - Statistics (total quizzes, average score, streak, badges)
  - Recent performance charts
  - Topic performance graphs
  - Quick actions (take quiz, model paper, forum)

#### Quiz System (`client/src/components/Quiz/`)
- **QuizGenerator.js**: 
  - Generate adaptive quizzes
  - Generate model papers
  - View quiz history
- **QuizTaking.js**:
  - Interactive quiz interface
  - LaTeX math rendering with MathJax
  - Progress tracking
  - Answer submission

#### Forum (`client/src/components/Forum/`)
- **Forum.js**:
  - List all forum posts
  - Filter by topic
  - Search functionality
  - Create new posts
- **ForumPost.js**:
  - View individual post
  - LaTeX rendering
  - Comments section
  - Like/unlike posts

#### Progress Tracking (`client/src/components/Progress/`)
- **ProgressTracker.js**:
  - Detailed progress statistics
  - Badges earned
  - Topic performance charts
  - Topic mastery bars
  - Quiz history table
- **Portfolio.js**:
  - Generate CV-style portfolio
  - Academic summary
  - Achievements and badges
  - Strengths and areas for improvement
  - Topic mastery details
  - Download as text file

#### Stress Detection (`client/src/components/Stress/`)
- **StressIndicator.js**:
  - Real-time stress level indicator
  - Behavioral analytics
  - Motivational messages
  - Recommendations

### Backend API (`server/`)

#### Routes (`server/routes/`)
- **auth.js**: User registration, login, get current user
- **quiz.js**: Generate quizzes, submit answers, get history, model papers
- **forum.js**: CRUD operations for forum posts and comments
- **progress.js**: Dashboard data, portfolio generation
- **stress.js**: Stress analysis, history retrieval

#### Models (`server/models/`)
- **User.js**: User schema with profile, performance, stress indicators
- **Quiz.js**: Quiz schema with questions, answers, scores
- **ForumPost.js**: Forum post schema with comments, moderation

#### Middleware (`server/middleware/`)
- **auth.js**: JWT token verification, role-based authorization

### ML Services (`ml-services/`)

#### Flask Application (`ml-services/app.py`)
- **Quiz Generation**: 
  - Adaptive quiz generation based on user performance
  - Model paper generation (full exam simulation)
  - Item Response Theory (IRT) parameters
  
- **Stress Detection**:
  - Decision Tree-based stress analysis
  - Behavioral pattern analysis
  - Recommendations and motivational messages
  
- **Text Moderation**:
  - NLP-based content moderation
  - Inappropriate content detection
  
- **Sentiment Analysis**:
  - TextBlob-based sentiment analysis
  - Positive/neutral/negative classification

## Data Flow

### User Registration/Login
1. Frontend → Backend (`POST /api/auth/register` or `/login`)
2. Backend validates and creates user / verifies credentials
3. Backend generates JWT token
4. Frontend stores token and sets user state

### Quiz Generation
1. Frontend → Backend (`GET /api/quiz/generate`)
2. Backend → ML Service (`POST /generate-quiz`)
3. ML Service generates questions based on user performance
4. ML Service → Backend (returns questions)
5. Backend saves quiz to database
6. Backend → Frontend (returns quiz)

### Quiz Taking
1. Frontend displays questions with MathJax rendering
2. User answers questions
3. Frontend tracks time spent per question
4. Frontend → Backend (`POST /api/quiz/submit`)
5. Backend calculates scores and updates user performance
6. Backend → Frontend (returns results)

### Stress Detection
1. Frontend tracks user behavior (time spent, errors, etc.)
2. Frontend → Backend (`POST /api/stress/analyze`)
3. Backend → ML Service (`POST /analyze-stress`)
4. ML Service analyzes behavioral indicators using Decision Tree
5. ML Service → Backend (returns stress level and recommendations)
6. Backend updates user stress indicators
7. Backend → Frontend (displays in StressIndicator component)

### Forum Posts
1. Frontend → Backend (`POST /api/forum/posts`)
2. Backend → ML Service (`POST /moderate-text`, `/analyze-sentiment`)
3. ML Service moderates and analyzes sentiment
4. ML Service → Backend (returns moderation results)
5. Backend saves post with moderation data
6. Backend → Frontend (returns post)

## Technology Stack

### Frontend
- **React 18**: UI library
- **React Router**: Navigation
- **Tailwind CSS**: Styling
- **MathJax 3**: LaTeX math rendering
- **Recharts**: Data visualization
- **Axios**: HTTP client

### Backend
- **Node.js**: Runtime
- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: ODM
- **JWT**: Authentication
- **bcryptjs**: Password hashing

### ML Services
- **Python 3.9+**: Programming language
- **Flask**: Web framework
- **Scikit-learn**: Machine learning
- **TextBlob**: NLP
- **NumPy/Pandas**: Data processing
- **Decision Trees**: Stress detection

## Key Features

1. **Adaptive Learning**: ML-based quiz generation adapts to user performance
2. **Stress Detection**: Decision Tree model analyzes behavioral patterns
3. **AI Moderation**: NLP-based forum content moderation
4. **Sentiment Analysis**: TextBlob analyzes forum post sentiment
5. **Progress Tracking**: Comprehensive analytics and visualization
6. **Portfolio Generation**: Auto-generated CV-style academic summary
7. **LaTeX Support**: MathJax renders mathematical equations
8. **Real-time Feedback**: Stress indicator provides immediate insights

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Quiz
- `GET /api/quiz/generate` - Generate adaptive quiz
- `POST /api/quiz/submit` - Submit quiz answers
- `GET /api/quiz/model-paper` - Generate model paper
- `GET /api/quiz/history` - Get quiz history

### Forum
- `GET /api/forum/posts` - Get forum posts
- `GET /api/forum/posts/:id` - Get single post
- `POST /api/forum/posts` - Create new post
- `POST /api/forum/posts/:id/comments` - Add comment
- `POST /api/forum/posts/:id/like` - Like/unlike post

### Progress
- `GET /api/progress/dashboard` - Get dashboard data
- `GET /api/progress/portfolio` - Generate portfolio

### Stress
- `POST /api/stress/analyze` - Analyze stress
- `GET /api/stress/history` - Get stress history

## ML Service Endpoints

- `POST /generate-quiz` - Generate adaptive quiz
- `POST /generate-model-paper` - Generate model paper
- `POST /analyze-stress` - Analyze stress levels
- `POST /moderate-text` - Moderate forum text
- `POST /analyze-sentiment` - Analyze text sentiment

## Development Notes

- All components are modular and reusable
- API routes follow RESTful conventions
- ML services are decoupled and can be scaled independently
- Frontend and backend communicate via JSON API
- MathJax is configured to render LaTeX inline ($...$) and display ($$...$$) math
- Stress detection model is auto-trained on first run
- Database models use Mongoose schemas with validation


