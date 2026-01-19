const express = require('express');
const router = express.Router();
const SemesterResultController = require('../controllers/SemesterResultController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * Semester Result Routes
 * Handles semester result calculations, SGPA/CGPA calculations, and result publishing
 * All routes require authentication
 */

/**
 * Calculate SGPA for a student in a specific semester
 * POST /api/semester-results/calculate-sgpa
 * Body: {
 *   student_id: number,
 *   semester_id: number
 * }
 * Requires: Teacher or Admin role
 */
router.post('/calculate-sgpa', authenticate, authorize(['admin', 'teacher']), SemesterResultController.calculateSGPA);

/**
 * Calculate CGPA for a student up to a specific semester
 * POST /api/semester-results/calculate-cgpa
 * Body: {
 *   student_id: number,
 *   semester_id: number
 * }
 * Requires: Teacher or Admin role
 */
router.post('/calculate-cgpa', authenticate, authorize(['admin', 'teacher']), SemesterResultController.calculateCGPA);

/**
 * Calculate and save semester results (both SGPA and CGPA)
 * POST /api/semester-results/calculate
 * Body: {
 *   student_id: number,
 *   semester_id: number
 * }
 * Requires: Teacher or Admin role
 */
router.post('/calculate', authenticate, authorize(['admin', 'teacher']), SemesterResultController.calculateResults);

/**
 * Calculate results for all enrolled students in a semester
 * POST /api/semester-results/calculate-all
 * Body: {
 *   semester_id: number
 * }
 * Requires: Admin role only
 */
router.post('/calculate-all', authenticate, authorize(['admin']), SemesterResultController.calculateAllResults);

/**
 * Publish semester results
 * PATCH /api/semester-results/publish/:semesterId
 * Body: {
 *   student_ids: Array<number> (optional - if not provided, publishes for all students)
 * }
 * Requires: Admin role only
 */
router.patch('/publish/:semesterId', authenticate, authorize(['admin']), SemesterResultController.publishResults);

/**
 * Unpublish semester results
 * PATCH /api/semester-results/unpublish/:semesterId
 * Body: {
 *   student_ids: Array<number> (optional)
 * }
 * Requires: Admin role only
 */
router.patch('/unpublish/:semesterId', authenticate, authorize(['admin']), SemesterResultController.unpublishResults);

/**
 * Get semester results summary (statistics)
 * GET /api/semester-results/semester/:semesterId/summary
 * Requires: Teacher or Admin role
 */
router.get('/semester/:semesterId/summary', authenticate, authorize(['admin', 'teacher']), SemesterResultController.getSemesterSummary);

/**
 * Get semester result for a specific student
 * GET /api/semester-results/student/:studentId/semester/:semesterId
 * Requires: Any authenticated user (students can only view their own results)
 */
router.get('/student/:studentId/semester/:semesterId', authenticate, SemesterResultController.getStudentSemesterResult);

/**
 * Get all semester results for a student
 * GET /api/semester-results/student/:studentId
 * Query params:
 *   - include_unpublished: boolean (optional, default: false)
 * Requires: Any authenticated user (students can only view their own results)
 */
router.get('/student/:studentId', authenticate, SemesterResultController.getStudentAllResults);

/**
 * Get all semester results (admin view)
 * GET /api/semester-results
 * Query params:
 *   - semester_id: number (optional)
 *   - is_published: boolean (optional)
 * Requires: Admin role only
 */
router.get('/', authenticate, authorize(['admin']), SemesterResultController.getAllResults);

/**
 * Get semester result by ID
 * GET /api/semester-results/:id
 * Requires: Any authenticated user
 */
router.get('/:id', authenticate, SemesterResultController.getById);

/**
 * Delete semester result
 * DELETE /api/semester-results/:id
 * Requires: Admin role only
 */
router.delete('/:id', authenticate, authorize(['admin']), SemesterResultController.deleteResult);

module.exports = router;
