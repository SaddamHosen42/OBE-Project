const StudentCLOAttainment = require('../models/StudentCLOAttainment');
const CourseCLOAttainmentSummary = require('../models/CourseCLOAttainmentSummary');

/**
 * CLO Attainment Controller
 * Handles CLO attainment calculation, retrieval, and reporting
 */
const CLOAttainmentController = {
  /**
   * Calculate CLO attainment for a single student
   * @route POST /api/clo-attainment/student/calculate
   * Body: {
   *   student_id: number,
   *   course_offering_id: number,
   *   clo_id: number (optional)
   * }
   */
  calculateStudentAttainment: async (req, res) => {
    try {
      const { student_id, course_offering_id, clo_id } = req.body;

      if (!student_id || !course_offering_id) {
        return res.status(400).json({
          success: false,
          message: 'Student ID and Course Offering ID are required'
        });
      }

      const attainmentModel = new StudentCLOAttainment();
      const attainment = await attainmentModel.calculateAttainment(
        student_id,
        course_offering_id,
        clo_id || null
      );

      return res.status(200).json({
        success: true,
        message: 'Student CLO attainment calculated successfully',
        data: attainment
      });
    } catch (error) {
      console.error('Error in calculateStudentAttainment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to calculate student CLO attainment',
        error: error.message
      });
    }
  },

  /**
   * Calculate CLO attainment for all students in a course offering
   * @route POST /api/clo-attainment/course/calculate
   * Body: {
   *   course_offering_id: number
   * }
   */
  calculateCourseAttainment: async (req, res) => {
    try {
      const { course_offering_id } = req.body;

      if (!course_offering_id) {
        return res.status(400).json({
          success: false,
          message: 'Course Offering ID is required'
        });
      }

      const attainmentModel = new StudentCLOAttainment();
      const summaryModel = new CourseCLOAttainmentSummary();

      // Calculate attainment for all students
      const studentResults = await attainmentModel.calculateAllStudentsAttainment(course_offering_id);

      // Calculate course-level summary
      const courseSummary = await summaryModel.calculateSummary(course_offering_id);

      return res.status(200).json({
        success: true,
        message: 'Course CLO attainment calculated successfully',
        data: {
          student_results: studentResults,
          course_summary: courseSummary
        }
      });
    } catch (error) {
      console.error('Error in calculateCourseAttainment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to calculate course CLO attainment',
        error: error.message
      });
    }
  },

  /**
   * Get CLO attainment report for a student
   * @route GET /api/clo-attainment/student/:studentId/course-offering/:courseOfferingId
   */
  getStudentReport: async (req, res) => {
    try {
      const { studentId, courseOfferingId } = req.params;

      if (!studentId || !courseOfferingId) {
        return res.status(400).json({
          success: false,
          message: 'Student ID and Course Offering ID are required'
        });
      }

      const attainmentModel = new StudentCLOAttainment();

      // Get detailed attainment records
      const attainmentRecords = await attainmentModel.getByStudent(
        parseInt(studentId),
        { courseOfferingId: parseInt(courseOfferingId) }
      );

      // Get summary statistics
      const summary = await attainmentModel.getStudentSummary(
        parseInt(studentId),
        parseInt(courseOfferingId)
      );

      return res.status(200).json({
        success: true,
        message: 'Student CLO attainment report retrieved successfully',
        data: {
          attainment_records: attainmentRecords,
          summary: summary
        }
      });
    } catch (error) {
      console.error('Error in getStudentReport:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get student CLO attainment report',
        error: error.message
      });
    }
  },

  /**
   * Get CLO attainment report for a course offering
   * @route GET /api/clo-attainment/course/:courseOfferingId
   * Query params: clo_id (optional), status (optional)
   */
  getCourseReport: async (req, res) => {
    try {
      const { courseOfferingId } = req.params;
      const { clo_id, status } = req.query;

      if (!courseOfferingId) {
        return res.status(400).json({
          success: false,
          message: 'Course Offering ID is required'
        });
      }

      const attainmentModel = new StudentCLOAttainment();
      const summaryModel = new CourseCLOAttainmentSummary();

      // Get student-level attainment data
      const studentAttainment = await attainmentModel.getByCourseOffering(
        parseInt(courseOfferingId),
        {
          cloId: clo_id ? parseInt(clo_id) : null,
          attainmentStatus: status || null
        }
      );

      // Get course-level summary
      const courseSummary = await summaryModel.getByCourseOffering(
        parseInt(courseOfferingId),
        {
          cloId: clo_id ? parseInt(clo_id) : null
        }
      );

      // Get overall course summary
      const overallSummary = await summaryModel.getCourseOverallSummary(
        parseInt(courseOfferingId)
      );

      return res.status(200).json({
        success: true,
        message: 'Course CLO attainment report retrieved successfully',
        data: {
          student_attainment: studentAttainment,
          clo_summaries: courseSummary,
          overall_summary: overallSummary
        }
      });
    } catch (error) {
      console.error('Error in getCourseReport:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get course CLO attainment report',
        error: error.message
      });
    }
  },

  /**
   * Get all CLO attainment records for a student across all courses
   * @route GET /api/clo-attainment/student/:studentId
   */
  getStudentAllAttainment: async (req, res) => {
    try {
      const { studentId } = req.params;

      if (!studentId) {
        return res.status(400).json({
          success: false,
          message: 'Student ID is required'
        });
      }

      const attainmentModel = new StudentCLOAttainment();
      const attainmentRecords = await attainmentModel.getByStudent(parseInt(studentId));

      return res.status(200).json({
        success: true,
        message: 'Student CLO attainment records retrieved successfully',
        data: attainmentRecords
      });
    } catch (error) {
      console.error('Error in getStudentAllAttainment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get student CLO attainment records',
        error: error.message
      });
    }
  },

  /**
   * Get CLO attainment trends for a course
   * @route GET /api/clo-attainment/course/:courseId/trends
   * Query params: limit (optional, default 5)
   */
  getCLOTrends: async (req, res) => {
    try {
      const { courseId } = req.params;
      const { limit } = req.query;

      if (!courseId) {
        return res.status(400).json({
          success: false,
          message: 'Course ID is required'
        });
      }

      const summaryModel = new CourseCLOAttainmentSummary();
      const trends = await summaryModel.getCLOTrends(
        parseInt(courseId),
        { limit: limit ? parseInt(limit) : 5 }
      );

      return res.status(200).json({
        success: true,
        message: 'CLO attainment trends retrieved successfully',
        data: trends
      });
    } catch (error) {
      console.error('Error in getCLOTrends:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get CLO attainment trends',
        error: error.message
      });
    }
  },

  /**
   * Compare CLO attainment across multiple course offerings
   * @route POST /api/clo-attainment/compare
   * Body: {
   *   course_offering_ids: number[]
   * }
   */
  compareOfferings: async (req, res) => {
    try {
      const { course_offering_ids } = req.body;

      if (!Array.isArray(course_offering_ids) || course_offering_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Course offering IDs array is required'
        });
      }

      const summaryModel = new CourseCLOAttainmentSummary();
      const comparison = await summaryModel.compareOfferings(course_offering_ids);

      return res.status(200).json({
        success: true,
        message: 'Course offering comparison retrieved successfully',
        data: comparison
      });
    } catch (error) {
      console.error('Error in compareOfferings:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to compare course offerings',
        error: error.message
      });
    }
  },

  /**
   * Get detailed attainment breakdown by CLO for a course offering
   * @route GET /api/clo-attainment/course/:courseOfferingId/clo/:cloId/details
   */
  getCLODetails: async (req, res) => {
    try {
      const { courseOfferingId, cloId } = req.params;

      if (!courseOfferingId || !cloId) {
        return res.status(400).json({
          success: false,
          message: 'Course Offering ID and CLO ID are required'
        });
      }

      const attainmentModel = new StudentCLOAttainment();
      const summaryModel = new CourseCLOAttainmentSummary();

      // Get student-level attainment for this specific CLO
      const studentAttainment = await attainmentModel.getByCourseOffering(
        parseInt(courseOfferingId),
        { cloId: parseInt(cloId) }
      );

      // Get summary for this specific CLO
      const cloSummary = await summaryModel.getByCourseOffering(
        parseInt(courseOfferingId),
        { cloId: parseInt(cloId) }
      );

      return res.status(200).json({
        success: true,
        message: 'CLO details retrieved successfully',
        data: {
          student_attainment: studentAttainment,
          clo_summary: cloSummary.length > 0 ? cloSummary[0] : null
        }
      });
    } catch (error) {
      console.error('Error in getCLODetails:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get CLO details',
        error: error.message
      });
    }
  },

  /**
   * Recalculate attainment for all courses in an academic session
   * @route POST /api/clo-attainment/recalculate-session
   * Body: {
   *   academic_session_id: number
   * }
   */
  recalculateSession: async (req, res) => {
    try {
      const { academic_session_id } = req.body;

      if (!academic_session_id) {
        return res.status(400).json({
          success: false,
          message: 'Academic Session ID is required'
        });
      }

      const attainmentModel = new StudentCLOAttainment();
      const summaryModel = new CourseCLOAttainmentSummary();

      // Get all course offerings in the session
      const [courseOfferings] = await attainmentModel.db.execute(
        'SELECT id FROM course_offerings WHERE academic_session_id = ?',
        [academic_session_id]
      );

      if (courseOfferings.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No course offerings found for this academic session'
        });
      }

      const results = {
        total_offerings: courseOfferings.length,
        success: 0,
        failed: 0,
        errors: []
      };

      for (const offering of courseOfferings) {
        try {
          await attainmentModel.calculateAllStudentsAttainment(offering.id);
          await summaryModel.calculateSummary(offering.id);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            course_offering_id: offering.id,
            error: error.message
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: `Recalculated attainment for ${results.success} course offerings, ${results.failed} failed`,
        data: results
      });
    } catch (error) {
      console.error('Error in recalculateSession:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to recalculate session attainment',
        error: error.message
      });
    }
  }
};

module.exports = CLOAttainmentController;
