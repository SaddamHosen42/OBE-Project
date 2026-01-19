const BaseModel = require('./BaseModel');

/**
 * AuditLog Model for tracking all CRUD operations and system actions
 * Provides audit trail and compliance tracking for the OBE system
 */
class AuditLog extends BaseModel {
  constructor() {
    super('audit_logs');
  }

  /**
   * Create an audit log entry
   * @param {Object} logData - Audit log data
   * @param {number|null} logData.user_id - User who performed the action (NULL for system actions)
   * @param {string} logData.action - Action type (CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.)
   * @param {string} logData.table_name - Name of the table affected
   * @param {number|null} logData.record_id - ID of the affected record
   * @param {Object|null} logData.old_values - Old values (for UPDATE/DELETE)
   * @param {Object|null} logData.new_values - New values (for CREATE/UPDATE)
   * @param {string|null} logData.ip_address - IP address of the client
   * @param {string|null} logData.user_agent - Browser/client information
   * @returns {Promise<Object>} Created audit log entry
   */
  async log(logData) {
    try {
      // Validate required fields
      if (!logData.action) {
        throw new Error('action is required');
      }
      if (!logData.table_name) {
        throw new Error('table_name is required');
      }

      // Validate action type
      const validActions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW', 'EXPORT', 'IMPORT'];
      if (!validActions.includes(logData.action.toUpperCase())) {
        throw new Error(`Invalid action. Must be one of: ${validActions.join(', ')}`);
      }

      // Prepare data for insertion
      const auditData = {
        user_id: logData.user_id || null,
        action: logData.action.toUpperCase(),
        table_name: logData.table_name,
        record_id: logData.record_id || null,
        old_values: logData.old_values ? JSON.stringify(logData.old_values) : null,
        new_values: logData.new_values ? JSON.stringify(logData.new_values) : null,
        ip_address: logData.ip_address || null,
        user_agent: logData.user_agent || null
      };

      // Insert audit log
      const result = await this.create(auditData);

      return {
        id: result,
        ...auditData,
        created_at: new Date()
      };
    } catch (error) {
      console.error('Error in AuditLog.log:', error);
      throw error;
    }
  }

  /**
   * Get audit logs by user ID
   * @param {number} userId - User ID
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Results per page (default: 50)
   * @param {string} options.orderBy - Column to order by (default: 'created_at')
   * @param {string} options.order - Order direction (default: 'DESC')
   * @param {string} options.action - Filter by action type
   * @param {string} options.table_name - Filter by table name
   * @param {string} options.startDate - Filter by start date
   * @param {string} options.endDate - Filter by end date
   * @returns {Promise<Object>} Paginated audit logs with user information
   */
  async getByUser(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        orderBy = 'created_at',
        order = 'DESC',
        action = null,
        table_name = null,
        startDate = null,
        endDate = null
      } = options;

      const offset = (page - 1) * limit;
      const params = [userId];
      
      let query = `
        SELECT 
          al.*,
          u.username,
          u.email,
          u.full_name
        FROM ${this.tableName} al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE al.user_id = ?
      `;

      // Add filters
      if (action) {
        query += ` AND al.action = ?`;
        params.push(action.toUpperCase());
      }

      if (table_name) {
        query += ` AND al.table_name = ?`;
        params.push(table_name);
      }

      if (startDate) {
        query += ` AND al.created_at >= ?`;
        params.push(startDate);
      }

      if (endDate) {
        query += ` AND al.created_at <= ?`;
        params.push(endDate);
      }

      // Get total count
      const countQuery = query.replace(
        /SELECT[\s\S]*FROM/,
        'SELECT COUNT(*) as total FROM'
      );
      const [countResult] = await this.db.query(countQuery, params);
      const total = countResult[0].total;

      // Add ordering and pagination
      query += ` ORDER BY al.${orderBy} ${order} LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const [logs] = await this.db.query(query, params);

      // Parse JSON fields
      const parsedLogs = logs.map(log => ({
        ...log,
        old_values: log.old_values ? JSON.parse(log.old_values) : null,
        new_values: log.new_values ? JSON.parse(log.new_values) : null
      }));

      return {
        data: parsedLogs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error in AuditLog.getByUser:', error);
      throw error;
    }
  }

  /**
   * Get audit logs by table name
   * @param {string} tableName - Table name
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Results per page (default: 50)
   * @param {string} options.orderBy - Column to order by (default: 'created_at')
   * @param {string} options.order - Order direction (default: 'DESC')
   * @param {string} options.action - Filter by action type
   * @param {number} options.record_id - Filter by specific record ID
   * @param {number} options.user_id - Filter by user ID
   * @param {string} options.startDate - Filter by start date
   * @param {string} options.endDate - Filter by end date
   * @returns {Promise<Object>} Paginated audit logs for the table
   */
  async getByTable(tableName, options = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        orderBy = 'created_at',
        order = 'DESC',
        action = null,
        record_id = null,
        user_id = null,
        startDate = null,
        endDate = null
      } = options;

      const offset = (page - 1) * limit;
      const params = [tableName];
      
      let query = `
        SELECT 
          al.*,
          u.username,
          u.email,
          u.full_name
        FROM ${this.tableName} al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE al.table_name = ?
      `;

      // Add filters
      if (action) {
        query += ` AND al.action = ?`;
        params.push(action.toUpperCase());
      }

      if (record_id) {
        query += ` AND al.record_id = ?`;
        params.push(record_id);
      }

      if (user_id) {
        query += ` AND al.user_id = ?`;
        params.push(user_id);
      }

      if (startDate) {
        query += ` AND al.created_at >= ?`;
        params.push(startDate);
      }

      if (endDate) {
        query += ` AND al.created_at <= ?`;
        params.push(endDate);
      }

      // Get total count
      const countQuery = query.replace(
        /SELECT[\s\S]*FROM/,
        'SELECT COUNT(*) as total FROM'
      );
      const [countResult] = await this.db.query(countQuery, params);
      const total = countResult[0].total;

      // Add ordering and pagination
      query += ` ORDER BY al.${orderBy} ${order} LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const [logs] = await this.db.query(query, params);

