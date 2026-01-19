const express = require('express');
const router = express.Router();
const OBEReviewCycleController = require('../controllers/OBEReviewCycleController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * OBE Review Cycle Management Routes
 * Base path: /api/obe-review-cycles
 */

/**
 * @route   GET /api/obe-review-cycles
 * @desc    Get all OBE review cycles (with pagination, filtering, and search)
 * @access  Private (Admin, Faculty - authenticated users can view)
 * @headers { Authorization: Bearer <token> }
 * @query   { page?, limit?, search?, orderBy?, order?, degreeId?, status?, reviewType?, withDegree? }
 * @returns { success, message, data: [cycles], pagination }
 */
router.get('/', authenticate, OBEReviewCycleController.index);

/**
 * @route   GET /api/obe-review-cycles/status/ongoing
 * @desc    Get all ongoing review cycles
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @returns { success, message, data: [cycles] }
 */
router.get('/status/ongoing', authenticate, OBEReviewCycleController.getOngoing);

/**
 * @route   GET /api/obe-review-cycles/date-range
 * @desc    Get review cycles within a date range
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @query   { start_date, end_date }
 * @returns { success, message, data: [cycles] }
 */
router.get('/date-range', authenticate, OBEReviewCycleController.getByDateRange);

/**
 * @route   GET /api/obe-review-cycles/:id
 * @desc    Get a single OBE review cycle by ID
 * @access  Private (Admin, Faculty - authenticated users can view)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: cycle_id }
 * @query   { withDegree? }
 * @returns { success, message, data: cycle }
 */
router.get('/:id', authenticate, OBEReviewCycleController.show);

/**
 * @route   POST /api/obe-review-cycles
 * @desc    Create a new OBE review cycle
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @body    { degree_id, cycle_name, start_date, end_date, review_type, status?, summary_report? }
 * @returns { success, message, data: cycle }
 */
router.post('/', authenticate, authorize(['Admin']), OBEReviewCycleController.create);

/**
 * @route   PUT /api/obe-review-cycles/:id
 * @desc    Update an OBE review cycle
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: cycle_id }
 * @body    { degree_id?, cycle_name?, start_date?, end_date?, review_type?, status?, summary_report? }
 * @returns { success, message, data: cycle }
 */
router.put('/:id', authenticate, authorize(['Admin']), OBEReviewCycleController.update);

/**
 * @route   PATCH /api/obe-review-cycles/:id/status
 * @desc    Update review cycle status
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: cycle_id }
 * @body    { status }
 * @returns { success, message, data: cycle }
 */
router.patch('/:id/status', authenticate, authorize(['Admin', 'Faculty']), OBEReviewCycleController.updateStatus);

/**
 * @route   PATCH /api/obe-review-cycles/:id/summary-report
 * @desc    Update review cycle summary report
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: cycle_id }
 * @body    { summary_report }
 * @returns { success, message, data: cycle }
 */
router.patch('/:id/summary-report', authenticate, authorize(['Admin', 'Faculty']), OBEReviewCycleController.updateSummaryReport);

/**
 * @route   DELETE /api/obe-review-cycles/:id
 * @desc    Delete an OBE review cycle
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: cycle_id }
 * @returns { success, message }
 */
router.delete('/:id', authenticate, authorize(['Admin']), OBEReviewCycleController.delete);

module.exports = router;
