const BaseModel = require('./BaseModel');

/**
 * SurveyQuestion Model for managing survey questions
 * Handles question CRUD operations and relationships with surveys
 */
class SurveyQuestion extends BaseModel {
  constructor() {
    super('survey_questions');
  }

  /**
   * Get all questions for a specific survey
   * @param {number} surveyId - The survey ID
   * @returns {Promise<Array>} Array of questions for the survey
   */
  async getBySurvey(surveyId) {
    try {
      const query = `
        SELECT 
          id,
          survey_id,
          question_text,
          question_type,
          is_required,
          options,
          order_number,
          created_at,
          updated_at
        FROM ${this.tableName}
        WHERE survey_id = ?
        ORDER BY order_number ASC
      `;

      const [questions] = await this.db.query(query, [surveyId]);

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

      return questions;
    } catch (error) {
      console.error('Error in getBySurvey:', error);
      throw error;
    }
  }

  /**
   * Create a new question for a survey
   * @param {Object} questionData - Question data
   * @returns {Promise<Object>} Created question
   */
  async createQuestion(questionData) {
    try {
      const {
        survey_id,
        question_text,
        question_type,
        is_required = 0,
        options = [],
        order_number
      } = questionData;

      // Convert options array to JSON string
      const optionsJson = JSON.stringify(options);

      const result = await this.create({
        survey_id,
        question_text,
        question_type,
        is_required,
        options: optionsJson,
        order_number: order_number || 0
      });

      return result;
    } catch (error) {
      console.error('Error in createQuestion:', error);
      throw error;
    }
  }

  /**
   * Update question order
   * @param {number} questionId - Question ID
   * @param {number} newOrder - New order number
   * @returns {Promise<boolean>} Success status
   */
  async updateOrder(questionId, newOrder) {
    try {
      const query = `
        UPDATE ${this.tableName}
        SET order_number = ?
        WHERE id = ?
      `;

      await this.db.query(query, [newOrder, questionId]);
      return true;
    } catch (error) {
      console.error('Error in updateOrder:', error);
      throw error;
    }
  }

  /**
   * Bulk create questions for a survey
   * @param {number} surveyId - Survey ID
   * @param {Array} questions - Array of question objects
   * @returns {Promise<Array>} Array of created questions
   */
  async bulkCreate(surveyId, questions) {
    try {
      const createdQuestions = [];

      for (let i = 0; i < questions.length; i++) {
        const questionData = {
          ...questions[i],
          survey_id: surveyId,
          order_number: questions[i].order_number || i + 1
        };

        const created = await this.createQuestion(questionData);
        createdQuestions.push(created);
      }

      return createdQuestions;
    } catch (error) {
      console.error('Error in bulkCreate:', error);
      throw error;
    }
  }

  /**
   * Get question by ID with parsed options
   * @param {number} questionId - Question ID
   * @returns {Promise<Object>} Question object
   */
  async getById(questionId) {
    try {
      const question = await this.findById(questionId);
      
      if (question && question.options) {
        try {
          question.options = JSON.parse(question.options);
        } catch (e) {
          question.options = [];
        }
      }

      return question;
    } catch (error) {
      console.error('Error in getById:', error);
      throw error;
    }
  }

  /**
   * Delete all questions for a survey
   * @param {number} surveyId - Survey ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteBySurvey(surveyId) {
    try {
      const query = `
        DELETE FROM ${this.tableName}
        WHERE survey_id = ?
      `;

      await this.db.query(query, [surveyId]);
      return true;
    } catch (error) {
      console.error('Error in deleteBySurvey:', error);
      throw error;
    }
  }

  /**
   * Get question count for a survey
   * @param {number} surveyId - Survey ID
   * @returns {Promise<number>} Number of questions
   */
  async getCountBySurvey(surveyId) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM ${this.tableName}
        WHERE survey_id = ?
      `;

      const [result] = await this.db.query(query, [surveyId]);
      return result[0].count;
    } catch (error) {
      console.error('Error in getCountBySurvey:', error);
      throw error;
    }
  }
}

module.exports = SurveyQuestion;
