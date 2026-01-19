const BaseModel = require('./BaseModel');

/**
 * SurveyAnswer Model for managing individual survey answers
 * Handles answer CRUD operations and relationships with responses and questions
 */
class SurveyAnswer extends BaseModel {
  constructor() {
    super('survey_answers');
  }

  /**
   * Get all answers for a specific response
   * @param {number} responseId - The response ID
   * @returns {Promise<Array>} Array of answers for the response
   */
  async getByResponse(responseId) {
    try {
      const query = `
        SELECT 
          sa.id,
          sa.response_id,
          sa.question_id,
          sa.answer_text,
          sa.answer_value,
          sa.created_at,
          sq.question_text,
          sq.question_type,
          sq.options
        FROM ${this.tableName} sa
        INNER JOIN survey_questions sq ON sa.question_id = sq.id
        WHERE sa.response_id = ?
        ORDER BY sq.order_number ASC
      `;

      const [answers] = await this.db.query(query, [responseId]);

      // Parse options for each question
      answers.forEach(answer => {
        if (answer.options) {
          try {
            answer.options = JSON.parse(answer.options);
          } catch (e) {
            answer.options = [];
          }
        }
      });

      return answers;
    } catch (error) {
      console.error('Error in getByResponse:', error);
      throw error;
    }
  }

  /**
   * Get all answers for a specific question across all responses
   * @param {number} questionId - The question ID
   * @returns {Promise<Array>} Array of answers for the question
   */
  async getByQuestion(questionId) {
    try {
      const query = `
        SELECT 
          sa.id,
          sa.response_id,
          sa.question_id,
          sa.answer_text,
          sa.answer_value,
          sa.created_at,
          sr.respondent_id,
          sr.respondent_type,
          sr.is_anonymous
        FROM ${this.tableName} sa
        INNER JOIN survey_responses sr ON sa.response_id = sr.id
        WHERE sa.question_id = ?
        ORDER BY sa.created_at DESC
      `;

      const [answers] = await this.db.query(query, [questionId]);
      return answers;
    } catch (error) {
      console.error('Error in getByQuestion:', error);
      throw error;
    }
  }

  /**
   * Create a new answer
   * @param {Object} answerData - Answer data
   * @returns {Promise<Object>} Created answer
   */
  async createAnswer(answerData) {
    try {
      const {
        response_id,
        question_id,
        answer_text,
        answer_value
      } = answerData;

      const result = await this.create({
        response_id,
        question_id,
        answer_text: answer_text || null,
        answer_value: answer_value || null
      });

      return result;
    } catch (error) {
      console.error('Error in createAnswer:', error);
      throw error;
    }
  }

  /**
   * Bulk create answers for a response
   * @param {number} responseId - Response ID
   * @param {Array} answers - Array of answer objects
   * @returns {Promise<Array>} Array of created answers
   */
  async bulkCreate(responseId, answers) {
    try {
      const createdAnswers = [];

      for (const answer of answers) {
        const answerData = {
          ...answer,
          response_id: responseId
        };

        const created = await this.createAnswer(answerData);
        createdAnswers.push(created);
      }

      return createdAnswers;
    } catch (error) {
      console.error('Error in bulkCreate:', error);
      throw error;
    }
  }

  /**
   * Get answer analytics for a question
   * @param {number} questionId - Question ID
   * @param {string} questionType - Question type (multiple_choice, rating, etc.)
   * @returns {Promise<Object>} Analytics data
   */
  async getQuestionAnalytics(questionId, questionType) {
    try {
      let analytics = {
        question_id: questionId,
        total_responses: 0
      };

      // Get total responses
      const countQuery = `
        SELECT COUNT(*) as count
        FROM ${this.tableName}
        WHERE question_id = ?
      `;
      const [countResult] = await this.db.query(countQuery, [questionId]);
      analytics.total_responses = countResult[0].count;

      // Analytics based on question type
      switch (questionType) {
        case 'multiple_choice':
        case 'single_choice':
          // Count answers by option
          const choiceQuery = `
            SELECT answer_text, COUNT(*) as count
            FROM ${this.tableName}
            WHERE question_id = ?
            GROUP BY answer_text
            ORDER BY count DESC
          `;
          const [choices] = await this.db.query(choiceQuery, [questionId]);
          analytics.distribution = choices;
          break;

        case 'rating':
        case 'scale':
          // Calculate average and distribution
          const ratingQuery = `
            SELECT 
              AVG(answer_value) as average,
              MIN(answer_value) as min_rating,
              MAX(answer_value) as max_rating,
              answer_value,
              COUNT(*) as count
            FROM ${this.tableName}
            WHERE question_id = ? AND answer_value IS NOT NULL
            GROUP BY answer_value
            ORDER BY answer_value ASC
          `;
          const [ratings] = await this.db.query(ratingQuery, [questionId]);
          if (ratings.length > 0) {
            analytics.average = parseFloat(ratings[0].average).toFixed(2);
            analytics.min_rating = ratings[0].min_rating;
            analytics.max_rating = ratings[ratings.length - 1].max_rating;
            analytics.distribution = ratings;
          }
          break;

        case 'text':
        case 'long_text':
          // Get all text responses
          const textQuery = `
            SELECT answer_text, created_at
            FROM ${this.tableName}
            WHERE question_id = ? AND answer_text IS NOT NULL
            ORDER BY created_at DESC
          `;
          const [textAnswers] = await this.db.query(textQuery, [questionId]);
          analytics.responses = textAnswers;
          break;

        default:
          break;
      }

      return analytics;
    } catch (error) {
      console.error('Error in getQuestionAnalytics:', error);
      throw error;
    }
  }

  /**
   * Update an answer
   * @param {number} answerId - Answer ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated answer
   */
  async updateAnswer(answerId, updates) {
    try {
      const { answer_text, answer_value } = updates;
      
      const updateData = {};
      if (answer_text !== undefined) updateData.answer_text = answer_text;
      if (answer_value !== undefined) updateData.answer_value = answer_value;

      await this.update(answerId, updateData);
      return await this.findById(answerId);
    } catch (error) {
      console.error('Error in updateAnswer:', error);
      throw error;
    }
  }

  /**
   * Delete all answers for a response
   * @param {number} responseId - Response ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteByResponse(responseId) {
    try {
      const query = `
        DELETE FROM ${this.tableName}
        WHERE response_id = ?
      `;

      await this.db.query(query, [responseId]);
      return true;
    } catch (error) {
      console.error('Error in deleteByResponse:', error);
      throw error;
    }
  }

  /**
   * Get answer count for a question
   * @param {number} questionId - Question ID
   * @returns {Promise<number>} Number of answers
   */
  async getCountByQuestion(questionId) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM ${this.tableName}
        WHERE question_id = ?
      `;

      const [result] = await this.db.query(query, [questionId]);
      return result[0].count;
    } catch (error) {
      console.error('Error in getCountByQuestion:', error);
      throw error;
    }
  }
}

module.exports = SurveyAnswer;
