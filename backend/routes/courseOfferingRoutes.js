const express = require('express');
const router = express.Router();
const CourseOfferingController = require('../controllers/CourseOfferingController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * Course Offering Routes
 * All routes require authentication
 * Admin and faculty can manage course offerings
 */

// Get all course offerings with filtering
// Query params: page, limit, orderBy, order, semesterId, teacherId, courseId, status
router.get('/', authenticate, CourseOfferingController.index);

// Get a specific course offering by ID with full details
router.get('/:id', authenticate, CourseOfferingController.show);

// Create a new course offering (Admin and Faculty only)
router.post(
  '/',
  authenticate,
  authorize(['admin', 'teacher']),
  CourseOfferingController.store
);

// Update a course offering (Admin and Faculty only)
router.put(
  '/:id',
  authenticate,
  authorize(['admin', 'teacher']),
  CourseOfferingController.update
);

// Delete a course offering (Admin only)
router.delete(
  '/:id',
  authenticate,
  authorize(['admin']),
  CourseOfferingController.destroy
);

// Get all enrollments for a specific course offering
router.get(
  '/:id/enrollments',
  authenticate,
  CourseOfferingController.getEnrollments
);

// Assign a teacher to a course offering (Admin and Faculty only)
router.post(
  '/:id/assign-teacher',
  authenticate,
  authorize(['admin', 'teacher']),
  CourseOfferingController.assignTeacher
);

// Update teacher assignment (Admin and Faculty only)
router.put(
  '/teacher-assignments/:assignmentId',
  authenticate,
  authorize(['admin', 'teacher']),
  CourseOfferingController.updateTeacherAssignment
);

// Remove teacher assignment (Admin and Faculty only)
router.delete(
  '/teacher-assignments/:assignmentId',
  authenticate,
  authorize(['admin', 'teacher']),
  CourseOfferingController.removeTeacherAssignment
);

module.exports = router;
