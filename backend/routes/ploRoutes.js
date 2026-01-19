const express = require('express');
const router = express.Router();
const PLOController = require('../controllers/PLOController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * PLO (Program Learning Outcome) Management Routes
 * Base path: /api/plos
 */

/**
 * @route   GET /api/plos/degree/:degreeId/attainment-summary
 * @desc    Get attainment summary for all PLOs of a degree
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @params  { degreeId: degree_id }
 * @query   { academicSessionId? }
 * @returns { success, data: [plos_with_attainment], count }
 */
router.get('/degree/:degreeId/attainment-summary', 
  authenticate, 
  authorize(['Admin', 'Faculty']), 
  PLOController.getDegreeAttainmentSummary
);

/**
 * @route   GET /api/plos/:id/attainment
 * @desc    Get attainment data for a specific PLO
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: plo_id }
 * @query   { academicSessionId?, degreeId? }
 * @returns { success, data: attainment_data }
 */
router.get('/:id/attainment', 
  authenticate, 
  authorize(['Admin', 'Faculty']), 
  PLOController.getAttainment
);

/**
 * @route   GET /api/plos/:id/peos
 * @desc    Get all PEOs mapped to a specific PLO
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: plo_id }
 * @returns { success, data: [peos], count }
 */
router.get('/:id/peos', 
  authenticate, 
  authorize(['Admin', 'Faculty']), 
  PLOController.getMappedPEOs
);

/**
 * @route   GET /api/plos/:id/clos
 * @desc    Get all CLOs mapped to a specific PLO
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: plo_id }
 * @returns { success, data: [clos], count }
 */
router.get('/:id/clos', 
  authenticate, 
  authorize(['Admin', 'Faculty']), 
  PLOController.getMappedCLOs
);

/**
 * @route   POST /api/plos/:id/map-peo
 * @desc    Map a PLO to a PEO
 * @access  Private (Admin)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: plo_id }
 * @body    { peo_id: number, correlation_level?: 'High'|'Medium'|'Low' }
 * @returns { success, message, data: mapping }
 */
router.post('/:id/map-peo', 
  authenticate, 
  authorize(['Admin']), 
  PLOController.mapToPEO
);

/**
 * @route   DELETE /api/plos/:id/unmap-peo/:peoId
 * @desc    Unmap a PLO from a PEO
 * @access  Private (Admin)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: plo_id, peoId: peo_id }
 * @returns { success, message, data: result }
 */
router.delete('/:id/unmap-peo/:peoId', 
  authenticate, 
  authorize(['Admin']), 
  PLOController.unmapFromPEO
);

/**
 * @route   GET /api/plos
 * @desc    Get all PLOs or filter by degree
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @query   { degreeId?, includeBloomLevel?, includePEOMappings?, includeCLOMappings?, orderBy?, order? }
 * @returns { success, data: [plos], count }
 */
router.get('/', 
  authenticate, 
  authorize(['Admin', 'Faculty']), 
  PLOController.index
);

/**
 * @route   GET /api/plos/:id
 * @desc    Get a single PLO by ID
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: plo_id }
 * @query   { includePEOMappings?, includeCLOMappings?, includeAttainment? }
 * @returns { success, data: plo }
 */
router.get('/:id', 
  authenticate, 
  authorize(['Admin', 'Faculty']), 
  PLOController.show
);

/**
 * @route   POST /api/plos
 * @desc    Create a new PLO
 * @access  Private (Admin)
 * @headers { Authorization: Bearer <token> }
 * @body    { degree_id: number, programName?: string, PLO_No: string, PLO_Description: string, 
 *            bloom_taxonomy_level_id?: number, target_attainment?: number }
 * @returns { success, message, data: new_plo }
 */
router.post('/', 
  authenticate, 
  authorize(['Admin']), 
  PLOController.store
);

/**
 * @route   PUT /api/plos/:id
 * @desc    Update an existing PLO
 * @access  Private (Admin)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: plo_id }
 * @body    { programName?: string, PLO_No?: string, PLO_Description?: string, 
 *            bloom_taxonomy_level_id?: number, target_attainment?: number }
 * @returns { success, message, data: update_result }
 */
router.put('/:id', 
  authenticate, 
  authorize(['Admin']), 
  PLOController.update
);

/**
 * @route   DELETE /api/plos/:id
 * @desc    Delete a PLO
 * @access  Private (Admin)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: plo_id }
 * @returns { success, message, data: delete_result }
 */
router.delete('/:id', 
  authenticate, 
  authorize(['Admin']), 
  PLOController.destroy
);

module.exports = router;
