import api from './api';

/**
 * Student Service
 * Handles all student management API calls
 */
const studentService = {
  /**
   * Get all students with pagination and filters
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with students list and pagination
   */
  getAllStudents: async (params = {}) => {
    const response = await api.get('/students', { params });
    return response.data;
  },

  /**
   * Get a single student by ID
   * @param {number} id - Student ID
   * @returns {Promise} Response with student data
   */
  getStudentById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  /**
   * Get student by Student ID (SID)
   * @param {string} sid - Student ID
   * @returns {Promise} Response with student data
   */
  getStudentBySID: async (sid) => {
    const response = await api.get(`/students/sid/${sid}`);
    return response.data;
  },

  /**
   * Create a new student
   * @param {Object} studentData - Student data
   * @returns {Promise} Response with created student
   */
  createStudent: async (studentData) => {
    const response = await api.post('/students', studentData);
    return response.data;
  },

  /**
   * Update a student
   * @param {number} id - Student ID
   * @param {Object} studentData - Updated student data
   * @returns {Promise} Response with updated student
   */
  updateStudent: async (id, studentData) => {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data;
  },

  /**
   * Delete a student
   * @param {number} id - Student ID
   * @returns {Promise} Response confirming deletion
   */
  deleteStudent: async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },

  /**
   * Get students by department
   * @param {number} departmentId - Department ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with students list
   */
  getStudentsByDepartment: async (departmentId, params = {}) => {
    const response = await api.get(`/students/department/${departmentId}`, { params });
    return response.data;
  },

  /**
   * Get students by degree
   * @param {number} degreeId - Degree ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with students list
   */
  getStudentsByDegree: async (degreeId, params = {}) => {
    const response = await api.get(`/students/degree/${degreeId}`, { params });
    return response.data;
  },

  /**
   * Get student's course enrollments
   * @param {number} id - Student ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with enrollments list
   */
  getStudentEnrollments: async (id, params = {}) => {
    const response = await api.get(`/students/${id}/enrollments`, { params });
    return response.data;
  },

  /**
   * Get student's academic results
   * @param {number} id - Student ID
   * @returns {Promise} Response with results data
   */
  getStudentResults: async (id) => {
    const response = await api.get(`/students/${id}/results`);
    return response.data;
  },

  /**
   * Get student's attainment report
   * @param {number} id - Student ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with attainment data
   */
  getStudentAttainment: async (id, params = {}) => {
    const response = await api.get(`/students/${id}/attainment`, { params });
    return response.data;
  },
};

export default studentService;
