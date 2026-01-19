const BaseModel = require('./BaseModel');

/**
 * GradeScale Model for managing grading scales
 * Handles grade scale CRUD operations and relationships with grade points
 */
class GradeScale extends BaseModel {
  constructor() {
    super('grade_scales');
  }

  /**
   * Get all active grade scales
   * @param {Object} options - Query options
   * @param {string} options.orderBy - Column to order by (default: 'name')
   * @param {string} options.order - Order direction (default: 'ASC')
   * @returns {Promise<Array>} Array of active grade scales
   */
  async getActive(options = {}) {
    try {
      const {
        orderBy = 'name',
        order = 'ASC'
      } = options;

      const query = `
        SELECT 
          id,
          name,
          is_active,
          created_at,
          updated_at
        FROM ${this.tableName}
        WHERE is_active = TRUE
        ORDER BY ${orderBy} ${order}
      `;

      const [results] = await this.db.execute(query);
      return results;
    } catch (error) {
      throw new Error(`Error getting active grade scales: ${error.message}`);
    }
  }

  /**
   * Get grade scale with its grade points
   * @param {number} id - Grade scale ID
   * @returns {Promise<Object|null>} Grade scale with grade points or null
   */
  async getWithGradePoints(id) {
    try {
      const query = `
        SELECT 
          gs.id,
          gs.name,
          gs.is_active,
          gs.created_at,
          gs.updated_at,
          gp.id as grade_point_id,
          gp.letter_grade,
          gp.grade_point,
          gp.min_percentage,
          gp.max_percentage,
          gp.remarks
        FROM ${this.tableName} gs
        LEFT JOIN grade_points gp ON gs.id = gp.grade_scale_id
        WHERE gs.id = ?
        ORDER BY gp.min_percentage DESC
      `;

      const [results] = await this.db.execute(query, [id]);

      if (results.length === 0) {
        return null;
      }

      // Transform results into nested structure
      const gradeScale = {
        id: results[0].id,
        name: results[0].name,
        is_active: results[0].is_active,
        created_at: results[0].created_at,
        updated_at: results[0].updated_at,
        grade_points: []
      };

      results.forEach(row => {
        if (row.grade_point_id) {
          gradeScale.grade_points.push({
            id: row.grade_point_id,
            letter_grade: row.letter_grade,
            grade_point: row.grade_point,
            min_percentage: row.min_percentage,
            max_percentage: row.max_percentage,
            remarks: row.remarks
          });
        }
      });

      return gradeScale;
    } catch (error) {
      throw new Error(`Error getting grade scale with grade points: ${error.message}`);
    }
  }

  /**
   * Create a new grade scale
   * @param {Object} data - Grade scale data
   * @param {string} data.name - Name of the grade scale
   * @param {boolean} data.is_active - Whether the scale is active (default: true)
   * @returns {Promise<Object>} Created grade scale
   */
  async create(data) {
    const { name, is_active = true } = data;

    if (!name) {
      throw new Error('Grade scale name is required');
    }

    try {
      const query = `
        INSERT INTO ${this.tableName} (name, is_active)
        VALUES (?, ?)
      `;

      const [result] = await this.db.execute(query, [name, is_active]);
      return await this.findById(result.insertId);
    } catch (error) {
      throw new Error(`Error creating grade scale: ${error.message}`);
    }
  }

  /**
   * Update a grade scale
   * @param {number} id - Grade scale ID
   * @param {Object} data - Updated grade scale data
   * @returns {Promise<Object|null>} Updated grade scale or null
   */
  async update(id, data) {
    const { name, is_active } = data;

    try {
      const updateFields = [];
      const params = [];

      if (name !== undefined) {
        updateFields.push('name = ?');
        params.push(name);
      }

      if (is_active !== undefined) {
        updateFields.push('is_active = ?');
        params.push(is_active);
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      params.push(id);

      const query = `
        UPDATE ${this.tableName}
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await this.db.execute(query, params);
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error updating grade scale: ${error.message}`);
    }
  }

  /**
   * Activate a grade scale
   * @param {number} id - Grade scale ID
   * @returns {Promise<Object|null>} Updated grade scale or null
   */
  async activate(id) {
    return await this.update(id, { is_active: true });
  }

  /**
   * Deactivate a grade scale
   * @param {number} id - Grade scale ID
   * @returns {Promise<Object|null>} Updated grade scale or null
   */
  async deactivate(id) {
    return await this.update(id, { is_active: false });
  }
}

module.exports = GradeScale;
