const express = require('express');
const router = express.Router();
const DepartmentController = require('../controllers/DepartmentController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * Department Management Routes
 * Base path: /api/departments
 */

/**
 * @route   GET /api/departments
 * @desc    Get all departments (with pagination, filtering, and search)
 * @access  Private (Admin, Faculty, Student - all authenticated users can view)
 * @headers { Authorization: Bearer <token> }
 * @query   { page?, limit?, search?, orderBy?, order?, withDegrees?, facultyId? }
 * @returns { success, message, data: [departments], pagination }
 */
router.get('/', authenticate, DepartmentController.index);

/**
 * @route   GET /api/departments/count/by-faculty/:facultyId
 * @desc    Get count of departments in a faculty
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @params  { facultyId: faculty_id }
 * @returns { success, message, data: { faculty_id, count } }
 */
router.get('/count/by-faculty/:facultyId', authenticate, DepartmentController.countByFaculty);

/**
 * @route   GET /api/departments/code/:code
 * @desc    Get a department by code
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @params  { code: dept_code }
 * @returns { success, message, data: department }
 */
router.get('/code/:code', authenticate, DepartmentController.getByCode);

/**
 * @route   GET /api/departments/:id
 * @desc    Get a single department by ID (with degrees if requested)
 * @access  Private (Admin, Faculty, Student - all authenticated users can view)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: department_id }
 * @query   { withDegrees? }
 * @returns { success, message, data: department }
 */
router.get('/:id', authenticate, DepartmentController.show);

/**
 * @route   POST /api/departments
 * @desc    Create a new department
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @body    { name, dept_code, faculty_id }
 * @returns { success, message, data: department }
 */
router.post('/', authenticate, authorize('admin'), DepartmentController.store);

/**
 * @route   PUT /api/departments/:id
 * @desc    Update a department
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: department_id }
 * @body    { name?, dept_code?, faculty_id? }
 * @returns { success, message, data: department }
 */
router.put('/:id', authenticate, authorize('admin'), DepartmentController.update);

/**
 * @route   DELETE /api/departments/:id
 * @desc    Delete a department
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: department_id }
 * @returns { success, message, data: { id } }
 */
router.delete('/:id', authenticate, authorize('admin'), DepartmentController.destroy);

module.exports = router;
