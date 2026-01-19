const BaseModel = require('./BaseModel');

/**
 * Department Model for managing department information
 * Handles department CRUD operations and relationships with faculties and degrees
 */
class Department extends BaseModel {
  constructor() {
    super('departments');
  }

  /**
   * Get all departments belonging to a specific faculty
   * @param {number} facultyId - Faculty ID
   * @returns {Promise<Array>} Array of department objects
   */
  async getByFaculty(facultyId) {
    try {
      const query = `
        SELECT 
          d.id,
          d.name,
          d.dept_code,
          d.faculty_id,
          d.created_at,
          d.updated_at,
          f.name as faculty_name,
          f.short_name as faculty_short_name
        FROM ${this.tableName} d
        INNER JOIN faculties f ON d.faculty_id = f.id
        WHERE d.faculty_id = ?
        ORDER BY d.name ASC
      `;

      const [rows] = await this.db.execute(query, [facultyId]);
      return rows;
    } catch (error) {
      console.error('Error in getByFaculty:', error);
      throw error;
    }
  }

  /**
   * Get all departments with their associated degrees
   * @returns {Promise<Array>} Array of department objects with degrees
   */
  async getWithDegrees() {
    try {
      const query = `
        SELECT 
          d.id,
          d.name,
          d.dept_code,
          d.faculty_id,
          d.created_at,
          d.updated_at,
          f.name as faculty_name,
          f.short_name as faculty_short_name,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', deg.id,
              'name', deg.name,
              'credit_hours', deg.credit_hours,
              'duration_years', deg.duration_years,
              'created_at', deg.created_at,
              'updated_at', deg.updated_at
            )
          ) as degrees
        FROM ${this.tableName} d
        INNER JOIN faculties f ON d.faculty_id = f.id
        LEFT JOIN degrees deg ON d.id = deg.department_id
        GROUP BY d.id, d.name, d.dept_code, d.faculty_id, d.created_at, d.updated_at, f.name, f.short_name
        ORDER BY d.name ASC
      `;

      const [rows] = await this.db.execute(query);
      
      // Parse the JSON degrees field and filter out null entries
      return rows.map(row => ({
        ...row,
        degrees: row.degrees ? JSON.parse(row.degrees).filter(degree => degree.id !== null) : []
      }));
    } catch (error) {
      console.error('Error in getWithDegrees:', error);
      throw error;
    }
  }

  /**
   * Get department by ID with its associated degrees
   * @param {number} id - Department ID
   * @returns {Promise<Object|null>} Department object with degrees or null if not found
   */
  async findByIdWithDegrees(id) {
    try {
      const query = `
        SELECT 
          d.id,
          d.name,
          d.dept_code,
          d.faculty_id,
          d.created_at,
          d.updated_at,
          f.name as faculty_name,
          f.short_name as faculty_short_name,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', deg.id,
              'name', deg.name,
              'credit_hours', deg.credit_hours,
              'duration_years', deg.duration_years,
              'created_at', deg.created_at,
              'updated_at', deg.updated_at
            )
          ) as degrees
        FROM ${this.tableName} d
        INNER JOIN faculties f ON d.faculty_id = f.id
        LEFT JOIN degrees deg ON d.id = deg.department_id
        WHERE d.id = ?
        GROUP BY d.id, d.name, d.dept_code, d.faculty_id, d.created_at, d.updated_at, f.name, f.short_name
      `;

      const [rows] = await this.db.execute(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }

      const department = rows[0];
      return {
        ...department,
        degrees: department.degrees ? JSON.parse(department.degrees).filter(degree => degree.id !== null) : []
      };
    } catch (error) {
      console.error('Error in findByIdWithDegrees:', error);
      throw error;
    }
  }

  /**
   * Find department by department code
   * @param {string} deptCode - Department code
   * @returns {Promise<Object|null>} Department object or null if not found
   */
  async findByCode(deptCode) {
    try {
      const query = `
        SELECT 
          d.*,
          f.name as faculty_name,
          f.short_name as faculty_short_name
        FROM ${this.tableName} d
        INNER JOIN faculties f ON d.faculty_id = f.id
        WHERE d.dept_code = ?
      `;

      const [rows] = await this.db.execute(query, [deptCode]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error in findByCode:', error);
      throw error;
    }
  }

  /**
   * Check if department code already exists
   * @param {string} deptCode - Department code to check
   * @param {number} excludeId - ID to exclude from check (for updates)
   * @returns {Promise<boolean>} True if code exists, false otherwise
   */
  async codeExists(deptCode, excludeId = null) {
    try {
      let query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE dept_code = ?`;
      const params = [deptCode];

      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }

      const [rows] = await this.db.execute(query, params);
      return rows[0].count > 0;
    } catch (error) {
      console.error('Error in codeExists:', error);
      throw error;
    }
  }

  /**
   * Get department count by faculty
   * @param {number} facultyId - Faculty ID
   * @returns {Promise<number>} Count of departments
   */
  async countByFaculty(facultyId) {
    try {
      const query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE faculty_id = ?`;
      const [rows] = await this.db.execute(query, [facultyId]);
      return rows[0].count;
    } catch (error) {
      console.error('Error in countByFaculty:', error);
      throw error;
    }
  }

  /**
   * Get all departments with faculty information
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of department objects with faculty info
   */
  async getAllWithFaculty(options = {}) {
    try {
      const {
        orderBy = 'd.name',
        order = 'ASC',
        limit = null,
        offset = null
      } = options;

      let query = `
        SELECT 
          d.id,
          d.name,
          d.dept_code,
          d.faculty_id,
          d.created_at,
          d.updated_at,
          f.name as faculty_name,
          f.short_name as faculty_short_name
        FROM ${this.tableName} d
        INNER JOIN faculties f ON d.faculty_id = f.id
        ORDER BY ${orderBy} ${order}
      `;

      const params = [];

      if (limit) {
        query += ' LIMIT ?';
        params.push(limit);
      }

      if (offset) {
        query += ' OFFSET ?';
        params.push(offset);
      }

      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error in getAllWithFaculty:', error);
      throw error;
    }
  }

  /**
   * Search departments by name or code
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of matching departments
   */
  async search(searchTerm) {
    try {
      const query = `
        SELECT 
          d.id,
          d.name,
          d.dept_code,
          d.faculty_id,
          d.created_at,
          d.updated_at,
          f.name as faculty_name,
          f.short_name as faculty_short_name
        FROM ${this.tableName} d
        INNER JOIN faculties f ON d.faculty_id = f.id
        WHERE d.name LIKE ? OR d.dept_code LIKE ?
        ORDER BY d.name ASC
      `;

      const searchPattern = `%${searchTerm}%`;
      const [rows] = await this.db.execute(query, [searchPattern, searchPattern]);
      return rows;
    } catch (error) {
      console.error('Error in search:', error);
      throw error;
    }
  }
}

module.exports = Department;
