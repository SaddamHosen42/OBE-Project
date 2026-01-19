const AttainmentThreshold = require('../models/AttainmentThreshold');

/**
 * AttainmentThreshold Controller
 * Handles attainment threshold configuration operations
 */
const AttainmentThresholdController = {
  /**
   * List all attainment thresholds
   * @route GET /api/attainment-thresholds
   */
  index: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        orderBy = 'degree_name', 
        order = 'ASC',
        thresholdType,
        degreeId
      } = req.query;

      const thresholdModel = new AttainmentThreshold();
      
      // If degreeId is provided, get thresholds by degree
      if (degreeId) {
        const thresholds = await thresholdModel.getByDegree(degreeId, thresholdType);
        
        // Apply search filter if provided
        let filteredThresholds = thresholds;
        if (search) {
          const searchLower = search.toLowerCase();
          filteredThresholds = thresholds.filter(threshold => 
            threshold.level_name.toLowerCase().includes(searchLower) ||
            threshold.threshold_type.toLowerCase().includes(searchLower)
          );
        }

        // Apply pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedThresholds = filteredThresholds.slice(startIndex, endIndex);

        return res.status(200).json({
          success: true,
          message: 'Attainment thresholds retrieved successfully',
          data: paginatedThresholds,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(filteredThresholds.length / parseInt(limit)),
            totalItems: filteredThresholds.length,
            itemsPerPage: parseInt(limit)
          }
        });
      }

      // If thresholdType is provided, get thresholds by type
      if (thresholdType) {
        const thresholds = await thresholdModel.getByType(thresholdType);
        
        // Apply search filter if provided
        let filteredThresholds = thresholds;
        if (search) {
          const searchLower = search.toLowerCase();
          filteredThresholds = thresholds.filter(threshold => 
            threshold.level_name.toLowerCase().includes(searchLower) ||
            threshold.degree_name.toLowerCase().includes(searchLower)
          );
        }

        // Apply pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedThresholds = filteredThresholds.slice(startIndex, endIndex);

        return res.status(200).json({
          success: true,
          message: 'Attainment thresholds retrieved successfully',
          data: paginatedThresholds,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(filteredThresholds.length / parseInt(limit)),
            totalItems: filteredThresholds.length,
            itemsPerPage: parseInt(limit)
          }
        });
      }

      // Get all thresholds with full details
      const thresholds = await thresholdModel.getAllWithDegrees({
        orderBy,
        order
      });
      
      // Apply search filter if provided
      let filteredThresholds = thresholds;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredThresholds = thresholds.filter(threshold => 
          threshold.level_name.toLowerCase().includes(searchLower) ||
          threshold.threshold_type.toLowerCase().includes(searchLower) ||
          threshold.degree_name.toLowerCase().includes(searchLower)
        );
      }

      // Apply pagination
      const startIndex = (parseInt(page) - 1) * parseInt(limit);
      const endIndex = startIndex + parseInt(limit);
      const paginatedThresholds = filteredThresholds.slice(startIndex, endIndex);

      res.status(200).json({
        success: true,
        message: 'Attainment thresholds retrieved successfully',
        data: paginatedThresholds,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredThresholds.length / parseInt(limit)),
          totalItems: filteredThresholds.length,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error in index:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve attainment thresholds',
        error: error.message
      });
    }
  },

  /**
   * Get a single attainment threshold by ID
   * @route GET /api/attainment-thresholds/:id
   */
  show: async (req, res) => {
    try {
      const { id } = req.params;
      const thresholdModel = new AttainmentThreshold();
      
      const threshold = await thresholdModel.findById(id);
      
      if (!threshold) {
        return res.status(404).json({
          success: false,
          message: 'Attainment threshold not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Attainment threshold retrieved successfully',
        data: threshold
      });
    } catch (error) {
      console.error('Error in show:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve attainment threshold',
        error: error.message
      });
    }
  },

  /**
   * Create a new attainment threshold
   * @route POST /api/attainment-thresholds
   */
  store: async (req, res) => {
    try {
      const { 
        degree_id, 
        threshold_type, 
        level_name, 
        min_percentage, 
        max_percentage, 
        is_attained = true 
      } = req.body;

      // Validation
      if (!degree_id || !threshold_type || !level_name || 
          min_percentage === undefined || max_percentage === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: degree_id, threshold_type, level_name, min_percentage, max_percentage'
        });
      }

      // Validate threshold_type
      const validTypes = ['CLO', 'PLO', 'PEO'];
      if (!validTypes.includes(threshold_type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid threshold_type. Must be one of: CLO, PLO, PEO'
        });
      }

      // Validate percentages
      if (min_percentage < 0 || max_percentage > 100 || min_percentage > max_percentage) {
        return res.status(400).json({
          success: false,
          message: 'Invalid percentage range. min_percentage must be >= 0, max_percentage must be <= 100, and min_percentage must be <= max_percentage'
        });
      }

      const thresholdModel = new AttainmentThreshold();

      // Check if threshold already exists
      const exists = await thresholdModel.exists(degree_id, threshold_type, level_name);
      if (exists) {
        return res.status(409).json({
          success: false,
          message: 'Attainment threshold with this degree, type, and level already exists'
        });
      }

      // Validate no overlap with existing thresholds
      const noOverlap = await thresholdModel.validateNoOverlap(
        degree_id, 
        threshold_type, 
        min_percentage, 
        max_percentage
      );
      
      if (!noOverlap) {
        return res.status(409).json({
          success: false,
          message: 'Percentage range overlaps with an existing threshold for this degree and type'
        });
      }

      const thresholdData = {
        degree_id,
        threshold_type,
        level_name,
        min_percentage,
        max_percentage,
        is_attained
      };

      const result = await thresholdModel.create(thresholdData);
      const newThreshold = await thresholdModel.findById(result.insertId);

      res.status(201).json({
        success: true,
        message: 'Attainment threshold created successfully',
        data: newThreshold
      });
    } catch (error) {
      console.error('Error in store:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create attainment threshold',
        error: error.message
      });
    }
  },

  /**
   * Update an existing attainment threshold
   * @route PUT /api/attainment-thresholds/:id
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        degree_id, 
        threshold_type, 
        level_name, 
        min_percentage, 
        max_percentage, 
        is_attained 
      } = req.body;

      const thresholdModel = new AttainmentThreshold();
      
      // Check if threshold exists
      const existingThreshold = await thresholdModel.findById(id);
      if (!existingThreshold) {
        return res.status(404).json({
          success: false,
          message: 'Attainment threshold not found'
        });
      }

      // Validate threshold_type if provided
      if (threshold_type) {
        const validTypes = ['CLO', 'PLO', 'PEO'];
        if (!validTypes.includes(threshold_type)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid threshold_type. Must be one of: CLO, PLO, PEO'
          });
        }
      }

      // Validate percentages if provided
      const newMin = min_percentage !== undefined ? min_percentage : existingThreshold.min_percentage;
      const newMax = max_percentage !== undefined ? max_percentage : existingThreshold.max_percentage;
      
      if (newMin < 0 || newMax > 100 || newMin > newMax) {
        return res.status(400).json({
          success: false,
          message: 'Invalid percentage range. min_percentage must be >= 0, max_percentage must be <= 100, and min_percentage must be <= max_percentage'
        });
      }

      // Validate no overlap with existing thresholds (excluding current record)
      const checkDegreeId = degree_id || existingThreshold.degree_id;
      const checkType = threshold_type || existingThreshold.threshold_type;
      
      const noOverlap = await thresholdModel.validateNoOverlap(
        checkDegreeId, 
        checkType, 
        newMin, 
        newMax,
        id
      );
      
      if (!noOverlap) {
        return res.status(409).json({
          success: false,
          message: 'Percentage range overlaps with an existing threshold for this degree and type'
        });
      }

      const updateData = {};
      if (degree_id !== undefined) updateData.degree_id = degree_id;
      if (threshold_type !== undefined) updateData.threshold_type = threshold_type;
      if (level_name !== undefined) updateData.level_name = level_name;
      if (min_percentage !== undefined) updateData.min_percentage = min_percentage;
      if (max_percentage !== undefined) updateData.max_percentage = max_percentage;
      if (is_attained !== undefined) updateData.is_attained = is_attained;

      await thresholdModel.update(id, updateData);
      const updatedThreshold = await thresholdModel.findById(id);

      res.status(200).json({
        success: true,
        message: 'Attainment threshold updated successfully',
        data: updatedThreshold
      });
    } catch (error) {
      console.error('Error in update:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update attainment threshold',
        error: error.message
      });
    }
  },

  /**
   * Delete an attainment threshold
   * @route DELETE /api/attainment-thresholds/:id
   */
  destroy: async (req, res) => {
    try {
      const { id } = req.params;
      const thresholdModel = new AttainmentThreshold();
      
      // Check if threshold exists
      const threshold = await thresholdModel.findById(id);
      if (!threshold) {
        return res.status(404).json({
          success: false,
          message: 'Attainment threshold not found'
        });
      }

      await thresholdModel.delete(id);

      res.status(200).json({
        success: true,
        message: 'Attainment threshold deleted successfully',
        data: { id: parseInt(id) }
      });
    } catch (error) {
      console.error('Error in destroy:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete attainment threshold',
        error: error.message
      });
    }
  },

  /**
   * Evaluate attainment level based on a percentage score
   * @route POST /api/attainment-thresholds/evaluate
   */
  evaluate: async (req, res) => {
    try {
      const { degree_id, threshold_type, percentage } = req.body;

      // Validation
      if (!degree_id || !threshold_type || percentage === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: degree_id, threshold_type, percentage'
        });
      }

      // Validate threshold_type
      const validTypes = ['CLO', 'PLO', 'PEO'];
      if (!validTypes.includes(threshold_type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid threshold_type. Must be one of: CLO, PLO, PEO'
        });
      }

      const thresholdModel = new AttainmentThreshold();
      const attainmentLevel = await thresholdModel.evaluateAttainment(
        degree_id, 
        threshold_type, 
        percentage
      );

      if (!attainmentLevel) {
        return res.status(404).json({
          success: false,
          message: 'No matching attainment level found for the given percentage',
          data: {
            degree_id,
            threshold_type,
            percentage,
            level: null
          }
        });
      }

      res.status(200).json({
        success: true,
        message: 'Attainment level evaluated successfully',
        data: {
          degree_id,
          threshold_type,
          percentage,
          level: attainmentLevel
        }
      });
    } catch (error) {
      console.error('Error in evaluate:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to evaluate attainment level',
        error: error.message
      });
    }
  },

  /**
   * Get thresholds by degree
   * @route GET /api/attainment-thresholds/degree/:degreeId
   */
  getByDegree: async (req, res) => {
    try {
      const { degreeId } = req.params;
      const { thresholdType } = req.query;

      const thresholdModel = new AttainmentThreshold();
      const thresholds = await thresholdModel.getByDegree(degreeId, thresholdType);

      res.status(200).json({
        success: true,
        message: 'Attainment thresholds retrieved successfully',
        data: thresholds
      });
    } catch (error) {
      console.error('Error in getByDegree:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve attainment thresholds by degree',
        error: error.message
      });
    }
  },

  /**
   * Get thresholds by type
   * @route GET /api/attainment-thresholds/type/:thresholdType
   */
  getByType: async (req, res) => {
    try {
      const { thresholdType } = req.params;

      // Validate threshold_type
      const validTypes = ['CLO', 'PLO', 'PEO'];
      if (!validTypes.includes(thresholdType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid threshold_type. Must be one of: CLO, PLO, PEO'
        });
      }

      const thresholdModel = new AttainmentThreshold();
      const thresholds = await thresholdModel.getByType(thresholdType);

      res.status(200).json({
        success: true,
        message: 'Attainment thresholds retrieved successfully',
        data: thresholds
      });
    } catch (error) {
      console.error('Error in getByType:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve attainment thresholds by type',
        error: error.message
      });
    }
  },

  /**
   * Delete all thresholds for a specific degree
   * @route DELETE /api/attainment-thresholds/degree/:degreeId
   */
  deleteByDegree: async (req, res) => {
    try {
      const { degreeId } = req.params;

      const thresholdModel = new AttainmentThreshold();
      const result = await thresholdModel.deleteByDegree(degreeId);

      res.status(200).json({
        success: true,
        message: `Successfully deleted ${result.affectedRows} threshold(s) for degree`,
        data: {
          degree_id: parseInt(degreeId),
          deleted_count: result.affectedRows
        }
      });
    } catch (error) {
      console.error('Error in deleteByDegree:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete attainment thresholds',
        error: error.message
      });
    }
  }
};

module.exports = AttainmentThresholdController;
