const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware disabled for development
// app.use(helmet({
//   contentSecurityPolicy: false,
// }));
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

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collectibles-tracker', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 seconds for Docker startup
      socketTimeoutMS: 45000,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    // In production, we want to retry connection
    if (process.env.NODE_ENV === 'production') {
      console.log('Retrying MongoDB connection in 5 seconds...');
      setTimeout(connectDB, 5000);
    }
  }
};

connectDB();


// API Routes
app.use('/api/categories', require('./routes/categories'));
app.use('/api/sets', require('./routes/sets'));
app.use('/api/cards', require('./routes/cards'));
app.use('/api/prices', require('./routes/prices'));
app.use('/api/users', require('./routes/users'));
app.use('/api/collections', require('./routes/collections'));

// API info endpoint (JSON response)
app.get('/api', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
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
    database: dbStatus,
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


// Serve static files from public directory (after API routes)
app.use(express.static('./server/public'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler (must be last)
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
