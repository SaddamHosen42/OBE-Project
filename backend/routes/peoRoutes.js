const express = require('express');
const router = express.Router();
const PEOController = require('../controllers/PEOController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * PEO (Program Educational Objective) Management Routes
 * Base path: /api/peos
 */

/**
 * @route   GET /api/peos/degree/:degreeId/stats
 * @desc    Get statistics for all PEOs of a degree
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @params  { degreeId: degree_id }
 * @returns { success, data: stats }
 */
router.get('/degree/:degreeId/stats', 
  authenticate, 
  authorize(['Admin', 'Faculty']), 
  PEOController.getStatsByDegree
);

/**
 * @route   GET /api/peos/:id/plos
 * @desc    Get all PLOs mapped to a specific PEO
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: peo_id }
 * @returns { success, data: [plos], count }
 */
router.get('/:id/plos', 
  authenticate, 
  authorize(['Admin', 'Faculty']), 
  PEOController.getMappedPLOs
);

/**
 * @route   POST /api/peos/:id/plos/bulk
 * @desc    Bulk map PLOs to a PEO
 * @access  Private (Admin)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: peo_id }
 * @body    { mappings: [{plo_id, correlation_level?}] }
 * @returns { success, message, data: [mappings], count }
 */
router.post('/:id/plos/bulk', 
  authenticate, 
  authorize(['Admin']), 
  PEOController.bulkMapToPLOs
);

/**
 * @route   POST /api/peos/:id/plos
 * @desc    Map a PLO to a PEO
 * @access  Private (Admin)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: peo_id }
 * @body    { plo_id, correlation_level? }
 * @returns { success, message, data: mapping }
 */
router.post('/:id/plos', 
  authenticate, 
  authorize(['Admin']), 
  PEOController.mapToPLO
);

/**
 * @route   PUT /api/peos/:id/plos/:ploId
 * @desc    Update PEO-PLO mapping
 * @access  Private (Admin)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: peo_id, ploId: plo_id }
 * @body    { correlation_level }
 * @returns { success, message }
 */
router.put('/:id/plos/:ploId', 
  authenticate, 
  authorize(['Admin']), 
  PEOController.updateMapping
);

/**
 * @route   DELETE /api/peos/:id/plos/:ploId
 * @desc    Remove PLO mapping from PEO
 * @access  Private (Admin)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: peo_id, ploId: plo_id }
 * @returns { success, message }
 */
router.delete('/:id/plos/:ploId', 
  authenticate, 
  authorize(['Admin']), 
  PEOController.unmapFromPLO
);

/**
 * @route   GET /api/peos
 * @desc    Get all PEOs with optional filtering
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @query   { degreeId?, includePLOMappings?, orderBy?, order? }
 * @returns { success, data: [peos], count }
 */
router.get('/', 
  authenticate, 
  authorize(['Admin', 'Faculty']), 
  PEOController.index
);

/**
 * @route   POST /api/peos
 * @desc    Create a new PEO
 * @access  Private (Admin)
 * @headers { Authorization: Bearer <token> }
 * @body    { degree_id, PEO_No, PEO_Description }
 * @returns { success, message, data: new_peo }
 */
router.post('/', 
  authenticate, 
  authorize(['Admin']), 
  PEOController.store
);

/**
 * @route   GET /api/peos/:id
 * @desc    Get a specific PEO by ID
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: peo_id }
 * @query   { includePLOMappings? }
 * @returns { success, data: peo }
 */
router.get('/:id', 
  authenticate, 
  authorize(['Admin', 'Faculty']), 
  PEOController.show
);

/**
 * @route   PUT /api/peos/:id
 * @desc    Update a PEO
 * @access  Private (Admin)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: peo_id }
 * @body    { degree_id?, PEO_No?, PEO_Description? }
 * @returns { success, message, data: updated_peo }
 */
router.put('/:id', 
  authenticate, 
  authorize(['Admin']), 
  PEOController.update
);

/**
 * @route   DELETE /api/peos/:id
 * @desc    Delete a PEO
 * @access  Private (Admin)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: peo_id }
 * @returns { success, message }
 */
router.delete('/:id', 
  authenticate, 
  authorize(['Admin']), 
  PEOController.destroy
);

module.exports = router;
