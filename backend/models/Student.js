const BaseModel = require('./BaseModel');

/**
 * Student Model for managing student records and academic information
 * Handles student CRUD operations, enrollments, results, and attainment tracking
 */
class Student extends BaseModel {
  constructor() {
    super('students');
  }

  /**
   * Create a new student
   * @param {Object} studentData - Student data object
   * @param {number} studentData.user_id - Foreign key to users table
   * @param {number} studentData.faculty_id - Foreign key to faculties table
   * @param {number} studentData.degree_id - Foreign key to degrees table
   * @param {number} studentData.department_id - Foreign key to departments table
   * @param {string} studentData.SID - Student ID (unique)
   * @param {number} studentData.batch_year - Batch year
   * @param {string} studentData.admission_date - Date of admission
   * @param {string} [studentData.level] - Current level
   * @param {string} [studentData.semester] - Current semester
   * @param {number} [studentData.session_year] - Session year
   * @param {string} [studentData.residential_status] - Residential status
   * @param {string} [studentData.academic_status='Active'] - Academic status
   * @param {string} [studentData.image] - Profile image URL
   * @returns {Promise<Object>} Created student object with id
   */
  async createStudent(studentData) {
    try {
      // Validate required fields
      const requiredFields = ['user_id', 'faculty_id', 'degree_id', 'department_id', 'SID', 'batch_year', 'admission_date'];
      for (const field of requiredFields) {
        if (!studentData[field]) {
          throw new Error(`${field} is required`);
        }
      }

      // Validate academic_status if provided
      if (studentData.academic_status) {
        const validStatuses = ['Active', 'Graduated', 'Suspended', 'Withdrawn'];
        if (!validStatuses.includes(studentData.academic_status)) {
          throw new Error('Invalid academic_status. Must be one of: Active, Graduated, Suspended, Withdrawn');
        }
      }

      // Check if SID already exists
      const existingSID = await this.findWhere({ SID: studentData.SID });
      if (existingSID.length > 0) {
        throw new Error('Student ID already exists');
      }

      // Check if user_id already exists
      const existingUser = await this.findWhere({ user_id: studentData.user_id });
      if (existingUser.length > 0) {
        throw new Error('User is already associated with a student record');
      }

      const id = await this.create(studentData);
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error creating student: ${error.message}`);
    }
  }

  /**
   * Update student information
   * @param {number} id - Student ID
   * @param {Object} studentData - Updated student data
   * @returns {Promise<Object>} Updated student object
   */
  async updateStudent(id, studentData) {
    try {
      const student = await this.findById(id);
      if (!student) {
        throw new Error('Student not found');
      }

      // Validate academic_status if provided
      if (studentData.academic_status) {
        const validStatuses = ['Active', 'Graduated', 'Suspended', 'Withdrawn'];
        if (!validStatuses.includes(studentData.academic_status)) {
          throw new Error('Invalid academic_status. Must be one of: Active, Graduated, Suspended, Withdrawn');
        }
      }

      // Check if SID is being changed and if it already exists
      if (studentData.SID && studentData.SID !== student.SID) {
        const existingSID = await this.findWhere({ SID: studentData.SID });
        if (existingSID.length > 0) {
          throw new Error('Student ID already exists');
        }
      }

      await this.update(id, studentData);
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error updating student: ${error.message}`);
    }
  }

  /**
   * Get student by user ID
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} Student object or null
   */
  async getByUserId(userId) {
    try {
      const students = await this.findWhere({ user_id: userId });
      return students.length > 0 ? students[0] : null;
    } catch (error) {
      throw new Error(`Error getting student by user ID: ${error.message}`);
    }
  }

  /**
   * Get student by SID
   * @param {string} sid - Student ID
   * @returns {Promise<Object|null>} Student object or null
   */
  async getBySID(sid) {
    try {
      const students = await this.findWhere({ SID: sid });
      return students.length > 0 ? students[0] : null;
    } catch (error) {
      throw new Error(`Error getting student by SID: ${error.message}`);
    }
  }

  /**
   * Get students by department
   * @param {number} departmentId - Department ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of students
   */
  async getByDepartment(departmentId, options = {}) {
    try {
      const {
        orderBy = 'SID',
        order = 'ASC',
        includeUser = false,
        includeDetails = false
      } = options;

      let query = `
        SELECT s.* 
        ${includeUser ? ', u.name as user_name, u.email as user_email' : ''}
        ${includeDetails ? ', d.name as department_name, deg.name as degree_name, f.name as faculty_name' : ''}
        FROM ${this.tableName} s
      `;

      if (includeUser) {
        query += ' LEFT JOIN users u ON s.user_id = u.id';
      }

      if (includeDetails) {
        query += ' LEFT JOIN departments d ON s.department_id = d.id';
        query += ' LEFT JOIN degrees deg ON s.degree_id = deg.id';
        query += ' LEFT JOIN faculties f ON s.faculty_id = f.id';
      }

      query += ` WHERE s.department_id = ? ORDER BY s.${orderBy} ${order}`;

      const [rows] = await this.db.execute(query, [departmentId]);
      return rows;
    } catch (error) {
      throw new Error(`Error getting students by department: ${error.message}`);
    }
  }

  /**
   * Get students by degree
   * @param {number} degreeId - Degree ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of students
   */
  async getByDegree(degreeId, options = {}) {
    try {
      const {
        orderBy = 'SID',
        order = 'ASC',
        includeUser = false,
        includeDetails = false
      } = options;

      let query = `
        SELECT s.* 
        ${includeUser ? ', u.name as user_name, u.email as user_email' : ''}
        ${includeDetails ? ', d.name as department_name, deg.name as degree_name, f.name as faculty_name' : ''}
        FROM ${this.tableName} s
      `;

      if (includeUser) {
        query += ' LEFT JOIN users u ON s.user_id = u.id';
      }

      if (includeDetails) {
        query += ' LEFT JOIN departments d ON s.department_id = d.id';
        query += ' LEFT JOIN degrees deg ON s.degree_id = deg.id';
        query += ' LEFT JOIN faculties f ON s.faculty_id = f.id';
      }

      query += ` WHERE s.degree_id = ? ORDER BY s.${orderBy} ${order}`;

      const [rows] = await this.db.execute(query, [degreeId]);
      return rows;
    } catch (error) {
      throw new Error(`Error getting students by degree: ${error.message}`);
    }
  }

  /**
   * Get student enrollments
   * @param {number} studentId - Student ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of enrollments with course details
   */
  async getEnrollments(studentId, options = {}) {
    try {
      const {
        status = null,
        academicSessionId = null,
        semesterId = null,
        includeDetails = true
      } = options;

      let query = `
        SELECT ce.*,
        ${includeDetails ? `
          co.course_id,
          co.teacher_id,
          co.section,
          co.academic_session_id,
          co.semester_id,
          c.courseCode,
          c.courseTitle,
          c.credits,
          c.type as course_type,
          sem.name as semester_name,
          acs.name as session_name
        ` : ''}
        FROM course_enrollments ce
      `;

      if (includeDetails) {
        query += `
          LEFT JOIN course_offerings co ON ce.course_offering_id = co.id
          LEFT JOIN courses c ON co.course_id = c.id
          LEFT JOIN semesters sem ON co.semester_id = sem.id
          LEFT JOIN academic_sessions acs ON co.academic_session_id = acs.id
        `;
      }

      query += ' WHERE ce.student_id = ?';
      const params = [studentId];

      if (status) {
        query += ' AND ce.status = ?';
        params.push(status);
      }

      if (includeDetails && academicSessionId) {
        query += ' AND co.academic_session_id = ?';
        params.push(academicSessionId);
      }

      if (includeDetails && semesterId) {
        query += ' AND co.semester_id = ?';
        params.push(semesterId);
      }

      query += ' ORDER BY ce.enrollment_date DESC';

      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error getting student enrollments: ${error.message}`);
    }
  }

  /**
   * Get student CGPA
   * @param {number} studentId - Student ID
   * @returns {Promise<Object|null>} CGPA record or null
   */
  async getCGPA(studentId) {
    try {
      const query = `
        SELECT * FROM cgpas WHERE student_id = ?
      `;
      const [rows] = await this.db.execute(query, [studentId]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error(`Error getting student CGPA: ${error.message}`);
    }
  }

  /**
   * Get student CLO (Course Learning Outcome) attainment
   * @param {number} studentId - Student ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of CLO attainment records
   */
  async getCLOAttainment(studentId, options = {}) {
    try {
      const {
        courseOfferingId = null,
        includeDetails = true
      } = options;

      let query = `
        SELECT sca.*
        ${includeDetails ? `
          ,clo.code as clo_code,
          clo.description as clo_description,
          c.courseCode,
          c.courseTitle,
          co.section
        ` : ''}
        FROM student_clo_attainment sca
      `;

      if (includeDetails) {
        query += `
          LEFT JOIN course_learning_outcomes clo ON sca.course_learning_outcome_id = clo.id
          LEFT JOIN course_offerings co ON sca.course_offering_id = co.id
          LEFT JOIN courses c ON clo.course_id = c.id
        `;
      }

      query += ' WHERE sca.student_id = ?';
      const params = [studentId];

      if (courseOfferingId) {
        query += ' AND sca.course_offering_id = ?';
        params.push(courseOfferingId);
      }

      query += ' ORDER BY sca.course_offering_id, sca.course_learning_outcome_id';

      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error getting student CLO attainment: ${error.message}`);
    }
  }

  /**
   * Get student PLO (Program Learning Outcome) attainment
   * @param {number} studentId - Student ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of PLO attainment records
   */
  async getPLOAttainment(studentId, options = {}) {
    try {
      const {
        semesterId = null,
        includeDetails = true
      } = options;

      let query = `
        SELECT spa.*
        ${includeDetails ? `
          ,plo.code as plo_code,
          plo.description as plo_description,
          sem.name as semester_name
        ` : ''}
        FROM student_plo_attainment spa
      `;

      if (includeDetails) {
        query += `
          LEFT JOIN program_learning_outcomes plo ON spa.program_learning_outcome_id = plo.id
          LEFT JOIN semesters sem ON spa.semester_id = sem.id
        `;
      }

      query += ' WHERE spa.student_id = ?';
      const params = [studentId];

      if (semesterId) {
        query += ' AND spa.semester_id = ?';
        params.push(semesterId);
      }

      query += ' ORDER BY spa.semester_id, spa.program_learning_outcome_id';

      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error getting student PLO attainment: ${error.message}`);
    }
  }

  /**
   * Get all students with pagination and filters
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated results with data and pagination info
   */
  async getAllWithPagination(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        orderBy = 'SID',
        order = 'ASC',
        search = null,
        departmentId = null,
        degreeId = null,
        academicStatus = null,
        batchYear = null
      } = options;

      let query = `
        SELECT s.*, 
          u.name as user_name, 
          u.email as user_email,
          d.name as department_name,
          deg.name as degree_name,
          f.name as faculty_name
        FROM ${this.tableName} s
        LEFT JOIN users u ON s.user_id = u.id
        LEFT JOIN departments d ON s.department_id = d.id
        LEFT JOIN degrees deg ON s.degree_id = deg.id
        LEFT JOIN faculties f ON s.faculty_id = f.id
        WHERE 1=1
      `;

      const params = [];

      // Apply filters
      if (departmentId) {
        query += ' AND s.department_id = ?';
        params.push(departmentId);
      }

      if (degreeId) {
        query += ' AND s.degree_id = ?';
        params.push(degreeId);
      }

      if (academicStatus) {
        query += ' AND s.academic_status = ?';
        params.push(academicStatus);
      }

      if (batchYear) {
        query += ' AND s.batch_year = ?';
        params.push(batchYear);
      }

      if (search) {
        query += ' AND (s.SID LIKE ? OR u.name LIKE ? OR u.email LIKE ?)';
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }

      // Get total count
      const countQuery = query.replace(/SELECT s\.\*.*FROM/, 'SELECT COUNT(*) as total FROM');
      const [countResult] = await this.db.execute(countQuery, params);
      const total = countResult[0].total;

      // Add ordering and pagination
      query += ` ORDER BY s.${orderBy} ${order}`;
      query += ' LIMIT ? OFFSET ?';
      params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

      const [rows] = await this.db.execute(query, params);

      return {
        data: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      };
    } catch (error) {
      throw new Error(`Error getting students with pagination: ${error.message}`);
    }
  }
}

module.exports = Student;
