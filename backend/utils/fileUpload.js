/**
 * File Upload Utility Functions
 * Handles file upload validation, storage, and management
 */

const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

/**
 * Allowed file types for different purposes
 */
const FILE_TYPES = {
  image: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSize: 5 * 1024 * 1024 // 5MB
  },
  document: {
    extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ],
    maxSize: 10 * 1024 * 1024 // 10MB
  },
  csv: {
    extensions: ['.csv'],
    mimeTypes: ['text/csv', 'application/vnd.ms-excel'],
    maxSize: 2 * 1024 * 1024 // 2MB
  },
  any: {
    extensions: [],
    mimeTypes: [],
    maxSize: 20 * 1024 * 1024 // 20MB
  }
};

/**
 * Validate file type
 * @param {string} filename - Original filename
 * @param {string} mimetype - File MIME type
 * @param {string} fileType - Expected file type category (image, document, csv, any)
 * @returns {Object} Validation result { valid, error }
 */
const validateFileType = (filename, mimetype, fileType = 'any') => {
  const config = FILE_TYPES[fileType] || FILE_TYPES.any;
  const ext = path.extname(filename).toLowerCase();
  
  // Check extension
  if (config.extensions.length > 0 && !config.extensions.includes(ext)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${config.extensions.join(', ')}`
    };
  }
  
  // Check MIME type
  if (config.mimeTypes.length > 0 && !config.mimeTypes.includes(mimetype)) {
    return {
      valid: false,
      error: `Invalid MIME type. Allowed: ${config.mimeTypes.join(', ')}`
    };
  }
  
  return { valid: true };
};

/**
 * Validate file size
 * @param {number} size - File size in bytes
 * @param {string} fileType - File type category
 * @returns {Object} Validation result { valid, error }
 */
const validateFileSize = (size, fileType = 'any') => {
  const config = FILE_TYPES[fileType] || FILE_TYPES.any;
  
  if (size > config.maxSize) {
    const maxSizeMB = (config.maxSize / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`
    };
  }
  
  return { valid: true };
};

/**
 * Generate unique filename
 * @param {string} originalFilename - Original filename
 * @returns {string} Unique filename
 */
const generateUniqueFilename = (originalFilename) => {
  const ext = path.extname(originalFilename);
  const timestamp = Date.now();
  const randomHash = crypto.randomBytes(8).toString('hex');
  return `${timestamp}-${randomHash}${ext}`;
};

/**
 * Generate safe filename (remove special characters)
 * @param {string} filename - Original filename
 * @returns {string} Safe filename
 */
const generateSafeFilename = (filename) => {
  const ext = path.extname(filename);
  const basename = path.basename(filename, ext);
  const safeName = basename
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `${safeName}${ext}`;
};

/**
 * Get file extension
 * @param {string} filename - Filename
 * @returns {string} File extension (lowercase, with dot)
 */
const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

/**
 * Get file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate file upload
 * @param {Object} file - File object (from multer or similar)
 * @param {string} fileType - Expected file type category
 * @returns {Object} Validation result { valid, errors }
 */
const validateFileUpload = (file, fileType = 'any') => {
  const errors = [];
  
  if (!file) {
    return {
      valid: false,
      errors: ['No file provided']
    };
  }
  
  // Validate file type
  const typeValidation = validateFileType(file.originalname, file.mimetype, fileType);
  if (!typeValidation.valid) {
    errors.push(typeValidation.error);
  }
  
  // Validate file size
  const sizeValidation = validateFileSize(file.size, fileType);
  if (!sizeValidation.valid) {
    errors.push(sizeValidation.error);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Create upload directory if it doesn't exist
 * @param {string} dirPath - Directory path
 * @returns {Promise<void>}
 */
const ensureUploadDirectory = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

/**
 * Delete file
 * @param {string} filePath - Path to file
 * @returns {Promise<Object>} Result { success, error }
 */
const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Check if file exists
 * @param {string} filePath - Path to file
 * @returns {Promise<boolean>} True if file exists
 */
const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get file info
 * @param {string} filePath - Path to file
 * @returns {Promise<Object>} File info { name, size, extension, mimeType }
 */
const getFileInfo = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    const filename = path.basename(filePath);
    const ext = path.extname(filePath);
    
    return {
      name: filename,
      size: stats.size,
      sizeFormatted: formatFileSize(stats.size),
      extension: ext,
      created: stats.birthtime,
      modified: stats.mtime
    };
  } catch (error) {
    throw new Error(`Failed to get file info: ${error.message}`);
  }
};

/**
 * Build file URL
 * @param {string} filename - Filename
 * @param {string} baseUrl - Base URL
 * @returns {string} Full file URL
 */
const buildFileUrl = (filename, baseUrl = '') => {
  return `${baseUrl}/uploads/${filename}`;
};

/**
 * Parse CSV file content
 * @param {string} content - CSV file content
 * @returns {Array<Object>} Parsed CSV data
 */
const parseCSV = (content) => {
  const lines = content.trim().split('\n');
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    data.push(row);
  }
  
  return data;
};

/**
 * Validate bulk upload data
 * @param {Array<Object>} data - Array of data objects
 * @param {Array<string>} requiredFields - Required field names
 * @returns {Object} Validation result { valid, errors, validRecords, invalidRecords }
 */
const validateBulkUploadData = (data, requiredFields) => {
  const validRecords = [];
  const invalidRecords = [];
  
  data.forEach((record, index) => {
    const missingFields = [];
    
    requiredFields.forEach(field => {
      if (!record[field] || record[field] === '') {
        missingFields.push(field);
      }
    });
    
    if (missingFields.length === 0) {
      validRecords.push({ ...record, rowNumber: index + 2 }); // +2 for header and 1-based index
    } else {
      invalidRecords.push({
        rowNumber: index + 2,
        record,
        errors: [`Missing required fields: ${missingFields.join(', ')}`]
      });
    }
  });
  
  return {
    valid: invalidRecords.length === 0,
    totalRecords: data.length,
    validRecords,
    invalidRecords,
    errors: invalidRecords.length > 0 ? ['Some records have validation errors'] : []
  };
};

module.exports = {
  FILE_TYPES,
  validateFileType,
  validateFileSize,
  generateUniqueFilename,
  generateSafeFilename,
  getFileExtension,
  formatFileSize,
  validateFileUpload,
  ensureUploadDirectory,
  deleteFile,
  fileExists,
  getFileInfo,
  buildFileUrl,
  parseCSV,
  validateBulkUploadData
};
