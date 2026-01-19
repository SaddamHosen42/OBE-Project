const BaseModel = require('./BaseModel');

/**
 * StudentCLOAttainment Model
 * Manages individual student CLO attainment calculations and tracking
 * @extends BaseModel
 */
class StudentCLOAttainment extends BaseModel {
  /**
   * Constructor for StudentCLOAttainment model
   */
  constructor() {
    super('student_clo_attainment');
  }

  /**
   * Calculate CLO attainment for a student in a course offering
   * Calculates attainment based on question marks mapped to CLOs
   * @param {number} studentId - Student ID
   * @param {number} courseOfferingId - Course offering ID
   * @param {number} cloId - CLO ID (optional, if null calculates for all CLOs)
   * @returns {Promise<Object|Array>} Calculated attainment data
   */
  async calculateAttainment(studentId, courseOfferingId, cloId = null) {
    try {
      if (!studentId || !courseOfferingId) {
        throw new Error('Student ID and Course Offering ID are required');
      }

      // Build query to calculate attainment
      let query = `
        SELECT 
          clo.id as clo_id,
          clo.CLO_ID,
          clo.CLO_Description,
          clo.target_attainment,
          clo.weight_percentage,
          COUNT(DISTINCT q.id) as total_questions,
          SUM(q.marks) as total_possible_marks,
          SUM(COALESCE(sqm.marks_obtained, 0)) as total_marks_obtained,
          CASE 
            WHEN SUM(q.marks) > 0 THEN 
              (SUM(COALESCE(sqm.marks_obtained, 0)) / SUM(q.marks)) * 100
            ELSE 0
          END as attainment_percentage,
          CASE 
            WHEN SUM(q.marks) > 0 AND 
              (SUM(COALESCE(sqm.marks_obtained, 0)) / SUM(q.marks)) * 100 >= clo.target_attainment 
            THEN 'Achieved'
            ELSE 'Not Achieved'
          END as attainment_status,
          ? as student_id,
          ? as course_offering_id
        FROM course_learning_outcomes clo
        LEFT JOIN questions q ON clo.id = q.clo_id
        LEFT JOIN assessment_components ac ON q.assessment_component_id = ac.id
        LEFT JOIN student_question_marks sqm ON q.id = sqm.question_id AND sqm.student_id = ?
        WHERE ac.course_offering_id = ?
      `;

      const params = [studentId, courseOfferingId, studentId, courseOfferingId];

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
        return rows.length > 0 ? rows[0] : null;
      }

      // Store calculated attainment in the database
      for (const row of rows) {
        await this.saveAttainment({
          student_id: studentId,
          course_offering_id: courseOfferingId,
          clo_id: row.clo_id,
          attainment_percentage: row.attainment_percentage,
          attainment_status: row.attainment_status,
          total_marks_obtained: row.total_marks_obtained,
          total_possible_marks: row.total_possible_marks
        });
      }

      return rows;
    } catch (error) {
      throw new Error(`Error calculating CLO attainment: ${error.message}`);
    }
  }

  /**
   * Save or update CLO attainment record
   * @param {Object} attainmentData - Attainment data
   * @returns {Promise<Object>} Saved attainment record
   */
  async saveAttainment(attainmentData) {
    try {
      const {
        student_id,
        course_offering_id,
        clo_id,
        attainment_percentage,
        attainment_status,
        total_marks_obtained,
        total_possible_marks
      } = attainmentData;

      // Check if record exists
      const existingRecord = await this.findWhere({
        student_id,
        course_offering_id,
        clo_id
      });

      const dataToSave = {
        student_id,
        course_offering_id,
        clo_id,
        attainment_percentage: parseFloat(attainment_percentage) || 0,
        attainment_status,
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
      throw new Error(`Error saving CLO attainment: ${error.message}`);
    }
  }

  /**
   * Get CLO attainment records for a specific student
   * @param {number} studentId - Student ID
   * @param {Object} options - Query options
   * @param {number} options.courseOfferingId - Filter by course offering
   * @param {number} options.cloId - Filter by CLO
   * @returns {Promise<Array>} Array of attainment records
   */
  async getByStudent(studentId, options = {}) {
    try {
      if (!studentId) {
        throw new Error('Student ID is required');
      }

      const { courseOfferingId = null, cloId = null } = options;

      let query = `
        SELECT 
          sca.*,
          clo.CLO_ID,
          clo.CLO_Description,
          clo.target_attainment,
          clo.weight_percentage,
          co.course_id,
          c.course_code,
          c.course_title,
          ac.session_name,
          ac.session_year
        FROM ${this.tableName} sca
        INNER JOIN course_learning_outcomes clo ON sca.clo_id = clo.id
        INNER JOIN course_offerings co ON sca.course_offering_id = co.id
        INNER JOIN courses c ON co.course_id = c.id
        INNER JOIN academic_sessions ac ON co.academic_session_id = ac.id
        WHERE sca.student_id = ?
      `;

      const params = [studentId];

      if (courseOfferingId) {
        query += ` AND sca.course_offering_id = ?`;
        params.push(courseOfferingId);
      }

      if (cloId) {
        query += ` AND sca.clo_id = ?`;
        params.push(cloId);
      }

      query += ` ORDER BY ac.session_year DESC, c.course_code, clo.CLO_ID`;

      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error getting student CLO attainment: ${error.message}`);
    }
  }

  /**
   * Get CLO attainment records for all students in a course offering
   * @param {number} courseOfferingId - Course offering ID
   * @param {Object} options - Query options
   * @param {number} options.cloId - Filter by specific CLO
   * @param {string} options.attainmentStatus - Filter by status ('Achieved' or 'Not Achieved')
   * @returns {Promise<Array>} Array of attainment records
   */
  async getByCourseOffering(courseOfferingId, options = {}) {
    try {
      if (!courseOfferingId) {
        throw new Error('Course Offering ID is required');
      }

      const { cloId = null, attainmentStatus = null } = options;

      let query = `
        SELECT 
          sca.*,
          clo.CLO_ID,
          clo.CLO_Description,
          clo.target_attainment,
          clo.weight_percentage,
          s.student_id as student_registration_id,
          s.first_name,
          s.last_name,
          s.email
        FROM ${this.tableName} sca
        INNER JOIN course_learning_outcomes clo ON sca.clo_id = clo.id
        INNER JOIN students s ON sca.student_id = s.id
        WHERE sca.course_offering_id = ?
      `;

      const params = [courseOfferingId];

      if (cloId) {
        query += ` AND sca.clo_id = ?`;
        params.push(cloId);
      }

      if (attainmentStatus) {
        query += ` AND sca.attainment_status = ?`;
        params.push(attainmentStatus);
      }

      query += ` ORDER BY s.student_id, clo.CLO_ID`;

      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error getting course offering CLO attainment: ${error.message}`);
    }
  }

  /**
   * Calculate attainment for all students in a course offering
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise<Object>} Result with success/failure counts
   */
  async calculateAllStudentsAttainment(courseOfferingId) {
    try {
      if (!courseOfferingId) {
        throw new Error('Course Offering ID is required');
      }

      // Get all enrolled students
      const [students] = await this.db.execute(
        `SELECT DISTINCT ce.student_id 
         FROM course_enrollments ce 
         WHERE ce.course_offering_id = ?`,
        [courseOfferingId]
      );

      if (students.length === 0) {
        return {
          success: 0,
          failed: 0,
          message: 'No enrolled students found'
        };
      }

      const results = {
        success: 0,
        failed: 0,
        errors: []
      };

      for (const student of students) {
        try {
          await this.calculateAttainment(student.student_id, courseOfferingId);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            student_id: student.student_id,
            error: error.message
          });
        }
      }

      return {
        ...results,
        message: `Calculated attainment for ${results.success} students, ${results.failed} failed`
      };
    } catch (error) {
      throw new Error(`Error calculating all students attainment: ${error.message}`);
    }
  }

  /**
   * Get attainment summary for a student across all CLOs in a course
   * @param {number} studentId - Student ID
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise<Object>} Summary with overall attainment statistics
   */
  async getStudentSummary(studentId, courseOfferingId) {
    try {
      if (!studentId || !courseOfferingId) {
        throw new Error('Student ID and Course Offering ID are required');
      }

      const query = `
        SELECT 
          COUNT(*) as total_clos,
          SUM(CASE WHEN attainment_status = 'Achieved' THEN 1 ELSE 0 END) as clos_achieved,
          SUM(CASE WHEN attainment_status = 'Not Achieved' THEN 1 ELSE 0 END) as clos_not_achieved,
          AVG(attainment_percentage) as average_attainment,
          MIN(attainment_percentage) as min_attainment,
          MAX(attainment_percentage) as max_attainment,
          SUM(total_marks_obtained) as total_marks_obtained,
          SUM(total_possible_marks) as total_possible_marks
        FROM ${this.tableName}
        WHERE student_id = ? AND course_offering_id = ?
      `;

      const [rows] = await this.db.execute(query, [studentId, courseOfferingId]);
      
      if (rows.length === 0) {
        return null;
      }

      const summary = rows[0];
      summary.achievement_rate = summary.total_clos > 0 
        ? (summary.clos_achieved / summary.total_clos) * 100 
        : 0;

      return summary;
    } catch (error) {
      throw new Error(`Error getting student summary: ${error.message}`);
    }
  }
}

module.exports = StudentCLOAttainment;
