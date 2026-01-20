import api from './api';

/**
 * Enrollment Service
 * Handles all enrollment management API calls
 */
const enrollmentService = {
  /**
   * Get all enrollments for a course offering
   * @param {number} courseOfferingId - Course offering ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with enrollments list
   */
  getByOffering: async (courseOfferingId, params = {}) => {
    const response = await api.get(`/enrollments/offering/${courseOfferingId}`, { params });
    return response.data;
  },

  /**
   * Get all enrollments for a student
   * @param {number} studentId - Student ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with enrollments list
   */
  getByStudent: async (studentId, params = {}) => {
    const response = await api.get(`/enrollments/student/${studentId}`, { params });
    return response.data;
  },

  /**
   * Get enrollment details by ID
   * @param {number} id - Enrollment ID
   * @returns {Promise} Response with enrollment details
   */
  getEnrollmentById: async (id) => {
    const response = await api.get(`/enrollments/${id}`);
    return response.data;
  },

  /**
   * Enroll a student in a course offering
   * @param {Object} enrollmentData - Enrollment data
   * @returns {Promise} Response with created enrollment
   */
  enrollStudent: async (enrollmentData) => {
    const response = await api.post('/enrollments', enrollmentData);
    return response.data;
  },

  /**
   * Drop a student from a course offering
   * @param {number} id - Enrollment ID
   * @returns {Promise} Response confirming drop
   */
  dropEnrollment: async (id) => {
    const response = await api.delete(`/enrollments/${id}/drop`);
    return response.data;
  },

  /**
   * Update enrollment status
   * @param {number} id - Enrollment ID
   * @param {string} status - New status
   * @returns {Promise} Response with updated enrollment
   */
  updateStatus: async (id, status) => {
    const response = await api.put(`/enrollments/${id}/status`, { status });
    return response.data;
  },

  /**
   * Get enrollment statistics for a course offering
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise} Response with enrollment statistics
   */
  getStats: async (courseOfferingId) => {
    const response = await api.get(`/enrollments/offering/${courseOfferingId}/stats`);
    return response.data;
  },

  /**
   * Check if a student is enrolled in a course offering
   * @param {number} studentId - Student ID
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise} Response with enrollment check result
   */
  checkEnrollment: async (studentId, courseOfferingId) => {
    const response = await api.get('/enrollments/check', {
      params: { student_id: studentId, course_offering_id: courseOfferingId }
    });
    return response.data;
  },

  /**
   * Delete an enrollment
   * @param {number} id - Enrollment ID
   * @returns {Promise} Response confirming deletion
   */
  deleteEnrollment: async (id) => {
    const response = await api.delete(`/enrollments/${id}`);
    return response.data;
  },

  /**
   * Bulk enroll students in a course offering
   * @param {Object} bulkData - Bulk enrollment data
   * @returns {Promise} Response with bulk enrollment results
   */
  bulkEnroll: async (bulkData) => {
    const response = await api.post('/enrollments/bulk', bulkData);
    return response.data;
  }
};

export default enrollmentService;
