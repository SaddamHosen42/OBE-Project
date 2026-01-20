import api from './api';

/**
 * Teacher Service
 * Handles all teacher management API calls
 */
const teacherService = {
  /**
   * Get all teachers with pagination and filters
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with teachers list and pagination
   */
  getAllTeachers: async (params = {}) => {
    const response = await api.get('/teachers', { params });
    return response.data;
  },

  /**
   * Get a single teacher by ID
   * @param {number} id - Teacher ID
   * @returns {Promise} Response with teacher data
   */
  getTeacherById: async (id) => {
    const response = await api.get(`/teachers/${id}`);
    return response.data;
  },

  /**
   * Get teacher by Employee ID
   * @param {string} employeeId - Employee ID
   * @returns {Promise} Response with teacher data
   */
  getTeacherByEmployeeId: async (employeeId) => {
    const response = await api.get(`/teachers/employee/${employeeId}`);
    return response.data;
  },

  /**
   * Create a new teacher
   * @param {Object} teacherData - Teacher data
   * @returns {Promise} Response with created teacher
   */
  createTeacher: async (teacherData) => {
    const response = await api.post('/teachers', teacherData);
    return response.data;
  },

  /**
   * Update a teacher
   * @param {number} id - Teacher ID
   * @param {Object} teacherData - Updated teacher data
   * @returns {Promise} Response with updated teacher
   */
  updateTeacher: async (id, teacherData) => {
    const response = await api.put(`/teachers/${id}`, teacherData);
    return response.data;
  },

  /**
   * Delete a teacher
   * @param {number} id - Teacher ID
   * @returns {Promise} Response confirming deletion
   */
  deleteTeacher: async (id) => {
    const response = await api.delete(`/teachers/${id}`);
    return response.data;
  },

  /**
   * Get teachers by department
   * @param {number} departmentId - Department ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with teachers list
   */
  getTeachersByDepartment: async (departmentId, params = {}) => {
    const response = await api.get(`/teachers/department/${departmentId}`, { params });
    return response.data;
  },

  /**
   * Get teacher's course assignments
   * @param {number} id - Teacher ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with course assignments list
   */
  getTeacherCourseAssignments: async (id, params = {}) => {
    const response = await api.get(`/teachers/${id}/courses`, { params });
    return response.data;
  },

  /**
   * Get teacher statistics
   * @param {number} id - Teacher ID
   * @returns {Promise} Response with teacher statistics
   */
  getTeacherStatistics: async (id) => {
    const response = await api.get(`/teachers/${id}/statistics`);
    return response.data;
  },

  /**
   * Assign course to teacher
   * @param {number} teacherId - Teacher ID
   * @param {Object} assignmentData - Course assignment data
   * @returns {Promise} Response with assignment result
   */
  assignCourse: async (teacherId, assignmentData) => {
    const response = await api.post(`/teachers/${teacherId}/courses`, assignmentData);
    return response.data;
  },

  /**
   * Remove course assignment from teacher
   * @param {number} teacherId - Teacher ID
   * @param {number} offeringId - Course offering ID
   * @returns {Promise} Response confirming removal
   */
  removeCourseAssignment: async (teacherId, offeringId) => {
    const response = await api.delete(`/teachers/${teacherId}/courses/${offeringId}`);
    return response.data;
  },
};

export default teacherService;
