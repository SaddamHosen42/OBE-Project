import api from './api';

/**
 * Department Service
 * Handles all department management API calls
 */
const departmentService = {
  /**
   * Get all departments with pagination and filters
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with departments list and pagination
   */
  getAllDepartments: async (params = {}) => {
    const response = await api.get('/departments', { params });
    return response.data;
  },

  /**
   * Get a single department by ID
   * @param {number} id - Department ID
   * @returns {Promise} Response with department data
   */
  getDepartmentById: async (id) => {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  },

  /**
   * Create a new department
   * @param {Object} departmentData - Department data
   * @returns {Promise} Response with created department
   */
  createDepartment: async (departmentData) => {
    const response = await api.post('/departments', departmentData);
    return response.data;
  },

  /**
   * Update a department
   * @param {number} id - Department ID
   * @param {Object} departmentData - Updated department data
   * @returns {Promise} Response with updated department
   */
  updateDepartment: async (id, departmentData) => {
    const response = await api.put(`/departments/${id}`, departmentData);
    return response.data;
  },

  /**
   * Delete a department
   * @param {number} id - Department ID
   * @returns {Promise} Response confirming deletion
   */
  deleteDepartment: async (id) => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  },
};

export default departmentService;
