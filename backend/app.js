const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'OBE System API is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const degreeRoutes = require('./routes/degreeRoutes');
const academicSessionRoutes = require('./routes/academicSessionRoutes');
const semesterRoutes = require('./routes/semesterRoutes');
const courseRoutes = require('./routes/courseRoutes');
const courseOfferingRoutes = require('./routes/courseOfferingRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/faculties', facultyRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/degrees', degreeRoutes);
app.use('/api/academic-sessions', academicSessionRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/course-offerings', courseOfferingRoutes);

// Additional routes will be imported here
// app.use('/api/courses', require('./routes/courseRoutes'));
// ... other routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
