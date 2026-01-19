const BaseModel = require('./BaseModel');

/**
 * Degree Model for managing degree/program information
 * Handles degree CRUD operations and relationships with departments, PLOs, and PEOs
 */
class Degree extends BaseModel {
  constructor() {
    super('degrees');
  }

  /**
   * Get all degrees belonging to a specific department
   * @param {number} departmentId - Department ID
   * @returns {Promise<Array>} Array of degree objects
   */
  async getByDepartment(departmentId) {
    try {
      const query = `
        SELECT 
          deg.id,
          deg.name,
          deg.faculty_id,
          deg.department_id,
          deg.credit_hours,
          deg.duration_years,
          deg.created_at,
          deg.updated_at,
          f.name as faculty_name,
          f.short_name as faculty_short_name,
          d.name as department_name,
          d.dept_code as department_code
        FROM ${this.tableName} deg
        INNER JOIN faculties f ON deg.faculty_id = f.id
        INNER JOIN departments d ON deg.department_id = d.id
        WHERE deg.department_id = ?
        ORDER BY deg.name ASC
      `;

      const [rows] = await this.db.execute(query, [departmentId]);
      return rows;
    } catch (error) {
      console.error('Error in getByDepartment:', error);
      throw error;
    }
  }

  /**
   * Get all degrees with their associated Program Learning Outcomes (PLOs)
   * @returns {Promise<Array>} Array of degree objects with PLOs
   */
  async getWithPLOs() {
    try {
      const query = `
        SELECT 
          deg.id,
          deg.name,
          deg.faculty_id,
          deg.department_id,
          deg.credit_hours,
          deg.duration_years,
          deg.created_at,
          deg.updated_at,
          f.name as faculty_name,
          f.short_name as faculty_short_name,
          d.name as department_name,
          d.dept_code as department_code,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', plo.id,
              'PLO_No', plo.PLO_No,
              'PLO_Description', plo.PLO_Description,
              'programName', plo.programName,
              'bloom_taxonomy_level_id', plo.bloom_taxonomy_level_id,
              'target_attainment', plo.target_attainment,
              'created_at', plo.created_at,
              'updated_at', plo.updated_at
            )
          ) as PLOs
        FROM ${this.tableName} deg
        INNER JOIN faculties f ON deg.faculty_id = f.id
        INNER JOIN departments d ON deg.department_id = d.id
        LEFT JOIN program_learning_outcomes plo ON deg.id = plo.degree_id
        GROUP BY deg.id, deg.name, deg.faculty_id, deg.department_id, deg.credit_hours, 
                 deg.duration_years, deg.created_at, deg.updated_at, 
                 f.name, f.short_name, d.name, d.dept_code
        ORDER BY deg.name ASC
      `;

      const [rows] = await this.db.execute(query);
      
      // Parse the JSON PLOs field and filter out null entries
      return rows.map(row => ({
        ...row,
        PLOs: row.PLOs ? JSON.parse(row.PLOs).filter(plo => plo.id !== null) : []
      }));
    } catch (error) {
      console.error('Error in getWithPLOs:', error);
      throw error;
    }
  }

  /**
   * Get all degrees with their associated Program Educational Objectives (PEOs)
   * @returns {Promise<Array>} Array of degree objects with PEOs
   */
  async getWithPEOs() {
    try {
      const query = `
        SELECT 
          deg.id,
          deg.name,
          deg.faculty_id,
          deg.department_id,
          deg.credit_hours,
          deg.duration_years,
          deg.created_at,
          deg.updated_at,
          f.name as faculty_name,
          f.short_name as faculty_short_name,
          d.name as department_name,
          d.dept_code as department_code,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', peo.id,
              'PEO_No', peo.PEO_No,
              'PEO_Description', peo.PEO_Description,
              'created_at', peo.created_at,
              'updated_at', peo.updated_at
            )
          ) as PEOs
        FROM ${this.tableName} deg
        INNER JOIN faculties f ON deg.faculty_id = f.id
        INNER JOIN departments d ON deg.department_id = d.id
        LEFT JOIN program_educational_objectives peo ON deg.id = peo.degree_id
        GROUP BY deg.id, deg.name, deg.faculty_id, deg.department_id, deg.credit_hours, 
                 deg.duration_years, deg.created_at, deg.updated_at, 
                 f.name, f.short_name, d.name, d.dept_code
        ORDER BY deg.name ASC
      `;

      const [rows] = await this.db.execute(query);
      
      // Parse the JSON PEOs field and filter out null entries
      return rows.map(row => ({
        ...row,
        PEOs: row.PEOs ? JSON.parse(row.PEOs).filter(peo => peo.id !== null) : []
      }));
    } catch (error) {
      console.error('Error in getWithPEOs:', error);
      throw error;
    }
  }

