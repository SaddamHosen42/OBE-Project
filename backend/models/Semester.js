const BaseModel = require('./BaseModel');

/**
 * Semester Model for managing semester information within academic sessions
 * Handles semester CRUD operations and relationships with academic sessions
 */
class Semester extends BaseModel {
  constructor() {
    super('semesters');
  }

  /**
   * Get all semesters for a specific academic session
   * @param {number} sessionId - The academic session ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of semesters belonging to the session
   */
  async getBySession(sessionId, options = {}) {
    try {
      const {
        orderBy = 'semester_number',
        order = 'ASC',
        includeSession = false
      } = options;

      let query = `
        SELECT 
          sem.id,
          sem.academic_session_id,
          sem.name,
          sem.semester_number,
          sem.start_date,
          sem.end_date,
          sem.is_active,
          sem.created_at,
          sem.updated_at
      `;

      if (includeSession) {
        query += `,
          acs.session_name,
          acs.start_date as session_start_date,
          acs.end_date as session_end_date,
          acs.is_active as session_is_active
        `;
      }

      query += `
        FROM ${this.tableName} sem
      `;

      if (includeSession) {
        query += `
          LEFT JOIN academic_sessions acs ON sem.academic_session_id = acs.id
        `;
      }

      query += `
        WHERE sem.academic_session_id = ?
        ORDER BY sem.${orderBy} ${order}
      `;

      const [rows] = await this.db.execute(query, [sessionId]);
      return rows;
    } catch (error) {
      console.error('Error in getBySession:', error);
      throw error;
    }
  }

  /**
   * Get the currently active semester
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} Active semester or null if none is active
   */
  async getActive(options = {}) {
    try {
      const { includeSession = false } = options;

      let query = `
        SELECT 
          sem.id,
          sem.academic_session_id,
          sem.name,
          sem.semester_number,
          sem.start_date,
          sem.end_date,
          sem.is_active,
          sem.created_at,
          sem.updated_at
      `;

      if (includeSession) {
        query += `,
          acs.session_name,
          acs.start_date as session_start_date,
          acs.end_date as session_end_date,
          acs.is_active as session_is_active
        `;
      }

      query += `
        FROM ${this.tableName} sem
      `;

      if (includeSession) {
        query += `
          LEFT JOIN academic_sessions acs ON sem.academic_session_id = acs.id
        `;
      }

      query += `
        WHERE sem.is_active = TRUE
        LIMIT 1
      `;

      const [rows] = await this.db.execute(query);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error in getActive:', error);
      throw error;
    }
  }

  /**
   * Get a semester by ID with optional relationships
   * @param {number} id - The semester ID
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} Semester object or null if not found
   */
  async findByIdWithRelations(id, options = {}) {
    try {
      const {
        includeSession = false,
        includeCourseOfferings = false
      } = options;

      let query = `
        SELECT 
          sem.id,
          sem.academic_session_id,
          sem.name,
          sem.semester_number,
          sem.start_date,
          sem.end_date,
          sem.is_active,
          sem.created_at,
          sem.updated_at
      `;

      if (includeSession) {
        query += `,
          acs.session_name,
          acs.start_date as session_start_date,
          acs.end_date as session_end_date,
          acs.is_active as session_is_active
        `;
      }

      query += `
        FROM ${this.tableName} sem
      `;

      if (includeSession) {
        query += `
          LEFT JOIN academic_sessions acs ON sem.academic_session_id = acs.id
        `;
      }

      query += `
        WHERE sem.id = ?
        LIMIT 1
      `;

      const [rows] = await this.db.execute(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }

      const semester = rows[0];

      // If course offerings are requested, fetch them separately
      if (includeCourseOfferings) {
        const courseQuery = `
          SELECT 
            co.id,
            co.course_id,
            co.instructor_id,
            co.section,
            co.created_at,
            co.updated_at,
            c.course_code,
            c.course_title,
            c.credit_hours
          FROM course_offerings co
          LEFT JOIN courses c ON co.course_id = c.id
          WHERE co.semester_id = ?
          ORDER BY c.course_code
        `;

        const [courseRows] = await this.db.execute(courseQuery, [id]);
        semester.course_offerings = courseRows;
      }

      return semester;
    } catch (error) {
      console.error('Error in findByIdWithRelations:', error);
      throw error;
    }
  }

