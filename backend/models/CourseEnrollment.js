const BaseModel = require('./BaseModel');

/**
 * CourseEnrollment Model for managing student enrollments in course offerings
 * Handles enrollment CRUD operations and student-course relationships
 */
class CourseEnrollment extends BaseModel {
  constructor() {
    super('course_enrollments');
  }

  /**
   * Enroll a student in a course offering
   * @param {Object} enrollmentData - Enrollment data object
   * @param {number} enrollmentData.student_id - Foreign key to students table
   * @param {number} enrollmentData.course_offering_id - Foreign key to course_offerings table
   * @param {string} [enrollmentData.enrollment_date] - Enrollment date (defaults to current date)
   * @param {string} [enrollmentData.status='enrolled'] - Enrollment status
   * @returns {Promise<Object>} Created enrollment object with id
   */
  async enrollStudent(enrollmentData) {
    try {
      // Validate required fields
      const requiredFields = ['student_id', 'course_offering_id'];
      for (const field of requiredFields) {
        if (!enrollmentData[field]) {
          throw new Error(`${field} is required`);
        }
      }

      // Validate status if provided
      if (enrollmentData.status) {
        const validStatuses = ['enrolled', 'dropped', 'completed', 'withdrawn', 'failed'];
        if (!validStatuses.includes(enrollmentData.status)) {
          throw new Error('Invalid status. Must be one of: enrolled, dropped, completed, withdrawn, failed');
        }
      }

      // Check if student is already enrolled in this course offering
      const existingEnrollment = await this.findWhere({
        student_id: enrollmentData.student_id,
        course_offering_id: enrollmentData.course_offering_id
      });

      if (existingEnrollment.length > 0) {
        throw new Error('Student is already enrolled in this course offering');
      }

      // Set default values
      const enrollmentToCreate = {
        student_id: enrollmentData.student_id,
        course_offering_id: enrollmentData.course_offering_id,
        enrollment_date: enrollmentData.enrollment_date || new Date().toISOString().split('T')[0],
        status: enrollmentData.status || 'enrolled'
      };

      const enrollmentId = await this.create(enrollmentToCreate);
      return { id: enrollmentId, ...enrollmentToCreate };
    } catch (error) {
      console.error('Error in CourseEnrollment.enrollStudent:', error);
      throw error;
    }
  }

  /**
   * Drop a student from a course offering (update status to 'dropped')
   * @param {number} enrollmentId - Enrollment ID
   * @returns {Promise<Object>} Result object with affectedRows
   */
  async dropStudent(enrollmentId) {
    try {
      if (!enrollmentId) {
        throw new Error('Enrollment ID is required');
      }

      // Check if enrollment exists
      const enrollment = await this.findById(enrollmentId);
      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      // Check if already dropped
      if (enrollment.status === 'dropped') {
        throw new Error('Student is already dropped from this course');
      }

      // Update status to dropped
      const result = await this.update(enrollmentId, { status: 'dropped' });
      return result;
    } catch (error) {
      console.error('Error in CourseEnrollment.dropStudent:', error);
      throw error;
    }
  }

  /**
   * Get all enrollments for a specific student
   * @param {number} studentId - Student ID
   * @param {Object} options - Query options
   * @param {string} [options.status] - Filter by enrollment status
   * @param {string} [options.orderBy='enrollment_date'] - Column to order by
   * @param {string} [options.order='DESC'] - Order direction
   * @returns {Promise<Array>} Array of enrollment records with course offering details
   */
  async getByStudent(studentId, options = {}) {
    try {
      if (!studentId) {
        throw new Error('Student ID is required');
      }

      const {
        status = null,
        orderBy = 'enrollment_date',
        order = 'DESC'
      } = options;

      let query = `
        SELECT 
          ce.id,
          ce.student_id,
          ce.course_offering_id,
          ce.enrollment_date,
          ce.status,
          ce.created_at,
          ce.updated_at,
          co.course_id,
          co.academic_session_id,
          co.semester_id,
          co.teacher_id,
          c.course_code,
          c.course_name,
          c.credit_hours,
          s.semester_name,
          asy.session_name,
          CONCAT(u.first_name, ' ', u.last_name) as teacher_name
        FROM course_enrollments ce
        INNER JOIN course_offerings co ON ce.course_offering_id = co.id
        INNER JOIN courses c ON co.course_id = c.id
        LEFT JOIN semesters s ON co.semester_id = s.id
        LEFT JOIN academic_sessions asy ON co.academic_session_id = asy.id
        LEFT JOIN teachers t ON co.teacher_id = t.id
        LEFT JOIN users u ON t.user_id = u.id
        WHERE ce.student_id = ?
      `;

      const params = [studentId];

      if (status) {
        query += ` AND ce.status = ?`;
        params.push(status);
      }

      query += ` ORDER BY ce.${orderBy} ${order}`;

      const [rows] = await this.db.query(query, params);
      return rows;
    } catch (error) {
      console.error('Error in CourseEnrollment.getByStudent:', error);
      throw error;
    }
  }

