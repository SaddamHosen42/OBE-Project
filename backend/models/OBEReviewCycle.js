const BaseModel = require('./BaseModel');

/**
 * OBE Review Cycle Model
 * Handles OBE review cycles for periodic program evaluation and continuous improvement
 */
class OBEReviewCycle extends BaseModel {
  constructor() {
    super('obe_review_cycles');
  }

  /**
   * Get all review cycles with degree information
   * @returns {Promise<Array>} Array of review cycles with degree details
   */
  async getAllWithDegree() {
    try {
      const query = `
        SELECT 
          rc.id,
          rc.degree_id,
          rc.cycle_name,
          rc.start_date,
          rc.end_date,
          rc.review_type,
          rc.status,
          rc.summary_report,
          rc.created_at,
          rc.updated_at,
          d.degree_name,
          d.degree_code,
          dept.name as department_name,
          dept.code as department_code
        FROM ${this.tableName} rc
        INNER JOIN degrees d ON rc.degree_id = d.id
        INNER JOIN departments dept ON d.department_id = dept.id
        ORDER BY rc.start_date DESC
      `;

      const [rows] = await this.db.execute(query);
      return rows;
    } catch (error) {
      console.error('Error in getAllWithDegree:', error);
      throw error;
    }
  }

  /**
   * Get a review cycle by ID with degree information
   * @param {number} id - Review cycle ID
   * @returns {Promise<Object|null>} Review cycle with degree details or null
   */
  async getByIdWithDegree(id) {
    try {
      const query = `
        SELECT 
          rc.id,
          rc.degree_id,
          rc.cycle_name,
          rc.start_date,
          rc.end_date,
          rc.review_type,
          rc.status,
          rc.summary_report,
          rc.created_at,
          rc.updated_at,
          d.degree_name,
          d.degree_code,
          dept.name as department_name,
          dept.code as department_code
        FROM ${this.tableName} rc
        INNER JOIN degrees d ON rc.degree_id = d.id
        INNER JOIN departments dept ON d.department_id = dept.id
        WHERE rc.id = ?
      `;

      const [rows] = await this.db.execute(query, [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error in getByIdWithDegree:', error);
      throw error;
    }
  }

  /**
   * Get all review cycles for a specific degree
   * @param {number} degreeId - Degree ID
   * @returns {Promise<Array>} Array of review cycles for the degree
   */
  async getByDegreeId(degreeId) {
    try {
      const query = `
        SELECT 
          id,
          degree_id,
          cycle_name,
          start_date,
          end_date,
          review_type,
          status,
          summary_report,
          created_at,
          updated_at
        FROM ${this.tableName}
        WHERE degree_id = ?
        ORDER BY start_date DESC
      `;

      const [rows] = await this.db.execute(query, [degreeId]);
      return rows;
    } catch (error) {
      console.error('Error in getByDegreeId:', error);
      throw error;
    }
  }

  /**
   * Get review cycles by status
   * @param {string} status - Status ('Planned', 'Ongoing', 'Completed')
   * @returns {Promise<Array>} Array of review cycles with the specified status
   */
  async getByStatus(status) {
    try {
      const query = `
        SELECT 
          rc.id,
          rc.degree_id,
          rc.cycle_name,
          rc.start_date,
          rc.end_date,
          rc.review_type,
          rc.status,
          rc.summary_report,
          rc.created_at,
          rc.updated_at,
          d.degree_name,
          d.degree_code
        FROM ${this.tableName} rc
        INNER JOIN degrees d ON rc.degree_id = d.id
        WHERE rc.status = ?
        ORDER BY rc.start_date DESC
      `;

      const [rows] = await this.db.execute(query, [status]);
      return rows;
    } catch (error) {
      console.error('Error in getByStatus:', error);
      throw error;
    }
  }

  /**
   * Get review cycles by review type
   * @param {string} reviewType - Review type ('Annual', 'Biennial', 'Accreditation')
   * @returns {Promise<Array>} Array of review cycles with the specified review type
   */
  async getByReviewType(reviewType) {
    try {
      const query = `
        SELECT 
          rc.id,
          rc.degree_id,
          rc.cycle_name,
          rc.start_date,
          rc.end_date,
          rc.review_type,
          rc.status,
          rc.summary_report,
          rc.created_at,
          rc.updated_at,
          d.degree_name,
          d.degree_code
        FROM ${this.tableName} rc
        INNER JOIN degrees d ON rc.degree_id = d.id
        WHERE rc.review_type = ?
        ORDER BY rc.start_date DESC
      `;

      const [rows] = await this.db.execute(query, [reviewType]);
      return rows;
    } catch (error) {
      console.error('Error in getByReviewType:', error);
      throw error;
    }
  }

  /**
   * Get active/ongoing review cycles
   * @returns {Promise<Array>} Array of ongoing review cycles
   */
  async getOngoing() {
    try {
      const query = `
        SELECT 
          rc.id,
          rc.degree_id,
          rc.cycle_name,
          rc.start_date,
          rc.end_date,
          rc.review_type,
          rc.status,
          rc.summary_report,
          rc.created_at,
          rc.updated_at,
          d.degree_name,
          d.degree_code,
          dept.name as department_name
        FROM ${this.tableName} rc
        INNER JOIN degrees d ON rc.degree_id = d.id
        INNER JOIN departments dept ON d.department_id = dept.id
        WHERE rc.status = 'Ongoing'
        ORDER BY rc.start_date DESC
      `;

      const [rows] = await this.db.execute(query);
      return rows;
    } catch (error) {
      console.error('Error in getOngoing:', error);
      throw error;
    }
  }

  /**
   * Get review cycles within a date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Array of review cycles within the date range
   */
  async getByDateRange(startDate, endDate) {
    try {
      const query = `
        SELECT 
          rc.id,
          rc.degree_id,
          rc.cycle_name,
          rc.start_date,
          rc.end_date,
          rc.review_type,
          rc.status,
          rc.summary_report,
          rc.created_at,
          rc.updated_at,
          d.degree_name,
          d.degree_code
        FROM ${this.tableName} rc
        INNER JOIN degrees d ON rc.degree_id = d.id
        WHERE rc.start_date <= ? AND rc.end_date >= ?
        ORDER BY rc.start_date DESC
      `;

      const [rows] = await this.db.execute(query, [endDate, startDate]);
      return rows;
    } catch (error) {
      console.error('Error in getByDateRange:', error);
      throw error;
    }
  }

  /**
   * Update review cycle status
   * @param {number} id - Review cycle ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated review cycle
   */
  async updateStatus(id, status) {
    try {
      const query = `
        UPDATE ${this.tableName}
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await this.db.execute(query, [status, id]);
      return await this.getByIdWithDegree(id);
    } catch (error) {
      console.error('Error in updateStatus:', error);
      throw error;
    }
  }

  /**
   * Update summary report
   * @param {number} id - Review cycle ID
   * @param {string} summaryReport - Summary report content
   * @returns {Promise<Object>} Updated review cycle
   */
  async updateSummaryReport(id, summaryReport) {
    try {
      const query = `
        UPDATE ${this.tableName}
        SET summary_report = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await this.db.execute(query, [summaryReport, id]);
      return await this.getByIdWithDegree(id);
    } catch (error) {
      console.error('Error in updateSummaryReport:', error);
      throw error;
    }
  }

  /**
   * Validate review cycle data
   * @param {Object} data - Review cycle data
   * @returns {Object} Validation result
   */
  validate(data) {
    const errors = [];

    if (!data.degree_id) {
      errors.push('Degree ID is required');
    }

    if (!data.cycle_name || data.cycle_name.trim() === '') {
      errors.push('Cycle name is required');
    }

    if (!data.start_date) {
      errors.push('Start date is required');
    }

    if (!data.end_date) {
      errors.push('End date is required');
    }

    if (data.start_date && data.end_date && new Date(data.start_date) > new Date(data.end_date)) {
      errors.push('End date must be after start date');
    }

    if (!data.review_type) {
      errors.push('Review type is required');
    } else if (!['Annual', 'Biennial', 'Accreditation'].includes(data.review_type)) {
      errors.push('Review type must be Annual, Biennial, or Accreditation');
    }

    if (data.status && !['Planned', 'Ongoing', 'Completed'].includes(data.status)) {
      errors.push('Status must be Planned, Ongoing, or Completed');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = OBEReviewCycle;
