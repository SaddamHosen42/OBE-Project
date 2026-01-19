const express = require('express');
const router = express.Router();
const StudentController = require('../controllers/StudentController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * Student Management Routes
 * Base path: /api/students
 */

/**
 * @route   GET /api/students/sid/:sid
 * @desc    Get student by Student ID (SID)
 * @access  Private (Admin, Teacher, Student)
 * @headers { Authorization: Bearer <token> }
 * @params  { sid: student_id }
 * @returns { success, message, data: student }
 */
router.get('/sid/:sid', authenticate, StudentController.getBySID);

/**
 * @route   GET /api/students/department/:departmentId
 * @desc    Get all students in a specific department
 * @access  Private (Admin, Teacher)
 * @headers { Authorization: Bearer <token> }
 * @params  { departmentId: department_id }
 * @query   { orderBy?, order? }
 * @returns { success, message, data: [students] }
 */
router.get('/department/:departmentId', authenticate, authorize(['admin', 'teacher']), StudentController.getByDepartment);

/**
 * @route   GET /api/students/degree/:degreeId
 * @desc    Get all students in a specific degree program
 * @access  Private (Admin, Teacher)
 * @headers { Authorization: Bearer <token> }
 * @params  { degreeId: degree_id }
 * @query   { orderBy?, order? }
 * @returns { success, message, data: [students] }
 */
router.get('/degree/:degreeId', authenticate, authorize(['admin', 'teacher']), StudentController.getByDegree);

/**
 * @route   GET /api/students/:id/enrollments
 * @desc    Get student's course enrollments
 * @access  Private (Admin, Teacher, Student - own records)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: student_id }
 * @query   { status?, academicSessionId?, semesterId? }
 * @returns { success, message, data: [enrollments] }
 */
router.get('/:id/enrollments', authenticate, StudentController.getEnrollments);

/**
 * @route   GET /api/students/:id/results
 * @desc    Get student's academic results (CGPA and course results)
 * @access  Private (Admin, Teacher, Student - own records)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: student_id }
 * @returns { success, message, data: { cgpa, enrollments, course_results } }
 */
router.get('/:id/results', authenticate, StudentController.getResults);

/**
 * @route   GET /api/students/:id/attainment
 * @desc    Get student's CLO and PLO attainment report
 * @access  Private (Admin, Teacher, Student - own records)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: student_id }
 * @query   { courseOfferingId?, semesterId? }
 * @returns { success, message, data: { clo_attainment, plo_attainment } }
 */
router.get('/:id/attainment', authenticate, StudentController.getAttainmentReport);

/**
 * @route   GET /api/students
 * @desc    Get all students (with pagination, filtering, and search)
 * @access  Private (Admin, Teacher)
 * @headers { Authorization: Bearer <token> }
 * @query   { page?, limit?, search?, orderBy?, order?, departmentId?, degreeId?, academicStatus?, batchYear? }
 * @returns { success, message, data: [students], pagination }
 */
router.get('/', authenticate, authorize(['admin', 'teacher']), StudentController.index);

/**
 * @route   GET /api/students/:id
 * @desc    Get a single student by ID
 * @access  Private (Admin, Teacher, Student - own records)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: student_id }
 * @returns { success, message, data: student }
 */
router.get('/:id', authenticate, StudentController.show);

/**
 * @route   POST /api/students
 * @desc    Create a new student
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @body    { user_id, faculty_id, degree_id, department_id, SID, batch_year, admission_date, level?, semester?, session_year?, residential_status?, academic_status?, image? }
 * @returns { success, message, data: student }
 */
router.post('/', authenticate, authorize(['admin']), StudentController.store);

/**
 * @route   PUT /api/students/:id
 * @desc    Update an existing student
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: student_id }
 * @body    { user_id?, faculty_id?, degree_id?, department_id?, SID?, batch_year?, admission_date?, level?, semester?, session_year?, residential_status?, academic_status?, image? }
 * @returns { success, message, data: student }
 */
router.put('/:id', authenticate, authorize(['admin']), StudentController.update);

/**
 * @route   DELETE /api/students/:id
 * @desc    Delete a student
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: student_id }
 * @returns { success, message }
 */
router.delete('/:id', authenticate, authorize(['admin']), StudentController.destroy);

module.exports = router;
