import api from './api';

/**
 * Semester Service
 * Handles all semester management API calls
 */
const semesterService = {
  /**
   * Get all semesters with pagination and filters
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with semesters list and pagination
   */
  getAllSemesters: async (params = {}) => {
    const response = await api.get('/semesters', { params });
    return response.data;
  },

  /**
   * Get a single semester by ID
   * @param {number} id - Semester ID
   * @param {Object} params - Query parameters (withSession, withCourses)
   * @returns {Promise} Response with semester data
   */
  getSemesterById: async (id, params = {}) => {
    const response = await api.get(`/semesters/${id}`, { params });
    return response.data;
  },

  /**
   * Get the currently active semester
   * @returns {Promise} Response with active semester data
   */
  getActiveSemester: async () => {
    const response = await api.get('/semesters/active/current');
    return response.data;
  },

  /**
   * Get count of course offerings in a semester
   * @param {number} id - Semester ID
   * @returns {Promise} Response with course offering count
   */
  getCourseOfferingCount: async (id) => {
    const response = await api.get(`/semesters/${id}/course-offerings/count`);
    return response.data;
  },

  /**
   * Create a new semester
   * @param {Object} semesterData - Semester data
   * @returns {Promise} Response with created semester
   */
  createSemester: async (semesterData) => {
    const response = await api.post('/semesters', semesterData);
    return response.data;
  },

  /**
   * Update a semester
   * @param {number} id - Semester ID
   * @param {Object} semesterData - Updated semester data
   * @returns {Promise} Response with updated semester
   */
  updateSemester: async (id, semesterData) => {
    const response = await api.put(`/semesters/${id}`, semesterData);
    return response.data;
  },

  /**
   * Activate a semester
   * @param {number} id - Semester ID
   * @returns {Promise} Response confirming activation
   */
  activateSemester: async (id) => {
    const response = await api.patch(`/semesters/${id}/activate`);
    return response.data;
  },

  /**
   * Delete a semester
   * @param {number} id - Semester ID
   * @returns {Promise} Response confirming deletion
   */
  deleteSemester: async (id) => {
    const response = await api.delete(`/semesters/${id}`);
    return response.data;
  },
};

export default semesterService;
