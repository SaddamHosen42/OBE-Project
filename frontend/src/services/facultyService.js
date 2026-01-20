import api from './api';

/**
 * Faculty Service
 * Handles all faculty management API calls
 */
const facultyService = {
  /**
   * Get all faculties with pagination and filters
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with faculties list and pagination
   */
  getAllFaculties: async (params = {}) => {
    const response = await api.get('/faculties', { params });
    return response.data;
  },

  /**
   * Get a single faculty by ID
   * @param {number} id - Faculty ID
   * @returns {Promise} Response with faculty data
   */
  getFacultyById: async (id) => {
    const response = await api.get(`/faculties/${id}`);
    return response.data;
  },

  /**
   * Create a new faculty
   * @param {Object} facultyData - Faculty data
   * @returns {Promise} Response with created faculty
   */
  createFaculty: async (facultyData) => {
    const response = await api.post('/faculties', facultyData);
    return response.data;
  },

  /**
   * Update a faculty
   * @param {number} id - Faculty ID
   * @param {Object} facultyData - Updated faculty data
   * @returns {Promise} Response with updated faculty
   */
  updateFaculty: async (id, facultyData) => {
    const response = await api.put(`/faculties/${id}`, facultyData);
    return response.data;
  },

  /**
   * Delete a faculty
   * @param {number} id - Faculty ID
   * @returns {Promise} Response confirming deletion
   */
  deleteFaculty: async (id) => {
    const response = await api.delete(`/faculties/${id}`);
    return response.data;
  },
};

export default facultyService;
