/**
 * Middleware Index
 * Central export for all middleware functions
 */

const { authenticate, optionalAuthenticate, verifyRefreshToken } = require('./authMiddleware');
const {
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
} = require('./roleMiddleware');

module.exports = {
  // Authentication middleware
  authenticate,
  optionalAuthenticate,
  verifyRefreshToken,
  
  // Authorization middleware
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