  /**
   * Get all enrollments for a specific course offering
   * @param {number} courseOfferingId - Course offering ID
   * @param {Object} options - Query options
   * @param {string} [options.status] - Filter by enrollment status
   * @param {string} [options.orderBy='enrollment_date'] - Column to order by
   * @param {string} [options.order='ASC'] - Order direction
   * @returns {Promise<Array>} Array of enrollment records with student details
   */
  async getByCourseOffering(courseOfferingId, options = {}) {
    try {
      if (!courseOfferingId) {
        throw new Error('Course offering ID is required');
      }

      const {
        status = null,
        orderBy = 'enrollment_date',
        order = 'ASC'
      } = options;

      let query = `
        SELECT 
          ce.id,
          ce.student_id,
          ce.course_offering_id,
          ce.enrollment_date,
          ce.status,
          ce.created_at,
          ce.updated_at,
          s.SID,
          s.batch_year,
          s.academic_status,
          CONCAT(u.first_name, ' ', u.last_name) as student_name,
          u.email as student_email,
          d.degree_name,
          dept.department_name
        FROM course_enrollments ce
        INNER JOIN students s ON ce.student_id = s.id
        INNER JOIN users u ON s.user_id = u.id
        LEFT JOIN degrees d ON s.degree_id = d.id
        LEFT JOIN departments dept ON s.department_id = dept.id
        WHERE ce.course_offering_id = ?
      `;

      const params = [courseOfferingId];

      if (status) {
        query += ` AND ce.status = ?`;
        params.push(status);
      }

      query += ` ORDER BY ce.${orderBy} ${order}`;

      const [rows] = await this.db.query(query, params);
      return rows;
    } catch (error) {
      console.error('Error in CourseEnrollment.getByCourseOffering:', error);
      throw error;
    }
  }

  /**
   * Update enrollment status
   * @param {number} enrollmentId - Enrollment ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Result object with affectedRows
   */
  async updateStatus(enrollmentId, status) {
    try {
      if (!enrollmentId || !status) {
        throw new Error('Enrollment ID and status are required');
      }

      const validStatuses = ['enrolled', 'dropped', 'completed', 'withdrawn', 'failed'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status. Must be one of: enrolled, dropped, completed, withdrawn, failed');
      }

      const result = await this.update(enrollmentId, { status });
      return result;
    } catch (error) {
      console.error('Error in CourseEnrollment.updateStatus:', error);
      throw error;
    }
  }

  /**
   * Get enrollment by ID with full details
   * @param {number} enrollmentId - Enrollment ID
   * @returns {Promise<Object|null>} Enrollment record with student and course details
   */
  async getEnrollmentDetails(enrollmentId) {
    try {
      if (!enrollmentId) {
        throw new Error('Enrollment ID is required');
      }

      const query = `
        SELECT 
          ce.id,
          ce.student_id,
          ce.course_offering_id,
          ce.enrollment_date,
          ce.status,
          ce.created_at,
          ce.updated_at,
          s.SID,
          s.batch_year,
          CONCAT(u.first_name, ' ', u.last_name) as student_name,
          u.email as student_email,
          co.course_id,
          c.course_code,
          c.course_name,
          c.credit_hours,
          sem.semester_name,
          asy.session_name
        FROM course_enrollments ce
        INNER JOIN students s ON ce.student_id = s.id
        INNER JOIN users u ON s.user_id = u.id
        INNER JOIN course_offerings co ON ce.course_offering_id = co.id
        INNER JOIN courses c ON co.course_id = c.id
        LEFT JOIN semesters sem ON co.semester_id = sem.id
        LEFT JOIN academic_sessions asy ON co.academic_session_id = asy.id
        WHERE ce.id = ?
      `;

      const [rows] = await this.db.query(query, [enrollmentId]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error in CourseEnrollment.getEnrollmentDetails:', error);
      throw error;
    }
  }

  /**
   * Get enrollment statistics for a course offering
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise<Object>} Statistics object with enrollment counts by status
   */
  async getEnrollmentStats(courseOfferingId) {
    try {
      if (!courseOfferingId) {
        throw new Error('Course offering ID is required');
      }

      const query = `
        SELECT 
          COUNT(*) as total_enrollments,
          SUM(CASE WHEN status = 'enrolled' THEN 1 ELSE 0 END) as enrolled_count,
          SUM(CASE WHEN status = 'dropped' THEN 1 ELSE 0 END) as dropped_count,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
          SUM(CASE WHEN status = 'withdrawn' THEN 1 ELSE 0 END) as withdrawn_count,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_count
        FROM course_enrollments
        WHERE course_offering_id = ?
      `;

      const [rows] = await this.db.query(query, [courseOfferingId]);
      return rows[0];
    } catch (error) {
      console.error('Error in CourseEnrollment.getEnrollmentStats:', error);
      throw error;
    }
  }

  /**
   * Check if a student is enrolled in a course offering
   * @param {number} studentId - Student ID
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise<Object|null>} Enrollment record or null if not enrolled
   */
  async checkEnrollment(studentId, courseOfferingId) {
    try {
      if (!studentId || !courseOfferingId) {
        throw new Error('Student ID and course offering ID are required');
      }

      const enrollment = await this.findWhere({
        student_id: studentId,
        course_offering_id: courseOfferingId
      });

      return enrollment.length > 0 ? enrollment[0] : null;
    } catch (error) {
      console.error('Error in CourseEnrollment.checkEnrollment:', error);
      throw error;
    }
  }
}

module.exports = CourseEnrollment;
