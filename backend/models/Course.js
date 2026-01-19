const BaseModel = require('./BaseModel');

/**
 * Course Model for managing course catalog information
 * Handles course CRUD operations and relationships with departments, degrees, CLOs, and objectives
 */
class Course extends BaseModel {
  constructor() {
    super('courses');
  }

  /**
   * Get all courses for a specific department
   * @param {number} departmentId - The department ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of courses belonging to the department
   */
  async getByDepartment(departmentId, options = {}) {
    try {
      const {
        orderBy = 'courseCode',
        order = 'ASC',
        includeDegree = false,
        includeDepartment = false
      } = options;

      let query = `
        SELECT 
          c.id,
          c.courseCode,
          c.courseTitle,
          c.department_id,
          c.degree_id,
          c.credit,
          c.contactHourPerWeek,
          c.level,
          c.semester,
          c.academicSession,
          c.type,
          c.type_T_S,
          c.totalMarks,
          c.instructor,
          c.prerequisites,
          c.summary,
          c.created_at,
          c.updated_at
      `;

      if (includeDepartment) {
        query += `,
          dept.name as department_name,
          dept.code as department_code
        `;
      }

      if (includeDegree) {
        query += `,
          deg.name as degree_name,
          deg.short_name as degree_short_name,
          deg.level as degree_level
        `;
      }

      query += `
        FROM ${this.tableName} c
      `;

      if (includeDepartment) {
        query += `
          LEFT JOIN departments dept ON c.department_id = dept.id
        `;
      }

      if (includeDegree) {
        query += `
          LEFT JOIN degrees deg ON c.degree_id = deg.id
        `;
      }

      query += `
        WHERE c.department_id = ?
        ORDER BY c.${orderBy} ${order}
      `;

      const [rows] = await this.db.execute(query, [departmentId]);
      return rows;
    } catch (error) {
      console.error('Error in getByDepartment:', error);
      throw error;
    }
  }

  /**
   * Get all courses for a specific degree program
   * @param {number} degreeId - The degree ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of courses belonging to the degree
   */
  async getByDegree(degreeId, options = {}) {
    try {
      const {
        orderBy = 'courseCode',
        order = 'ASC',
        includeDegree = false,
        includeDepartment = false,
        level = null,
        semester = null,
        type = null
      } = options;

      let query = `
        SELECT 
          c.id,
          c.courseCode,
          c.courseTitle,
          c.department_id,
          c.degree_id,
          c.credit,
          c.contactHourPerWeek,
          c.level,
          c.semester,
          c.academicSession,
          c.type,
          c.type_T_S,
          c.totalMarks,
          c.instructor,
          c.prerequisites,
          c.summary,
          c.created_at,
          c.updated_at
      `;

      if (includeDepartment) {
        query += `,
          dept.name as department_name,
          dept.code as department_code
        `;
      }

      if (includeDegree) {
        query += `,
          deg.name as degree_name,
          deg.short_name as degree_short_name,
          deg.level as degree_level
        `;
      }

      query += `
        FROM ${this.tableName} c
      `;

      if (includeDepartment) {
        query += `
          LEFT JOIN departments dept ON c.department_id = dept.id
        `;
      }

      if (includeDegree) {
        query += `
          LEFT JOIN degrees deg ON c.degree_id = deg.id
        `;
      }

      const params = [degreeId];
      const conditions = ['c.degree_id = ?'];

      if (level) {
        conditions.push('c.level = ?');
        params.push(level);
      }

      if (semester) {
        conditions.push('c.semester = ?');
        params.push(semester);
      }

      if (type) {
        conditions.push('c.type = ?');
        params.push(type);
      }

      query += `
        WHERE ${conditions.join(' AND ')}
        ORDER BY c.${orderBy} ${order}
      `;

      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error in getByDegree:', error);
      throw error;
    }
  }

  /**
   * Get a course with its Course Learning Outcomes (CLOs)
   * @param {number} courseId - The course ID
   * @returns {Promise<Object|null>} Course object with CLOs or null if not found
   */
  async getWithCLOs(courseId) {
    try {
      // Get the course first
      const courseQuery = `
        SELECT 
          c.id,
          c.courseCode,
          c.courseTitle,
          c.department_id,
          c.degree_id,
          c.credit,
          c.contactHourPerWeek,
          c.level,
          c.semester,
          c.academicSession,
          c.type,
          c.type_T_S,
          c.totalMarks,
          c.instructor,
          c.prerequisites,
          c.summary,
          c.created_at,
          c.updated_at,
          dept.name as department_name,
          dept.code as department_code,
          deg.name as degree_name,
          deg.short_name as degree_short_name
        FROM ${this.tableName} c
        LEFT JOIN departments dept ON c.department_id = dept.id
        LEFT JOIN degrees deg ON c.degree_id = deg.id
        WHERE c.id = ?
        LIMIT 1
      `;

      const [courseRows] = await this.db.execute(courseQuery, [courseId]);

      if (courseRows.length === 0) {
        return null;
      }

      const course = courseRows[0];

      // Get CLOs for this course
      const cloQuery = `
        SELECT 
          clo.id,
          clo.course_id,
          clo.CLO_ID,
          clo.CLO_Description,
          clo.bloom_taxonomy_level_id,
          clo.weight_percentage,
          clo.target_attainment,
          clo.created_at,
          clo.updated_at,
          btl.level_number as bloom_level_number,
          btl.level_name as bloom_level_name,
          btl.description as bloom_level_description
        FROM course_learning_outcomes clo
        LEFT JOIN bloom_taxonomy_levels btl ON clo.bloom_taxonomy_level_id = btl.id
        WHERE clo.course_id = ?
        ORDER BY clo.CLO_ID
      `;

      const [cloRows] = await this.db.execute(cloQuery, [courseId]);
      course.clos = cloRows;

      return course;
    } catch (error) {
      console.error('Error in getWithCLOs:', error);
      throw error;
    }
  }

