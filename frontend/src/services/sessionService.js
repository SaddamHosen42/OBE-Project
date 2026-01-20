import api from './api';

/**
 * Academic Session Service
 * Handles all academic session management API calls
 */
const sessionService = {
  /**
   * Get all academic sessions with pagination and filters
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with sessions list and pagination
   */
  getAllSessions: async (params = {}) => {
    const response = await api.get('/academic-sessions', { params });
    return response.data;
  },

  /**
   * Get a single academic session by ID
   * @param {number} id - Session ID
   * @param {Object} params - Query parameters (withSemesters, withCourses)
   * @returns {Promise} Response with session data
   */
  getSessionById: async (id, params = {}) => {
    const response = await api.get(`/academic-sessions/${id}`, { params });
    return response.data;
  },

  /**
   * Get the currently active academic session
   * @returns {Promise} Response with active session data
   */
  getActiveSession: async () => {
    const response = await api.get('/academic-sessions/active/current');
    return response.data;
  },

  /**
   * Get count of semesters in a session
   * @param {number} id - Session ID
   * @returns {Promise} Response with semester count
   */
  getSemesterCount: async (id) => {
    const response = await api.get(`/academic-sessions/${id}/semesters/count`);
    return response.data;
  },

  /**
   * Create a new academic session
   * @param {Object} sessionData - Session data
   * @returns {Promise} Response with created session
   */
  createSession: async (sessionData) => {
    const response = await api.post('/academic-sessions', sessionData);
    return response.data;
  },

  /**
   * Update an academic session
   * @param {number} id - Session ID
   * @param {Object} sessionData - Updated session data
   * @returns {Promise} Response with updated session
   */
  updateSession: async (id, sessionData) => {
    const response = await api.put(`/academic-sessions/${id}`, sessionData);
    return response.data;
  },

  /**
   * Set a session as active
   * @param {number} id - Session ID
   * @returns {Promise} Response confirming activation
   */
  setActiveSession: async (id) => {
    const response = await api.put(`/academic-sessions/${id}/set-active`);
    return response.data;
  },

  /**
   * Delete an academic session
   * @param {number} id - Session ID
   * @returns {Promise} Response confirming deletion
   */
  deleteSession: async (id) => {
    const response = await api.delete(`/academic-sessions/${id}`);
    return response.data;
  },
};

export default sessionService;
