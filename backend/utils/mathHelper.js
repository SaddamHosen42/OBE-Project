/**
 * Math Helper Utility Functions
 * Mathematical calculations for OBE attainment and grade computations
 */

/**
 * Calculate percentage
 * @param {number} obtained - Obtained marks/value
 * @param {number} total - Total marks/value
 * @param {number} precision - Decimal places (default: 2)
 * @returns {number} Percentage value
 */
const calculatePercentage = (obtained, total, precision = 2) => {
  if (total === 0) return 0;
  const percentage = (obtained / total) * 100;
  return parseFloat(percentage.toFixed(precision));
};

/**
 * Calculate weighted average
 * @param {Array<Object>} items - Array of { value, weight }
 * @returns {number} Weighted average
 */
const calculateWeightedAverage = (items) => {
  if (!items || items.length === 0) return 0;
  
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight === 0) return 0;
  
  const weightedSum = items.reduce((sum, item) => sum + (item.value * item.weight), 0);
  return parseFloat((weightedSum / totalWeight).toFixed(2));
};

/**
 * Calculate average (mean)
 * @param {Array<number>} values - Array of numeric values
 * @param {number} precision - Decimal places (default: 2)
 * @returns {number} Average value
 */
const calculateAverage = (values, precision = 2) => {
  if (!values || values.length === 0) return 0;
  
  const sum = values.reduce((acc, val) => acc + val, 0);
  const avg = sum / values.length;
  return parseFloat(avg.toFixed(precision));
};

/**
 * Calculate median
 * @param {Array<number>} values - Array of numeric values
 * @returns {number} Median value
 */