  /**
   * Get a course with its Course Objectives (COs)
   * @param {number} courseId - The course ID
   * @returns {Promise<Object|null>} Course object with objectives or null if not found
   */
  async getWithObjectives(courseId) {
    try {
      // Get the course first
      const courseQuery = `
        SELECT 
          c.id,
          c.courseCode,
          c.courseTitle,
          c.department_id,
          c.degree_id,
          c.credit,
          c.contactHourPerWeek,
          c.level,
          c.semester,
          c.academicSession,
          c.type,
          c.type_T_S,
          c.totalMarks,
          c.instructor,
          c.prerequisites,
          c.summary,
          c.created_at,
          c.updated_at,
          dept.name as department_name,
          dept.code as department_code,
          deg.name as degree_name,
          deg.short_name as degree_short_name
        FROM ${this.tableName} c
        LEFT JOIN departments dept ON c.department_id = dept.id
        LEFT JOIN degrees deg ON c.degree_id = deg.id
        WHERE c.id = ?
        LIMIT 1
      `;

      const [courseRows] = await this.db.execute(courseQuery, [courseId]);

      if (courseRows.length === 0) {
        return null;
      }

      const course = courseRows[0];

      // Get objectives for this course
      const coQuery = `
        SELECT 
          co.id,
          co.course_id,
          co.CO_ID,
          co.CO_Description,
          co.created_at,
          co.updated_at
        FROM course_objectives co
        WHERE co.course_id = ?
        ORDER BY co.CO_ID
      `;

      const [coRows] = await this.db.execute(coQuery, [courseId]);
      course.objectives = coRows;

      return course;
    } catch (error) {
      console.error('Error in getWithObjectives:', error);
      throw error;
    }
  }

  /**
   * Get a course with all its relationships (CLOs, Objectives, Department, Degree)
   * @param {number} courseId - The course ID
   * @returns {Promise<Object|null>} Complete course object or null if not found
   */
  async getWithAllRelations(courseId) {
    try {
      // Get the course with department and degree
      const courseQuery = `
        SELECT 
          c.id,
          c.courseCode,
          c.courseTitle,
          c.department_id,
          c.degree_id,
          c.credit,
          c.contactHourPerWeek,
          c.level,
          c.semester,
          c.academicSession,
          c.type,
          c.type_T_S,
          c.totalMarks,
          c.instructor,
          c.prerequisites,
          c.summary,
          c.created_at,
          c.updated_at,
          dept.name as department_name,
          dept.code as department_code,
          deg.name as degree_name,
          deg.short_name as degree_short_name,
          deg.level as degree_level
        FROM ${this.tableName} c
        LEFT JOIN departments dept ON c.department_id = dept.id
        LEFT JOIN degrees deg ON c.degree_id = deg.id
        WHERE c.id = ?
        LIMIT 1
      `;

      const [courseRows] = await this.db.execute(courseQuery, [courseId]);

      if (courseRows.length === 0) {
        return null;
      }

      const course = courseRows[0];

      // Get CLOs
      const cloQuery = `
        SELECT 
          clo.id,
          clo.course_id,
          clo.CLO_ID,
          clo.CLO_Description,
          clo.bloom_taxonomy_level_id,
          clo.weight_percentage,
          clo.target_attainment,
          clo.created_at,
          clo.updated_at,
          btl.level_number as bloom_level_number,
          btl.level_name as bloom_level_name,
          btl.description as bloom_level_description
        FROM course_learning_outcomes clo
        LEFT JOIN bloom_taxonomy_levels btl ON clo.bloom_taxonomy_level_id = btl.id
        WHERE clo.course_id = ?
        ORDER BY clo.CLO_ID
      `;

      const [cloRows] = await this.db.execute(cloQuery, [courseId]);
      course.clos = cloRows;

      // Get objectives
      const coQuery = `
        SELECT 
          co.id,
          co.course_id,
          co.CO_ID,
          co.CO_Description,
          co.created_at,
          co.updated_at
        FROM course_objectives co
        WHERE co.course_id = ?
        ORDER BY co.CO_ID
      `;

      const [coRows] = await this.db.execute(coQuery, [courseId]);
      course.objectives = coRows;

      return course;
    } catch (error) {
      console.error('Error in getWithAllRelations:', error);
      throw error;
    }
  }

