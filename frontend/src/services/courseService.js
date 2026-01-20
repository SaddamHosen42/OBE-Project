import api from './api';

/**
 * Course Service
 * Handles all course management API calls
 */
const courseService = {
  /**
   * Get all courses with pagination and filters
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with courses list and pagination
   */
  getAllCourses: async (params = {}) => {
    const response = await api.get('/courses', { params });
    return response.data;
  },

  /**
   * Get a single course by ID
   * @param {number} id - Course ID
   * @returns {Promise} Response with course data
   */
  getCourseById: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  /**
   * Get courses by department
   * @param {number} departmentId - Department ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with courses list
   */
  getCoursesByDepartment: async (departmentId, params = {}) => {
    const response = await api.get('/courses', { 
      params: { ...params, departmentId } 
    });
    return response.data;
  },

  /**
   * Get courses by degree
   * @param {number} degreeId - Degree ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with courses list
   */
  getCoursesByDegree: async (degreeId, params = {}) => {
    const response = await api.get('/courses', { 
      params: { ...params, degreeId } 
    });
    return response.data;
  },

  /**
   * Create a new course
   * @param {Object} courseData - Course data
   * @returns {Promise} Response with created course
   */
  createCourse: async (courseData) => {
    const response = await api.post('/courses', courseData);
    return response.data;
  },

  /**
   * Update a course
   * @param {number} id - Course ID
   * @param {Object} courseData - Updated course data
   * @returns {Promise} Response with updated course
   */
  updateCourse: async (id, courseData) => {
    const response = await api.put(`/courses/${id}`, courseData);
    return response.data;
  },

  /**
   * Delete a course
   * @param {number} id - Course ID
   * @returns {Promise} Response confirming deletion
   */
  deleteCourse: async (id) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },

  /**
   * Get course CLOs (Course Learning Outcomes)
   * @param {number} courseId - Course ID
   * @returns {Promise} Response with CLOs list
   */
  getCourseCLOs: async (courseId) => {
    const response = await api.get(`/courses/${courseId}/clos`);
    return response.data;
  },
};

export default courseService;
