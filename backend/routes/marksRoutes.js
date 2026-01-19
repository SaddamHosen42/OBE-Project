const express = require('express');
const router = express.Router();
const MarksController = require('../controllers/MarksController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * Marks Routes
 * Handles marks entry and management for assessments and questions
 * All routes require authentication
 */

/**
 * Enter assessment marks for a student
 * POST /api/marks/assessment
 * Body: {
 *   student_id: number,
 *   assessment_component_id: number,
 *   marks_obtained: number (nullable),
 *   is_absent: boolean,
 *   is_exempted: boolean,
 *   remarks: string
 * }
 * Requires: Teacher or Admin role
 */
router.post('/assessment', authenticate, authorize(['admin', 'teacher']), MarksController.enterAssessmentMarks);

/**
 * Enter question marks for a student
 * POST /api/marks/question
 * Body: {
 *   student_id: number,
 *   question_id: number,
 *   marks_obtained: number,
 *   feedback: string
 * }
 * Requires: Teacher or Admin role
 */
router.post('/question', authenticate, authorize(['admin', 'teacher']), MarksController.enterQuestionMarks);

/**
 * Bulk enter marks for multiple students
 * POST /api/marks/bulk
 * Body: {
 *   type: 'assessment' | 'question',
 *   marks: Array<MarkData>
 * }
 * Requires: Teacher or Admin role
 */
router.post('/bulk', authenticate, authorize(['admin', 'teacher']), MarksController.bulkEnterMarks);

/**
 * Get marks by assessment component
 * GET /api/marks/assessment/:assessmentComponentId
 * Query params:
 *   - includeStudentDetails: boolean (default: true)
 *   - includeStatistics: boolean (default: false)
 *   - type: 'assessment' | 'question' (default: 'assessment')
 * Requires: Authentication
 */
router.get('/assessment/:assessmentComponentId', authenticate, MarksController.getMarksByAssessment);

/**
 * Get marks by student
 * GET /api/marks/student/:studentId
 * Query params:
 *   - courseOfferingId: number
 *   - assessmentComponentId: number
 *   - assessmentTypeId: number
 *   - type: 'assessment' | 'question' (default: 'assessment')
 *   - includeDetails: boolean (default: true)
 * Requires: Authentication
 */
router.get('/student/:studentId', authenticate, MarksController.getMarksByStudent);

/**
 * Get marks by question (all students)
 * GET /api/marks/question/:questionId
 * Query params:
 *   - includeStudentDetails: boolean (default: true)
 * Requires: Authentication
 */
router.get('/question/:questionId', authenticate, MarksController.getMarksByQuestion);

/**
 * Get assessment statistics
 * GET /api/marks/statistics/assessment/:assessmentComponentId
 * Requires: Authentication
 */
router.get('/statistics/assessment/:assessmentComponentId', authenticate, MarksController.getAssessmentStatistics);

/**
 * Get question statistics for an assessment
 * GET /api/marks/statistics/questions/:assessmentComponentId
 * Requires: Authentication
 */
router.get('/statistics/questions/:assessmentComponentId', authenticate, MarksController.getQuestionStatistics);

/**
 * Get student's total marks for a course offering
 * GET /api/marks/student/:studentId/course/:courseOfferingId/total
 * Requires: Authentication
 */
router.get('/student/:studentId/course/:courseOfferingId/total', authenticate, MarksController.getStudentCourseTotal);

/**
 * Calculate student total from question-level marks
 * GET /api/marks/student/:studentId/assessment/:assessmentComponentId/calculate
 * Requires: Authentication
 */
router.get('/student/:studentId/assessment/:assessmentComponentId/calculate', authenticate, MarksController.calculateStudentTotal);

/**
 * Get CLO-wise marks for a student in an assessment
 * GET /api/marks/student/:studentId/assessment/:assessmentComponentId/clo
 * Requires: Authentication
 */
router.get('/student/:studentId/assessment/:assessmentComponentId/clo', authenticate, MarksController.getCLOWiseMarks);

module.exports = router;
