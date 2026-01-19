require('dotenv').config();

module.exports = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },

  // Password Reset Token Configuration
  resetToken: {
    expiresIn: 3600000 // 1 hour in milliseconds
  },

  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  },

  // Password Policy
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false
  },

  // Role-based Access Control
  roles: {
    ADMIN: 'admin',
    TEACHER: 'teacher',
    STUDENT: 'student',
    DEPARTMENT_HEAD: 'department_head',
    DEAN: 'dean'
  },

  // Bcrypt Salt Rounds
  saltRounds: 10
};