const calculateMedian = (values) => {
  if (!values || values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
};

/**
 * Calculate standard deviation
 * @param {Array<number>} values - Array of numeric values
 * @param {number} precision - Decimal places (default: 2)
 * @returns {number} Standard deviation
 */
const calculateStandardDeviation = (values, precision = 2) => {
  if (!values || values.length === 0) return 0;
  
  const avg = calculateAverage(values);
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = calculateAverage(squareDiffs);
  const stdDev = Math.sqrt(avgSquareDiff);
  
  return parseFloat(stdDev.toFixed(precision));
};

/**
 * Calculate variance
 * @param {Array<number>} values - Array of numeric values
 * @param {number} precision - Decimal places (default: 2)
 * @returns {number} Variance
 */
const calculateVariance = (values, precision = 2) => {
  if (!values || values.length === 0) return 0;
  
  const avg = calculateAverage(values);
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const variance = calculateAverage(squareDiffs);
  
  return parseFloat(variance.toFixed(precision));
};

/**
 * Calculate GPA from percentage
 * @param {number} percentage - Percentage marks
 * @param {string} scale - GPA scale (default: '4.0')
 * @returns {number} GPA value
 */
const percentageToGPA = (percentage, scale = '4.0') => {
  if (scale === '4.0') {
    if (percentage >= 85) return 4.0;
    if (percentage >= 80) return 3.7;
    if (percentage >= 75) return 3.3;
    if (percentage >= 71) return 3.0;
    if (percentage >= 68) return 2.7;
    if (percentage >= 64) return 2.3;
    if (percentage >= 61) return 2.0;
    if (percentage >= 58) return 1.7;
    if (percentage >= 54) return 1.3;
    if (percentage >= 50) return 1.0;
    return 0.0;
  }
  return 0.0;
};

/**
 * Calculate CGPA from semester GPAs
 * @param {Array<Object>} semesters - Array of { gpa, creditHours }
 * @returns {number} CGPA value
 */
const calculateCGPA = (semesters) => {
  if (!semesters || semesters.length === 0) return 0;
  
  const totalCredits = semesters.reduce((sum, sem) => sum + sem.creditHours, 0);
  if (totalCredits === 0) return 0;
  
  const weightedSum = semesters.reduce((sum, sem) => {
    return sum + (sem.gpa * sem.creditHours);
  }, 0);
  
  return parseFloat((weightedSum / totalCredits).toFixed(2));
};

/**
 * Calculate CLO attainment level
 * @param {number} percentage - Attainment percentage
 * @returns {number} Attainment level (1, 2, or 3)
 */
const calculateCLOAttainmentLevel = (percentage) => {
  if (percentage >= 70) return 3; // High attainment
  if (percentage >= 60) return 2; // Medium attainment
  if (percentage >= 50) return 1; // Low attainment
  return 0; // Not attained
};

/**
 * Calculate PLO attainment from CLOs
 * @param {Array<Object>} cloAttainments - Array of { percentage, weight }
 * @returns {Object} PLO attainment { percentage, level }
 */
const calculatePLOAttainment = (cloAttainments) => {
  if (!cloAttainments || cloAttainments.length === 0) {
    return { percentage: 0, level: 0 };
  }
  
  const percentage = calculateWeightedAverage(
    cloAttainments.map(clo => ({
      value: clo.percentage,
      weight: clo.weight || 1
    }))
  );
  
  const level = calculateCLOAttainmentLevel(percentage);
  
  return { percentage, level };
};

/**
 * Calculate direct attainment (from assessments)
 * @param {Array<Object>} assessments - Array of { marks, totalMarks, weight }
 * @returns {number} Attainment percentage
 */
const calculateDirectAttainment = (assessments) => {
  if (!assessments || assessments.length === 0) return 0;
  
  const weightedScores = assessments.map(assessment => {
    const percentage = calculatePercentage(assessment.marks, assessment.totalMarks);
    return {
      value: percentage,
      weight: assessment.weight || 1
    };
  });
  
  return calculateWeightedAverage(weightedScores);
};

/**
 * Calculate indirect attainment (from surveys/feedback)
 * @param {Array<Object>} responses - Array of { rating, maxRating }
 * @returns {number} Attainment percentage
 */
const calculateIndirectAttainment = (responses) => {
  if (!responses || responses.length === 0) return 0;
  
  const percentages = responses.map(response => 
    calculatePercentage(response.rating, response.maxRating)
  );
  
  return calculateAverage(percentages);
};

/**
 * Calculate overall attainment (direct + indirect)
 * @param {number} directAttainment - Direct attainment percentage
 * @param {number} indirectAttainment - Indirect attainment percentage
 * @param {number} directWeight - Weight for direct attainment (default: 0.7)
 * @returns {number} Overall attainment percentage
 */
const calculateOverallAttainment = (directAttainment, indirectAttainment, directWeight = 0.7) => {
  const indirectWeight = 1 - directWeight;
  const overall = (directAttainment * directWeight) + (indirectAttainment * indirectWeight);
  return parseFloat(overall.toFixed(2));
};

/**
 * Calculate pass percentage
 * @param {number} passed - Number of students passed
 * @param {number} total - Total number of students
 * @returns {number} Pass percentage
 */
const calculatePassPercentage = (passed, total) => {
  return calculatePercentage(passed, total);
};

/**
 * Calculate grade distribution
 * @param {Array<number>} marks - Array of marks
 * @param {Array<Object>} gradeScale - Grade scale definition
 * @returns {Object} Grade distribution
 */
const calculateGradeDistribution = (marks, gradeScale) => {
  const distribution = {};
  
  gradeScale.forEach(grade => {
    distribution[grade.grade] = 0;
  });
  
  marks.forEach(mark => {
    for (const grade of gradeScale) {
      if (mark >= grade.minMarks && mark <= grade.maxMarks) {
        distribution[grade.grade]++;
        break;
      }
    }
  });
  
  return distribution;
};

/**
 * Calculate correlation coefficient between two datasets
 * @param {Array<number>} x - First dataset
 * @param {Array<number>} y - Second dataset
 * @returns {number} Correlation coefficient (-1 to 1)
 */
const calculateCorrelation = (x, y) => {
  if (!x || !y || x.length !== y.length || x.length === 0) return 0;
  
  const n = x.length;
  const avgX = calculateAverage(x);
  const avgY = calculateAverage(y);
  
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  
  for (let i = 0; i < n; i++) {
    const diffX = x[i] - avgX;
    const diffY = y[i] - avgY;
    numerator += diffX * diffY;
    denomX += diffX * diffX;
    denomY += diffY * diffY;
  }
  
  if (denomX === 0 || denomY === 0) return 0;
  
  const correlation = numerator / Math.sqrt(denomX * denomY);
  return parseFloat(correlation.toFixed(3));
};

/**
 * Round to nearest value
 * @param {number} value - Value to round
 * @param {number} precision - Decimal places (default: 2)
 * @returns {number} Rounded value
 */
const roundTo = (value, precision = 2) => {
  return parseFloat(value.toFixed(precision));
};

/**
 * Clamp value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Calculate percentile
 * @param {Array<number>} values - Sorted array of values
 * @param {number} percentile - Percentile to calculate (0-100)
 * @returns {number} Percentile value
 */
const calculatePercentile = (values, percentile) => {
  if (!values || values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  
  if (lower === upper) {
    return sorted[lower];
  }
  
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
};

/**
 * Calculate normalized score (0-1 scale)
 * @param {number} value - Value to normalize
 * @param {number} min - Minimum value in dataset
 * @param {number} max - Maximum value in dataset
 * @returns {number} Normalized value
 */
const normalize = (value, min, max) => {
  if (max === min) return 0;
  return (value - min) / (max - min);
};

/**
 * Calculate sum of array
 * @param {Array<number>} values - Array of numeric values
 * @returns {number} Sum
 */
const sum = (values) => {
  if (!values || values.length === 0) return 0;
  return values.reduce((acc, val) => acc + val, 0);
};

/**
 * Calculate minimum value
 * @param {Array<number>} values - Array of numeric values
 * @returns {number} Minimum value
 */
const min = (values) => {
  if (!values || values.length === 0) return 0;
  return Math.min(...values);
};

/**
 * Calculate maximum value
 * @param {Array<number>} values - Array of numeric values
 * @returns {number} Maximum value
 */
const max = (values) => {
  if (!values || values.length === 0) return 0;
  return Math.max(...values);
};

/**
 * Calculate range (max - min)
 * @param {Array<number>} values - Array of numeric values
 * @returns {number} Range
 */
const range = (values) => {
  if (!values || values.length === 0) return 0;
  return max(values) - min(values);
};

module.exports = {
  calculatePercentage,
  calculateWeightedAverage,
  calculateAverage,
  calculateMedian,
  calculateStandardDeviation,
  calculateVariance,
  percentageToGPA,
  calculateCGPA,
  calculateCLOAttainmentLevel,
  calculatePLOAttainment,
  calculateDirectAttainment,
  calculateIndirectAttainment,
  calculateOverallAttainment,
  calculatePassPercentage,
  calculateGradeDistribution,
  calculateCorrelation,
  roundTo,
  clamp,
  calculatePercentile,
  normalize,
  sum,
  min,
  max,
  range
};
