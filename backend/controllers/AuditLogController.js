const AuditLog = require('../models/AuditLog');

/**
 * Audit Log Controller
 * Handles retrieval and analysis of audit logs
 */
const AuditLogController = {
  /**
   * Get all audit logs with filtering and pagination
   * @route GET /api/audit-logs
   * @access Private (Admin only)
   */
  getLogs: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 50,
        orderBy = 'created_at',
        order = 'DESC',
        action,
        table_name,
        user_id,
        startDate,
        endDate,
        search
      } = req.query;

      const auditLogModel = new AuditLog();

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        orderBy,
        order: order.toUpperCase(),
        action: action?.toUpperCase(),
        table_name,
        user_id: user_id ? parseInt(user_id) : null,
        startDate,
        endDate,
        search
      };

      const result = await auditLogModel.getAllLogs(options);

      res.status(200).json({
        success: true,
        message: 'Audit logs retrieved successfully',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error in AuditLogController.getLogs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve audit logs',
        error: error.message
      });
    }
  },

  /**
   * Get audit logs by user ID
   * @route GET /api/audit-logs/user/:userId
   * @access Private (Admin or own logs)
   */
  getLogsByUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const {
        page = 1,
        limit = 50,
        orderBy = 'created_at',
        order = 'DESC',
        action,
        table_name,
        startDate,
        endDate
      } = req.query;

      // Check authorization: users can only view their own logs unless they're admin
      if (req.user.role !== 'admin' && req.user.id !== parseInt(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own audit logs.'
        });
      }

      const auditLogModel = new AuditLog();

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        orderBy,
        order: order.toUpperCase(),
        action: action?.toUpperCase(),
        table_name,
        startDate,
        endDate
      };

      const result = await auditLogModel.getByUser(parseInt(userId), options);

      res.status(200).json({
        success: true,
        message: 'User audit logs retrieved successfully',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error in AuditLogController.getLogsByUser:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user audit logs',
        error: error.message
      });
    }
  },

  /**
   * Get audit logs by table name
   * @route GET /api/audit-logs/table/:tableName
   * @access Private (Admin only)
   */
  getLogsByTable: async (req, res) => {
    try {
      const { tableName } = req.params;
      const {
        page = 1,
        limit = 50,
        orderBy = 'created_at',
        order = 'DESC',
        action,
        record_id,
        user_id,
        startDate,
        endDate
      } = req.query;

      const auditLogModel = new AuditLog();

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        orderBy,
        order: order.toUpperCase(),
        action: action?.toUpperCase(),
        record_id: record_id ? parseInt(record_id) : null,
        user_id: user_id ? parseInt(user_id) : null,
        startDate,
        endDate
      };

      const result = await auditLogModel.getByTable(tableName, options);

      res.status(200).json({
        success: true,
        message: `Audit logs for table '${tableName}' retrieved successfully`,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error in AuditLogController.getLogsByTable:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve table audit logs',
        error: error.message
      });
    }
  },

  /**
   * Get audit logs for a specific record
   * @route GET /api/audit-logs/record/:tableName/:recordId
   * @access Private (Admin or authorized users)
   */
  getLogsByRecord: async (req, res) => {
    try {
      const { tableName, recordId } = req.params;
      const {
        orderBy = 'created_at',
        order = 'ASC',
        action
      } = req.query;

      const auditLogModel = new AuditLog();

      const options = {
        orderBy,
        order: order.toUpperCase(),
        action: action?.toUpperCase()
      };

      const logs = await auditLogModel.getByRecord(tableName, parseInt(recordId), options);

      res.status(200).json({
        success: true,
        message: `Audit history for ${tableName} record ${recordId} retrieved successfully`,
        data: logs
      });
    } catch (error) {
      console.error('Error in AuditLogController.getLogsByRecord:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve record audit logs',
        error: error.message
      });
    }
  },

  /**
   * Get audit log statistics
   * @route GET /api/audit-logs/statistics
   * @access Private (Admin only)
   */
  getStatistics: async (req, res) => {
    try {
      const {
        startDate,
        endDate,
        user_id,
        table_name
      } = req.query;

      const auditLogModel = new AuditLog();

      const options = {
        startDate,
        endDate,
        user_id: user_id ? parseInt(user_id) : null,
        table_name
      };

      const statistics = await auditLogModel.getStatistics(options);

      res.status(200).json({
        success: true,
        message: 'Audit log statistics retrieved successfully',
        data: statistics
      });
    } catch (error) {
      console.error('Error in AuditLogController.getStatistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve audit log statistics',
        error: error.message
      });
    }
  },

  /**
   * Get recent audit activities (last 24 hours by default)
   * @route GET /api/audit-logs/recent
   * @access Private (Admin only)
   */
  getRecentActivity: async (req, res) => {
    try {
      const {
        hours = 24,
        limit = 100,
        action,
        table_name,
        user_id
      } = req.query;

      const auditLogModel = new AuditLog();

      // Calculate start date
      const startDate = new Date();
      startDate.setHours(startDate.getHours() - parseInt(hours));

      const options = {
        page: 1,
        limit: parseInt(limit),
        orderBy: 'created_at',
        order: 'DESC',
        action: action?.toUpperCase(),
        table_name,
        user_id: user_id ? parseInt(user_id) : null,
        startDate: startDate.toISOString().slice(0, 19).replace('T', ' ')
      };

      const result = await auditLogModel.getAllLogs(options);

      res.status(200).json({
        success: true,
        message: `Recent audit activity (last ${hours} hours) retrieved successfully`,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error in AuditLogController.getRecentActivity:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve recent audit activity',
        error: error.message
      });
    }
  },

  /**
   * Get audit log entry by ID
   * @route GET /api/audit-logs/:id
   * @access Private (Admin only)
   */
  getLogById: async (req, res) => {
    try {
      const { id } = req.params;

      const auditLogModel = new AuditLog();
      const log = await auditLogModel.findById(parseInt(id));

      if (!log) {
        return res.status(404).json({
          success: false,
          message: 'Audit log entry not found'
        });
      }

      // Parse JSON fields
      const parsedLog = {
        ...log,
        old_values: log.old_values ? JSON.parse(log.old_values) : null,
        new_values: log.new_values ? JSON.parse(log.new_values) : null
      };

      res.status(200).json({
        success: true,
        message: 'Audit log entry retrieved successfully',
        data: parsedLog
      });
    } catch (error) {
      console.error('Error in AuditLogController.getLogById:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve audit log entry',
        error: error.message
      });
    }
  }
};

module.exports = AuditLogController;