  /**
   * Get count of CLOs for a course
   * @param {number} courseId - The course ID
   * @returns {Promise<number>} Count of CLOs
   */
  async countCLOs(courseId) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM course_learning_outcomes
        WHERE course_id = ?
      `;

      const [rows] = await this.db.execute(query, [courseId]);
      return rows[0].count;
    } catch (error) {
      console.error('Error in countCLOs:', error);
      throw error;
    }
  }

  /**
   * Get count of objectives for a course
   * @param {number} courseId - The course ID
   * @returns {Promise<number>} Count of objectives
   */
  async countObjectives(courseId) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM course_objectives
        WHERE course_id = ?
      `;

      const [rows] = await this.db.execute(query, [courseId]);
      return rows[0].count;
    } catch (error) {
      console.error('Error in countObjectives:', error);
      throw error;
    }
  }

  /**
   * Check if a course code already exists
   * @param {string} courseCode - The course code to check
   * @param {number} excludeId - Course ID to exclude (for updates)
   * @returns {Promise<boolean>} True if exists, false otherwise
   */
  async courseCodeExists(courseCode, excludeId = null) {
    try {
      let query = `
        SELECT COUNT(*) as count
        FROM ${this.tableName}
        WHERE courseCode = ?
      `;

      const params = [courseCode];

      if (excludeId) {
        query += ` AND id != ?`;
        params.push(excludeId);
      }

      const [rows] = await this.db.execute(query, params);
      return rows[0].count > 0;
    } catch (error) {
      console.error('Error in courseCodeExists:', error);
      throw error;
    }
  }

  /**
   * Validate course data before create/update
   * @param {Object} data - Course data to validate
   * @param {number} excludeId - ID to exclude for update operations
   * @returns {Promise<Object>} Validation result
   */
  async validateCourse(data, excludeId = null) {
    const errors = [];

    try {
      // Check if department exists
      if (data.department_id) {
        const [deptRows] = await this.db.execute(
          'SELECT id FROM departments WHERE id = ?',
          [data.department_id]
        );

        if (deptRows.length === 0) {
          errors.push('Department not found');
        }
      }

      // Check if degree exists
      if (data.degree_id) {
        const [degreeRows] = await this.db.execute(
          'SELECT id FROM degrees WHERE id = ?',
          [data.degree_id]
        );

        if (degreeRows.length === 0) {
          errors.push('Degree not found');
        }
      }

      // Check for duplicate course code
      if (data.courseCode) {
        const codeExists = await this.courseCodeExists(data.courseCode, excludeId);
        if (codeExists) {
          errors.push('Course code already exists');
        }
      }

      // Validate credit hours
      if (data.credit !== undefined && data.credit < 0) {
        errors.push('Credit hours cannot be negative');
      }

      // Validate contact hours
      if (data.contactHourPerWeek !== undefined && data.contactHourPerWeek !== null && data.contactHourPerWeek < 0) {
        errors.push('Contact hours per week cannot be negative');
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      console.error('Error in validateCourse:', error);
      throw error;
    }
  }

  /**
   * Search courses by keyword in code, title, or summary
   * @param {string} keyword - Search keyword
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of matching courses
   */
  async search(keyword, options = {}) {
    try {
      const {
        limit = 20,
        offset = 0,
        orderBy = 'courseCode',
        order = 'ASC'
      } = options;

      const query = `
        SELECT 
          c.id,
          c.courseCode,
          c.courseTitle,
          c.department_id,
          c.degree_id,
          c.credit,
          c.contactHourPerWeek,
          c.level,
          c.semester,
          c.type,
          c.summary,
          dept.name as department_name,
          dept.code as department_code,
          deg.name as degree_name,
          deg.short_name as degree_short_name
        FROM ${this.tableName} c
        LEFT JOIN departments dept ON c.department_id = dept.id
        LEFT JOIN degrees deg ON c.degree_id = deg.id
        WHERE 
          c.courseCode LIKE ? OR
          c.courseTitle LIKE ? OR
          c.summary LIKE ?
        ORDER BY c.${orderBy} ${order}
        LIMIT ? OFFSET ?
      `;

      const searchPattern = `%${keyword}%`;
      const [rows] = await this.db.execute(query, [
        searchPattern,
        searchPattern,
        searchPattern,
        limit,
        offset
      ]);

      return rows;
    } catch (error) {
      console.error('Error in search:', error);
      throw error;
    }
  }
}

module.exports = Course;
