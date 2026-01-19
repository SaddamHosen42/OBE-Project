const express = require('express');
const router = express.Router();
const ActionPlanController = require('../controllers/ActionPlanController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * Action Plan Management Routes
 * Base path: /api/action-plans
 */

/**
 * @route   GET /api/action-plans/overdue
 * @desc    Get overdue action plans
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @query   { degreeId?: number }
 * @returns { success, data: [action_plans], count }
 */
router.get('/overdue', 
  authenticate, 
  authorize(['Admin', 'Faculty']), 
  ActionPlanController.getOverdue
);

/**
 * @route   GET /api/action-plans/statistics
 * @desc    Get action plan statistics
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @query   { degreeId?: number }
 * @returns { success, data: statistics }
 */
router.get('/statistics', 
  authenticate, 
  authorize(['Admin', 'Faculty']), 
  ActionPlanController.getStatistics
);

/**
 * @route   GET /api/action-plans/status/:status
 * @desc    Get action plans by status
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @params  { status: string }
 * @query   { degreeId?: number, includeOutcomes?: boolean }
 * @returns { success, data: [action_plans], count }
 */
router.get('/status/:status', 
  authenticate, 
  authorize(['Admin', 'Faculty']), 
  ActionPlanController.getByStatus
);

/**
 * @route   GET /api/action-plans/:id/outcomes/statistics
 * @desc    Get outcome statistics for an action plan
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: action_plan_id }
 * @returns { success, data: statistics }
 */
router.get('/:id/outcomes/statistics', 
  authenticate, 
  authorize(['Admin', 'Faculty']), 
  ActionPlanController.getOutcomeStatistics
);

/**
 * @route   GET /api/action-plans/:id/outcomes
 * @desc    Get all outcomes for an action plan
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: action_plan_id }
 * @query   { status?: string, orderBy?: string, order?: string }
 * @returns { success, data: [outcomes], count }
 */
router.get('/:id/outcomes', 
  authenticate, 
  authorize(['Admin', 'Faculty']), 
  ActionPlanController.getOutcomes
);

/**
 * @route   POST /api/action-plans/:id/outcomes/bulk
 * @desc    Bulk add outcomes to an action plan
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: action_plan_id }
 * @body    { outcomes: [{outcome_type, outcome_id, description?, target_value?, current_value?, status?}] }
 * @returns { success, message, data: [outcomes], count }
 */
router.post('/:id/outcomes/bulk', 
  authenticate, 
  authorize(['Admin', 'Faculty']), 
  ActionPlanController.bulkAddOutcomes
);

/**
 * @route   POST /api/action-plans/:id/outcomes
 * @desc    Add an outcome to an action plan
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: action_plan_id }
 * @body    { outcome_type, outcome_id, description?, target_value?, current_value?, status? }
 * @returns { success, message, data: outcome }
 */
router.post('/:id/outcomes', 
  authenticate, 
  authorize(['Admin', 'Faculty']), 
  ActionPlanController.addOutcome
);

/**
 * @route   PATCH /api/action-plans/:id/status
 * @desc    Update action plan status
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: action_plan_id }
 * @body    { status: string }
 * @returns { success, message, data: action_plan }
 */
router.patch('/:id/status', 
  authenticate, 
  authorize(['Admin', 'Faculty']), 
  ActionPlanController.updateStatus
);

/**
 * @route   GET /api/action-plans
 * @desc    List all action plans with optional filtering
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @query   { degreeId?: number, status?: string, includeOutcomes?: boolean, orderBy?: string, order?: string }
 * @returns { success, data: [action_plans], count }
 */
router.get('/', 
  authenticate, 
  authorize(['Admin', 'Faculty']), 
  ActionPlanController.index
);

/**
 * @route   GET /api/action-plans/:id
 * @desc    Get a single action plan by ID
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: action_plan_id }
 * @query   { includeOutcomes?: boolean }
 * @returns { success, data: action_plan }
 */
router.get('/:id', 
  authenticate, 
  authorize(['Admin', 'Faculty']), 
  ActionPlanController.show
);

/**
 * @route   POST /api/action-plans
 * @desc    Create a new action plan
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @body    { degree_id, title, description?, status?, priority?, start_date?, end_date?, responsible_person? }
 * @returns { success, message, data: action_plan }
 */
router.post('/', 
  authenticate, 
  authorize(['Admin', 'Faculty']), 
  ActionPlanController.store
);

/**
 * @route   PUT /api/action-plans/:id
 * @desc    Update an action plan
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: action_plan_id }
 * @body    { degree_id?, title?, description?, status?, priority?, start_date?, end_date?, responsible_person? }
 * @returns { success, message, data: action_plan }
 */
router.put('/:id', 
  authenticate, 
  authorize(['Admin', 'Faculty']), 
  ActionPlanController.update
);

/**
 * @route   DELETE /api/action-plans/:id
 * @desc    Delete an action plan
 * @access  Private (Admin)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: action_plan_id }
 * @returns { success, message }
 */
router.delete('/:id', 
  authenticate, 
  authorize(['Admin']), 
  ActionPlanController.destroy
);

module.exports = router;
