const ActionPlan = require('../models/ActionPlan');
const ActionPlanOutcome = require('../models/ActionPlanOutcome');

/**
 * Action Plan Controller
 * Handles action plan operations including CRUD, outcomes management, and status updates
 */
const ActionPlanController = {
  /**
   * List all action plans with optional filtering
   * @route GET /api/action-plans
   */
  index: async (req, res) => {
    try {
      const {
        degreeId,
        status,
        includeOutcomes = 'false',
        orderBy = 'created_at',
        order = 'DESC'
      } = req.query;

      const actionPlanModel = new ActionPlan();

      // Filter by degree
      if (degreeId) {
        const plans = await actionPlanModel.getByDegree(parseInt(degreeId), {
          includeOutcomes: includeOutcomes === 'true',
          orderBy,
          order: order.toUpperCase(),
          status
        });

        return res.status(200).json({
          success: true,
          data: plans,
          count: plans.length
        });
      }

      // Filter by status
      if (status) {
        const plans = await actionPlanModel.getByStatus(status, {
          includeOutcomes: includeOutcomes === 'true',
          orderBy,
          order: order.toUpperCase()
        });

        return res.status(200).json({
          success: true,
          data: plans,
          count: plans.length
        });
      }

      // Get all action plans
      const plans = await actionPlanModel.findAll({
        orderBy,
        order: order.toUpperCase()
      });

      res.status(200).json({
        success: true,
        data: plans,
        count: plans.length
      });
    } catch (error) {
      console.error('Error in ActionPlanController.index:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch action plans',
        error: error.message
      });
    }
  },

  /**
   * Get a single action plan by ID
   * @route GET /api/action-plans/:id
   */
  show: async (req, res) => {
    try {
      const { id } = req.params;
      const { includeOutcomes = 'false' } = req.query;

      const actionPlanModel = new ActionPlan();
      const plan = await actionPlanModel.findById(id);

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Action plan not found'
        });
      }

      // Optionally include outcomes
      if (includeOutcomes === 'true') {
        plan.outcomes = await actionPlanModel.getOutcomes(id);
      }

      res.status(200).json({
        success: true,
        data: plan
      });
    } catch (error) {
      console.error('Error in ActionPlanController.show:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch action plan',
        error: error.message
      });
    }
  },

  /**
   * Create a new action plan
   * @route POST /api/action-plans
   */
  store: async (req, res) => {
    try {
      const {
        degree_id,
        title,
        description,
        status = 'Draft',
        priority = 'Medium',
        start_date,
        end_date,
        responsible_person
      } = req.body;

      // Validation
      if (!degree_id || !title) {
        return res.status(400).json({
          success: false,
          message: 'Degree ID and title are required'
        });
      }

      const actionPlanModel = new ActionPlan();
      const planData = {
        degree_id,
        title,
        description,
        status,
        priority,
        start_date: start_date || null,
        end_date: end_date || null,
        responsible_person: responsible_person || null
      };

      const newPlan = await actionPlanModel.create(planData);

      res.status(201).json({
        success: true,
        message: 'Action plan created successfully',
        data: newPlan
      });
    } catch (error) {
      console.error('Error in ActionPlanController.store:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create action plan',
        error: error.message
      });
    }
  },

  /**
   * Update an action plan
   * @route PUT /api/action-plans/:id
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        degree_id,
        title,
        description,
        status,
        priority,
        start_date,
        end_date,
        responsible_person
      } = req.body;

      const actionPlanModel = new ActionPlan();

      // Check if plan exists
      const existingPlan = await actionPlanModel.findById(id);
      if (!existingPlan) {
        return res.status(404).json({
          success: false,
          message: 'Action plan not found'
        });
      }

      const updateData = {
        degree_id,
        title,
        description,
        status,
        priority,
        start_date,
        end_date,
        responsible_person
      };

      const updatedPlan = await actionPlanModel.update(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Action plan updated successfully',
        data: updatedPlan
      });
    } catch (error) {
      console.error('Error in ActionPlanController.update:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update action plan',
        error: error.message
      });
    }
  },

  /**
   * Delete an action plan
   * @route DELETE /api/action-plans/:id
   */
  destroy: async (req, res) => {
    try {
      const { id } = req.params;

      const actionPlanModel = new ActionPlan();

      // Check if plan exists
      const plan = await actionPlanModel.findById(id);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Action plan not found'
        });
      }

      await actionPlanModel.delete(id);

      res.status(200).json({
        success: true,
        message: 'Action plan deleted successfully'
      });
    } catch (error) {
      console.error('Error in ActionPlanController.destroy:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete action plan',
        error: error.message
      });
    }
  },

  /**
   * Update action plan status
   * @route PATCH /api/action-plans/:id/status
   */
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const actionPlanModel = new ActionPlan();

      // Check if plan exists
      const plan = await actionPlanModel.findById(id);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Action plan not found'
        });
      }

      const updatedPlan = await actionPlanModel.updateStatus(id, status);

      res.status(200).json({
        success: true,
        message: 'Action plan status updated successfully',
        data: updatedPlan
      });
    } catch (error) {
      console.error('Error in ActionPlanController.updateStatus:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update action plan status',
        error: error.message
      });
    }
  },

  /**
   * Add an outcome to an action plan
   * @route POST /api/action-plans/:id/outcomes
   */
  addOutcome: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        outcome_type,
        outcome_id,
        description,
        target_value = 0,
        current_value = 0,
        status = 'Not Started'
      } = req.body;

      // Validation
      if (!outcome_type || !outcome_id) {
        return res.status(400).json({
          success: false,
          message: 'Outcome type and outcome ID are required'
        });
      }

      const actionPlanModel = new ActionPlan();

      // Check if action plan exists
      const plan = await actionPlanModel.findById(id);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Action plan not found'
        });
      }

      const outcomeModel = new ActionPlanOutcome();
      const outcomeData = {
        action_plan_id: id,
        outcome_type,
        outcome_id,
        description,
        target_value,
        current_value,
        status
      };

      const newOutcome = await outcomeModel.create(outcomeData);

      res.status(201).json({
        success: true,
        message: 'Outcome added to action plan successfully',
        data: newOutcome
      });
    } catch (error) {
      console.error('Error in ActionPlanController.addOutcome:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add outcome to action plan',
        error: error.message
      });
    }
  },

  /**
   * Get all outcomes for an action plan
   * @route GET /api/action-plans/:id/outcomes
   */
  getOutcomes: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, orderBy = 'created_at', order = 'ASC' } = req.query;

      const actionPlanModel = new ActionPlan();

      // Check if action plan exists
      const plan = await actionPlanModel.findById(id);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Action plan not found'
        });
      }

      const outcomeModel = new ActionPlanOutcome();
      const outcomes = await outcomeModel.getByActionPlan(id, {
        status,
        orderBy,
        order: order.toUpperCase()
      });

      res.status(200).json({
        success: true,
        data: outcomes,
        count: outcomes.length
      });
    } catch (error) {
      console.error('Error in ActionPlanController.getOutcomes:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch outcomes',
        error: error.message
      });
    }
  },

  /**
   * Bulk add outcomes to an action plan
   * @route POST /api/action-plans/:id/outcomes/bulk
   */
  bulkAddOutcomes: async (req, res) => {
    try {
      const { id } = req.params;
      const { outcomes } = req.body;

      // Validation
      if (!Array.isArray(outcomes) || outcomes.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Outcomes must be a non-empty array'
        });
      }

      const actionPlanModel = new ActionPlan();

      // Check if action plan exists
      const plan = await actionPlanModel.findById(id);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Action plan not found'
        });
      }

      const outcomeModel = new ActionPlanOutcome();
      const createdOutcomes = await outcomeModel.bulkCreate(id, outcomes);

      res.status(201).json({
        success: true,
        message: `${createdOutcomes.length} outcomes added successfully`,
        data: createdOutcomes,
        count: createdOutcomes.length
      });
    } catch (error) {
      console.error('Error in ActionPlanController.bulkAddOutcomes:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk add outcomes',
        error: error.message
      });
    }
  },

  /**
   * Get action plans by status
   * @route GET /api/action-plans/status/:status
   */
  getByStatus: async (req, res) => {
    try {
      const { status } = req.params;
      const {
        degreeId,
        includeOutcomes = 'false',
        orderBy = 'priority',
        order = 'ASC'
      } = req.query;

      const actionPlanModel = new ActionPlan();
      const plans = await actionPlanModel.getByStatus(status, {
        degreeId: degreeId ? parseInt(degreeId) : null,
        includeOutcomes: includeOutcomes === 'true',
        orderBy,
        order: order.toUpperCase()
      });

      res.status(200).json({
        success: true,
        data: plans,
        count: plans.length
      });
    } catch (error) {
      console.error('Error in ActionPlanController.getByStatus:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch action plans by status',
        error: error.message
      });
    }
  },

  /**
   * Get overdue action plans
   * @route GET /api/action-plans/overdue
   */
  getOverdue: async (req, res) => {
    try {
      const { degreeId } = req.query;

      const actionPlanModel = new ActionPlan();
      const overduePlans = await actionPlanModel.getOverdue(
        degreeId ? parseInt(degreeId) : null
      );

      res.status(200).json({
        success: true,
        data: overduePlans,
        count: overduePlans.length
      });
    } catch (error) {
      console.error('Error in ActionPlanController.getOverdue:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch overdue action plans',
        error: error.message
      });
    }
  },

  /**
   * Get action plan statistics
   * @route GET /api/action-plans/statistics
   */
  getStatistics: async (req, res) => {
    try {
      const { degreeId } = req.query;

      const actionPlanModel = new ActionPlan();
      const statistics = await actionPlanModel.getStatistics(
        degreeId ? parseInt(degreeId) : null
      );

      res.status(200).json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Error in ActionPlanController.getStatistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
        error: error.message
      });
    }
  },

  /**
   * Get outcome statistics for an action plan
   * @route GET /api/action-plans/:id/outcomes/statistics
   */
  getOutcomeStatistics: async (req, res) => {
    try {
      const { id } = req.params;

      const actionPlanModel = new ActionPlan();

      // Check if action plan exists
      const plan = await actionPlanModel.findById(id);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Action plan not found'
        });
      }

      const outcomeModel = new ActionPlanOutcome();
      const statistics = await outcomeModel.getStatistics(id);

      res.status(200).json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Error in ActionPlanController.getOutcomeStatistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch outcome statistics',
        error: error.message
      });
    }
  }
};

module.exports = ActionPlanController;
