const GradeScale = require('../models/GradeScale');
const GradePoint = require('../models/GradePoint');

/**
 * Grade Controller
 * Handles grade scale and grade point management operations
 */
const GradeController = {
  /**
   * List all grade scales with pagination and filtering
   * @route GET /api/grades/scales
   */
  listScales: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        orderBy = 'name',
        order = 'ASC',
        activeOnly = 'false'
      } = req.query;

      const gradeScaleModel = new GradeScale();

      // Get grade scales
      let scales;
      if (activeOnly === 'true') {
        scales = await gradeScaleModel.getActive({ orderBy, order: order.toUpperCase() });
      } else {
        scales = await gradeScaleModel.findAll({
          orderBy,
          order: order.toUpperCase()
        });
      }

      // Apply search filter if provided
      let filteredScales = scales;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredScales = scales.filter(scale =>
          scale.name.toLowerCase().includes(searchLower)
        );
      }

      // Apply pagination
      const startIndex = (parseInt(page) - 1) * parseInt(limit);
      const endIndex = startIndex + parseInt(limit);
      const paginatedScales = filteredScales.slice(startIndex, endIndex);

      return res.status(200).json({
        success: true,
        message: 'Grade scales retrieved successfully',
        data: paginatedScales,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredScales.length / parseInt(limit)),
          totalItems: filteredScales.length,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error in listScales:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve grade scales',
        error: error.message
      });
    }
  },

  /**
   * Get a single grade scale by ID
   * @route GET /api/grades/scales/:id
   */
  getScale: async (req, res) => {
    try {
      const { id } = req.params;
      const { includeGradePoints = 'false' } = req.query;

      const gradeScaleModel = new GradeScale();

      let scale;
      if (includeGradePoints === 'true') {
        scale = await gradeScaleModel.getWithGradePoints(parseInt(id));
      } else {
        scale = await gradeScaleModel.findById(parseInt(id));
      }

      if (!scale) {
        return res.status(404).json({
          success: false,
          message: 'Grade scale not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Grade scale retrieved successfully',
        data: scale
      });
    } catch (error) {
      console.error('Error in getScale:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve grade scale',
        error: error.message
      });
    }
  },

  /**
   * Create a new grade scale
   * @route POST /api/grades/scales
   */
  createScale: async (req, res) => {
    try {
      const { name, is_active } = req.body;

      // Validation
      if (!name || name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Grade scale name is required'
        });
      }

      const gradeScaleModel = new GradeScale();
      const scale = await gradeScaleModel.create({
        name: name.trim(),
        is_active: is_active !== undefined ? is_active : true
      });

      return res.status(201).json({
        success: true,
        message: 'Grade scale created successfully',
        data: scale
      });
    } catch (error) {
      console.error('Error in createScale:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create grade scale',
        error: error.message
      });
    }
  },

  /**
   * Update a grade scale
   * @route PUT /api/grades/scales/:id
   */
  updateScale: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, is_active } = req.body;

      // Validation
      if (!name || name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Grade scale name is required'
        });
      }

      const gradeScaleModel = new GradeScale();

      // Check if scale exists
      const existingScale = await gradeScaleModel.findById(parseInt(id));
      if (!existingScale) {
        return res.status(404).json({
          success: false,
          message: 'Grade scale not found'
        });
      }

      const scale = await gradeScaleModel.update(parseInt(id), {
        name: name.trim(),
        is_active
      });

      return res.status(200).json({
        success: true,
        message: 'Grade scale updated successfully',
        data: scale
      });
    } catch (error) {
      console.error('Error in updateScale:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update grade scale',
        error: error.message
      });
    }
  },

  /**
   * Delete a grade scale
   * @route DELETE /api/grades/scales/:id
   */
  deleteScale: async (req, res) => {
    try {
      const { id } = req.params;

      const gradeScaleModel = new GradeScale();

      // Check if scale exists
      const scale = await gradeScaleModel.findById(parseInt(id));
      if (!scale) {
        return res.status(404).json({
          success: false,
          message: 'Grade scale not found'
        });
      }

      await gradeScaleModel.delete(parseInt(id));

      return res.status(200).json({
        success: true,
        message: 'Grade scale deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteScale:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete grade scale',
        error: error.message
      });
    }
  },

  /**
   * Activate a grade scale
   * @route PATCH /api/grades/scales/:id/activate
   */
  activateScale: async (req, res) => {
    try {
      const { id } = req.params;

      const gradeScaleModel = new GradeScale();
      const scale = await gradeScaleModel.activate(parseInt(id));

      if (!scale) {
        return res.status(404).json({
          success: false,
          message: 'Grade scale not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Grade scale activated successfully',
        data: scale
      });
    } catch (error) {
      console.error('Error in activateScale:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to activate grade scale',
        error: error.message
      });
    }
  },

  /**
   * Deactivate a grade scale
   * @route PATCH /api/grades/scales/:id/deactivate
   */
  deactivateScale: async (req, res) => {
    try {
      const { id } = req.params;

      const gradeScaleModel = new GradeScale();
      const scale = await gradeScaleModel.deactivate(parseInt(id));

      if (!scale) {
        return res.status(404).json({
          success: false,
          message: 'Grade scale not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Grade scale deactivated successfully',
        data: scale
      });
    } catch (error) {
      console.error('Error in deactivateScale:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to deactivate grade scale',
        error: error.message
      });
    }
  },

  // ============================================
  // Grade Point Operations
  // ============================================

  /**
   * List all grade points for a specific scale
   * @route GET /api/grades/scales/:scaleId/points
   */
  listPoints: async (req, res) => {
    try {
      const { scaleId } = req.params;
      const {
        orderBy = 'min_percentage',
        order = 'DESC'
      } = req.query;

      const gradePointModel = new GradePoint();
      const points = await gradePointModel.getByScale(parseInt(scaleId), {
        orderBy,
        order: order.toUpperCase()
      });

      return res.status(200).json({
        success: true,
        message: 'Grade points retrieved successfully',
        data: points
      });
    } catch (error) {
      console.error('Error in listPoints:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve grade points',
        error: error.message
      });
    }
  },

  /**
   * Get a single grade point by ID
   * @route GET /api/grades/points/:id
   */
  getPoint: async (req, res) => {
    try {
      const { id } = req.params;

      const gradePointModel = new GradePoint();
      const point = await gradePointModel.findById(parseInt(id));

      if (!point) {
        return res.status(404).json({
          success: false,
          message: 'Grade point not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Grade point retrieved successfully',
        data: point
      });
    } catch (error) {
      console.error('Error in getPoint:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve grade point',
        error: error.message
      });
    }
  },

  /**
   * Create a new grade point
   * @route POST /api/grades/points
   */
  createPoint: async (req, res) => {
    try {
      const {
        grade_scale_id,
        letter_grade,
        grade_point,
        min_percentage,
        max_percentage,
        remarks
      } = req.body;

      // Validation
      if (!grade_scale_id || !letter_grade || grade_point === undefined ||
          min_percentage === undefined || max_percentage === undefined) {
        return res.status(400).json({
          success: false,
          message: 'All required fields must be provided'
        });
      }

      const gradePointModel = new GradePoint();
      const point = await gradePointModel.create({
        grade_scale_id,
        letter_grade,
        grade_point,
        min_percentage,
        max_percentage,
        remarks
      });

      return res.status(201).json({
        success: true,
        message: 'Grade point created successfully',
        data: point
      });
    } catch (error) {
      console.error('Error in createPoint:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create grade point',
        error: error.message
      });
    }
  },

  /**
   * Update a grade point
   * @route PUT /api/grades/points/:id
   */
  updatePoint: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        letter_grade,
        grade_point,
        min_percentage,
        max_percentage,
        remarks
      } = req.body;

      const gradePointModel = new GradePoint();

      // Check if point exists
      const existingPoint = await gradePointModel.findById(parseInt(id));
      if (!existingPoint) {
        return res.status(404).json({
          success: false,
          message: 'Grade point not found'
        });
      }

      const point = await gradePointModel.update(parseInt(id), {
        letter_grade,
        grade_point,
        min_percentage,
        max_percentage,
        remarks
      });

      return res.status(200).json({
        success: true,
        message: 'Grade point updated successfully',
        data: point
      });
    } catch (error) {
      console.error('Error in updatePoint:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update grade point',
        error: error.message
      });
    }
  },

  /**
   * Delete a grade point
   * @route DELETE /api/grades/points/:id
   */
  deletePoint: async (req, res) => {
    try {
      const { id } = req.params;

      const gradePointModel = new GradePoint();

      // Check if point exists
      const point = await gradePointModel.findById(parseInt(id));
      if (!point) {
        return res.status(404).json({
          success: false,
          message: 'Grade point not found'
        });
      }

      await gradePointModel.delete(parseInt(id));

      return res.status(200).json({
        success: true,
        message: 'Grade point deleted successfully'
      });
    } catch (error) {
      console.error('Error in deletePoint:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete grade point',
        error: error.message
      });
    }
  },

  /**
   * Calculate grade for a given percentage
   * @route GET /api/grades/calculate
   */
  calculateGrade: async (req, res) => {
    try {
      const { percentage, scaleId = 1 } = req.query;

      if (percentage === undefined || percentage === null) {
        return res.status(400).json({
          success: false,
          message: 'Percentage is required'
        });
      }

      const percentageValue = parseFloat(percentage);

      if (isNaN(percentageValue) || percentageValue < 0 || percentageValue > 100) {
        return res.status(400).json({
          success: false,
          message: 'Percentage must be a number between 0 and 100'
        });
      }

      const gradePointModel = new GradePoint();
      const grade = await gradePointModel.calculateGrade(percentageValue, parseInt(scaleId));

      if (!grade) {
        return res.status(404).json({
          success: false,
          message: 'No grade found for the given percentage'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Grade calculated successfully',
        data: grade
      });
    } catch (error) {
      console.error('Error in calculateGrade:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to calculate grade',
        error: error.message
      });
    }
  },

  /**
   * Calculate CGPA from grade points
   * @route POST /api/grades/calculate-cgpa
   */
  calculateCGPA: async (req, res) => {
    try {
      const { gradePoints, creditHours } = req.body;

      if (!Array.isArray(gradePoints) || gradePoints.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Grade points array is required and must not be empty'
        });
      }

      if (creditHours && (!Array.isArray(creditHours) || creditHours.length !== gradePoints.length)) {
        return res.status(400).json({
          success: false,
          message: 'Credit hours array must match grade points array length'
        });
      }

      const gradePointModel = new GradePoint();
      const cgpa = gradePointModel.calculateCGPA(gradePoints, creditHours);

      return res.status(200).json({
        success: true,
        message: 'CGPA calculated successfully',
        data: {
          cgpa,
          gradePoints,
          creditHours: creditHours || null
        }
      });
    } catch (error) {
      console.error('Error in calculateCGPA:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to calculate CGPA',
        error: error.message
      });
    }
  }
};

module.exports = GradeController;
