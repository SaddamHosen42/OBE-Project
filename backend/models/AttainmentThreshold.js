const BaseModel = require('./BaseModel');

/**
 * AttainmentThreshold Model
 * Manages attainment threshold configurations for degrees
 * Defines threshold levels for CLO/PLO/PEO attainment evaluation
 */
class AttainmentThreshold extends BaseModel {
  constructor() {
    super('attainment_thresholds');
  }

  /**
   * Get all attainment thresholds for a specific degree
   * @param {number} degreeId - Degree ID
   * @param {string} thresholdType - Optional filter by type (CLO/PLO/PEO)
   * @returns {Promise<Array>} Array of threshold objects
   */
  async getByDegree(degreeId, thresholdType = null) {
    try {
      let query = `
        SELECT 
          at.id,
          at.degree_id,
          at.threshold_type,
          at.level_name,
          at.min_percentage,
          at.max_percentage,
          at.is_attained,
          at.created_at,
          at.updated_at,
          d.name as degree_name,
          d.credit_hours,
          d.duration_years
        FROM ${this.tableName} at
        INNER JOIN degrees d ON at.degree_id = d.id
        WHERE at.degree_id = ?
      `;

      const params = [degreeId];

      if (thresholdType) {
        query += ` AND at.threshold_type = ?`;
        params.push(thresholdType);
      }

      query += ` ORDER BY at.threshold_type ASC, at.min_percentage DESC`;

      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error in getByDegree:', error);
      throw error;
    }
  }

  /**
   * Get all thresholds of a specific type across all degrees
   * @param {string} thresholdType - Type (CLO/PLO/PEO)
   * @returns {Promise<Array>} Array of threshold objects
   */
  async getByType(thresholdType) {
    try {
      const query = `
        SELECT 
          at.id,
          at.degree_id,
          at.threshold_type,
          at.level_name,
          at.min_percentage,
          at.max_percentage,
          at.is_attained,
          at.created_at,
          at.updated_at,
          d.name as degree_name,
          d.credit_hours,
          d.duration_years
        FROM ${this.tableName} at
        INNER JOIN degrees d ON at.degree_id = d.id
        WHERE at.threshold_type = ?
        ORDER BY d.name ASC, at.min_percentage DESC
      `;

      const [rows] = await this.db.execute(query, [thresholdType]);
      return rows;
    } catch (error) {
      console.error('Error in getByType:', error);
      throw error;
    }
  }