  /**
   * Activate a semester and deactivate all others
   * @param {number} id - The semester ID to activate
   * @returns {Promise<Object>} Result of the operation
   */
  async setActive(id) {
    try {
      // Start transaction
      await this.db.query('START TRANSACTION');

      try {
        // First, verify the semester exists
        const semester = await this.findById(id);
        if (!semester) {
          throw new Error('Semester not found');
        }

        // Deactivate all semesters
        await this.db.execute(`
          UPDATE ${this.tableName}
          SET is_active = FALSE
          WHERE is_active = TRUE
        `);

        // Activate the specified semester
        const [result] = await this.db.execute(`
          UPDATE ${this.tableName}
          SET is_active = TRUE
          WHERE id = ?
        `, [id]);

        // Commit transaction
        await this.db.query('COMMIT');

        return {
          success: true,
          affectedRows: result.affectedRows
        };
      } catch (error) {
        // Rollback on error
        await this.db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error in setActive:', error);
      throw error;
    }
  }

  /**
   * Get count of course offerings in a semester
   * @param {number} semesterId - The semester ID
   * @returns {Promise<number>} Count of course offerings
   */
  async countCourseOfferings(semesterId) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM course_offerings
        WHERE semester_id = ?
      `;

      const [rows] = await this.db.execute(query, [semesterId]);
      return rows[0].count;
    } catch (error) {
      console.error('Error in countCourseOfferings:', error);
      throw error;
    }
  }

  /**
   * Check if a semester overlaps with existing semesters in the same session
   * @param {number} sessionId - The academic session ID
   * @param {Date} startDate - Start date of the semester
   * @param {Date} endDate - End date of the semester
   * @param {number} excludeId - Semester ID to exclude from check (for updates)
   * @returns {Promise<boolean>} True if overlap exists, false otherwise
   */
  async checkDateOverlap(sessionId, startDate, endDate, excludeId = null) {
    try {
      let query = `
        SELECT COUNT(*) as count
        FROM ${this.tableName}
        WHERE academic_session_id = ?
        AND (
          (start_date <= ? AND end_date >= ?) OR
          (start_date <= ? AND end_date >= ?) OR
          (start_date >= ? AND end_date <= ?)
        )
      `;

      const params = [sessionId, startDate, startDate, endDate, endDate, startDate, endDate];

      if (excludeId) {
        query += ` AND id != ?`;
        params.push(excludeId);
      }

      const [rows] = await this.db.execute(query, params);
      return rows[0].count > 0;
    } catch (error) {
      console.error('Error in checkDateOverlap:', error);
      throw error;
    }
  }

  /**
   * Validate semester data before create/update
   * @param {Object} data - Semester data to validate
   * @param {number} excludeId - ID to exclude for update operations
   * @returns {Promise<Object>} Validation result
   */
  async validateSemester(data, excludeId = null) {
    const errors = [];

    try {
      // Check if academic session exists
      const [sessionRows] = await this.db.execute(
        'SELECT id FROM academic_sessions WHERE id = ?',
        [data.academic_session_id]
      );

      if (sessionRows.length === 0) {
        errors.push('Academic session not found');
      }

      // Check date overlap
      if (data.start_date && data.end_date) {
        const hasOverlap = await this.checkDateOverlap(
          data.academic_session_id,
          data.start_date,
          data.end_date,
          excludeId
        );

        if (hasOverlap) {
          errors.push('Semester dates overlap with existing semester in this session');
        }
      }

      // Check for duplicate semester number in same session
      let duplicateQuery = `
        SELECT COUNT(*) as count
        FROM ${this.tableName}
        WHERE academic_session_id = ? AND semester_number = ?
      `;
      const duplicateParams = [data.academic_session_id, data.semester_number];

      if (excludeId) {
        duplicateQuery += ` AND id != ?`;
        duplicateParams.push(excludeId);
      }

      const [duplicateRows] = await this.db.execute(duplicateQuery, duplicateParams);
      if (duplicateRows[0].count > 0) {
        errors.push('Semester number already exists in this academic session');
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      console.error('Error in validateSemester:', error);
      throw error;
    }
  }
}

module.exports = Semester;
