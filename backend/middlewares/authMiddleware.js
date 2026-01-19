const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');
const User = require('../models/User');

/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user information to the request object
 */

/**
 * Verify JWT token and authenticate user
 * Extracts token from Authorization header, verifies it, and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token format.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, authConfig.jwt.secret);

      // Fetch user from database to ensure user still exists and is active
      const userModel = new User();
      const user = await userModel.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. User not found.'
        });
      }

      // Check if user is active
      if (user.is_active === false || user.is_active === 0) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated. Please contact administrator.'
        });
      }

      // Attach user information to request object
      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        is_active: user.is_active
      };

      // Attach full user object if needed
      req.fullUser = user;

      next();
    } catch (error) {
      // Handle specific JWT errors
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please login again.',
          error: 'TOKEN_EXPIRED'
        });
      }

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. Please login again.',
          error: 'INVALID_TOKEN'
        });
      }

      throw error;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Optional authentication middleware
 * Attempts to authenticate but doesn't fail if no token is provided
 * Useful for routes that have different behavior for authenticated vs unauthenticated users
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);

    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, authConfig.jwt.secret);
      const userModel = new User();
      const user = await userModel.findById(decoded.id);

      if (user && (user.is_active === true || user.is_active === 1)) {
        req.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
          is_active: user.is_active
        };
        req.fullUser = user;
      } else {
        req.user = null;
      }
    } catch (error) {
      // Token is invalid, but we don't fail the request
      req.user = null;
    }

    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    req.user = null;
    next();
  }
};

/**
 * Verify refresh token
 * Used for token refresh endpoints
 */
const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    try {
      const decoded = jwt.verify(refreshToken, authConfig.jwt.secret);

      // Verify this is a refresh token (you can add a type flag in the token payload)
      if (decoded.type !== 'refresh') {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      const userModel = new User();
      const user = await userModel.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token. User not found.'
        });
      }

      if (user.is_active === false || user.is_active === 0) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated.'
        });
      }

      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role
      };

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Refresh token has expired. Please login again.',
          error: 'REFRESH_TOKEN_EXPIRED'
        });
      }

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token.',
          error: 'INVALID_REFRESH_TOKEN'
        });
      }

      throw error;
    }
  } catch (error) {
    console.error('Refresh token verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during token refresh'
    });
  }
};

module.exports = {
  authenticate,
  optionalAuthenticate,
  verifyRefreshToken
};
