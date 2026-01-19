const authConfig = require('../config/auth');

/**
 * Role-based Authorization Middleware
 * Checks if the authenticated user has the required role(s) to access a route
 * Must be used after authenticate middleware
 */

/**
 * Check if user has one of the required roles
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 * @returns {Function} Express middleware function
 * 
 * @example
 * // Single role
 * router.get('/admin', authenticate, authorize('admin'), adminController);
 * 
 * // Multiple roles
 * router.get('/grades', authenticate, authorize(['teacher', 'admin']), gradesController);
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required. Please login to access this resource.'
        });
      }

      // Flatten array if roles are passed as nested arrays
      const roles = allowedRoles.flat();

      // Check if user role is in the allowed roles
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not have permission to access this resource.',
          requiredRoles: roles,
          userRole: req.user.role
        });
      }

      // User has required role, proceed
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during authorization'
      });
    }
  };
};

/**
 * Check if user is an admin
 * Convenience middleware for admin-only routes
 */
const isAdmin = (req, res, next) => {
  return authorize(authConfig.roles.ADMIN)(req, res, next);
};

/**
 * Check if user is a teacher
 * Convenience middleware for teacher routes
 */
const isTeacher = (req, res, next) => {
  return authorize(authConfig.roles.TEACHER)(req, res, next);
};

/**
 * Check if user is a student
 * Convenience middleware for student routes
 */
const isStudent = (req, res, next) => {
  return authorize(authConfig.roles.STUDENT)(req, res, next);
};

/**
 * Check if user is a department head
 * Convenience middleware for department head routes
 */
const isDepartmentHead = (req, res, next) => {
  return authorize(authConfig.roles.DEPARTMENT_HEAD)(req, res, next);
};

/**
 * Check if user is a dean
 * Convenience middleware for dean routes
 */
const isDean = (req, res, next) => {
  return authorize(authConfig.roles.DEAN)(req, res, next);
};

/**
 * Check if user is admin or teacher
 * Common combination for academic management routes
 */
const isAdminOrTeacher = (req, res, next) => {
  return authorize(authConfig.roles.ADMIN, authConfig.roles.TEACHER)(req, res, next);
};

/**
 * Check if user is admin or department head
 * Common combination for department management routes
 */
const isAdminOrDepartmentHead = (req, res, next) => {
  return authorize(authConfig.roles.ADMIN, authConfig.roles.DEPARTMENT_HEAD)(req, res, next);
};

/**
 * Check if user is admin, department head, or dean
 * Common combination for administrative routes
 */
const isAdministrative = (req, res, next) => {
  return authorize(
    authConfig.roles.ADMIN,
    authConfig.roles.DEPARTMENT_HEAD,
    authConfig.roles.DEAN
  )(req, res, next);
};

/**
 * Check if user owns the resource or is an admin
 * @param {Function} getResourceOwnerId - Function that extracts owner ID from request
 * @returns {Function} Express middleware function
 * 
 * @example
 * // Check if user owns the profile or is admin
 * router.get('/profile/:userId', 
 *   authenticate, 
 *   isOwnerOrAdmin((req) => req.params.userId),
 *   profileController
 * );
 */
const isOwnerOrAdmin = (getResourceOwnerId) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Admin has access to everything
      if (req.user.role === authConfig.roles.ADMIN) {
        return next();
      }

      // Get the resource owner ID
      const resourceOwnerId = getResourceOwnerId(req);

      // Check if current user is the owner
      if (req.user.id === parseInt(resourceOwnerId)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    } catch (error) {
      console.error('Owner authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during authorization'
      });
    }
  };
};

/**
 * Check if user has any of the specified permissions
 * More granular than role-based authorization
 * @param {string[]} requiredPermissions - Array of required permissions
 * @returns {Function} Express middleware function
 */
const hasPermission = (...requiredPermissions) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Define role-permission mapping
      const rolePermissions = {
        [authConfig.roles.ADMIN]: [
          'manage_users', 'manage_courses', 'manage_departments', 
          'manage_faculty', 'manage_students', 'view_reports',
          'manage_assessments', 'manage_outcomes', 'manage_settings'
        ],
        [authConfig.roles.TEACHER]: [
          'manage_courses', 'manage_assessments', 'view_students',
          'grade_students', 'manage_outcomes', 'view_reports'
        ],
        [authConfig.roles.STUDENT]: [
          'view_courses', 'view_grades', 'view_assessments', 'submit_assignments'
        ],
        [authConfig.roles.DEPARTMENT_HEAD]: [
          'manage_courses', 'manage_faculty', 'view_reports',
          'manage_assessments', 'manage_outcomes', 'view_students'
        ],
        [authConfig.roles.DEAN]: [
          'manage_departments', 'view_reports', 'manage_faculty',
          'view_courses', 'view_students', 'manage_outcomes'
        ]
      };

      const userPermissions = rolePermissions[req.user.role] || [];
      const permissions = requiredPermissions.flat();

      // Check if user has at least one of the required permissions
      const hasRequiredPermission = permissions.some(permission => 
        userPermissions.includes(permission)
      );

      if (!hasRequiredPermission) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not have the required permissions.',
          requiredPermissions: permissions
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during permission check'
      });
    }
  };
};

module.exports = {
  authorize,
  isAdmin,
  isTeacher,
  isStudent,
  isDepartmentHead,
  isDean,
  isAdminOrTeacher,
  isAdminOrDepartmentHead,
  isAdministrative,
  isOwnerOrAdmin,
  hasPermission
};
