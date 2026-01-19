const express = require('express');
const router = express.Router();
const EnrollmentController = require('../controllers/EnrollmentController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * Enrollment Management Routes
 * Base path: /api/enrollments
 */

/**
 * @route   POST /api/enrollments
 * @desc    Enroll a student in a course offering
 * @access  Private (Admin, Teacher)
 * @headers { Authorization: Bearer <token> }
 * @body    { student_id, course_offering_id, enrollment_date?, status? }
 * @returns { success, message, data: enrollment }
 */
router.post('/', authenticate, authorize(['admin', 'teacher']), EnrollmentController.enroll);

/**
 * @route   GET /api/enrollments/check
 * @desc    Check if a student is enrolled in a course offering
 * @access  Private (Admin, Teacher, Student)
 * @headers { Authorization: Bearer <token> }
 * @query   { student_id, course_offering_id }
 * @returns { success, message, data: { isEnrolled, enrollment } }
 */
router.get('/check', authenticate, EnrollmentController.checkEnrollment);

/**
 * @route   GET /api/enrollments/offering/:id/stats
 * @desc    Get enrollment statistics for a course offering
 * @access  Private (Admin, Teacher)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: course_offering_id }
 * @returns { success, message, data: stats }
 */
router.get('/offering/:id/stats', authenticate, authorize(['admin', 'teacher']), EnrollmentController.getStats);

/**
 * @route   GET /api/enrollments/offering/:id
 * @desc    Get all enrollments for a specific course offering
 * @access  Private (Admin, Teacher)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: course_offering_id }
 * @query   { status?, orderBy?, order? }
 * @returns { success, message, data: [enrollments], count }
 */
router.get('/offering/:id', authenticate, authorize(['admin', 'teacher']), EnrollmentController.getByOffering);

/**
 * @route   GET /api/enrollments/student/:id
 * @desc    Get all enrollments for a specific student
 * @access  Private (Admin, Teacher, Student - own only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: student_id }
 * @query   { status?, orderBy?, order? }
 * @returns { success, message, data: [enrollments], count }
 */
router.get('/student/:id', authenticate, EnrollmentController.getByStudent);

/**
 * @route   GET /api/enrollments/:id
 * @desc    Get enrollment details by ID
 * @access  Private (Admin, Teacher, Student - own only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: enrollment_id }
 * @returns { success, message, data: enrollment }
 */
router.get('/:id', authenticate, EnrollmentController.show);

/**
 * @route   PUT /api/enrollments/:id/drop
 * @desc    Drop a student from a course offering
 * @access  Private (Admin, Teacher)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: enrollment_id }
 * @returns { success, message, data: result }
 */
router.put('/:id/drop', authenticate, authorize(['admin', 'teacher']), EnrollmentController.drop);

/**
 * @route   PUT /api/enrollments/:id/status
 * @desc    Update enrollment status
 * @access  Private (Admin, Teacher)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: enrollment_id }
 * @body    { status }
 * @returns { success, message, data: result }
 */
router.put('/:id/status', authenticate, authorize(['admin', 'teacher']), EnrollmentController.updateStatus);

/**
 * @route   DELETE /api/enrollments/:id
 * @desc    Delete an enrollment
 * @access  Private (Admin)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: enrollment_id }
 * @returns { success, message, data: result }
 */
router.delete('/:id', authenticate, authorize(['admin']), EnrollmentController.destroy);

module.exports = router;
