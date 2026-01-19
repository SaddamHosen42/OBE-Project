const Question = require('../models/Question');

/**
 * Question Controller
 * Handles question operations for assessments
 */
const QuestionController = {
  /**
   * Get all questions with optional filtering
   * @route GET /api/questions
   * Query params:
   *   - assessmentComponentId: Filter by assessment component
   *   - courseOfferingId: Filter by course offering
   *   - difficultyLevel: Filter by difficulty level
   *   - questionType: Filter by question type
   *   - includeCLOMapping: Include CLO mapping (true/false)
   */
  index: async (req, res) => {
    try {
      const { 
        assessmentComponentId, 
        courseOfferingId,
        difficultyLevel,
        questionType,
        includeCLOMapping = 'false'
      } = req.query;

      const questionModel = new Question();
      let questions;

      if (assessmentComponentId) {
        // Get questions for specific assessment
        questions = await questionModel.getByAssessment(
          assessmentComponentId,
          {
            includeBloomLevel: true,
            includeCLOMapping: includeCLOMapping === 'true'
          }
        );
      } else if (courseOfferingId) {
        // Get questions for course offering
        questions = await questionModel.getByCourseOffering(courseOfferingId);
      } else if (difficultyLevel) {
        // Get questions by difficulty level
        questions = await questionModel.getByDifficultyLevel(
          difficultyLevel,
          assessmentComponentId || null
        );
      } else {
        // Get all questions with basic filters
        let conditions = {};
        if (questionType) {
          conditions.question_type = questionType;
        }

        questions = await questionModel.findWhere(conditions, {
          orderBy: 'created_at',
          order: 'DESC'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Questions retrieved successfully',
        data: questions
      });
    } catch (error) {
      console.error('Error in index:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve questions',
        error: error.message
      });
    }
  },

  /**
   * Get a specific question by ID with full details
   * @route GET /api/questions/:id
   */
  show: async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        includeCLOMapping = 'true',
        includeBloomLevel = 'true',
        includeAssessment = 'true'
      } = req.query;

      const questionModel = new Question();
      const question = await questionModel.getByIdWithDetails(id, {
        includeCLOMapping: includeCLOMapping === 'true',
        includeBloomLevel: includeBloomLevel === 'true',
        includeAssessment: includeAssessment === 'true'
      });

      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Question retrieved successfully',
        data: question
      });
    } catch (error) {
      console.error('Error in show:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve question',
        error: error.message
      });
    }
  },

  /**
   * Create a new question
   * @route POST /api/questions
   * Body: {
   *   assessment_component_id: number,
   *   question_number: string,
   *   question_text: string,
   *   question_type: string,
   *   marks: number,
   *   difficulty_level?: string,
   *   bloom_taxonomy_level_id?: number
   * }
   */
  store: async (req, res) => {
    try {
      const {
        assessment_component_id,
        question_number,
        question_text,
        question_type,
        marks,
        difficulty_level,
        bloom_taxonomy_level_id
      } = req.body;

      // Validate required fields
      if (!assessment_component_id || !question_number || !question_text || !question_type || marks === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: assessment_component_id, question_number, question_text, question_type, and marks are required'
        });
      }

      // Validate marks
      if (marks < 0) {
        return res.status(400).json({
          success: false,
          message: 'Marks must be a non-negative number'
        });
      }

      const questionModel = new Question();
      const newQuestion = await questionModel.create({
        assessment_component_id,
        question_number,
        question_text,
        question_type,
        marks,
        difficulty_level,
        bloom_taxonomy_level_id
      });

      return res.status(201).json({
        success: true,
        message: 'Question created successfully',
        data: newQuestion
      });
    } catch (error) {
      console.error('Error in store:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create question',
        error: error.message
      });
    }
  },

  /**
   * Update a question
   * @route PUT /api/questions/:id
   * Body: {
   *   question_number?: string,
   *   question_text?: string,
   *   question_type?: string,
   *   marks?: number,
   *   difficulty_level?: string,
   *   bloom_taxonomy_level_id?: number
   * }
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Validate marks if provided
      if (updateData.marks !== undefined && updateData.marks < 0) {
        return res.status(400).json({
          success: false,
          message: 'Marks must be a non-negative number'
        });
      }

      const questionModel = new Question();
      const updated = await questionModel.updateQuestion(id, updateData);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Question not found or no changes made'
        });
      }

      // Fetch updated question
      const updatedQuestion = await questionModel.getByIdWithDetails(id);

      return res.status(200).json({
        success: true,
        message: 'Question updated successfully',
        data: updatedQuestion
      });
    } catch (error) {
      console.error('Error in update:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update question',
        error: error.message
      });
    }
  },

  /**
   * Delete a question
   * @route DELETE /api/questions/:id
   */
  destroy: async (req, res) => {
    try {
      const { id } = req.params;

      const questionModel = new Question();
      const deleted = await questionModel.deleteQuestion(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Question not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Question deleted successfully'
      });
    } catch (error) {
      console.error('Error in destroy:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete question',
        error: error.message
      });
    }
  },

  /**
   * Map a question to CLO(s)
   * @route POST /api/questions/:id/map-clo
   * Body: {
   *   clo_mappings: [
   *     {
   *       course_learning_outcome_id: number,
   *       marks_allocated: number
   *     }
   *   ]
   * }
   */
  mapToCLO: async (req, res) => {
    try {
      const { id } = req.params;
      const { clo_mappings } = req.body;

      // Validate input
      if (!clo_mappings || !Array.isArray(clo_mappings) || clo_mappings.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'clo_mappings must be a non-empty array'
        });
      }

      // Validate each mapping
      for (const mapping of clo_mappings) {
        if (!mapping.course_learning_outcome_id || mapping.marks_allocated === undefined) {
          return res.status(400).json({
            success: false,
            message: 'Each mapping must have course_learning_outcome_id and marks_allocated'
          });
        }
        if (mapping.marks_allocated < 0) {
          return res.status(400).json({
            success: false,
            message: 'marks_allocated must be a non-negative number'
          });
        }
      }

      const questionModel = new Question();
      const result = await questionModel.mapToCLO(id, clo_mappings);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.mappings
      });
    } catch (error) {
      console.error('Error in mapToCLO:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to map question to CLO',
        error: error.message
      });
    }
  },

  /**
   * Get CLO mappings for a question
   * @route GET /api/questions/:id/clo-mappings
   */
  getCLOMappings: async (req, res) => {
    try {
      const { id } = req.params;

      const questionModel = new Question();
      
      // First check if question exists
      const question = await questionModel.findById(id);
      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found'
        });
      }

      const mappings = await questionModel.getCLOMapping(id);

      return res.status(200).json({
        success: true,
        message: 'CLO mappings retrieved successfully',
        data: {
          question_id: id,
          question_number: question.question_number,
          marks: question.marks,
          mappings: mappings
        }
      });
    } catch (error) {
      console.error('Error in getCLOMappings:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve CLO mappings',
        error: error.message
      });
    }
  },

  /**
   * Get statistics for questions in an assessment
   * @route GET /api/questions/statistics/:assessmentComponentId
   */
  getStatistics: async (req, res) => {
    try {
      const { assessmentComponentId } = req.params;

      const questionModel = new Question();
      const statistics = await questionModel.getStatistics(assessmentComponentId);

      return res.status(200).json({
        success: true,
        message: 'Question statistics retrieved successfully',
        data: statistics
      });
    } catch (error) {
      console.error('Error in getStatistics:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve question statistics',
        error: error.message
      });
    }
  },

  /**
   * Get questions by assessment component
   * @route GET /api/questions/assessment/:assessmentComponentId
   */
  getByAssessment: async (req, res) => {
    try {
      const { assessmentComponentId } = req.params;
      const { includeCLOMapping = 'true' } = req.query;

      const questionModel = new Question();
      const questions = await questionModel.getByAssessment(
        assessmentComponentId,
        {
          includeBloomLevel: true,
          includeCLOMapping: includeCLOMapping === 'true'
        }
      );

      return res.status(200).json({
        success: true,
        message: 'Questions retrieved successfully',
        data: questions
      });
    } catch (error) {
      console.error('Error in getByAssessment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve questions',
        error: error.message
      });
    }
  }
};

module.exports = QuestionController;
