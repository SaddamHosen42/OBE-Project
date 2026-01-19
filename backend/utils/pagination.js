/**
 * Pagination Utility Functions
 * Provides standardized pagination for database queries and API responses
 */

/**
 * Calculate pagination parameters
 * @param {number} page - Current page number (1-based)
 * @param {number} limit - Items per page
 * @returns {Object} Pagination parameters { offset, limit }
 */
const getPaginationParams = (page = 1, limit = 10) => {
  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);
  
  const validPage = parsedPage > 0 ? parsedPage : 1;
  const validLimit = parsedLimit > 0 && parsedLimit <= 100 ? parsedLimit : 10;
  
  const offset = (validPage - 1) * validLimit;
  
  return {
    offset,
    limit: validLimit,
    page: validPage
  };
};

/**
 * Create pagination metadata
 * @param {number} total - Total number of items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
const createPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    currentPage: parseInt(page, 10),
    perPage: parseInt(limit, 10),
    totalItems: parseInt(total, 10),
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    previousPage: page > 1 ? page - 1 : null
  };
};

/**
 * Create paginated response
 * @param {Array} data - Array of items for current page
 * @param {number} total - Total number of items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} Paginated response
 */
const createPaginatedResponse = (data, total, page, limit) => {
  return {
    data,
    pagination: createPaginationMeta(total, page, limit)
  };
};

/**
 * Get SQL LIMIT and OFFSET clause
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {string} SQL LIMIT OFFSET clause
 */
const getSQLPaginationClause = (page = 1, limit = 10) => {
  const { offset, limit: validLimit } = getPaginationParams(page, limit);
  return `LIMIT ${validLimit} OFFSET ${offset}`;
};

/**
 * Extract pagination parameters from request query
 * @param {Object} query - Express request query object
 * @returns {Object} Pagination parameters
 */
const extractPaginationFromQuery = (query) => {
  const page = query.page || 1;
  const limit = query.limit || query.perPage || 10;
  
  return getPaginationParams(page, limit);
};

/**
 * Validate pagination parameters
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Validation result { valid, errors }
 */
const validatePagination = (page, limit) => {
  const errors = [];
  
  if (page && (isNaN(page) || page < 1)) {
    errors.push('Page must be a positive integer');
  }
  
  if (limit && (isNaN(limit) || limit < 1)) {
    errors.push('Limit must be a positive integer');
  }
  
  if (limit && limit > 100) {
    errors.push('Limit cannot exceed 100');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

module.exports = {
  getPaginationParams,
  createPaginationMeta,
  createPaginatedResponse,
  getSQLPaginationClause,
  extractPaginationFromQuery,
  validatePagination
};
