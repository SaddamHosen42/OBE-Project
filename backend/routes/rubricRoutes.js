const express = require('express');
const router = express.Router();
const RubricController = require('../controllers/RubricController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * Rubric Routes
 * Handles rubric operations for assessments
 * All routes require authentication
 */

/**
 * Get all rubrics with filtering
 * Query params:
 *   - cloId: Filter by CLO
 *   - createdBy: Filter by creator
 *   - includeCriteria: Include criteria (true/false)
 *   - includeLevels: Include levels (true/false)
 */
router.get('/', authenticate, RubricController.index);

/**
 * Get rubrics by CLO
 */
router.get('/clo/:cloId', authenticate, RubricController.getByCLO);

/**
 * Get a specific rubric by ID with full details
 * Query params:
 *   - includeLevels: Include levels (default: true)
 *   - includeCLO: Include CLO details (default: true)
 *   - includeCreator: Include creator details (default: false)
 */
router.get('/:id', authenticate, RubricController.show);

/**
 * Create a new rubric (Admin and Teacher only)
 * Body: {
 *   name: string (required),
 *   description: string,
 *   course_learning_outcome_id: number,
 *   created_by: number (required)
 * }
 */
router.post('/', authenticate, authorize(['admin', 'teacher']), RubricController.store);

/**
 * Update a rubric (Admin and Teacher only)
 * Body: {
 *   name: string,
 *   description: string,
 *   course_learning_outcome_id: number
 * }
 */
router.put('/:id', authenticate, authorize(['admin', 'teacher']), RubricController.update);

/**
 * Delete a rubric (Admin only)
 */
router.delete('/:id', authenticate, authorize(['admin']), RubricController.destroy);

/**
 * Add a criterion to a rubric (Admin and Teacher only)
 * Body: {
 *   criterion_name: string (required),
 *   description: string,
 *   max_score: number,
 *   weight_percentage: number,
 *   order: number
 * }
 */
router.post('/:id/criteria', authenticate, authorize(['admin', 'teacher']), RubricController.addCriteria);

/**
 * Get criteria for a rubric
 * Query params:
 *   - includeLevels: Include levels (default: true)
 */
router.get('/:id/criteria', authenticate, RubricController.getCriteria);

/**
 * Update a criterion (Admin and Teacher only)
 * Body: {
 *   criterion_name: string,
 *   description: string,
 *   max_score: number,
 *   weight_percentage: number,
 *   order: number
 * }
 */
router.put('/criteria/:criteriaId', authenticate, authorize(['admin', 'teacher']), RubricController.updateCriteria);

/**
 * Delete a criterion (Admin only)
 */
router.delete('/criteria/:criteriaId', authenticate, authorize(['admin']), RubricController.deleteCriteria);

/**
 * Add a level to a criterion (Admin and Teacher only)
 * Body: {
 *   level_name: string (required),
 *   level_score: number (required),
 *   description: string
 * }
 */
router.post('/criteria/:criteriaId/levels', authenticate, authorize(['admin', 'teacher']), RubricController.addLevel);

/**
 * Update a level (Admin and Teacher only)
 * Body: {
 *   level_name: string,
 *   level_score: number,
 *   description: string
 * }
 */
router.put('/levels/:levelId', authenticate, authorize(['admin', 'teacher']), RubricController.updateLevel);

/**
 * Delete a level (Admin only)
 */
router.delete('/levels/:levelId', authenticate, authorize(['admin']), RubricController.deleteLevel);

module.exports = router;
