require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const dreamRoutes = require('./routes/dreamRoutes');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Support both /api/... and direct path mounts (handles serverless rewrites and standard Express)
app.use('/api/dreams', dreamRoutes);
app.use('/dreams', dreamRoutes);

app.use('/api/users', userRoutes);
app.use('/users', userRoutes);

app.use('/api/ai', aiRoutes);
app.use('/ai', aiRoutes);

// Health check endpoint
app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'production',
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'connecting',
    timestamp: new Date().toISOString()
  });
});

// Connect to DB (cached connection pattern for serverless)
let cachedDbConnection = null;
const connectDB = async () => {
  if (cachedDbConnection && mongoose.connection.readyState === 1) {
    return cachedDbConnection;
  }
  if (process.env.MONGO_URI) {
    try {
      cachedDbConnection = await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Connected to DB');
      return cachedDbConnection;
    } catch (error) {
      console.error(`❌ DB connection error: ${error}`);
    }
  }
};

// Initiate DB connection
connectDB();

// Middleware ensuring DB connection in serverless if needed
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1 && process.env.MONGO_URI) {
    try {
      await connectDB();
    } catch (e) {
      console.error('DB reconnection error in request middleware:', e);
    }
  }
  next();
});

// Only listen directly if not running inside a serverless environment like Vercel
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`✅ Server is listening on port ${PORT}`);
  });
}

module.exports = app;
