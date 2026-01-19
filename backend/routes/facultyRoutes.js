const express = require('express');
const router = express.Router();
const FacultyController = require('../controllers/FacultyController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * Faculty Management Routes
 * Base path: /api/faculties
 */

/**
 * @route   GET /api/faculties
 * @desc    Get all faculties (with pagination, filtering, and search)
 * @access  Private (Admin, Faculty, Student - all authenticated users can view)
 * @headers { Authorization: Bearer <token> }
 * @query   { page?, limit?, search?, orderBy?, order?, withDepartments? }
 * @returns { success, message, data: [faculties], pagination }
 */
router.get('/', authenticate, FacultyController.index);

/**
 * @route   GET /api/faculties/:id
 * @desc    Get a single faculty by ID (with departments if requested)
 * @access  Private (Admin, Faculty, Student - all authenticated users can view)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: faculty_id }
 * @query   { withDepartments? }
 * @returns { success, message, data: faculty }
 */
router.get('/:id', authenticate, FacultyController.show);

/**
 * @route   POST /api/faculties
 * @desc    Create a new faculty
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @body    { name, short_name, description?, dean_user_id?, email?, phone?, website?, established_date? }
 * @returns { success, message, data: faculty }
 */
router.post('/', authenticate, authorize('admin'), FacultyController.store);

/**
 * @route   PUT /api/faculties/:id
 * @desc    Update a faculty
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: faculty_id }
 * @body    { name?, short_name?, description?, dean_user_id?, email?, phone?, website?, established_date? }
 * @returns { success, message, data: faculty }
 */
router.put('/:id', authenticate, authorize('admin'), FacultyController.update);

/**
 * @route   DELETE /api/faculties/:id
 * @desc    Delete a faculty
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: faculty_id }
 * @returns { success, message }
 */
router.delete('/:id', authenticate, authorize('admin'), FacultyController.destroy);

module.exports = router;
