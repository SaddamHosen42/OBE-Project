const express = require('express');
const router = express.Router();
const DegreeController = require('../controllers/DegreeController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * Degree Management Routes
 * Base path: /api/degrees
 */

/**
 * @route   GET /api/degrees
 * @desc    Get all degrees (with pagination, filtering, and search)
 * @access  Private (Admin, Faculty, Student - all authenticated users can view)
 * @headers { Authorization: Bearer <token> }
 * @query   { page?, limit?, search?, orderBy?, order?, withPLOs?, withPEOs?, departmentId? }
 * @returns { success, message, data: [degrees], pagination }
 */
router.get('/', authenticate, DegreeController.index);

/**
 * @route   GET /api/degrees/count/by-department/:departmentId
 * @desc    Get count of degrees in a department
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @params  { departmentId: department_id }
 * @returns { success, message, data: { department_id, count } }
 */
router.get('/count/by-department/:departmentId', authenticate, DegreeController.countByDepartment);

/**
 * @route   GET /api/degrees/:id
 * @desc    Get a single degree by ID (with PLOs/PEOs if requested)
 * @access  Private (Admin, Faculty, Student - all authenticated users can view)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: degree_id }
 * @query   { withPLOs?, withPEOs?, withBoth? }
 * @returns { success, message, data: degree }
 */
router.get('/:id', authenticate, DegreeController.show);

/**
 * @route   POST /api/degrees
 * @desc    Create a new degree
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @body    { name, faculty_id, department_id, credit_hours?, duration_years? }
 * @returns { success, message, data: degree }
 */
router.post('/', authenticate, authorize('admin'), DegreeController.store);

/**
 * @route   PUT /api/degrees/:id
 * @desc    Update a degree
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: degree_id }
 * @body    { name?, faculty_id?, department_id?, credit_hours?, duration_years? }
 * @returns { success, message, data: degree }
 */
router.put('/:id', authenticate, authorize('admin'), DegreeController.update);

/**
 * @route   DELETE /api/degrees/:id
 * @desc    Delete a degree
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: degree_id }
 * @returns { success, message, data: { id } }
 */
router.delete('/:id', authenticate, authorize('admin'), DegreeController.destroy);

module.exports = router;
