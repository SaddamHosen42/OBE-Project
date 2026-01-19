const express = require('express');
const router = express.Router();
const BloomTaxonomyController = require('../controllers/BloomTaxonomyController');
const { authenticate } = require('../middlewares/authMiddleware');

/**
 * Bloom's Taxonomy Management Routes
 * Base path: /api/bloom-taxonomy
 */

/**
 * @route   GET /api/bloom-taxonomy
 * @desc    Get all Bloom taxonomy levels (with optional filtering and search)
 * @access  Private (All authenticated users can view)
 * @headers { Authorization: Bearer <token> }
 * @query   { search?, levelNumber?, startLevel?, endLevel?, orderBy?, order? }
 * @returns { success, message, data: [levels], meta }
 * 
 * Query Parameters:
 * - search: Search keyword in name, description, or keywords
 * - levelNumber: Get specific level (1-6)
 * - startLevel & endLevel: Get range of levels (both required if used)
 * - orderBy: Field to order by (default: level_number)
 * - order: Order direction ASC/DESC (default: ASC)
 */
router.get('/', authenticate, BloomTaxonomyController.index);

/**
 * @route   GET /api/bloom-taxonomy/stats/count
 * @desc    Get count of Bloom taxonomy levels
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @returns { success, message, data: { count, expected, isComplete } }
 */
router.get('/stats/count', authenticate, BloomTaxonomyController.count);

/**
 * @route   GET /api/bloom-taxonomy/name/:name
 * @desc    Get a Bloom taxonomy level by name
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @params  { name: level_name } (e.g., 'Remember', 'Understand', 'Apply')
 * @returns { success, message, data: level }
 */
router.get('/name/:name', authenticate, BloomTaxonomyController.getByName);

/**
 * @route   GET /api/bloom-taxonomy/:id
 * @desc    Get a single Bloom taxonomy level by ID
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: level_id }
 * @returns { success, message, data: level }
 */
router.get('/:id', authenticate, BloomTaxonomyController.show);

module.exports = router;
