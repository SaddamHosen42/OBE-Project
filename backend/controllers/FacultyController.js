const Faculty = require('../models/Faculty');

/**
 * Faculty Controller
 * Handles faculty management operations
 */
const FacultyController = {
  /**
   * List all faculties
   * @route GET /api/faculties
   */
  index: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        orderBy = 'created_at', 
        order = 'DESC',
        withDepartments = 'false' 
      } = req.query;

      const facultyModel = new Faculty();
      
      // If withDepartments is true, get faculties with their departments
      if (withDepartments === 'true') {
        const faculties = await facultyModel.getAllWithDepartments();
        
        // Apply search filter if provided
        let filteredFaculties = faculties;
        if (search) {
          const searchLower = search.toLowerCase();
          filteredFaculties = faculties.filter(faculty => 
            faculty.name.toLowerCase().includes(searchLower) ||
            faculty.short_name.toLowerCase().includes(searchLower)
          );
        }

        // Apply pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedFaculties = filteredFaculties.slice(startIndex, endIndex);

        return res.status(200).json({
          success: true,
          message: 'Faculties retrieved successfully',
          data: paginatedFaculties,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(filteredFaculties.length / parseInt(limit)),
            totalItems: filteredFaculties.length,
            itemsPerPage: parseInt(limit)
          }
        });
      }

      // Build query options
      const options = {
        orderBy,
        order: order.toUpperCase(),
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      };

      let faculties;
      let total;

      // Search by name or short_name if search param provided
      if (search) {
        const query = `
          SELECT * FROM faculties 
          WHERE name LIKE ? OR short_name LIKE ?
          ORDER BY ${orderBy} ${order.toUpperCase()}
          LIMIT ? OFFSET ?
        `;
        const searchParam = `%${search}%`;
        const [rows] = await facultyModel.db.execute(query, [
          searchParam,
          searchParam,
          options.limit,
          options.offset
        ]);
        faculties = rows;

        const countQuery = `
          SELECT COUNT(*) as total FROM faculties 
          WHERE name LIKE ? OR short_name LIKE ?
        `;
        const [countResult] = await facultyModel.db.execute(countQuery, [
          searchParam,
          searchParam
        ]);
        total = countResult[0].total;
      } 
      // Get all faculties
      else {
        faculties = await facultyModel.findAll(options);
        total = await facultyModel.count();
      }

      return res.status(200).json({
        success: true,
        message: 'Faculties retrieved successfully',
        data: faculties,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error in FacultyController.index:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve faculties',
        error: error.message
      });
    }
  },

  /**
   * Get a single faculty by ID
   * @route GET /api/faculties/:id
   */
  show: async (req, res) => {
    try {
      const { id } = req.params;
      const { withDepartments = 'false' } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Faculty ID is required'
        });
      }

      const facultyModel = new Faculty();
      let faculty;

      // Get faculty with departments if requested
      if (withDepartments === 'true') {
        faculty = await facultyModel.findByIdWithDepartments(id);
      } else {
        faculty = await facultyModel.findById(id);
      }

      if (!faculty) {
        return res.status(404).json({
          success: false,
          message: 'Faculty not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Faculty retrieved successfully',
        data: faculty
      });
    } catch (error) {
      console.error('Error in FacultyController.show:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve faculty',
        error: error.message
      });
    }
  },

  /**
   * Create a new faculty
   * @route POST /api/faculties
   */
  store: async (req, res) => {
    try {
      const { name, short_name } = req.body;

      // Validate required fields
      if (!name || !short_name) {
        return res.status(400).json({
          success: false,
          message: 'Name and short name are required'
        });
      }

      // Validate name length
      if (name.length > 255) {
        return res.status(400).json({
          success: false,
          message: 'Faculty name must not exceed 255 characters'
        });
      }

      // Validate short name length
      if (short_name.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Short name must not exceed 50 characters'
        });
      }

      const facultyModel = new Faculty();

      // Create faculty
      const facultyId = await facultyModel.create({ name, short_name });

      // Get the newly created faculty
      const newFaculty = await facultyModel.findById(facultyId);

      return res.status(201).json({
        success: true,
        message: 'Faculty created successfully',
        data: newFaculty
      });
    } catch (error) {
      console.error('Error in FacultyController.store:', error);
      
      // Handle specific errors
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to create faculty',
        error: error.message
      });
    }
  },

  /**
   * Update a faculty
   * @route PUT /api/faculties/:id
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, short_name } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Faculty ID is required'
        });
      }

      const facultyModel = new Faculty();
      
      // Check if faculty exists
      const existingFaculty = await facultyModel.findById(id);
      if (!existingFaculty) {
        return res.status(404).json({
          success: false,
          message: 'Faculty not found'
        });
      }

      // Prepare update data
      const updateData = {};

      if (name !== undefined) {
        if (name.length > 255) {
          return res.status(400).json({
            success: false,
            message: 'Faculty name must not exceed 255 characters'
          });
        }
        updateData.name = name;
      }

      if (short_name !== undefined) {
        if (short_name.length > 50) {
          return res.status(400).json({
            success: false,
            message: 'Short name must not exceed 50 characters'
          });
        }
        updateData.short_name = short_name;
      }

      // If no data to update
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No data provided for update'
        });
      }

      // Update faculty
      await facultyModel.updateFaculty(id, updateData);

      // Get updated faculty
      const updatedFaculty = await facultyModel.findById(id);

      return res.status(200).json({
        success: true,
        message: 'Faculty updated successfully',
        data: updatedFaculty
      });
    } catch (error) {
      console.error('Error in FacultyController.update:', error);
      
      // Handle specific errors
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to update faculty',
        error: error.message
      });
    }
  },

  /**
   * Delete a faculty
   * @route DELETE /api/faculties/:id
   */
  destroy: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Faculty ID is required'
        });
      }

      const facultyModel = new Faculty();
      
      // Check if faculty exists
      const faculty = await facultyModel.findById(id);
      if (!faculty) {
        return res.status(404).json({
          success: false,
          message: 'Faculty not found'
        });
      }

      // Check if faculty has departments
      const facultyWithDept = await facultyModel.findByIdWithDepartments(id);
      if (facultyWithDept.departments && facultyWithDept.departments.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete faculty with existing departments. Please delete or reassign departments first.',
          data: {
            departmentCount: facultyWithDept.departments.length
          }
        });
      }

      // Delete faculty
      await facultyModel.deleteFaculty(id);

      return res.status(200).json({
        success: true,
        message: 'Faculty deleted successfully'
      });
    } catch (error) {
      console.error('Error in FacultyController.destroy:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to delete faculty',
        error: error.message
      });
    }
  }
};

module.exports = FacultyController;
