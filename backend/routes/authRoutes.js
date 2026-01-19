const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authenticateToken } = require('../middlewares/authMiddleware');

/**
 * Authentication Routes
 * Base path: /api/auth
 */

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    { name, email, username, password, role, phone?, dob?, nationality?, nid_no?, blood_group? }
 * @returns { success, message, data: { user, token, refreshToken } }
 */
router.post('/register', AuthController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get authentication token
 * @access  Public
 * @body    { identifier, password } - identifier can be email or username
 * @returns { success, message, data: { user, token, refreshToken } }
 */
router.post('/login', AuthController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and invalidate session
 * @access  Private
 * @headers { Authorization: Bearer <token> }
 * @returns { success, message }
 */
router.post('/logout', authenticateToken, AuthController.logout);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 * @body    { refreshToken }
 * @returns { success, message, data: { token, refreshToken } }
 */
router.post('/refresh', AuthController.refreshToken);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset token
 * @access  Public
 * @body    { email }
 * @returns { success, message }
 */
router.post('/forgot-password', AuthController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 * @body    { email, token, password }
 * @returns { success, message }
 */
router.post('/reset-password', AuthController.resetPassword);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user profile
 * @access  Private
 * @headers { Authorization: Bearer <token> }
 * @returns { success, data: { user } }
 */
router.get('/me', authenticateToken, AuthController.getCurrentUser);

module.exports = router;
