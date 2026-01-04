# Environment Variables Setup

## Quick Setup

1. Copy the template file to create your `.env` file:
   ```bash
   # Windows PowerShell
   Copy-Item env.template .env
   
   # Windows CMD
   copy env.template .env
   
   # Linux/Mac
   cp env.template .env
   ```

2. The `.env` file is already configured with your MongoDB Atlas connection.

3. **IMPORTANT:** Change the `JWT_SECRET` to a secure random string in production!

## Environment Variables Explained

### `PORT`
- Default: `5000`
- The port where the Express server will run

### `NODE_ENV`
- Default: `development`
- Set to `production` when deploying

### `MONGODB_URI`
- Your MongoDB connection string
- Currently set to: `mongodb+srv://IreshDB:IreshDB@cluster01.s0ull8e.mongodb.net/ol_math_platform`
- Change this if you want to use a different database

### `JWT_SECRET`
- **Change this in production!**
- Used to sign JWT tokens
- Generate a secure random string for production

### `JWT_EXPIRE`
- Default: `7d` (7 days)
- Token expiration time

### `ML_SERVICE_URL`
- Default: `http://localhost:5001`
- URL of the Python ML service

### `FRONTEND_URL`
- Default: `http://localhost:3000`
- URL of the React frontend (for CORS)

## Creating .env File Manually

If you prefer to create it manually, create a file named `.env` in the `server/` directory with this content:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://IreshDB:IreshDB@cluster01.s0ull8e.mongodb.net/ol_math_platform
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
ML_SERVICE_URL=http://localhost:5001
FRONTEND_URL=http://localhost:3000
```

## Verify Setup

After creating the `.env` file, restart your server. You should see:

```
🔄 Connecting to MongoDB...

✅ ====================================
   MongoDB Connected Successfully!
   Host: cluster01-shard-00-00.s0ull8e.mongodb.net
   Database: ol_math_platform
   Ready State: Connected
=====================================
```



