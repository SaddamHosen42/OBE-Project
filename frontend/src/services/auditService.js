import api from './api';

/**
 * Audit Log Service
 * Handles all audit log API calls
 */
const auditService = {
  /**
   * Get all audit logs with pagination and filters
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with audit logs list and pagination
   */
  getAllLogs: async (params = {}) => {
    const response = await api.get('/audit-logs', { params });
    return response.data;
  },

  /**
   * Get a single audit log by ID
   * @param {number} id - Audit log ID
   * @returns {Promise} Response with audit log data
   */
  getLogById: async (id) => {
    const response = await api.get(`/audit-logs/${id}`);
    return response.data;
  },

  /**
   * Get audit logs by user ID
   * @param {number} userId - User ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with user's audit logs
   */
  getLogsByUser: async (userId, params = {}) => {
    const response = await api.get(`/audit-logs/user/${userId}`, { params });
    return response.data;
  },

  /**
   * Get audit logs by table name
   * @param {string} tableName - Table name
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with table audit logs
   */
  getLogsByTable: async (tableName, params = {}) => {
    const response = await api.get(`/audit-logs/table/${tableName}`, { params });
    return response.data;
  },

  /**
   * Get audit logs for a specific record
   * @param {string} tableName - Table name
   * @param {number} recordId - Record ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with record audit logs
   */
  getLogsByRecord: async (tableName, recordId, params = {}) => {
    const response = await api.get(`/audit-logs/record/${tableName}/${recordId}`, { params });
    return response.data;
  },

  /**
   * Get audit log statistics
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with statistics
   */
  getStatistics: async (params = {}) => {
    const response = await api.get('/audit-logs/statistics', { params });
    return response.data;
  },

  /**
   * Get recent audit activities
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with recent activities
   */
  getRecentActivity: async (params = {}) => {
    const response = await api.get('/audit-logs/recent', { params });
    return response.data;
  },
};

export default auditService;
