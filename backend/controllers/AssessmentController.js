const AssessmentType = require('../models/AssessmentType');
const AssessmentComponent = require('../models/AssessmentComponent');

/**
 * Assessment Controller
 * Handles assessment type and assessment component operations
 */
const AssessmentController = {
  // ============================================
  // ASSESSMENT TYPE METHODS
  // ============================================

  /**
   * Get all assessment types
   * @route GET /api/assessments/types
   */
  getTypes: async (req, res) => {
    try {
      const { category, groupByCategory } = req.query;

      const assessmentTypeModel = new AssessmentType();

      let types;

      if (groupByCategory === 'true') {
        // Get types grouped by category
        types = await assessmentTypeModel.getAllGroupedByCategory();
      } else if (category) {
        // Get types by category
        types = await assessmentTypeModel.getByCategory(category);
      } else {
        // Get all types
        types = await assessmentTypeModel.findAll({
          orderBy: 'category',
          order: 'ASC'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Assessment types retrieved successfully',
        data: types
      });
    } catch (error) {
      console.error('Error in getTypes:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve assessment types',
        error: error.message
      });
    }
  },

  /**
   * Get a specific assessment type by ID
   * @route GET /api/assessments/types/:id
   */
  getTypeById: async (req, res) => {
    try {
      const { id } = req.params;
      const assessmentTypeModel = new AssessmentType();

      const type = await assessmentTypeModel.findById(id);

      if (!type) {
        return res.status(404).json({
          success: false,
          message: 'Assessment type not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Assessment type retrieved successfully',
        data: type
      });
    } catch (error) {
      console.error('Error in getTypeById:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve assessment type',
        error: error.message
      });
    }
  },

  /**
   * Create a new assessment type
   * @route POST /api/assessments/types
   */
  createType: async (req, res) => {
    try {
      const { name, category, description } = req.body;

      // Validate required fields
      if (!name || !category) {
        return res.status(400).json({
          success: false,
          message: 'Name and category are required'
        });
      }

      const assessmentTypeModel = new AssessmentType();
      const typeId = await assessmentTypeModel.create({
        name,
        category,
        description
      });

      const createdType = await assessmentTypeModel.findById(typeId);

      return res.status(201).json({
        success: true,
        message: 'Assessment type created successfully',
        data: createdType
      });
    } catch (error) {
      console.error('Error in createType:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create assessment type',
        error: error.message
      });
    }
  },

  /**
   * Update an assessment type
   * @route PUT /api/assessments/types/:id
   */
  updateType: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, category, description } = req.body;

      const assessmentTypeModel = new AssessmentType();

      // Check if type exists
      const existingType = await assessmentTypeModel.findById(id);
      if (!existingType) {
        return res.status(404).json({
          success: false,
          message: 'Assessment type not found'
        });
      }

      const updated = await assessmentTypeModel.update(id, {
        name,
        category,
        description
      });

      if (!updated) {
        return res.status(400).json({
          success: false,
          message: 'No changes made to assessment type'
        });
      }

      const updatedType = await assessmentTypeModel.findById(id);

      return res.status(200).json({
        success: true,
        message: 'Assessment type updated successfully',
        data: updatedType
      });
    } catch (error) {
      console.error('Error in updateType:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update assessment type',
        error: error.message
      });
    }
  },

  /**
   * Delete an assessment type
   * @route DELETE /api/assessments/types/:id
   */
  deleteType: async (req, res) => {
    try {
      const { id } = req.params;
      const assessmentTypeModel = new AssessmentType();

      // Check if type exists
      const existingType = await assessmentTypeModel.findById(id);
      if (!existingType) {
        return res.status(404).json({
          success: false,
          message: 'Assessment type not found'
        });
      }

      const deleted = await assessmentTypeModel.delete(id);

      if (!deleted) {
        return res.status(400).json({
          success: false,
          message: 'Failed to delete assessment type'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Assessment type deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteType:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete assessment type',
        error: error.message
      });
    }
  },

  // ============================================
  // ASSESSMENT COMPONENT METHODS
  // ============================================

  /**
   * Get all assessment components with filtering
   * @route GET /api/assessments/components
   */
  index: async (req, res) => {
    try {
      const {
        courseOfferingId,
        courseId,
        semesterId,
        published
      } = req.query;

      const assessmentComponentModel = new AssessmentComponent();
      let components;

      if (courseOfferingId) {
        // Get components by course offering
        if (published === 'true') {
          components = await assessmentComponentModel.getPublishedByCourseOffering(
            parseInt(courseOfferingId)
          );
        } else {
          components = await assessmentComponentModel.getByCourseOffering(
            parseInt(courseOfferingId),
            {
              includeType: true,
              includeCLOMapping: true
            }
          );
        }
      } else if (courseId) {
        // Get components by course
        components = await assessmentComponentModel.getByCourse(
          parseInt(courseId),
          semesterId ? parseInt(semesterId) : null
        );
      } else {
        // Get all components (admin view)
        components = await assessmentComponentModel.findAll({
          orderBy: 'created_at',
          order: 'DESC'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Assessment components retrieved successfully',
        data: components
      });
    } catch (error) {
      console.error('Error in index:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve assessment components',
        error: error.message
      });
    }
  },

  /**
   * Get a specific assessment component by ID with details
   * @route GET /api/assessments/components/:id
   */
  show: async (req, res) => {
    try {
      const { id } = req.params;
      const assessmentComponentModel = new AssessmentComponent();

      const component = await assessmentComponentModel.getByIdWithDetails(id, {
        includeType: true,
        includeCLOMapping: true,
        includeCourseOffering: true
      });

      if (!component) {
        return res.status(404).json({
          success: false,
          message: 'Assessment component not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Assessment component retrieved successfully',
        data: component
      });
    } catch (error) {
      console.error('Error in show:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve assessment component',
        error: error.message
      });
    }
  },

  /**
   * Create a new assessment component
   * @route POST /api/assessments/components
   */
  store: async (req, res) => {
    try {
      const {
        course_offering_id,
        assessment_type_id,
        name,
        total_marks,
        weight_percentage,
        scheduled_date,
        duration_minutes,
        instructions,
        is_published
      } = req.body;

      // Validate required fields
      if (!course_offering_id || !assessment_type_id || !name) {
        return res.status(400).json({
          success: false,
          message: 'Course offering ID, assessment type ID, and name are required'
        });
      }

      const assessmentComponentModel = new AssessmentComponent();
      const componentId = await assessmentComponentModel.create({
        course_offering_id,
        assessment_type_id,
        name,
        total_marks: total_marks || 0,
        weight_percentage: weight_percentage || 0,
        scheduled_date,
        duration_minutes,
        instructions,
        is_published: is_published || false
      });

      const createdComponent = await assessmentComponentModel.getByIdWithDetails(
        componentId,
        {
          includeType: true,
          includeCLOMapping: false,
          includeCourseOffering: true
        }
      );

      return res.status(201).json({
        success: true,
        message: 'Assessment component created successfully',
        data: createdComponent
      });
    } catch (error) {
      console.error('Error in store:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create assessment component',
        error: error.message
      });
    }
  },

  /**
   * Update an assessment component
   * @route PUT /api/assessments/components/:id
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        assessment_type_id,
        name,
        total_marks,
        weight_percentage,
        scheduled_date,
        duration_minutes,
        instructions,
        is_published
      } = req.body;

      const assessmentComponentModel = new AssessmentComponent();

      // Check if component exists
      const existingComponent = await assessmentComponentModel.findById(id);
      if (!existingComponent) {
        return res.status(404).json({
          success: false,
          message: 'Assessment component not found'
        });
      }

      const updated = await assessmentComponentModel.update(id, {
        assessment_type_id,
        name,
        total_marks,
        weight_percentage,
        scheduled_date,
        duration_minutes,
        instructions,
        is_published
      });

      if (!updated) {
        return res.status(400).json({
          success: false,
          message: 'No changes made to assessment component'
        });
      }

      const updatedComponent = await assessmentComponentModel.getByIdWithDetails(
        id,
        {
          includeType: true,
          includeCLOMapping: true,
          includeCourseOffering: true
        }
      );

      return res.status(200).json({
        success: true,
        message: 'Assessment component updated successfully',
        data: updatedComponent
      });
    } catch (error) {
      console.error('Error in update:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update assessment component',
        error: error.message
      });
    }
  },

  /**
   * Delete an assessment component
   * @route DELETE /api/assessments/components/:id
   */
  destroy: async (req, res) => {
    try {
      const { id } = req.params;
      const assessmentComponentModel = new AssessmentComponent();

      // Check if component exists
      const existingComponent = await assessmentComponentModel.findById(id);
      if (!existingComponent) {
        return res.status(404).json({
          success: false,
          message: 'Assessment component not found'
        });
      }

      const deleted = await assessmentComponentModel.delete(id);

      if (!deleted) {
        return res.status(400).json({
          success: false,
          message: 'Failed to delete assessment component'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Assessment component deleted successfully'
      });
    } catch (error) {
      console.error('Error in destroy:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete assessment component',
        error: error.message
      });
    }
  },

  // ============================================
  // CLO MAPPING METHODS
  // ============================================

  /**
   * Get CLO mappings for an assessment component
   * @route GET /api/assessments/components/:id/clo-mappings
   */
  getCLOMappings: async (req, res) => {
    try {
      const { id } = req.params;
      const assessmentComponentModel = new AssessmentComponent();

      // Check if component exists
      const component = await assessmentComponentModel.findById(id);
      if (!component) {
        return res.status(404).json({
          success: false,
          message: 'Assessment component not found'
        });
      }

      const mappings = await assessmentComponentModel.getCLOMapping(id);

      return res.status(200).json({
        success: true,
        message: 'CLO mappings retrieved successfully',
        data: mappings
      });
    } catch (error) {
      console.error('Error in getCLOMappings:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve CLO mappings',
        error: error.message
      });
    }
  },

  /**
   * Map an assessment component to a CLO
   * @route POST /api/assessments/components/:id/clo-mappings
   */
  mapToCLO: async (req, res) => {
    try {
      const { id } = req.params;
      const { course_learning_outcome_id, marks_allocated, weight_percentage } = req.body;

      // Validate required fields
      if (!course_learning_outcome_id) {
        return res.status(400).json({
          success: false,
          message: 'Course learning outcome ID is required'
        });
      }

      const assessmentComponentModel = new AssessmentComponent();

      // Check if component exists
      const component = await assessmentComponentModel.findById(id);
      if (!component) {
        return res.status(404).json({
          success: false,
          message: 'Assessment component not found'
        });
      }

      const mappingId = await assessmentComponentModel.mapToCLO({
        assessment_component_id: id,
        course_learning_outcome_id,
        marks_allocated: marks_allocated || 0,
        weight_percentage: weight_percentage || 0
      });

      // Get the created mapping with full details
      const mappings = await assessmentComponentModel.getCLOMapping(id);
      const createdMapping = mappings.find(m => m.id === mappingId);

      return res.status(201).json({
        success: true,
        message: 'Assessment component mapped to CLO successfully',
        data: createdMapping
      });
    } catch (error) {
      console.error('Error in mapToCLO:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to map assessment component to CLO',
        error: error.message
      });
    }
  },

  /**
   * Unmap an assessment component from a CLO
   * @route DELETE /api/assessments/components/:id/clo-mappings/:cloId
   */
  unmapFromCLO: async (req, res) => {
    try {
      const { id, cloId } = req.params;
      const assessmentComponentModel = new AssessmentComponent();

      // Check if component exists
      const component = await assessmentComponentModel.findById(id);
      if (!component) {
        return res.status(404).json({
          success: false,
          message: 'Assessment component not found'
        });
      }

      const unmapped = await assessmentComponentModel.unmapFromCLO(
        parseInt(id),
        parseInt(cloId)
      );

      if (!unmapped) {
        return res.status(404).json({
          success: false,
          message: 'CLO mapping not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Assessment component unmapped from CLO successfully'
      });
    } catch (error) {
      console.error('Error in unmapFromCLO:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to unmap assessment component from CLO',
        error: error.message
      });
    }
  },

  /**
   * Update CLO mapping for an assessment component
   * @route PUT /api/assessments/components/:id/clo-mappings/:mappingId
   */
  updateCLOMapping: async (req, res) => {
    try {
      const { id, mappingId } = req.params;
      const { marks_allocated, weight_percentage } = req.body;

      const assessmentComponentModel = new AssessmentComponent();

      // Check if component exists
      const component = await assessmentComponentModel.findById(id);
      if (!component) {
        return res.status(404).json({
          success: false,
          message: 'Assessment component not found'
        });
      }

      const updated = await assessmentComponentModel.updateCLOMapping(
        parseInt(mappingId),
        { marks_allocated, weight_percentage }
      );

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'CLO mapping not found or no changes made'
        });
      }

      // Get updated mappings
      const mappings = await assessmentComponentModel.getCLOMapping(id);
      const updatedMapping = mappings.find(m => m.id === parseInt(mappingId));

      return res.status(200).json({
        success: true,
        message: 'CLO mapping updated successfully',
        data: updatedMapping
      });
    } catch (error) {
      console.error('Error in updateCLOMapping:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update CLO mapping',
        error: error.message
      });
    }
  }
};

module.exports = AssessmentController;
