const BaseModel = require('./BaseModel');

/**
 * CourseOffering Model for managing course offerings/sections
 * Handles course offering CRUD operations and relationships with courses, semesters, teachers, and enrollments
 */
class CourseOffering extends BaseModel {
  constructor() {
    super('course_offerings');
  }

  /**
   * Get all course offerings for a specific semester
   * @param {number} semesterId - The semester ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of course offerings in the semester
   */
  async getBySemester(semesterId, options = {}) {
    try {
      const {
        orderBy = 'section',
        order = 'ASC',
        includeCourse = true,
        includeSemester = false,
        status = null
      } = options;

      let query = `
        SELECT 
          co.id,
          co.course_id,
          co.semester_id,
          co.section,
          co.max_students,
          co.status,
          co.created_at,
          co.updated_at
      `;

      if (includeCourse) {
        query += `,
          c.courseCode,
          c.courseTitle,
          c.credit,
          c.contactHourPerWeek,
          c.level,
          c.type,
          c.department_id,
          c.degree_id
        `;
      }

      if (includeSemester) {
        query += `,
          s.name as semester_name,
          s.year as semester_year,
          s.type as semester_type,
          s.start_date,
          s.end_date
        `;
      }

      query += `
        FROM ${this.tableName} co
      `;

      if (includeCourse) {
        query += `
          LEFT JOIN courses c ON co.course_id = c.id
        `;
      }

      if (includeSemester) {
        query += `
          LEFT JOIN semesters s ON co.semester_id = s.id
        `;
      }

      query += `
        WHERE co.semester_id = ?
      `;

      const params = [semesterId];

      if (status) {
        query += ` AND co.status = ?`;
        params.push(status);
      }

      query += ` ORDER BY `;
      
      // Handle ordering by course fields if includeCourse is true
      if (includeCourse && (orderBy === 'courseCode' || orderBy === 'courseTitle')) {
        query += `c.${orderBy} ${order}`;
      } else {
        query += `co.${orderBy} ${order}`;
      }

      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error in getBySemester:', error);
      throw error;
    }
  }

  /**
   * Get all course offerings assigned to a specific teacher
   * @param {number} teacherId - The teacher ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of course offerings taught by the teacher
   */
  async getByTeacher(teacherId, options = {}) {
    try {
      const {
        orderBy = 'section',
        order = 'ASC',
        includeCourse = true,
        includeSemester = false,
        semesterId = null,
        status = null
      } = options;

      let query = `
        SELECT 
          co.id,
          co.course_id,
          co.semester_id,
          co.section,
          co.max_students,
          co.status,
          co.created_at,
          co.updated_at,
          tc.role as teacher_role,
          tc.lessons
      `;

      if (includeCourse) {
        query += `,
          c.courseCode,
          c.courseTitle,
          c.credit,
          c.contactHourPerWeek,
          c.level,
          c.type,
          c.department_id,
          c.degree_id
        `;
      }

      if (includeSemester) {
        query += `,
          s.name as semester_name,
          s.year as semester_year,
          s.type as semester_type,
          s.start_date,
          s.end_date
        `;
      }

      query += `
        FROM ${this.tableName} co
        INNER JOIN teacher_course tc ON co.id = tc.course_offering_id
      `;

      if (includeCourse) {
        query += `
          LEFT JOIN courses c ON co.course_id = c.id
        `;
      }

      if (includeSemester) {
        query += `
          LEFT JOIN semesters s ON co.semester_id = s.id
        `;
      }

      query += `
        WHERE tc.teacher_id = ?
      `;

      const params = [teacherId];

      if (semesterId) {
        query += ` AND co.semester_id = ?`;
        params.push(semesterId);
      }

      if (status) {
        query += ` AND co.status = ?`;
        params.push(status);
      }

      query += ` ORDER BY `;
      
      // Handle ordering by course fields if includeCourse is true
      if (includeCourse && (orderBy === 'courseCode' || orderBy === 'courseTitle')) {
        query += `c.${orderBy} ${order}`;
      } else if (includeSemester && (orderBy === 'semester_name' || orderBy === 'semester_year')) {
        query += `s.${orderBy === 'semester_name' ? 'name' : 'year'} ${order}`;
      } else {
        query += `co.${orderBy} ${order}`;
      }

      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error in getByTeacher:', error);
      throw error;
    }
  }

