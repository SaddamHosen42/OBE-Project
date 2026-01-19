const OBEReviewCycle = require('../models/OBEReviewCycle');

/**
 * OBE Review Cycle Controller
 * Handles OBE review cycle management operations
 */
const OBEReviewCycleController = {
  /**
   * List all OBE review cycles
   * @route GET /api/obe-review-cycles
   */
  index: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        orderBy = 'start_date', 
        order = 'DESC',
        degreeId,
        status,
        reviewType,
        withDegree = 'true'
      } = req.query;

      const reviewCycleModel = new OBEReviewCycle();
      
      // Filter by specific criteria
      if (degreeId) {
        const cycles = await reviewCycleModel.getByDegreeId(degreeId);
        return res.status(200).json({
          success: true,
          message: 'Review cycles retrieved successfully',
          data: cycles
        });
      }

      if (status) {
        const cycles = await reviewCycleModel.getByStatus(status);
        return res.status(200).json({
          success: true,
          message: 'Review cycles retrieved successfully',
          data: cycles
        });
      }

      if (reviewType) {
        const cycles = await reviewCycleModel.getByReviewType(reviewType);
        return res.status(200).json({
          success: true,
          message: 'Review cycles retrieved successfully',
          data: cycles
        });
      }

      // Get with degree information if requested
      if (withDegree === 'true') {
        const cycles = await reviewCycleModel.getAllWithDegree();
        
        // Apply search filter if provided
        let filteredCycles = cycles;
        if (search) {
          const searchLower = search.toLowerCase();
          filteredCycles = cycles.filter(cycle => 
            cycle.cycle_name.toLowerCase().includes(searchLower) ||
            cycle.degree_name.toLowerCase().includes(searchLower) ||
            cycle.department_name.toLowerCase().includes(searchLower)
          );
        }

        // Apply pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedCycles = filteredCycles.slice(startIndex, endIndex);

        return res.status(200).json({
          success: true,
          message: 'Review cycles retrieved successfully',
          data: paginatedCycles,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(filteredCycles.length / parseInt(limit)),
            totalItems: filteredCycles.length,
            itemsPerPage: parseInt(limit)
          }
        });
      }

      // Standard getAllWithPagination query
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        orderBy,
        order: order.toUpperCase(),
        search: search ? {
          fields: ['cycle_name'],
          value: search
        } : null
      };

      const result = await reviewCycleModel.getAllWithPagination(options);

      res.status(200).json({
        success: true,
        message: 'Review cycles retrieved successfully',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error in OBEReviewCycleController.index:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve review cycles',
        error: error.message
      });
    }
  },

  /**
   * Get a single OBE review cycle by ID
   * @route GET /api/obe-review-cycles/:id
   */
  show: async (req, res) => {
    try {
      const { id } = req.params;
      const { withDegree = 'true' } = req.query;

      const reviewCycleModel = new OBEReviewCycle();

      // Get with degree information if requested
      if (withDegree === 'true') {
        const cycle = await reviewCycleModel.getByIdWithDegree(id);
        
        if (!cycle) {
          return res.status(404).json({
            success: false,
            message: 'Review cycle not found'
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Review cycle retrieved successfully',
          data: cycle
        });
      }

      const cycle = await reviewCycleModel.findById(id);

      if (!cycle) {
        return res.status(404).json({
          success: false,
          message: 'Review cycle not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Review cycle retrieved successfully',
        data: cycle
      });
    } catch (error) {
      console.error('Error in OBEReviewCycleController.show:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve review cycle',
        error: error.message
      });
    }
  },

  /**
   * Create a new OBE review cycle
   * @route POST /api/obe-review-cycles
   */
  create: async (req, res) => {
    try {
      const {
        degree_id,
        cycle_name,
        start_date,
        end_date,
        review_type,
        status = 'Planned',
        summary_report = null
      } = req.body;

      const reviewCycleModel = new OBEReviewCycle();

      // Validate input
      const validation = reviewCycleModel.validate({
        degree_id,
        cycle_name,
        start_date,
        end_date,
        review_type,
        status
      });

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      const cycleData = {
        degree_id,
        cycle_name,
        start_date,
        end_date,
        review_type,
        status,
        summary_report
      };

      const cycleId = await reviewCycleModel.create(cycleData);
      const newCycle = await reviewCycleModel.getByIdWithDegree(cycleId);

      res.status(201).json({
        success: true,
        message: 'Review cycle created successfully',
        data: newCycle
      });
    } catch (error) {
      console.error('Error in OBEReviewCycleController.create:', error);
      
      // Handle foreign key constraint errors
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
          success: false,
          message: 'Invalid degree ID',
          error: 'The specified degree does not exist'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create review cycle',
        error: error.message
      });
    }
  },

  /**
   * Update an OBE review cycle
   * @route PUT /api/obe-review-cycles/:id
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        degree_id,
        cycle_name,
        start_date,
        end_date,
        review_type,
        status,
        summary_report
      } = req.body;

      const reviewCycleModel = new OBEReviewCycle();

      // Check if review cycle exists
      const existingCycle = await reviewCycleModel.findById(id);
      if (!existingCycle) {
        return res.status(404).json({
          success: false,
          message: 'Review cycle not found'
        });
      }

      // Validate input
      const validation = reviewCycleModel.validate({
        degree_id: degree_id || existingCycle.degree_id,
        cycle_name: cycle_name || existingCycle.cycle_name,
        start_date: start_date || existingCycle.start_date,
        end_date: end_date || existingCycle.end_date,
        review_type: review_type || existingCycle.review_type,
        status: status || existingCycle.status
      });

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      const updateData = {};
      if (degree_id !== undefined) updateData.degree_id = degree_id;
      if (cycle_name !== undefined) updateData.cycle_name = cycle_name;
      if (start_date !== undefined) updateData.start_date = start_date;
      if (end_date !== undefined) updateData.end_date = end_date;
      if (review_type !== undefined) updateData.review_type = review_type;
      if (status !== undefined) updateData.status = status;
      if (summary_report !== undefined) updateData.summary_report = summary_report;

      await reviewCycleModel.update(id, updateData);
      const updatedCycle = await reviewCycleModel.getByIdWithDegree(id);

      res.status(200).json({
        success: true,
        message: 'Review cycle updated successfully',
        data: updatedCycle
      });
    } catch (error) {
      console.error('Error in OBEReviewCycleController.update:', error);
      
      // Handle foreign key constraint errors
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
          success: false,
          message: 'Invalid degree ID',
          error: 'The specified degree does not exist'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update review cycle',
        error: error.message
      });
    }
  },

  /**
   * Delete an OBE review cycle
   * @route DELETE /api/obe-review-cycles/:id
   */
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const reviewCycleModel = new OBEReviewCycle();

      // Check if review cycle exists
      const existingCycle = await reviewCycleModel.findById(id);
      if (!existingCycle) {
        return res.status(404).json({
          success: false,
          message: 'Review cycle not found'
        });
      }

      await reviewCycleModel.delete(id);

      res.status(200).json({
        success: true,
        message: 'Review cycle deleted successfully'
      });
    } catch (error) {
      console.error('Error in OBEReviewCycleController.delete:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete review cycle',
        error: error.message
      });
    }
  },

  /**
   * Get ongoing review cycles
   * @route GET /api/obe-review-cycles/status/ongoing
   */
  getOngoing: async (req, res) => {
    try {
      const reviewCycleModel = new OBEReviewCycle();
      const cycles = await reviewCycleModel.getOngoing();

      res.status(200).json({
        success: true,
        message: 'Ongoing review cycles retrieved successfully',
        data: cycles
      });
    } catch (error) {
      console.error('Error in OBEReviewCycleController.getOngoing:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve ongoing review cycles',
        error: error.message
      });
    }
  },

  /**
   * Update review cycle status
   * @route PATCH /api/obe-review-cycles/:id/status
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

      if (!['Planned', 'Ongoing', 'Completed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be Planned, Ongoing, or Completed'
        });
      }

      const reviewCycleModel = new OBEReviewCycle();

      // Check if review cycle exists
      const existingCycle = await reviewCycleModel.findById(id);
      if (!existingCycle) {
        return res.status(404).json({
          success: false,
          message: 'Review cycle not found'
        });
      }

      const updatedCycle = await reviewCycleModel.updateStatus(id, status);

      res.status(200).json({
        success: true,
        message: 'Review cycle status updated successfully',
        data: updatedCycle
      });
    } catch (error) {
      console.error('Error in OBEReviewCycleController.updateStatus:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update review cycle status',
        error: error.message
      });
    }
  },

  /**
   * Update summary report
   * @route PATCH /api/obe-review-cycles/:id/summary-report
   */
  updateSummaryReport: async (req, res) => {
    try {
      const { id } = req.params;
      const { summary_report } = req.body;

      if (!summary_report) {
        return res.status(400).json({
          success: false,
          message: 'Summary report is required'
        });
      }

      const reviewCycleModel = new OBEReviewCycle();

      // Check if review cycle exists
      const existingCycle = await reviewCycleModel.findById(id);
      if (!existingCycle) {
        return res.status(404).json({
          success: false,
          message: 'Review cycle not found'
        });
      }

      const updatedCycle = await reviewCycleModel.updateSummaryReport(id, summary_report);

      res.status(200).json({
        success: true,
        message: 'Summary report updated successfully',
        data: updatedCycle
      });
    } catch (error) {
      console.error('Error in OBEReviewCycleController.updateSummaryReport:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update summary report',
        error: error.message
      });
    }
  },

  /**
   * Get review cycles by date range
   * @route GET /api/obe-review-cycles/date-range
   */
  getByDateRange: async (req, res) => {
    try {
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const reviewCycleModel = new OBEReviewCycle();
      const cycles = await reviewCycleModel.getByDateRange(start_date, end_date);

      res.status(200).json({
        success: true,
        message: 'Review cycles retrieved successfully',
        data: cycles
      });
    } catch (error) {
      console.error('Error in OBEReviewCycleController.getByDateRange:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve review cycles',
        error: error.message
      });
    }
  }
};

module.exports = OBEReviewCycleController;
