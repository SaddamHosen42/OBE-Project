/**
 * Main Application File
 * OBE (Outcome-Based Education) Management System
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { registerRoutes } = require('./routes');

const app = express();

// ===========================================
// MIDDLEWARE CONFIGURATION
// ===========================================

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body Parser Middleware
app.use(express.json({ limit: '10mb' })); // JSON payload limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logging Middleware (Development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// ===========================================
// HEALTH CHECK ROUTE
// ===========================================

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'OBE System API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ===========================================
// API ROUTES
// ===========================================

// Register all application routes
registerRoutes(app);

// ===========================================
// ERROR HANDLING MIDDLEWARE
// ===========================================

// 404 Handler - Must come before error handler
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  // Log error details
  console.error('Error occurred:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err.details 
    })
  });
});

// ===========================================
// SERVER INITIALIZATION
// ===========================================

const PORT = process.env.PORT || 3000;

// Only start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🚀 OBE Management System Server');
    console.log('='.repeat(50));
    console.log(`📍 Server running on port: ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📅 Started at: ${new Date().toISOString()}`);
    console.log('='.repeat(50));
  });
}

module.exports = app;
