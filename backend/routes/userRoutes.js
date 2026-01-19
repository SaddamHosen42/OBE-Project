const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * User Management Routes
 * Base path: /api/users
 */

/**
 * @route   GET /api/users
 * @desc    Get all users (with pagination, filtering, and search)
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @query   { page?, limit?, role?, search?, orderBy?, order? }
 * @returns { success, message, data: [users], pagination }
 */
router.get('/', authenticate, authorize('admin'), UserController.index);

/**
 * @route   PUT /api/users/profile
 * @desc    Update own profile (authenticated user)
 * @access  Private (Any authenticated user)
 * @headers { Authorization: Bearer <token> }
 * @body    { name?, phone?, profile_image?, dob?, nationality?, nid_no?, blood_group?, current_password?, new_password? }
 * @returns { success, message, data: user }
 * @note    Must be defined before /:id route to avoid conflict
 */
router.put('/profile', authenticate, UserController.updateProfile);

/**
 * @route   GET /api/users/:id
 * @desc    Get a single user by ID
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: user_id }
 * @returns { success, message, data: user }
 */
router.get('/:id', authenticate, authorize('admin'), UserController.show);

/**
 * @route   PUT /api/users/:id
 * @desc    Update a user (admin only)
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: user_id }
 * @body    { name?, email?, username?, role?, phone?, profile_image?, dob?, nationality?, nid_no?, blood_group?, password? }
 * @returns { success, message, data: user }
 */
router.put('/:id', authenticate, authorize('admin'), UserController.update);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user (admin only)
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: user_id }
 * @returns { success, message }
 */
router.delete('/:id', authenticate, authorize('admin'), UserController.destroy);

module.exports = router;
