const Course = require('../models/Course');

/**
 * Course Controller
 * Handles course catalog management operations
 */
const CourseController = {
  /**
   * List all courses with pagination, filtering, and search
   * @route GET /api/courses
   */
  index: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        orderBy = 'courseCode',
        order = 'ASC',
        departmentId,
        degreeId,
        level,
        semester,
        type
      } = req.query;

      const courseModel = new Course();

      // If departmentId is provided, get courses for that department
      if (departmentId) {
        const courses = await courseModel.getByDepartment(parseInt(departmentId), {
          orderBy,
          order: order.toUpperCase(),
          includeDepartment: true,
          includeDegree: true
        });

        // Apply additional filters
        let filteredCourses = courses;
        
        if (search) {
          const searchLower = search.toLowerCase();
          filteredCourses = filteredCourses.filter(course =>
            course.courseCode.toLowerCase().includes(searchLower) ||
            course.courseTitle.toLowerCase().includes(searchLower)
          );
        }

        if (level) {
          filteredCourses = filteredCourses.filter(course => course.level === level);
        }

        if (semester) {
          filteredCourses = filteredCourses.filter(course => course.semester === semester);
        }

        if (type) {
          filteredCourses = filteredCourses.filter(course => course.type === type);
        }

        // Apply pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

        return res.status(200).json({
          success: true,
          message: 'Courses retrieved successfully',
          data: paginatedCourses,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(filteredCourses.length / parseInt(limit)),
            totalItems: filteredCourses.length,
            itemsPerPage: parseInt(limit)
          }
        });
      }

      // If degreeId is provided, get courses for that degree
      if (degreeId) {
        const courses = await courseModel.getByDegree(parseInt(degreeId), {
          orderBy,
          order: order.toUpperCase(),
          includeDepartment: true,
          includeDegree: true,
          level,
          semester,
          type
        });

        // Apply search filter
        let filteredCourses = courses;
        
        if (search) {
          const searchLower = search.toLowerCase();
          filteredCourses = filteredCourses.filter(course =>
            course.courseCode.toLowerCase().includes(searchLower) ||
            course.courseTitle.toLowerCase().includes(searchLower)
          );
        }

        // Apply pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

        return res.status(200).json({
          success: true,
          message: 'Courses retrieved successfully',
          data: paginatedCourses,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(filteredCourses.length / parseInt(limit)),
            totalItems: filteredCourses.length,
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
          fields: ['courseCode', 'courseTitle'],
          value: search
        } : null
      };

      const result = await courseModel.getAllWithPagination(options);

      res.status(200).json({
        success: true,
        message: 'Courses retrieved successfully',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error in CourseController.index:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve courses',
        error: error.message
      });
    }
  },

  /**
   * Search courses by keyword
   * @route GET /api/courses/search
   */
  searchCourses: async (req, res) => {
    try {
      const { keyword, page = 1, limit = 20, orderBy = 'courseCode', order = 'ASC' } = req.query;

      if (!keyword) {
        return res.status(400).json({
          success: false,
          message: 'Search keyword is required'
        });
      }

      const courseModel = new Course();
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const courses = await courseModel.search(keyword, {
        limit: parseInt(limit),
        offset,
        orderBy,
        order: order.toUpperCase()
      });

      res.status(200).json({
        success: true,
        message: 'Search results retrieved successfully',
        data: courses,
        pagination: {
          currentPage: parseInt(page),
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error in CourseController.searchCourses:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search courses',
        error: error.message
      });
    }
  },

  /**
   * Get a single course by ID
   * @route GET /api/courses/:id
   */
  show: async (req, res) => {
    try {
      const { id } = req.params;
      const { includeAll = 'false' } = req.query;

      const courseModel = new Course();

      let course;
      
      if (includeAll === 'true') {
        course = await courseModel.getWithAllRelations(parseInt(id));
      } else {
        course = await courseModel.findById(parseInt(id));
      }

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Course retrieved successfully',
        data: course
      });
    } catch (error) {
      console.error('Error in CourseController.show:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve course',
        error: error.message
      });
    }
  },

  /**
   * Get CLOs for a specific course
   * @route GET /api/courses/:id/clos
   */
  getCLOs: async (req, res) => {
    try {
      const { id } = req.params;
      const courseModel = new Course();

      // Check if course exists
      const course = await courseModel.findById(parseInt(id));
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Get course with CLOs
      const courseWithCLOs = await courseModel.getWithCLOs(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Course Learning Outcomes retrieved successfully',
        data: {
          course: {
            id: courseWithCLOs.id,
            courseCode: courseWithCLOs.courseCode,
            courseTitle: courseWithCLOs.courseTitle
          },
          clos: courseWithCLOs.clos
        }
      });
    } catch (error) {
      console.error('Error in CourseController.getCLOs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve CLOs',
        error: error.message
      });
    }
  },

  /**
   * Get objectives for a specific course
   * @route GET /api/courses/:id/objectives
   */
  getObjectives: async (req, res) => {
    try {
      const { id } = req.params;
      const courseModel = new Course();

      // Check if course exists
      const course = await courseModel.findById(parseInt(id));
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Get course with objectives
      const courseWithObjectives = await courseModel.getWithObjectives(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Course Objectives retrieved successfully',
        data: {
          course: {
            id: courseWithObjectives.id,
            courseCode: courseWithObjectives.courseCode,
            courseTitle: courseWithObjectives.courseTitle
          },
          objectives: courseWithObjectives.objectives
        }
      });
    } catch (error) {
      console.error('Error in CourseController.getObjectives:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve objectives',
        error: error.message
      });
    }
  },

  /**
   * Create a new course
   * @route POST /api/courses
   */
  store: async (req, res) => {
    try {
      const {
        courseCode,
        courseTitle,
        department_id,
        degree_id,
        credit,
        contactHourPerWeek,
        level,
        semester,
        academicSession,
        type,
        type_T_S,
        totalMarks,
        instructor,
        prerequisites,
        summary
      } = req.body;

      // Validate required fields
      if (!courseCode || !courseTitle || !department_id || !degree_id || credit === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
          required: ['courseCode', 'courseTitle', 'department_id', 'degree_id', 'credit']
        });
      }

      // Validate credit hours
      if (credit < 0) {
        return res.status(400).json({
          success: false,
          message: 'Credit hours cannot be negative'
        });
      }

      const courseModel = new Course();

      // Validate course data
      const validation = await courseModel.validateCourse({
        courseCode,
        courseTitle,
        department_id,
        degree_id,
        credit,
        contactHourPerWeek
      });

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      const courseData = {
        courseCode,
        courseTitle,
        department_id,
        degree_id,
        credit,
        contactHourPerWeek: contactHourPerWeek || null,
        level: level || null,
        semester: semester || null,
        academicSession: academicSession || null,
        type: type || null,
        type_T_S: type_T_S || null,
        totalMarks: totalMarks || null,
        instructor: instructor || null,
        prerequisites: prerequisites || null,
        summary: summary || null
      };

      const result = await courseModel.create(courseData);

      // Fetch the created course with relations
      const course = await courseModel.getWithAllRelations(result.insertId);

      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: course
      });
    } catch (error) {
      console.error('Error in CourseController.store:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create course',
        error: error.message
      });
    }
  },

  /**
   * Update an existing course
   * @route PUT /api/courses/:id
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        courseCode,
        courseTitle,
        department_id,
        degree_id,
        credit,
        contactHourPerWeek,
        level,
        semester,
        academicSession,
        type,
        type_T_S,
        totalMarks,
        instructor,
        prerequisites,
        summary
      } = req.body;

      const courseModel = new Course();

      // Check if course exists
      const existingCourse = await courseModel.findById(parseInt(id));
      if (!existingCourse) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Build update data
      const updateData = {};

      if (courseCode !== undefined) updateData.courseCode = courseCode;
      if (courseTitle !== undefined) updateData.courseTitle = courseTitle;
      if (department_id !== undefined) updateData.department_id = department_id;
      if (degree_id !== undefined) updateData.degree_id = degree_id;
      if (credit !== undefined) {
        if (credit < 0) {
          return res.status(400).json({
            success: false,
            message: 'Credit hours cannot be negative'
          });
        }
        updateData.credit = credit;
      }
      if (contactHourPerWeek !== undefined) updateData.contactHourPerWeek = contactHourPerWeek;
      if (level !== undefined) updateData.level = level;
      if (semester !== undefined) updateData.semester = semester;
      if (academicSession !== undefined) updateData.academicSession = academicSession;
      if (type !== undefined) updateData.type = type;
      if (type_T_S !== undefined) updateData.type_T_S = type_T_S;
      if (totalMarks !== undefined) updateData.totalMarks = totalMarks;
      if (instructor !== undefined) updateData.instructor = instructor;
      if (prerequisites !== undefined) updateData.prerequisites = prerequisites;
      if (summary !== undefined) updateData.summary = summary;

      // Validate course data if critical fields are being updated
      if (courseCode || department_id || degree_id || credit !== undefined || contactHourPerWeek !== undefined) {
        const validation = await courseModel.validateCourse({
          courseCode: updateData.courseCode || existingCourse.courseCode,
          courseTitle: updateData.courseTitle || existingCourse.courseTitle,
          department_id: updateData.department_id || existingCourse.department_id,
          degree_id: updateData.degree_id || existingCourse.degree_id,
          credit: updateData.credit !== undefined ? updateData.credit : existingCourse.credit,
          contactHourPerWeek: updateData.contactHourPerWeek !== undefined ? updateData.contactHourPerWeek : existingCourse.contactHourPerWeek
        }, parseInt(id));

        if (!validation.isValid) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: validation.errors
          });
        }
      }

      await courseModel.update(parseInt(id), updateData);

      // Fetch updated course with relations
      const course = await courseModel.getWithAllRelations(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Course updated successfully',
        data: course
      });
    } catch (error) {
      console.error('Error in CourseController.update:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update course',
        error: error.message
      });
    }
  },

  /**
   * Delete a course
   * @route DELETE /api/courses/:id
   */
  destroy: async (req, res) => {
    try {
      const { id } = req.params;
      const courseModel = new Course();

      // Check if course exists
      const course = await courseModel.findById(parseInt(id));
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Check if course has CLOs or objectives
      const cloCount = await courseModel.countCLOs(parseInt(id));
      const objectiveCount = await courseModel.countObjectives(parseInt(id));

      if (cloCount > 0 || objectiveCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete course with ${cloCount} CLO(s) and ${objectiveCount} objective(s). Please delete them first.`
        });
      }

      await courseModel.delete(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Course deleted successfully'
      });
    } catch (error) {
      console.error('Error in CourseController.destroy:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete course',
        error: error.message
      });
    }
  },

  /**
   * Get count of CLOs for a course
   * @route GET /api/courses/:id/clos/count
   */
  countCLOs: async (req, res) => {
    try {
      const { id } = req.params;
      const courseModel = new Course();

      // Check if course exists
      const course = await courseModel.findById(parseInt(id));
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      const count = await courseModel.countCLOs(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'CLOs count retrieved successfully',
        data: {
          course_id: parseInt(id),
          count
        }
      });
    } catch (error) {
      console.error('Error in CourseController.countCLOs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to count CLOs',
        error: error.message
      });
    }
  },

  /**
   * Get count of objectives for a course
   * @route GET /api/courses/:id/objectives/count
   */
  countObjectives: async (req, res) => {
    try {
      const { id } = req.params;
      const courseModel = new Course();

      // Check if course exists
      const course = await courseModel.findById(parseInt(id));
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      const count = await courseModel.countObjectives(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Objectives count retrieved successfully',
        data: {
          course_id: parseInt(id),
          count
        }
      });
    } catch (error) {
      console.error('Error in CourseController.countObjectives:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to count objectives',
        error: error.message
      });
    }
  }
};

module.exports = CourseController;
