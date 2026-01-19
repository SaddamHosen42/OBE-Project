const Survey = require('../models/Survey');
const SurveyQuestion = require('../models/SurveyQuestion');
const SurveyResponse = require('../models/SurveyResponse');
const SurveyAnswer = require('../models/SurveyAnswer');

/**
 * Survey Controller
 * Handles survey management and response collection operations
 */
const SurveyController = {
  /**
   * List all surveys with pagination and filtering
   * @route GET /api/surveys
   */
  index: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        type,
        target_audience,
        is_active,
        orderBy = 'created_at',
        order = 'DESC'
      } = req.query;

      const surveyModel = new Survey();
      const offset = (page - 1) * limit;

      // Build where conditions
      const conditions = {};
      if (type) conditions.type = type;
      if (target_audience) conditions.target_audience = target_audience;
      if (is_active !== undefined) conditions.is_active = is_active;

      const surveys = await surveyModel.findAll({
        where: conditions,
        limit: parseInt(limit),
        offset: parseInt(offset),
        orderBy,
        order: order.toUpperCase()
      });

      // Get total count for pagination
      const totalCount = await surveyModel.count({ where: conditions });

      res.status(200).json({
        success: true,
        data: surveys,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      console.error('Error in SurveyController.index:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch surveys',
        error: error.message
      });
    }
  },

  /**
   * Get active surveys
   * @route GET /api/surveys/active
   */
  getActive: async (req, res) => {
    try {
      const surveyModel = new Survey();
      const surveys = await surveyModel.getActive();

      res.status(200).json({
        success: true,
        data: surveys
      });
    } catch (error) {
      console.error('Error in SurveyController.getActive:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch active surveys',
        error: error.message
      });
    }
  },

  /**
   * Get a single survey by ID
   * @route GET /api/surveys/:id
   */
  show: async (req, res) => {
    try {
      const { id } = req.params;
      const { includeQuestions = 'true', includeStats = 'false' } = req.query;

      const surveyModel = new Survey();

      let survey;
      if (includeQuestions === 'true') {
        survey = await surveyModel.getWithQuestions(parseInt(id));
      } else if (includeStats === 'true') {
        survey = await surveyModel.getWithStats(parseInt(id));
      } else {
        survey = await surveyModel.findById(parseInt(id));
      }

      if (!survey) {
        return res.status(404).json({
          success: false,
          message: 'Survey not found'
        });
      }

      res.status(200).json({
        success: true,
        data: survey
      });
    } catch (error) {
      console.error('Error in SurveyController.show:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch survey',
        error: error.message
      });
    }
  },

  /**
   * Create a new survey
   * @route POST /api/surveys
   */
  create: async (req, res) => {
    try {
      const surveyData = req.body;
      
      // Add creator information from authenticated user
      if (req.user) {
        surveyData.created_by = req.user.id;
      }

      const surveyModel = new Survey();
      const survey = await surveyModel.createSurvey(surveyData);

      res.status(201).json({
        success: true,
        message: 'Survey created successfully',
        data: survey
      });
    } catch (error) {
      console.error('Error in SurveyController.create:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create survey',
        error: error.message
      });
    }
  },

  /**
   * Update a survey
   * @route PUT /api/surveys/:id
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const surveyModel = new Survey();
      
      // Check if survey exists
      const existingSurvey = await surveyModel.findById(parseInt(id));
      if (!existingSurvey) {
        return res.status(404).json({
          success: false,
          message: 'Survey not found'
        });
      }

      await surveyModel.update(parseInt(id), updates);
      const updatedSurvey = await surveyModel.findById(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Survey updated successfully',
        data: updatedSurvey
      });
    } catch (error) {
      console.error('Error in SurveyController.update:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update survey',
        error: error.message
      });
    }
  },

  /**
   * Delete a survey
   * @route DELETE /api/surveys/:id
   */
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const surveyModel = new Survey();
      
      // Check if survey exists
      const survey = await surveyModel.findById(parseInt(id));
      if (!survey) {
        return res.status(404).json({
          success: false,
          message: 'Survey not found'
        });
      }

      await surveyModel.delete(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Survey deleted successfully'
      });
    } catch (error) {
      console.error('Error in SurveyController.delete:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete survey',
        error: error.message
      });
    }
  },

  /**
   * Add a question to a survey
   * @route POST /api/surveys/:id/questions
   */
  addQuestion: async (req, res) => {
    try {
      const { id } = req.params;
      const questionData = {
        ...req.body,
        survey_id: parseInt(id)
      };

      const surveyModel = new Survey();
      const questionModel = new SurveyQuestion();

      // Check if survey exists
      const survey = await surveyModel.findById(parseInt(id));
      if (!survey) {
        return res.status(404).json({
          success: false,
          message: 'Survey not found'
        });
      }

      const question = await questionModel.createQuestion(questionData);

      res.status(201).json({
        success: true,
        message: 'Question added successfully',
        data: question
      });
    } catch (error) {
      console.error('Error in SurveyController.addQuestion:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add question',
        error: error.message
      });
    }
  },

  /**
   * Submit a survey response
   * @route POST /api/surveys/:id/responses
   */
  submitResponse: async (req, res) => {
    try {
      const { id } = req.params;
      const responseData = {
        ...req.body,
        survey_id: parseInt(id)
      };

      // Add respondent information from authenticated user if available
      if (req.user && !responseData.is_anonymous) {
        responseData.respondent_id = req.user.id;
        responseData.respondent_type = req.user.role; // Assuming role indicates type
      }

      const surveyModel = new Survey();
      const responseModel = new SurveyResponse();

      // Check if survey exists and is active
      const survey = await surveyModel.findById(parseInt(id));
      if (!survey) {
        return res.status(404).json({
          success: false,
          message: 'Survey not found'
        });
      }

      if (!survey.is_active) {
        return res.status(400).json({
          success: false,
          message: 'Survey is not active'
        });
      }

      // Check if user has already responded (if not anonymous)
      if (!responseData.is_anonymous && responseData.respondent_id) {
        const hasResponded = await surveyModel.hasUserResponded(
          parseInt(id),
          responseData.respondent_id
        );

        if (hasResponded) {
          return res.status(400).json({
            success: false,
            message: 'You have already responded to this survey'
          });
        }
      }

      const response = await responseModel.submitResponse(responseData);

      res.status(201).json({
        success: true,
        message: 'Response submitted successfully',
        data: response
      });
    } catch (error) {
      console.error('Error in SurveyController.submitResponse:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit response',
        error: error.message
      });
    }
  },

  /**
   * Get all responses for a survey
   * @route GET /api/surveys/:id/responses
   */
  getResponses: async (req, res) => {
    try {
      const { id } = req.params;
      const { includeAnswers = 'false', completed_only = 'false' } = req.query;

      const responseModel = new SurveyResponse();

      const responses = await responseModel.getBySurvey(parseInt(id), {
        includeAnswers: includeAnswers === 'true',
        completed_only: completed_only === 'true'
      });

      // Get response statistics
      const stats = await responseModel.getResponseStats(parseInt(id));

      res.status(200).json({
        success: true,
        data: responses,
        statistics: stats
      });
    } catch (error) {
      console.error('Error in SurveyController.getResponses:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch responses',
        error: error.message
      });
    }
  },

  /**
   * Get analytics for a survey
   * @route GET /api/surveys/:id/analytics
   */
  getAnalytics: async (req, res) => {
    try {
      const { id } = req.params;

      const surveyModel = new Survey();
      const questionModel = new SurveyQuestion();
      const answerModel = new SurveyAnswer();
      const responseModel = new SurveyResponse();

      // Get survey with questions
      const survey = await surveyModel.getWithQuestions(parseInt(id));
      if (!survey) {
        return res.status(404).json({
          success: false,
          message: 'Survey not found'
        });
      }

      // Get response statistics
      const responseStats = await responseModel.getResponseStats(parseInt(id));

      // Get analytics for each question
      const questionAnalytics = [];
      for (const question of survey.questions) {
        const analytics = await answerModel.getQuestionAnalytics(
          question.id,
          question.question_type
        );
        questionAnalytics.push({
          question_id: question.id,
          question_text: question.question_text,
          question_type: question.question_type,
          ...analytics
        });
      }

      res.status(200).json({
        success: true,
        data: {
          survey: {
            id: survey.id,
            title: survey.title,
            type: survey.type,
            target_audience: survey.target_audience
          },
          response_statistics: responseStats,
          question_analytics: questionAnalytics
        }
      });
    } catch (error) {
      console.error('Error in SurveyController.getAnalytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch analytics',
        error: error.message
      });
    }
  },

  /**
   * Get surveys by type
   * @route GET /api/surveys/type/:type
   */
  getByType: async (req, res) => {
    try {
      const { type } = req.params;

      const surveyModel = new Survey();
      const surveys = await surveyModel.getByType(type);

      res.status(200).json({
        success: true,
        data: surveys
      });
    } catch (error) {
      console.error('Error in SurveyController.getByType:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch surveys by type',
        error: error.message
      });
    }
  },

  /**
   * Get user's survey responses
   * @route GET /api/surveys/my-responses
   */
  getMyResponses: async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const responseModel = new SurveyResponse();
      const responses = await responseModel.getByRespondent(
        req.user.id,
        req.user.role
      );

      res.status(200).json({
        success: true,
        data: responses
      });
    } catch (error) {
      console.error('Error in SurveyController.getMyResponses:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch your responses',
        error: error.message
      });
    }
  }
};

module.exports = SurveyController;
