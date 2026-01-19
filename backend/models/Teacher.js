const BaseModel = require('./BaseModel');

/**
 * Teacher Model for managing teacher information
 * Handles teacher CRUD operations and relationships with departments, courses, and users
 */
class Teacher extends BaseModel {
  constructor() {
    super('teachers');
  }

  /**
   * Get all teachers with their associated user, faculty, department, and designation details
   * @returns {Promise<Array>} Array of teacher objects with complete details
   */
  async getAllWithDetails() {
    try {
      const query = `
        SELECT 
          t.id,
          t.user_id,
          t.faculty_id,
          t.department_id,
          t.designation_id,
          t.employee_id,
          t.joining_date,
          t.career_obj,
          t.created_at,
          t.updated_at,
          u.name as user_name,
          u.email as user_email,
          u.phone as user_phone,
          f.name as faculty_name,
          f.short_name as faculty_short_name,
          d.name as department_name,
          d.dept_code as department_code,
          des.name as designation_name
        FROM teachers t
        INNER JOIN users u ON t.user_id = u.id
        LEFT JOIN faculties f ON t.faculty_id = f.id
        LEFT JOIN departments d ON t.department_id = d.id
        LEFT JOIN designations des ON t.designation_id = des.id
        ORDER BY t.created_at DESC
      `;

      const [rows] = await this.db.execute(query);
      return rows;
    } catch (error) {
      console.error('Error in getAllWithDetails:', error);
      throw error;
    }
  }

