import api from './api';

/**
 * Degree Service
 * Handles all degree/program management API calls
 */
const degreeService = {
  /**
   * Get all degrees with pagination and filters
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with degrees list and pagination
   */
  getAllDegrees: async (params = {}) => {
    const response = await api.get('/degrees', { params });
    return response.data;
  },

  /**
   * Get a single degree by ID
   * @param {number} id - Degree ID
   * @returns {Promise} Response with degree data
   */
  getDegreeById: async (id) => {
    const response = await api.get(`/degrees/${id}`);
    return response.data;
  },

  /**
   * Create a new degree
   * @param {Object} degreeData - Degree data
   * @returns {Promise} Response with created degree
   */
  createDegree: async (degreeData) => {
    const response = await api.post('/degrees', degreeData);
    return response.data;
  },

  /**
   * Update a degree
   * @param {number} id - Degree ID
   * @param {Object} degreeData - Updated degree data
   * @returns {Promise} Response with updated degree
   */
  updateDegree: async (id, degreeData) => {
    const response = await api.put(`/degrees/${id}`, degreeData);
    return response.data;
  },

  /**
   * Delete a degree
   * @param {number} id - Degree ID
   * @returns {Promise} Response confirming deletion
   */
  deleteDegree: async (id) => {
    const response = await api.delete(`/degrees/${id}`);
    return response.data;
  },
};

export default degreeService;
