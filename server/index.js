const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Load environment variables from server/.env
const envPath = path.join(__dirname, '.env');
require('dotenv').config({ path: envPath });

// Log environment loading status
console.log('\n📋 Environment Configuration:');
console.log(`   .env file path: ${envPath}`);
console.log(`   JWT_SECRET loaded: ${process.env.JWT_SECRET ? '✅ Yes (' + process.env.JWT_SECRET.substring(0, 10) + '...)' : '❌ No'}`);
console.log(`   MONGODB_URI loaded: ${process.env.MONGODB_URI ? '✅ Yes' : '❌ No'}`);
console.log(`   PORT: ${process.env.PORT || 5000}`);
console.log('');

// Verify critical environment variables are loaded
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_super_secret_jwt_key_change_this_in_production') {
  console.error('❌ ====================================');
  console.error('   JWT_SECRET is not configured!');
  console.error(`   Expected .env file at: ${envPath}`);
  console.error('   Please ensure server/.env exists and contains JWT_SECRET');
  console.error('   The server will continue but authentication will fail.');
  console.error('=====================================\n');
}

const connectDB = require('./config/database');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/stress', require('./routes/stress'));
app.use('/api/games', require('./routes/games'));
app.use('/api/badges', require('./routes/badges'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/projections', require('./routes/projections'));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI-Enhanced Learning Platform API is running' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5000;

// Start Server - Connect to DB first, then start server
const startServer = async () => {
  try {
    // Connect to Database
    await connectDB();
    
    // Start Server
    const server = app.listen(PORT, () => {
      console.log('\n🚀 ====================================');
      console.log(`   Server started successfully!`);
      console.log(`   Port: ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   API URL: http://localhost:${PORT}`);
      console.log(`   Health Check: http://localhost:${PORT}/health`);
      console.log('====================================\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


