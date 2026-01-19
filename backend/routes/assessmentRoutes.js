const express = require('express');
const router = express.Router();
const AssessmentController = require('../controllers/AssessmentController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * Assessment Routes
 * Handles both assessment types and assessment components
 * All routes require authentication
 */

// ============================================
// ASSESSMENT TYPE ROUTES
// ============================================

/**
 * Get all assessment types
 * Query params: 
 *   - category: Filter by category (Continuous or Terminal)
 *   - groupByCategory: Group results by category (true/false)
 */
router.get('/types', authenticate, AssessmentController.getTypes);

/**
 * Get a specific assessment type by ID
 */
router.get('/types/:id', authenticate, AssessmentController.getTypeById);

/**
 * Create a new assessment type (Admin only)
 */
router.post(
  '/types',
  authenticate,
  authorize(['admin']),
  AssessmentController.createType
);

/**
 * Update an assessment type (Admin only)
 */
router.put(
  '/types/:id',
  authenticate,
  authorize(['admin']),
  AssessmentController.updateType
);

/**
 * Delete an assessment type (Admin only)
 */
router.delete(
  '/types/:id',
  authenticate,
  authorize(['admin']),
  AssessmentController.deleteType
);

// ============================================
// ASSESSMENT COMPONENT ROUTES
// ============================================

/**
 * Get all assessment components with filtering
 * Query params:
 *   - courseOfferingId: Filter by course offering
 *   - courseId: Filter by course
 *   - semesterId: Filter by semester (used with courseId)
 *   - published: Only get published components (true/false)
 */
router.get('/components', authenticate, AssessmentController.index);

/**
 * Get a specific assessment component by ID with full details
 */
router.get('/components/:id', authenticate, AssessmentController.show);

/**
 * Create a new assessment component (Admin and Teacher only)
 */
router.post(
  '/components',
  authenticate,
  authorize(['admin', 'teacher']),
  AssessmentController.store
);

/**
 * Update an assessment component (Admin and Teacher only)
 */
router.put(
  '/components/:id',
  authenticate,
  authorize(['admin', 'teacher']),
  AssessmentController.update
);

/**
 * Delete an assessment component (Admin only)
 */
router.delete(
  '/components/:id',
  authenticate,
  authorize(['admin']),
  AssessmentController.destroy
);

// ============================================
// CLO MAPPING ROUTES
// ============================================

/**
 * Get all CLO mappings for an assessment component
 */
router.get(
  '/components/:id/clo-mappings',
  authenticate,
  AssessmentController.getCLOMappings
);

/**
 * Map an assessment component to a CLO (Admin and Teacher only)
 */
router.post(
  '/components/:id/clo-mappings',
  authenticate,
  authorize(['admin', 'teacher']),
  AssessmentController.mapToCLO
);

/**
 * Update a CLO mapping (Admin and Teacher only)
 */
router.put(
  '/components/:id/clo-mappings/:mappingId',
  authenticate,
  authorize(['admin', 'teacher']),
  AssessmentController.updateCLOMapping
);

/**
 * Unmap an assessment component from a CLO (Admin and Teacher only)
 */
router.delete(
  '/components/:id/clo-mappings/:cloId',
  authenticate,
  authorize(['admin', 'teacher']),
  AssessmentController.unmapFromCLO
);

module.exports = router;
