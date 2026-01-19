const express = require('express');
const router = express.Router();
const QuestionController = require('../controllers/QuestionController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * Question Routes
 * Handles individual questions within assessments
 * All routes require authentication
 */

/**
 * Get all questions with filtering
 * Query params:
 *   - assessmentComponentId: Filter by assessment component
 *   - courseOfferingId: Filter by course offering
 *   - difficultyLevel: Filter by difficulty level
 *   - questionType: Filter by question type
 *   - includeCLOMapping: Include CLO mapping (true/false)
 */
router.get('/', authenticate, QuestionController.index);

/**
 * Get statistics for questions in an assessment
 */
router.get('/statistics/:assessmentComponentId', authenticate, QuestionController.getStatistics);

/**
 * Get questions by assessment component
 */
router.get('/assessment/:assessmentComponentId', authenticate, QuestionController.getByAssessment);

/**
 * Get a specific question by ID with full details
 * Query params:
 *   - includeCLOMapping: Include CLO mapping (default: true)
 *   - includeBloomLevel: Include Bloom level (default: true)
 *   - includeAssessment: Include assessment details (default: true)
 */
router.get('/:id', authenticate, QuestionController.show);

/**
 * Create a new question (Admin and Teacher only)
 * Body: {
 *   assessment_component_id: number,
 *   question_number: string,
 *   question_text: string,
 *   question_type: string,
 *   marks: number,
 *   difficulty_level?: string,
 *   bloom_taxonomy_level_id?: number
 * }
 */
router.post(
  '/',
  authenticate,
  authorize(['admin', 'teacher']),
  QuestionController.store
);

/**
 * Update a question (Admin and Teacher only)
 * Body: {
 *   question_number?: string,
 *   question_text?: string,
 *   question_type?: string,
 *   marks?: number,
 *   difficulty_level?: string,
 *   bloom_taxonomy_level_id?: number
 * }
 */
router.put(
  '/:id',
  authenticate,
  authorize(['admin', 'teacher']),
  QuestionController.update
);

/**
 * Delete a question (Admin only)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['admin']),
  QuestionController.destroy
);

/**
 * Map a question to CLO(s) (Admin and Teacher only)
 * Body: {
 *   clo_mappings: [
 *     {
 *       course_learning_outcome_id: number,
 *       marks_allocated: number
 *     }
 *   ]
 * }
 */
router.post(
  '/:id/map-clo',
  authenticate,
  authorize(['admin', 'teacher']),
  QuestionController.mapToCLO
);

/**
 * Get CLO mappings for a question
 */
router.get('/:id/clo-mappings', authenticate, QuestionController.getCLOMappings);

module.exports = router;