  /**
   * Find teacher by ID with complete details including user, faculty, department, and designation
   * @param {number} id - Teacher ID
   * @returns {Promise<Object|null>} Teacher object with details or null if not found
   */
  async findByIdWithDetails(id) {
    try {
      const query = `
        SELECT 
          t.id,
          t.user_id,
          t.faculty_id,
          t.department_id,
          t.designation_id,
          t.employee_id,
          t.joining_date,
          t.career_obj,
          t.created_at,
          t.updated_at,
          u.name as user_name,
          u.email as user_email,
          u.phone as user_phone,
          f.name as faculty_name,
          f.short_name as faculty_short_name,
          d.name as department_name,
          d.dept_code as department_code,
          des.name as designation_name
        FROM teachers t
        INNER JOIN users u ON t.user_id = u.id
        LEFT JOIN faculties f ON t.faculty_id = f.id
        LEFT JOIN departments d ON t.department_id = d.id
        LEFT JOIN designations des ON t.designation_id = des.id
        WHERE t.id = ?
      `;

      const [rows] = await this.db.execute(query, [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error in findByIdWithDetails:', error);
      throw error;
    }
  }

  /**
   * Get all teachers in a specific department
   * @param {number} departmentId - Department ID
   * @returns {Promise<Array>} Array of teachers in the department
   */
  async getByDepartment(departmentId) {
    try {
      const query = `
        SELECT 
          t.id,
          t.user_id,
          t.faculty_id,
          t.department_id,
          t.designation_id,
          t.employee_id,
          t.joining_date,
          t.career_obj,
          t.created_at,
          t.updated_at,
          u.name as user_name,
          u.email as user_email,
          u.phone as user_phone,
          f.name as faculty_name,
          f.short_name as faculty_short_name,
          d.name as department_name,
          d.dept_code as department_code,
          des.name as designation_name
        FROM teachers t
        INNER JOIN users u ON t.user_id = u.id
        LEFT JOIN faculties f ON t.faculty_id = f.id
        LEFT JOIN departments d ON t.department_id = d.id
        LEFT JOIN designations des ON t.designation_id = des.id
        WHERE t.department_id = ?
        ORDER BY t.created_at DESC
      `;

      const [rows] = await this.db.execute(query, [departmentId]);
      return rows;
    } catch (error) {
      console.error('Error in getByDepartment:', error);
      throw error;
    }
  }

  /**
   * Get all courses assigned to a teacher with course offering details
   * @param {number} teacherId - Teacher ID
   * @returns {Promise<Array>} Array of courses assigned to the teacher
   */
  async getCourses(teacherId) {
    try {
      const query = `
        SELECT 
          tc.id as assignment_id,
          tc.teacher_id,
          tc.course_offering_id,
          tc.role,
          tc.lessons,
          tc.created_at as assigned_at,
          co.id as offering_id,
          co.course_id,
          co.semester_id,
          co.academic_session_id,
          co.section,
          co.capacity,
          co.enrolled_students,
          c.course_code,
          c.course_name,
          c.credit_hours,
          c.contact_hours,
          c.course_type,
          s.semester_number,
          s.semester_name,
          asess.session_name,
          asess.start_year,
          asess.end_year
        FROM teacher_course tc
        INNER JOIN course_offerings co ON tc.course_offering_id = co.id
        INNER JOIN courses c ON co.course_id = c.id
        LEFT JOIN semesters s ON co.semester_id = s.id
        LEFT JOIN academic_sessions asess ON co.academic_session_id = asess.id
        WHERE tc.teacher_id = ?
        ORDER BY asess.start_year DESC, s.semester_number DESC, c.course_code ASC
      `;

      const [rows] = await this.db.execute(query, [teacherId]);
      return rows;
    } catch (error) {
      console.error('Error in getCourses:', error);
      throw error;
    }
  }

  /**
   * Find teacher by user ID
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} Teacher object or null if not found
   */
  async findByUserId(userId) {
    try {
      const query = `
        SELECT 
          t.id,
          t.user_id,
          t.faculty_id,
          t.department_id,
          t.designation_id,
          t.employee_id,
          t.joining_date,
          t.career_obj,
          t.created_at,
          t.updated_at,
          u.name as user_name,
          u.email as user_email,
          u.phone as user_phone,
          f.name as faculty_name,
          f.short_name as faculty_short_name,
          d.name as department_name,
          d.dept_code as department_code,
          des.name as designation_name
        FROM teachers t
        INNER JOIN users u ON t.user_id = u.id
        LEFT JOIN faculties f ON t.faculty_id = f.id
        LEFT JOIN departments d ON t.department_id = d.id
        LEFT JOIN designations des ON t.designation_id = des.id
        WHERE t.user_id = ?
      `;

      const [rows] = await this.db.execute(query, [userId]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error in findByUserId:', error);
      throw error;
    }
  }

  /**
   * Find teacher by employee ID
   * @param {string} employeeId - Employee ID
   * @returns {Promise<Object|null>} Teacher object or null if not found
   */
  async findByEmployeeId(employeeId) {
    try {
      const query = `
        SELECT 
          t.id,
          t.user_id,
          t.faculty_id,
          t.department_id,
          t.designation_id,
          t.employee_id,
          t.joining_date,
          t.career_obj,
          t.created_at,
          t.updated_at,
          u.name as user_name,
          u.email as user_email,
          u.phone as user_phone,
          f.name as faculty_name,
          f.short_name as faculty_short_name,
          d.name as department_name,
          d.dept_code as department_code,
          des.name as designation_name
        FROM teachers t
        INNER JOIN users u ON t.user_id = u.id
        LEFT JOIN faculties f ON t.faculty_id = f.id
        LEFT JOIN departments d ON t.department_id = d.id
        LEFT JOIN designations des ON t.designation_id = des.id
        WHERE t.employee_id = ?
      `;

      const [rows] = await this.db.execute(query, [employeeId]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error in findByEmployeeId:', error);
      throw error;
    }
  }

  /**
   * Create a new teacher record
   * @param {Object} data - Teacher data
   * @returns {Promise<Object>} Created teacher object with ID
   */
  async create(data) {
    try {
      const { user_id, faculty_id, department_id, designation_id, employee_id, joining_date, career_obj } = data;

      const query = `
        INSERT INTO teachers 
        (user_id, faculty_id, department_id, designation_id, employee_id, joining_date, career_obj)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await this.db.execute(query, [
        user_id,
        faculty_id,
        department_id,
        designation_id,
        employee_id,
        joining_date,
        career_obj || null
      ]);

      return {
        id: result.insertId,
        ...data
      };
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  /**
   * Update a teacher record
   * @param {number} id - Teacher ID
   * @param {Object} data - Updated teacher data
   * @returns {Promise<boolean>} True if updated successfully
   */
  async update(id, data) {
    try {
      const allowedFields = ['user_id', 'faculty_id', 'department_id', 'designation_id', 'employee_id', 'joining_date', 'career_obj'];
      const updates = [];
      const values = [];

      for (const field of allowedFields) {
        if (data[field] !== undefined) {
          updates.push(`${field} = ?`);
          values.push(data[field]);
        }
      }

      if (updates.length === 0) {
        return false;
      }

      values.push(id);

      const query = `UPDATE teachers SET ${updates.join(', ')} WHERE id = ?`;
      const [result] = await this.db.execute(query, values);

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  }

  /**
   * Delete a teacher record
   * @param {number} id - Teacher ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete(id) {
    try {
      const query = `DELETE FROM teachers WHERE id = ?`;
      const [result] = await this.db.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in delete:', error);
      throw error;
    }
  }

  /**
   * Assign a course to a teacher
   * @param {number} teacherId - Teacher ID
   * @param {number} courseOfferingId - Course Offering ID
   * @param {string} role - Role (e.g., 'Instructor', 'Co-Instructor', 'Lab Instructor')
   * @param {string} lessons - Lesson plan details (optional)
   * @returns {Promise<Object>} Created assignment object
   */
  async assignCourse(teacherId, courseOfferingId, role = 'Instructor', lessons = null) {
    try {
      const query = `
        INSERT INTO teacher_course (teacher_id, course_offering_id, role, lessons)
        VALUES (?, ?, ?, ?)
      `;

      const [result] = await this.db.execute(query, [teacherId, courseOfferingId, role, lessons]);

      return {
        id: result.insertId,
        teacher_id: teacherId,
        course_offering_id: courseOfferingId,
        role,
        lessons
      };
    } catch (error) {
      console.error('Error in assignCourse:', error);
      throw error;
    }
  }

  /**
   * Remove a course assignment from a teacher
   * @param {number} teacherId - Teacher ID
   * @param {number} courseOfferingId - Course Offering ID
   * @returns {Promise<boolean>} True if removed successfully
   */
  async removeCourseAssignment(teacherId, courseOfferingId) {
    try {
      const query = `
        DELETE FROM teacher_course 
        WHERE teacher_id = ? AND course_offering_id = ?
      `;

      const [result] = await this.db.execute(query, [teacherId, courseOfferingId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in removeCourseAssignment:', error);
      throw error;
    }
  }

  /**
   * Update course assignment details
   * @param {number} assignmentId - Assignment ID
   * @param {Object} data - Updated assignment data (role, lessons)
   * @returns {Promise<boolean>} True if updated successfully
   */
  async updateCourseAssignment(assignmentId, data) {
    try {
      const allowedFields = ['role', 'lessons'];
      const updates = [];
      const values = [];

      for (const field of allowedFields) {
        if (data[field] !== undefined) {
          updates.push(`${field} = ?`);
          values.push(data[field]);
        }
      }

      if (updates.length === 0) {
        return false;
      }

      values.push(assignmentId);

      const query = `UPDATE teacher_course SET ${updates.join(', ')} WHERE id = ?`;
      const [result] = await this.db.execute(query, values);

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in updateCourseAssignment:', error);
      throw error;
    }
  }
}

module.exports = Teacher;