  /**
   * Get a specific threshold by degree, type, and level name
   * @param {number} degreeId - Degree ID
   * @param {string} thresholdType - Type (CLO/PLO/PEO)
   * @param {string} levelName - Level name (e.g., "Exceeded", "Met", etc.)
   * @returns {Promise<Object|null>} Threshold object or null
   */
  async getByDegreeTypeAndLevel(degreeId, thresholdType, levelName) {
    try {
      const query = `
        SELECT 
          at.*,
          d.name as degree_name
        FROM ${this.tableName} at
        INNER JOIN degrees d ON at.degree_id = d.id
        WHERE at.degree_id = ? 
          AND at.threshold_type = ? 
          AND at.level_name = ?
      `;

      const [rows] = await this.db.execute(query, [degreeId, thresholdType, levelName]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error in getByDegreeTypeAndLevel:', error);
      throw error;
    }
  }

  /**
   * Determine the attainment level based on a percentage score
   * @param {number} degreeId - Degree ID
   * @param {string} thresholdType - Type (CLO/PLO/PEO)
   * @param {number} percentage - Percentage score to evaluate
   * @returns {Promise<Object|null>} Matching threshold level or null
   */
  async evaluateAttainment(degreeId, thresholdType, percentage) {
    try {
      const query = `
        SELECT 
          at.*,
          d.name as degree_name
        FROM ${this.tableName} at
        INNER JOIN degrees d ON at.degree_id = d.id
        WHERE at.degree_id = ? 
          AND at.threshold_type = ?
          AND ? >= at.min_percentage 
          AND ? <= at.max_percentage
      `;

      const [rows] = await this.db.execute(query, [degreeId, thresholdType, percentage, percentage]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error in evaluateAttainment:', error);
      throw error;
    }
  }

  /**
   * Get all attainment thresholds with their associated degrees
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of threshold objects with degree info
   */
  async getAllWithDegrees(options = {}) {
    try {
      const {
        thresholdType = null,
        orderBy = 'degree_name',
        order = 'ASC'
      } = options;

      let query = `
        SELECT 
          at.id,
          at.degree_id,
          at.threshold_type,
          at.level_name,
          at.min_percentage,
          at.max_percentage,
          at.is_attained,
          at.created_at,
          at.updated_at,
          d.name as degree_name,
          d.credit_hours,
          d.duration_years,
          dept.name as department_name,
          f.name as faculty_name
        FROM ${this.tableName} at
        INNER JOIN degrees d ON at.degree_id = d.id
        INNER JOIN departments dept ON d.department_id = dept.id
        INNER JOIN faculties f ON d.faculty_id = f.id
      `;

      const params = [];

      if (thresholdType) {
        query += ` WHERE at.threshold_type = ?`;
        params.push(thresholdType);
      }

      query += ` ORDER BY ${orderBy} ${order}`;

      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error in getAllWithDegrees:', error);
      throw error;
    }
  }

  /**
   * Check if a threshold configuration already exists
   * @param {number} degreeId - Degree ID
   * @param {string} thresholdType - Type (CLO/PLO/PEO)
   * @param {string} levelName - Level name
   * @returns {Promise<boolean>} True if exists, false otherwise
   */
  async exists(degreeId, thresholdType, levelName) {
    try {
      const query = `
        SELECT COUNT(*) as count 
        FROM ${this.tableName}
        WHERE degree_id = ? 
          AND threshold_type = ? 
          AND level_name = ?
      `;

      const [rows] = await this.db.execute(query, [degreeId, thresholdType, levelName]);
      return rows[0].count > 0;
    } catch (error) {
      console.error('Error in exists:', error);
      throw error;
    }
  }

  /**
   * Validate percentage ranges don't overlap for same degree and type
   * @param {number} degreeId - Degree ID
   * @param {string} thresholdType - Type (CLO/PLO/PEO)
   * @param {number} minPercentage - Minimum percentage
   * @param {number} maxPercentage - Maximum percentage
   * @param {number} excludeId - Optional ID to exclude from check (for updates)
   * @returns {Promise<boolean>} True if valid (no overlap), false otherwise
   */
  async validateNoOverlap(degreeId, thresholdType, minPercentage, maxPercentage, excludeId = null) {
    try {
      let query = `
        SELECT COUNT(*) as count 
        FROM ${this.tableName}
        WHERE degree_id = ? 
          AND threshold_type = ?
          AND (
            (? BETWEEN min_percentage AND max_percentage)
            OR (? BETWEEN min_percentage AND max_percentage)
            OR (min_percentage BETWEEN ? AND ?)
            OR (max_percentage BETWEEN ? AND ?)
          )
      `;

      const params = [
        degreeId, 
        thresholdType, 
        minPercentage, 
        maxPercentage,
        minPercentage,
        maxPercentage,
        minPercentage,
        maxPercentage
      ];

      if (excludeId) {
        query += ` AND id != ?`;
        params.push(excludeId);
      }

      const [rows] = await this.db.execute(query, params);
      return rows[0].count === 0;
    } catch (error) {
      console.error('Error in validateNoOverlap:', error);
      throw error;
    }
  }

  /**
   * Delete all thresholds for a specific degree
   * @param {number} degreeId - Degree ID
   * @returns {Promise<Object>} Result with affected rows count
   */
  async deleteByDegree(degreeId) {
    try {
      const query = `DELETE FROM ${this.tableName} WHERE degree_id = ?`;
      const [result] = await this.db.execute(query, [degreeId]);
      return {
        success: true,
        affectedRows: result.affectedRows
      };
    } catch (error) {
      console.error('Error in deleteByDegree:', error);
      throw error;
    }
  }
}

module.exports = AttainmentThreshold;
