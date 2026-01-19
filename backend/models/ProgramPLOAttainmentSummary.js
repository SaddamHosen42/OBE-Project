const BaseModel = require('./BaseModel');

/**
 * ProgramPLOAttainmentSummary Model
 * Manages program-level PLO attainment summaries and statistics
 * @extends BaseModel
 */
class ProgramPLOAttainmentSummary extends BaseModel {
  /**
   * Constructor for ProgramPLOAttainmentSummary model
   */
  constructor() {
    super('program_plo_attainment_summary');
  }

  /**
   * Calculate PLO attainment summary for a program/degree
   * Aggregates individual student attainment data to provide program-level statistics
   * @param {number} degreeId - Degree/Program ID
   * @param {number} ploId - PLO ID (optional, if null calculates for all PLOs)
   * @returns {Promise<Object|Array>} Calculated summary data
   */
  async calculateSummary(degreeId, ploId = null) {
    try {
      if (!degreeId) {
        throw new Error('Degree ID is required');
      }

      // Build query to calculate summary statistics
      let query = `
        SELECT 
          plo.id as plo_id,
          plo.PLO_No,
          plo.PLO_Description,
          plo.target_attainment,
          plo.degree_id,
          COUNT(DISTINCT spa.student_id) as total_students,
          SUM(CASE WHEN spa.attainment_status = 'Achieved' THEN 1 ELSE 0 END) as students_achieved,
          SUM(CASE WHEN spa.attainment_status = 'Not Achieved' THEN 1 ELSE 0 END) as students_not_achieved,
          AVG(spa.attainment_percentage) as average_attainment,
          MIN(spa.attainment_percentage) as min_attainment,
          MAX(spa.attainment_percentage) as max_attainment,
          STDDEV(spa.attainment_percentage) as std_deviation,
          SUM(spa.total_marks_obtained) as total_marks_obtained,
          SUM(spa.total_possible_marks) as total_possible_marks,
          CASE 
            WHEN COUNT(DISTINCT spa.student_id) > 0 THEN
              (SUM(CASE WHEN spa.attainment_status = 'Achieved' THEN 1 ELSE 0 END) / 
               COUNT(DISTINCT spa.student_id)) * 100
            ELSE 0
          END as achievement_rate,
          CASE 
            WHEN AVG(spa.attainment_percentage) >= plo.target_attainment THEN 'Target Met'
            WHEN AVG(spa.attainment_percentage) >= (plo.target_attainment * 0.8) THEN 'Near Target'
            ELSE 'Below Target'
          END as overall_status,
          ? as degree_id
        FROM program_learning_outcomes plo
        LEFT JOIN student_plo_attainment spa ON plo.id = spa.plo_id 
          AND spa.degree_id = ?
        WHERE plo.degree_id = ?
      `;

      const params = [degreeId, degreeId, degreeId];

      // If specific PLO ID is provided, filter by it
      if (ploId) {
        query += ` AND plo.id = ?`;
        params.push(ploId);
      }

      query += `
        GROUP BY plo.id, plo.PLO_No, plo.PLO_Description, plo.target_attainment, plo.degree_id
        ORDER BY plo.PLO_No
      `;

      const [rows] = await this.db.execute(query, params);

      // If specific PLO requested, return single object
      if (ploId) {
        const summary = rows.length > 0 ? rows[0] : null;
        if (summary) {
          await this.saveSummary(summary);
        }
        return summary;
      }

      // Store calculated summaries in the database
      for (const row of rows) {
        await this.saveSummary(row);
      }

      return rows;
    } catch (error) {
      throw new Error(`Error calculating PLO summary: ${error.message}`);
    }
  }

