const CourseResult = require('../models/CourseResult');

/**
 * Course Result Controller
 * Handles course result calculation, publishing, and retrieval
 */
const CourseResultController = {
  /**
   * Calculate result for a single student in a course offering
   * @route POST /api/course-results/calculate
   * Body: {
   *   student_id: number,
   *   course_offering_id: number
   * }
   */
  calculateResult: async (req, res) => {
    try {
      const { student_id, course_offering_id } = req.body;

      if (!student_id || !course_offering_id) {
        return res.status(400).json({
          success: false,
          message: 'Student ID and Course Offering ID are required'
        });
      }

      const resultModel = new CourseResult();
      const result = await resultModel.calculateResult(student_id, course_offering_id);

      return res.status(200).json({
        success: true,
        message: 'Result calculated successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in calculateResult:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to calculate result',
        error: error.message
      });
    }
  },

  /**
   * Calculate results for all students in a course offering
   * @route POST /api/course-results/calculate-all
   * Body: {
   *   course_offering_id: number
   * }
   */
  calculateResults: async (req, res) => {
    try {
      const { course_offering_id } = req.body;

      if (!course_offering_id) {
        return res.status(400).json({
          success: false,
          message: 'Course Offering ID is required'
        });
      }

      const resultModel = new CourseResult();
      const result = await resultModel.calculateAllResults(course_offering_id);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      console.error('Error in calculateResults:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to calculate results',
        error: error.message
      });
    }
  },

  /**
   * Publish or unpublish results for a course offering
   * @route PATCH /api/course-results/publish/:courseOfferingId
   * Body: {
   *   publish_status: boolean
   * }
   */
  publishResults: async (req, res) => {
    try {
      const { courseOfferingId } = req.params;
      const { publish_status = true } = req.body;

      if (!courseOfferingId) {
        return res.status(400).json({
          success: false,
          message: 'Course Offering ID is required'
        });
      }

      const resultModel = new CourseResult();
      const result = await resultModel.publishResults(
        parseInt(courseOfferingId),
        publish_status
      );

      return res.status(200).json({
        success: true,
        message: `Results ${publish_status ? 'published' : 'unpublished'} successfully`,
        data: result
      });
    } catch (error) {
      console.error('Error in publishResults:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to publish results',
        error: error.message
      });
    }
  },

  /**
   * Get results for a specific student
   * @route GET /api/course-results/student/:studentId
   * Query params:
   *   - published_only: boolean (optional)
   *   - semester_id: number (optional)
   */
  getStudentResults: async (req, res) => {
    try {
      const { studentId } = req.params;
      const { published_only, semester_id } = req.query;

      if (!studentId) {
        return res.status(400).json({
          success: false,
          message: 'Student ID is required'
        });
      }

      const resultModel = new CourseResult();
      const results = await resultModel.getByStudent(parseInt(studentId), {
        publishedOnly: published_only === 'true',
        semesterId: semester_id ? parseInt(semester_id) : null
      });

      return res.status(200).json({
        success: true,
        message: 'Student results retrieved successfully',
        data: results
      });
    } catch (error) {
      console.error('Error in getStudentResults:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve student results',
        error: error.message
      });
    }
  },

  /**
   * Get results for a specific course offering
   * @route GET /api/course-results/course-offering/:courseOfferingId
   * Query params:
   *   - published_only: boolean (optional)
   */
  getCourseOfferingResults: async (req, res) => {
    try {
      const { courseOfferingId } = req.params;
      const { published_only } = req.query;

      if (!courseOfferingId) {
        return res.status(400).json({
          success: false,
          message: 'Course Offering ID is required'
        });
      }

      const resultModel = new CourseResult();
      const results = await resultModel.getByCourseOffering(
        parseInt(courseOfferingId),
        {
          publishedOnly: published_only === 'true'
        }
      );

      return res.status(200).json({
        success: true,
        message: 'Course offering results retrieved successfully',
        data: results
      });
    } catch (error) {
      console.error('Error in getCourseOfferingResults:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve course offering results',
        error: error.message
      });
    }
  },

  /**
   * Get results by ID
   * @route GET /api/course-results/:id
   */
  getResults: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Result ID is required'
        });
      }

      const resultModel = new CourseResult();
      const result = await resultModel.findById(parseInt(id));

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Result not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Result retrieved successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in getResults:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve result',
        error: error.message
      });
    }
  },

  /**
   * Get statistics for a course offering
   * @route GET /api/course-results/statistics/:courseOfferingId
   */
  getCourseStatistics: async (req, res) => {
    try {
      const { courseOfferingId } = req.params;

      if (!courseOfferingId) {
        return res.status(400).json({
          success: false,
          message: 'Course Offering ID is required'
        });
      }

      const resultModel = new CourseResult();
      const statistics = await resultModel.getCourseStatistics(
        parseInt(courseOfferingId)
      );

      return res.status(200).json({
        success: true,
        message: 'Course statistics retrieved successfully',
        data: statistics
      });
    } catch (error) {
      console.error('Error in getCourseStatistics:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve course statistics',
        error: error.message
      });
    }
  },

  /**
   * Update result remarks
   * @route PATCH /api/course-results/:id/remarks
   * Body: {
   *   remarks: string
   * }
   */
  updateRemarks: async (req, res) => {
    try {
      const { id } = req.params;
      const { remarks } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Result ID is required'
        });
      }

      const resultModel = new CourseResult();
      await resultModel.update(parseInt(id), { remarks });

      const updatedResult = await resultModel.findById(parseInt(id));

      return res.status(200).json({
        success: true,
        message: 'Remarks updated successfully',
        data: updatedResult
      });
    } catch (error) {
      console.error('Error in updateRemarks:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update remarks',
        error: error.message
      });
    }
  },

  /**
   * Delete a result
   * @route DELETE /api/course-results/:id
   */
  deleteResult: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Result ID is required'
        });
      }

      const resultModel = new CourseResult();
      await resultModel.delete(parseInt(id));

      return res.status(200).json({
        success: true,
        message: 'Result deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteResult:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete result',
        error: error.message
      });
    }
  }
};

module.exports = CourseResultController;
