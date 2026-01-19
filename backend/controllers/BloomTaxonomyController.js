const BloomTaxonomyLevel = require('../models/BloomTaxonomyLevel');

/**
 * Bloom Taxonomy Level Controller
 * Handles Bloom's Taxonomy cognitive levels management operations
 */
const BloomTaxonomyController = {
  /**
   * List all Bloom taxonomy levels
   * @route GET /api/bloom-taxonomy
   */
  index: async (req, res) => {
    try {
      const { 
        search, 
        orderBy = 'level_number', 
        order = 'ASC',
        levelNumber,
        startLevel,
        endLevel
      } = req.query;

      const bloomModel = new BloomTaxonomyLevel();
      let levels = [];

      // If specific level number is requested
      if (levelNumber) {
        const levelNum = parseInt(levelNumber);
        if (!bloomModel.isValidLevelNumber(levelNum)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid level number. Must be between 1 and 6.',
            data: null
          });
        }
        const level = await bloomModel.getByLevelNumber(levelNum);
        levels = level ? [level] : [];
      }
      // If range of levels is requested
      else if (startLevel && endLevel) {
        const start = parseInt(startLevel);
        const end = parseInt(endLevel);
        
        if (!bloomModel.isValidLevelNumber(start) || !bloomModel.isValidLevelNumber(end)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid level range. Both levels must be between 1 and 6.',
            data: null
          });
        }
        
        if (start > end) {
          return res.status(400).json({
            success: false,
            message: 'Start level must be less than or equal to end level.',
            data: null
          });
        }
        
        levels = await bloomModel.getLevelsInRange(start, end);
      }
      // If search keyword is provided
      else if (search) {
        levels = await bloomModel.searchByKeyword(search);
      }
      // Default: get all levels ordered
      else {
        levels = await bloomModel.getAllOrdered();
      }

      // Parse keywords for each level
      const processedLevels = levels.map(level => ({
        ...level,
        keywords_array: bloomModel.parseKeywords(level.keywords)
      }));

      return res.status(200).json({
        success: true,
        message: 'Bloom taxonomy levels retrieved successfully',
        data: processedLevels,
        meta: {
          count: processedLevels.length,
          totalLevels: 6
        }
      });

    } catch (error) {
      console.error('Error retrieving Bloom taxonomy levels:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve Bloom taxonomy levels',
        error: error.message
      });
    }
  },

  /**
   * Get a single Bloom taxonomy level by ID
   * @route GET /api/bloom-taxonomy/:id
   */
  show: async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid Bloom taxonomy level ID is required',
          data: null
        });
      }

      const bloomModel = new BloomTaxonomyLevel();
      const level = await bloomModel.findById(id);

      if (!level) {
        return res.status(404).json({
          success: false,
          message: 'Bloom taxonomy level not found',
          data: null
        });
      }

      // Parse keywords
      const processedLevel = {
        ...level,
        keywords_array: bloomModel.parseKeywords(level.keywords)
      };

      return res.status(200).json({
        success: true,
        message: 'Bloom taxonomy level retrieved successfully',
        data: processedLevel
      });

    } catch (error) {
      console.error('Error retrieving Bloom taxonomy level:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve Bloom taxonomy level',
        error: error.message
      });
    }
  },

  /**
   * Get Bloom taxonomy level by name
   * @route GET /api/bloom-taxonomy/name/:name
   */
  getByName: async (req, res) => {
    try {
      const { name } = req.params;
      
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Bloom taxonomy level name is required',
          data: null
        });
      }

      const bloomModel = new BloomTaxonomyLevel();
      const level = await bloomModel.getByName(name);

      if (!level) {
        return res.status(404).json({
          success: false,
          message: `Bloom taxonomy level '${name}' not found`,
          data: null
        });
      }

      // Parse keywords
      const processedLevel = {
        ...level,
        keywords_array: bloomModel.parseKeywords(level.keywords)
      };

      return res.status(200).json({
        success: true,
        message: 'Bloom taxonomy level retrieved successfully',
        data: processedLevel
      });

    } catch (error) {
      console.error('Error retrieving Bloom taxonomy level by name:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve Bloom taxonomy level',
        error: error.message
      });
    }
  },

  /**
   * Get count of Bloom taxonomy levels
   * @route GET /api/bloom-taxonomy/stats/count
   */
  count: async (req, res) => {
    try {
      const bloomModel = new BloomTaxonomyLevel();
      const count = await bloomModel.countLevels();

      return res.status(200).json({
        success: true,
        message: 'Bloom taxonomy levels count retrieved successfully',
        data: {
          count,
          expected: 6,
          isComplete: count === 6
        }
      });

    } catch (error) {
      console.error('Error counting Bloom taxonomy levels:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to count Bloom taxonomy levels',
        error: error.message
      });
    }
  }
};

module.exports = BloomTaxonomyController;
