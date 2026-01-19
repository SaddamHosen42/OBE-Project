const AcademicSession = require('../models/AcademicSession');

/**
 * Academic Session Controller
 * Handles academic session/year management operations
 */
const AcademicSessionController = {
  /**
   * List all academic sessions
   * @route GET /api/academic-sessions
   */
  index: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        orderBy = 'created_at', 
        order = 'DESC',
        withSemesters = 'false'
      } = req.query;

      const academicSessionModel = new AcademicSession();
      
      // If withSemesters is true, get sessions with their semesters
      if (withSemesters === 'true') {
        const sessions = await academicSessionModel.getWithSemesters();
        
        // Apply search filter if provided
        let filteredSessions = sessions;
        if (search) {
          const searchLower = search.toLowerCase();
          filteredSessions = sessions.filter(session => 
            session.session_name.toLowerCase().includes(searchLower)
          );
        }

        // Apply pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedSessions = filteredSessions.slice(startIndex, endIndex);

        return res.status(200).json({
          success: true,
          message: 'Academic sessions retrieved successfully',
          data: paginatedSessions,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(filteredSessions.length / parseInt(limit)),
            totalItems: filteredSessions.length,
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
          fields: ['session_name'],
          value: search
        } : null
      };

      const result = await academicSessionModel.getAllWithPagination(options);

      res.status(200).json({
        success: true,
        message: 'Academic sessions retrieved successfully',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error in AcademicSessionController.index:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve academic sessions',
        error: error.message
      });
    }
  },

  /**
   * Get a single academic session by ID
   * @route GET /api/academic-sessions/:id
   */
  show: async (req, res) => {
    try {
      const { id } = req.params;
      const { withSemesters = 'false', withCourses = 'false' } = req.query;

      const academicSessionModel = new AcademicSession();

      // Get with semesters if requested
      if (withSemesters === 'true') {
        const sessions = await academicSessionModel.getWithSemesters();
        const session = sessions.find(s => s.id === parseInt(id));
        
        if (!session) {
          return res.status(404).json({
            success: false,
            message: 'Academic session not found'
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Academic session retrieved successfully',
          data: session
        });
      }

      // Get with courses if requested
      if (withCourses === 'true') {
        const session = await academicSessionModel.getWithCourses(id);
        
        if (!session) {
          return res.status(404).json({
            success: false,
            message: 'Academic session not found'
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Academic session retrieved successfully',
          data: session
        });
      }

      // Standard getById query
      const session = await academicSessionModel.getById(id);

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Academic session not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Academic session retrieved successfully',
        data: session
      });
    } catch (error) {
      console.error('Error in AcademicSessionController.show:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve academic session',
        error: error.message
      });
    }
  },

  /**
   * Get the active academic session
   * @route GET /api/academic-sessions/active/current
   */
  getActive: async (req, res) => {
    try {
      const academicSessionModel = new AcademicSession();
      const activeSession = await academicSessionModel.getActive();

      if (!activeSession) {
        return res.status(404).json({
          success: false,
          message: 'No active academic session found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Active academic session retrieved successfully',
        data: activeSession
      });
    } catch (error) {
      console.error('Error in AcademicSessionController.getActive:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve active academic session',
        error: error.message
      });
    }
  },

  /**
   * Create a new academic session
   * @route POST /api/academic-sessions
   */
  store: async (req, res) => {
    try {
      const { session_name, start_date, end_date, is_active } = req.body;

      // Validation
      if (!session_name || !start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'Session name, start date, and end date are required'
        });
      }

      // Validate date format and logic
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format'
        });
      }

      if (startDate >= endDate) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }

      const academicSessionModel = new AcademicSession();

      // If this session is being set as active, deactivate others first
      if (is_active === true || is_active === 'true' || is_active === 1) {
        await academicSessionModel.deactivateAll();
      }

      const sessionData = {
        session_name,
        start_date,
        end_date,
        is_active: is_active || false
      };

      const sessionId = await academicSessionModel.create(sessionData);

      const newSession = await academicSessionModel.getById(sessionId);

      res.status(201).json({
        success: true,
        message: 'Academic session created successfully',
        data: newSession
      });
    } catch (error) {
      console.error('Error in AcademicSessionController.store:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create academic session',
        error: error.message
      });
    }
  },

  /**
   * Update an academic session
   * @route PUT /api/academic-sessions/:id
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { session_name, start_date, end_date, is_active } = req.body;

      const academicSessionModel = new AcademicSession();

      // Check if session exists
      const existingSession = await academicSessionModel.getById(id);
      if (!existingSession) {
        return res.status(404).json({
          success: false,
          message: 'Academic session not found'
        });
      }

      // Validate dates if provided
      if (start_date && end_date) {
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid date format'
          });
        }

        if (startDate >= endDate) {
          return res.status(400).json({
            success: false,
            message: 'End date must be after start date'
          });
        }
      }

      // If this session is being set as active, deactivate others first
      if (is_active === true || is_active === 'true' || is_active === 1) {
        await academicSessionModel.deactivateAll();
      }

      const updateData = {};
      if (session_name !== undefined) updateData.session_name = session_name;
      if (start_date !== undefined) updateData.start_date = start_date;
      if (end_date !== undefined) updateData.end_date = end_date;
      if (is_active !== undefined) updateData.is_active = is_active;

      const updated = await academicSessionModel.update(id, updateData);

      if (!updated) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update academic session'
        });
      }

      const updatedSession = await academicSessionModel.getById(id);

      res.status(200).json({
        success: true,
        message: 'Academic session updated successfully',
        data: updatedSession
      });
    } catch (error) {
      console.error('Error in AcademicSessionController.update:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update academic session',
        error: error.message
      });
    }
  },

  /**
   * Set an academic session as active (deactivates all others)
   * @route PUT /api/academic-sessions/:id/set-active
   */
  setActive: async (req, res) => {
    try {
      const { id } = req.params;

      const academicSessionModel = new AcademicSession();

      // Check if session exists
      const existingSession = await academicSessionModel.getById(id);
      if (!existingSession) {
        return res.status(404).json({
          success: false,
          message: 'Academic session not found'
        });
      }

      // Use the model's setActive method which handles deactivation
      const updated = await academicSessionModel.setActive(id);

      if (!updated) {
        return res.status(500).json({
          success: false,
          message: 'Failed to set academic session as active'
        });
      }

      const activeSession = await academicSessionModel.getById(id);

      res.status(200).json({
        success: true,
        message: 'Academic session set as active successfully',
        data: activeSession
      });
    } catch (error) {
      console.error('Error in AcademicSessionController.setActive:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to set academic session as active',
        error: error.message
      });
    }
  },

  /**
   * Delete an academic session
   * @route DELETE /api/academic-sessions/:id
   */
  destroy: async (req, res) => {
    try {
      const { id } = req.params;

      const academicSessionModel = new AcademicSession();

      // Check if session exists
      const existingSession = await academicSessionModel.getById(id);
      if (!existingSession) {
        return res.status(404).json({
          success: false,
          message: 'Academic session not found'
        });
      }

      // Check if session is active
      if (existingSession.is_active) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete an active academic session. Please deactivate it first.'
        });
      }

      const deleted = await academicSessionModel.delete(id);

      if (!deleted) {
        return res.status(500).json({
          success: false,
          message: 'Failed to delete academic session'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Academic session deleted successfully'
      });
    } catch (error) {
      console.error('Error in AcademicSessionController.destroy:', error);
      
      // Handle foreign key constraint errors
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({
          success: false,
          message: 'Cannot delete academic session as it has associated semesters or courses'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to delete academic session',
        error: error.message
      });
    }
  },

  /**
   * Get count of semesters in an academic session
   * @route GET /api/academic-sessions/:id/semesters/count
   */
  countSemesters: async (req, res) => {
    try {
      const { id } = req.params;

      const academicSessionModel = new AcademicSession();
      
      // Check if session exists
      const session = await academicSessionModel.getById(id);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Academic session not found'
        });
      }

      const count = await academicSessionModel.countSemesters(id);

      res.status(200).json({
        success: true,
        message: 'Semester count retrieved successfully',
        data: {
          academic_session_id: parseInt(id),
          count
        }
      });
    } catch (error) {
      console.error('Error in AcademicSessionController.countSemesters:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to count semesters',
        error: error.message
      });
    }
  }
};

module.exports = AcademicSessionController;
