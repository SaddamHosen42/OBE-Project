const BaseModel = require('./BaseModel');

/**
 * Action Plan Outcome Model
 * Handles action plan outcome CRUD operations and related queries
 */
class ActionPlanOutcome extends BaseModel {
  constructor() {
    super('action_plan_outcomes');
  }

  /**
   * Get all outcomes for a specific action plan
   * @param {number} actionPlanId - The action plan ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of outcomes
   */
  async getByActionPlan(actionPlanId, options = {}) {
    try {
      const {
        orderBy = 'created_at',
        order = 'ASC',
        status = null
      } = options;

      let query = `
        SELECT 
          apo.id,
          apo.action_plan_id,
          apo.outcome_type,
          apo.outcome_id,
          apo.description,
          apo.target_value,
          apo.current_value,
          apo.status,
          apo.created_at,
          apo.updated_at
        FROM ${this.tableName} apo
        WHERE apo.action_plan_id = ?
      `;
      const params = [actionPlanId];

      // Add status filter if provided
      if (status) {
        query += ` AND apo.status = ?`;
        params.push(status);
      }

      query += ` ORDER BY apo.${orderBy} ${order}`;

      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error in getByActionPlan: ${error.message}`);
    }
  }

  /**
   * Get outcomes by type (PLO, CLO, PEO)
   * @param {string} outcomeType - The outcome type (PLO, CLO, PEO)
   * @param {number} outcomeId - The outcome ID
   * @returns {Promise<Array>} Array of action plan outcomes
   */
  async getByOutcome(outcomeType, outcomeId) {
    try {
      const query = `
        SELECT 
          apo.id,
          apo.action_plan_id,
          apo.outcome_type,
          apo.outcome_id,
          apo.description,
          apo.target_value,
          apo.current_value,
          apo.status,
          apo.created_at,
          apo.updated_at,
          ap.title as action_plan_title,
          ap.status as action_plan_status,
          ap.priority as action_plan_priority
        FROM ${this.tableName} apo
        LEFT JOIN action_plans ap ON apo.action_plan_id = ap.id
        WHERE apo.outcome_type = ? AND apo.outcome_id = ?
        ORDER BY apo.created_at DESC
      `;

      const [rows] = await this.db.execute(query, [outcomeType, outcomeId]);
      return rows;
    } catch (error) {
      throw new Error(`Error in getByOutcome: ${error.message}`);
    }
  }

  /**
   * Update outcome progress
   * @param {number} id - The outcome ID
   * @param {number} currentValue - The new current value
   * @param {string} status - Optional status update
   * @returns {Promise<Object>} Updated outcome
   */
  async updateProgress(id, currentValue, status = null) {
    try {
      let query = `
        UPDATE ${this.tableName}
        SET current_value = ?, updated_at = NOW()
      `;
      const params = [currentValue];

      if (status) {
        const validStatuses = ['Not Started', 'In Progress', 'Achieved', 'Partially Achieved', 'Not Achieved'];
        if (!validStatuses.includes(status)) {
          throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }
        query += `, status = ?`;
        params.push(status);
      }

      query += ` WHERE id = ?`;
      params.push(id);

      const [result] = await this.db.execute(query, params);

      if (result.affectedRows === 0) {
        throw new Error('Action plan outcome not found');
      }

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error in updateProgress: ${error.message}`);
    }
  }

  /**
   * Get outcomes that are not achieved
   * @param {number} actionPlanId - Optional action plan ID to filter
   * @returns {Promise<Array>} Array of unachieved outcomes
   */
  async getUnachieved(actionPlanId = null) {
    try {
      let query = `
        SELECT 
          apo.id,
          apo.action_plan_id,
          apo.outcome_type,
          apo.outcome_id,
          apo.description,
          apo.target_value,
          apo.current_value,
          apo.status,
          apo.created_at,
          apo.updated_at,
          ap.title as action_plan_title,
          ap.end_date as action_plan_end_date
        FROM ${this.tableName} apo
        LEFT JOIN action_plans ap ON apo.action_plan_id = ap.id
        WHERE apo.status IN ('Not Started', 'In Progress', 'Partially Achieved', 'Not Achieved')
      `;
      const params = [];

      if (actionPlanId) {
        query += ` AND apo.action_plan_id = ?`;
        params.push(actionPlanId);
      }

      query += ` ORDER BY apo.created_at ASC`;

      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error in getUnachieved: ${error.message}`);
    }
  }

  /**
   * Get outcome achievement statistics for an action plan
   * @param {number} actionPlanId - The action plan ID
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics(actionPlanId) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_outcomes,
          SUM(CASE WHEN status = 'Not Started' THEN 1 ELSE 0 END) as not_started_count,
          SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_count,
          SUM(CASE WHEN status = 'Achieved' THEN 1 ELSE 0 END) as achieved_count,
          SUM(CASE WHEN status = 'Partially Achieved' THEN 1 ELSE 0 END) as partially_achieved_count,
          SUM(CASE WHEN status = 'Not Achieved' THEN 1 ELSE 0 END) as not_achieved_count,
          AVG(CASE WHEN target_value > 0 THEN (current_value / target_value) * 100 ELSE 0 END) as avg_achievement_percentage
        FROM ${this.tableName}
        WHERE action_plan_id = ?
      `;

      const [rows] = await this.db.execute(query, [actionPlanId]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error in getStatistics: ${error.message}`);
    }
  }

  /**
   * Bulk create outcomes for an action plan
   * @param {number} actionPlanId - The action plan ID
   * @param {Array} outcomes - Array of outcome objects
   * @returns {Promise<Array>} Array of created outcomes
   */
  async bulkCreate(actionPlanId, outcomes) {
    try {
      if (!Array.isArray(outcomes) || outcomes.length === 0) {
        throw new Error('Outcomes must be a non-empty array');
      }

      const createdOutcomes = [];

      for (const outcome of outcomes) {
        const data = {
          action_plan_id: actionPlanId,
          outcome_type: outcome.outcome_type,
          outcome_id: outcome.outcome_id,
          description: outcome.description || null,
          target_value: outcome.target_value || 0,
          current_value: outcome.current_value || 0,
          status: outcome.status || 'Not Started'
        };

        const result = await this.create(data);
        createdOutcomes.push(result);
      }

      return createdOutcomes;
    } catch (error) {
      throw new Error(`Error in bulkCreate: ${error.message}`);
    }
  }
}

module.exports = ActionPlanOutcome;
