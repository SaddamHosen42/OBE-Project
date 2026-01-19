const Semester = require('../models/Semester');

/**
 * Semester Controller
 * Handles semester management operations within academic sessions
 */
const SemesterController = {
  /**
   * List all semesters with pagination, filtering, and search
   * @route GET /api/semesters
   */
  index: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        orderBy = 'created_at',
        order = 'DESC',
        sessionId,
        includeSession = 'false'
      } = req.query;

      const semesterModel = new Semester();

      // If sessionId is provided, get semesters for that session
      if (sessionId) {
        const semesters = await semesterModel.getBySession(parseInt(sessionId), {
          orderBy: orderBy === 'created_at' ? 'semester_number' : orderBy,
          order: order.toUpperCase(),
          includeSession: includeSession === 'true'
        });

        // Apply search filter if provided
        let filteredSemesters = semesters;
        if (search) {
          const searchLower = search.toLowerCase();
          filteredSemesters = semesters.filter(semester =>
            semester.name.toLowerCase().includes(searchLower)
          );
        }

        // Apply pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedSemesters = filteredSemesters.slice(startIndex, endIndex);

        return res.status(200).json({
          success: true,
          message: 'Semesters retrieved successfully',
          data: paginatedSemesters,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(filteredSemesters.length / parseInt(limit)),
            totalItems: filteredSemesters.length,
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
          fields: ['name'],
          value: search
        } : null
      };

      const result = await semesterModel.getAllWithPagination(options);

      res.status(200).json({
        success: true,
        message: 'Semesters retrieved successfully',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error in SemesterController.index:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve semesters',
        error: error.message
      });
    }
  },

  /**
   * Get the currently active semester
   * @route GET /api/semesters/active/current
   */
  getActive: async (req, res) => {
    try {
      const { includeSession = 'false' } = req.query;
      const semesterModel = new Semester();

      const semester = await semesterModel.getActive({
        includeSession: includeSession === 'true'
      });

      if (!semester) {
        return res.status(404).json({
          success: false,
          message: 'No active semester found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Active semester retrieved successfully',
        data: semester
      });
    } catch (error) {
      console.error('Error in SemesterController.getActive:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve active semester',
        error: error.message
      });
    }
  },

  /**
   * Get a single semester by ID
   * @route GET /api/semesters/:id
   */
  show: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        includeSession = 'false',
        includeCourseOfferings = 'false'
      } = req.query;

      const semesterModel = new Semester();

      const semester = await semesterModel.findByIdWithRelations(parseInt(id), {
        includeSession: includeSession === 'true',
        includeCourseOfferings: includeCourseOfferings === 'true'
      });

      if (!semester) {
        return res.status(404).json({
          success: false,
          message: 'Semester not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Semester retrieved successfully',
        data: semester
      });
    } catch (error) {
      console.error('Error in SemesterController.show:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve semester',
        error: error.message
      });
    }
  },

  /**
   * Create a new semester
   * @route POST /api/semesters
   */
  store: async (req, res) => {
    try {
      const {
        academic_session_id,
        name,
        semester_number,
        start_date,
        end_date,
        is_active = false
      } = req.body;

      // Validate required fields
      if (!academic_session_id || !name || !semester_number || !start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
          required: ['academic_session_id', 'name', 'semester_number', 'start_date', 'end_date']
        });
      }

      // Validate semester number
      if (semester_number < 1 || semester_number > 4) {
        return res.status(400).json({
          success: false,
          message: 'Semester number must be between 1 and 4'
        });
      }

      // Validate dates
      const startDateObj = new Date(start_date);
      const endDateObj = new Date(end_date);

      if (endDateObj <= startDateObj) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }

      const semesterModel = new Semester();

      // Validate semester data
      const validation = await semesterModel.validateSemester({
        academic_session_id,
        name,
        semester_number,
        start_date,
        end_date
      });

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      const semesterData = {
        academic_session_id,
        name,
        semester_number,
        start_date,
        end_date,
        is_active: is_active === true || is_active === 'true'
      };

      const result = await semesterModel.create(semesterData);

      // If this semester is set as active, make sure to deactivate others
      if (semesterData.is_active) {
        await semesterModel.setActive(result.insertId);
      }

      // Fetch the created semester with relations
      const semester = await semesterModel.findByIdWithRelations(result.insertId, {
        includeSession: true
      });

      res.status(201).json({
        success: true,
        message: 'Semester created successfully',
        data: semester
      });
    } catch (error) {
      console.error('Error in SemesterController.store:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create semester',
        error: error.message
      });
    }
  },

  /**
   * Update an existing semester
   * @route PUT /api/semesters/:id
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        academic_session_id,
        name,
        semester_number,
        start_date,
        end_date,
        is_active
      } = req.body;

      const semesterModel = new Semester();

      // Check if semester exists
      const existingSemester = await semesterModel.findById(parseInt(id));
      if (!existingSemester) {
        return res.status(404).json({
          success: false,
          message: 'Semester not found'
        });
      }

      // Build update data
      const updateData = {};

      if (academic_session_id !== undefined) updateData.academic_session_id = academic_session_id;
      if (name !== undefined) updateData.name = name;
      if (semester_number !== undefined) {
        if (semester_number < 1 || semester_number > 4) {
          return res.status(400).json({
            success: false,
            message: 'Semester number must be between 1 and 4'
          });
        }
        updateData.semester_number = semester_number;
      }
      if (start_date !== undefined) updateData.start_date = start_date;
      if (end_date !== undefined) updateData.end_date = end_date;
      if (is_active !== undefined) updateData.is_active = is_active === true || is_active === 'true';

      // Validate dates if both are provided or being updated
      const finalStartDate = updateData.start_date || existingSemester.start_date;
      const finalEndDate = updateData.end_date || existingSemester.end_date;

      const startDateObj = new Date(finalStartDate);
      const endDateObj = new Date(finalEndDate);

      if (endDateObj <= startDateObj) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }

      // Validate semester data if critical fields are being updated
      if (academic_session_id || semester_number || start_date || end_date) {
        const validation = await semesterModel.validateSemester({
          academic_session_id: updateData.academic_session_id || existingSemester.academic_session_id,
          name: updateData.name || existingSemester.name,
          semester_number: updateData.semester_number || existingSemester.semester_number,
          start_date: finalStartDate,
          end_date: finalEndDate
        }, parseInt(id));

        if (!validation.isValid) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: validation.errors
          });
        }
      }

      await semesterModel.update(parseInt(id), updateData);

      // If is_active is being set to true, use setActive to handle deactivation of others
      if (updateData.is_active === true) {
        await semesterModel.setActive(parseInt(id));
      }

      // Fetch updated semester with relations
      const semester = await semesterModel.findByIdWithRelations(parseInt(id), {
        includeSession: true
      });

      res.status(200).json({
        success: true,
        message: 'Semester updated successfully',
        data: semester
      });
    } catch (error) {
      console.error('Error in SemesterController.update:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update semester',
        error: error.message
      });
    }
  },

  /**
   * Delete a semester
   * @route DELETE /api/semesters/:id
   */
  destroy: async (req, res) => {
    try {
      const { id } = req.params;
      const semesterModel = new Semester();

      // Check if semester exists
      const semester = await semesterModel.findById(parseInt(id));
      if (!semester) {
        return res.status(404).json({
          success: false,
          message: 'Semester not found'
        });
      }

      // Check if semester has course offerings
      const courseCount = await semesterModel.countCourseOfferings(parseInt(id));
      if (courseCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete semester with ${courseCount} course offering(s). Please delete course offerings first.`
        });
      }

      await semesterModel.delete(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Semester deleted successfully'
      });
    } catch (error) {
      console.error('Error in SemesterController.destroy:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete semester',
        error: error.message
      });
    }
  },

  /**
   * Set a semester as active (and deactivate all others)
   * @route PATCH /api/semesters/:id/activate
   */
  activate: async (req, res) => {
    try {
      const { id } = req.params;
      const semesterModel = new Semester();

      // Check if semester exists
      const semester = await semesterModel.findById(parseInt(id));
      if (!semester) {
        return res.status(404).json({
          success: false,
          message: 'Semester not found'
        });
      }

      await semesterModel.setActive(parseInt(id));

      // Fetch updated semester
      const updatedSemester = await semesterModel.findByIdWithRelations(parseInt(id), {
        includeSession: true
      });

      res.status(200).json({
        success: true,
        message: 'Semester activated successfully',
        data: updatedSemester
      });
    } catch (error) {
      console.error('Error in SemesterController.activate:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to activate semester',
        error: error.message
      });
    }
  },

  /**
   * Get count of course offerings in a semester
   * @route GET /api/semesters/:id/course-offerings/count
   */
  countCourseOfferings: async (req, res) => {
    try {
      const { id } = req.params;
      const semesterModel = new Semester();

      // Check if semester exists
      const semester = await semesterModel.findById(parseInt(id));
      if (!semester) {
        return res.status(404).json({
          success: false,
          message: 'Semester not found'
        });
      }

      const count = await semesterModel.countCourseOfferings(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Course offerings count retrieved successfully',
        data: {
          semester_id: parseInt(id),
          count
        }
      });
    } catch (error) {
      console.error('Error in SemesterController.countCourseOfferings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to count course offerings',
        error: error.message
      });
    }
  }
};

module.exports = SemesterController;
