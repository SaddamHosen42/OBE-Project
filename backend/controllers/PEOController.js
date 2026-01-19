const ProgramEducationalObjective = require('../models/ProgramEducationalObjective');

/**
 * PEO Controller
 * Handles Program Educational Objective operations including CRUD and PLO mapping
 */
const PEOController = {
  /**
   * List all PEOs with optional filtering
   * @route GET /api/peos
   */
  index: async (req, res) => {
    try {
      const {
        degreeId,
        includePLOMappings = 'false',
        orderBy = 'PEO_No',
        order = 'ASC'
      } = req.query;

      const peoModel = new ProgramEducationalObjective();

      if (degreeId) {
        // Get PEOs for specific degree
        const peos = await peoModel.getByDegree(parseInt(degreeId), {
          includePLOMappings: includePLOMappings === 'true',
          orderBy,
          order: order.toUpperCase()
        });

        return res.status(200).json({
          success: true,
          data: peos,
          count: peos.length
        });
      }

      // Get all PEOs
      const peos = await peoModel.findAll({
        orderBy,
        order: order.toUpperCase()
      });

      res.status(200).json({
        success: true,
        data: peos,
        count: peos.length
      });
    } catch (error) {
      console.error('Error in PEOController.index:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch PEOs',
        error: error.message
      });
    }
  },

  /**
   * Get a single PEO by ID
   * @route GET /api/peos/:id
   */
  show: async (req, res) => {
    try {
      const { id } = req.params;
      const { includePLOMappings = 'false' } = req.query;

      const peoModel = new ProgramEducationalObjective();
      const peo = await peoModel.findById(id);

      if (!peo) {
        return res.status(404).json({
          success: false,
          message: 'PEO not found'
        });
      }

      // Optionally include PLO mappings
      if (includePLOMappings === 'true') {
        peo.plo_mappings = await peoModel.getMappedPLOs(id);
      }

      res.status(200).json({
        success: true,
        data: peo
      });
    } catch (error) {
      console.error('Error in PEOController.show:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch PEO',
        error: error.message
      });
    }
  },

  /**
   * Create a new PEO
   * @route POST /api/peos
   */
  store: async (req, res) => {
    try {
      const {
        degree_id,
        PEO_No,
        PEO_Description
      } = req.body;

      // Validate required fields
      if (!degree_id || !PEO_No || !PEO_Description) {
        return res.status(400).json({
          success: false,
          message: 'degree_id, PEO_No, and PEO_Description are required'
        });
      }

      const peoModel = new ProgramEducationalObjective();
      const newPEO = await peoModel.create({
        degree_id,
        PEO_No,
        PEO_Description
      });

      res.status(201).json({
        success: true,
        message: 'PEO created successfully',
        data: newPEO
      });
    } catch (error) {
      console.error('Error in PEOController.store:', error);
      
      // Handle unique constraint violation
      if (error.message.includes('Duplicate entry')) {
        return res.status(409).json({
          success: false,
          message: 'A PEO with this number already exists for this degree'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create PEO',
        error: error.message
      });
    }
  },

  /**
   * Update an existing PEO
   * @route PUT /api/peos/:id
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        degree_id,
        PEO_No,
        PEO_Description
      } = req.body;

      const peoModel = new ProgramEducationalObjective();

      // Check if PEO exists
      const existingPEO = await peoModel.findById(id);
      if (!existingPEO) {
        return res.status(404).json({
          success: false,
          message: 'PEO not found'
        });
      }

      // Update PEO
      const updatedPEO = await peoModel.update(id, {
        degree_id,
        PEO_No,
        PEO_Description
      });

      res.status(200).json({
        success: true,
        message: 'PEO updated successfully',
        data: updatedPEO
      });
    } catch (error) {
      console.error('Error in PEOController.update:', error);

      if (error.message.includes('Duplicate entry')) {
        return res.status(409).json({
          success: false,
          message: 'A PEO with this number already exists for this degree'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update PEO',
        error: error.message
      });
    }
  },

  /**
   * Delete a PEO
   * @route DELETE /api/peos/:id
   */
  destroy: async (req, res) => {
    try {
      const { id } = req.params;

      const peoModel = new ProgramEducationalObjective();

      // Check if PEO exists
      const existingPEO = await peoModel.findById(id);
      if (!existingPEO) {
        return res.status(404).json({
          success: false,
          message: 'PEO not found'
        });
      }

      // Delete PEO (cascades to mappings)
      await peoModel.delete(id);

      res.status(200).json({
        success: true,
        message: 'PEO deleted successfully'
      });
    } catch (error) {
      console.error('Error in PEOController.destroy:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete PEO',
        error: error.message
      });
    }
  },

  /**
   * Get PLOs mapped to a specific PEO
   * @route GET /api/peos/:id/plos
   */
  getMappedPLOs: async (req, res) => {
    try {
      const { id } = req.params;

      const peoModel = new ProgramEducationalObjective();

      // Check if PEO exists
      const peo = await peoModel.findById(id);
      if (!peo) {
        return res.status(404).json({
          success: false,
          message: 'PEO not found'
        });
      }

      const plos = await peoModel.getMappedPLOs(id);

      res.status(200).json({
        success: true,
        data: plos,
        count: plos.length
      });
    } catch (error) {
      console.error('Error in PEOController.getMappedPLOs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch mapped PLOs',
        error: error.message
      });
    }
  },

  /**
   * Map a PEO to a PLO
   * @route POST /api/peos/:id/plos
   */
  mapToPLO: async (req, res) => {
    try {
      const { id } = req.params;
      const { plo_id, correlation_level = 'Medium' } = req.body;

      if (!plo_id) {
        return res.status(400).json({
          success: false,
          message: 'plo_id is required'
        });
      }

      // Validate correlation level
      const validLevels = ['High', 'Medium', 'Low'];
      if (!validLevels.includes(correlation_level)) {
        return res.status(400).json({
          success: false,
          message: 'correlation_level must be High, Medium, or Low'
        });
      }

      const peoModel = new ProgramEducationalObjective();

      // Check if PEO exists
      const peo = await peoModel.findById(id);
      if (!peo) {
        return res.status(404).json({
          success: false,
          message: 'PEO not found'
        });
      }

      const mapping = await peoModel.mapToPLO(id, plo_id, correlation_level);

      res.status(201).json({
        success: true,
        message: 'PLO mapped to PEO successfully',
        data: mapping
      });
    } catch (error) {
      console.error('Error in PEOController.mapToPLO:', error);

      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to map PLO to PEO',
        error: error.message
      });
    }
  },

  /**
   * Update PEO-PLO mapping
   * @route PUT /api/peos/:id/plos/:ploId
   */
  updateMapping: async (req, res) => {
    try {
      const { id, ploId } = req.params;
      const { correlation_level } = req.body;

      if (!correlation_level) {
        return res.status(400).json({
          success: false,
          message: 'correlation_level is required'
        });
      }

      // Validate correlation level
      const validLevels = ['High', 'Medium', 'Low'];
      if (!validLevels.includes(correlation_level)) {
        return res.status(400).json({
          success: false,
          message: 'correlation_level must be High, Medium, or Low'
        });
      }

      const peoModel = new ProgramEducationalObjective();

      // Check if PEO exists
      const peo = await peoModel.findById(id);
      if (!peo) {
        return res.status(404).json({
          success: false,
          message: 'PEO not found'
        });
      }

      // Get the mapping to update
      const mappings = await peoModel.getMappedPLOs(id);
      const mapping = mappings.find(m => m.plo_id == ploId);

      if (!mapping) {
        return res.status(404).json({
          success: false,
          message: 'Mapping not found'
        });
      }

      await peoModel.updateMapping(mapping.mapping_id, correlation_level);

      res.status(200).json({
        success: true,
        message: 'Mapping updated successfully'
      });
    } catch (error) {
      console.error('Error in PEOController.updateMapping:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update mapping',
        error: error.message
      });
    }
  },

  /**
   * Remove PLO mapping from PEO
   * @route DELETE /api/peos/:id/plos/:ploId
   */
  unmapFromPLO: async (req, res) => {
    try {
      const { id, ploId } = req.params;

      const peoModel = new ProgramEducationalObjective();

      // Check if PEO exists
      const peo = await peoModel.findById(id);
      if (!peo) {
        return res.status(404).json({
          success: false,
          message: 'PEO not found'
        });
      }

      const success = await peoModel.unmapFromPLO(id, ploId);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Mapping not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'PLO unmapped from PEO successfully'
      });
    } catch (error) {
      console.error('Error in PEOController.unmapFromPLO:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to unmap PLO from PEO',
        error: error.message
      });
    }
  },

  /**
   * Bulk map PLOs to a PEO
   * @route POST /api/peos/:id/plos/bulk
   */
  bulkMapToPLOs: async (req, res) => {
    try {
      const { id } = req.params;
      const { mappings } = req.body;

      if (!mappings || !Array.isArray(mappings) || mappings.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'mappings array is required and must not be empty'
        });
      }

      // Validate each mapping
      for (const mapping of mappings) {
        if (!mapping.plo_id) {
          return res.status(400).json({
            success: false,
            message: 'Each mapping must have a plo_id'
          });
        }

        const validLevels = ['High', 'Medium', 'Low'];
        if (mapping.correlation_level && !validLevels.includes(mapping.correlation_level)) {
          return res.status(400).json({
            success: false,
            message: 'correlation_level must be High, Medium, or Low'
          });
        }
      }

      const peoModel = new ProgramEducationalObjective();

      // Check if PEO exists
      const peo = await peoModel.findById(id);
      if (!peo) {
        return res.status(404).json({
          success: false,
          message: 'PEO not found'
        });
      }

      const result = await peoModel.bulkMapToPLOs(id, mappings);

      res.status(200).json({
        success: true,
        message: 'PLOs mapped to PEO successfully',
        data: result,
        count: result.length
      });
    } catch (error) {
      console.error('Error in PEOController.bulkMapToPLOs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk map PLOs to PEO',
        error: error.message
      });
    }
  },

  /**
   * Get PEO statistics for a degree
   * @route GET /api/peos/degree/:degreeId/stats
   */
  getStatsByDegree: async (req, res) => {
    try {
      const { degreeId } = req.params;

      const peoModel = new ProgramEducationalObjective();
      const stats = await peoModel.getStatsByDegree(degreeId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error in PEOController.getStatsByDegree:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch PEO statistics',
        error: error.message
      });
    }
  }
};

module.exports = PEOController;
