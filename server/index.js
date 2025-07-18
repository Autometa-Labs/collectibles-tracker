const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('server/public'));

// Database connection (disabled for demo - would need MongoDB deployment in production)
console.log('Running in demo mode without database connection');
// Uncomment below lines when MongoDB is available:
// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collectibles-tracker', {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       serverSelectionTimeoutMS: 5000,
//     });
//     console.log('Connected to MongoDB');
//   } catch (error) {
//     console.warn('MongoDB connection failed, running without database:', error.message);
//   }
// };
// connectDB();

// API Routes
app.use('/api/categories', require('./routes/categories'));
app.use('/api/sets', require('./routes/sets'));
app.use('/api/cards', require('./routes/cards'));
app.use('/api/prices', require('./routes/prices'));
app.use('/api/users', require('./routes/users'));
app.use('/api/collections', require('./routes/collections'));

// API info endpoint (JSON response)
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to Collectibles Tracker API',
    version: '1.0.0',
    description: 'A comprehensive platform for tracking collectible card values and collections',
    endpoints: {
      health: '/api/health',
      categories: '/api/categories',
      sets: '/api/sets',
      cards: '/api/cards',
      prices: '/api/prices',
      users: '/api/users',
      collections: '/api/collections'
    },
    status: 'running',
    mode: 'demo (no database)',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
