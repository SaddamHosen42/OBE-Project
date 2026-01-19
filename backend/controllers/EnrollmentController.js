const CourseEnrollment = require('../models/CourseEnrollment');

/**
 * Enrollment Controller
 * Handles course enrollment operations including enrollment, dropping, and enrollment queries
 */
const EnrollmentController = {
  /**
   * Enroll a student in a course offering
   * @route POST /api/enrollments
   * @body { student_id, course_offering_id, enrollment_date?, status? }
   */
  enroll: async (req, res) => {
    try {
      const enrollmentData = req.body;

      // Validate required fields
      if (!enrollmentData.student_id || !enrollmentData.course_offering_id) {
        return res.status(400).json({
          success: false,
          message: 'student_id and course_offering_id are required'
        });
      }

      const enrollmentModel = new CourseEnrollment();
      const enrollment = await enrollmentModel.enrollStudent(enrollmentData);

      res.status(201).json({
        success: true,
        message: 'Student enrolled successfully',
        data: enrollment
      });
    } catch (error) {
      console.error('Error in EnrollmentController.enroll:', error);

      // Handle specific error cases
      if (error.message.includes('already enrolled')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to enroll student',
        error: error.message
      });
    }
  },

  /**
   * Drop a student from a course offering
   * @route PUT /api/enrollments/:id/drop
   * @params { id: enrollment_id }
   */
  drop: async (req, res) => {
    try {
      const enrollmentId = parseInt(req.params.id);

      if (!enrollmentId || isNaN(enrollmentId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid enrollment ID is required'
        });
      }

      const enrollmentModel = new CourseEnrollment();
      const result = await enrollmentModel.dropStudent(enrollmentId);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Student dropped from course successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in EnrollmentController.drop:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('already dropped')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to drop student from course',
        error: error.message
      });
    }
  },

  /**
   * Get all enrollments for a specific course offering
   * @route GET /api/enrollments/offering/:id
   * @params { id: course_offering_id }
   * @query { status?, orderBy?, order? }
   */
  getByOffering: async (req, res) => {
    try {
      const courseOfferingId = parseInt(req.params.id);

      if (!courseOfferingId || isNaN(courseOfferingId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid course offering ID is required'
        });
      }

      const { status, orderBy, order } = req.query;

      const options = {
        status: status || null,
        orderBy: orderBy || 'enrollment_date',
        order: order ? order.toUpperCase() : 'ASC'
      };

      const enrollmentModel = new CourseEnrollment();
      const enrollments = await enrollmentModel.getByCourseOffering(courseOfferingId, options);

      res.status(200).json({
        success: true,
        message: 'Enrollments retrieved successfully',
        data: enrollments,
        count: enrollments.length
      });
    } catch (error) {
      console.error('Error in EnrollmentController.getByOffering:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve enrollments',
        error: error.message
      });
    }
  },

  /**
   * Get all enrollments for a specific student
   * @route GET /api/enrollments/student/:id
   * @params { id: student_id }
   * @query { status?, orderBy?, order? }
   */
  getByStudent: async (req, res) => {
    try {
      const studentId = parseInt(req.params.id);

      if (!studentId || isNaN(studentId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid student ID is required'
        });
      }

      const { status, orderBy, order } = req.query;

      const options = {
        status: status || null,
        orderBy: orderBy || 'enrollment_date',
        order: order ? order.toUpperCase() : 'DESC'
      };

      const enrollmentModel = new CourseEnrollment();
      const enrollments = await enrollmentModel.getByStudent(studentId, options);

      res.status(200).json({
        success: true,
        message: 'Enrollments retrieved successfully',
        data: enrollments,
        count: enrollments.length
      });
    } catch (error) {
      console.error('Error in EnrollmentController.getByStudent:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve enrollments',
        error: error.message
      });
    }
  },

  /**
   * Get enrollment details by ID
   * @route GET /api/enrollments/:id
   * @params { id: enrollment_id }
   */
  show: async (req, res) => {
    try {
      const enrollmentId = parseInt(req.params.id);

      if (!enrollmentId || isNaN(enrollmentId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid enrollment ID is required'
        });
      }

      const enrollmentModel = new CourseEnrollment();
      const enrollment = await enrollmentModel.getEnrollmentDetails(enrollmentId);

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Enrollment details retrieved successfully',
        data: enrollment
      });
    } catch (error) {
      console.error('Error in EnrollmentController.show:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve enrollment details',
        error: error.message
      });
    }
  },

  /**
   * Update enrollment status
   * @route PUT /api/enrollments/:id/status
   * @params { id: enrollment_id }
   * @body { status }
   */
  updateStatus: async (req, res) => {
    try {
      const enrollmentId = parseInt(req.params.id);
      const { status } = req.body;

      if (!enrollmentId || isNaN(enrollmentId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid enrollment ID is required'
        });
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const enrollmentModel = new CourseEnrollment();
      const result = await enrollmentModel.updateStatus(enrollmentId, status);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Enrollment status updated successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in EnrollmentController.updateStatus:', error);

      if (error.message.includes('Invalid status')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update enrollment status',
        error: error.message
      });
    }
  },

  /**
   * Get enrollment statistics for a course offering
   * @route GET /api/enrollments/offering/:id/stats
   * @params { id: course_offering_id }
   */
  getStats: async (req, res) => {
    try {
      const courseOfferingId = parseInt(req.params.id);

      if (!courseOfferingId || isNaN(courseOfferingId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid course offering ID is required'
        });
      }

      const enrollmentModel = new CourseEnrollment();
      const stats = await enrollmentModel.getEnrollmentStats(courseOfferingId);

      res.status(200).json({
        success: true,
        message: 'Enrollment statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      console.error('Error in EnrollmentController.getStats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve enrollment statistics',
        error: error.message
      });
    }
  },

  /**
   * Check if a student is enrolled in a course offering
   * @route GET /api/enrollments/check
   * @query { student_id, course_offering_id }
   */
  checkEnrollment: async (req, res) => {
    try {
      const { student_id, course_offering_id } = req.query;

      if (!student_id || !course_offering_id) {
        return res.status(400).json({
          success: false,
          message: 'student_id and course_offering_id are required'
        });
      }

      const enrollmentModel = new CourseEnrollment();
      const enrollment = await enrollmentModel.checkEnrollment(
        parseInt(student_id),
        parseInt(course_offering_id)
      );

      res.status(200).json({
        success: true,
        message: enrollment ? 'Student is enrolled' : 'Student is not enrolled',
        data: {
          isEnrolled: !!enrollment,
          enrollment: enrollment
        }
      });
    } catch (error) {
      console.error('Error in EnrollmentController.checkEnrollment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check enrollment',
        error: error.message
      });
    }
  },

  /**
   * Delete an enrollment
   * @route DELETE /api/enrollments/:id
   * @params { id: enrollment_id }
   */
  destroy: async (req, res) => {
    try {
      const enrollmentId = parseInt(req.params.id);

      if (!enrollmentId || isNaN(enrollmentId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid enrollment ID is required'
        });
      }

      const enrollmentModel = new CourseEnrollment();
      const result = await enrollmentModel.delete(enrollmentId);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Enrollment deleted successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in EnrollmentController.destroy:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete enrollment',
        error: error.message
      });
    }
  }
};

module.exports = EnrollmentController;
