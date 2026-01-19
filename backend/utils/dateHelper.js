/**
 * Date Helper Utility Functions
 * Common date manipulation and formatting functions
 */

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type (full, short, time, datetime)
 * @returns {string} Formatted date string
 */
const formatDate = (date, format = 'full') => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const options = {
    full: { year: 'numeric', month: 'long', day: 'numeric' },
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit', second: '2-digit' },
    datetime: { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    }
  };
  
  return d.toLocaleDateString('en-US', options[format] || options.full);
};

/**
 * Format date to ISO string (YYYY-MM-DD)
 * @param {Date|string} date - Date to format
 * @returns {string} ISO date string
 */
const toISODate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  return d.toISOString().split('T')[0];
};

/**
 * Format date to SQL datetime format
 * @param {Date|string} date - Date to format
 * @returns {string} SQL datetime string (YYYY-MM-DD HH:MM:SS)
 */
const toSQLDateTime = (date) => {
  if (!date) return null;
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  
  return d.toISOString().slice(0, 19).replace('T', ' ');
};

/**
 * Get current date in ISO format
 * @returns {string} Current date (YYYY-MM-DD)
 */
const getCurrentDate = () => {
  return toISODate(new Date());
};

/**
 * Get current datetime in SQL format
 * @returns {string} Current datetime (YYYY-MM-DD HH:MM:SS)
 */
const getCurrentDateTime = () => {
  return toSQLDateTime(new Date());
};

/**
 * Add days to a date
 * @param {Date|string} date - Base date
 * @param {number} days - Number of days to add (can be negative)
 * @returns {Date} New date
 */
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

/**
 * Add months to a date
 * @param {Date|string} date - Base date
 * @param {number} months - Number of months to add (can be negative)
 * @returns {Date} New date
 */
const addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

/**
 * Add years to a date
 * @param {Date|string} date - Base date
 * @param {number} years - Number of years to add (can be negative)
 * @returns {Date} New date
 */
const addYears = (date, years) => {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
};

/**
 * Calculate difference in days between two dates
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {number} Difference in days
 */
const daysDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Calculate difference in months between two dates
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {number} Difference in months
 */
const monthsDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
};

/**
 * Calculate difference in years between two dates
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {number} Difference in years
 */
const yearsDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d2.getFullYear() - d1.getFullYear();
};

/**
 * Check if date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the past
 */
const isPastDate = (date) => {
  const d = new Date(date);
  return d < new Date();
};

/**
 * Check if date is in the future
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the future
 */
const isFutureDate = (date) => {
  const d = new Date(date);
  return d > new Date();
};

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today
 */
const isToday = (date) => {
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
};

/**
 * Get start of day
 * @param {Date|string} date - Date
 * @returns {Date} Start of day (00:00:00)
 */
const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get end of day
 * @param {Date|string} date - Date
 * @returns {Date} End of day (23:59:59)
 */
const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Get start of month
 * @param {Date|string} date - Date
 * @returns {Date} Start of month
 */
const startOfMonth = (date) => {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get end of month
 * @param {Date|string} date - Date
 * @returns {Date} End of month
 */
const endOfMonth = (date) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Get academic year from date
 * @param {Date|string} date - Date
 * @returns {string} Academic year (e.g., "2023-2024")
 */
const getAcademicYear = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth();
  
  // Academic year typically starts in August/September
  if (month >= 8) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
};

/**
 * Get semester from date
 * @param {Date|string} date - Date
 * @returns {string} Semester (Fall, Spring, Summer)
 */
const getSemesterFromDate = (date) => {
  const d = new Date(date);
  const month = d.getMonth();
  
  if (month >= 8 && month <= 11) {
    return 'Fall';
  } else if (month >= 0 && month <= 4) {
    return 'Spring';
  } else {
    return 'Summer';
  }
};

/**
 * Get date range for semester
 * @param {string} semester - Semester name (Fall, Spring, Summer)
 * @param {number} year - Year
 * @returns {Object} Date range { startDate, endDate }
 */
const getSemesterDateRange = (semester, year) => {
  let startDate, endDate;
  
  switch (semester.toLowerCase()) {
    case 'fall':
      startDate = new Date(year, 8, 1); // September 1
      endDate = new Date(year, 11, 31); // December 31
      break;
    case 'spring':
      startDate = new Date(year, 0, 1); // January 1
      endDate = new Date(year, 4, 31); // May 31
      break;
    case 'summer':
      startDate = new Date(year, 5, 1); // June 1
      endDate = new Date(year, 7, 31); // August 31
      break;
    default:
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31);
  }
  
  return {
    startDate: toISODate(startDate),
    endDate: toISODate(endDate)
  };
};

/**
 * Parse date from various formats
 * @param {string} dateString - Date string to parse
 * @returns {Date|null} Parsed date or null if invalid
 */
const parseDate = (dateString) => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Get age from date of birth
 * @param {Date|string} dob - Date of birth
 * @returns {number} Age in years
 */
const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 * @param {Date|string} date - Date to compare
 * @returns {string} Relative time string
 */
const getRelativeTime = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} week${Math.floor(diffDay / 7) > 1 ? 's' : ''} ago`;
  if (diffDay < 365) return `${Math.floor(diffDay / 30)} month${Math.floor(diffDay / 30) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDay / 365)} year${Math.floor(diffDay / 365) > 1 ? 's' : ''} ago`;
};

/**
 * Check if two dates are the same day
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {boolean} True if same day
 */
const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.toDateString() === d2.toDateString();
};

/**
 * Get weekday name
 * @param {Date|string} date - Date
 * @returns {string} Weekday name
 */
const getWeekdayName = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { weekday: 'long' });
};

/**
 * Get month name
 * @param {Date|string} date - Date
 * @returns {string} Month name
 */
const getMonthName = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'long' });
};

module.exports = {
  formatDate,
  toISODate,
  toSQLDateTime,
  getCurrentDate,
  getCurrentDateTime,
  addDays,
  addMonths,
  addYears,
  daysDifference,
  monthsDifference,
  yearsDifference,
  isPastDate,
  isFutureDate,
  isToday,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  getAcademicYear,
  getSemesterFromDate,
  getSemesterDateRange,
  parseDate,
  calculateAge,
  getRelativeTime,
  isSameDay,
  getWeekdayName,
  getMonthName
};
