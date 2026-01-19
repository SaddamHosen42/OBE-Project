const CourseLearningOutcome = require('../models/CourseLearningOutcome');

/**
 * CLO Controller
 * Handles Course Learning Outcome operations including CRUD and PLO mapping
 */
const CLOController = {
  /**
   * List all CLOs with optional filtering
   * @route GET /api/clos
   */
  index: async (req, res) => {
    try {
      const {
        courseId,
        includeBloomLevel = 'true',
        includePLOMappings = 'false',
        orderBy = 'CLO_ID',
        order = 'ASC'
      } = req.query;

      const cloModel = new CourseLearningOutcome();

      if (courseId) {
        // Get CLOs for specific course
        const clos = await cloModel.getByCourse(parseInt(courseId), {
          includeBloomLevel: includeBloomLevel === 'true',
          includePLOMappings: includePLOMappings === 'true',
          orderBy,
          order: order.toUpperCase()
        });

        return res.status(200).json({
          success: true,
          data: clos,
          count: clos.length
        });
      }

      // Get all CLOs
      const clos = await cloModel.findAll({
        orderBy,
        order: order.toUpperCase()
      });

      res.status(200).json({
        success: true,
        data: clos,
        count: clos.length
      });
    } catch (error) {
      console.error('Error in CLOController.index:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch CLOs',
        error: error.message
      });
    }
  },

  /**
   * Get a single CLO by ID
   * @route GET /api/clos/:id
   */
  show: async (req, res) => {
    try {
      const { id } = req.params;
      const { includePLOMappings = 'false', includeAttainment = 'false' } = req.query;

      const cloModel = new CourseLearningOutcome();
      const clo = await cloModel.findById(id);

      if (!clo) {
        return res.status(404).json({
          success: false,
          message: 'CLO not found'
        });
      }

      // Optionally include PLO mappings
      if (includePLOMappings === 'true') {
        clo.plo_mappings = await cloModel.getMappedPLOs(id);
      }

      // Optionally include attainment data
      if (includeAttainment === 'true') {
        clo.attainment = await cloModel.getAttainment(id);
      }

      res.status(200).json({
        success: true,
        data: clo
      });
    } catch (error) {
      console.error('Error in CLOController.show:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch CLO',
        error: error.message
      });
    }
  },

  /**
   * Create a new CLO
   * @route POST /api/clos
   */
  store: async (req, res) => {
    try {
      const {
        course_id,
        CLO_ID,
        CLO_Description,
        bloom_taxonomy_level_id,
        weight_percentage,
        target_attainment
      } = req.body;

      const cloModel = new CourseLearningOutcome();
      const newCLO = await cloModel.create({
        course_id,
        CLO_ID,
        CLO_Description,
        bloom_taxonomy_level_id,
        weight_percentage,
        target_attainment
      });

      res.status(201).json({
        success: true,
        message: 'CLO created successfully',
        data: newCLO
      });
    } catch (error) {
      console.error('Error in CLOController.store:', error);
      
      // Check for duplicate CLO_ID error
      if (error.message.includes('Duplicate entry') || error.message.includes('unique_course_clo')) {
        return res.status(409).json({
          success: false,
          message: 'A CLO with this CLO_ID already exists for this course',
          error: error.message
        });
      }

      res.status(400).json({
        success: false,
        message: 'Failed to create CLO',
        error: error.message
      });
    }
  },

  /**
   * Update an existing CLO
   * @route PUT /api/clos/:id
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        course_id,
        CLO_ID,
        CLO_Description,
        bloom_taxonomy_level_id,
        weight_percentage,
        target_attainment
      } = req.body;

      const cloModel = new CourseLearningOutcome();

      // Check if CLO exists
      const existingCLO = await cloModel.findById(id);
      if (!existingCLO) {
        return res.status(404).json({
          success: false,
          message: 'CLO not found'
        });
      }

      const updatedCLO = await cloModel.update(id, {
        course_id,
        CLO_ID,
        CLO_Description,
        bloom_taxonomy_level_id,
        weight_percentage,
        target_attainment
      });

      res.status(200).json({
        success: true,
        message: 'CLO updated successfully',
        data: updatedCLO
      });
    } catch (error) {
      console.error('Error in CLOController.update:', error);
      
      // Check for duplicate CLO_ID error
      if (error.message.includes('Duplicate entry') || error.message.includes('unique_course_clo')) {
        return res.status(409).json({
          success: false,
          message: 'A CLO with this CLO_ID already exists for this course',
          error: error.message
        });
      }

      res.status(400).json({
        success: false,
        message: 'Failed to update CLO',
        error: error.message
      });
    }
  },

  /**
   * Delete a CLO
   * @route DELETE /api/clos/:id
   */
  destroy: async (req, res) => {
    try {
      const { id } = req.params;

      const cloModel = new CourseLearningOutcome();

      // Check if CLO exists
      const existingCLO = await cloModel.findById(id);
      if (!existingCLO) {
        return res.status(404).json({
          success: false,
          message: 'CLO not found'
        });
      }

      await cloModel.delete(id);

      res.status(200).json({
        success: true,
        message: 'CLO deleted successfully'
      });
    } catch (error) {
      console.error('Error in CLOController.destroy:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete CLO',
        error: error.message
      });
    }
  },

  /**
   * Map a CLO to a PLO
   * @route POST /api/clos/:id/map-plo
   */
  mapToPLO: async (req, res) => {
    try {
      const { id } = req.params;
      const { plo_id, mapping_level = 2 } = req.body;

      if (!plo_id) {
        return res.status(400).json({
          success: false,
          message: 'plo_id is required'
        });
      }

      // Validate mapping_level
      const level = parseInt(mapping_level);
      if (![1, 2, 3].includes(level)) {
        return res.status(400).json({
          success: false,
          message: 'mapping_level must be 1 (Low), 2 (Medium), or 3 (High)'
        });
      }

      const cloModel = new CourseLearningOutcome();

      // Check if CLO exists
      const existingCLO = await cloModel.findById(id);
      if (!existingCLO) {
        return res.status(404).json({
          success: false,
          message: 'CLO not found'
        });
      }

      const mapping = await cloModel.mapToPLO(parseInt(id), parseInt(plo_id), level);

      res.status(mapping.updated ? 200 : 201).json({
        success: true,
        message: mapping.updated ? 'CLO-PLO mapping updated successfully' : 'CLO mapped to PLO successfully',
        data: mapping
      });
    } catch (error) {
      console.error('Error in CLOController.mapToPLO:', error);

      // Check for foreign key constraint error
      if (error.message.includes('foreign key constraint') || error.message.includes('fk_clo_plo')) {
        return res.status(404).json({
          success: false,
          message: 'Invalid PLO ID',
          error: error.message
        });
      }

      res.status(400).json({
        success: false,
        message: 'Failed to map CLO to PLO',
        error: error.message
      });
    }
  },

  /**
   * Unmap a CLO from a PLO
   * @route DELETE /api/clos/:id/unmap-plo/:ploId
   */
  unmapFromPLO: async (req, res) => {
    try {
      const { id, ploId } = req.params;

      const cloModel = new CourseLearningOutcome();

      // Check if CLO exists
      const existingCLO = await cloModel.findById(id);
      if (!existingCLO) {
        return res.status(404).json({
          success: false,
          message: 'CLO not found'
        });
      }

      const unmapped = await cloModel.unmapFromPLO(parseInt(id), parseInt(ploId));

      if (!unmapped) {
        return res.status(404).json({
          success: false,
          message: 'Mapping not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'CLO unmapped from PLO successfully'
      });
    } catch (error) {
      console.error('Error in CLOController.unmapFromPLO:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to unmap CLO from PLO',
        error: error.message
      });
    }
  },

  /**
   * Get CLO attainment data
   * @route GET /api/clos/:id/attainment
   */
  getAttainment: async (req, res) => {
    try {
      const { id } = req.params;
      const { academicSessionId, courseOfferingId } = req.query;

      const cloModel = new CourseLearningOutcome();

      // Check if CLO exists
      const existingCLO = await cloModel.findById(id);
      if (!existingCLO) {
        return res.status(404).json({
          success: false,
          message: 'CLO not found'
        });
      }

      const attainment = await cloModel.getAttainment(parseInt(id), {
        academicSessionId: academicSessionId ? parseInt(academicSessionId) : null,
        courseOfferingId: courseOfferingId ? parseInt(courseOfferingId) : null
      });

      res.status(200).json({
        success: true,
        data: attainment
      });
    } catch (error) {
      console.error('Error in CLOController.getAttainment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch CLO attainment',
        error: error.message
      });
    }
  },

  /**
   * Get course attainment summary (all CLOs for a course)
   * @route GET /api/clos/course/:courseId/attainment-summary
   */
  getCourseAttainmentSummary: async (req, res) => {
    try {
      const { courseId } = req.params;
      const { courseOfferingId } = req.query;

      const cloModel = new CourseLearningOutcome();

      const summary = await cloModel.getCourseAttainmentSummary(
        parseInt(courseId),
        courseOfferingId ? parseInt(courseOfferingId) : null
      );

      res.status(200).json({
        success: true,
        data: summary,
        count: summary.length
      });
    } catch (error) {
      console.error('Error in CLOController.getCourseAttainmentSummary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch course attainment summary',
        error: error.message
      });
    }
  },

  /**
   * Get mapped PLOs for a CLO
   * @route GET /api/clos/:id/plos
   */
  getMappedPLOs: async (req, res) => {
    try {
      const { id } = req.params;

      const cloModel = new CourseLearningOutcome();

      // Check if CLO exists
      const existingCLO = await cloModel.findById(id);
      if (!existingCLO) {
        return res.status(404).json({
          success: false,
          message: 'CLO not found'
        });
      }

      const plos = await cloModel.getMappedPLOs(parseInt(id));

      res.status(200).json({
        success: true,
        data: plos,
        count: plos.length
      });
    } catch (error) {
      console.error('Error in CLOController.getMappedPLOs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch mapped PLOs',
        error: error.message
      });
    }
  }
};

module.exports = CLOController;
