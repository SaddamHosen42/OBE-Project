const SemesterResult = require('../models/SemesterResult');

/**
 * Semester Result Controller
 * Handles semester result calculations, SGPA/CGPA calculations, and result publishing
 */
const SemesterResultController = {
  /**
   * Calculate SGPA for a student in a specific semester
   * @route POST /api/semester-results/calculate-sgpa
   * Body: {
   *   student_id: number,
   *   semester_id: number
   * }
   */
  calculateSGPA: async (req, res) => {
    try {
      const { student_id, semester_id } = req.body;

      if (!student_id || !semester_id) {
        return res.status(400).json({
          success: false,
          message: 'Student ID and Semester ID are required'
        });
      }

      const resultModel = new SemesterResult();
      const sgpaData = await resultModel.calculateSGPA(student_id, semester_id);

      return res.status(200).json({
        success: true,
        message: 'SGPA calculated successfully',
        data: sgpaData
      });
    } catch (error) {
      console.error('Error in calculateSGPA:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to calculate SGPA',
        error: error.message
      });
    }
  },

  /**
   * Calculate CGPA for a student up to a specific semester
   * @route POST /api/semester-results/calculate-cgpa
   * Body: {
   *   student_id: number,
   *   semester_id: number
   * }
   */
  calculateCGPA: async (req, res) => {
    try {
      const { student_id, semester_id } = req.body;

      if (!student_id || !semester_id) {
        return res.status(400).json({
          success: false,
          message: 'Student ID and Semester ID are required'
        });
      }

      const resultModel = new SemesterResult();
      const cgpaData = await resultModel.calculateCGPA(student_id, semester_id);

      return res.status(200).json({
        success: true,
        message: 'CGPA calculated successfully',
        data: cgpaData
      });
    } catch (error) {
      console.error('Error in calculateCGPA:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to calculate CGPA',
        error: error.message
      });
    }
  },

  /**
   * Calculate and save semester results for a student
   * Calculates both SGPA and CGPA and saves to database
   * @route POST /api/semester-results/calculate
   * Body: {
   *   student_id: number,
   *   semester_id: number
   * }
   */
  calculateResults: async (req, res) => {
    try {
      const { student_id, semester_id } = req.body;

      if (!student_id || !semester_id) {
        return res.status(400).json({
          success: false,
          message: 'Student ID and Semester ID are required'
        });
      }

      const resultModel = new SemesterResult();

      // Calculate SGPA
      const sgpaData = await resultModel.calculateSGPA(student_id, semester_id);

      // Calculate CGPA
      const cgpaData = await resultModel.calculateCGPA(student_id, semester_id);

      // Prepare result data
      const resultData = {
        student_id,
        semester_id,
        sgpa: sgpaData.sgpa,
        cgpa: cgpaData.cgpa,
        total_credit_hours: sgpaData.totalCreditHours,
        earned_credit_hours: sgpaData.earnedCreditHours,
        is_published: false
      };

      // Save or update result
      const savedResult = await resultModel.createOrUpdateResult(resultData);

      return res.status(200).json({
        success: true,
        message: 'Semester results calculated and saved successfully',
        data: {
          result: savedResult,
          sgpaDetails: sgpaData,
          cgpaDetails: cgpaData
        }
      });
    } catch (error) {
      console.error('Error in calculateResults:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to calculate semester results',
        error: error.message
      });
    }
  },

  /**
   * Calculate results for all enrolled students in a semester
   * @route POST /api/semester-results/calculate-all
   * Body: {
   *   semester_id: number
   * }
   */
  calculateAllResults: async (req, res) => {
    try {
      const { semester_id } = req.body;

      if (!semester_id) {
        return res.status(400).json({
          success: false,
          message: 'Semester ID is required'
        });
      }

      const resultModel = new SemesterResult();

      // Get all students enrolled in courses in this semester
      const [enrolledStudents] = await resultModel.db.execute(
        `SELECT DISTINCT ce.student_id
        FROM course_enrollments ce
        JOIN course_offerings co ON ce.course_offering_id = co.id
        WHERE co.semester_id = ?`,
        [semester_id]
      );

      if (enrolledStudents.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No enrolled students found for this semester'
        });
      }

      const results = [];
      const errors = [];

      // Calculate results for each student
      for (const student of enrolledStudents) {
        try {
          // Calculate SGPA
          const sgpaData = await resultModel.calculateSGPA(student.student_id, semester_id);

          // Calculate CGPA
          const cgpaData = await resultModel.calculateCGPA(student.student_id, semester_id);

          // Prepare result data
          const resultData = {
            student_id: student.student_id,
            semester_id,
            sgpa: sgpaData.sgpa,
            cgpa: cgpaData.cgpa,
            total_credit_hours: sgpaData.totalCreditHours,
            earned_credit_hours: sgpaData.earnedCreditHours,
            is_published: false
          };

          // Save or update result
          const savedResult = await resultModel.createOrUpdateResult(resultData);
          results.push({
            student_id: student.student_id,
            sgpa: sgpaData.sgpa,
            cgpa: cgpaData.cgpa,
            success: true
          });
        } catch (error) {
          errors.push({
            student_id: student.student_id,
            error: error.message
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: `Results calculated for ${results.length} out of ${enrolledStudents.length} students`,
        data: {
          successful: results.length,
          total: enrolledStudents.length,
          results,
          errors: errors.length > 0 ? errors : undefined
        }
      });
    } catch (error) {
      console.error('Error in calculateAllResults:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to calculate all semester results',
        error: error.message
      });
    }
  },

  /**
   * Publish semester results
   * @route PATCH /api/semester-results/publish/:semesterId
   * Body: {
   *   student_ids: Array<number> (optional - if not provided, publishes for all students)
   * }
   */
  publishResults: async (req, res) => {
    try {
      const { semesterId } = req.params;
      const { student_ids } = req.body;

      if (!semesterId) {
        return res.status(400).json({
          success: false,
          message: 'Semester ID is required'
        });
      }

      const resultModel = new SemesterResult();
      const result = await resultModel.publishResults(
        parseInt(semesterId),
        student_ids
      );

      return res.status(200).json({
        success: true,
        message: result.message,
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
   * Unpublish semester results
   * @route PATCH /api/semester-results/unpublish/:semesterId
   * Body: {
   *   student_ids: Array<number> (optional)
   * }
   */
  unpublishResults: async (req, res) => {
    try {
      const { semesterId } = req.params;
      const { student_ids } = req.body;

      if (!semesterId) {
        return res.status(400).json({
          success: false,
          message: 'Semester ID is required'
        });
      }

      const resultModel = new SemesterResult();
      const result = await resultModel.unpublishResults(
        parseInt(semesterId),
        student_ids
      );

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      console.error('Error in unpublishResults:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to unpublish results',
        error: error.message
      });
    }
  },

  /**
   * Get semester result for a specific student
   * @route GET /api/semester-results/student/:studentId/semester/:semesterId
   */
  getStudentSemesterResult: async (req, res) => {
    try {
      const { studentId, semesterId } = req.params;

      if (!studentId || !semesterId) {
        return res.status(400).json({
          success: false,
          message: 'Student ID and Semester ID are required'
        });
      }

      const resultModel = new SemesterResult();
      const result = await resultModel.getStudentSemesterResult(
        parseInt(studentId),
        parseInt(semesterId)
      );

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Semester result not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Semester result retrieved successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in getStudentSemesterResult:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve semester result',
        error: error.message
      });
    }
  },

  /**
   * Get all semester results for a student
   * @route GET /api/semester-results/student/:studentId
   * Query params: include_unpublished (boolean)
   */
  getStudentAllResults: async (req, res) => {
    try {
      const { studentId } = req.params;
      const { include_unpublished } = req.query;

      if (!studentId) {
        return res.status(400).json({
          success: false,
          message: 'Student ID is required'
        });
      }

      const resultModel = new SemesterResult();
      const results = await resultModel.getStudentAllResults(
        parseInt(studentId),
        {
          includeUnpublished: include_unpublished === 'true'
        }
      );

      return res.status(200).json({
        success: true,
        message: 'Student results retrieved successfully',
        data: results
      });
    } catch (error) {
      console.error('Error in getStudentAllResults:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve student results',
        error: error.message
      });
    }
  },

  /**
   * Get semester results summary
   * @route GET /api/semester-results/semester/:semesterId/summary
   */
  getSemesterSummary: async (req, res) => {
    try {
      const { semesterId } = req.params;

      if (!semesterId) {
        return res.status(400).json({
          success: false,
          message: 'Semester ID is required'
        });
      }

      const resultModel = new SemesterResult();
      const summary = await resultModel.getSemesterSummary(parseInt(semesterId));

      return res.status(200).json({
        success: true,
        message: 'Semester summary retrieved successfully',
        data: summary
      });
    } catch (error) {
      console.error('Error in getSemesterSummary:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve semester summary',
        error: error.message
      });
    }
  },

  /**
   * Get all semester results (admin view)
   * @route GET /api/semester-results
   * Query params: semester_id, is_published
   */
  getAllResults: async (req, res) => {
    try {
      const { semester_id, is_published } = req.query;

      const resultModel = new SemesterResult();
      let results;

      if (semester_id) {
        // Get results for specific semester
        const whereConditions = { semester_id: parseInt(semester_id) };
        if (is_published !== undefined) {
          whereConditions.is_published = is_published === 'true' ? 1 : 0;
        }
        results = await resultModel.findWhere(whereConditions);
      } else {
        // Get all results
        results = await resultModel.findAll({
          orderBy: 'updated_at',
          order: 'DESC'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Semester results retrieved successfully',
        data: results
      });
    } catch (error) {
      console.error('Error in getAllResults:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve semester results',
        error: error.message
      });
    }
  },

  /**
   * Get semester result by ID
   * @route GET /api/semester-results/:id
   */
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Result ID is required'
        });
      }

      const resultModel = new SemesterResult();
      const result = await resultModel.findById(parseInt(id));

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Semester result not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Semester result retrieved successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in getById:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve semester result',
        error: error.message
      });
    }
  },

  /**
   * Delete semester result
   * @route DELETE /api/semester-results/:id
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

      const resultModel = new SemesterResult();
      const result = await resultModel.findById(parseInt(id));

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Semester result not found'
        });
      }

      await resultModel.delete(parseInt(id));

      return res.status(200).json({
        success: true,
        message: 'Semester result deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteResult:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete semester result',
        error: error.message
      });
    }
  }
};

module.exports = SemesterResultController;
