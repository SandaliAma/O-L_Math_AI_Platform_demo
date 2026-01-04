# Frontend-Backend Connection Guide

## Overview

This guide explains how the frontend and backend are connected in the AI-Enhanced Learning Platform.

## Architecture

```
Frontend (React)          Backend (Express/Node.js)        Database (MongoDB)
    |                              |                              |
    |-- HTTP Requests -----------> |                              |
    |                              |-- MongoDB Queries ---------> |
    |<-- JSON Responses ---------- |<-- Data Results ------------ |
```

## Connection Configuration

### Backend Configuration

**File**: `server/index.js`

- **Port**: Default 5000 (configurable via `PORT` env variable)
- **CORS**: Configured to allow requests from `http://localhost:3000`
- **Base URL**: `http://localhost:5000/api`

### Frontend Configuration

**File**: `client/src/utils/api.js` and `client/src/App.js`

- **API URL**: `http://localhost:5000/api` (default)
- **Environment Variable**: `REACT_APP_API_URL`
- **Axios Base URL**: Set in `App.js` and `api.js`

## API Endpoints

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
- `POST /api/forum/posts` - Create post
- `POST /api/forum/posts/:id/comments` - Add comment
- `POST /api/forum/posts/:id/like` - Like post

### Progress
- `GET /api/progress/dashboard` - Get dashboard data
- `GET /api/progress/portfolio` - Generate portfolio

### Stress Detection
- `POST /api/stress/analyze` - Analyze stress levels
- `GET /api/stress/history` - Get stress history

### Games
- `POST /api/games/play` - Play game
- `GET /api/games/stats` - Get game stats
- `GET /api/games/activity` - Get activity calendar

### Badges
- `GET /api/badges` - Get all badges
- `GET /api/badges/my-badges` - Get user's badges
- `POST /api/badges/check` - Check for new badges
- `GET /api/badges/stats` - Get badge statistics
- `POST /api/badges/initialize` - Initialize default badges

## Authentication Flow

1. **Login/Register**: Frontend sends credentials to `/api/auth/login` or `/api/auth/register`
2. **Token Received**: Backend returns JWT token
3. **Token Storage**: Frontend stores token in `localStorage`
4. **Token Usage**: All subsequent requests include token in `Authorization` header
5. **Token Validation**: Backend middleware validates token on protected routes

### Axios Interceptors

**File**: `client/src/App.js`

- **Request Interceptor**: Automatically adds `Authorization: Bearer <token>` header
- **Response Interceptor**: Handles 401 errors by redirecting to login

## Data Flow Examples

### Example 1: Taking a Quiz

```
1. User clicks "Take Quiz" → Frontend calls GET /api/quiz/generate
2. Backend generates quiz using ML service → Returns quiz data
3. User answers questions → Frontend tracks time and answers
4. User submits → Frontend calls POST /api/quiz/submit
5. Backend calculates score → Updates user performance
6. Backend checks badges → Awards new badges if criteria met
7. Backend returns results → Frontend displays score and new badges
```

### Example 2: Viewing Dashboard

```
1. User navigates to /dashboard → Frontend calls GET /api/progress/dashboard
2. Backend queries database → Gets user performance data
3. Backend checks for new badges → Awards if criteria met
4. Backend returns dashboard data → Frontend displays stats, charts, badges
```

## Environment Variables

### Backend (server/.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ol_math_platform
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:3000
ML_SERVICE_URL=http://localhost:5001
NODE_ENV=development
```

### Frontend (client/.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Starting the Application

### 1. Start Backend

```bash
cd server
npm install
npm start
```

Backend will start on `http://localhost:5000`

### 2. Start Frontend

```bash
cd client
npm install
npm start
```

Frontend will start on `http://localhost:3000`

### 3. Verify Connection

1. Open browser to `http://localhost:3000`
2. Check browser console for any errors
3. Check backend console for incoming requests
4. Try logging in with a synthetic student:
   - Email: `student1@synthetic.com`
   - Password: `password123`

## Testing the Connection

### Health Check

```bash
curl http://localhost:5000/health
```

Should return:
```json
{
  "status": "OK",
  "message": "AI-Enhanced Learning Platform API is running"
}
```

### Test API Endpoint

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Common Issues

### CORS Errors

**Problem**: Frontend can't make requests to backend

**Solution**: 
- Check `FRONTEND_URL` in `server/.env`
- Ensure CORS middleware is configured in `server/index.js`
- Check browser console for CORS error details

### 401 Unauthorized

**Problem**: Requests are being rejected

**Solution**:
- Check if token is stored in `localStorage`
- Verify token is being sent in `Authorization` header
- Check if token has expired
- Re-login to get new token

### Connection Refused

**Problem**: Can't connect to backend

**Solution**:
- Verify backend is running on port 5000
- Check `MONGODB_URI` is correct
- Ensure MongoDB is running
- Check firewall settings

### API URL Not Found

**Problem**: 404 errors on API calls

**Solution**:
- Verify `REACT_APP_API_URL` is set correctly
- Check route definitions in `server/index.js`
- Ensure route files are properly exported

## Debugging

### Enable Request Logging

Backend uses `morgan` middleware for request logging. Check console for:
- Request method and path
- Response status
- Response time

### Frontend Console

Check browser console for:
- Network requests (in DevTools Network tab)
- API errors
- Authentication issues

### Backend Console

Check server console for:
- Database connection status
- Request logs
- Error messages
- ML service communication

## Next Steps

1. **Test Authentication**: Login with synthetic student
2. **Test Quiz Generation**: Generate and take a quiz
3. **Test Badge System**: Complete activities to earn badges
4. **Test Dashboard**: View progress and statistics
5. **Test Forum**: Create posts and comments

## Additional Resources

- Backend API Documentation: See route files in `server/routes/`
- Frontend Components: See components in `client/src/components/`
- Badge Engine: See `server/services/badgeEngine.js`
- Synthetic Data: See `database/generateSyntheticData.js`





