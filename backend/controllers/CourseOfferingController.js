const CourseOffering = require('../models/CourseOffering');
const db = require('../config/database');

/**
 * CourseOffering Controller
 * Handles course offering/section management operations
 */
const CourseOfferingController = {
  /**
   * Get course progress for dashboard
   * @route GET /api/course-offerings/progress
   * Returns active courses with completion metrics
   */
  getProgress: async (req, res) => {
    try {
      console.log('getProgress called - fetching course progress data...');
      
      // Very simple query first to test
      const query = `
        SELECT 
          co.id,
          c.courseCode as course_code,
          c.courseTitle as course_name,
          s.name as semester_name,
          0 as enrolled_students,
          0 as total_assessments,
          0 as completed_assessments,
          0 as attainment_percentage,
          0 as completion_percentage,
          0 as average_score
        FROM course_offerings co
        INNER JOIN courses c ON co.course_id = c.id
        INNER JOIN semesters s ON co.semester_id = s.id
        WHERE co.status = 'active'
        ORDER BY co.id DESC
        LIMIT 5
      `;

      console.log('Executing query...');
      const [courses] = await db.execute(query);
      console.log(`Found ${courses.length} courses`);

      return res.status(200).json({
        success: true,
        message: 'Course progress retrieved successfully',
        data: courses
      });
    } catch (error) {
      console.error('Error in getProgress - Full error:', error);
      console.error('Error stack:', error.stack);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve course progress',
        error: error.message
      });
    }
  },
  /**
   * List all course offerings with filtering and pagination
   * @route GET /api/course-offerings
   */
  index: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        orderBy = 'section',
        order = 'ASC',
        semesterId,
        teacherId,
        courseId,
        status
      } = req.query;

      const courseOfferingModel = new CourseOffering();

      // If semesterId is provided, get offerings for that semester
      if (semesterId) {
        const offerings = await courseOfferingModel.getBySemester(parseInt(semesterId), {
          orderBy,
          order: order.toUpperCase(),
          includeCourse: true,
          includeSemester: true,
          status
        });

        // Apply pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedOfferings = offerings.slice(startIndex, endIndex);

        return res.status(200).json({
          success: true,
          message: 'Course offerings retrieved successfully',
          data: paginatedOfferings,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(offerings.length / parseInt(limit)),
            totalItems: offerings.length,
            itemsPerPage: parseInt(limit)
          }
        });
      }

      // If teacherId is provided, get offerings for that teacher
      if (teacherId) {
        const offerings = await courseOfferingModel.getByTeacher(parseInt(teacherId), {
          orderBy,
          order: order.toUpperCase(),
          includeCourse: true,
          includeSemester: true,
          status
        });

        // Apply pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedOfferings = offerings.slice(startIndex, endIndex);

        return res.status(200).json({
          success: true,
          message: 'Course offerings retrieved successfully',
          data: paginatedOfferings,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(offerings.length / parseInt(limit)),
            totalItems: offerings.length,
            itemsPerPage: parseInt(limit)
          }
        });
      }

      // If courseId is provided, get offerings for that course
      if (courseId) {
        const offerings = await courseOfferingModel.getByCourse(parseInt(courseId), {
          orderBy,
          order: order.toUpperCase(),
          includeSemester: true,
          status
        });

        // Apply pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedOfferings = offerings.slice(startIndex, endIndex);

        return res.status(200).json({
          success: true,
          message: 'Course offerings retrieved successfully',
          data: paginatedOfferings,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(offerings.length / parseInt(limit)),
            totalItems: offerings.length,
            itemsPerPage: parseInt(limit)
          }
        });
      }

      // Get all course offerings with pagination
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const offerings = await courseOfferingModel.findAll({
        orderBy,
        order: order.toUpperCase(),
        limit: parseInt(limit),
        offset
      });

      // Get total count for pagination
      const totalQuery = status 
        ? { status } 
        : {};
      const allOfferings = await courseOfferingModel.findWhere(totalQuery);

      return res.status(200).json({
        success: true,
        message: 'Course offerings retrieved successfully',
        data: offerings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(allOfferings.length / parseInt(limit)),
          totalItems: allOfferings.length,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error in CourseOfferingController.index:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve course offerings',
        error: error.message
      });
    }
  },

  /**
   * Get a single course offering by ID with full details
   * @route GET /api/course-offerings/:id
   */
  show: async (req, res) => {
    try {
      const { id } = req.params;
      const courseOfferingModel = new CourseOffering();

      const offering = await courseOfferingModel.getFullDetails(parseInt(id));

      if (!offering) {
        return res.status(404).json({
          success: false,
          message: 'Course offering not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Course offering retrieved successfully',
        data: offering
      });
    } catch (error) {
      console.error('Error in CourseOfferingController.show:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve course offering',
        error: error.message
      });
    }
  },

  /**
   * Create a new course offering
   * @route POST /api/course-offerings
   */
  store: async (req, res) => {
    try {
      const {
        course_id,
        semester_id,
        section,
        max_students,
        status = 'active'
      } = req.body;

      // Validate required fields
      if (!course_id || !semester_id) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
          errors: {
            course_id: !course_id ? 'Course ID is required' : null,
            semester_id: !semester_id ? 'Semester ID is required' : null
          }
        });
      }

      const courseOfferingModel = new CourseOffering();

      // Check if course offering with same course, semester, and section already exists
      const existingOffering = await courseOfferingModel.findWhere({
        course_id,
        semester_id,
        section: section || null
      });

      if (existingOffering.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Course offering with this course, semester, and section already exists'
        });
      }

      // Create course offering
      const data = {
        course_id,
        semester_id,
        section: section || null,
        max_students: max_students || null,
        status
      };

      const newOffering = await courseOfferingModel.create(data);

      // Get full details of created offering
      const offering = await courseOfferingModel.getFullDetails(newOffering.id);

      return res.status(201).json({
        success: true,
        message: 'Course offering created successfully',
        data: offering
      });
    } catch (error) {
      console.error('Error in CourseOfferingController.store:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create course offering',
        error: error.message
      });
    }
  },

  /**
   * Update a course offering
   * @route PUT /api/course-offerings/:id
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        course_id,
        semester_id,
        section,
        max_students,
        status
      } = req.body;

      const courseOfferingModel = new CourseOffering();

      // Check if course offering exists
      const existingOffering = await courseOfferingModel.findById(parseInt(id));
      if (!existingOffering) {
        return res.status(404).json({
          success: false,
          message: 'Course offering not found'
        });
      }

      // Prepare update data
      const updateData = {};
      if (course_id !== undefined) updateData.course_id = course_id;
      if (semester_id !== undefined) updateData.semester_id = semester_id;
      if (section !== undefined) updateData.section = section;
      if (max_students !== undefined) updateData.max_students = max_students;
      if (status !== undefined) updateData.status = status;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
      }

      // Check for duplicate if course_id, semester_id, or section is being updated
      if (course_id !== undefined || semester_id !== undefined || section !== undefined) {
        const checkData = {
          course_id: course_id !== undefined ? course_id : existingOffering.course_id,
          semester_id: semester_id !== undefined ? semester_id : existingOffering.semester_id,
          section: section !== undefined ? section : existingOffering.section
        };

        const duplicate = await courseOfferingModel.findWhere(checkData);
        if (duplicate.length > 0 && duplicate[0].id !== parseInt(id)) {
          return res.status(409).json({
            success: false,
            message: 'Course offering with this course, semester, and section already exists'
          });
        }
      }

      // Update course offering
      const updated = await courseOfferingModel.update(parseInt(id), updateData);

      if (!updated) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update course offering'
        });
      }

      // Get updated offering with full details
      const offering = await courseOfferingModel.getFullDetails(parseInt(id));

      return res.status(200).json({
        success: true,
        message: 'Course offering updated successfully',
        data: offering
      });
    } catch (error) {
      console.error('Error in CourseOfferingController.update:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update course offering',
        error: error.message
      });
    }
  },

  /**
   * Delete a course offering
   * @route DELETE /api/course-offerings/:id
   */
  destroy: async (req, res) => {
    try {
      const { id } = req.params;
      const courseOfferingModel = new CourseOffering();

      // Check if course offering exists
      const existingOffering = await courseOfferingModel.findById(parseInt(id));
      if (!existingOffering) {
        return res.status(404).json({
          success: false,
          message: 'Course offering not found'
        });
      }

      // Delete course offering
      const deleted = await courseOfferingModel.delete(parseInt(id));

      if (!deleted) {
        return res.status(500).json({
          success: false,
          message: 'Failed to delete course offering'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Course offering deleted successfully'
      });
    } catch (error) {
      console.error('Error in CourseOfferingController.destroy:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete course offering',
        error: error.message
      });
    }
  },

  /**
   * Get all enrollments for a specific course offering
   * @route GET /api/course-offerings/:id/enrollments
   */
  getEnrollments: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        orderBy = 'enrollment_date',
        order = 'DESC',
        status
      } = req.query;

      const courseOfferingModel = new CourseOffering();

      // Check if course offering exists
      const existingOffering = await courseOfferingModel.findById(parseInt(id));
      if (!existingOffering) {
        return res.status(404).json({
          success: false,
          message: 'Course offering not found'
        });
      }

      // Get enrollments
      const enrollments = await courseOfferingModel.getEnrollments(parseInt(id), {
        orderBy,
        order: order.toUpperCase(),
        includeStudent: true,
        status
      });

      return res.status(200).json({
        success: true,
        message: 'Enrollments retrieved successfully',
        data: enrollments,
        count: enrollments.length
      });
    } catch (error) {
      console.error('Error in CourseOfferingController.getEnrollments:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve enrollments',
        error: error.message
      });
    }
  },

  /**
   * Assign a teacher to a course offering
   * @route POST /api/course-offerings/:id/assign-teacher
   */
  assignTeacher: async (req, res) => {
    try {
      const { id } = req.params;
      const { teacher_id, role = 'Instructor', lessons } = req.body;

      // Validate required fields
      if (!teacher_id) {
        return res.status(400).json({
          success: false,
          message: 'Teacher ID is required'
        });
      }

      // Validate role
      const validRoles = ['Instructor', 'Co-Instructor', 'Lab Instructor'];
      if (role && !validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Must be one of: Instructor, Co-Instructor, Lab Instructor'
        });
      }

      const courseOfferingModel = new CourseOffering();

      // Assign teacher
      const assignment = await courseOfferingModel.assignTeacher(
        parseInt(id),
        parseInt(teacher_id),
        role,
        lessons || null
      );

      // Get updated offering with full details
      const offering = await courseOfferingModel.getFullDetails(parseInt(id));

      return res.status(201).json({
        success: true,
        message: 'Teacher assigned successfully',
        data: {
          assignment,
          offering
        }
      });
    } catch (error) {
      console.error('Error in CourseOfferingController.assignTeacher:', error);
      
      // Handle specific error cases
      if (error.message === 'Course offering not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.message === 'Teacher is already assigned to this course offering') {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to assign teacher',
        error: error.message
      });
    }
  },

  /**
   * Update teacher assignment for a course offering
   * @route PUT /api/course-offerings/teacher-assignments/:assignmentId
   */
  updateTeacherAssignment: async (req, res) => {
    try {
      const { assignmentId } = req.params;
      const { role, lessons } = req.body;

      // Validate role if provided
      if (role) {
        const validRoles = ['Instructor', 'Co-Instructor', 'Lab Instructor'];
        if (!validRoles.includes(role)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid role. Must be one of: Instructor, Co-Instructor, Lab Instructor'
          });
        }
      }

      const courseOfferingModel = new CourseOffering();

      // Prepare update data
      const updateData = {};
      if (role !== undefined) updateData.role = role;
      if (lessons !== undefined) updateData.lessons = lessons;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
      }

      // Update assignment
      const updated = await courseOfferingModel.updateTeacherAssignment(
        parseInt(assignmentId),
        updateData
      );

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Teacher assignment not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Teacher assignment updated successfully'
      });
    } catch (error) {
      console.error('Error in CourseOfferingController.updateTeacherAssignment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update teacher assignment',
        error: error.message
      });
    }
  },

  /**
   * Remove teacher assignment from a course offering
   * @route DELETE /api/course-offerings/teacher-assignments/:assignmentId
   */
  removeTeacherAssignment: async (req, res) => {
    try {
      const { assignmentId } = req.params;
      const courseOfferingModel = new CourseOffering();

      // Remove assignment
      const removed = await courseOfferingModel.removeTeacherAssignment(parseInt(assignmentId));

      if (!removed) {
        return res.status(404).json({
          success: false,
          message: 'Teacher assignment not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Teacher assignment removed successfully'
      });
    } catch (error) {
      console.error('Error in CourseOfferingController.removeTeacherAssignment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to remove teacher assignment',
        error: error.message
      });
    }
  }
};

module.exports = CourseOfferingController;
