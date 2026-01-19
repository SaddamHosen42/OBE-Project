const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/ReportController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * Report Routes
 * Handles generation and export of various OBE reports
 * All routes require authentication
 */

/**
 * Generate CLO attainment report for a course offering
 * GET /api/reports/clo-attainment/:courseOfferingId
 * Query params: {
 *   includeStudents: boolean (default: false),
 *   includeAssessments: boolean (default: true)
 * }
 * Requires: Teacher or Admin role
 */
router.get(
  '/clo-attainment/:courseOfferingId',
  authenticate,
  authorize(['admin', 'teacher']),
  ReportController.generateCLOAttainmentReport
);

/**
 * Generate PLO attainment report for a program
 * GET /api/reports/plo-attainment/:degreeId
 * Query params: {
 *   sessionId: number (optional),
 *   includeCourses: boolean (default: true),
 *   includeTrends: boolean (default: false)
 * }
 * Requires: Admin or Department Head role
 */
router.get(
  '/plo-attainment/:degreeId',
  authenticate,
  authorize(['admin', 'hod', 'teacher']),
  ReportController.generatePLOAttainmentReport
);

/**
 * Generate comprehensive course report
 * GET /api/reports/course/:courseOfferingId
 * Requires: Teacher or Admin role
 */
router.get(
  '/course/:courseOfferingId',
  authenticate,
  authorize(['admin', 'teacher']),
  ReportController.generateCourseReport
);

/**
 * Generate comprehensive program report
 * GET /api/reports/program/:degreeId
 * Query params: {
 *   sessionId: number (optional)
 * }
 * Requires: Admin or Department Head role
 */
router.get(
  '/program/:degreeId',
  authenticate,
  authorize(['admin', 'hod']),
  ReportController.generateProgramReport
);

/**
 * Export report in various formats (PDF, Excel, CSV, JSON)
 * POST /api/reports/export
 * Body: {
 *   reportType: 'clo' | 'plo' | 'course' | 'program',
 *   reportId: number,
 *   format: 'pdf' | 'excel' | 'csv' | 'json',
 *   reportData: object (optional)
 * }
 * Requires: Teacher or Admin role
 */
router.post(
  '/export',
  authenticate,
  authorize(['admin', 'teacher', 'hod']),
  ReportController.exportReport
);

/**
 * Get list of available reports
 * GET /api/reports/available
 * Query params: {
 *   degreeId: number (optional),
 *   courseId: number (optional)
 * }
 * Requires: Authenticated user
 */
router.get(
  '/available',
  authenticate,
  ReportController.getAvailableReports
);

module.exports = router;
