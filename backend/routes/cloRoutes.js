const express = require('express');
const router = express.Router();
const CLOController = require('../controllers/CLOController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * CLO (Course Learning Outcome) Management Routes
 * Base path: /api/clos
 */

/**
 * @route   GET /api/clos/course/:courseId/attainment-summary
 * @desc    Get attainment summary for all CLOs of a course
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @params  { courseId: course_id }
 * @query   { courseOfferingId? }
 * @returns { success, data: [clos_with_attainment], count }
 */
router.get('/course/:courseId/attainment-summary', 
  authenticate, 
  authorize(['Admin', 'Faculty']), 
  CLOController.getCourseAttainmentSummary
);

/**
 * @route   GET /api/clos/:id/attainment
 * @desc    Get attainment data for a specific CLO
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: clo_id }
 * @query   { academicSessionId?, courseOfferingId? }
 * @returns { success, data: attainment_data }
 */
router.get('/:id/attainment', 
  authenticate, 
  authorize(['Admin', 'Faculty']), 
  CLOController.getAttainment
);

/**
 * @route   GET /api/clos/:id/plos
 * @desc    Get all PLOs mapped to a specific CLO
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: clo_id }
 * @returns { success, data: [plos], count }
 */
router.get('/:id/plos', 
  authenticate, 
  authorize(['Admin', 'Faculty']), 
  CLOController.getMappedPLOs
);

/**
 * @route   GET /api/clos
 * @desc    Get all CLOs with optional filtering by course
 * @access  Private (Admin, Faculty, Student)
 * @headers { Authorization: Bearer <token> }
 * @query   { courseId?, includeBloomLevel?, includePLOMappings?, orderBy?, order? }
 * @returns { success, data: [clos], count }
 */
router.get('/', 
  authenticate, 
  CLOController.index
);

/**
 * @route   GET /api/clos/:id
 * @desc    Get a single CLO by ID
 * @access  Private (Admin, Faculty, Student)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: clo_id }
 * @query   { includePLOMappings?, includeAttainment? }
 * @returns { success, data: clo }
 */
router.get('/:id', 
  authenticate, 
  CLOController.show
);

/**
 * @route   POST /api/clos
 * @desc    Create a new CLO
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @body    { course_id, CLO_ID, CLO_Description, bloom_taxonomy_level_id?, weight_percentage?, target_attainment? }
 * @returns { success, message, data: new_clo }
 */
router.post('/', 
  authenticate, 
  authorize(['Admin', 'Faculty']), 
  CLOController.store
);

/**
 * @route   POST /api/clos/:id/map-plo
 * @desc    Map a CLO to a PLO
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: clo_id }
 * @body    { plo_id, mapping_level? (1=Low, 2=Medium, 3=High) }
 * @returns { success, message, data: mapping }
 */
router.post('/:id/map-plo', 
  authenticate, 
  authorize(['Admin', 'Faculty']), 
  CLOController.mapToPLO
);

/**
 * @route   PUT /api/clos/:id
 * @desc    Update an existing CLO
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: clo_id }
 * @body    { course_id, CLO_ID, CLO_Description, bloom_taxonomy_level_id?, weight_percentage?, target_attainment? }
 * @returns { success, message, data: updated_clo }
 */
router.put('/:id', 
  authenticate, 
  authorize(['Admin', 'Faculty']), 
  CLOController.update
);

/**
 * @route   DELETE /api/clos/:id/unmap-plo/:ploId
 * @desc    Unmap a CLO from a PLO
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: clo_id, ploId: plo_id }
 * @returns { success, message }
 */
router.delete('/:id/unmap-plo/:ploId', 
  authenticate, 
  authorize(['Admin', 'Faculty']), 
  CLOController.unmapFromPLO
);

/**
 * @route   DELETE /api/clos/:id
 * @desc    Delete a CLO
 * @access  Private (Admin)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: clo_id }
 * @returns { success, message }
 */
router.delete('/:id', 
  authenticate, 
  authorize(['Admin']), 
  CLOController.destroy
);

module.exports = router;
