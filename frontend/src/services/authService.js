import api from './api';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
const authService = {
  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.identifier - Email or username
   * @param {string} credentials.password - User password
   * @returns {Promise} Response with user data and token
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise} Response with user data and token
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Logout user
   * @returns {Promise} Response confirming logout
   */
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  /**
   * Get current user profile
   * @returns {Promise} Response with user data
   */
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Request password reset
   * @param {string} email - User's email address
   * @returns {Promise} Response confirming reset email sent
   */
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Reset password with token
   * @param {Object} data - Reset password data
   * @param {string} data.token - Reset token from email
   * @param {string} data.newPassword - New password
   * @returns {Promise} Response confirming password reset
   */
  resetPassword: async (data) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },

  /**
   * Change password for logged-in user
   * @param {Object} data - Change password data
   * @param {string} data.currentPassword - Current password
   * @param {string} data.newPassword - New password
   * @returns {Promise} Response confirming password change
   */
  changePassword: async (data) => {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  },

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise} Response with new access token
   */
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },
};

export default authService;
