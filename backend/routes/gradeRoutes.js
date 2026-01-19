const express = require('express');
const router = express.Router();
const GradeController = require('../controllers/GradeController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * Grade Management Routes
 * Base path: /api/grades
 */

// ============================================
// Grade Scale Routes
// ============================================

/**
 * @route   GET /api/grades/scales
 * @desc    Get all grade scales (with pagination, filtering, and search)
 * @access  Private (All authenticated users can view)
 * @headers { Authorization: Bearer <token> }
 * @query   { page?, limit?, search?, orderBy?, order?, activeOnly? }
 * @returns { success, message, data: [scales], pagination }
 */
router.get('/scales', authenticate, GradeController.listScales);

/**
 * @route   GET /api/grades/scales/:id
 * @desc    Get a single grade scale by ID
 * @access  Private (All authenticated users can view)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: scale_id }
 * @query   { includeGradePoints? }
 * @returns { success, message, data: scale }
 */
router.get('/scales/:id', authenticate, GradeController.getScale);

/**
 * @route   POST /api/grades/scales
 * @desc    Create a new grade scale
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @body    { name: string, is_active?: boolean }
 * @returns { success, message, data: scale }
 */
router.post('/scales', authenticate, authorize(['admin']), GradeController.createScale);

/**
 * @route   PUT /api/grades/scales/:id
 * @desc    Update a grade scale
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: scale_id }
 * @body    { name?: string, is_active?: boolean }
 * @returns { success, message, data: scale }
 */
router.put('/scales/:id', authenticate, authorize(['admin']), GradeController.updateScale);

/**
 * @route   DELETE /api/grades/scales/:id
 * @desc    Delete a grade scale
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: scale_id }
 * @returns { success, message }
 */
router.delete('/scales/:id', authenticate, authorize(['admin']), GradeController.deleteScale);

/**
 * @route   PATCH /api/grades/scales/:id/activate
 * @desc    Activate a grade scale
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: scale_id }
 * @returns { success, message, data: scale }
 */
router.patch('/scales/:id/activate', authenticate, authorize(['admin']), GradeController.activateScale);

/**
 * @route   PATCH /api/grades/scales/:id/deactivate
 * @desc    Deactivate a grade scale
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: scale_id }
 * @returns { success, message, data: scale }
 */
router.patch('/scales/:id/deactivate', authenticate, authorize(['admin']), GradeController.deactivateScale);

// ============================================
// Grade Point Routes
// ============================================

/**
 * @route   GET /api/grades/scales/:scaleId/points
 * @desc    Get all grade points for a specific scale
 * @access  Private (All authenticated users can view)
 * @headers { Authorization: Bearer <token> }
 * @params  { scaleId: scale_id }
 * @query   { orderBy?, order? }
 * @returns { success, message, data: [points] }
 */
router.get('/scales/:scaleId/points', authenticate, GradeController.listPoints);

/**
 * @route   GET /api/grades/points/:id
 * @desc    Get a single grade point by ID
 * @access  Private (All authenticated users can view)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: point_id }
 * @returns { success, message, data: point }
 */
router.get('/points/:id', authenticate, GradeController.getPoint);

/**
 * @route   POST /api/grades/points
 * @desc    Create a new grade point
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @body    { grade_scale_id: number, letter_grade: string, grade_point: number, min_percentage: number, max_percentage: number, remarks?: string }
 * @returns { success, message, data: point }
 */
router.post('/points', authenticate, authorize(['admin']), GradeController.createPoint);

/**
 * @route   PUT /api/grades/points/:id
 * @desc    Update a grade point
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: point_id }
 * @body    { letter_grade?: string, grade_point?: number, min_percentage?: number, max_percentage?: number, remarks?: string }
 * @returns { success, message, data: point }
 */
router.put('/points/:id', authenticate, authorize(['admin']), GradeController.updatePoint);

/**
 * @route   DELETE /api/grades/points/:id
 * @desc    Delete a grade point
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: point_id }
 * @returns { success, message }
 */
router.delete('/points/:id', authenticate, authorize(['admin']), GradeController.deletePoint);

// ============================================
// Grade Calculation Routes
// ============================================

/**
 * @route   GET /api/grades/calculate
 * @desc    Calculate grade for a given percentage
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @query   { percentage: number, scaleId?: number }
 * @returns { success, message, data: grade }
 */
router.get('/calculate', authenticate, GradeController.calculateGrade);

/**
 * @route   POST /api/grades/calculate-cgpa
 * @desc    Calculate CGPA from an array of grade points
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @body    { gradePoints: number[], creditHours?: number[] }
 * @returns { success, message, data: { cgpa, gradePoints, creditHours } }
 */
router.post('/calculate-cgpa', authenticate, GradeController.calculateCGPA);

module.exports = router;
