const BaseModel = require('./BaseModel');

/**
 * Rubric Model
 * Manages rubric definitions for assessments
 * @extends BaseModel
 */
class Rubric extends BaseModel {
  /**
   * Constructor for Rubric model
   */
  constructor() {
    super('rubrics');
  }

  /**
   * Get rubric with its criteria
   * @param {number} rubricId - Rubric ID
   * @param {Object} options - Query options
   * @param {boolean} options.includeLevels - Include levels for each criterion
   * @param {boolean} options.includeCLO - Include CLO details
   * @param {boolean} options.includeCreator - Include creator details
   * @returns {Promise<Object|null>} Rubric with criteria or null
   */
  async getWithCriteria(rubricId, options = {}) {
    try {
      const {
        includeLevels = true,
        includeCLO = true,
        includeCreator = false
      } = options;

      // Get rubric details
      let rubricQuery = `
        SELECT 
          r.*
          ${includeCLO ? `,
          clo.outcome_code as clo_code,
          clo.description as clo_description` : ''}
          ${includeCreator ? `,
          u.name as creator_name,
          u.email as creator_email` : ''}
        FROM ${this.tableName} r
        ${includeCLO ? 'LEFT JOIN course_learning_outcomes clo ON r.course_learning_outcome_id = clo.id' : ''}
        ${includeCreator ? 'LEFT JOIN users u ON r.created_by = u.id' : ''}
        WHERE r.id = ?
      `;

      const [rubricRows] = await this.db.execute(rubricQuery, [rubricId]);
      
      if (rubricRows.length === 0) {
        return null;
      }

      const rubric = rubricRows[0];

      // Get criteria for this rubric
      let criteriaQuery = `
        SELECT 
          rc.id,
          rc.rubric_id,
          rc.criterion_name,
          rc.description,
          rc.max_score,
          rc.weight_percentage,
          rc.\`order\`,
          rc.created_at,
          rc.updated_at
        FROM rubric_criteria rc
        WHERE rc.rubric_id = ?
        ORDER BY rc.\`order\` ASC
      `;

      const [criteriaRows] = await this.db.execute(criteriaQuery, [rubricId]);
      rubric.criteria = criteriaRows;

      // If includeLevels is true, get levels for each criterion
      if (includeLevels && criteriaRows.length > 0) {
        for (let criterion of rubric.criteria) {
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

          const [levelsRows] = await this.db.execute(levelsQuery, [criterion.id]);
          criterion.levels = levelsRows;
        }
      }

      return rubric;
    } catch (error) {
      throw new Error(`Error in getWithCriteria: ${error.message}`);
    }
  }

  /**
   * Get all rubrics with optional filtering
   * @param {Object} filters - Filter options
   * @param {number} filters.courseOfferingId - Filter by course offering
   * @param {number} filters.cloId - Filter by CLO
   * @param {number} filters.createdBy - Filter by creator
   * @param {Object} options - Query options
   * @param {boolean} options.includeCriteria - Include criteria
   * @param {boolean} options.includeLevels - Include levels for criteria
   * @returns {Promise<Array>} Array of rubrics
   */
  async getAllWithDetails(filters = {}, options = {}) {
    try {
      const {
        courseOfferingId,
        cloId,
        createdBy
      } = filters;

      const {
        includeCriteria = false,
        includeLevels = false
      } = options;

      let query = `
        SELECT 
          r.*,
          clo.outcome_code as clo_code,
          clo.description as clo_description,
          u.name as creator_name
        FROM ${this.tableName} r
        LEFT JOIN course_learning_outcomes clo ON r.course_learning_outcome_id = clo.id
        LEFT JOIN users u ON r.created_by = u.id
        WHERE 1=1
      `;

      const params = [];

      if (cloId) {
        query += ' AND r.course_learning_outcome_id = ?';
        params.push(cloId);
      }

      if (createdBy) {
        query += ' AND r.created_by = ?';
        params.push(createdBy);
      }

      query += ' ORDER BY r.created_at DESC';

      const [rubrics] = await this.db.execute(query, params);

      // If includeCriteria is true, get criteria for each rubric
      if (includeCriteria && rubrics.length > 0) {
        for (let rubric of rubrics) {
          const rubricWithCriteria = await this.getWithCriteria(rubric.id, {
            includeLevels,
            includeCLO: false,
            includeCreator: false
          });
          rubric.criteria = rubricWithCriteria.criteria;
        }
      }

      return rubrics;
    } catch (error) {
      throw new Error(`Error in getAllWithDetails: ${error.message}`);
    }
  }

  /**
   * Get rubrics by CLO
   * @param {number} cloId - CLO ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of rubrics
   */
  async getByCLO(cloId, options = {}) {
    try {
      return await this.getAllWithDetails({ cloId }, options);
    } catch (error) {
      throw new Error(`Error in getByCLO: ${error.message}`);
    }
  }

  /**
   * Get rubrics created by a specific user
   * @param {number} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of rubrics
   */
  async getByCreator(userId, options = {}) {
    try {
      return await this.getAllWithDetails({ createdBy: userId }, options);
    } catch (error) {
      throw new Error(`Error in getByCreator: ${error.message}`);
    }
  }

  /**
   * Create a new rubric
   * @param {Object} rubricData - Rubric data
   * @returns {Promise<Object>} Created rubric
   */
  async create(rubricData) {
    try {
      const {
        name,
        description,
        course_learning_outcome_id,
        created_by
      } = rubricData;

      const query = `
        INSERT INTO ${this.tableName} 
        (name, description, course_learning_outcome_id, created_by)
        VALUES (?, ?, ?, ?)
      `;

      const [result] = await this.db.execute(query, [
        name,
        description || null,
        course_learning_outcome_id || null,
        created_by
      ]);

      return await this.findById(result.insertId);
    } catch (error) {
      throw new Error(`Error in create: ${error.message}`);
    }
  }

  /**
   * Update a rubric
   * @param {number} rubricId - Rubric ID
   * @param {Object} rubricData - Updated rubric data
   * @returns {Promise<Object>} Updated rubric
   */
  async update(rubricId, rubricData) {
    try {
      const {
        name,
        description,
        course_learning_outcome_id
      } = rubricData;

      const query = `
        UPDATE ${this.tableName}
        SET name = ?,
            description = ?,
            course_learning_outcome_id = ?
        WHERE id = ?
      `;

      await this.db.execute(query, [
        name,
        description || null,
        course_learning_outcome_id || null,
        rubricId
      ]);

      return await this.findById(rubricId);
    } catch (error) {
      throw new Error(`Error in update: ${error.message}`);
    }
  }

  /**
   * Delete a rubric
   * @param {number} rubricId - Rubric ID
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(rubricId) {
    try {
      const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
      const [result] = await this.db.execute(query, [rubricId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error in delete: ${error.message}`);
    }
  }
}

module.exports = Rubric;
