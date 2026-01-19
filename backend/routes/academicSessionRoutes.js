const express = require('express');
const router = express.Router();
const AcademicSessionController = require('../controllers/AcademicSessionController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * Academic Session Management Routes
 * Base path: /api/academic-sessions
 */

/**
 * @route   GET /api/academic-sessions
 * @desc    Get all academic sessions (with pagination, filtering, and search)
 * @access  Private (Admin, Faculty, Student - all authenticated users can view)
 * @headers { Authorization: Bearer <token> }
 * @query   { page?, limit?, search?, orderBy?, order?, withSemesters? }
 * @returns { success, message, data: [sessions], pagination }
 */
router.get('/', authenticate, AcademicSessionController.index);

/**
 * @route   GET /api/academic-sessions/active/current
 * @desc    Get the currently active academic session
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @returns { success, message, data: session }
 */
router.get('/active/current', authenticate, AcademicSessionController.getActive);

/**
 * @route   GET /api/academic-sessions/:id
 * @desc    Get a single academic session by ID
 * @access  Private (Admin, Faculty, Student - all authenticated users can view)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: session_id }
 * @query   { withSemesters?, withCourses? }
 * @returns { success, message, data: session }
 */
router.get('/:id', authenticate, AcademicSessionController.show);

/**
 * @route   GET /api/academic-sessions/:id/semesters/count
 * @desc    Get count of semesters in an academic session
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: session_id }
 * @returns { success, message, data: { academic_session_id, count } }
 */
router.get('/:id/semesters/count', authenticate, AcademicSessionController.countSemesters);

/**
 * @route   POST /api/academic-sessions
 * @desc    Create a new academic session
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @body    { session_name, start_date, end_date, is_active? }
 * @returns { success, message, data: session }
 */
router.post('/', authenticate, authorize(['admin']), AcademicSessionController.store);

/**
 * @route   PUT /api/academic-sessions/:id
 * @desc    Update an academic session
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: session_id }
 * @body    { session_name?, start_date?, end_date?, is_active? }
 * @returns { success, message, data: session }
 */
router.put('/:id', authenticate, authorize(['admin']), AcademicSessionController.update);

/**
 * @route   PUT /api/academic-sessions/:id/set-active
 * @desc    Set an academic session as active (deactivates all others)
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: session_id }
 * @returns { success, message, data: session }
 */
router.put('/:id/set-active', authenticate, authorize(['admin']), AcademicSessionController.setActive);

/**
 * @route   DELETE /api/academic-sessions/:id
 * @desc    Delete an academic session
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: session_id }
 * @returns { success, message }
 */
router.delete('/:id', authenticate, authorize(['admin']), AcademicSessionController.destroy);

module.exports = router;
