const Student = require('../models/Student');

/**
 * Student Controller
 * Handles student management operations including CRUD, enrollments, results, and attainment reports
 */
const StudentController = {
  /**
   * List all students with pagination, filtering, and search
   * @route GET /api/students
   */
  index: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        orderBy = 'SID',
        order = 'ASC',
        departmentId,
        degreeId,
        academicStatus,
        batchYear
      } = req.query;

      const studentModel = new Student();

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        orderBy,
        order: order.toUpperCase(),
        search,
        departmentId: departmentId ? parseInt(departmentId) : null,
        degreeId: degreeId ? parseInt(degreeId) : null,
        academicStatus,
        batchYear: batchYear ? parseInt(batchYear) : null
      };

      const result = await studentModel.getAllWithPagination(options);

      res.status(200).json({
        success: true,
        message: 'Students retrieved successfully',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error in StudentController.index:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve students',
        error: error.message
      });
    }
  },

  /**
   * Get a specific student by ID
   * @route GET /api/students/:id
   */
  show: async (req, res) => {
    try {
      const { id } = req.params;
      const studentModel = new Student();

      const student = await studentModel.findById(parseInt(id));

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Get additional details using JOIN query
      const query = `
        SELECT s.*, 
          u.name as user_name, 
          u.email as user_email,
          u.phone as user_phone,
          u.dob as user_dob,
          u.nationality as user_nationality,
          u.blood_group as user_blood_group,
          d.name as department_name,
          deg.name as degree_name,
          f.name as faculty_name
        FROM students s
        LEFT JOIN users u ON s.user_id = u.id
        LEFT JOIN departments d ON s.department_id = d.id
        LEFT JOIN degrees deg ON s.degree_id = deg.id
        LEFT JOIN faculties f ON s.faculty_id = f.id
        WHERE s.id = ?
      `;

      const [rows] = await studentModel.db.execute(query, [parseInt(id)]);
      const detailedStudent = rows.length > 0 ? rows[0] : student;

      res.status(200).json({
        success: true,
        message: 'Student retrieved successfully',
        data: detailedStudent
      });
    } catch (error) {
      console.error('Error in StudentController.show:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve student',
        error: error.message
      });
    }
  },

  /**
   * Create a new student
   * @route POST /api/students
   */
  store: async (req, res) => {
    try {
      const studentData = req.body;
      const studentModel = new Student();

      const newStudent = await studentModel.createStudent(studentData);

      res.status(201).json({
        success: true,
        message: 'Student created successfully',
        data: newStudent
      });
    } catch (error) {
      console.error('Error in StudentController.store:', error);
      
      // Handle specific error cases
      if (error.message.includes('required') || 
          error.message.includes('already exists') ||
          error.message.includes('Invalid')) {
        return res.status(400).json({
          success: false,
          message: error.message,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create student',
        error: error.message
      });
    }
  },

  /**
   * Update an existing student
   * @route PUT /api/students/:id
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const studentData = req.body;
      const studentModel = new Student();

      const updatedStudent = await studentModel.updateStudent(parseInt(id), studentData);

      res.status(200).json({
        success: true,
        message: 'Student updated successfully',
        data: updatedStudent
      });
    } catch (error) {
      console.error('Error in StudentController.update:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message,
          error: error.message
        });
      }

      if (error.message.includes('already exists') || error.message.includes('Invalid')) {
        return res.status(400).json({
          success: false,
          message: error.message,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update student',
        error: error.message
      });
    }
  },

  /**
   * Delete a student
   * @route DELETE /api/students/:id
   */
  destroy: async (req, res) => {
    try {
      const { id } = req.params;
      const studentModel = new Student();

      const student = await studentModel.findById(parseInt(id));
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      await studentModel.delete(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Student deleted successfully'
      });
    } catch (error) {
      console.error('Error in StudentController.destroy:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete student',
        error: error.message
      });
    }
  },

  /**
   * Get student by SID
   * @route GET /api/students/sid/:sid
   */
  getBySID: async (req, res) => {
    try {
      const { sid } = req.params;
      const studentModel = new Student();

      const student = await studentModel.getBySID(sid);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Student retrieved successfully',
        data: student
      });
    } catch (error) {
      console.error('Error in StudentController.getBySID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve student',
        error: error.message
      });
    }
  },

  /**
   * Get students by department
   * @route GET /api/students/department/:departmentId
   */
  getByDepartment: async (req, res) => {
    try {
      const { departmentId } = req.params;
      const { orderBy = 'SID', order = 'ASC' } = req.query;
      const studentModel = new Student();

      const students = await studentModel.getByDepartment(parseInt(departmentId), {
        orderBy,
        order: order.toUpperCase(),
        includeUser: true,
        includeDetails: true
      });

      res.status(200).json({
        success: true,
        message: 'Students retrieved successfully',
        data: students
      });
    } catch (error) {
      console.error('Error in StudentController.getByDepartment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve students',
        error: error.message
      });
    }
  },

  /**
   * Get students by degree
   * @route GET /api/students/degree/:degreeId
   */
  getByDegree: async (req, res) => {
    try {
      const { degreeId } = req.params;
      const { orderBy = 'SID', order = 'ASC' } = req.query;
      const studentModel = new Student();

      const students = await studentModel.getByDegree(parseInt(degreeId), {
        orderBy,
        order: order.toUpperCase(),
        includeUser: true,
        includeDetails: true
      });

      res.status(200).json({
        success: true,
        message: 'Students retrieved successfully',
        data: students
      });
    } catch (error) {
      console.error('Error in StudentController.getByDegree:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve students',
        error: error.message
      });
    }
  },

  /**
   * Get student enrollments
   * @route GET /api/students/:id/enrollments
   */
  getEnrollments: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, academicSessionId, semesterId } = req.query;
      const studentModel = new Student();

      // Verify student exists
      const student = await studentModel.findById(parseInt(id));
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      const enrollments = await studentModel.getEnrollments(parseInt(id), {
        status,
        academicSessionId: academicSessionId ? parseInt(academicSessionId) : null,
        semesterId: semesterId ? parseInt(semesterId) : null,
        includeDetails: true
      });

      res.status(200).json({
        success: true,
        message: 'Student enrollments retrieved successfully',
        data: enrollments
      });
    } catch (error) {
      console.error('Error in StudentController.getEnrollments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve student enrollments',
        error: error.message
      });
    }
  },

  /**
   * Get student results (CGPA)
   * @route GET /api/students/:id/results
   */
  getResults: async (req, res) => {
    try {
      const { id } = req.params;
      const studentModel = new Student();

      // Verify student exists
      const student = await studentModel.findById(parseInt(id));
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Get CGPA
      const cgpa = await studentModel.getCGPA(parseInt(id));

      // Get enrollments with completed status
      const enrollments = await studentModel.getEnrollments(parseInt(id), {
        status: 'completed',
        includeDetails: true
      });

      // Get course results from course_results table if available
      let courseResults = [];
      try {
        const courseResultsQuery = `
          SELECT cr.*,
            c.courseCode,
            c.courseTitle,
            c.credits,
            co.section,
            sem.name as semester_name,
            acs.name as session_name
          FROM course_results cr
          LEFT JOIN course_offerings co ON cr.course_offering_id = co.id
          LEFT JOIN courses c ON co.course_id = c.id
          LEFT JOIN semesters sem ON co.semester_id = sem.id
          LEFT JOIN academic_sessions acs ON co.academic_session_id = acs.id
          WHERE cr.student_id = ?
          ORDER BY acs.start_date DESC, sem.id
        `;
        const [rows] = await studentModel.db.execute(courseResultsQuery, [parseInt(id)]);
        courseResults = rows;
      } catch (err) {
        console.warn('Could not fetch course results:', err.message);
      }

      res.status(200).json({
        success: true,
        message: 'Student results retrieved successfully',
        data: {
          student_id: parseInt(id),
          cgpa: cgpa,
          enrollments: enrollments,
          course_results: courseResults
        }
      });
    } catch (error) {
      console.error('Error in StudentController.getResults:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve student results',
        error: error.message
      });
    }
  },

  /**
   * Get student attainment report (CLO and PLO)
   * @route GET /api/students/:id/attainment
   */
  getAttainmentReport: async (req, res) => {
    try {
      const { id } = req.params;
      const { courseOfferingId, semesterId } = req.query;
      const studentModel = new Student();

      // Verify student exists
      const student = await studentModel.findById(parseInt(id));
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Get CLO attainment
      const cloAttainment = await studentModel.getCLOAttainment(parseInt(id), {
        courseOfferingId: courseOfferingId ? parseInt(courseOfferingId) : null,
        includeDetails: true
      });

      // Get PLO attainment
      const ploAttainment = await studentModel.getPLOAttainment(parseInt(id), {
        semesterId: semesterId ? parseInt(semesterId) : null,
        includeDetails: true
      });

      // Calculate summary statistics
      const cloSummary = {
        total_clos: cloAttainment.length,
        attained_clos: cloAttainment.filter(clo => clo.is_attained).length,
        average_attainment: cloAttainment.length > 0
          ? (cloAttainment.reduce((sum, clo) => sum + clo.attainment_percentage, 0) / cloAttainment.length).toFixed(2)
          : 0
      };

      const ploSummary = {
        total_plos: ploAttainment.length,
        attained_plos: ploAttainment.filter(plo => plo.is_attained).length,
        average_attainment: ploAttainment.length > 0
          ? (ploAttainment.reduce((sum, plo) => sum + plo.cumulative_attainment_percentage, 0) / ploAttainment.length).toFixed(2)
          : 0
      };

      res.status(200).json({
        success: true,
        message: 'Student attainment report retrieved successfully',
        data: {
          student_id: parseInt(id),
          student_info: student,
          clo_attainment: {
            summary: cloSummary,
            details: cloAttainment
          },
          plo_attainment: {
            summary: ploSummary,
            details: ploAttainment
          }
        }
      });
    } catch (error) {
      console.error('Error in StudentController.getAttainmentReport:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve student attainment report',
        error: error.message
      });
    }
  }
};

module.exports = StudentController;
