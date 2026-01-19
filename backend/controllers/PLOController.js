const ProgramLearningOutcome = require('../models/ProgramLearningOutcome');

/**
 * PLO Controller
 * Handles Program Learning Outcome operations including CRUD, PEO mapping, and attainment tracking
 */
const PLOController = {
  /**
   * List all PLOs with optional filtering
   * @route GET /api/plos
   */
  index: async (req, res) => {
    try {
      const {
        degreeId,
        includeBloomLevel = 'true',
        includePEOMappings = 'false',
        includeCLOMappings = 'false',
        orderBy = 'PLO_No',
        order = 'ASC'
      } = req.query;

      const ploModel = new ProgramLearningOutcome();

      if (degreeId) {
        // Get PLOs for specific degree
        const plos = await ploModel.getByDegree(parseInt(degreeId), {
          includeBloomLevel: includeBloomLevel === 'true',
          includePEOMappings: includePEOMappings === 'true',
          includeCLOMappings: includeCLOMappings === 'true',
          orderBy,
          order: order.toUpperCase()
        });

        return res.status(200).json({
          success: true,
          data: plos,
          count: plos.length
        });
      }

      // Get all PLOs
      const plos = await ploModel.findAll({
        orderBy,
        order: order.toUpperCase()
      });

      res.status(200).json({
        success: true,
        data: plos,
        count: plos.length
      });
    } catch (error) {
      console.error('Error in PLOController.index:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch PLOs',
        error: error.message
      });
    }
  },

  /**
   * Get a single PLO by ID
   * @route GET /api/plos/:id
   */
  show: async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        includePEOMappings = 'false', 
        includeCLOMappings = 'false',
        includeAttainment = 'false' 
      } = req.query;

      const ploModel = new ProgramLearningOutcome();
      const plo = await ploModel.findById(id);

      if (!plo) {
        return res.status(404).json({
          success: false,
          message: 'PLO not found'
        });
      }

      // Optionally include PEO mappings
      if (includePEOMappings === 'true') {
        plo.peo_mappings = await ploModel.getMappedPEOs(id);
      }

      // Optionally include CLO mappings
      if (includeCLOMappings === 'true') {
        plo.clo_mappings = await ploModel.getMappedCLOs(id);
      }

      // Optionally include attainment data
      if (includeAttainment === 'true') {
        plo.attainment = await ploModel.getAttainment(id);
      }

      res.status(200).json({
        success: true,
        data: plo
      });
    } catch (error) {
      console.error('Error in PLOController.show:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch PLO',
        error: error.message
      });
    }
  },

  /**
   * Create a new PLO
   * @route POST /api/plos
   */
  store: async (req, res) => {
    try {
      const {
        degree_id,
        programName,
        PLO_No,
        PLO_Description,
        bloom_taxonomy_level_id,
        target_attainment
      } = req.body;

      // Validate required fields
      if (!degree_id || !PLO_No || !PLO_Description) {
        return res.status(400).json({
          success: false,
          message: 'degree_id, PLO_No, and PLO_Description are required'
        });
      }

      const ploModel = new ProgramLearningOutcome();
      const newPLO = await ploModel.create({
        degree_id,
        programName: programName || null,
        PLO_No,
        PLO_Description,
        bloom_taxonomy_level_id: bloom_taxonomy_level_id || null,
        target_attainment: target_attainment || 60.0
      });

      res.status(201).json({
        success: true,
        message: 'PLO created successfully',
        data: newPLO
      });
    } catch (error) {
      console.error('Error in PLOController.store:', error);
      
      // Check for duplicate PLO_No error
      if (error.message.includes('Duplicate entry') || error.message.includes('unique_degree_plo')) {
        return res.status(409).json({
          success: false,
          message: 'A PLO with this PLO_No already exists for this degree',
          error: error.message
        });
      }

      res.status(400).json({
        success: false,
        message: 'Failed to create PLO',
        error: error.message
      });
    }
  },

  /**
   * Update an existing PLO
   * @route PUT /api/plos/:id
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        programName,
        PLO_No,
        PLO_Description,
        bloom_taxonomy_level_id,
        target_attainment
      } = req.body;

      const ploModel = new ProgramLearningOutcome();

      // Check if PLO exists
      const existingPLO = await ploModel.findById(id);
      if (!existingPLO) {
        return res.status(404).json({
          success: false,
          message: 'PLO not found'
        });
      }

      // Prepare update data (only include provided fields)
      const updateData = {};
      if (programName !== undefined) updateData.programName = programName;
      if (PLO_No !== undefined) updateData.PLO_No = PLO_No;
      if (PLO_Description !== undefined) updateData.PLO_Description = PLO_Description;
      if (bloom_taxonomy_level_id !== undefined) updateData.bloom_taxonomy_level_id = bloom_taxonomy_level_id;
      if (target_attainment !== undefined) updateData.target_attainment = target_attainment;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
      }

      const result = await ploModel.update(updateData, { id });

      res.status(200).json({
        success: true,
        message: 'PLO updated successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in PLOController.update:', error);

      // Check for duplicate PLO_No error
      if (error.message.includes('Duplicate entry') || error.message.includes('unique_degree_plo')) {
        return res.status(409).json({
          success: false,
          message: 'A PLO with this PLO_No already exists for this degree',
          error: error.message
        });
      }

      res.status(400).json({
        success: false,
        message: 'Failed to update PLO',
        error: error.message
      });
    }
  },

  /**
   * Delete a PLO
   * @route DELETE /api/plos/:id
   */
  destroy: async (req, res) => {
    try {
      const { id } = req.params;

      const ploModel = new ProgramLearningOutcome();

      // Check if PLO exists
      const existingPLO = await ploModel.findById(id);
      if (!existingPLO) {
        return res.status(404).json({
          success: false,
          message: 'PLO not found'
        });
      }

      const result = await ploModel.delete({ id });

      res.status(200).json({
        success: true,
        message: 'PLO deleted successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in PLOController.destroy:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete PLO',
        error: error.message
      });
    }
  },

  /**
   * Get all PEOs mapped to a specific PLO
   * @route GET /api/plos/:id/peos
   */
  getMappedPEOs: async (req, res) => {
    try {
      const { id } = req.params;

      const ploModel = new ProgramLearningOutcome();

      // Check if PLO exists
      const plo = await ploModel.findById(id);
      if (!plo) {
        return res.status(404).json({
          success: false,
          message: 'PLO not found'
        });
      }

      const peos = await ploModel.getMappedPEOs(id);

      res.status(200).json({
        success: true,
        data: peos,
        count: peos.length
      });
    } catch (error) {
      console.error('Error in PLOController.getMappedPEOs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch mapped PEOs',
        error: error.message
      });
    }
  },

  /**
   * Get all CLOs mapped to a specific PLO
   * @route GET /api/plos/:id/clos
   */
  getMappedCLOs: async (req, res) => {
    try {
      const { id } = req.params;

      const ploModel = new ProgramLearningOutcome();

      // Check if PLO exists
      const plo = await ploModel.findById(id);
      if (!plo) {
        return res.status(404).json({
          success: false,
          message: 'PLO not found'
        });
      }

      const clos = await ploModel.getMappedCLOs(id);

      res.status(200).json({
        success: true,
        data: clos,
        count: clos.length
      });
    } catch (error) {
      console.error('Error in PLOController.getMappedCLOs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch mapped CLOs',
        error: error.message
      });
    }
  },

  /**
   * Get attainment data for a specific PLO
   * @route GET /api/plos/:id/attainment
   */
  getAttainment: async (req, res) => {
    try {
      const { id } = req.params;
      const { academicSessionId, degreeId } = req.query;

      const ploModel = new ProgramLearningOutcome();

      // Check if PLO exists
      const plo = await ploModel.findById(id);
      if (!plo) {
        return res.status(404).json({
          success: false,
          message: 'PLO not found'
        });
      }

      const attainment = await ploModel.getAttainment(id, {
        academicSessionId: academicSessionId ? parseInt(academicSessionId) : null,
        degreeId: degreeId ? parseInt(degreeId) : null
      });

      res.status(200).json({
        success: true,
        data: attainment
      });
    } catch (error) {
      console.error('Error in PLOController.getAttainment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch PLO attainment',
        error: error.message
      });
    }
  },

  /**
   * Get attainment summary for all PLOs of a degree
   * @route GET /api/plos/degree/:degreeId/attainment-summary
   */
  getDegreeAttainmentSummary: async (req, res) => {
    try {
      const { degreeId } = req.params;
      const { academicSessionId } = req.query;

      const ploModel = new ProgramLearningOutcome();

      const attainmentSummary = await ploModel.getDegreeAttainmentSummary(
        parseInt(degreeId),
        {
          academicSessionId: academicSessionId ? parseInt(academicSessionId) : null
        }
      );

      res.status(200).json({
        success: true,
        data: attainmentSummary,
        count: attainmentSummary.length
      });
    } catch (error) {
      console.error('Error in PLOController.getDegreeAttainmentSummary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch degree attainment summary',
        error: error.message
      });
    }
  },

  /**
   * Map a PLO to a PEO
   * @route POST /api/plos/:id/map-peo
   */
  mapToPEO: async (req, res) => {
    try {
      const { id } = req.params;
      const { peo_id, correlation_level } = req.body;

      // Validate required fields
      if (!peo_id) {
        return res.status(400).json({
          success: false,
          message: 'peo_id is required'
        });
      }

      // Validate correlation level if provided
      const validLevels = ['High', 'Medium', 'Low'];
      if (correlation_level && !validLevels.includes(correlation_level)) {
        return res.status(400).json({
          success: false,
          message: `Invalid correlation_level. Must be one of: ${validLevels.join(', ')}`
        });
      }

      const ploModel = new ProgramLearningOutcome();

      // Check if PLO exists
      const plo = await ploModel.findById(id);
      if (!plo) {
        return res.status(404).json({
          success: false,
          message: 'PLO not found'
        });
      }

      const mapping = await ploModel.mapToPEO(
        parseInt(id),
        parseInt(peo_id),
        correlation_level || 'Medium'
      );

      res.status(mapping.created ? 201 : 200).json({
        success: true,
        message: mapping.created ? 'PLO mapped to PEO successfully' : 'PLO-PEO mapping updated successfully',
        data: mapping
      });
    } catch (error) {
      console.error('Error in PLOController.mapToPEO:', error);
      
      // Check for foreign key constraint error
      if (error.message.includes('foreign key constraint') || error.message.includes('Cannot add or update')) {
        return res.status(404).json({
          success: false,
          message: 'PEO not found or invalid reference',
          error: error.message
        });
      }

      res.status(400).json({
        success: false,
        message: 'Failed to map PLO to PEO',
        error: error.message
      });
    }
  },

  /**
   * Unmap a PLO from a PEO
   * @route DELETE /api/plos/:id/unmap-peo/:peoId
   */
  unmapFromPEO: async (req, res) => {
    try {
      const { id, peoId } = req.params;

      const ploModel = new ProgramLearningOutcome();

      // Check if PLO exists
      const plo = await ploModel.findById(id);
      if (!plo) {
        return res.status(404).json({
          success: false,
          message: 'PLO not found'
        });
      }

      const result = await ploModel.unmapFromPEO(parseInt(id), parseInt(peoId));

      if (!result.deleted) {
        return res.status(404).json({
          success: false,
          message: 'PLO-PEO mapping not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'PLO unmapped from PEO successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in PLOController.unmapFromPEO:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to unmap PLO from PEO',
        error: error.message
      });
    }
  }
};

module.exports = PLOController;
