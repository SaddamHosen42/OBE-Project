const BaseModel = require('./BaseModel');

/**
 * RubricCriteria Model
 * Manages criteria/dimensions for rubrics
 * @extends BaseModel
 */
class RubricCriteria extends BaseModel {
  /**
   * Constructor for RubricCriteria model
   */
  constructor() {
    super('rubric_criteria');
  }

  /**
   * Get rubric criteria with its performance levels
   * @param {number} criteriaId - Criteria ID
   * @param {Object} options - Query options
   * @param {boolean} options.includeRubric - Include parent rubric details
   * @returns {Promise<Object|null>} Criteria with levels or null
   */
  async getWithLevels(criteriaId, options = {}) {
    try {
      const {
        includeRubric = false
      } = options;

      // Get criteria details
      let criteriaQuery = `
        SELECT 
          rc.*
          ${includeRubric ? `,
          r.name as rubric_name,
          r.description as rubric_description` : ''}
        FROM ${this.tableName} rc
        ${includeRubric ? 'LEFT JOIN rubrics r ON rc.rubric_id = r.id' : ''}
        WHERE rc.id = ?
      `;

      const [criteriaRows] = await this.db.execute(criteriaQuery, [criteriaId]);
      
      if (criteriaRows.length === 0) {
        return null;
      }

      const criteria = criteriaRows[0];

      // Get levels for this criteria
      const levelsQuery = `
        SELECT 
          rl.id,
          rl.rubric_criteria_id,
          rl.level_name,
          rl.level_score,
          rl.description,
          rl.created_at,
          rl.updated_at
        FROM rubric_levels rl
        WHERE rl.rubric_criteria_id = ?
        ORDER BY rl.level_score DESC
      `;

      const [levelsRows] = await this.db.execute(levelsQuery, [criteriaId]);
      criteria.levels = levelsRows;

      return criteria;
    } catch (error) {
      throw new Error(`Error in getWithLevels: ${error.message}`);
    }
  }

  /**
   * Get all criteria for a rubric
   * @param {number} rubricId - Rubric ID
   * @param {Object} options - Query options
   * @param {boolean} options.includeLevels - Include levels for each criterion
   * @returns {Promise<Array>} Array of criteria
   */
  async getByRubric(rubricId, options = {}) {
    try {
      const {
        includeLevels = true
      } = options;

      const query = `
        SELECT 
          rc.*
        FROM ${this.tableName} rc
        WHERE rc.rubric_id = ?
        ORDER BY rc.\`order\` ASC
      `;

      const [criteria] = await this.db.execute(query, [rubricId]);

      // If includeLevels is true, get levels for each criterion
      if (includeLevels && criteria.length > 0) {
        for (let criterion of criteria) {
          const criteriaWithLevels = await this.getWithLevels(criterion.id, {
            includeRubric: false
          });
          criterion.levels = criteriaWithLevels.levels;
        }
      }

      return criteria;
    } catch (error) {
      throw new Error(`Error in getByRubric: ${error.message}`);
    }
  }

  /**
   * Create a new rubric criterion
   * @param {Object} criteriaData - Criteria data
   * @returns {Promise<Object>} Created criterion
   */
  async create(criteriaData) {
    try {
      const {
        rubric_id,
        criterion_name,
        description,
        max_score,
        weight_percentage,
        order
      } = criteriaData;

      const query = `
        INSERT INTO ${this.tableName} 
        (rubric_id, criterion_name, description, max_score, weight_percentage, \`order\`)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const [result] = await this.db.execute(query, [
        rubric_id,
        criterion_name,
        description || null,
        max_score || 0,
        weight_percentage || 0,
        order || 0
      ]);

      return await this.findById(result.insertId);
    } catch (error) {
      throw new Error(`Error in create: ${error.message}`);
    }
  }

  /**
   * Update a rubric criterion
   * @param {number} criteriaId - Criteria ID
   * @param {Object} criteriaData - Updated criteria data
   * @returns {Promise<Object>} Updated criterion
   */
  async update(criteriaId, criteriaData) {
    try {
      const {
        criterion_name,
        description,
        max_score,
        weight_percentage,
        order
      } = criteriaData;

      const query = `
        UPDATE ${this.tableName}
        SET criterion_name = ?,
            description = ?,
            max_score = ?,
            weight_percentage = ?,
            \`order\` = ?
        WHERE id = ?
      `;

      await this.db.execute(query, [
        criterion_name,
        description || null,
        max_score,
        weight_percentage,
        order,
        criteriaId
      ]);

      return await this.findById(criteriaId);
    } catch (error) {
      throw new Error(`Error in update: ${error.message}`);
    }
  }

  /**
   * Delete a rubric criterion
   * @param {number} criteriaId - Criteria ID
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(criteriaId) {
    try {
      const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
      const [result] = await this.db.execute(query, [criteriaId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error in delete: ${error.message}`);
    }
  }

  /**
   * Reorder criteria for a rubric
   * @param {number} rubricId - Rubric ID
   * @param {Array<{id: number, order: number}>} orderData - Array of criterion IDs with new order
   * @returns {Promise<boolean>} True if successful
   */
  async reorder(rubricId, orderData) {
    try {
      const connection = await this.db.getConnection();
      
      try {
        await connection.beginTransaction();

        for (const item of orderData) {
          await connection.execute(
            `UPDATE ${this.tableName} SET \`order\` = ? WHERE id = ? AND rubric_id = ?`,
            [item.order, item.id, rubricId]
          );
        }

        await connection.commit();
        return true;
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      throw new Error(`Error in reorder: ${error.message}`);
    }
  }

  /**
   * Calculate total weight percentage for a rubric
   * @param {number} rubricId - Rubric ID
   * @returns {Promise<number>} Total weight percentage
   */
  async getTotalWeight(rubricId) {
    try {
      const query = `
        SELECT SUM(weight_percentage) as total_weight
        FROM ${this.tableName}
        WHERE rubric_id = ?
      `;

      const [rows] = await this.db.execute(query, [rubricId]);
      return rows[0].total_weight || 0;
    } catch (error) {
      throw new Error(`Error in getTotalWeight: ${error.message}`);
    }
  }
}

module.exports = RubricCriteria;
