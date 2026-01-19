const User = require('../models/User');
const db = require('../config/database');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const authConfig = require('../config/auth');

/**
 * Authentication Controller
 * Handles user authentication, registration, password management, and session handling
 */
const AuthController = {
  /**
   * Register a new user
   * @route POST /api/auth/register
   */
  register: async (req, res) => {
    try {
      const { name, email, username, password, role, phone, dob, nationality, nid_no, blood_group } = req.body;

      // Validate required fields
      if (!name || !email || !username || !password || !role) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, username, password, and role are required'
        });
      }

      // Validate password strength
      if (password.length < authConfig.password.minLength) {
        return res.status(400).json({
          success: false,
          message: `Password must be at least ${authConfig.password.minLength} characters long`
        });
      }

      // Additional password policy checks
      if (authConfig.password.requireUppercase && !/[A-Z]/.test(password)) {
        return res.status(400).json({
          success: false,
          message: 'Password must contain at least one uppercase letter'
        });
      }

      if (authConfig.password.requireLowercase && !/[a-z]/.test(password)) {
        return res.status(400).json({
          success: false,
          message: 'Password must contain at least one lowercase letter'
        });
      }

      if (authConfig.password.requireNumbers && !/\d/.test(password)) {
        return res.status(400).json({
          success: false,
          message: 'Password must contain at least one number'
        });
      }

      if (authConfig.password.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return res.status(400).json({
          success: false,
          message: 'Password must contain at least one special character'
        });
      }

      // Create user instance
      const userModel = new User();

      // Create user
      const userData = {
        name,
        email,
        username,
        password,
        role,
        phone: phone || null,
        dob: dob || null,
        nationality: nationality || null,
        nid_no: nid_no || null,
        blood_group: blood_group || null
      };

      const newUser = await userModel.createUser(userData);

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: newUser.id, 
          email: newUser.email, 
          username: newUser.username,
          role: newUser.role 
        },
        authConfig.jwt.secret,
        { expiresIn: authConfig.jwt.expiresIn }
      );

      // Generate refresh token
      const refreshToken = jwt.sign(
        { id: newUser.id, type: 'refresh' },
        authConfig.jwt.secret,
        { expiresIn: authConfig.jwt.refreshTokenExpiresIn }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: newUser,
          token,
          refreshToken
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific errors
      if (error.message.includes('Email already exists')) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }
      
      if (error.message.includes('Username already exists')) {
        return res.status(409).json({
          success: false,
          message: 'Username already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  },

  /**
   * Login user
   * @route POST /api/auth/login
   */
  login: async (req, res) => {
    try {
      const { identifier, password } = req.body;

      // Validate required fields
      if (!identifier || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email/username and password are required'
        });
      }

      // Create user instance
      const userModel = new User();

      // Find user by email or username
      const user = await userModel.findByEmailOrUsername(identifier);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Verify password
      const isValidPassword = await userModel.verifyPassword(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if user is active
      if (user.status === 'inactive') {
        return res.status(403).json({
          success: false,
          message: 'Account is inactive. Please contact administrator'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          username: user.username,
          role: user.role 
        },
        authConfig.jwt.secret,
        { expiresIn: authConfig.jwt.expiresIn }
      );

      // Generate refresh token
      const refreshToken = jwt.sign(
        { id: user.id, type: 'refresh' },
        authConfig.jwt.secret,
        { expiresIn: authConfig.jwt.refreshTokenExpiresIn }
      );

      // Remove password from user object
      delete user.password;

      // Create session record (optional)
      try {
        const sessionId = crypto.randomBytes(32).toString('hex');
        await db.execute(
          `INSERT INTO sessions (id, user_id, ip_address, user_agent, payload, last_activity) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            sessionId,
            user.id,
            req.ip || req.connection.remoteAddress,
            req.headers['user-agent'] || 'Unknown',
            JSON.stringify({ token: token.substring(0, 20) + '...' }),
            Math.floor(Date.now() / 1000)
          ]
        );
      } catch (sessionError) {
        console.error('Session creation error:', sessionError);
        // Continue even if session creation fails
      }

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          token,
          refreshToken
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  },

  /**
   * Logout user
   * @route POST /api/auth/logout
   */
  logout: async (req, res) => {
    try {
      const userId = req.user?.id;

      if (userId) {
        // Delete user sessions
        await db.execute(
          'DELETE FROM sessions WHERE user_id = ?',
          [userId]
        );
      }

      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        error: error.message
      });
    }
  },

  /**
   * Refresh authentication token
   * @route POST /api/auth/refresh-token
   */
  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      // Verify refresh token
      let decoded;
      try {
        decoded = jwt.verify(refreshToken, authConfig.jwt.secret);
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
      }

      // Check if it's a refresh token
      if (decoded.type !== 'refresh') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token type'
        });
      }

      // Get user
      const userModel = new User();
      const user = await userModel.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if user is active
      if (user.status === 'inactive') {
        return res.status(403).json({
          success: false,
          message: 'Account is inactive'
        });
      }

      // Generate new access token
      const newToken = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          username: user.username,
          role: user.role 
        },
        authConfig.jwt.secret,
        { expiresIn: authConfig.jwt.expiresIn }
      );

      // Generate new refresh token
      const newRefreshToken = jwt.sign(
        { id: user.id, type: 'refresh' },
        authConfig.jwt.secret,
        { expiresIn: authConfig.jwt.refreshTokenExpiresIn }
      );

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token: newToken,
          refreshToken: newRefreshToken
        }
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({
        success: false,
        message: 'Token refresh failed',
        error: error.message
      });
    }
  },

  /**
   * Request password reset
   * @route POST /api/auth/forgot-password
   */
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      // Create user instance
      const userModel = new User();

      // Find user by email
      const user = await userModel.findByEmail(email);

      if (!user) {
        // Don't reveal if user exists or not for security
        return res.status(200).json({
          success: true,
          message: 'If the email exists, a password reset link has been sent'
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Delete any existing tokens for this email
      await db.execute(
        'DELETE FROM password_reset_tokens WHERE email = ?',
        [email]
      );

      // Store token in database
      await db.execute(
        'INSERT INTO password_reset_tokens (email, token, created_at) VALUES (?, ?, NOW())',
        [email, hashedToken]
      );

      // TODO: Send email with reset link
      // In production, you would send an email here with a link like:
      // https://yourapp.com/reset-password?token=${resetToken}&email=${email}
      
      // For development, log the token (remove this in production!)
      console.log('Password reset token:', resetToken);
      console.log('Reset link:', `http://localhost:3000/reset-password?token=${resetToken}&email=${email}`);

      res.status(200).json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
        // Remove this in production:
        devData: process.env.NODE_ENV === 'development' ? { token: resetToken } : undefined
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process password reset request',
        error: error.message
      });
    }
  },

  /**
   * Reset password with token
   * @route POST /api/auth/reset-password
   */
  resetPassword: async (req, res) => {
    try {
      const { email, token, password } = req.body;

      // Validate required fields
      if (!email || !token || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email, token, and new password are required'
        });
      }

      // Validate password strength
      if (password.length < authConfig.password.minLength) {
        return res.status(400).json({
          success: false,
          message: `Password must be at least ${authConfig.password.minLength} characters long`
        });
      }

      // Hash the provided token
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Find token in database
      const [tokens] = await db.execute(
        'SELECT * FROM password_reset_tokens WHERE email = ? AND token = ?',
        [email, hashedToken]
      );

      if (tokens.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }

      const tokenRecord = tokens[0];

      // Check if token is expired (1 hour expiry)
      const tokenAge = Date.now() - new Date(tokenRecord.created_at).getTime();
      if (tokenAge > authConfig.resetToken.expiresIn) {
        // Delete expired token
        await db.execute(
          'DELETE FROM password_reset_tokens WHERE email = ?',
          [email]
        );

        return res.status(400).json({
          success: false,
          message: 'Reset token has expired'
        });
      }

      // Find user
      const userModel = new User();
      const user = await userModel.findByEmail(email);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update password
      await userModel.updatePassword(user.id, password);

      // Delete used token
      await db.execute(
        'DELETE FROM password_reset_tokens WHERE email = ?',
        [email]
      );

      // Delete all user sessions (force re-login)
      await db.execute(
        'DELETE FROM sessions WHERE user_id = ?',
        [user.id]
      );

      res.status(200).json({
        success: true,
        message: 'Password reset successful. Please login with your new password'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset password',
        error: error.message
      });
    }
  },

  /**
   * Get current authenticated user
   * @route GET /api/auth/me
   */
  getCurrentUser: async (req, res) => {
    try {
      // User should be attached by auth middleware
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      // Get user from database
      const userModel = new User();
      const user = await userModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Remove sensitive fields
      delete user.password;

      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user information',
        error: error.message
      });
    }
  }
};

module.exports = AuthController;
