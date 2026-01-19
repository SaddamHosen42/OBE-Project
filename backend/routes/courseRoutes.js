const express = require('express');
const router = express.Router();
const CourseController = require('../controllers/CourseController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * Course Management Routes
 * Base path: /api/courses
 */

/**
 * @route   GET /api/courses/search
 * @desc    Search courses by keyword in code, title, or summary
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @query   { keyword, page?, limit?, orderBy?, order? }
 * @returns { success, message, data: [courses], pagination }
 */
router.get('/search', authenticate, CourseController.searchCourses);

/**
 * @route   GET /api/courses
 * @desc    Get all courses (with pagination, filtering, and search)
 * @access  Private (Admin, Faculty, Student - all authenticated users can view)
 * @headers { Authorization: Bearer <token> }
 * @query   { page?, limit?, search?, orderBy?, order?, departmentId?, degreeId?, level?, semester?, type? }
 * @returns { success, message, data: [courses], pagination }
 */
router.get('/', authenticate, CourseController.index);

/**
 * @route   GET /api/courses/:id
 * @desc    Get a single course by ID
 * @access  Private (Admin, Faculty, Student - all authenticated users can view)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: course_id }
 * @query   { includeAll? }
 * @returns { success, message, data: course }
 */
router.get('/:id', authenticate, CourseController.show);

/**
 * @route   GET /api/courses/:id/clos
 * @desc    Get Course Learning Outcomes (CLOs) for a specific course
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: course_id }
 * @returns { success, message, data: { course, clos } }
 */
router.get('/:id/clos', authenticate, CourseController.getCLOs);

/**
 * @route   GET /api/courses/:id/clos/count
 * @desc    Get count of CLOs for a course
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: course_id }
 * @returns { success, message, data: { course_id, count } }
 */
router.get('/:id/clos/count', authenticate, CourseController.countCLOs);

/**
 * @route   GET /api/courses/:id/objectives
 * @desc    Get Course Objectives (COs) for a specific course
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: course_id }
 * @returns { success, message, data: { course, objectives } }
 */
router.get('/:id/objectives', authenticate, CourseController.getObjectives);

/**
 * @route   GET /api/courses/:id/objectives/count
 * @desc    Get count of objectives for a course
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: course_id }
 * @returns { success, message, data: { course_id, count } }
 */
router.get('/:id/objectives/count', authenticate, CourseController.countObjectives);

/**
 * @route   POST /api/courses
 * @desc    Create a new course
 * @access  Private (Admin, Faculty with permission)
 * @headers { Authorization: Bearer <token> }
 * @body    { courseCode, courseTitle, department_id, degree_id, credit, contactHourPerWeek?, level?, semester?, academicSession?, type?, type_T_S?, totalMarks?, instructor?, prerequisites?, summary? }
 * @returns { success, message, data: course }
 */
router.post('/', authenticate, authorize(['Admin', 'Faculty']), CourseController.store);

/**
 * @route   PUT /api/courses/:id
 * @desc    Update an existing course
 * @access  Private (Admin, Faculty with permission)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: course_id }
 * @body    { courseCode?, courseTitle?, department_id?, degree_id?, credit?, contactHourPerWeek?, level?, semester?, academicSession?, type?, type_T_S?, totalMarks?, instructor?, prerequisites?, summary? }
 * @returns { success, message, data: course }
 */
router.put('/:id', authenticate, authorize(['Admin', 'Faculty']), CourseController.update);

/**
 * @route   DELETE /api/courses/:id
 * @desc    Delete a course
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: course_id }
 * @returns { success, message }
 */
router.delete('/:id', authenticate, authorize(['Admin']), CourseController.destroy);

module.exports = router;
