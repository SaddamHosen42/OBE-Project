const StudentRubricScore = require('../models/StudentRubricScore');

/**
 * Rubric Score Controller
 * Handles rubric-based scoring for students
 */
const RubricScoreController = {
  /**
   * Enter score for a student's rubric criterion
   * @route POST /api/rubric-scores
   * Body: {
   *   student_id: number,
   *   assessment_component_id: number,
   *   rubric_criteria_id: number,
   *   rubric_level_id: number,
   *   score: number,
   *   feedback: string
   * }
   */
  enterScore: async (req, res) => {
    try {
      const {
        student_id,
        assessment_component_id,
        rubric_criteria_id,
        rubric_level_id,
        score,
        feedback
      } = req.body;

      // Validate required fields
      if (!student_id || !assessment_component_id || !rubric_criteria_id || !rubric_level_id) {
        return res.status(400).json({
          success: false,
          message: 'Student ID, Assessment Component ID, Rubric Criteria ID, and Rubric Level ID are required'
        });
      }

      const scoreModel = new StudentRubricScore();
      const result = await scoreModel.enterScore({
        student_id,
        assessment_component_id,
        rubric_criteria_id,
        rubric_level_id,
        score,
        feedback
      });

      return res.status(200).json({
        success: true,
        message: 'Rubric score entered successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in enterScore:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to enter rubric score',
        error: error.message
      });
    }
  },

  /**
   * Bulk enter scores for multiple criteria
   * @route POST /api/rubric-scores/bulk
   * Body: {
   *   scores: Array<ScoreData>
   * }
   */
  bulkEnterScores: async (req, res) => {
    try {
      const { scores } = req.body;

      if (!Array.isArray(scores) || scores.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Scores array is required and must not be empty'
        });
      }

      const scoreModel = new StudentRubricScore();
      const results = await scoreModel.bulkEnterScores(scores);

      return res.status(200).json({
        success: true,
        message: `Bulk scoring completed: ${results.success} succeeded, ${results.failed} failed`,
        data: results
      });
    } catch (error) {
      console.error('Error in bulkEnterScores:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to bulk enter rubric scores',
        error: error.message
      });
    }
  },

  /**
   * Get rubric scores for a student
   * @route GET /api/rubric-scores/student/:studentId
   * Query params: assessment_component_id, rubric_criteria_id
   */
  getScoresByStudent: async (req, res) => {
    try {
      const { studentId } = req.params;
      const { assessment_component_id, rubric_criteria_id } = req.query;

      if (!studentId) {
        return res.status(400).json({
          success: false,
          message: 'Student ID is required'
        });
      }

      const scoreModel = new StudentRubricScore();
      const scores = await scoreModel.getByStudent(parseInt(studentId), {
        assessment_component_id: assessment_component_id ? parseInt(assessment_component_id) : null,
        rubric_criteria_id: rubric_criteria_id ? parseInt(rubric_criteria_id) : null
      });

      return res.status(200).json({
        success: true,
        message: 'Student rubric scores retrieved successfully',
        data: scores
      });
    } catch (error) {
      console.error('Error in getScoresByStudent:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve student rubric scores',
        error: error.message
      });
    }
  },

  /**
   * Get rubric scores for an assessment component
   * @route GET /api/rubric-scores/assessment/:assessmentComponentId
   * Query params: student_id, rubric_criteria_id
   */
  getScoresByAssessment: async (req, res) => {
    try {
      const { assessmentComponentId } = req.params;
      const { student_id, rubric_criteria_id } = req.query;

      if (!assessmentComponentId) {
        return res.status(400).json({
          success: false,
          message: 'Assessment Component ID is required'
        });
      }

      const scoreModel = new StudentRubricScore();
      const scores = await scoreModel.getByAssessment(parseInt(assessmentComponentId), {
        student_id: student_id ? parseInt(student_id) : null,
        rubric_criteria_id: rubric_criteria_id ? parseInt(rubric_criteria_id) : null
      });

      return res.status(200).json({
        success: true,
        message: 'Assessment rubric scores retrieved successfully',
        data: scores
      });
    } catch (error) {
      console.error('Error in getScoresByAssessment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve assessment rubric scores',
        error: error.message
      });
    }
  },

  /**
   * Calculate total rubric score for a student
   * @route GET /api/rubric-scores/calculate/:studentId/:assessmentComponentId
   */
  calculateTotalScore: async (req, res) => {
    try {
      const { studentId, assessmentComponentId } = req.params;

      if (!studentId || !assessmentComponentId) {
        return res.status(400).json({
          success: false,
          message: 'Student ID and Assessment Component ID are required'
        });
      }

      const scoreModel = new StudentRubricScore();
      const total = await scoreModel.calculateTotalScore(
        parseInt(studentId),
        parseInt(assessmentComponentId)
      );

      return res.status(200).json({
        success: true,
        message: 'Total rubric score calculated successfully',
        data: total
      });
    } catch (error) {
      console.error('Error in calculateTotalScore:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to calculate total rubric score',
        error: error.message
      });
    }
  },

  /**
   * Get rubric scores summary for an assessment
   * @route GET /api/rubric-scores/assessment/:assessmentComponentId/summary
   */
  getAssessmentSummary: async (req, res) => {
    try {
      const { assessmentComponentId } = req.params;

      if (!assessmentComponentId) {
        return res.status(400).json({
          success: false,
          message: 'Assessment Component ID is required'
        });
      }

      const scoreModel = new StudentRubricScore();
      const summary = await scoreModel.getAssessmentSummary(parseInt(assessmentComponentId));

      return res.status(200).json({
        success: true,
        message: 'Assessment summary retrieved successfully',
        data: summary
      });
    } catch (error) {
      console.error('Error in getAssessmentSummary:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve assessment summary',
        error: error.message
      });
    }
  },

  /**
   * Delete a rubric score
   * @route DELETE /api/rubric-scores/:scoreId
   */
  deleteScore: async (req, res) => {
    try {
      const { scoreId } = req.params;

      if (!scoreId) {
        return res.status(400).json({
          success: false,
          message: 'Score ID is required'
        });
      }

      const scoreModel = new StudentRubricScore();
      await scoreModel.deleteScore(parseInt(scoreId));

      return res.status(200).json({
        success: true,
        message: 'Rubric score deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteScore:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete rubric score',
        error: error.message
      });
    }
  },

  /**
   * Delete all scores for a student in an assessment
   * @route DELETE /api/rubric-scores/student/:studentId/assessment/:assessmentComponentId
   */
  deleteStudentScores: async (req, res) => {
    try {
      const { studentId, assessmentComponentId } = req.params;

      if (!studentId || !assessmentComponentId) {
        return res.status(400).json({
          success: false,
          message: 'Student ID and Assessment Component ID are required'
        });
      }

      const scoreModel = new StudentRubricScore();
      const deletedCount = await scoreModel.deleteStudentScores(
        parseInt(studentId),
        parseInt(assessmentComponentId)
      );

      return res.status(200).json({
        success: true,
        message: `${deletedCount} rubric score(s) deleted successfully`,
        data: { deletedCount }
      });
    } catch (error) {
      console.error('Error in deleteStudentScores:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete student rubric scores',
        error: error.message
      });
    }
  },

  /**
   * Get a single rubric score by ID
   * @route GET /api/rubric-scores/:scoreId
   */
  getScoreById: async (req, res) => {
    try {
      const { scoreId } = req.params;

      if (!scoreId) {
        return res.status(400).json({
          success: false,
          message: 'Score ID is required'
        });
      }

      const scoreModel = new StudentRubricScore();
      const score = await scoreModel.findById(parseInt(scoreId));

      if (!score) {
        return res.status(404).json({
          success: false,
          message: 'Rubric score not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Rubric score retrieved successfully',
        data: score
      });
    } catch (error) {
      console.error('Error in getScoreById:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve rubric score',
        error: error.message
      });
    }
  }
};

module.exports = RubricScoreController;