  /**
   * Get degree by ID with PLOs
   * @param {number} id - Degree ID
   * @returns {Promise<Object|null>} Degree object with PLOs or null if not found
   */
  async findByIdWithPLOs(id) {
    try {
      const query = `
        SELECT 
          deg.id,
          deg.name,
          deg.faculty_id,
          deg.department_id,
          deg.credit_hours,
          deg.duration_years,
          deg.created_at,
          deg.updated_at,
          f.name as faculty_name,
          f.short_name as faculty_short_name,
          d.name as department_name,
          d.dept_code as department_code,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', plo.id,
              'PLO_No', plo.PLO_No,
              'PLO_Description', plo.PLO_Description,
              'programName', plo.programName,
              'bloom_taxonomy_level_id', plo.bloom_taxonomy_level_id,
              'target_attainment', plo.target_attainment,
              'created_at', plo.created_at,
              'updated_at', plo.updated_at
            )
          ) as PLOs
        FROM ${this.tableName} deg
        INNER JOIN faculties f ON deg.faculty_id = f.id
        INNER JOIN departments d ON deg.department_id = d.id
        LEFT JOIN program_learning_outcomes plo ON deg.id = plo.degree_id
        WHERE deg.id = ?
        GROUP BY deg.id, deg.name, deg.faculty_id, deg.department_id, deg.credit_hours, 
                 deg.duration_years, deg.created_at, deg.updated_at, 
                 f.name, f.short_name, d.name, d.dept_code
      `;

      const [rows] = await this.db.execute(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }

      const degree = rows[0];
      return {
        ...degree,
        PLOs: degree.PLOs ? JSON.parse(degree.PLOs).filter(plo => plo.id !== null) : []
      };
    } catch (error) {
      console.error('Error in findByIdWithPLOs:', error);
      throw error;
    }
  }

  /**
   * Get degree by ID with PEOs
   * @param {number} id - Degree ID
   * @returns {Promise<Object|null>} Degree object with PEOs or null if not found
   */
  async findByIdWithPEOs(id) {
    try {
      const query = `
        SELECT 
          deg.id,
          deg.name,
          deg.faculty_id,
          deg.department_id,
          deg.credit_hours,
          deg.duration_years,
          deg.created_at,
          deg.updated_at,
          f.name as faculty_name,
          f.short_name as faculty_short_name,
          d.name as department_name,
          d.dept_code as department_code,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', peo.id,
              'PEO_No', peo.PEO_No,
              'PEO_Description', peo.PEO_Description,
              'created_at', peo.created_at,
              'updated_at', peo.updated_at
            )
          ) as PEOs
        FROM ${this.tableName} deg
        INNER JOIN faculties f ON deg.faculty_id = f.id
        INNER JOIN departments d ON deg.department_id = d.id
        LEFT JOIN program_educational_objectives peo ON deg.id = peo.degree_id
        WHERE deg.id = ?
        GROUP BY deg.id, deg.name, deg.faculty_id, deg.department_id, deg.credit_hours, 
                 deg.duration_years, deg.created_at, deg.updated_at, 
                 f.name, f.short_name, d.name, d.dept_code
      `;

      const [rows] = await this.db.execute(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }

      const degree = rows[0];
      return {
        ...degree,
        PEOs: degree.PEOs ? JSON.parse(degree.PEOs).filter(peo => peo.id !== null) : []
      };
    } catch (error) {
      console.error('Error in findByIdWithPEOs:', error);
      throw error;
    }
  }

