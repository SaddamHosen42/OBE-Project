/**
 * Validation Utility Functions
 * Common validation functions for the OBE system
 */

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate phone number (Pakistani format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone number
 */
const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  // Supports formats: 03001234567, +923001234567, 0300-1234567
  const phoneRegex = /^(\+92|0)?3[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/[-\s]/g, ''));
};

/**
 * Validate CNIC format (Pakistani National ID)
 * @param {string} cnic - CNIC to validate
 * @returns {boolean} True if valid CNIC
 */
const isValidCNIC = (cnic) => {
  if (!cnic || typeof cnic !== 'string') return false;
  // Format: 12345-1234567-1 or 1234512345671
  const cnicRegex = /^\d{5}-?\d{7}-?\d{1}$/;
  return cnicRegex.test(cnic);
};

/**
 * Validate date format
 * @param {string} date - Date string to validate
 * @returns {boolean} True if valid date
 */
const isValidDate = (date) => {
  if (!date) return false;
  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate);
};

/**
 * Validate date range
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {Object} Validation result { valid, error }
 */
const isValidDateRange = (startDate, endDate) => {
  if (!isValidDate(startDate)) {
    return { valid: false, error: 'Invalid start date' };
  }
  if (!isValidDate(endDate)) {
    return { valid: false, error: 'Invalid end date' };
  }
  if (new Date(startDate) > new Date(endDate)) {
    return { valid: false, error: 'Start date must be before end date' };
  }
  return { valid: true };
};

/**
 * Validate percentage (0-100)
 * @param {number} value - Percentage value
 * @returns {boolean} True if valid percentage
 */
const isValidPercentage = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0 && num <= 100;
};

/**
 * Validate marks/score
 * @param {number} marks - Marks obtained
 * @param {number} maxMarks - Maximum marks
 * @returns {Object} Validation result { valid, error }
 */
const isValidMarks = (marks, maxMarks) => {
  const marksNum = parseFloat(marks);
  const maxMarksNum = parseFloat(maxMarks);
  
  if (isNaN(marksNum)) {
    return { valid: false, error: 'Invalid marks value' };
  }
  if (isNaN(maxMarksNum)) {
    return { valid: false, error: 'Invalid maximum marks value' };
  }
  if (marksNum < 0) {
    return { valid: false, error: 'Marks cannot be negative' };
  }
  if (marksNum > maxMarksNum) {
    return { valid: false, error: 'Marks cannot exceed maximum marks' };
  }
  return { valid: true };
};

/**
 * Validate GPA (0.0 - 4.0)
 * @param {number} gpa - GPA value
 * @returns {boolean} True if valid GPA
 */
const isValidGPA = (gpa) => {
  const num = parseFloat(gpa);
  return !isNaN(num) && num >= 0 && num <= 4.0;
};

/**
 * Validate CGPA (0.0 - 4.0)
 * @param {number} cgpa - CGPA value
 * @returns {boolean} True if valid CGPA
 */
const isValidCGPA = (cgpa) => {
  return isValidGPA(cgpa);
};

/**
 * Validate credit hours
 * @param {number} credits - Credit hours
 * @returns {boolean} True if valid credit hours
 */
const isValidCreditHours = (credits) => {
  const num = parseInt(credits, 10);
  return !isNaN(num) && num > 0 && num <= 12;
};

/**
 * Validate semester number
 * @param {number} semester - Semester number
 * @returns {boolean} True if valid semester
 */
const isValidSemester = (semester) => {
  const num = parseInt(semester, 10);
  return !isNaN(num) && num >= 1 && num <= 12;
};

/**
 * Validate year
 * @param {number} year - Year value
 * @returns {boolean} True if valid year
 */
const isValidYear = (year) => {
  const num = parseInt(year, 10);
  const currentYear = new Date().getFullYear();
  return !isNaN(num) && num >= 2000 && num <= currentYear + 10;
};

/**
 * Validate academic session format (e.g., "2023-2024", "Fall 2023")
 * @param {string} session - Academic session string
 * @returns {boolean} True if valid session format
 */
const isValidAcademicSession = (session) => {
  if (!session || typeof session !== 'string') return false;
  // Supports formats: "2023-2024" or "Fall 2023" or "Spring 2024"
  const yearRangeRegex = /^\d{4}-\d{4}$/;
  const semesterYearRegex = /^(Fall|Spring|Summer)\s\d{4}$/;
  return yearRangeRegex.test(session) || semesterYearRegex.test(session);
};

/**
 * Validate course code format
 * @param {string} code - Course code
 * @returns {boolean} True if valid course code
 */
const isValidCourseCode = (code) => {
  if (!code || typeof code !== 'string') return false;
  // Format: CS-101, ENG-201, MATH-301
  const codeRegex = /^[A-Z]{2,4}-\d{3,4}$/i;
  return codeRegex.test(code.trim());
};

/**
 * Validate roll number format
 * @param {string} rollNo - Roll number
 * @returns {boolean} True if valid roll number
 */
const isValidRollNumber = (rollNo) => {
  if (!rollNo || typeof rollNo !== 'string') return false;
  // Format: 2023-CS-01, F2023-BSCS-001
  const rollRegex = /^[A-Z]?\d{4}-[A-Z]{2,6}-\d{1,4}$/i;
  return rollRegex.test(rollNo.trim());
};

/**
 * Sanitize string input
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
};

/**
 * Validate array of IDs
 * @param {Array} ids - Array of IDs
 * @returns {Object} Validation result { valid, error }
 */
const isValidIdArray = (ids) => {
  if (!Array.isArray(ids)) {
    return { valid: false, error: 'IDs must be an array' };
  }
  if (ids.length === 0) {
    return { valid: false, error: 'IDs array cannot be empty' };
  }
  const allValid = ids.every(id => {
    const num = parseInt(id, 10);
    return !isNaN(num) && num > 0;
  });
  if (!allValid) {
    return { valid: false, error: 'All IDs must be positive integers' };
  }
  return { valid: true };
};

/**
 * Validate required fields
 * @param {Object} data - Data object to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} Validation result { valid, missingFields }
 */
const validateRequiredFields = (data, requiredFields) => {
  const missingFields = [];
  
  requiredFields.forEach(field => {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missingFields.push(field);
    }
  });
  
  return {
    valid: missingFields.length === 0,
    missingFields
  };
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result { valid, errors }
 */
const validatePasswordStrength = (password) => {
  const errors = [];
  
  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Password is required'] };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidCNIC,
  isValidDate,
  isValidDateRange,
  isValidPercentage,
  isValidMarks,
  isValidGPA,
  isValidCGPA,
  isValidCreditHours,
  isValidSemester,
  isValidYear,
  isValidAcademicSession,
  isValidCourseCode,
  isValidRollNumber,
  sanitizeString,
  isValidIdArray,
  validateRequiredFields,
  validatePasswordStrength
};