  /**
   * Get all enrollments for a specific course offering
   * @param {number} courseOfferingId - The course offering ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of student enrollments in the course offering
   */
  async getEnrollments(courseOfferingId, options = {}) {
    try {
      const {
        orderBy = 'enrollment_date',
        order = 'DESC',
        includeStudent = true,
        status = null
      } = options;

      let query = `
        SELECT 
          ce.id,
          ce.student_id,
          ce.course_offering_id,
          ce.enrollment_date,
          ce.status as enrollment_status,
          ce.grade,
          ce.grade_point,
          ce.attendance_percentage,
          ce.marks_obtained,
          ce.created_at,
          ce.updated_at
      `;

      if (includeStudent) {
        query += `,
          u.name as student_name,
          u.email as student_email,
          s.registration_number,
          s.roll_number,
          s.batch,
          s.section as student_section
        `;
      }

      query += `
        FROM course_enrollments ce
      `;

      if (includeStudent) {
        query += `
          LEFT JOIN students s ON ce.student_id = s.id
          LEFT JOIN users u ON s.user_id = u.id
        `;
      }

      query += `
        WHERE ce.course_offering_id = ?
      `;

      const params = [courseOfferingId];

      if (status) {
        query += ` AND ce.status = ?`;
        params.push(status);
      }

      query += ` ORDER BY `;
      
      // Handle ordering by student fields if includeStudent is true
      if (includeStudent && (orderBy === 'student_name' || orderBy === 'registration_number')) {
        if (orderBy === 'student_name') {
          query += `u.name ${order}`;
        } else {
          query += `s.registration_number ${order}`;
        }
      } else {
        query += `ce.${orderBy} ${order}`;
      }

      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error in getEnrollments:', error);
      throw error;
    }
  }

  /**
   * Get course offering with full details including course, semester, and teachers
   * @param {number} courseOfferingId - The course offering ID
   * @returns {Promise<Object|null>} Course offering with full details or null
   */
  async getFullDetails(courseOfferingId) {
    try {
      // Get basic course offering with course and semester info
      const query = `
        SELECT 
          co.id,
          co.course_id,
          co.semester_id,
          co.section,
          co.max_students,
          co.status,
          co.created_at,
          co.updated_at,
          c.courseCode,
          c.courseTitle,
          c.credit,
          c.contactHourPerWeek,
          c.level,
          c.type,
          c.type_T_S,
          c.totalMarks,
          c.department_id,
          c.degree_id,
          s.name as semester_name,
          s.year as semester_year,
          s.type as semester_type,
          s.start_date,
          s.end_date
        FROM ${this.tableName} co
        LEFT JOIN courses c ON co.course_id = c.id
        LEFT JOIN semesters s ON co.semester_id = s.id
        WHERE co.id = ?
      `;

      const [rows] = await this.db.execute(query, [courseOfferingId]);
      
      if (rows.length === 0) {
        return null;
      }

      const offering = rows[0];

      // Get teachers assigned to this course offering
      const teacherQuery = `
        SELECT 
          tc.id as assignment_id,
          tc.teacher_id,
          tc.role,
          tc.lessons,
          t.employee_id,
          u.name as teacher_name,
          u.email as teacher_email,
          d.name as designation
        FROM teacher_course tc
        LEFT JOIN teachers t ON tc.teacher_id = t.id
        LEFT JOIN users u ON t.user_id = u.id
        LEFT JOIN designations d ON t.designation_id = d.id
        WHERE tc.course_offering_id = ?
        ORDER BY 
          CASE tc.role
            WHEN 'Instructor' THEN 1
            WHEN 'Co-Instructor' THEN 2
            WHEN 'Lab Instructor' THEN 3
            ELSE 4
          END
      `;

      const [teachers] = await this.db.execute(teacherQuery, [courseOfferingId]);
      offering.teachers = teachers;

      // Get enrollment count
      const enrollmentQuery = `
        SELECT COUNT(*) as enrollment_count
        FROM course_enrollments
        WHERE course_offering_id = ? AND status = 'active'
      `;

      const [enrollmentRows] = await this.db.execute(enrollmentQuery, [courseOfferingId]);
      offering.enrollment_count = enrollmentRows[0].enrollment_count;

      return offering;
    } catch (error) {
      console.error('Error in getFullDetails:', error);
      throw error;
    }
  }

