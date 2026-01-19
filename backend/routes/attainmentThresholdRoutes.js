const express = require('express');
const router = express.Router();
const AttainmentThresholdController = require('../controllers/AttainmentThresholdController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * Attainment Threshold Management Routes
 * Base path: /api/attainment-thresholds
 */

/**
 * @route   GET /api/attainment-thresholds
 * @desc    Get all attainment thresholds (with pagination, filtering, and search)
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @query   { page?, limit?, search?, orderBy?, order?, thresholdType?, degreeId? }
 * @returns { success, message, data: [thresholds], pagination }
 */
router.get('/', authenticate, AttainmentThresholdController.index);

/**
 * @route   GET /api/attainment-thresholds/degree/:degreeId
 * @desc    Get all attainment thresholds for a specific degree
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @params  { degreeId: degree_id }
 * @query   { thresholdType? }
 * @returns { success, message, data: [thresholds] }
 */
router.get('/degree/:degreeId', authenticate, AttainmentThresholdController.getByDegree);

/**
 * @route   GET /api/attainment-thresholds/type/:thresholdType
 * @desc    Get all attainment thresholds of a specific type (CLO/PLO/PEO)
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @params  { thresholdType: threshold_type (CLO/PLO/PEO) }
 * @returns { success, message, data: [thresholds] }
 */
router.get('/type/:thresholdType', authenticate, AttainmentThresholdController.getByType);

/**
 * @route   POST /api/attainment-thresholds/evaluate
 * @desc    Evaluate attainment level based on a percentage score
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @body    { degree_id, threshold_type, percentage }
 * @returns { success, message, data: { degree_id, threshold_type, percentage, level } }
 */
router.post('/evaluate', authenticate, AttainmentThresholdController.evaluate);

/**
 * @route   GET /api/attainment-thresholds/:id
 * @desc    Get a single attainment threshold by ID
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: threshold_id }
 * @returns { success, message, data: threshold }
 */
router.get('/:id', authenticate, AttainmentThresholdController.show);

/**
 * @route   POST /api/attainment-thresholds
 * @desc    Create a new attainment threshold
 * @access  Private (Admin and Faculty only)
 * @headers { Authorization: Bearer <token> }
 * @body    { degree_id, threshold_type, level_name, min_percentage, max_percentage, is_attained? }
 * @returns { success, message, data: threshold }
 */
router.post('/', authenticate, authorize(['admin', 'faculty']), AttainmentThresholdController.store);

/**
 * @route   PUT /api/attainment-thresholds/:id
 * @desc    Update an existing attainment threshold
 * @access  Private (Admin and Faculty only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: threshold_id }
 * @body    { degree_id?, threshold_type?, level_name?, min_percentage?, max_percentage?, is_attained? }
 * @returns { success, message, data: threshold }
 */
router.put('/:id', authenticate, authorize(['admin', 'faculty']), AttainmentThresholdController.update);

/**
 * @route   DELETE /api/attainment-thresholds/:id
 * @desc    Delete an attainment threshold
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: threshold_id }
 * @returns { success, message, data: { id } }
 */
router.delete('/:id', authenticate, authorize(['admin']), AttainmentThresholdController.destroy);

/**
 * @route   DELETE /api/attainment-thresholds/degree/:degreeId
 * @desc    Delete all thresholds for a specific degree
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { degreeId: degree_id }
 * @returns { success, message, data: { degree_id, deleted_count } }
 */
router.delete('/degree/:degreeId', authenticate, authorize(['admin']), AttainmentThresholdController.deleteByDegree);

module.exports = router;
