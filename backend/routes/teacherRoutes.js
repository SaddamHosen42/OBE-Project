const express = require('express');
const router = express.Router();
const TeacherController = require('../controllers/TeacherController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * Teacher Management Routes
 * Base path: /api/teachers
 */

/**
 * @route   GET /api/teachers
 * @desc    Get all teachers (with pagination, filtering, and search)
 * @access  Private (Admin, Faculty - authenticated users can view)
 * @headers { Authorization: Bearer <token> }
 * @query   { page?, limit?, search?, orderBy?, order?, withDetails?, departmentId? }
 * @returns { success, message, data: [teachers], pagination }
 */
router.get('/', authenticate, TeacherController.index);

/**
 * @route   GET /api/teachers/department/:departmentId
 * @desc    Get all teachers in a specific department
 * @access  Private (Admin, Faculty - authenticated users can view)
 * @headers { Authorization: Bearer <token> }
 * @params  { departmentId: department_id }
 * @returns { success, message, data: [teachers] }
 */
router.get('/department/:departmentId', authenticate, TeacherController.getByDepartment);

/**
 * @route   GET /api/teachers/:id
 * @desc    Get a single teacher by ID (with details if requested)
 * @access  Private (Admin, Faculty - authenticated users can view)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: teacher_id }
 * @query   { withDetails? }
 * @returns { success, message, data: teacher }
 */
router.get('/:id', authenticate, TeacherController.show);

/**
 * @route   GET /api/teachers/:id/courses
 * @desc    Get all courses assigned to a teacher
 * @access  Private (Admin, Faculty, Teacher - authenticated users can view)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: teacher_id }
 * @returns { success, message, data: [courses] }
 */
router.get('/:id/courses', authenticate, TeacherController.getCourses);

/**
 * @route   POST /api/teachers
 * @desc    Create a new teacher
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @body    { user_id, faculty_id, department_id, designation_id, employee_id, joining_date, career_obj? }
 * @returns { success, message, data: teacher }
 */
router.post('/', authenticate, authorize('admin'), TeacherController.store);

/**
 * @route   POST /api/teachers/:id/courses
 * @desc    Assign a course to a teacher
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: teacher_id }
 * @body    { course_offering_id, role?, lessons? }
 * @returns { success, message, data: assignment }
 */
router.post('/:id/courses', authenticate, authorize('admin'), TeacherController.assignCourse);

/**
 * @route   PUT /api/teachers/:id
 * @desc    Update a teacher
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: teacher_id }
 * @body    { user_id?, faculty_id?, department_id?, designation_id?, employee_id?, joining_date?, career_obj? }
 * @returns { success, message, data: teacher }
 */
router.put('/:id', authenticate, authorize('admin'), TeacherController.update);

/**
 * @route   PUT /api/teachers/:id/courses/:assignmentId
 * @desc    Update a course assignment
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: teacher_id, assignmentId: assignment_id }
 * @body    { role?, lessons? }
 * @returns { success, message }
 */
router.put('/:id/courses/:assignmentId', authenticate, authorize('admin'), TeacherController.updateCourseAssignment);

/**
 * @route   DELETE /api/teachers/:id
 * @desc    Delete a teacher
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: teacher_id }
 * @returns { success, message }
 */
router.delete('/:id', authenticate, authorize('admin'), TeacherController.destroy);

/**
 * @route   DELETE /api/teachers/:id/courses/:courseOfferingId
 * @desc    Remove a course assignment from a teacher
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: teacher_id, courseOfferingId: course_offering_id }
 * @returns { success, message }
 */
router.delete('/:id/courses/:courseOfferingId', authenticate, authorize('admin'), TeacherController.removeCourseAssignment);

module.exports = router;
