const express = require('express');
const router = express.Router();
const CLOAttainmentController = require('../controllers/CLOAttainmentController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * CLO Attainment Routes
 * Handles CLO attainment calculation, retrieval, and reporting
 * All routes require authentication
 */

/**
 * Get CLO attainment overview for dashboard
 * GET /api/clo-attainment/overview
 * Returns aggregated CLO attainment data
 * Requires: Authenticated user
 */
router.get(
  '/overview',
  authenticate,
  CLOAttainmentController.getOverview
);

/**
 * Calculate CLO attainment for a single student
 * POST /api/clo-attainment/student/calculate
 * Body: {
 *   student_id: number,
 *   course_offering_id: number,
 *   clo_id: number (optional)
 * }
 * Requires: Teacher or Admin role
 */
router.post(
  '/student/calculate',
  authenticate,
  authorize(['admin', 'teacher']),
  CLOAttainmentController.calculateStudentAttainment
);

/**
 * Calculate CLO attainment for all students in a course offering
 * POST /api/clo-attainment/course/calculate
 * Body: {
 *   course_offering_id: number
 * }
 * Requires: Teacher or Admin role
 */
router.post(
  '/course/calculate',
  authenticate,
  authorize(['admin', 'teacher']),
  CLOAttainmentController.calculateCourseAttainment
);

/**
 * Get CLO attainment report for a student in a specific course offering
 * GET /api/clo-attainment/student/:studentId/course-offering/:courseOfferingId
 * Requires: Teacher, Admin, or Student (own data) role
 */
router.get(
  '/student/:studentId/course-offering/:courseOfferingId',
  authenticate,
  authorize(['admin', 'teacher', 'student']),
  CLOAttainmentController.getStudentReport
);

/**
 * Get all CLO attainment records for a student across all courses
 * GET /api/clo-attainment/student/:studentId
 * Requires: Teacher, Admin, or Student (own data) role
 */
router.get(
  '/student/:studentId',
  authenticate,
  authorize(['admin', 'teacher', 'student']),
  CLOAttainmentController.getStudentAllAttainment
);

/**
 * Get CLO attainment report for a course offering
 * GET /api/clo-attainment/course/:courseOfferingId
 * Query params: clo_id (optional), status (optional)
 * Requires: Teacher or Admin role
 */
router.get(
  '/course/:courseOfferingId',
  authenticate,
  authorize(['admin', 'teacher']),
  CLOAttainmentController.getCourseReport
);

/**
 * Get detailed attainment breakdown by CLO for a course offering
 * GET /api/clo-attainment/course/:courseOfferingId/clo/:cloId/details
 * Requires: Teacher or Admin role
 */
router.get(
  '/course/:courseOfferingId/clo/:cloId/details',
  authenticate,
  authorize(['admin', 'teacher']),
  CLOAttainmentController.getCLODetails
);

/**
 * Get CLO attainment trends for a course
 * GET /api/clo-attainment/course/:courseId/trends
 * Query params: limit (optional, default 5)
 * Requires: Teacher or Admin role
 */
router.get(
  '/course/:courseId/trends',
  authenticate,
  authorize(['admin', 'teacher']),
  CLOAttainmentController.getCLOTrends
);

/**
 * Compare CLO attainment across multiple course offerings
 * POST /api/clo-attainment/compare
 * Body: {
 *   course_offering_ids: number[]
 * }
 * Requires: Teacher or Admin role
 */
router.post(
  '/compare',
  authenticate,
  authorize(['admin', 'teacher']),
  CLOAttainmentController.compareOfferings
);

/**
 * Recalculate attainment for all courses in an academic session
 * POST /api/clo-attainment/recalculate-session
 * Body: {
 *   academic_session_id: number
 * }
 * Requires: Admin role only
 */
router.post(
  '/recalculate-session',
  authenticate,
  authorize(['admin']),
  CLOAttainmentController.recalculateSession
);

module.exports = router;
