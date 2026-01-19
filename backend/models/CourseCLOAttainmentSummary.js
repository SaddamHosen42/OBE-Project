const BaseModel = require('./BaseModel');

/**
 * CourseCLOAttainmentSummary Model
 * Manages course-level CLO attainment summaries and statistics
 * @extends BaseModel
 */
class CourseCLOAttainmentSummary extends BaseModel {
  /**
   * Constructor for CourseCLOAttainmentSummary model
   */
  constructor() {
    super('course_clo_attainment_summary');
  }

  /**
   * Calculate CLO attainment summary for a course offering
   * Aggregates individual student attainment data to provide course-level statistics
   * @param {number} courseOfferingId - Course offering ID
   * @param {number} cloId - CLO ID (optional, if null calculates for all CLOs)
   * @returns {Promise<Object|Array>} Calculated summary data
   */
  async calculateSummary(courseOfferingId, cloId = null) {
    try {
      if (!courseOfferingId) {
        throw new Error('Course Offering ID is required');
      }

      // Build query to calculate summary statistics
      let query = `
        SELECT 
          clo.id as clo_id,
          clo.CLO_ID,
          clo.CLO_Description,
          clo.target_attainment,
          clo.weight_percentage,
          COUNT(DISTINCT sca.student_id) as total_students,
          SUM(CASE WHEN sca.attainment_status = 'Achieved' THEN 1 ELSE 0 END) as students_achieved,
          SUM(CASE WHEN sca.attainment_status = 'Not Achieved' THEN 1 ELSE 0 END) as students_not_achieved,
          AVG(sca.attainment_percentage) as average_attainment,
          MIN(sca.attainment_percentage) as min_attainment,
          MAX(sca.attainment_percentage) as max_attainment,
          STDDEV(sca.attainment_percentage) as std_deviation,
          SUM(sca.total_marks_obtained) as total_marks_obtained,
          SUM(sca.total_possible_marks) as total_possible_marks,
          CASE 
            WHEN COUNT(DISTINCT sca.student_id) > 0 THEN
              (SUM(CASE WHEN sca.attainment_status = 'Achieved' THEN 1 ELSE 0 END) / 
               COUNT(DISTINCT sca.student_id)) * 100
            ELSE 0
          END as achievement_rate,
          CASE 
            WHEN AVG(sca.attainment_percentage) >= clo.target_attainment THEN 'Target Met'
            WHEN AVG(sca.attainment_percentage) >= (clo.target_attainment * 0.8) THEN 'Near Target'
            ELSE 'Below Target'
          END as overall_status,
          ? as course_offering_id
        FROM course_learning_outcomes clo
        LEFT JOIN student_clo_attainment sca ON clo.id = sca.clo_id 
          AND sca.course_offering_id = ?
        INNER JOIN course_offerings co ON co.id = ?
        WHERE clo.course_id = co.course_id
      `;

      const params = [courseOfferingId, courseOfferingId, courseOfferingId];

      // If specific CLO ID is provided, filter by it
      if (cloId) {
        query += ` AND clo.id = ?`;
        params.push(cloId);
      }

      query += `
        GROUP BY clo.id, clo.CLO_ID, clo.CLO_Description, clo.target_attainment, clo.weight_percentage
        ORDER BY clo.CLO_ID
      `;

      const [rows] = await this.db.execute(query, params);

      // If specific CLO requested, return single object
      if (cloId) {
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
      throw new Error(`Error calculating CLO summary: ${error.message}`);
    }
  }

  /**
   * Save or update CLO attainment summary record
   * @param {Object} summaryData - Summary data
   * @returns {Promise<Object>} Saved summary record
   */
  async saveSummary(summaryData) {
    try {
      const {
        course_offering_id,
        clo_id,
        total_students,
        students_achieved,
        students_not_achieved,
        average_attainment,
        min_attainment,
        max_attainment,
        std_deviation,
        achievement_rate,
        overall_status,
        total_marks_obtained,
        total_possible_marks
      } = summaryData;

      // Check if record exists
      const existingRecord = await this.findWhere({
        course_offering_id,
        clo_id
      });

      const dataToSave = {
        course_offering_id,
        clo_id,
        total_students: parseInt(total_students) || 0,
        students_achieved: parseInt(students_achieved) || 0,
        students_not_achieved: parseInt(students_not_achieved) || 0,
        average_attainment: parseFloat(average_attainment) || 0,
        min_attainment: parseFloat(min_attainment) || 0,
        max_attainment: parseFloat(max_attainment) || 0,
        std_deviation: parseFloat(std_deviation) || 0,
        achievement_rate: parseFloat(achievement_rate) || 0,
        overall_status,
        total_marks_obtained: parseFloat(total_marks_obtained) || 0,
        total_possible_marks: parseFloat(total_possible_marks) || 0,
        calculated_at: new Date()
      };

      if (existingRecord && existingRecord.length > 0) {
        // Update existing record
        await this.update(existingRecord[0].id, dataToSave);
        return await this.findById(existingRecord[0].id);
      } else {
        // Create new record
        const result = await this.create(dataToSave);
        return await this.findById(result);
      }
    } catch (error) {
      throw new Error(`Error saving CLO summary: ${error.message}`);
    }
  }

  /**
   * Get CLO attainment summary for a course offering
   * @param {number} courseOfferingId - Course offering ID
   * @param {Object} options - Query options
   * @param {number} options.cloId - Filter by specific CLO
   * @param {string} options.overallStatus - Filter by status ('Target Met', 'Near Target', 'Below Target')
   * @returns {Promise<Array>} Array of summary records
   */
  async getByCourseOffering(courseOfferingId, options = {}) {
    try {
      if (!courseOfferingId) {
        throw new Error('Course Offering ID is required');
      }

      const { cloId = null, overallStatus = null } = options;

      let query = `
        SELECT 
          ccs.*,
          clo.CLO_ID,
          clo.CLO_Description,
          clo.target_attainment,
          clo.weight_percentage,
          co.course_id,
          c.course_code,
          c.course_title
        FROM ${this.tableName} ccs
        INNER JOIN course_learning_outcomes clo ON ccs.clo_id = clo.id
        INNER JOIN course_offerings co ON ccs.course_offering_id = co.id
        INNER JOIN courses c ON co.course_id = c.id
        WHERE ccs.course_offering_id = ?
      `;

      const params = [courseOfferingId];

      if (cloId) {
        query += ` AND ccs.clo_id = ?`;
        params.push(cloId);
      }

      if (overallStatus) {
        query += ` AND ccs.overall_status = ?`;
        params.push(overallStatus);
      }

      query += ` ORDER BY clo.CLO_ID`;

      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error getting CLO summary: ${error.message}`);
    }
  }

  /**
   * Get overall course attainment summary
   * Aggregates all CLO summaries for a course offering
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise<Object>} Overall course attainment statistics
   */
  async getCourseOverallSummary(courseOfferingId) {
    try {
      if (!courseOfferingId) {
        throw new Error('Course Offering ID is required');
      }

      const query = `
        SELECT 
          COUNT(DISTINCT ccs.clo_id) as total_clos,
          SUM(CASE WHEN ccs.overall_status = 'Target Met' THEN 1 ELSE 0 END) as clos_target_met,
          SUM(CASE WHEN ccs.overall_status = 'Near Target' THEN 1 ELSE 0 END) as clos_near_target,
          SUM(CASE WHEN ccs.overall_status = 'Below Target' THEN 1 ELSE 0 END) as clos_below_target,
          AVG(ccs.average_attainment) as overall_average_attainment,
          AVG(ccs.achievement_rate) as overall_achievement_rate,
          MIN(ccs.average_attainment) as lowest_clo_attainment,
          MAX(ccs.average_attainment) as highest_clo_attainment,
          MAX(ccs.total_students) as total_students,
          co.course_id,
          c.course_code,
          c.course_title,
          ac.session_name,
          ac.session_year
        FROM ${this.tableName} ccs
        INNER JOIN course_offerings co ON ccs.course_offering_id = co.id
        INNER JOIN courses c ON co.course_id = c.id
        INNER JOIN academic_sessions ac ON co.academic_session_id = ac.id
        WHERE ccs.course_offering_id = ?
        GROUP BY co.id, co.course_id, c.course_code, c.course_title, ac.session_name, ac.session_year
      `;

      const [rows] = await this.db.execute(query, [courseOfferingId]);
      
      if (rows.length === 0) {
        return null;
      }

      const summary = rows[0];
      
      // Calculate overall course status
      if (summary.total_clos > 0) {
        const targetMetPercentage = (summary.clos_target_met / summary.total_clos) * 100;
        if (targetMetPercentage >= 80) {
          summary.course_status = 'Excellent';
        } else if (targetMetPercentage >= 60) {
          summary.course_status = 'Good';
        } else if (targetMetPercentage >= 40) {
          summary.course_status = 'Satisfactory';
        } else {
          summary.course_status = 'Needs Improvement';
        }
      } else {
        summary.course_status = 'No Data';
      }

      return summary;
    } catch (error) {
      throw new Error(`Error getting course overall summary: ${error.message}`);
    }
  }

  /**
   * Get CLO attainment trends across multiple course offerings
   * @param {number} courseId - Course ID
   * @param {Object} options - Query options
   * @param {number} options.limit - Limit number of offerings to analyze
   * @returns {Promise<Array>} Array of trend data
   */
  async getCLOTrends(courseId, options = {}) {
    try {
      if (!courseId) {
        throw new Error('Course ID is required');
      }

      const { limit = 5 } = options;

      const query = `
        SELECT 
          ccs.clo_id,
          clo.CLO_ID,
          clo.CLO_Description,
          ccs.course_offering_id,
          ac.session_name,
          ac.session_year,
          ccs.average_attainment,
          ccs.achievement_rate,
          ccs.total_students,
          ccs.overall_status,
          ccs.calculated_at
        FROM ${this.tableName} ccs
        INNER JOIN course_learning_outcomes clo ON ccs.clo_id = clo.id
        INNER JOIN course_offerings co ON ccs.course_offering_id = co.id
        INNER JOIN academic_sessions ac ON co.academic_session_id = ac.id
        WHERE co.course_id = ?
        ORDER BY ac.session_year DESC, ac.session_name DESC, clo.CLO_ID
        LIMIT ?
      `;

      const [rows] = await this.db.execute(query, [courseId, limit]);
      return rows;
    } catch (error) {
      throw new Error(`Error getting CLO trends: ${error.message}`);
    }
  }

  /**
   * Compare CLO attainment across different course offerings
   * @param {Array<number>} courseOfferingIds - Array of course offering IDs
   * @returns {Promise<Array>} Comparison data
   */
  async compareOfferings(courseOfferingIds) {
    try {
      if (!Array.isArray(courseOfferingIds) || courseOfferingIds.length === 0) {
        throw new Error('Course offering IDs array is required');
      }

      const placeholders = courseOfferingIds.map(() => '?').join(',');

      const query = `
        SELECT 
          ccs.course_offering_id,
          co.course_id,
          c.course_code,
          c.course_title,
          ac.session_name,
          ac.session_year,
          clo.CLO_ID,
          clo.CLO_Description,
          ccs.average_attainment,
          ccs.achievement_rate,
          ccs.total_students,
          ccs.overall_status
        FROM ${this.tableName} ccs
        INNER JOIN course_learning_outcomes clo ON ccs.clo_id = clo.id
        INNER JOIN course_offerings co ON ccs.course_offering_id = co.id
        INNER JOIN courses c ON co.course_id = c.id
        INNER JOIN academic_sessions ac ON co.academic_session_id = ac.id
        WHERE ccs.course_offering_id IN (${placeholders})
        ORDER BY clo.CLO_ID, ac.session_year DESC
      `;

      const [rows] = await this.db.execute(query, courseOfferingIds);
      return rows;
    } catch (error) {
      throw new Error(`Error comparing offerings: ${error.message}`);
    }
  }
}

module.exports = CourseCLOAttainmentSummary;
