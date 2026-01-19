const BaseModel = require('./BaseModel');

/**
 * RubricLevel Model
 * Manages performance levels for rubric criteria
 * @extends BaseModel
 */
class RubricLevel extends BaseModel {
  /**
   * Constructor for RubricLevel model
   */
  constructor() {
    super('rubric_levels');
  }

  /**
   * Get levels by criteria
   * @param {number} criteriaId - Criteria ID
   * @param {Object} options - Query options
   * @param {string} options.orderBy - Column to order by (default: level_score)
   * @param {string} options.order - Order direction (default: DESC)
   * @returns {Promise<Array>} Array of levels
   */
  async getByCriteria(criteriaId, options = {}) {
    try {
      const {
        orderBy = 'level_score',
        order = 'DESC'
      } = options;

      const query = `
        SELECT 
          rl.*,
          rc.criterion_name,
          rc.max_score as criterion_max_score
        FROM ${this.tableName} rl
        LEFT JOIN rubric_criteria rc ON rl.rubric_criteria_id = rc.id
        WHERE rl.rubric_criteria_id = ?
        ORDER BY rl.${orderBy} ${order}
      `;

      const [rows] = await this.db.execute(query, [criteriaId]);
      return rows;
    } catch (error) {
      throw new Error(`Error in getByCriteria: ${error.message}`);
    }
  }

  /**
   * Get level by ID with criteria details
   * @param {number} levelId - Level ID
   * @returns {Promise<Object|null>} Level with criteria details or null
   */
  async getByIdWithDetails(levelId) {
    try {
      const query = `
        SELECT 
          rl.*,
          rc.criterion_name,
          rc.description as criterion_description,
          rc.max_score as criterion_max_score,
          rc.rubric_id,
          r.name as rubric_name
        FROM ${this.tableName} rl
        LEFT JOIN rubric_criteria rc ON rl.rubric_criteria_id = rc.id
        LEFT JOIN rubrics r ON rc.rubric_id = r.id
        WHERE rl.id = ?
      `;

      const [rows] = await this.db.execute(query, [levelId]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error(`Error in getByIdWithDetails: ${error.message}`);
    }
  }

  /**
   * Get all levels for a rubric
   * @param {number} rubricId - Rubric ID
   * @returns {Promise<Array>} Array of levels grouped by criteria
   */
  async getByRubric(rubricId) {
    try {
      const query = `
        SELECT 
          rl.*,
          rc.criterion_name,
          rc.\`order\` as criterion_order
        FROM ${this.tableName} rl
        INNER JOIN rubric_criteria rc ON rl.rubric_criteria_id = rc.id
        WHERE rc.rubric_id = ?
        ORDER BY rc.\`order\` ASC, rl.level_score DESC
      `;

      const [rows] = await this.db.execute(query, [rubricId]);
      return rows;
    } catch (error) {
      throw new Error(`Error in getByRubric: ${error.message}`);
    }
  }

  /**
   * Create a new rubric level
   * @param {Object} levelData - Level data
   * @returns {Promise<Object>} Created level
   */
  async create(levelData) {
    try {
      const {
        rubric_criteria_id,
        level_name,
        level_score,
        description
      } = levelData;

      const query = `
        INSERT INTO ${this.tableName} 
        (rubric_criteria_id, level_name, level_score, description)
        VALUES (?, ?, ?, ?)
      `;

      const [result] = await this.db.execute(query, [
        rubric_criteria_id,
        level_name,
        level_score || 0,
        description || null
      ]);

      return await this.findById(result.insertId);
    } catch (error) {
      throw new Error(`Error in create: ${error.message}`);
    }
  }

  /**
   * Update a rubric level
   * @param {number} levelId - Level ID
   * @param {Object} levelData - Updated level data
   * @returns {Promise<Object>} Updated level
   */
  async update(levelId, levelData) {
    try {
      const {
        level_name,
        level_score,
        description
      } = levelData;

      const query = `
        UPDATE ${this.tableName}
        SET level_name = ?,
            level_score = ?,
            description = ?
        WHERE id = ?
      `;

      await this.db.execute(query, [
        level_name,
        level_score,
        description || null,
        levelId
      ]);

      return await this.findById(levelId);
    } catch (error) {
      throw new Error(`Error in update: ${error.message}`);
    }
  }

  /**
   * Delete a rubric level
   * @param {number} levelId - Level ID
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(levelId) {
    try {
      const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
      const [result] = await this.db.execute(query, [levelId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error in delete: ${error.message}`);
    }
  }

  /**
   * Get highest score level for a criteria
   * @param {number} criteriaId - Criteria ID
   * @returns {Promise<Object|null>} Highest score level or null
   */
  async getHighestLevel(criteriaId) {
    try {
      const query = `
        SELECT *
        FROM ${this.tableName}
        WHERE rubric_criteria_id = ?
        ORDER BY level_score DESC
        LIMIT 1
      `;

      const [rows] = await this.db.execute(query, [criteriaId]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error(`Error in getHighestLevel: ${error.message}`);
    }
  }

  /**
   * Get lowest score level for a criteria
   * @param {number} criteriaId - Criteria ID
   * @returns {Promise<Object|null>} Lowest score level or null
   */
  async getLowestLevel(criteriaId) {
    try {
      const query = `
        SELECT *
        FROM ${this.tableName}
        WHERE rubric_criteria_id = ?
        ORDER BY level_score ASC
        LIMIT 1
      `;

      const [rows] = await this.db.execute(query, [criteriaId]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error(`Error in getLowestLevel: ${error.message}`);
    }
  }

  /**
   * Get level count for a criteria
   * @param {number} criteriaId - Criteria ID
   * @returns {Promise<number>} Number of levels
   */
  async getCountByCriteria(criteriaId) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM ${this.tableName}
        WHERE rubric_criteria_id = ?
      `;

      const [rows] = await this.db.execute(query, [criteriaId]);
      return rows[0].count;
    } catch (error) {
      throw new Error(`Error in getCountByCriteria: ${error.message}`);
    }
  }
}

module.exports = RubricLevel;