  /**
   * Save or update PLO attainment summary
   * @param {Object} summaryData - Summary data to save
   * @returns {Promise<Object>} Saved summary record
   */
  async saveSummary(summaryData) {
    try {
      const {
        degree_id,
        plo_id,
        total_students,
        students_achieved,
        students_not_achieved,
        average_attainment,
        min_attainment,
        max_attainment,
        std_deviation,
        total_marks_obtained,
        total_possible_marks,
        achievement_rate,
        overall_status
      } = summaryData;

      // Check if record already exists
      const [existing] = await this.db.execute(
        `SELECT id FROM ${this.tableName} 
         WHERE degree_id = ? AND plo_id = ?`,
        [degree_id, plo_id]
      );

      if (existing.length > 0) {
        // Update existing record
        const [result] = await this.db.execute(
          `UPDATE ${this.tableName} 
           SET total_students = ?,
               students_achieved = ?,
               students_not_achieved = ?,
               average_attainment = ?,
               min_attainment = ?,
               max_attainment = ?,
               std_deviation = ?,
               total_marks_obtained = ?,
               total_possible_marks = ?,
               achievement_rate = ?,
               overall_status = ?,
               calculated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [
            total_students,
            students_achieved,
            students_not_achieved,
            average_attainment,
            min_attainment,
            max_attainment,
            std_deviation,
            total_marks_obtained,
            total_possible_marks,
            achievement_rate,
            overall_status,
            existing[0].id
          ]
        );

        return { id: existing[0].id, ...summaryData };
      } else {
        // Insert new record
        const [result] = await this.db.execute(
          `INSERT INTO ${this.tableName} 
           (degree_id, plo_id, total_students, students_achieved, students_not_achieved,
            average_attainment, min_attainment, max_attainment, std_deviation,
            total_marks_obtained, total_possible_marks, achievement_rate, overall_status,
            calculated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [
            degree_id,
            plo_id,
            total_students,
            students_achieved,
            students_not_achieved,
            average_attainment,
            min_attainment,
            max_attainment,
            std_deviation,
            total_marks_obtained,
            total_possible_marks,
            achievement_rate,
            overall_status
          ]
        );

        return { id: result.insertId, ...summaryData };
      }
    } catch (error) {
      throw new Error(`Error saving PLO summary: ${error.message}`);
    }
  }

  /**
   * Get PLO attainment summary for a program
   * @param {number} degreeId - Degree ID
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} PLO attainment summaries
   */
  async getByDegree(degreeId, filters = {}) {
    try {
      const { ploId, status } = filters;

      let query = `
        SELECT 
          pps.id,
          pps.degree_id,
          pps.plo_id,
          pps.total_students,
          pps.students_achieved,
          pps.students_not_achieved,
          pps.average_attainment,
          pps.min_attainment,
          pps.max_attainment,
          pps.std_deviation,
          pps.total_marks_obtained,
          pps.total_possible_marks,
          pps.achievement_rate,
          pps.overall_status,
          pps.calculated_at,
          plo.PLO_No,
          plo.PLO_Description,
          plo.target_attainment,
          d.degreeName,
          d.degreeLevel
        FROM ${this.tableName} pps
        INNER JOIN program_learning_outcomes plo ON pps.plo_id = plo.id
        INNER JOIN degrees d ON pps.degree_id = d.id
        WHERE pps.degree_id = ?
      `;

      const params = [degreeId];

      if (ploId) {
        query += ` AND pps.plo_id = ?`;
        params.push(ploId);
      }

      if (status) {
        query += ` AND pps.overall_status = ?`;
        params.push(status);
      }

      query += ` ORDER BY plo.PLO_No`;

      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching program PLO summary: ${error.message}`);
    }
  }

  /**
   * Get overall program attainment statistics
   * @param {number} degreeId - Degree ID
   * @returns {Promise<Object>} Overall program statistics
   */
  async getProgramOverallStats(degreeId) {
    try {
      const [rows] = await this.db.execute(
        `SELECT 
          COUNT(*) as total_plos,
          SUM(CASE WHEN overall_status = 'Target Met' THEN 1 ELSE 0 END) as plos_target_met,
          SUM(CASE WHEN overall_status = 'Near Target' THEN 1 ELSE 0 END) as plos_near_target,
          SUM(CASE WHEN overall_status = 'Below Target' THEN 1 ELSE 0 END) as plos_below_target,
          AVG(average_attainment) as overall_average_attainment,
          AVG(achievement_rate) as overall_achievement_rate,
          SUM(total_students) / COUNT(*) as average_students_per_plo,
          CASE 
            WHEN COUNT(*) > 0 THEN
              (SUM(CASE WHEN overall_status = 'Target Met' THEN 1 ELSE 0 END) / COUNT(*)) * 100
            ELSE 0
          END as plo_success_rate
         FROM ${this.tableName}
         WHERE degree_id = ?`,
        [degreeId]
      );

      return rows[0];
    } catch (error) {
      throw new Error(`Error fetching program overall stats: ${error.message}`);
    }
  }

  /**
   * Get PLO attainment trends over multiple academic sessions
   * @param {number} degreeId - Degree ID
   * @param {number} ploId - PLO ID (optional)
   * @param {number} limit - Number of sessions to include (default 5)
   * @returns {Promise<Array>} Trend data
   */
  async getTrends(degreeId, ploId = null, limit = 5) {
    try {
      let query = `
        SELECT 
          pps.plo_id,
          plo.PLO_No,
          plo.PLO_Description,
          DATE_FORMAT(pps.calculated_at, '%Y-%m') as period,
          pps.average_attainment,
          pps.achievement_rate,
          pps.total_students,
          pps.overall_status
        FROM ${this.tableName} pps
        INNER JOIN program_learning_outcomes plo ON pps.plo_id = plo.id
        WHERE pps.degree_id = ?
      `;

      const params = [degreeId];

      if (ploId) {
        query += ` AND pps.plo_id = ?`;
        params.push(ploId);
      }

      query += `
        ORDER BY pps.calculated_at DESC, plo.PLO_No
        LIMIT ?
      `;

      params.push(limit);

      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching PLO trends: ${error.message}`);
    }
  }

