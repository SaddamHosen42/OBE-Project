const Teacher = require('../models/Teacher');

/**
 * Teacher Controller
 * Handles teacher management operations
 */
const TeacherController = {
  /**
   * List all teachers
   * @route GET /api/teachers
   */
  index: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        orderBy = 'created_at', 
        order = 'DESC',
        withDetails = 'false',
        departmentId
      } = req.query;

      const teacherModel = new Teacher();
      
      // If withDetails is true, get teachers with complete details
      if (withDetails === 'true') {
        let teachers;
        
        // Filter by department if provided
        if (departmentId) {
          teachers = await teacherModel.getByDepartment(parseInt(departmentId));
        } else {
          teachers = await teacherModel.getAllWithDetails();
        }
        
        // Apply search filter if provided
        let filteredTeachers = teachers;
        if (search) {
          const searchLower = search.toLowerCase();
          filteredTeachers = teachers.filter(teacher => 
            teacher.user_name?.toLowerCase().includes(searchLower) ||
            teacher.employee_id?.toLowerCase().includes(searchLower) ||
            teacher.user_email?.toLowerCase().includes(searchLower) ||
            teacher.department_name?.toLowerCase().includes(searchLower) ||
            teacher.designation_name?.toLowerCase().includes(searchLower)
          );
        }

        // Apply pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedTeachers = filteredTeachers.slice(startIndex, endIndex);

        return res.status(200).json({
          success: true,
          message: 'Teachers retrieved successfully',
          data: paginatedTeachers,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(filteredTeachers.length / parseInt(limit)),
            totalItems: filteredTeachers.length,
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

      let teachers;
      let total;

      // Search by employee_id or filter by department
      if (search || departmentId) {
        let query = 'SELECT * FROM teachers WHERE 1=1';
        const params = [];

        if (departmentId) {
          query += ' AND department_id = ?';
          params.push(parseInt(departmentId));
        }

        if (search) {
          query += ' AND employee_id LIKE ?';
          params.push(`%${search}%`);
        }

        query += ` ORDER BY ${orderBy} ${order.toUpperCase()} LIMIT ? OFFSET ?`;
        params.push(options.limit, options.offset);

        const [rows] = await teacherModel.db.execute(query, params);
        teachers = rows;

        // Get count
        let countQuery = 'SELECT COUNT(*) as total FROM teachers WHERE 1=1';
        const countParams = [];

        if (departmentId) {
          countQuery += ' AND department_id = ?';
          countParams.push(parseInt(departmentId));
        }

        if (search) {
          countQuery += ' AND employee_id LIKE ?';
          countParams.push(`%${search}%`);
        }

        const [countResult] = await teacherModel.db.execute(countQuery, countParams);
        total = countResult[0].total;
      } 
      // Get all teachers
      else {
        teachers = await teacherModel.findAll(options);
        total = await teacherModel.count();
      }

      return res.status(200).json({
        success: true,
        message: 'Teachers retrieved successfully',
        data: teachers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error in TeacherController.index:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve teachers',
        error: error.message
      });
    }
  },

  /**
   * Get a single teacher by ID
   * @route GET /api/teachers/:id
   */
  show: async (req, res) => {
    try {
      const { id } = req.params;
      const { withDetails = 'false' } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Teacher ID is required'
        });
      }

      const teacherModel = new Teacher();
      let teacher;

      // Get teacher with complete details if requested
      if (withDetails === 'true') {
        teacher = await teacherModel.findByIdWithDetails(id);
      } else {
        teacher = await teacherModel.findById(id);
      }

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Teacher retrieved successfully',
        data: teacher
      });
    } catch (error) {
      console.error('Error in TeacherController.show:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve teacher',
        error: error.message
      });
    }
  },

  /**
   * Create a new teacher
   * @route POST /api/teachers
   */
  store: async (req, res) => {
    try {
      const { user_id, faculty_id, department_id, designation_id, employee_id, joining_date, career_obj } = req.body;

      // Validate required fields
      if (!user_id || !faculty_id || !department_id || !designation_id || !employee_id || !joining_date) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields. Required: user_id, faculty_id, department_id, designation_id, employee_id, joining_date'
        });
      }

      const teacherModel = new Teacher();

      // Check if user_id already exists
      const existingTeacher = await teacherModel.findByUserId(user_id);
      if (existingTeacher) {
        return res.status(409).json({
          success: false,
          message: 'Teacher already exists for this user'
        });
      }

      // Check if employee_id already exists
      const existingEmployeeId = await teacherModel.findByEmployeeId(employee_id);
      if (existingEmployeeId) {
        return res.status(409).json({
          success: false,
          message: 'Employee ID already exists'
        });
      }

      const newTeacher = await teacherModel.create({
        user_id,
        faculty_id,
        department_id,
        designation_id,
        employee_id,
        joining_date,
        career_obj
      });

      // Fetch the complete teacher details
      const teacher = await teacherModel.findByIdWithDetails(newTeacher.id);

      return res.status(201).json({
        success: true,
        message: 'Teacher created successfully',
        data: teacher
      });
    } catch (error) {
      console.error('Error in TeacherController.store:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create teacher',
        error: error.message
      });
    }
  },

  /**
   * Update a teacher
   * @route PUT /api/teachers/:id
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { user_id, faculty_id, department_id, designation_id, employee_id, joining_date, career_obj } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Teacher ID is required'
        });
      }

      const teacherModel = new Teacher();

      // Check if teacher exists
      const existingTeacher = await teacherModel.findById(id);
      if (!existingTeacher) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found'
        });
      }

      // If employee_id is being updated, check if it already exists
      if (employee_id && employee_id !== existingTeacher.employee_id) {
        const existingEmployeeId = await teacherModel.findByEmployeeId(employee_id);
        if (existingEmployeeId && existingEmployeeId.id !== parseInt(id)) {
          return res.status(409).json({
            success: false,
            message: 'Employee ID already exists'
          });
        }
      }

      // If user_id is being updated, check if it already exists
      if (user_id && user_id !== existingTeacher.user_id) {
        const existingUserId = await teacherModel.findByUserId(user_id);
        if (existingUserId && existingUserId.id !== parseInt(id)) {
          return res.status(409).json({
            success: false,
            message: 'Teacher already exists for this user'
          });
        }
      }

      const updateData = {};
      if (user_id !== undefined) updateData.user_id = user_id;
      if (faculty_id !== undefined) updateData.faculty_id = faculty_id;
      if (department_id !== undefined) updateData.department_id = department_id;
      if (designation_id !== undefined) updateData.designation_id = designation_id;
      if (employee_id !== undefined) updateData.employee_id = employee_id;
      if (joining_date !== undefined) updateData.joining_date = joining_date;
      if (career_obj !== undefined) updateData.career_obj = career_obj;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
      }

      const updated = await teacherModel.update(id, updateData);

      if (!updated) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update teacher'
        });
      }

      // Fetch the updated teacher details
      const teacher = await teacherModel.findByIdWithDetails(id);

      return res.status(200).json({
        success: true,
        message: 'Teacher updated successfully',
        data: teacher
      });
    } catch (error) {
      console.error('Error in TeacherController.update:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update teacher',
        error: error.message
      });
    }
  },

  /**
   * Delete a teacher
   * @route DELETE /api/teachers/:id
   */
  destroy: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Teacher ID is required'
        });
      }

      const teacherModel = new Teacher();

      // Check if teacher exists
      const existingTeacher = await teacherModel.findById(id);
      if (!existingTeacher) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found'
        });
      }

      const deleted = await teacherModel.delete(id);

      if (!deleted) {
        return res.status(500).json({
          success: false,
          message: 'Failed to delete teacher'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Teacher deleted successfully'
      });
    } catch (error) {
      console.error('Error in TeacherController.destroy:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete teacher',
        error: error.message
      });
    }
  },

  /**
   * Get teachers by department
   * @route GET /api/teachers/department/:departmentId
   */
  getByDepartment: async (req, res) => {
    try {
      const { departmentId } = req.params;

      if (!departmentId) {
        return res.status(400).json({
          success: false,
          message: 'Department ID is required'
        });
      }

      const teacherModel = new Teacher();
      const teachers = await teacherModel.getByDepartment(departmentId);

      return res.status(200).json({
        success: true,
        message: 'Teachers retrieved successfully',
        data: teachers
      });
    } catch (error) {
      console.error('Error in TeacherController.getByDepartment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve teachers',
        error: error.message
      });
    }
  },

  /**
   * Get all courses assigned to a teacher
   * @route GET /api/teachers/:id/courses
   */
  getCourses: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Teacher ID is required'
        });
      }

      const teacherModel = new Teacher();

      // Check if teacher exists
      const teacher = await teacherModel.findById(id);
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found'
        });
      }

      const courses = await teacherModel.getCourses(id);

      return res.status(200).json({
        success: true,
        message: 'Courses retrieved successfully',
        data: courses
      });
    } catch (error) {
      console.error('Error in TeacherController.getCourses:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve courses',
        error: error.message
      });
    }
  },

  /**
   * Assign a course to a teacher
   * @route POST /api/teachers/:id/courses
   */
  assignCourse: async (req, res) => {
    try {
      const { id } = req.params;
      const { course_offering_id, role, lessons } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Teacher ID is required'
        });
      }

      if (!course_offering_id) {
        return res.status(400).json({
          success: false,
          message: 'Course offering ID is required'
        });
      }

      const teacherModel = new Teacher();

      // Check if teacher exists
      const teacher = await teacherModel.findById(id);
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found'
        });
      }

      // Assign the course
      const assignment = await teacherModel.assignCourse(
        id, 
        course_offering_id, 
        role || 'Instructor', 
        lessons || null
      );

      return res.status(201).json({
        success: true,
        message: 'Course assigned successfully',
        data: assignment
      });
    } catch (error) {
      console.error('Error in TeacherController.assignCourse:', error);
      
      // Check for duplicate entry error
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'This course is already assigned to the teacher'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to assign course',
        error: error.message
      });
    }
  },

  /**
   * Remove a course assignment from a teacher
   * @route DELETE /api/teachers/:id/courses/:courseOfferingId
   */
  removeCourseAssignment: async (req, res) => {
    try {
      const { id, courseOfferingId } = req.params;

      if (!id || !courseOfferingId) {
        return res.status(400).json({
          success: false,
          message: 'Teacher ID and Course Offering ID are required'
        });
      }

      const teacherModel = new Teacher();

      // Check if teacher exists
      const teacher = await teacherModel.findById(id);
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found'
        });
      }

      const removed = await teacherModel.removeCourseAssignment(id, courseOfferingId);

      if (!removed) {
        return res.status(404).json({
          success: false,
          message: 'Course assignment not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Course assignment removed successfully'
      });
    } catch (error) {
      console.error('Error in TeacherController.removeCourseAssignment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to remove course assignment',
        error: error.message
      });
    }
  },

  /**
   * Update a course assignment
   * @route PUT /api/teachers/:id/courses/:assignmentId
   */
  updateCourseAssignment: async (req, res) => {
    try {
      const { id, assignmentId } = req.params;
      const { role, lessons } = req.body;

      if (!id || !assignmentId) {
        return res.status(400).json({
          success: false,
          message: 'Teacher ID and Assignment ID are required'
        });
      }

      const teacherModel = new Teacher();

      // Check if teacher exists
      const teacher = await teacherModel.findById(id);
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found'
        });
      }

      const updateData = {};
      if (role !== undefined) updateData.role = role;
      if (lessons !== undefined) updateData.lessons = lessons;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
      }

      const updated = await teacherModel.updateCourseAssignment(assignmentId, updateData);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Course assignment not found or not updated'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Course assignment updated successfully'
      });
    } catch (error) {
      console.error('Error in TeacherController.updateCourseAssignment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update course assignment',
        error: error.message
      });
    }
  }
};

module.exports = TeacherController;
