import api from './api';

/**
 * Marks Service
 * Handles all marks management API calls
 */
const marksService = {
  /**
   * Get all marks with pagination and filters
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with marks list
   */
  getAllMarks: async (params = {}) => {
    const response = await api.get('/marks', { params });
    return response.data;
  },

  /**
   * Get marks by student
   * @param {number} studentId - Student ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with marks data
   */
  getMarksByStudent: async (studentId, params = {}) => {
    const response = await api.get(`/marks/student/${studentId}`, { params });
    return response.data;
  },

  /**
   * Get marks by assessment component
   * @param {number} assessmentComponentId - Assessment component ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with marks data
   */
  getMarksByAssessment: async (assessmentComponentId, params = {}) => {
    const response = await api.get(`/marks/assessment/${assessmentComponentId}`, { params });
    return response.data;
  },

  /**
   * Get marks by question
   * @param {number} questionId - Question ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with marks data
   */
  getMarksByQuestion: async (questionId, params = {}) => {
    const response = await api.get(`/marks/question/${questionId}`, { params });
    return response.data;
  },

  /**
   * Get marks sheet for assessment
   * @param {number} assessmentComponentId - Assessment component ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with marks sheet data
   */
  getMarksSheet: async (assessmentComponentId, params = {}) => {
    const response = await api.get(`/marks/sheet/${assessmentComponentId}`, { params });
    return response.data;
  },

  /**
   * Create marks entry
   * @param {Object} marksData - Marks data
   * @returns {Promise} Response with created marks
   */
  createMarks: async (marksData) => {
    const response = await api.post('/marks', marksData);
    return response.data;
  },

  /**
   * Update marks entry
   * @param {number} id - Marks entry ID
   * @param {Object} marksData - Updated marks data
   * @returns {Promise} Response with updated marks
   */
  updateMarks: async (id, marksData) => {
    const response = await api.put(`/marks/${id}`, marksData);
    return response.data;
  },

  /**
   * Delete marks entry
   * @param {number} id - Marks entry ID
   * @returns {Promise} Response
   */
  deleteMarks: async (id) => {
    const response = await api.delete(`/marks/${id}`);
    return response.data;
  },

  /**
   * Bulk create marks entries
   * @param {Array} marksArray - Array of marks data
   * @returns {Promise} Response with created marks
   */
  bulkCreateMarks: async (marksArray) => {
    const response = await api.post('/marks/bulk', { marks: marksArray });
    return response.data;
  },

  /**
   * Bulk update marks entries
   * @param {Array} marksArray - Array of marks data with IDs
   * @returns {Promise} Response with updated marks
   */
  bulkUpdateMarks: async (marksArray) => {
    const response = await api.put('/marks/bulk', { marks: marksArray });
    return response.data;
  },

  /**
   * Import marks from CSV/Excel
   * @param {number} assessmentComponentId - Assessment component ID
   * @param {FormData} formData - File data
   * @returns {Promise} Response with import result
   */
  importMarks: async (assessmentComponentId, formData) => {
    const response = await api.post(`/marks/import/${assessmentComponentId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Export marks to Excel
   * @param {number} assessmentComponentId - Assessment component ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with file blob
   */
  exportMarks: async (assessmentComponentId, params = {}) => {
    const response = await api.get(`/marks/export/${assessmentComponentId}`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Get marks statistics
   * @param {number} assessmentComponentId - Assessment component ID
   * @returns {Promise} Response with statistics
   */
  getMarksStatistics: async (assessmentComponentId) => {
    const response = await api.get(`/marks/statistics/${assessmentComponentId}`);
    return response.data;
  },

  /**
   * Validate marks entries
   * @param {Array} marksArray - Array of marks data
   * @returns {Promise} Response with validation result
   */
  validateMarks: async (marksArray) => {
    const response = await api.post('/marks/validate', { marks: marksArray });
    return response.data;
  },
};

export default marksService;
