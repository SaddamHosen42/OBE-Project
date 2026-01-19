const BaseModel = require('./BaseModel');

/**
 * Action Plan Model
 * Handles action plan CRUD operations and related queries
 */
class ActionPlan extends BaseModel {
  constructor() {
    super('action_plans');
  }

  /**
   * Get all action plans for a specific degree/program
   * @param {number} degreeId - The degree ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of action plans for the degree
   */
  async getByDegree(degreeId, options = {}) {
    try {
      const {
        includeOutcomes = false,
        orderBy = 'created_at',
        order = 'DESC',
        status = null
      } = options;

      let query = `
        SELECT 
          ap.id,
          ap.degree_id,
          ap.title,
          ap.description,
          ap.status,
          ap.priority,
          ap.start_date,
          ap.end_date,
          ap.responsible_person,
          ap.created_at,
          ap.updated_at,
          d.degree_name,
          d.degree_level
        FROM ${this.tableName} ap
        LEFT JOIN degrees d ON ap.degree_id = d.id
        WHERE ap.degree_id = ?
      `;
      const params = [degreeId];

      // Add status filter if provided
      if (status) {
        query += ` AND ap.status = ?`;
        params.push(status);
      }

      query += ` ORDER BY ap.${orderBy} ${order}`;

      const [rows] = await this.db.execute(query, params);

      // Get outcomes if requested
      if (rows.length > 0 && includeOutcomes) {
        for (let plan of rows) {
          plan.outcomes = await this.getOutcomes(plan.id);
        }
      }

      return rows;
    } catch (error) {
      throw new Error(`Error in getByDegree: ${error.message}`);
    }
  }

  /**
   * Get all action plans by status
   * @param {string} status - The status to filter by
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of action plans with the specified status
   */
  async getByStatus(status, options = {}) {
    try {
      const {
        degreeId = null,
        includeOutcomes = false,
        orderBy = 'priority',
        order = 'ASC'
      } = options;

      let query = `
        SELECT 
          ap.id,
          ap.degree_id,
          ap.title,
          ap.description,
          ap.status,
          ap.priority,
          ap.start_date,
          ap.end_date,
          ap.responsible_person,
          ap.created_at,
          ap.updated_at,
          d.degree_name,
          d.degree_level
        FROM ${this.tableName} ap
        LEFT JOIN degrees d ON ap.degree_id = d.id
        WHERE ap.status = ?
      `;
      const params = [status];

      // Add degree filter if provided
      if (degreeId) {
        query += ` AND ap.degree_id = ?`;
        params.push(degreeId);
      }

      query += ` ORDER BY ap.${orderBy} ${order}`;

      const [rows] = await this.db.execute(query, params);

      // Get outcomes if requested
      if (rows.length > 0 && includeOutcomes) {
        for (let plan of rows) {
          plan.outcomes = await this.getOutcomes(plan.id);
        }
      }

      return rows;
    } catch (error) {
      throw new Error(`Error in getByStatus: ${error.message}`);
    }
  }

  /**
   * Get all outcomes for a specific action plan
   * @param {number} actionPlanId - The action plan ID
   * @returns {Promise<Array>} Array of outcomes
   */
  async getOutcomes(actionPlanId) {
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
          apo.updated_at
        FROM action_plan_outcomes apo
        WHERE apo.action_plan_id = ?
        ORDER BY apo.created_at ASC
      `;

      const [rows] = await this.db.execute(query, [actionPlanId]);
      return rows;
    } catch (error) {
      throw new Error(`Error in getOutcomes: ${error.message}`);
    }
  }

  /**
   * Update action plan status
   * @param {number} id - The action plan ID
   * @param {string} status - The new status
   * @returns {Promise<Object>} Updated action plan
   */
  async updateStatus(id, status) {
    try {
      const validStatuses = ['Draft', 'Active', 'Completed', 'On Hold', 'Cancelled'];
      
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      const query = `
        UPDATE ${this.tableName}
        SET status = ?, updated_at = NOW()
        WHERE id = ?
      `;

      const [result] = await this.db.execute(query, [status, id]);

      if (result.affectedRows === 0) {
        throw new Error('Action plan not found');
      }

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error in updateStatus: ${error.message}`);
    }
  }

  /**
   * Get action plans with overdue dates
   * @param {number} degreeId - Optional degree ID to filter
   * @returns {Promise<Array>} Array of overdue action plans
   */
  async getOverdue(degreeId = null) {
    try {
      let query = `
        SELECT 
          ap.id,
          ap.degree_id,
          ap.title,
          ap.description,
          ap.status,
          ap.priority,
          ap.start_date,
          ap.end_date,
          ap.responsible_person,
          ap.created_at,
          ap.updated_at,
          d.degree_name,
          d.degree_level,
          DATEDIFF(NOW(), ap.end_date) as days_overdue
        FROM ${this.tableName} ap
        LEFT JOIN degrees d ON ap.degree_id = d.id
        WHERE ap.end_date < NOW() 
        AND ap.status NOT IN ('Completed', 'Cancelled')
      `;
      const params = [];

      if (degreeId) {
        query += ` AND ap.degree_id = ?`;
        params.push(degreeId);
      }

      query += ` ORDER BY ap.end_date ASC`;

      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error in getOverdue: ${error.message}`);
    }
  }

  /**
   * Get action plan summary statistics
   * @param {number} degreeId - Optional degree ID to filter
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics(degreeId = null) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_plans,
          SUM(CASE WHEN status = 'Draft' THEN 1 ELSE 0 END) as draft_count,
          SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_count,
          SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_count,
          SUM(CASE WHEN status = 'On Hold' THEN 1 ELSE 0 END) as on_hold_count,
          SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled_count,
          SUM(CASE WHEN priority = 'High' THEN 1 ELSE 0 END) as high_priority_count,
          SUM(CASE WHEN priority = 'Medium' THEN 1 ELSE 0 END) as medium_priority_count,
          SUM(CASE WHEN priority = 'Low' THEN 1 ELSE 0 END) as low_priority_count,
          SUM(CASE WHEN end_date < NOW() AND status NOT IN ('Completed', 'Cancelled') THEN 1 ELSE 0 END) as overdue_count
        FROM ${this.tableName}
      `;
      const params = [];

      if (degreeId) {
        query += ` WHERE degree_id = ?`;
        params.push(degreeId);
      }

      const [rows] = await this.db.execute(query, params);
      return rows[0];
    } catch (error) {
      throw new Error(`Error in getStatistics: ${error.message}`);
    }
  }
}

module.exports = ActionPlan;
