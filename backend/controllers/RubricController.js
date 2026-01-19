const Rubric = require('../models/Rubric');
const RubricCriteria = require('../models/RubricCriteria');
const RubricLevel = require('../models/RubricLevel');

/**
 * Rubric Controller
 * Handles rubric operations for assessments
 */
const RubricController = {
  /**
   * Get all rubrics with optional filtering
   * @route GET /api/rubrics
   * Query params:
   *   - cloId: Filter by CLO
   *   - createdBy: Filter by creator
   *   - includeCriteria: Include criteria (true/false)
   *   - includeLevels: Include levels (true/false)
   */
  index: async (req, res) => {
    try {
      const { 
        cloId,
        createdBy,
        includeCriteria = 'false',
        includeLevels = 'false'
      } = req.query;

      const rubricModel = new Rubric();
      const filters = {};

      if (cloId) filters.cloId = parseInt(cloId);
      if (createdBy) filters.createdBy = parseInt(createdBy);

      const rubrics = await rubricModel.getAllWithDetails(filters, {
        includeCriteria: includeCriteria === 'true',
        includeLevels: includeLevels === 'true'
      });

      return res.status(200).json({
        success: true,
        message: 'Rubrics retrieved successfully',
        data: rubrics
      });
    } catch (error) {
      console.error('Error in index:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve rubrics',
        error: error.message
      });
    }
  },

  /**
   * Get a specific rubric by ID with full details
   * @route GET /api/rubrics/:id
   * Query params:
   *   - includeLevels: Include levels for criteria (default: true)
   *   - includeCLO: Include CLO details (default: true)
   *   - includeCreator: Include creator details (default: false)
   */
  show: async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        includeLevels = 'true',
        includeCLO = 'true',
        includeCreator = 'false'
      } = req.query;

      const rubricModel = new Rubric();
      const rubric = await rubricModel.getWithCriteria(id, {
        includeLevels: includeLevels === 'true',
        includeCLO: includeCLO === 'true',
        includeCreator: includeCreator === 'true'
      });

      if (!rubric) {
        return res.status(404).json({
          success: false,
          message: 'Rubric not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Rubric retrieved successfully',
        data: rubric
      });
    } catch (error) {
      console.error('Error in show:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve rubric',
        error: error.message
      });
    }
  },

  /**
   * Create a new rubric
   * @route POST /api/rubrics
   * Body: {
   *   name: string (required),
   *   description: string,
   *   course_learning_outcome_id: number,
   *   created_by: number (required)
   * }
   */
  store: async (req, res) => {
    try {
      const { name, description, course_learning_outcome_id, created_by } = req.body;

      // Validation
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Name is required'
        });
      }

      if (!created_by) {
        return res.status(400).json({
          success: false,
          message: 'Created by (user ID) is required'
        });
      }

      const rubricModel = new Rubric();
      const rubric = await rubricModel.create({
        name,
        description,
        course_learning_outcome_id,
        created_by
      });

      return res.status(201).json({
        success: true,
        message: 'Rubric created successfully',
        data: rubric
      });
    } catch (error) {
      console.error('Error in store:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create rubric',
        error: error.message
      });
    }
  },

  /**
   * Update a rubric
   * @route PUT /api/rubrics/:id
   * Body: {
   *   name: string,
   *   description: string,
   *   course_learning_outcome_id: number
   * }
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, course_learning_outcome_id } = req.body;

      // Validation
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Name is required'
        });
      }

      const rubricModel = new Rubric();
      
      // Check if rubric exists
      const existingRubric = await rubricModel.findById(id);
      if (!existingRubric) {
        return res.status(404).json({
          success: false,
          message: 'Rubric not found'
        });
      }

      const rubric = await rubricModel.update(id, {
        name,
        description,
        course_learning_outcome_id
      });

      return res.status(200).json({
        success: true,
        message: 'Rubric updated successfully',
        data: rubric
      });
    } catch (error) {
      console.error('Error in update:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update rubric',
        error: error.message
      });
    }
  },

  /**
   * Delete a rubric
   * @route DELETE /api/rubrics/:id
   */
  destroy: async (req, res) => {
    try {
      const { id } = req.params;

      const rubricModel = new Rubric();
      
      // Check if rubric exists
      const existingRubric = await rubricModel.findById(id);
      if (!existingRubric) {
        return res.status(404).json({
          success: false,
          message: 'Rubric not found'
        });
      }

      await rubricModel.delete(id);

      return res.status(200).json({
        success: true,
        message: 'Rubric deleted successfully'
      });
    } catch (error) {
      console.error('Error in destroy:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete rubric',
        error: error.message
      });
    }
  },

  /**
   * Add a criterion to a rubric
   * @route POST /api/rubrics/:id/criteria
   * Body: {
   *   criterion_name: string (required),
   *   description: string,
   *   max_score: number,
   *   weight_percentage: number,
   *   order: number
   * }
   */
  addCriteria: async (req, res) => {
    try {
      const { id } = req.params;
      const { criterion_name, description, max_score, weight_percentage, order } = req.body;

      // Validation
      if (!criterion_name) {
        return res.status(400).json({
          success: false,
          message: 'Criterion name is required'
        });
      }

      const rubricModel = new Rubric();
      
      // Check if rubric exists
      const existingRubric = await rubricModel.findById(id);
      if (!existingRubric) {
        return res.status(404).json({
          success: false,
          message: 'Rubric not found'
        });
      }

      const criteriaModel = new RubricCriteria();
      const criteria = await criteriaModel.create({
        rubric_id: id,
        criterion_name,
        description,
        max_score: max_score || 0,
        weight_percentage: weight_percentage || 0,
        order: order || 0
      });

      return res.status(201).json({
        success: true,
        message: 'Criterion added successfully',
        data: criteria
      });
    } catch (error) {
      console.error('Error in addCriteria:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to add criterion',
        error: error.message
      });
    }
  },

  /**
   * Add a level to a criterion
   * @route POST /api/rubrics/criteria/:criteriaId/levels
   * Body: {
   *   level_name: string (required),
   *   level_score: number (required),
   *   description: string
   * }
   */
  addLevel: async (req, res) => {
    try {
      const { criteriaId } = req.params;
      const { level_name, level_score, description } = req.body;

      // Validation
      if (!level_name) {
        return res.status(400).json({
          success: false,
          message: 'Level name is required'
        });
      }

      if (level_score === undefined || level_score === null) {
        return res.status(400).json({
          success: false,
          message: 'Level score is required'
        });
      }

      const criteriaModel = new RubricCriteria();
      
      // Check if criteria exists
      const existingCriteria = await criteriaModel.findById(criteriaId);
      if (!existingCriteria) {
        return res.status(404).json({
          success: false,
          message: 'Criterion not found'
        });
      }

      const levelModel = new RubricLevel();
      const level = await levelModel.create({
        rubric_criteria_id: criteriaId,
        level_name,
        level_score,
        description
      });

      return res.status(201).json({
        success: true,
        message: 'Level added successfully',
        data: level
      });
    } catch (error) {
      console.error('Error in addLevel:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to add level',
        error: error.message
      });
    }
  },

  /**
   * Get rubrics by CLO
   * @route GET /api/rubrics/clo/:cloId
   */
  getByCLO: async (req, res) => {
    try {
      const { cloId } = req.params;
      const { includeCriteria = 'true', includeLevels = 'false' } = req.query;

      const rubricModel = new Rubric();
      const rubrics = await rubricModel.getByCLO(cloId, {
        includeCriteria: includeCriteria === 'true',
        includeLevels: includeLevels === 'true'
      });

      return res.status(200).json({
        success: true,
        message: 'Rubrics retrieved successfully',
        data: rubrics
      });
    } catch (error) {
      console.error('Error in getByCLO:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve rubrics by CLO',
        error: error.message
      });
    }
  },

  /**
   * Get criteria for a rubric
   * @route GET /api/rubrics/:id/criteria
   * Query params:
   *   - includeLevels: Include levels (default: true)
   */
  getCriteria: async (req, res) => {
    try {
      const { id } = req.params;
      const { includeLevels = 'true' } = req.query;

      const criteriaModel = new RubricCriteria();
      const criteria = await criteriaModel.getByRubric(id, {
        includeLevels: includeLevels === 'true'
      });

      return res.status(200).json({
        success: true,
        message: 'Criteria retrieved successfully',
        data: criteria
      });
    } catch (error) {
      console.error('Error in getCriteria:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve criteria',
        error: error.message
      });
    }
  },

  /**
   * Update a criterion
   * @route PUT /api/rubrics/criteria/:criteriaId
   * Body: {
   *   criterion_name: string,
   *   description: string,
   *   max_score: number,
   *   weight_percentage: number,
   *   order: number
   * }
   */
  updateCriteria: async (req, res) => {
    try {
      const { criteriaId } = req.params;
      const { criterion_name, description, max_score, weight_percentage, order } = req.body;

      // Validation
      if (!criterion_name) {
        return res.status(400).json({
          success: false,
          message: 'Criterion name is required'
        });
      }

      const criteriaModel = new RubricCriteria();
      
      // Check if criteria exists
      const existingCriteria = await criteriaModel.findById(criteriaId);
      if (!existingCriteria) {
        return res.status(404).json({
          success: false,
          message: 'Criterion not found'
        });
      }

      const criteria = await criteriaModel.update(criteriaId, {
        criterion_name,
        description,
        max_score,
        weight_percentage,
        order
      });

      return res.status(200).json({
        success: true,
        message: 'Criterion updated successfully',
        data: criteria
      });
    } catch (error) {
      console.error('Error in updateCriteria:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update criterion',
        error: error.message
      });
    }
  },

  /**
   * Delete a criterion
   * @route DELETE /api/rubrics/criteria/:criteriaId
   */
  deleteCriteria: async (req, res) => {
    try {
      const { criteriaId } = req.params;

      const criteriaModel = new RubricCriteria();
      
      // Check if criteria exists
      const existingCriteria = await criteriaModel.findById(criteriaId);
      if (!existingCriteria) {
        return res.status(404).json({
          success: false,
          message: 'Criterion not found'
        });
      }

      await criteriaModel.delete(criteriaId);

      return res.status(200).json({
        success: true,
        message: 'Criterion deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteCriteria:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete criterion',
        error: error.message
      });
    }
  },

  /**
   * Update a level
   * @route PUT /api/rubrics/levels/:levelId
   * Body: {
   *   level_name: string,
   *   level_score: number,
   *   description: string
   * }
   */
  updateLevel: async (req, res) => {
    try {
      const { levelId } = req.params;
      const { level_name, level_score, description } = req.body;

      // Validation
      if (!level_name) {
        return res.status(400).json({
          success: false,
          message: 'Level name is required'
        });
      }

      if (level_score === undefined || level_score === null) {
        return res.status(400).json({
          success: false,
          message: 'Level score is required'
        });
      }

      const levelModel = new RubricLevel();
      
      // Check if level exists
      const existingLevel = await levelModel.findById(levelId);
      if (!existingLevel) {
        return res.status(404).json({
          success: false,
          message: 'Level not found'
        });
      }

      const level = await levelModel.update(levelId, {
        level_name,
        level_score,
        description
      });

      return res.status(200).json({
        success: true,
        message: 'Level updated successfully',
        data: level
      });
    } catch (error) {
      console.error('Error in updateLevel:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update level',
        error: error.message
      });
    }
  },

  /**
   * Delete a level
   * @route DELETE /api/rubrics/levels/:levelId
   */
  deleteLevel: async (req, res) => {
    try {
      const { levelId } = req.params;

      const levelModel = new RubricLevel();
      
      // Check if level exists
      const existingLevel = await levelModel.findById(levelId);
      if (!existingLevel) {
        return res.status(404).json({
          success: false,
          message: 'Level not found'
        });
      }

      await levelModel.delete(levelId);

      return res.status(200).json({
        success: true,
        message: 'Level deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteLevel:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete level',
        error: error.message
      });
    }
  }
};

module.exports = RubricController;