      // Parse JSON fields
      const parsedLogs = logs.map(log => ({
        ...log,
        old_values: log.old_values ? JSON.parse(log.old_values) : null,
        new_values: log.new_values ? JSON.parse(log.new_values) : null
      }));

      return {
        data: parsedLogs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error in AuditLog.getByTable:', error);
      throw error;
    }
  }

  /**
   * Get audit logs for a specific record
   * @param {string} tableName - Table name
   * @param {number} recordId - Record ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Audit logs for the specific record
   */
  async getByRecord(tableName, recordId, options = {}) {
    try {
      const {
        orderBy = 'created_at',
        order = 'ASC',
        action = null
      } = options;

      const params = [tableName, recordId];
      
      let query = `
        SELECT 
          al.*,
          u.username,
          u.email,
          u.full_name
        FROM ${this.tableName} al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE al.table_name = ? AND al.record_id = ?
      `;

      if (action) {
        query += ` AND al.action = ?`;
        params.push(action.toUpperCase());
      }

      query += ` ORDER BY al.${orderBy} ${order}`;

      const [logs] = await this.db.query(query, params);

      // Parse JSON fields
      const parsedLogs = logs.map(log => ({
        ...log,
        old_values: log.old_values ? JSON.parse(log.old_values) : null,
        new_values: log.new_values ? JSON.parse(log.new_values) : null
      }));

      return parsedLogs;
    } catch (error) {
      console.error('Error in AuditLog.getByRecord:', error);
      throw error;
    }
  }

  /**
   * Get all audit logs with advanced filtering and pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated audit logs
   */
  async getAllLogs(options = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        orderBy = 'created_at',
        order = 'DESC',
        action = null,
        table_name = null,
        user_id = null,
        startDate = null,
        endDate = null,
        search = null
      } = options;

      const offset = (page - 1) * limit;
      const params = [];
      
      let query = `
        SELECT 
          al.*,
          u.username,
          u.email,
          u.full_name
        FROM ${this.tableName} al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE 1=1
      `;

      // Add filters
      if (action) {
        query += ` AND al.action = ?`;
        params.push(action.toUpperCase());
      }

      if (table_name) {
        query += ` AND al.table_name = ?`;
        params.push(table_name);
      }

      if (user_id) {
        query += ` AND al.user_id = ?`;
        params.push(user_id);
      }

      if (startDate) {
        query += ` AND al.created_at >= ?`;
        params.push(startDate);
      }

      if (endDate) {
        query += ` AND al.created_at <= ?`;
        params.push(endDate);
      }

      if (search) {
        query += ` AND (u.username LIKE ? OR u.email LIKE ? OR u.full_name LIKE ? OR al.table_name LIKE ?)`;
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern);
      }

      // Get total count
      const countQuery = query.replace(
        /SELECT[\s\S]*FROM/,
        'SELECT COUNT(*) as total FROM'
      );
      const [countResult] = await this.db.query(countQuery, params);
      const total = countResult[0].total;

      // Add ordering and pagination
      query += ` ORDER BY al.${orderBy} ${order} LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const [logs] = await this.db.query(query, params);

      // Parse JSON fields
      const parsedLogs = logs.map(log => ({
        ...log,
        old_values: log.old_values ? JSON.parse(log.old_values) : null,
        new_values: log.new_values ? JSON.parse(log.new_values) : null
      }));

      return {
        data: parsedLogs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error in AuditLog.getAllLogs:', error);
      throw error;
    }
  }

  /**
   * Get audit log statistics
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} Statistics about audit logs
   */
  async getStatistics(options = {}) {
    try {
      const {
        startDate = null,
        endDate = null,
        user_id = null,
        table_name = null
      } = options;

      const params = [];
      let whereClause = 'WHERE 1=1';

      if (startDate) {
        whereClause += ` AND created_at >= ?`;
        params.push(startDate);
      }

      if (endDate) {
        whereClause += ` AND created_at <= ?`;
        params.push(endDate);
      }

      if (user_id) {
        whereClause += ` AND user_id = ?`;
        params.push(user_id);
      }

      if (table_name) {
        whereClause += ` AND table_name = ?`;
        params.push(table_name);
      }

      const query = `
        SELECT 
          COUNT(*) as total_logs,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(DISTINCT table_name) as affected_tables,
          SUM(CASE WHEN action = 'CREATE' THEN 1 ELSE 0 END) as creates,
          SUM(CASE WHEN action = 'UPDATE' THEN 1 ELSE 0 END) as updates,
          SUM(CASE WHEN action = 'DELETE' THEN 1 ELSE 0 END) as deletes,
          SUM(CASE WHEN action = 'LOGIN' THEN 1 ELSE 0 END) as logins,
          SUM(CASE WHEN action = 'LOGOUT' THEN 1 ELSE 0 END) as logouts
        FROM ${this.tableName}
        ${whereClause}
      `;

      const [result] = await this.db.query(query, params);
      return result[0];
    } catch (error) {
      console.error('Error in AuditLog.getStatistics:', error);
      throw error;
    }
  }
}

module.exports = AuditLog;
