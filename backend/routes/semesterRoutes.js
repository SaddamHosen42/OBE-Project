const express = require('express');
const router = express.Router();
const SemesterController = require('../controllers/SemesterController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * Semester Management Routes
 * Base path: /api/semesters
 */

/**
 * @route   GET /api/semesters
 * @desc    Get all semesters (with pagination, filtering, and search)
 * @access  Private (Admin, Faculty, Student - all authenticated users can view)
 * @headers { Authorization: Bearer <token> }
 * @query   { page?, limit?, search?, orderBy?, order?, sessionId?, includeSession? }
 * @returns { success, message, data: [semesters], pagination }
 */
router.get('/', authenticate, SemesterController.index);

/**
 * @route   GET /api/semesters/active/current
 * @desc    Get the currently active semester
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @query   { includeSession? }
 * @returns { success, message, data: semester }
 */
router.get('/active/current', authenticate, SemesterController.getActive);

/**
 * @route   GET /api/semesters/:id
 * @desc    Get a single semester by ID
 * @access  Private (Admin, Faculty, Student - all authenticated users can view)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: semester_id }
 * @query   { includeSession?, includeCourseOfferings? }
 * @returns { success, message, data: semester }
 */
router.get('/:id', authenticate, SemesterController.show);

/**
 * @route   GET /api/semesters/:id/course-offerings/count
 * @desc    Get count of course offerings in a semester
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: semester_id }
 * @returns { success, message, data: { semester_id, count } }
 */
router.get('/:id/course-offerings/count', authenticate, SemesterController.countCourseOfferings);

/**
 * @route   POST /api/semesters
 * @desc    Create a new semester
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @body    { academic_session_id, name, semester_number, start_date, end_date, is_active? }
 * @returns { success, message, data: semester }
 */
router.post('/', authenticate, authorize(['Admin']), SemesterController.store);

/**
 * @route   PUT /api/semesters/:id
 * @desc    Update an existing semester
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: semester_id }
 * @body    { academic_session_id?, name?, semester_number?, start_date?, end_date?, is_active? }
 * @returns { success, message, data: semester }
 */
router.put('/:id', authenticate, authorize(['Admin']), SemesterController.update);

/**
 * @route   PATCH /api/semesters/:id/activate
 * @desc    Set a semester as active (deactivates all others)
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: semester_id }
 * @returns { success, message, data: semester }
 */
router.patch('/:id/activate', authenticate, authorize(['Admin']), SemesterController.activate);

/**
 * @route   DELETE /api/semesters/:id
 * @desc    Delete a semester
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: semester_id }
 * @returns { success, message }
 */
router.delete('/:id', authenticate, authorize(['Admin']), SemesterController.destroy);

module.exports = router;
