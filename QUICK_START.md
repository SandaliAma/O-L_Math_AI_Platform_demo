# Quick Start Guide - Frontend & Backend Connection

## Prerequisites

- Node.js (v14 or higher)
- MongoDB running locally or accessible
- npm or yarn

## Step 1: Install Dependencies

### Install Backend Dependencies
```bash
npm install
```

### Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

Or use the convenience script:
```bash
npm run install-all
```

## Step 2: Configure Environment Variables

### Backend Environment (server/.env)
Create `server/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ol_math_platform
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
FRONTEND_URL=http://localhost:3000
ML_SERVICE_URL=http://localhost:5001
NODE_ENV=development
```

### Frontend Environment (client/.env)
Create `client/.env` file (optional):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Step 3: Start MongoDB

Make sure MongoDB is running:
```bash
# Windows
mongod

# Mac/Linux
sudo mongod
```

Or if using MongoDB as a service:
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

## Step 4: Start Backend Server

In the root directory:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

Backend will start on: `http://localhost:5000`

You should see:
```
🚀 ====================================
   Server started successfully!
   Port: 5000
   Environment: development
   API URL: http://localhost:5000
   Health Check: http://localhost:5000/health
====================================
```

## Step 5: Start Frontend

Open a new terminal window and:
```bash
npm run client
```

Or:
```bash
cd client
npm start
```

Frontend will start on: `http://localhost:3000`

## Step 6: Verify Connection

1. **Check Backend Health**:
   - Open browser: `http://localhost:5000/health`
   - Should see: `{"status":"OK","message":"AI-Enhanced Learning Platform API is running"}`

2. **Check Frontend**:
   - Open browser: `http://localhost:3000`
   - Should see login page

3. **Test Login**:
   - Use a synthetic student account:
     - Email: `student1@synthetic.com`
     - Password: `password123`
   - Or register a new account

## Step 7: Initialize Badges (First Time Only)

After logging in, initialize the badge system:

**Option 1: Via API**
```bash
curl -X POST http://localhost:5000/api/badges/initialize \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Option 2: Via Frontend**
- Navigate to `/badges` page
- The system will auto-initialize on first badge check

## Troubleshooting

### Backend Won't Start

1. **Check MongoDB Connection**:
   ```bash
   # Test MongoDB connection
   mongosh
   ```

2. **Check Port 5000**:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   
   # Mac/Linux
   lsof -i :5000
   ```

3. **Check Environment Variables**:
   - Ensure `server/.env` exists
   - Verify `MONGODB_URI` is correct
   - Verify `JWT_SECRET` is set

### Frontend Won't Connect

1. **Check Backend is Running**:
   - Visit `http://localhost:5000/health`

2. **Check CORS**:
   - Verify `FRONTEND_URL` in `server/.env` matches frontend URL
   - Check browser console for CORS errors

3. **Check API URL**:
   - Verify `REACT_APP_API_URL` in `client/.env` (or default)
   - Check Network tab in browser DevTools

### Authentication Issues

1. **Clear Browser Storage**:
   ```javascript
   // In browser console
   localStorage.clear()
   ```

2. **Check Token**:
   - Token should be in `localStorage` after login
   - Check Network tab for `Authorization` header

3. **Re-login**:
   - Logout and login again
   - Check backend console for authentication errors

## Development Workflow

### Running Both Servers

**Option 1: Separate Terminals**
- Terminal 1: `npm start` (backend)
- Terminal 2: `npm run client` (frontend)

**Option 2: Use a Process Manager**
```bash
# Install concurrently
npm install -g concurrently

# Run both
concurrently "npm start" "npm run client"
```

### Hot Reload

- **Backend**: Use `npm run dev` (nodemon)
- **Frontend**: React automatically hot-reloads on changes

## Testing the Connection

### 1. Test Authentication
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

### 2. Test Protected Route
```bash
# Get dashboard (requires token)
curl http://localhost:5000/api/progress/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test Frontend API Call
- Open browser DevTools
- Navigate to Dashboard
- Check Network tab for API calls
- Verify responses are successful

## Next Steps

1. ✅ Backend and Frontend are connected
2. ✅ Login with synthetic student
3. ✅ Generate and take a quiz
4. ✅ View dashboard and progress
5. ✅ Check badges page
6. ✅ Test forum features
7. ✅ Play games

## Additional Resources

- **Connection Guide**: See `CONNECTION_GUIDE.md`
- **API Documentation**: See route files in `server/routes/`
- **Badge System**: See `server/services/BADGE_ENGINE_README.md`
- **Synthetic Data**: See `database/SYNTHETIC_DATA_README.md`

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review error messages in console
3. Check MongoDB connection
4. Verify environment variables
5. Review `CONNECTION_GUIDE.md` for detailed information
