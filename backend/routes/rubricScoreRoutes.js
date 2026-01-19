const express = require('express');
const router = express.Router();
const RubricScoreController = require('../controllers/RubricScoreController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * Rubric Score Routes
 * Handles rubric-based scoring for students
 * All routes require authentication
 */

/**
 * Enter score for a student's rubric criterion
 * POST /api/rubric-scores
 * Body: {
 *   student_id: number,
 *   assessment_component_id: number,
 *   rubric_criteria_id: number,
 *   rubric_level_id: number,
 *   score: number,
 *   feedback: string
 * }
 * Requires: Teacher or Admin role
 */
router.post('/', authenticate, authorize(['admin', 'teacher']), RubricScoreController.enterScore);

/**
 * Bulk enter scores for multiple criteria
 * POST /api/rubric-scores/bulk
 * Body: {
 *   scores: Array<ScoreData>
 * }
 * Requires: Teacher or Admin role
 */
router.post('/bulk', authenticate, authorize(['admin', 'teacher']), RubricScoreController.bulkEnterScores);

/**
 * Get rubric scores for a student
 * GET /api/rubric-scores/student/:studentId
 * Query params: assessment_component_id, rubric_criteria_id
 * Requires: Any authenticated user
 */
router.get('/student/:studentId', authenticate, RubricScoreController.getScoresByStudent);

/**
 * Get rubric scores for an assessment component
 * GET /api/rubric-scores/assessment/:assessmentComponentId
 * Query params: student_id, rubric_criteria_id
 * Requires: Teacher or Admin role
 */
router.get('/assessment/:assessmentComponentId', authenticate, authorize(['admin', 'teacher']), RubricScoreController.getScoresByAssessment);

/**
 * Get rubric scores summary for an assessment
 * GET /api/rubric-scores/assessment/:assessmentComponentId/summary
 * Requires: Teacher or Admin role
 */
router.get('/assessment/:assessmentComponentId/summary', authenticate, authorize(['admin', 'teacher']), RubricScoreController.getAssessmentSummary);

/**
 * Calculate total rubric score for a student
 * GET /api/rubric-scores/calculate/:studentId/:assessmentComponentId
 * Requires: Any authenticated user
 */
router.get('/calculate/:studentId/:assessmentComponentId', authenticate, RubricScoreController.calculateTotalScore);

/**
 * Get a single rubric score by ID
 * GET /api/rubric-scores/:scoreId
 * Requires: Any authenticated user
 */
router.get('/:scoreId', authenticate, RubricScoreController.getScoreById);

/**
 * Delete a rubric score
 * DELETE /api/rubric-scores/:scoreId
 * Requires: Teacher or Admin role
 */
router.delete('/:scoreId', authenticate, authorize(['admin', 'teacher']), RubricScoreController.deleteScore);

/**
 * Delete all scores for a student in an assessment
 * DELETE /api/rubric-scores/student/:studentId/assessment/:assessmentComponentId
 * Requires: Teacher or Admin role
 */
router.delete('/student/:studentId/assessment/:assessmentComponentId', authenticate, authorize(['admin', 'teacher']), RubricScoreController.deleteStudentScores);

module.exports = router;
