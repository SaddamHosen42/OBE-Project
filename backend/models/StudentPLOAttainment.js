const BaseModel = require('./BaseModel');

/**
 * StudentPLOAttainment Model
 * Manages individual student PLO attainment calculations and tracking
 * @extends BaseModel
 */
class StudentPLOAttainment extends BaseModel {
  /**
   * Constructor for StudentPLOAttainment model
   */
  constructor() {
    super('student_plo_attainment');
  }

  /**
   * Calculate PLO attainment for a student in a program
   * Calculates attainment based on CLO attainment mapped to PLOs
   * @param {number} studentId - Student ID
   * @param {number} degreeId - Degree/Program ID
   * @param {number} ploId - PLO ID (optional, if null calculates for all PLOs)
   * @returns {Promise<Object|Array>} Calculated attainment data
   */
  async calculateAttainment(studentId, degreeId, ploId = null) {
    try {
      if (!studentId || !degreeId) {
        throw new Error('Student ID and Degree ID are required');
      }

      // Build query to calculate PLO attainment based on CLO attainment
      let query = `
        SELECT 
          plo.id as plo_id,
          plo.PLO_No,
          plo.PLO_Description,
          plo.target_attainment,
          plo.degree_id,
          COUNT(DISTINCT sca.clo_id) as total_clos_mapped,
          COUNT(DISTINCT CASE WHEN sca.attainment_status = 'Achieved' THEN sca.clo_id END) as clos_achieved,
          AVG(sca.attainment_percentage) as average_clo_attainment,
          SUM(sca.total_marks_obtained) as total_marks_obtained,
          SUM(sca.total_possible_marks) as total_possible_marks,
          CASE 
            WHEN SUM(sca.total_possible_marks) > 0 THEN 
              (SUM(sca.total_marks_obtained) / SUM(sca.total_possible_marks)) * 100
            ELSE 0
          END as attainment_percentage,
          CASE 
            WHEN SUM(sca.total_possible_marks) > 0 AND 
              (SUM(sca.total_marks_obtained) / SUM(sca.total_possible_marks)) * 100 >= plo.target_attainment 
            THEN 'Achieved'
            ELSE 'Not Achieved'
          END as attainment_status,
          ? as student_id,
          ? as degree_id
        FROM program_learning_outcomes plo
        LEFT JOIN plo_clo_mappings pcm ON plo.id = pcm.plo_id
        LEFT JOIN course_learning_outcomes clo ON pcm.clo_id = clo.id
        LEFT JOIN student_clo_attainment sca ON clo.id = sca.clo_id AND sca.student_id = ?
        LEFT JOIN course_offerings co ON sca.course_offering_id = co.id
        LEFT JOIN students s ON s.id = ?
        WHERE plo.degree_id = ?
          AND s.id = ?
      `;

      const params = [studentId, degreeId, studentId, studentId, degreeId, studentId];

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
        const result = rows.length > 0 ? rows[0] : null;
        if (result) {
          await this.saveAttainment(result);
        }
        return result;
      }

      // Store calculated attainment in the database
      for (const row of rows) {
        await this.saveAttainment(row);
      }

      return rows;
    } catch (error) {
      throw new Error(`Error calculating PLO attainment: ${error.message}`);
    }
  }

  /**
   * Save or update PLO attainment record
   * @param {Object} attainmentData - Attainment data to save
   * @returns {Promise<Object>} Saved attainment record
   */
  async saveAttainment(attainmentData) {
    try {
      const {
        student_id,
        degree_id,
        plo_id,
        attainment_percentage,
        attainment_status,
        total_marks_obtained,
        total_possible_marks
      } = attainmentData;

      // Check if record already exists
      const [existing] = await this.db.execute(
        `SELECT id FROM ${this.tableName} 
         WHERE student_id = ? AND degree_id = ? AND plo_id = ?`,
        [student_id, degree_id, plo_id]
      );

      if (existing.length > 0) {
        // Update existing record
        const [result] = await this.db.execute(
          `UPDATE ${this.tableName} 
           SET attainment_percentage = ?,
               attainment_status = ?,
               total_marks_obtained = ?,
               total_possible_marks = ?,
               calculated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [
            attainment_percentage,
            attainment_status,
            total_marks_obtained,
            total_possible_marks,
            existing[0].id
          ]
        );

        return { id: existing[0].id, ...attainmentData };
      } else {
        // Insert new record
        const [result] = await this.db.execute(
          `INSERT INTO ${this.tableName} 
           (student_id, degree_id, plo_id, attainment_percentage, attainment_status, 
            total_marks_obtained, total_possible_marks, calculated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [
            student_id,
            degree_id,
            plo_id,
            attainment_percentage,
            attainment_status,
            total_marks_obtained,
            total_possible_marks
          ]
        );

        return { id: result.insertId, ...attainmentData };
      }
    } catch (error) {
      throw new Error(`Error saving PLO attainment: ${error.message}`);
    }
  }

  /**
   * Get PLO attainment records for a student
   * @param {number} studentId - Student ID
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} PLO attainment records
   */
  async getByStudent(studentId, filters = {}) {
    try {
      const { degreeId, ploId, status } = filters;

      let query = `
        SELECT 
          spa.id,
          spa.student_id,
          spa.degree_id,
          spa.plo_id,
          spa.attainment_percentage,
          spa.attainment_status,
          spa.total_marks_obtained,
          spa.total_possible_marks,
          spa.calculated_at,
          plo.PLO_No,
          plo.PLO_Description,
          plo.target_attainment,
          d.degreeName,
          d.degreeLevel
        FROM ${this.tableName} spa
        INNER JOIN program_learning_outcomes plo ON spa.plo_id = plo.id
        INNER JOIN degrees d ON spa.degree_id = d.id
        WHERE spa.student_id = ?
      `;

      const params = [studentId];

      if (degreeId) {
        query += ` AND spa.degree_id = ?`;
        params.push(degreeId);
      }

      if (ploId) {
        query += ` AND spa.plo_id = ?`;
        params.push(ploId);
      }

      if (status) {
        query += ` AND spa.attainment_status = ?`;
        params.push(status);
      }

      query += ` ORDER BY plo.PLO_No`;

      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching student PLO attainment: ${error.message}`);
    }
  }

  /**
   * Calculate PLO attainment for all students in a program
   * @param {number} degreeId - Degree/Program ID
   * @returns {Promise<Array>} Array of calculated attainment data for all students
   */
  async calculateAllStudentsAttainment(degreeId) {
    try {
      if (!degreeId) {
        throw new Error('Degree ID is required');
      }

      // Get all students enrolled in the program
      const [students] = await this.db.execute(
        `SELECT DISTINCT s.id as student_id 
         FROM students s
         WHERE s.degree_id = ?`,
        [degreeId]
      );

      const results = [];

      // Calculate attainment for each student
      for (const student of students) {
        try {
          const attainment = await this.calculateAttainment(student.student_id, degreeId);
          results.push({
            student_id: student.student_id,
            attainment: attainment
          });
        } catch (error) {
          console.error(`Error calculating for student ${student.student_id}:`, error);
          results.push({
            student_id: student.student_id,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Error calculating all students PLO attainment: ${error.message}`);
    }
  }

  /**
   * Get summary statistics for a student's PLO attainment
   * @param {number} studentId - Student ID
   * @param {number} degreeId - Degree ID
   * @returns {Promise<Object>} Summary statistics
   */
  async getStudentSummary(studentId, degreeId) {
    try {
      const [rows] = await this.db.execute(
        `SELECT 
          COUNT(*) as total_plos,
          SUM(CASE WHEN attainment_status = 'Achieved' THEN 1 ELSE 0 END) as plos_achieved,
          SUM(CASE WHEN attainment_status = 'Not Achieved' THEN 1 ELSE 0 END) as plos_not_achieved,
          AVG(attainment_percentage) as average_attainment,
          MIN(attainment_percentage) as min_attainment,
          MAX(attainment_percentage) as max_attainment,
          SUM(total_marks_obtained) as total_marks_obtained,
          SUM(total_possible_marks) as total_possible_marks,
          CASE 
            WHEN COUNT(*) > 0 THEN
              (SUM(CASE WHEN attainment_status = 'Achieved' THEN 1 ELSE 0 END) / COUNT(*)) * 100
            ELSE 0
          END as achievement_rate
         FROM ${this.tableName}
         WHERE student_id = ? AND degree_id = ?`,
        [studentId, degreeId]
      );

      return rows[0];
    } catch (error) {
      throw new Error(`Error fetching student PLO summary: ${error.message}`);
    }
  }

  /**
   * Get PLO attainment breakdown by course for a student
   * @param {number} studentId - Student ID
   * @param {number} degreeId - Degree ID
   * @param {number} ploId - PLO ID
   * @returns {Promise<Array>} Breakdown by course
   */
  async getPLOBreakdownByCourse(studentId, degreeId, ploId) {
    try {
      const [rows] = await this.db.execute(
        `SELECT 
          c.id as course_id,
          c.courseCode,
          c.courseName,
          co.id as course_offering_id,
          co.semester,
          co.session,
          clo.id as clo_id,
          clo.CLO_ID,
          clo.CLO_Description,
          sca.attainment_percentage as clo_attainment,
          sca.attainment_status as clo_status,
          sca.total_marks_obtained,
          sca.total_possible_marks
         FROM program_learning_outcomes plo
         INNER JOIN plo_clo_mappings pcm ON plo.id = pcm.plo_id
         INNER JOIN course_learning_outcomes clo ON pcm.clo_id = clo.id
         INNER JOIN courses c ON clo.course_id = c.id
         LEFT JOIN student_clo_attainment sca ON clo.id = sca.clo_id AND sca.student_id = ?
         LEFT JOIN course_offerings co ON sca.course_offering_id = co.id
         WHERE plo.id = ? AND plo.degree_id = ?
         ORDER BY co.session DESC, co.semester DESC, c.courseCode`,
        [studentId, ploId, degreeId]
      );

      return rows;
    } catch (error) {
      throw new Error(`Error fetching PLO breakdown: ${error.message}`);
    }
  }
}

module.exports = StudentPLOAttainment;
