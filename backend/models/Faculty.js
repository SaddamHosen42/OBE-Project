const BaseModel = require('./BaseModel');

/**
 * Faculty Model for managing faculty information
 * Handles faculty CRUD operations and relationships with departments
 */
class Faculty extends BaseModel {
  constructor() {
    super('faculties');
  }

  /**
   * Get all faculties with their associated departments
   * @returns {Promise<Array>} Array of faculty objects with departments
   */
  async getAllWithDepartments() {
    try {
      const query = `
        SELECT 
          f.id,
          f.name,
          f.short_name,
          f.created_at,
          f.updated_at,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', d.id,
              'name', d.name,
              'dept_code', d.dept_code,
              'created_at', d.created_at,
              'updated_at', d.updated_at
            )
          ) as departments
        FROM faculties f
        LEFT JOIN departments d ON f.id = d.faculty_id
        GROUP BY f.id, f.name, f.short_name, f.created_at, f.updated_at
        ORDER BY f.name ASC
      `;

      const [rows] = await this.db.execute(query);
      
      // Parse the JSON departments field
      return rows.map(row => ({
        ...row,
        departments: row.departments ? JSON.parse(row.departments).filter(dept => dept.id !== null) : []
      }));
    } catch (error) {
      console.error('Error in getAllWithDepartments:', error);
      throw error;
    }
  }

  /**
   * Find faculty by ID with its departments
   * @param {number} id - Faculty ID
   * @returns {Promise<Object|null>} Faculty object with departments or null if not found
   */
  async findByIdWithDepartments(id) {
    try {
      const query = `
        SELECT 
          f.id,
          f.name,
          f.short_name,
          f.created_at,
          f.updated_at,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', d.id,
              'name', d.name,
              'dept_code', d.dept_code,
              'created_at', d.created_at,
              'updated_at', d.updated_at
            )
          ) as departments
        FROM faculties f
        LEFT JOIN departments d ON f.id = d.faculty_id
        WHERE f.id = ?
        GROUP BY f.id, f.name, f.short_name, f.created_at, f.updated_at
      `;

      const [rows] = await this.db.execute(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }

      const faculty = rows[0];
      return {
        ...faculty,
        departments: faculty.departments ? JSON.parse(faculty.departments).filter(dept => dept.id !== null) : []
      };
    } catch (error) {
      console.error('Error in findByIdWithDepartments:', error);
      throw error;
    }
  }

  /**
   * Find faculty by short name
   * @param {string} shortName - Faculty short name
   * @returns {Promise<Object|null>} Faculty object or null if not found
   */
  async findByShortName(shortName) {
    if (!shortName) {
      throw new Error('Short name is required');
    }
    const faculties = await this.findWhere({ short_name: shortName });
    return faculties.length > 0 ? faculties[0] : null;
  }

  /**
   * Create a new faculty
   * @param {Object} facultyData - Faculty data object
   * @param {string} facultyData.name - Faculty name
   * @param {string} facultyData.short_name - Faculty short name
   * @returns {Promise<number>} ID of the created faculty
   */
  async create(facultyData) {
    const { name, short_name } = facultyData;

    if (!name || !short_name) {
      throw new Error('Name and short name are required');
    }

    // Check if faculty with same name exists
    const existing = await this.findWhere({ name });
    if (existing.length > 0) {
      throw new Error('Faculty with this name already exists');
    }

    // Check if faculty with same short name exists
    const existingShort = await this.findByShortName(short_name);
    if (existingShort) {
      throw new Error('Faculty with this short name already exists');
    }

    return await this.insert({
      name,
      short_name
    });
  }

  /**
   * Update faculty information
   * @param {number} id - Faculty ID
   * @param {Object} facultyData - Faculty data to update
   * @param {string} [facultyData.name] - Faculty name
   * @param {string} [facultyData.short_name] - Faculty short name
   * @returns {Promise<boolean>} True if updated successfully
   */
  async updateFaculty(id, facultyData) {
    const { name, short_name } = facultyData;

    // Check if faculty exists
    const faculty = await this.findById(id);
    if (!faculty) {
      throw new Error('Faculty not found');
    }

    // Check if new name already exists (excluding current faculty)
    if (name && name !== faculty.name) {
      const existing = await this.findWhere({ name });
      if (existing.length > 0 && existing[0].id !== id) {
        throw new Error('Faculty with this name already exists');
      }
    }

    // Check if new short name already exists (excluding current faculty)
    if (short_name && short_name !== faculty.short_name) {
      const existingShort = await this.findByShortName(short_name);
      if (existingShort && existingShort.id !== id) {
        throw new Error('Faculty with this short name already exists');
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (short_name) updateData.short_name = short_name;

    if (Object.keys(updateData).length === 0) {
      throw new Error('No data to update');
    }

    return await this.update(id, updateData);
  }

  /**
   * Delete faculty by ID
   * Note: This will cascade delete all related departments due to foreign key constraint
   * @param {number} id - Faculty ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteFaculty(id) {
    // Check if faculty exists
    const faculty = await this.findById(id);
    if (!faculty) {
      throw new Error('Faculty not found');
    }

    return await this.delete(id);
  }

  /**
   * Get department count for each faculty
   * @returns {Promise<Array>} Array of faculties with department counts
   */
  async getFacultiesWithDepartmentCount() {
    try {
      const query = `
        SELECT 
          f.id,
          f.name,
          f.short_name,
          f.created_at,
          f.updated_at,
          COUNT(d.id) as department_count
        FROM faculties f
        LEFT JOIN departments d ON f.id = d.faculty_id
        GROUP BY f.id, f.name, f.short_name, f.created_at, f.updated_at
        ORDER BY f.name ASC
      `;

      const [rows] = await this.db.execute(query);
      return rows;
    } catch (error) {
      console.error('Error in getFacultiesWithDepartmentCount:', error);
      throw error;
    }
  }
}

module.exports = Faculty;
