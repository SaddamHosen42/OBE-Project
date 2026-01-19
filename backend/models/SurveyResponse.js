const BaseModel = require('./BaseModel');

/**
 * SurveyResponse Model for managing survey responses
 * Handles response submission and tracking
 */
class SurveyResponse extends BaseModel {
  constructor() {
    super('survey_responses');
  }

  /**
   * Submit a complete survey response
   * @param {Object} responseData - Response data including answers
   * @returns {Promise<Object>} Created response with answers
   */
  async submitResponse(responseData) {
    const connection = await this.db.getConnection();
    
    try {
      await connection.beginTransaction();

      const {
        survey_id,
        respondent_id,
        respondent_type,
        is_anonymous = 0,
        is_completed = 1,
        answers = []
      } = responseData;

      // Create the main response record
      const responseQuery = `
        INSERT INTO ${this.tableName}
        (survey_id, respondent_id, respondent_type, is_anonymous, is_completed, submitted_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;

      const [result] = await connection.query(responseQuery, [
        survey_id,
        is_anonymous ? null : respondent_id,
        respondent_type,
        is_anonymous,
        is_completed
      ]);

      const responseId = result.insertId;

      // Insert all answers
      if (answers && answers.length > 0) {
        const answerQuery = `
          INSERT INTO survey_answers
          (response_id, question_id, answer_text, answer_value)
          VALUES (?, ?, ?, ?)
        `;

        for (const answer of answers) {
          await connection.query(answerQuery, [
            responseId,
            answer.question_id,
            answer.answer_text || null,
            answer.answer_value || null
          ]);
        }
      }

      await connection.commit();

      // Fetch and return the complete response
      const completeResponse = await this.getResponseWithAnswers(responseId);
      return completeResponse;

    } catch (error) {
      await connection.rollback();
      console.error('Error in submitResponse:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get response with all answers
   * @param {number} responseId - Response ID
   * @returns {Promise<Object>} Response with answers
   */
  async getResponseWithAnswers(responseId) {
    try {
      // Get response details
      const response = await this.findById(responseId);
      if (!response) {
        throw new Error('Response not found');
      }

      // Get all answers for this response
      const answersQuery = `
        SELECT 
          sa.id,
          sa.response_id,
          sa.question_id,
          sa.answer_text,
          sa.answer_value,
          sq.question_text,
          sq.question_type
        FROM survey_answers sa
        INNER JOIN survey_questions sq ON sa.question_id = sq.id
        WHERE sa.response_id = ?
        ORDER BY sq.order_number ASC
      `;

      const [answers] = await this.db.query(answersQuery, [responseId]);

      return {
        ...response,
        answers
      };
    } catch (error) {
      console.error('Error in getResponseWithAnswers:', error);
      throw error;
    }
  }

  /**
   * Get all responses for a survey
   * @param {number} surveyId - Survey ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of responses
   */
  async getBySurvey(surveyId, options = {}) {
    try {
      const {
        includeAnswers = false,
        completed_only = false
      } = options;

      let query = `
        SELECT 
          sr.id,
          sr.survey_id,
          sr.respondent_id,
          sr.respondent_type,
          sr.is_anonymous,
          sr.is_completed,
          sr.submitted_at,
          sr.created_at
        FROM ${this.tableName} sr
        WHERE sr.survey_id = ?
      `;

      const params = [surveyId];

      if (completed_only) {
        query += ` AND sr.is_completed = 1`;
      }

      query += ` ORDER BY sr.submitted_at DESC`;

      const [responses] = await this.db.query(query, params);

      // Optionally include answers for each response
      if (includeAnswers) {
        for (const response of responses) {
          const answersQuery = `
            SELECT 
              sa.id,
              sa.question_id,
              sa.answer_text,
              sa.answer_value,
              sq.question_text,
              sq.question_type
            FROM survey_answers sa
            INNER JOIN survey_questions sq ON sa.question_id = sq.id
            WHERE sa.response_id = ?
            ORDER BY sq.order_number ASC
          `;

          const [answers] = await this.db.query(answersQuery, [response.id]);
          response.answers = answers;
        }
      }

      return responses;
    } catch (error) {
      console.error('Error in getBySurvey:', error);
      throw error;
    }
  }

  /**
   * Get responses by respondent
   * @param {number} respondentId - Respondent ID
   * @param {string} respondentType - Respondent type (student, faculty, etc.)
   * @returns {Promise<Array>} Array of responses by the respondent
   */
  async getByRespondent(respondentId, respondentType) {
    try {
      const query = `
        SELECT 
          sr.*,
          s.title as survey_title,
          s.type as survey_type
        FROM ${this.tableName} sr
        INNER JOIN surveys s ON sr.survey_id = s.id
        WHERE sr.respondent_id = ? AND sr.respondent_type = ?
        ORDER BY sr.submitted_at DESC
      `;

      const [responses] = await this.db.query(query, [respondentId, respondentType]);
      return responses;
    } catch (error) {
      console.error('Error in getByRespondent:', error);
      throw error;
    }
  }

  /**
   * Check if respondent has submitted response for a survey
   * @param {number} surveyId - Survey ID
   * @param {number} respondentId - Respondent ID
   * @returns {Promise<boolean>} True if response exists
   */
  async hasResponded(surveyId, respondentId) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM ${this.tableName}
        WHERE survey_id = ? AND respondent_id = ?
      `;

      const [result] = await this.db.query(query, [surveyId, respondentId]);
      return result[0].count > 0;
    } catch (error) {
      console.error('Error in hasResponded:', error);
      throw error;
    }
  }

  /**
   * Get response count for a survey
   * @param {number} surveyId - Survey ID
   * @returns {Promise<Object>} Response statistics
   */
  async getResponseStats(surveyId) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_responses,
          COUNT(DISTINCT respondent_id) as unique_respondents,
          SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed_responses,
          SUM(CASE WHEN is_anonymous = 1 THEN 1 ELSE 0 END) as anonymous_responses
        FROM ${this.tableName}
        WHERE survey_id = ?
      `;

      const [result] = await this.db.query(query, [surveyId]);
      return result[0];
    } catch (error) {
      console.error('Error in getResponseStats:', error);
      throw error;
    }
  }

  /**
   * Update response completion status
   * @param {number} responseId - Response ID
   * @param {boolean} isCompleted - Completion status
   * @returns {Promise<boolean>} Success status
   */
  async updateCompletion(responseId, isCompleted) {
    try {
      const query = `
        UPDATE ${this.tableName}
        SET is_completed = ?, submitted_at = NOW()
        WHERE id = ?
      `;

      await this.db.query(query, [isCompleted ? 1 : 0, responseId]);
      return true;
    } catch (error) {
      console.error('Error in updateCompletion:', error);
      throw error;
    }
  }
}

module.exports = SurveyResponse;
