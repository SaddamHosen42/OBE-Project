const StudentAssessmentMark = require('../models/StudentAssessmentMark');
const StudentQuestionMark = require('../models/StudentQuestionMark');

/**
 * Marks Controller
 * Handles marks entry and management for assessments and questions
 */
const MarksController = {
  /**
   * Enter marks for a student's assessment component
   * @route POST /api/marks/assessment
   * Body: {
   *   student_id: number,
   *   assessment_component_id: number,
   *   marks_obtained: number (nullable),
   *   is_absent: boolean,
   *   is_exempted: boolean,
   *   remarks: string
   * }
   */
  enterAssessmentMarks: async (req, res) => {
    try {
      const {
        student_id,
        assessment_component_id,
        marks_obtained,
        is_absent = false,
        is_exempted = false,
        remarks
      } = req.body;

      // Validate required fields
      if (!student_id || !assessment_component_id) {
        return res.status(400).json({
          success: false,
          message: 'Student ID and Assessment Component ID are required'
        });
      }

      // Get evaluator ID from authenticated user
      const evaluated_by = req.user.id;

      const markModel = new StudentAssessmentMark();
      const result = await markModel.enterMarks({
        student_id,
        assessment_component_id,
        marks_obtained,
        is_absent,
        is_exempted,
        remarks,
        evaluated_by
      });

      return res.status(200).json({
        success: true,
        message: 'Assessment marks entered successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in enterAssessmentMarks:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to enter assessment marks',
        error: error.message
      });
    }
  },

  /**
   * Enter marks for a student's question
   * @route POST /api/marks/question
   * Body: {
   *   student_id: number,
   *   question_id: number,
   *   marks_obtained: number,
   *   feedback: string
   * }
   */
  enterQuestionMarks: async (req, res) => {
    try {
      const {
        student_id,
        question_id,
        marks_obtained,
        feedback
      } = req.body;

      // Validate required fields
      if (!student_id || !question_id || marks_obtained === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Student ID, Question ID, and Marks Obtained are required'
        });
      }

      const markModel = new StudentQuestionMark();
      const result = await markModel.enterMarks({
        student_id,
        question_id,
        marks_obtained,
        feedback
      });

      return res.status(200).json({
        success: true,
        message: 'Question marks entered successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in enterQuestionMarks:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to enter question marks',
        error: error.message
      });
    }
  },

  /**
   * Bulk enter marks for multiple students
   * @route POST /api/marks/bulk
   * Body: {
   *   type: 'assessment' | 'question',
   *   marks: Array<{student_id, assessment_component_id | question_id, marks_obtained, ...}>
   * }
   */
  bulkEnterMarks: async (req, res) => {
    try {
      const { type, marks } = req.body;

      // Validate required fields
      if (!type || !marks || !Array.isArray(marks)) {
        return res.status(400).json({
          success: false,
          message: 'Type and marks array are required'
        });
      }

      let result;
      if (type === 'assessment') {
        const markModel = new StudentAssessmentMark();
        const evaluated_by = req.user.id;
        result = await markModel.bulkEnterMarks(marks, evaluated_by);
      } else if (type === 'question') {
        const markModel = new StudentQuestionMark();
        result = await markModel.bulkEnterMarks(marks);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid type. Must be "assessment" or "question"'
        });
      }

      return res.status(200).json({
        success: true,
        message: `Bulk marks entry completed. Success: ${result.success}, Failed: ${result.failed}`,
        data: result
      });
    } catch (error) {
      console.error('Error in bulkEnterMarks:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to bulk enter marks',
        error: error.message
      });
    }
  },

  /**
   * Get marks by assessment component
   * @route GET /api/marks/assessment/:assessmentComponentId
   * Query params:
   *   - includeStudentDetails: Include student details (default: true)
   *   - includeStatistics: Include statistics (default: false)
   */
  getMarksByAssessment: async (req, res) => {
    try {
      const { assessmentComponentId } = req.params;
      const { 
        includeStudentDetails = 'true',
        includeStatistics = 'false',
        type = 'assessment' // 'assessment' or 'question'
      } = req.query;

      if (type === 'question') {
        // Get question-level marks
        const questionMarkModel = new StudentQuestionMark();
        const marks = await questionMarkModel.getByAssessment(
          assessmentComponentId,
          { includeDetails: includeStudentDetails === 'true' }
        );

        let statistics = null;
        if (includeStatistics === 'true') {
          statistics = await questionMarkModel.getQuestionStatistics(assessmentComponentId);
        }

        return res.status(200).json({
          success: true,
          message: 'Question marks retrieved successfully',
          data: {
            marks,
            statistics
          }
        });
      } else {
        // Get assessment-level marks
        const markModel = new StudentAssessmentMark();
        const marks = await markModel.getByAssessment(
          assessmentComponentId,
          { includeStudentDetails: includeStudentDetails === 'true' }
        );

        let statistics = null;
        if (includeStatistics === 'true') {
          statistics = await markModel.getAssessmentStatistics(assessmentComponentId);
        }

        return res.status(200).json({
          success: true,
          message: 'Assessment marks retrieved successfully',
          data: {
            marks,
            statistics
          }
        });
      }
    } catch (error) {
      console.error('Error in getMarksByAssessment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve marks',
        error: error.message
      });
    }
  },

  /**
   * Get marks by student
   * @route GET /api/marks/student/:studentId
   * Query params:
   *   - courseOfferingId: Filter by course offering
   *   - assessmentComponentId: Filter by specific assessment
   *   - assessmentTypeId: Filter by assessment type
   *   - type: 'assessment' or 'question' (default: 'assessment')
   *   - includeDetails: Include related details (default: true)
   */
  getMarksByStudent: async (req, res) => {
    try {
      const { studentId } = req.params;
      const {
        courseOfferingId,
        assessmentComponentId,
        assessmentTypeId,
        type = 'assessment',
        includeDetails = 'true'
      } = req.query;

      if (type === 'question') {
        // Get question-level marks
        const questionMarkModel = new StudentQuestionMark();
        const marks = await questionMarkModel.getByStudent(
          studentId,
          {
            assessmentComponentId: assessmentComponentId ? parseInt(assessmentComponentId) : null,
            includeQuestionDetails: includeDetails === 'true'
          }
        );

        return res.status(200).json({
          success: true,
          message: 'Student question marks retrieved successfully',
          data: marks
        });
      } else {
        // Get assessment-level marks
        const markModel = new StudentAssessmentMark();
        const marks = await markModel.getByStudent(
          studentId,
          {
            courseOfferingId: courseOfferingId ? parseInt(courseOfferingId) : null,
            assessmentTypeId: assessmentTypeId ? parseInt(assessmentTypeId) : null,
            includeDetails: includeDetails === 'true'
          }
        );

        return res.status(200).json({
          success: true,
          message: 'Student assessment marks retrieved successfully',
          data: marks
        });
      }
    } catch (error) {
      console.error('Error in getMarksByStudent:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve student marks',
        error: error.message
      });
    }
  },

  /**
   * Get assessment statistics
   * @route GET /api/marks/statistics/assessment/:assessmentComponentId
   */
  getAssessmentStatistics: async (req, res) => {
    try {
      const { assessmentComponentId } = req.params;
      const markModel = new StudentAssessmentMark();
      const statistics = await markModel.getAssessmentStatistics(assessmentComponentId);

      return res.status(200).json({
        success: true,
        message: 'Assessment statistics retrieved successfully',
        data: statistics
      });
    } catch (error) {
      console.error('Error in getAssessmentStatistics:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve assessment statistics',
        error: error.message
      });
    }
  },

  /**
   * Get question statistics for an assessment
   * @route GET /api/marks/statistics/questions/:assessmentComponentId
   */
  getQuestionStatistics: async (req, res) => {
    try {
      const { assessmentComponentId } = req.params;
      const questionMarkModel = new StudentQuestionMark();
      const statistics = await questionMarkModel.getQuestionStatistics(assessmentComponentId);

      return res.status(200).json({
        success: true,
        message: 'Question statistics retrieved successfully',
        data: statistics
      });
    } catch (error) {
      console.error('Error in getQuestionStatistics:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve question statistics',
        error: error.message
      });
    }
  },

  /**
   * Get student's total marks for a course offering
   * @route GET /api/marks/student/:studentId/course/:courseOfferingId/total
   */
  getStudentCourseTotal: async (req, res) => {
    try {
      const { studentId, courseOfferingId } = req.params;
      const markModel = new StudentAssessmentMark();
      const total = await markModel.getStudentCourseTotal(studentId, courseOfferingId);

      return res.status(200).json({
        success: true,
        message: 'Student course total retrieved successfully',
        data: total
      });
    } catch (error) {
      console.error('Error in getStudentCourseTotal:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve student course total',
        error: error.message
      });
    }
  },

  /**
   * Calculate student total from question-level marks
   * @route GET /api/marks/student/:studentId/assessment/:assessmentComponentId/calculate
   */
  calculateStudentTotal: async (req, res) => {
    try {
      const { studentId, assessmentComponentId } = req.params;
      const questionMarkModel = new StudentQuestionMark();
      const calculation = await questionMarkModel.calculateStudentTotal(
        studentId,
        assessmentComponentId
      );

      return res.status(200).json({
        success: true,
        message: 'Student total calculated successfully',
        data: calculation
      });
    } catch (error) {
      console.error('Error in calculateStudentTotal:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to calculate student total',
        error: error.message
      });
    }
  },

  /**
   * Get CLO-wise marks for a student in an assessment
   * @route GET /api/marks/student/:studentId/assessment/:assessmentComponentId/clo
   */
  getCLOWiseMarks: async (req, res) => {
    try {
      const { studentId, assessmentComponentId } = req.params;
      const questionMarkModel = new StudentQuestionMark();
      const cloMarks = await questionMarkModel.getCLOWiseMarks(
        studentId,
        assessmentComponentId
      );

      return res.status(200).json({
        success: true,
        message: 'CLO-wise marks retrieved successfully',
        data: cloMarks
      });
    } catch (error) {
      console.error('Error in getCLOWiseMarks:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve CLO-wise marks',
        error: error.message
      });
    }
  },

  /**
   * Get marks by question (all students)
   * @route GET /api/marks/question/:questionId
   * Query params:
   *   - includeStudentDetails: Include student details (default: true)
   */
  getMarksByQuestion: async (req, res) => {
    try {
      const { questionId } = req.params;
      const { includeStudentDetails = 'true' } = req.query;

      const questionMarkModel = new StudentQuestionMark();
      const marks = await questionMarkModel.getByQuestion(
        questionId,
        { includeStudentDetails: includeStudentDetails === 'true' }
      );

      return res.status(200).json({
        success: true,
        message: 'Question marks retrieved successfully',
        data: marks
      });
    } catch (error) {
      console.error('Error in getMarksByQuestion:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve question marks',
        error: error.message
      });
    }
  }
};

module.exports = MarksController;
