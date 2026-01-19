const AuditLog = require('../models/AuditLog');

/**
 * Audit Middleware
 * Automatically logs CRUD operations for audit trail and compliance
 */

/**
 * Extract IP address from request
 * Handles X-Forwarded-For header for proxied requests
 */
const getIpAddress = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress || 
         req.ip || 
         null;
};

/**
 * Middleware to log audit trail for requests
 * Captures user actions, changes, and metadata
 * 
 * Usage:
 *   - Add to routes: router.post('/endpoint', authenticate, auditLog('table_name', 'CREATE'), controller)
 *   - Or use globally with specific exclusions
 * 
 * @param {string} tableName - Name of the table being affected
 * @param {string} action - Action type (CREATE, UPDATE, DELETE, VIEW, etc.)
 * @param {Object} options - Additional options
 * @param {Function} options.getRecordId - Function to extract record ID from request
 * @param {Function} options.getOldValues - Function to extract old values (for UPDATE/DELETE)
 * @param {Function} options.getNewValues - Function to extract new values (for CREATE/UPDATE)
 */
const auditLog = (tableName, action, options = {}) => {
  return async (req, res, next) => {
    try {
      // Store original res.json to capture response data
      const originalJson = res.json.bind(res);

      // Override res.json to intercept response
      res.json = async function(data) {
        try {
          const auditLogModel = new AuditLog();

          // Extract record ID
          let recordId = null;
          if (options.getRecordId && typeof options.getRecordId === 'function') {
            recordId = options.getRecordId(req, data);
          } else if (data?.data?.id) {
            recordId = data.data.id;
          } else if (req.params?.id) {
            recordId = req.params.id;
          }

          // Extract old values (for UPDATE/DELETE)
          let oldValues = null;
          if (options.getOldValues && typeof options.getOldValues === 'function') {
            oldValues = await options.getOldValues(req, data);
          }

          // Extract new values (for CREATE/UPDATE)
          let newValues = null;
          if (options.getNewValues && typeof options.getNewValues === 'function') {
            newValues = options.getNewValues(req, data);
          } else if (action === 'CREATE' || action === 'UPDATE') {
            newValues = req.body;
          }

          // Create audit log entry
          await auditLogModel.log({
            user_id: req.user?.id || null,
            action: action.toUpperCase(),
            table_name: tableName,
            record_id: recordId,
            old_values: oldValues,
            new_values: newValues,
            ip_address: getIpAddress(req),
            user_agent: req.headers['user-agent'] || null
          });
        } catch (auditError) {
          // Log error but don't fail the request
          console.error('Audit logging error:', auditError);
        }

        // Call original res.json
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Audit middleware error:', error);
      // Continue with request even if audit fails
      next();
    }
  };
};

/**
 * Middleware to log authentication events (LOGIN, LOGOUT)
 * Use this after successful authentication
 * 
 * @param {string} action - Action type (LOGIN or LOGOUT)
 */
const auditAuth = (action) => {
  return async (req, res, next) => {
    try {
      const originalJson = res.json.bind(res);

      res.json = async function(data) {
        try {
          // Only log successful responses
          if (data?.success) {
            const auditLogModel = new AuditLog();

            await auditLogModel.log({
              user_id: req.user?.id || data?.data?.user?.id || null,
              action: action.toUpperCase(),
              table_name: 'users',
              record_id: req.user?.id || data?.data?.user?.id || null,
              old_values: null,
              new_values: action === 'LOGIN' ? { 
                username: req.body?.username || req.user?.username,
                login_time: new Date()
              } : {
                logout_time: new Date()
              },
              ip_address: getIpAddress(req),
              user_agent: req.headers['user-agent'] || null
            });
          }
        } catch (auditError) {
          console.error('Auth audit logging error:', auditError);
        }

        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Auth audit middleware error:', error);
      next();
    }
  };
};

/**
 * Middleware to automatically audit all data-modifying operations
 * Use this globally or on specific router groups
 * 
 * This middleware attempts to automatically determine the table name and action
 * from the route path and HTTP method
 */
const autoAudit = (req, res, next) => {
  try {
    // Skip audit for read operations and non-API routes
    if (req.method === 'GET' || !req.path.startsWith('/api/')) {
      return next();
    }

    // Skip health check and auth routes
    if (req.path.includes('/health') || req.path.includes('/auth/login') || req.path.includes('/auth/logout')) {
      return next();
    }

    // Determine action from HTTP method
    const actionMap = {
      'POST': 'CREATE',
      'PUT': 'UPDATE',
      'PATCH': 'UPDATE',
      'DELETE': 'DELETE'
    };
    const action = actionMap[req.method];

    if (!action) {
      return next();
    }

    // Extract table name from route path
    // Example: /api/students/123 -> students
    const pathParts = req.path.split('/').filter(p => p);
    const tableName = pathParts[1]; // Assuming format: /api/{table_name}/...

    if (!tableName) {
      return next();
    }

    const originalJson = res.json.bind(res);

    res.json = async function(data) {
      try {
        // Only log successful operations
        if (data?.success) {
          const auditLogModel = new AuditLog();

          let recordId = null;
          if (data?.data?.id) {
            recordId = data.data.id;
          } else if (req.params?.id) {
            recordId = req.params.id;
          }

          await auditLogModel.log({
            user_id: req.user?.id || null,
            action: action,
            table_name: tableName,
            record_id: recordId,
            old_values: action === 'DELETE' ? req.body : null,
            new_values: action !== 'DELETE' ? req.body : null,
            ip_address: getIpAddress(req),
            user_agent: req.headers['user-agent'] || null
          });
        }
      } catch (auditError) {
        console.error('Auto audit logging error:', auditError);
      }

      return originalJson(data);
    };

    next();
  } catch (error) {
    console.error('Auto audit middleware error:', error);
    next();
  }
};

/**
 * Helper function to create a custom audit log entry
 * Use this for manual audit logging in controllers
 * 
 * @param {Object} req - Express request object
 * @param {string} tableName - Table name
 * @param {string} action - Action type
 * @param {number} recordId - Record ID
 * @param {Object} oldValues - Old values
 * @param {Object} newValues - New values
 */
const createAuditLog = async (req, tableName, action, recordId = null, oldValues = null, newValues = null) => {
  try {
    const auditLogModel = new AuditLog();

    await auditLogModel.log({
      user_id: req.user?.id || null,
      action: action.toUpperCase(),
      table_name: tableName,
      record_id: recordId,
      old_values: oldValues,
      new_values: newValues,
      ip_address: getIpAddress(req),
      user_agent: req.headers['user-agent'] || null
    });
  } catch (error) {
    console.error('Manual audit logging error:', error);
    // Don't throw error to prevent disrupting the main flow
  }
};

module.exports = {
  auditLog,
  auditAuth,
  autoAudit,
  createAuditLog,
  getIpAddress
};