  /**
   * Assign a teacher to a course offering
   * @param {number} courseOfferingId - The course offering ID
   * @param {number} teacherId - The teacher ID
   * @param {string} role - Teacher's role (Instructor/Co-Instructor/Lab Instructor)
   * @param {string} lessons - Lessons assigned to the teacher (optional)
   * @returns {Promise<Object>} Assignment result with ID
   */
  async assignTeacher(courseOfferingId, teacherId, role = 'Instructor', lessons = null) {
    try {
      // Check if the course offering exists
      const offering = await this.findById(courseOfferingId);
      if (!offering) {
        throw new Error('Course offering not found');
      }

      // Check if teacher is already assigned to this course offering
      const checkQuery = `
        SELECT id FROM teacher_course 
        WHERE teacher_id = ? AND course_offering_id = ?
      `;
      const [existing] = await this.db.execute(checkQuery, [teacherId, courseOfferingId]);

      if (existing.length > 0) {
        throw new Error('Teacher is already assigned to this course offering');
      }

      // Insert new assignment
      const insertQuery = `
        INSERT INTO teacher_course (teacher_id, course_offering_id, role, lessons)
        VALUES (?, ?, ?, ?)
      `;
      const [result] = await this.db.execute(insertQuery, [teacherId, courseOfferingId, role, lessons]);

      return {
        id: result.insertId,
        teacher_id: teacherId,
        course_offering_id: courseOfferingId,
        role,
        lessons
      };
    } catch (error) {
      console.error('Error in assignTeacher:', error);
      throw error;
    }
  }

  /**
   * Update teacher assignment
   * @param {number} assignmentId - The teacher_course assignment ID
   * @param {Object} data - Update data (role, lessons)
   * @returns {Promise<boolean>} Success status
   */
  async updateTeacherAssignment(assignmentId, data) {
    try {
      const updates = [];
      const values = [];

      if (data.role !== undefined) {
        updates.push('role = ?');
        values.push(data.role);
      }

      if (data.lessons !== undefined) {
        updates.push('lessons = ?');
        values.push(data.lessons);
      }

      if (updates.length === 0) {
        return false;
      }

      const query = `
        UPDATE teacher_course 
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      values.push(assignmentId);

      const [result] = await this.db.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in updateTeacherAssignment:', error);
      throw error;
    }
  }

  /**
   * Remove teacher assignment from a course offering
   * @param {number} assignmentId - The teacher_course assignment ID
   * @returns {Promise<boolean>} Success status
   */
  async removeTeacherAssignment(assignmentId) {
    try {
      const query = `DELETE FROM teacher_course WHERE id = ?`;
      const [result] = await this.db.execute(query, [assignmentId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in removeTeacherAssignment:', error);
      throw error;
    }
  }

  /**
   * Get course offerings for a specific course across all semesters
   * @param {number} courseId - The course ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of course offerings
   */
  async getByCourse(courseId, options = {}) {
    try {
      const {
        orderBy = 'co.created_at',
        order = 'DESC',
        includeSemester = true,
        status = null
      } = options;

      let query = `
        SELECT 
          co.id,
          co.course_id,
          co.semester_id,
          co.section,
          co.max_students,
          co.status,
          co.created_at,
          co.updated_at
      `;

      if (includeSemester) {
        query += `,
          s.name as semester_name,
          s.year as semester_year,
          s.type as semester_type,
          s.start_date,
          s.end_date
        `;
      }

      query += `
        FROM ${this.tableName} co
      `;

      if (includeSemester) {
        query += `
          LEFT JOIN semesters s ON co.semester_id = s.id
        `;
      }

      query += `
        WHERE co.course_id = ?
      `;

      const params = [courseId];

      if (status) {
        query += ` AND co.status = ?`;
        params.push(status);
      }

      query += ` ORDER BY ${orderBy} ${order}`;

      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error in getByCourse:', error);
      throw error;
    }
  }
}

module.exports = CourseOffering;
