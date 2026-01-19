const Department = require('../models/Department');

/**
 * Department Controller
 * Handles department management operations
 */
const DepartmentController = {
  /**
   * List all departments
   * @route GET /api/departments
   */
  index: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        orderBy = 'created_at', 
        order = 'DESC',
        withDegrees = 'false',
        facultyId 
      } = req.query;

      const departmentModel = new Department();
      
      // If facultyId is provided, get departments by faculty
      if (facultyId) {
        const departments = await departmentModel.getByFaculty(facultyId);
        
        // Apply search filter if provided
        let filteredDepartments = departments;
        if (search) {
          const searchLower = search.toLowerCase();
          filteredDepartments = departments.filter(dept => 
            dept.name.toLowerCase().includes(searchLower) ||
            dept.dept_code.toLowerCase().includes(searchLower)
          );
        }

        // Apply pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedDepartments = filteredDepartments.slice(startIndex, endIndex);

        return res.status(200).json({
          success: true,
          message: 'Departments retrieved successfully',
          data: paginatedDepartments,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(filteredDepartments.length / parseInt(limit)),
            totalItems: filteredDepartments.length,
            itemsPerPage: parseInt(limit)
          }
        });
      }

      // If withDegrees is true, get departments with their degrees
      if (withDegrees === 'true') {
        const departments = await departmentModel.getWithDegrees();
        
        // Apply search filter if provided
        let filteredDepartments = departments;
        if (search) {
          const searchLower = search.toLowerCase();
          filteredDepartments = departments.filter(dept => 
            dept.name.toLowerCase().includes(searchLower) ||
            dept.dept_code.toLowerCase().includes(searchLower)
          );
        }

        // Apply pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedDepartments = filteredDepartments.slice(startIndex, endIndex);

        return res.status(200).json({
          success: true,
          message: 'Departments retrieved successfully',
          data: paginatedDepartments,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(filteredDepartments.length / parseInt(limit)),
            totalItems: filteredDepartments.length,
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

      let departments;
      let total;

      // Search by name or dept_code if search param provided
      if (search) {
        departments = await departmentModel.search(search);
        total = departments.length;
        
        // Apply pagination to search results
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        departments = departments.slice(startIndex, startIndex + parseInt(limit));
      } 
      // Get all departments with faculty info
      else {
        departments = await departmentModel.getAllWithFaculty(options);
        total = await departmentModel.count();
      }

      return res.status(200).json({
        success: true,
        message: 'Departments retrieved successfully',
        data: departments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error in DepartmentController.index:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve departments',
        error: error.message
      });
    }
  },

  /**
   * Get a single department by ID
   * @route GET /api/departments/:id
   */
  show: async (req, res) => {
    try {
      const { id } = req.params;
      const { withDegrees = 'false' } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Department ID is required'
        });
      }

      const departmentModel = new Department();
      let department;

      // Get department with degrees if requested
      if (withDegrees === 'true') {
        department = await departmentModel.findByIdWithDegrees(id);
      } else {
        department = await departmentModel.findById(id);
      }

      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Department retrieved successfully',
        data: department
      });
    } catch (error) {
      console.error('Error in DepartmentController.show:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve department',
        error: error.message
      });
    }
  },

  /**
   * Create a new department
   * @route POST /api/departments
   */
  store: async (req, res) => {
    try {
      const { name, dept_code, faculty_id } = req.body;

      // Validate required fields
      if (!name || !dept_code || !faculty_id) {
        return res.status(400).json({
          success: false,
          message: 'Name, department code, and faculty ID are required'
        });
      }

      const departmentModel = new Department();

      // Check if department code already exists
      const codeExists = await departmentModel.codeExists(dept_code);
      if (codeExists) {
        return res.status(409).json({
          success: false,
          message: 'Department code already exists'
        });
      }

      // Create department
      const departmentData = {
        name,
        dept_code,
        faculty_id
      };

      const departmentId = await departmentModel.create(departmentData);

      // Fetch the created department
      const department = await departmentModel.findById(departmentId);

      return res.status(201).json({
        success: true,
        message: 'Department created successfully',
        data: department
      });
    } catch (error) {
      console.error('Error in DepartmentController.store:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create department',
        error: error.message
      });
    }
  },

  /**
   * Update a department
   * @route PUT /api/departments/:id
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, dept_code, faculty_id } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Department ID is required'
        });
      }

      const departmentModel = new Department();

      // Check if department exists
      const existingDepartment = await departmentModel.findById(id);
      if (!existingDepartment) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }

      // Check if department code is being changed and if new code already exists
      if (dept_code && dept_code !== existingDepartment.dept_code) {
        const codeExists = await departmentModel.codeExists(dept_code, id);
        if (codeExists) {
          return res.status(409).json({
            success: false,
            message: 'Department code already exists'
          });
        }
      }

      // Build update data (only include provided fields)
      const updateData = {};
      if (name) updateData.name = name;
      if (dept_code) updateData.dept_code = dept_code;
      if (faculty_id) updateData.faculty_id = faculty_id;

      // Update department
      await departmentModel.update(id, updateData);

      // Fetch updated department
      const department = await departmentModel.findById(id);

      return res.status(200).json({
        success: true,
        message: 'Department updated successfully',
        data: department
      });
    } catch (error) {
      console.error('Error in DepartmentController.update:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update department',
        error: error.message
      });
    }
  },

  /**
   * Delete a department
   * @route DELETE /api/departments/:id
   */
  destroy: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Department ID is required'
        });
      }

      const departmentModel = new Department();

      // Check if department exists
      const department = await departmentModel.findById(id);
      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }

      // Delete department
      await departmentModel.delete(id);

      return res.status(200).json({
        success: true,
        message: 'Department deleted successfully',
        data: { id: parseInt(id) }
      });
    } catch (error) {
      console.error('Error in DepartmentController.destroy:', error);
      
      // Handle foreign key constraint errors
      if (error.message.includes('foreign key constraint')) {
        return res.status(409).json({
          success: false,
          message: 'Cannot delete department as it has associated degrees or other related records'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to delete department',
        error: error.message
      });
    }
  },

  /**
   * Get department count by faculty
   * @route GET /api/departments/count/by-faculty/:facultyId
   */
  countByFaculty: async (req, res) => {
    try {
      const { facultyId } = req.params;

      if (!facultyId) {
        return res.status(400).json({
          success: false,
          message: 'Faculty ID is required'
        });
      }

      const departmentModel = new Department();
      const count = await departmentModel.countByFaculty(facultyId);

      return res.status(200).json({
        success: true,
        message: 'Department count retrieved successfully',
        data: { faculty_id: parseInt(facultyId), count }
      });
    } catch (error) {
      console.error('Error in DepartmentController.countByFaculty:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get department count',
        error: error.message
      });
    }
  },

  /**
   * Get department by code
   * @route GET /api/departments/code/:code
   */
  getByCode: async (req, res) => {
    try {
      const { code } = req.params;

      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Department code is required'
        });
      }

      const departmentModel = new Department();
      const department = await departmentModel.findByCode(code);

      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Department retrieved successfully',
        data: department
      });
    } catch (error) {
      console.error('Error in DepartmentController.getByCode:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve department',
        error: error.message
      });
    }
  }
};

module.exports = DepartmentController;