  /**
   * Compare PLO attainment across multiple programs/degrees
   * @param {Array} degreeIds - Array of degree IDs to compare
   * @returns {Promise<Array>} Comparison data
   */
  async comparePrograms(degreeIds) {
    try {
      if (!Array.isArray(degreeIds) || degreeIds.length === 0) {
        throw new Error('Degree IDs array is required');
      }

      const placeholders = degreeIds.map(() => '?').join(',');

      const query = `
        SELECT 
          d.id as degree_id,
          d.degreeName,
          d.degreeLevel,
          plo.PLO_No,
          plo.PLO_Description,
          pps.average_attainment,
          pps.achievement_rate,
          pps.total_students,
          pps.overall_status
        FROM ${this.tableName} pps
        INNER JOIN program_learning_outcomes plo ON pps.plo_id = plo.id
        INNER JOIN degrees d ON pps.degree_id = d.id
        WHERE pps.degree_id IN (${placeholders})
        ORDER BY plo.PLO_No, d.degreeName
      `;

      const [rows] = await this.db.execute(query, degreeIds);
      return rows;
    } catch (error) {
      throw new Error(`Error comparing programs: ${error.message}`);
    }
  }

  /**
   * Get student distribution by attainment level for a PLO
   * @param {number} degreeId - Degree ID
   * @param {number} ploId - PLO ID
   * @returns {Promise<Object>} Distribution data
   */
  async getStudentDistribution(degreeId, ploId) {
    try {
      const [rows] = await this.db.execute(
        `SELECT 
          CASE 
            WHEN spa.attainment_percentage >= 90 THEN '90-100%'
            WHEN spa.attainment_percentage >= 80 THEN '80-89%'
            WHEN spa.attainment_percentage >= 70 THEN '70-79%'
            WHEN spa.attainment_percentage >= 60 THEN '60-69%'
            WHEN spa.attainment_percentage >= 50 THEN '50-59%'
            ELSE 'Below 50%'
          END as attainment_range,
          COUNT(*) as student_count,
          ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM student_plo_attainment WHERE degree_id = ? AND plo_id = ?)), 2) as percentage
         FROM student_plo_attainment spa
         WHERE spa.degree_id = ? AND spa.plo_id = ?
         GROUP BY attainment_range
         ORDER BY attainment_range DESC`,
        [degreeId, ploId, degreeId, ploId]
      );

      return rows;
    } catch (error) {
      throw new Error(`Error fetching student distribution: ${error.message}`);
    }
  }
}

module.exports = ProgramPLOAttainmentSummary;