  /**
   * Get degree by ID with both PLOs and PEOs
   * @param {number} id - Degree ID
   * @returns {Promise<Object|null>} Degree object with PLOs and PEOs or null if not found
   */
  async findByIdWithPLOsAndPEOs(id) {
    try {
      const query = `
        SELECT 
          deg.id,
          deg.name,
          deg.faculty_id,
          deg.department_id,
          deg.credit_hours,
          deg.duration_years,
          deg.created_at,
          deg.updated_at,
          f.name as faculty_name,
          f.short_name as faculty_short_name,
          d.name as department_name,
          d.dept_code as department_code
        FROM ${this.tableName} deg
        INNER JOIN faculties f ON deg.faculty_id = f.id
        INNER JOIN departments d ON deg.department_id = d.id
        WHERE deg.id = ?
      `;

      const [rows] = await this.db.execute(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }

      const degree = rows[0];

      // Get PLOs
      const ploQuery = `
        SELECT 
          id, PLO_No, PLO_Description, programName, 
          bloom_taxonomy_level_id, target_attainment, created_at, updated_at
        FROM program_learning_outcomes
        WHERE degree_id = ?
        ORDER BY PLO_No
      `;
      const [plos] = await this.db.execute(ploQuery, [id]);

      // Get PEOs
      const peoQuery = `
        SELECT 
          id, PEO_No, PEO_Description, created_at, updated_at
        FROM program_educational_objectives
        WHERE degree_id = ?
        ORDER BY PEO_No
      `;
      const [peos] = await this.db.execute(peoQuery, [id]);

      return {
        ...degree,
        PLOs: plos,
        PEOs: peos
      };
    } catch (error) {
      console.error('Error in findByIdWithPLOsAndPEOs:', error);
      throw error;
    }
  }

  /**
   * Get all degrees with faculty and department information
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of degree objects with related info
   */
  async getAllWithRelations(options = {}) {
    try {
      const {
        orderBy = 'deg.name',
        order = 'ASC',
        limit = null,
        offset = null
      } = options;

      let query = `
        SELECT 
          deg.id,
          deg.name,
          deg.faculty_id,
          deg.department_id,
          deg.credit_hours,
          deg.duration_years,
          deg.created_at,
          deg.updated_at,
          f.name as faculty_name,
          f.short_name as faculty_short_name,
          d.name as department_name,
          d.dept_code as department_code
        FROM ${this.tableName} deg
        INNER JOIN faculties f ON deg.faculty_id = f.id
        INNER JOIN departments d ON deg.department_id = d.id
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
      console.error('Error in getAllWithRelations:', error);
      throw error;
    }
  }

  /**
   * Get degree count by department
   * @param {number} departmentId - Department ID
   * @returns {Promise<number>} Count of degrees
   */
  async countByDepartment(departmentId) {
    try {
      const query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE department_id = ?`;
      const [rows] = await this.db.execute(query, [departmentId]);
      return rows[0].count;
    } catch (error) {
      console.error('Error in countByDepartment:', error);
      throw error;
    }
  }

  /**
   * Search degrees by name
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of matching degrees
   */
  async search(searchTerm) {
    try {
      const query = `
        SELECT 
          deg.id,
          deg.name,
          deg.faculty_id,
          deg.department_id,
          deg.credit_hours,
          deg.duration_years,
          deg.created_at,
          deg.updated_at,
          f.name as faculty_name,
          f.short_name as faculty_short_name,
          d.name as department_name,
          d.dept_code as department_code
        FROM ${this.tableName} deg
        INNER JOIN faculties f ON deg.faculty_id = f.id
        INNER JOIN departments d ON deg.department_id = d.id
        WHERE deg.name LIKE ?
        ORDER BY deg.name ASC
      `;

      const searchPattern = `%${searchTerm}%`;
      const [rows] = await this.db.execute(query, [searchPattern]);
      return rows;
    } catch (error) {
      console.error('Error in search:', error);
      throw error;
    }
  }
}

module.exports = Degree;
