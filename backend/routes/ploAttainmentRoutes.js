const express = require('express');
const router = express.Router();
const PLOAttainmentController = require('../controllers/PLOAttainmentController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * PLO Attainment Routes
 * Handles PLO attainment calculation, retrieval, and reporting
 * All routes require authentication
 */

/**
 * Get PLO attainment overview for dashboard
 * GET /api/plo-attainment/overview
 * Returns aggregated PLO attainment data
 * Requires: Authenticated user
 */
router.get(
  '/overview',
  authenticate,
  PLOAttainmentController.getOverview
);

/**
 * Calculate PLO attainment for a single student
 * POST /api/plo-attainment/student/calculate
 * Body: {
 *   student_id: number,
 *   degree_id: number,
 *   plo_id: number (optional)
 * }
 * Requires: Teacher or Admin role
 */
router.post(
  '/student/calculate',
  authenticate,
  authorize(['admin', 'teacher']),
  PLOAttainmentController.calculateStudentAttainment
);

/**
 * Calculate PLO attainment for all students in a program
 * POST /api/plo-attainment/program/calculate
 * Body: {
 *   degree_id: number
 * }
 * Requires: Teacher or Admin role
 */
router.post(
  '/program/calculate',
  authenticate,
  authorize(['admin', 'teacher']),
  PLOAttainmentController.calculateProgramAttainment
);

/**
 * Get PLO attainment report for a student in a specific program
 * GET /api/plo-attainment/student/:studentId/degree/:degreeId
 * Requires: Teacher, Admin, or Student (own data) role
 */
router.get(
  '/student/:studentId/degree/:degreeId',
  authenticate,
  authorize(['admin', 'teacher', 'student']),
  PLOAttainmentController.getStudentReport
);

/**
 * Get all PLO attainment records for a student across all programs
 * GET /api/plo-attainment/student/:studentId
 * Requires: Teacher, Admin, or Student (own data) role
 */
router.get(
  '/student/:studentId',
  authenticate,
  authorize(['admin', 'teacher', 'student']),
  PLOAttainmentController.getStudentAllAttainment
);

/**
 * Get PLO attainment report for a program
 * GET /api/plo-attainment/program/:degreeId
 * Query params: plo_id (optional), status (optional)
 * Requires: Teacher or Admin role
 */
router.get(
  '/program/:degreeId',
  authenticate,
  authorize(['admin', 'teacher']),
  PLOAttainmentController.getProgramReport
);

/**
 * Get detailed attainment breakdown by PLO for a program
 * GET /api/plo-attainment/program/:degreeId/plo/:ploId/details
 * Requires: Teacher or Admin role
 */
router.get(
  '/program/:degreeId/plo/:ploId/details',
  authenticate,
  authorize(['admin', 'teacher']),
  PLOAttainmentController.getPLODetails
);

/**
 * Get PLO attainment trends for a program
 * GET /api/plo-attainment/program/:degreeId/trends
 * Query params: plo_id (optional), limit (optional, default 5)
 * Requires: Teacher or Admin role
 */
router.get(
  '/program/:degreeId/trends',
  authenticate,
  authorize(['admin', 'teacher']),
  PLOAttainmentController.getPLOTrends
);

/**
 * Get PLO breakdown by course for a student
 * GET /api/plo-attainment/student/:studentId/degree/:degreeId/plo/:ploId/breakdown
 * Requires: Teacher, Admin, or Student (own data) role
 */
router.get(
  '/student/:studentId/degree/:degreeId/plo/:ploId/breakdown',
  authenticate,
  authorize(['admin', 'teacher', 'student']),
  PLOAttainmentController.getPLOBreakdown
);

/**
 * Get student distribution by attainment level for a PLO
 * GET /api/plo-attainment/program/:degreeId/plo/:ploId/distribution
 * Requires: Teacher or Admin role
 */
router.get(
  '/program/:degreeId/plo/:ploId/distribution',
  authenticate,
  authorize(['admin', 'teacher']),
  PLOAttainmentController.getStudentDistribution
);

/**
 * Get overall program statistics
 * GET /api/plo-attainment/program/:degreeId/stats
 * Requires: Teacher or Admin role
 */
router.get(
  '/program/:degreeId/stats',
  authenticate,
  authorize(['admin', 'teacher']),
  PLOAttainmentController.getProgramStats
);

/**
 * Compare PLO attainment across multiple programs
 * POST /api/plo-attainment/compare
 * Body: {
 *   degree_ids: array of numbers
 * }
 * Requires: Admin role
 */
router.post(
  '/compare',
  authenticate,
  authorize(['admin']),
  PLOAttainmentController.comparePrograms
);

module.exports = router;
