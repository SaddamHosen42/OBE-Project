const Degree = require('../models/Degree');

/**
 * Degree Controller
 * Handles degree/program management operations
 */
const DegreeController = {
  /**
   * List all degrees
   * @route GET /api/degrees
   */
  index: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        orderBy = 'created_at', 
        order = 'DESC',
        withPLOs = 'false',
        withPEOs = 'false',
        departmentId 
      } = req.query;

      const degreeModel = new Degree();
      
      // If departmentId is provided, get degrees by department
      if (departmentId) {
        const degrees = await degreeModel.getByDepartment(departmentId);
        
        // Apply search filter if provided
        let filteredDegrees = degrees;
        if (search) {
          const searchLower = search.toLowerCase();
          filteredDegrees = degrees.filter(degree => 
            degree.name.toLowerCase().includes(searchLower)
          );
        }

        // Apply pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedDegrees = filteredDegrees.slice(startIndex, endIndex);

        return res.status(200).json({
          success: true,
          message: 'Degrees retrieved successfully',
          data: paginatedDegrees,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(filteredDegrees.length / parseInt(limit)),
            totalItems: filteredDegrees.length,
            itemsPerPage: parseInt(limit)
          }
        });
      }

      // If withPLOs is true, get degrees with their PLOs
      if (withPLOs === 'true') {
        const degrees = await degreeModel.getWithPLOs();
        
        // Apply search filter if provided
        let filteredDegrees = degrees;
        if (search) {
          const searchLower = search.toLowerCase();
          filteredDegrees = degrees.filter(degree => 
            degree.name.toLowerCase().includes(searchLower)
          );
        }

        // Apply pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedDegrees = filteredDegrees.slice(startIndex, endIndex);

        return res.status(200).json({
          success: true,
          message: 'Degrees retrieved successfully',
          data: paginatedDegrees,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(filteredDegrees.length / parseInt(limit)),
            totalItems: filteredDegrees.length,
            itemsPerPage: parseInt(limit)
          }
        });
      }

      // If withPEOs is true, get degrees with their PEOs
      if (withPEOs === 'true') {
        const degrees = await degreeModel.getWithPEOs();
        
        // Apply search filter if provided
        let filteredDegrees = degrees;
        if (search) {
          const searchLower = search.toLowerCase();
          filteredDegrees = degrees.filter(degree => 
            degree.name.toLowerCase().includes(searchLower)
          );
        }

        // Apply pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedDegrees = filteredDegrees.slice(startIndex, endIndex);

        return res.status(200).json({
          success: true,
          message: 'Degrees retrieved successfully',
          data: paginatedDegrees,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(filteredDegrees.length / parseInt(limit)),
            totalItems: filteredDegrees.length,
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

      let degrees;
      let total;

      // Search by name if search param provided
      if (search) {
        degrees = await degreeModel.search(search);
        total = degrees.length;
        
        // Apply pagination to search results
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        degrees = degrees.slice(startIndex, startIndex + parseInt(limit));
      } 
      // Get all degrees with relations
      else {
        degrees = await degreeModel.getAllWithRelations(options);
        total = await degreeModel.count();
      }

      return res.status(200).json({
        success: true,
        message: 'Degrees retrieved successfully',
        data: degrees,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error in DegreeController.index:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve degrees',
        error: error.message
      });
    }
  },

  /**
   * Get a single degree by ID
   * @route GET /api/degrees/:id
   */
  show: async (req, res) => {
    try {
      const { id } = req.params;
      const { withPLOs = 'false', withPEOs = 'false', withBoth = 'false' } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Degree ID is required'
        });
      }

      const degreeModel = new Degree();
      let degree;

      // Get degree with both PLOs and PEOs if requested
      if (withBoth === 'true') {
        degree = await degreeModel.findByIdWithPLOsAndPEOs(id);
      }
      // Get degree with PLOs if requested
      else if (withPLOs === 'true') {
        degree = await degreeModel.findByIdWithPLOs(id);
      }
      // Get degree with PEOs if requested
      else if (withPEOs === 'true') {
        degree = await degreeModel.findByIdWithPEOs(id);
      }
      // Get basic degree info
      else {
        degree = await degreeModel.findById(id);
      }

      if (!degree) {
        return res.status(404).json({
          success: false,
          message: 'Degree not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Degree retrieved successfully',
        data: degree
      });
    } catch (error) {
      console.error('Error in DegreeController.show:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve degree',
        error: error.message
      });
    }
  },

  /**
   * Create a new degree
   * @route POST /api/degrees
   */
  store: async (req, res) => {
    try {
      const { name, faculty_id, department_id, credit_hours, duration_years } = req.body;

      // Validate required fields
      if (!name || !faculty_id || !department_id) {
        return res.status(400).json({
          success: false,
          message: 'Name, faculty ID, and department ID are required'
        });
      }

      const degreeModel = new Degree();

      // Create degree
      const degreeData = {
        name,
        faculty_id,
        department_id,
        credit_hours: credit_hours || null,
        duration_years: duration_years || 4
      };

      const degreeId = await degreeModel.create(degreeData);

      // Fetch the created degree with relations
      const degree = await degreeModel.findById(degreeId);

      return res.status(201).json({
        success: true,
        message: 'Degree created successfully',
        data: degree
      });
    } catch (error) {
      console.error('Error in DegreeController.store:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create degree',
        error: error.message
      });
    }
  },

  /**
   * Update a degree
   * @route PUT /api/degrees/:id
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, faculty_id, department_id, credit_hours, duration_years } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Degree ID is required'
        });
      }

      const degreeModel = new Degree();

      // Check if degree exists
      const existingDegree = await degreeModel.findById(id);
      if (!existingDegree) {
        return res.status(404).json({
          success: false,
          message: 'Degree not found'
        });
      }

      // Build update data (only include provided fields)
      const updateData = {};
      if (name) updateData.name = name;
      if (faculty_id) updateData.faculty_id = faculty_id;
      if (department_id) updateData.department_id = department_id;
      if (credit_hours !== undefined) updateData.credit_hours = credit_hours;
      if (duration_years) updateData.duration_years = duration_years;

      // Update degree
      await degreeModel.update(id, updateData);

      // Fetch updated degree
      const degree = await degreeModel.findById(id);

      return res.status(200).json({
        success: true,
        message: 'Degree updated successfully',
        data: degree
      });
    } catch (error) {
      console.error('Error in DegreeController.update:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update degree',
        error: error.message
      });
    }
  },

  /**
   * Delete a degree
   * @route DELETE /api/degrees/:id
   */
  destroy: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Degree ID is required'
        });
      }

      const degreeModel = new Degree();

      // Check if degree exists
      const degree = await degreeModel.findById(id);
      if (!degree) {
        return res.status(404).json({
          success: false,
          message: 'Degree not found'
        });
      }

      // Delete degree
      await degreeModel.delete(id);

      return res.status(200).json({
        success: true,
        message: 'Degree deleted successfully',
        data: { id: parseInt(id) }
      });
    } catch (error) {
      console.error('Error in DegreeController.destroy:', error);
      
      // Handle foreign key constraint errors
      if (error.message.includes('foreign key constraint')) {
        return res.status(409).json({
          success: false,
          message: 'Cannot delete degree as it has associated PLOs, PEOs, courses, or other related records'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to delete degree',
        error: error.message
      });
    }
  },

  /**
   * Get degree count by department
   * @route GET /api/degrees/count/by-department/:departmentId
   */
  countByDepartment: async (req, res) => {
    try {
      const { departmentId } = req.params;

      if (!departmentId) {
        return res.status(400).json({
          success: false,
          message: 'Department ID is required'
        });
      }

      const degreeModel = new Degree();
      const count = await degreeModel.countByDepartment(departmentId);

      return res.status(200).json({
        success: true,
        message: 'Degree count retrieved successfully',
        data: { department_id: parseInt(departmentId), count }
      });
    } catch (error) {
      console.error('Error in DegreeController.countByDepartment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get degree count',
        error: error.message
      });
    }
  }
};

module.exports = DegreeController;
