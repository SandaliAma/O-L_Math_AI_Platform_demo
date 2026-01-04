# Setup Instructions

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Python** (v3.9 or higher) - [Download](https://www.python.org/downloads/)
- **npm** or **yarn** (comes with Node.js)

## Step-by-Step Setup

### 1. Clone or Download the Project

Navigate to the project directory:
```bash
cd reserch
```

### 2. Install Backend Dependencies

```bash
npm install
```

This installs all Node.js dependencies for the Express.js backend.

### 3. Install Frontend Dependencies

```bash
cd client
npm install
cd ..
```

This installs all React dependencies.

### 4. Install Python ML Service Dependencies

```bash
cd ml-services
pip install -r requirements.txt

# Download NLTK data for TextBlob
python -c "import nltk; nltk.download('punkt'); nltk.download('brown')"
cd ..
```

### 5. Set Up Environment Variables

Create a `.env` file in the `server` directory:

```bash
# Copy the example file
cp server/.env.example server/.env
```

Edit `server/.env` with your configuration:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ol_math_platform
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
ML_SERVICE_URL=http://localhost:5001
FRONTEND_URL=http://localhost:3000
```

**Important:** Change `JWT_SECRET` to a secure random string in production!

### 6. Start MongoDB

Make sure MongoDB is running on your system:

**Windows:**
```bash
# Start MongoDB service
net start MongoDB
```

**Linux/Mac:**
```bash
# Start MongoDB service
sudo systemctl start mongod
# or
mongod
```

### 7. Seed the Database (Optional)

Create sample data for testing:

```bash
node database/seed.js
```

This creates a sample user:
- Email: `student@example.com`
- Password: `password123`

### 8. Start the Backend Server

In the project root directory:

```bash
npm run dev
```

Or:
```bash
cd server
node index.js
```

The backend server will run on `http://localhost:5000`

### 9. Start the ML Service

Open a new terminal and navigate to the ml-services directory:

```bash
cd ml-services
python app.py
```

The ML service will run on `http://localhost:5001`

### 10. Start the Frontend

Open another terminal and navigate to the client directory:

```bash
cd client
npm start
```

The React app will automatically open in your browser at `http://localhost:3000`

## Running All Services

For development, you'll need three terminals running:

1. **Terminal 1 - Backend:**
   ```bash
   npm run dev
   ```

2. **Terminal 2 - ML Service:**
   ```bash
   cd ml-services
   python app.py
   ```

3. **Terminal 3 - Frontend:**
   ```bash
   cd client
   npm start
   ```

## Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running: `mongod --version`
- Check if MongoDB is accessible: `mongosh` or `mongo`
- Verify the connection string in `.env` file

### Port Already in Use

If port 5000, 5001, or 3000 is already in use:

1. Change the port in `server/.env` (for backend)
2. Change the port in `ml-services/app.py` (for ML service)
3. React will automatically use the next available port

### Python Dependencies Issues

If you encounter issues with Python packages:

```bash
# Use a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### ML Service Not Responding

- Check if the ML service is running on port 5001
- Verify `ML_SERVICE_URL` in `server/.env`
- Check ML service logs for errors

### Frontend Build Issues

If you encounter build errors:

```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in `.env`
2. Build the React app: `cd client && npm run build`
3. Use a process manager like PM2: `pm2 start server/index.js`
4. Use Gunicorn for ML service: `gunicorn -w 4 -b 0.0.0.0:5001 app:app`
5. Configure a reverse proxy (Nginx) for the frontend
6. Use MongoDB Atlas for cloud database

## Project Structure

```
reserch/
├── client/              # React frontend
├── server/              # Express.js backend
├── ml-services/         # Python ML services
├── database/            # Database scripts
├── package.json         # Backend dependencies
└── README.md            # Project documentation
```

## Support

For issues or questions, please contact the research group:
- **Research Group:** CoEAI – Centre of Excellence for AI
- **Project ID:** 25-26J-485
- **Year:** 2025


