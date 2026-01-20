import api from './api';

/**
 * User Service
 * Handles all user management API calls
 */
const userService = {
  /**
   * Get all users with pagination and filters
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with users list and pagination
   */
  getAllUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  /**
   * Get a single user by ID
   * @param {number} id - User ID
   * @returns {Promise} Response with user data
   */
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise} Response with created user
   */
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  /**
   * Update a user
   * @param {number} id - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise} Response with updated user
   */
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  /**
   * Delete a user
   * @param {number} id - User ID
   * @returns {Promise} Response confirming deletion
   */
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  /**
   * Update user profile (own profile)
   * @param {Object} profileData - Profile data
   * @returns {Promise} Response with updated profile
   */
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  /**
   * Get users by role
   * @param {string} role - User role (admin, teacher, student, staff)
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with users list
   */
  getUsersByRole: async (role, params = {}) => {
    const response = await api.get('/users', { 
      params: { ...params, role } 
    });
    return response.data;
  },
};

export default userService;
