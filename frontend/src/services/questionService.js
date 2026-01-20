import api from './api';

/**
 * Question Service
 * Handles all question management API calls
 */
const questionService = {
  /**
   * Get all questions with pagination and filters
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with questions list
   */
  getAllQuestions: async (params = {}) => {
    const response = await api.get('/questions', { params });
    return response.data;
  },

  /**
   * Get a single question by ID
   * @param {number} id - Question ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with question data
   */
  getQuestionById: async (id, params = {}) => {
    const response = await api.get(`/questions/${id}`, { params });
    return response.data;
  },

  /**
   * Get questions by assessment component
   * @param {number} assessmentComponentId - Assessment component ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with questions list
   */
  getQuestionsByAssessment: async (assessmentComponentId, params = {}) => {
    const response = await api.get('/questions', { 
      params: { ...params, assessmentComponentId } 
    });
    return response.data;
  },

  /**
   * Get questions by course offering (question bank)
   * @param {number} courseOfferingId - Course offering ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with questions list
   */
  getQuestionsByCourseOffering: async (courseOfferingId, params = {}) => {
    const response = await api.get('/questions', { 
      params: { ...params, courseOfferingId } 
    });
    return response.data;
  },

  /**
   * Get questions by difficulty level
   * @param {string} difficultyLevel - Difficulty level
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with questions list
   */
  getQuestionsByDifficulty: async (difficultyLevel, params = {}) => {
    const response = await api.get('/questions', { 
      params: { ...params, difficultyLevel } 
    });
    return response.data;
  },

  /**
   * Create a new question
   * @param {Object} questionData - Question data
   * @returns {Promise} Response with created question
   */
  createQuestion: async (questionData) => {
    const response = await api.post('/questions', questionData);
    return response.data;
  },

  /**
   * Update a question
   * @param {number} id - Question ID
   * @param {Object} questionData - Updated question data
   * @returns {Promise} Response with updated question
   */
  updateQuestion: async (id, questionData) => {
    const response = await api.put(`/questions/${id}`, questionData);
    return response.data;
  },

  /**
   * Delete a question
   * @param {number} id - Question ID
   * @returns {Promise} Response
   */
  deleteQuestion: async (id) => {
    const response = await api.delete(`/questions/${id}`);
    return response.data;
  },

  /**
   * Bulk create questions
   * @param {Array} questionsData - Array of questions data
   * @returns {Promise} Response with created questions
   */
  bulkCreateQuestions: async (questionsData) => {
    const response = await api.post('/questions/bulk', questionsData);
    return response.data;
  },

  /**
   * Get question statistics
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise} Response with statistics
   */
  getQuestionStats: async (courseOfferingId) => {
    const response = await api.get(`/questions/stats/${courseOfferingId}`);
    return response.data;
  },

  /**
   * Map question to CLO
   * @param {number} questionId - Question ID
   * @param {number} cloId - CLO ID
   * @param {number} weightage - Weightage percentage
   * @returns {Promise} Response
   */
  mapQuestionToCLO: async (questionId, cloId, weightage) => {
    const response = await api.post(`/questions/${questionId}/clo-mapping`, {
      cloId,
      weightage
    });
    return response.data;
  },

  /**
   * Remove CLO mapping
   * @param {number} questionId - Question ID
   * @param {number} cloId - CLO ID
   * @returns {Promise} Response
   */
  removeCLOMapping: async (questionId, cloId) => {
    const response = await api.delete(`/questions/${questionId}/clo-mapping/${cloId}`);
    return response.data;
  }
};

export default questionService;
