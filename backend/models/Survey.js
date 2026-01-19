const BaseModel = require('./BaseModel');

/**
 * Survey Model for managing surveys
 * Handles survey CRUD operations and relationships with questions and responses
 */
class Survey extends BaseModel {
  constructor() {
    super('surveys');
  }

  /**
   * Get all active surveys
   * @returns {Promise<Array>} Array of active surveys
   */
  async getActive() {
    try {
      const query = `
        SELECT 
          id,
          title,
          description,
          type,
          target_audience,
          degree_id,
          semester_id,
          course_id,
          start_date,
          end_date,
          is_active,
          is_anonymous,
          created_by,
          created_at,
          updated_at
        FROM ${this.tableName}
        WHERE is_active = 1 
          AND start_date <= NOW() 
          AND (end_date IS NULL OR end_date >= NOW())
        ORDER BY created_at DESC
      `;

      const [surveys] = await this.db.query(query);
      return surveys;
    } catch (error) {
      console.error('Error in getActive:', error);
      throw error;
    }
  }

  /**
   * Get survey with all its questions
   * @param {number} surveyId - The survey ID
   * @returns {Promise<Object>} Survey object with questions
   */
  async getWithQuestions(surveyId) {
    try {
      // Get survey details
      const survey = await this.findById(surveyId);
      if (!survey) {
        throw new Error('Survey not found');
      }

      // Get all questions for this survey
      const questionsQuery = `
        SELECT 
          id,
          survey_id,
          question_text,
          question_type,
          is_required,
          options,
          order_number,
          created_at
        FROM survey_questions
        WHERE survey_id = ?
        ORDER BY order_number ASC
      `;

      const [questions] = await this.db.query(questionsQuery, [surveyId]);

      // Parse options for each question (stored as JSON)
      questions.forEach(question => {
        if (question.options) {
          try {
            question.options = JSON.parse(question.options);
          } catch (e) {
            question.options = [];
          }
        }
      });

      return {
        ...survey,
        questions
      };
    } catch (error) {
      console.error('Error in getWithQuestions:', error);
      throw error;
    }
  }

  /**
   * Get survey with response statistics
   * @param {number} surveyId - The survey ID
   * @returns {Promise<Object>} Survey with response count and completion rate
   */
  async getWithStats(surveyId) {
    try {
      const survey = await this.findById(surveyId);
      if (!survey) {
        throw new Error('Survey not found');
      }

      // Get response statistics
      const statsQuery = `
        SELECT 
          COUNT(DISTINCT respondent_id) as total_responses,
          COUNT(DISTINCT CASE WHEN is_completed = 1 THEN respondent_id END) as completed_responses
        FROM survey_responses
        WHERE survey_id = ?
      `;

      const [stats] = await this.db.query(statsQuery, [surveyId]);

      return {
        ...survey,
        total_responses: stats[0]?.total_responses || 0,
        completed_responses: stats[0]?.completed_responses || 0,
        completion_rate: stats[0]?.total_responses 
          ? ((stats[0].completed_responses / stats[0].total_responses) * 100).toFixed(2)
          : 0
      };
    } catch (error) {
      console.error('Error in getWithStats:', error);
      throw error;
    }
  }

  /**
   * Create a new survey
   * @param {Object} surveyData - Survey data
   * @returns {Promise<Object>} Created survey
   */
  async createSurvey(surveyData) {
    try {
      const {
        title,
        description,
        type,
        target_audience,
        degree_id,
        semester_id,
        course_id,
        start_date,
        end_date,
        is_active = 1,
        is_anonymous = 0,
        created_by
      } = surveyData;

      const result = await this.create({
        title,
        description,
        type,
        target_audience,
        degree_id: degree_id || null,
        semester_id: semester_id || null,
        course_id: course_id || null,
        start_date,
        end_date: end_date || null,
        is_active,
        is_anonymous,
        created_by
      });

      return result;
    } catch (error) {
      console.error('Error in createSurvey:', error);
      throw error;
    }
  }

  /**
   * Get surveys by type
   * @param {string} type - Survey type (course_evaluation, faculty_feedback, program_assessment)
   * @returns {Promise<Array>} Array of surveys of specified type
   */
  async getByType(type) {
    try {
      const query = `
        SELECT * FROM ${this.tableName}
        WHERE type = ?
        ORDER BY created_at DESC
      `;

      const [surveys] = await this.db.query(query, [type]);
      return surveys;
    } catch (error) {
      console.error('Error in getByType:', error);
      throw error;
    }
  }

  /**
   * Get surveys by target audience
   * @param {string} audience - Target audience (students, faculty, alumni)
   * @returns {Promise<Array>} Array of surveys for specified audience
   */
  async getByAudience(audience) {
    try {
      const query = `
        SELECT * FROM ${this.tableName}
        WHERE target_audience = ?
        ORDER BY created_at DESC
      `;

      const [surveys] = await this.db.query(query, [audience]);
      return surveys;
    } catch (error) {
      console.error('Error in getByAudience:', error);
      throw error;
    }
  }

  /**
   * Check if user has responded to survey
   * @param {number} surveyId - Survey ID
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} True if user has responded
   */
  async hasUserResponded(surveyId, userId) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM survey_responses
        WHERE survey_id = ? AND respondent_id = ?
      `;

      const [result] = await this.db.query(query, [surveyId, userId]);
      return result[0].count > 0;
    } catch (error) {
      console.error('Error in hasUserResponded:', error);
      throw error;
    }
  }
}

module.exports = Survey;
