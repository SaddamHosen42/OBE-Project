import api from './api';

/**
 * Course Offering Service
 * Handles all course offering management API calls
 */
const offeringService = {
  /**
   * Get all course offerings with pagination and filters
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with course offerings list and pagination
   */
  getAllOfferings: async (params = {}) => {
    const response = await api.get('/course-offerings', { params });
    return response.data;
  },

  /**
   * Get a single course offering by ID
   * @param {number} id - Course offering ID
   * @returns {Promise} Response with course offering data
   */
  getOfferingById: async (id) => {
    const response = await api.get(`/course-offerings/${id}`);
    return response.data;
  },

  /**
   * Get offerings by course
   * @param {number} courseId - Course ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with offerings list
   */
  getOfferingsByCourse: async (courseId, params = {}) => {
    const response = await api.get('/course-offerings', { 
      params: { ...params, courseId } 
    });
    return response.data;
  },

  /**
   * Get offerings by academic session
   * @param {number} sessionId - Academic session ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with offerings list
   */
  getOfferingsBySession: async (sessionId, params = {}) => {
    const response = await api.get('/course-offerings', { 
      params: { ...params, sessionId } 
    });
    return response.data;
  },

  /**
   * Get offerings by semester
   * @param {number} semesterId - Semester ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with offerings list
   */
  getOfferingsBySemester: async (semesterId, params = {}) => {
    const response = await api.get('/course-offerings', { 
      params: { ...params, semesterId } 
    });
    return response.data;
  },

  /**
   * Create a new course offering
   * @param {Object} offeringData - Course offering data
   * @returns {Promise} Response with created course offering
   */
  createOffering: async (offeringData) => {
    const response = await api.post('/course-offerings', offeringData);
    return response.data;
  },

  /**
   * Update a course offering
   * @param {number} id - Course offering ID
   * @param {Object} offeringData - Updated course offering data
   * @returns {Promise} Response with updated course offering
   */
  updateOffering: async (id, offeringData) => {
    const response = await api.put(`/course-offerings/${id}`, offeringData);
    return response.data;
  },

  /**
   * Delete a course offering
   * @param {number} id - Course offering ID
   * @returns {Promise} Response confirming deletion
   */
  deleteOffering: async (id) => {
    const response = await api.delete(`/course-offerings/${id}`);
    return response.data;
  },

  /**
   * Get enrollments for a course offering
   * @param {number} offeringId - Course offering ID
   * @returns {Promise} Response with enrollments list
   */
  getOfferingEnrollments: async (offeringId) => {
    const response = await api.get(`/course-offerings/${offeringId}/enrollments`);
    return response.data;
  },
};

export default offeringService;
