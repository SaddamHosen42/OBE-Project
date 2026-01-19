const express = require('express');
const router = express.Router();
const CourseResultController = require('../controllers/CourseResultController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * Course Result Routes
 * Handles course result calculation, publishing, and retrieval
 * All routes require authentication
 */

/**
 * Calculate result for a single student
 * POST /api/course-results/calculate
 * Body: {
 *   student_id: number,
 *   course_offering_id: number
 * }
 * Requires: Teacher or Admin role
 */
router.post('/calculate', authenticate, authorize(['admin', 'teacher']), CourseResultController.calculateResult);

/**
 * Calculate results for all students in a course offering
 * POST /api/course-results/calculate-all
 * Body: {
 *   course_offering_id: number
 * }
 * Requires: Teacher or Admin role
 */
router.post('/calculate-all', authenticate, authorize(['admin', 'teacher']), CourseResultController.calculateResults);

/**
 * Publish or unpublish results for a course offering
 * PATCH /api/course-results/publish/:courseOfferingId
 * Body: {
 *   publish_status: boolean
 * }
 * Requires: Admin role only
 */
router.patch('/publish/:courseOfferingId', authenticate, authorize(['admin']), CourseResultController.publishResults);

/**
 * Get statistics for a course offering
 * GET /api/course-results/statistics/:courseOfferingId
 * Requires: Teacher or Admin role
 */
router.get('/statistics/:courseOfferingId', authenticate, authorize(['admin', 'teacher']), CourseResultController.getCourseStatistics);

/**
 * Get results for a specific student
 * GET /api/course-results/student/:studentId
 * Query params:
 *   - published_only: boolean (optional)
 *   - semester_id: number (optional)
 * Requires: Any authenticated user (students can only view their own results)
 */
router.get('/student/:studentId', authenticate, CourseResultController.getStudentResults);

/**
 * Get results for a specific course offering
 * GET /api/course-results/course-offering/:courseOfferingId
 * Query params:
 *   - published_only: boolean (optional)
 * Requires: Teacher or Admin role
 */
router.get('/course-offering/:courseOfferingId', authenticate, authorize(['admin', 'teacher']), CourseResultController.getCourseOfferingResults);

/**
 * Get result by ID
 * GET /api/course-results/:id
 * Requires: Any authenticated user
 */
router.get('/:id', authenticate, CourseResultController.getResults);

/**
 * Update result remarks
 * PATCH /api/course-results/:id/remarks
 * Body: {
 *   remarks: string
 * }
 * Requires: Teacher or Admin role
 */
router.patch('/:id/remarks', authenticate, authorize(['admin', 'teacher']), CourseResultController.updateRemarks);

/**
 * Delete a result
 * DELETE /api/course-results/:id
 * Requires: Admin role only
 */
router.delete('/:id', authenticate, authorize(['admin']), CourseResultController.deleteResult);

module.exports = router;
