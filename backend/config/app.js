require('dotenv').config();

module.exports = {
  // Application Configuration
  app: {
    name: 'OBE Management System',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    url: process.env.APP_URL || 'http://localhost:3000'
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200
  },

  // API Configuration
  api: {
    prefix: '/api',
    version: 'v1',
    timeout: 30000 // 30 seconds
  },

  // Pagination Defaults
  pagination: {
    defaultPage: 1,
    defaultLimit: 10,
    maxLimit: 100
  },

  // File Upload Configuration
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    uploadPath: process.env.UPLOAD_PATH || './uploads'
  },

  // Date and Time Format
  dateFormat: {
    display: 'YYYY-MM-DD',
    displayWithTime: 'YYYY-MM-DD HH:mm:ss',
    database: 'YYYY-MM-DD HH:mm:ss'
  },

  // Academic Configuration
  academic: {
    minCGPA: 0.0,
    maxCGPA: 4.0,
    minGPA: 0.0,
    maxGPA: 4.0,
    passingGrade: 2.0,
    maxCredits: 150
  },

  // Assessment Configuration
  assessment: {
    maxMarks: 100,
    minMarks: 0,
    defaultWeightage: 100
  },

  // Bloom's Taxonomy Levels
  bloomLevels: {
    REMEMBER: 1,
    UNDERSTAND: 2,
    APPLY: 3,
    ANALYZE: 4,
    EVALUATE: 5,
    CREATE: 6
  },

  // System Constants
  system: {
    defaultLanguage: 'en',
    defaultTimezone: 'Asia/Dhaka',
    itemsPerPage: 20,
    sessionTimeout: 3600000 // 1 hour in milliseconds
  },

  // Email Configuration (for future use)
  email: {
    enabled: process.env.EMAIL_ENABLED === 'true' || false,
    from: process.env.EMAIL_FROM || 'noreply@obesystem.com',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true' || false,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined'
  }
};
