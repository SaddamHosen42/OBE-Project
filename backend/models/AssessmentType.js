const BaseModel = require('./BaseModel');

/**
 * AssessmentType Model
 * Manages assessment types (Quiz, Assignment, Midterm, Final, etc.)
 * @extends BaseModel
 */
class AssessmentType extends BaseModel {
  /**
   * Constructor for AssessmentType model
   */
  constructor() {
    super('assessment_types');
  }

  /**
   * Get assessment type by name
   * @param {string} name - The name of the assessment type
   * @returns {Promise<Object|null>} Assessment type record or null
   */
  async getByName(name) {
    try {
      const query = `SELECT * FROM ${this.tableName} WHERE name = ?`;
      const [rows] = await this.db.execute(query, [name]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error(`Error getting assessment type by name: ${error.message}`);
    }
  }

  /**
   * Get assessment types by category
   * @param {string} category - Category (Continuous or Terminal)
   * @returns {Promise<Array>} Array of assessment type records
   */
  async getByCategory(category) {
    try {
      const query = `
        SELECT * FROM ${this.tableName}
        WHERE category = ?
        ORDER BY name ASC
      `;
      const [rows] = await this.db.execute(query, [category]);
      return rows;
    } catch (error) {
      throw new Error(`Error getting assessment types by category: ${error.message}`);
    }
  }

  /**
   * Get all assessment types grouped by category
   * @returns {Promise<Object>} Object with categories as keys
   */
  async getAllGroupedByCategory() {
    try {
      const query = `
        SELECT * FROM ${this.tableName}
        ORDER BY category ASC, name ASC
      `;
      const [rows] = await this.db.execute(query);
      
      // Group by category
      const grouped = rows.reduce((acc, type) => {
        if (!acc[type.category]) {
          acc[type.category] = [];
        }
        acc[type.category].push(type);
        return acc;
      }, {});
      
      return grouped;
    } catch (error) {
      throw new Error(`Error getting assessment types grouped by category: ${error.message}`);
    }
  }

  /**
   * Create a new assessment type
   * @param {Object} data - Assessment type data
   * @param {string} data.name - Name of the assessment type
   * @param {string} data.category - Category (Continuous or Terminal)
   * @param {string} data.description - Description (optional)
   * @returns {Promise<number>} ID of the created assessment type
   */
  async create(data) {
    try {
      const { name, category, description = null } = data;

      // Validate required fields
      if (!name || !category) {
        throw new Error('Name and category are required');
      }

      // Validate category
      const validCategories = ['Continuous', 'Terminal'];
      if (!validCategories.includes(category)) {
        throw new Error('Category must be either "Continuous" or "Terminal"');
      }

      // Check if assessment type with same name already exists
      const existing = await this.getByName(name);
      if (existing) {
        throw new Error(`Assessment type with name "${name}" already exists`);
      }

      const query = `
        INSERT INTO ${this.tableName} (name, category, description)
        VALUES (?, ?, ?)
      `;
      const [result] = await this.db.execute(query, [name, category, description]);
      return result.insertId;
    } catch (error) {
      throw new Error(`Error creating assessment type: ${error.message}`);
    }
  }

  /**
   * Update an assessment type
   * @param {number} id - Assessment type ID
   * @param {Object} data - Updated data
   * @returns {Promise<boolean>} True if updated successfully
   */
  async update(id, data) {
    try {
      const { name, category, description } = data;

      // Validate category if provided
      if (category) {
        const validCategories = ['Continuous', 'Terminal'];
        if (!validCategories.includes(category)) {
          throw new Error('Category must be either "Continuous" or "Terminal"');
        }
      }

      // If name is being updated, check for duplicates
      if (name) {
        const existing = await this.getByName(name);
        if (existing && existing.id !== id) {
          throw new Error(`Assessment type with name "${name}" already exists`);
        }
      }

      const updates = [];
      const values = [];

      if (name !== undefined) {
        updates.push('name = ?');
        values.push(name);
      }
      if (category !== undefined) {
        updates.push('category = ?');
        values.push(category);
      }
      if (description !== undefined) {
        updates.push('description = ?');
        values.push(description);
      }

      if (updates.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(id);
      const query = `
        UPDATE ${this.tableName}
        SET ${updates.join(', ')}
        WHERE id = ?
      `;

      const [result] = await this.db.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error updating assessment type: ${error.message}`);
    }
  }

  /**
   * Delete an assessment type (soft check for dependencies)
   * @param {number} id - Assessment type ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete(id) {
    try {
      // Check if assessment type is being used by any assessment components
      const checkQuery = `
        SELECT COUNT(*) as count FROM assessment_components
        WHERE assessment_type_id = ?
      `;
      const [checkRows] = await this.db.execute(checkQuery, [id]);
      
      if (checkRows[0].count > 0) {
        throw new Error('Cannot delete assessment type that is being used by assessment components');
      }

      const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
      const [result] = await this.db.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting assessment type: ${error.message}`);
    }
  }
}

module.exports = AssessmentType;
