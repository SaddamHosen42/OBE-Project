const BaseModel = require('./BaseModel');

/**
 * SemesterResult Model
 * Manages semester-wise academic results for students
 * Handles SGPA and CGPA calculations
 * @extends BaseModel
 */
class SemesterResult extends BaseModel {
  /**
   * Constructor for SemesterResult model
   */
  constructor() {
    super('semester_results');
  }

  /**
   * Create or update semester result for a student
   * @param {Object} resultData - Semester result data
   * @param {number} resultData.student_id - Student ID
   * @param {number} resultData.semester_id - Semester ID
   * @param {number} resultData.sgpa - Semester Grade Point Average
   * @param {number} resultData.cgpa - Cumulative Grade Point Average
   * @param {number} resultData.total_credit_hours - Total credit hours for the semester
   * @param {number} resultData.earned_credit_hours - Earned credit hours
   * @param {string} [resultData.remarks] - Additional remarks
   * @param {boolean} [resultData.is_published=false] - Publication status
   * @returns {Promise<Object>} Created or updated semester result
   */
  async createOrUpdateResult(resultData) {
    try {
      // Validate required fields
      const requiredFields = ['student_id', 'semester_id'];
      for (const field of requiredFields) {
        if (!resultData[field]) {
          throw new Error(`${field} is required`);
        }
      }

      // Check if result already exists
      const existing = await this.findWhere({
        student_id: resultData.student_id,
        semester_id: resultData.semester_id
      });

      if (existing.length > 0) {
        // Update existing result
        await this.update(existing[0].id, resultData);
        return await this.findById(existing[0].id);
      } else {
        // Create new result
        const id = await this.create(resultData);
        return await this.findById(id);
      }
    } catch (error) {
      throw new Error(`Error creating/updating semester result: ${error.message}`);
    }
  }

  /**
   * Calculate SGPA for a student in a specific semester
   * @param {number} studentId - Student ID
   * @param {number} semesterId - Semester ID
   * @returns {Promise<Object>} SGPA calculation result with details
   */
  async calculateSGPA(studentId, semesterId) {
    try {
      if (!studentId || !semesterId) {
        throw new Error('Student ID and Semester ID are required');
      }

      // Get all course results for the student in this semester
      const [courseResults] = await this.db.execute(
        `SELECT 
          cr.id,
          cr.course_offering_id,
          cr.student_id,
          cr.total_marks,
          cr.percentage,
          cr.letter_grade,
          cr.grade_point,
          cr.status,
          c.credit_hours,
          c.course_code,
          c.course_title,
          co.semester_id
        FROM course_results cr
        JOIN course_offerings co ON cr.course_offering_id = co.id
        JOIN courses c ON co.course_id = c.id
        WHERE cr.student_id = ? 
          AND co.semester_id = ?
          AND cr.status = 'Finalized'
        ORDER BY c.course_code`,
        [studentId, semesterId]
      );

      if (courseResults.length === 0) {
        return {
          sgpa: 0,
          totalCreditHours: 0,
          earnedCreditHours: 0,
          courses: [],
          message: 'No finalized course results found for this semester'
        };
      }

      // Calculate SGPA
      let totalQualityPoints = 0;
      let totalCreditHours = 0;
      let earnedCreditHours = 0;
      const courseDetails = [];

      for (const course of courseResults) {
        const creditHours = parseFloat(course.credit_hours) || 0;
        const gradePoint = parseFloat(course.grade_point) || 0;
        
        totalCreditHours += creditHours;
        
        // Count earned credit hours (grade point > 0 means passed)
        if (gradePoint > 0) {
          earnedCreditHours += creditHours;
        }
        
        // Calculate quality points
        const qualityPoints = creditHours * gradePoint;
        totalQualityPoints += qualityPoints;

        courseDetails.push({
          courseCode: course.course_code,
          courseTitle: course.course_title,
          creditHours: creditHours,
          gradePoint: gradePoint,
          letterGrade: course.letter_grade,
          qualityPoints: qualityPoints
        });
      }

      // Calculate SGPA
      const sgpa = totalCreditHours > 0 ? (totalQualityPoints / totalCreditHours) : 0;

      return {
        sgpa: parseFloat(sgpa.toFixed(2)),
        totalCreditHours: totalCreditHours,
        earnedCreditHours: earnedCreditHours,
        totalQualityPoints: parseFloat(totalQualityPoints.toFixed(2)),
        courses: courseDetails,
        coursesCount: courseResults.length
      };
    } catch (error) {
      throw new Error(`Error calculating SGPA: ${error.message}`);
    }
  }

  /**
   * Calculate CGPA for a student up to a specific semester
   * @param {number} studentId - Student ID
   * @param {number} semesterId - Semester ID (calculate up to this semester)
   * @returns {Promise<Object>} CGPA calculation result with details
   */
  async calculateCGPA(studentId, semesterId) {
    try {
      if (!studentId || !semesterId) {
        throw new Error('Student ID and Semester ID are required');
      }

      // Get all semesters up to and including the specified semester
      const [semesters] = await this.db.execute(
        `SELECT 
          s1.id,
          s1.semester_number,
          s1.name,
          s1.academic_session_id
        FROM semesters s1
        JOIN semesters s2 ON s1.academic_session_id <= s2.academic_session_id
        WHERE s2.id = ?
          AND (
            s1.academic_session_id < s2.academic_session_id
            OR (s1.academic_session_id = s2.academic_session_id AND s1.semester_number <= s2.semester_number)
          )
        ORDER BY s1.academic_session_id, s1.semester_number`,
        [semesterId]
      );

      if (semesters.length === 0) {
        throw new Error('Semester not found');
      }

      // Get all course results for the student across all semesters
      const [courseResults] = await this.db.execute(
        `SELECT 
          cr.id,
          cr.course_offering_id,
          cr.student_id,
          cr.total_marks,
          cr.percentage,
          cr.letter_grade,
          cr.grade_point,
          cr.status,
          c.credit_hours,
          c.course_code,
          c.course_title,
          co.semester_id,
          s.semester_number,
          s.name as semester_name
        FROM course_results cr
        JOIN course_offerings co ON cr.course_offering_id = co.id
        JOIN courses c ON co.course_id = c.id
        JOIN semesters s ON co.semester_id = s.id
        WHERE cr.student_id = ? 
          AND co.semester_id IN (${semesters.map(() => '?').join(',')})
          AND cr.status = 'Finalized'
        ORDER BY s.semester_number, c.course_code`,
        [studentId, ...semesters.map(s => s.id)]
      );

      if (courseResults.length === 0) {
        return {
          cgpa: 0,
          totalCreditHours: 0,
          earnedCreditHours: 0,
          semestersIncluded: semesters.length,
          coursesCount: 0,
          semesterResults: [],
          message: 'No finalized course results found'
        };
      }

      // Calculate CGPA
      let totalQualityPoints = 0;
      let totalCreditHours = 0;
      let earnedCreditHours = 0;
      const semesterResults = {};

      // Group by semester
      for (const course of courseResults) {
        const creditHours = parseFloat(course.credit_hours) || 0;
        const gradePoint = parseFloat(course.grade_point) || 0;
        
        totalCreditHours += creditHours;
        
        // Count earned credit hours (grade point > 0 means passed)
        if (gradePoint > 0) {
          earnedCreditHours += creditHours;
        }
        
        // Calculate quality points
        const qualityPoints = creditHours * gradePoint;
        totalQualityPoints += qualityPoints;

        // Group by semester
        const semKey = course.semester_id;
        if (!semesterResults[semKey]) {
          semesterResults[semKey] = {
            semesterId: course.semester_id,
            semesterNumber: course.semester_number,
            semesterName: course.semester_name,
            courses: [],
            totalCreditHours: 0,
            earnedCreditHours: 0,
            totalQualityPoints: 0,
            sgpa: 0
          };
        }

        semesterResults[semKey].courses.push({
          courseCode: course.course_code,
          courseTitle: course.course_title,
          creditHours: creditHours,
          gradePoint: gradePoint,
          letterGrade: course.letter_grade
        });

        semesterResults[semKey].totalCreditHours += creditHours;
        if (gradePoint > 0) {
          semesterResults[semKey].earnedCreditHours += creditHours;
        }
        semesterResults[semKey].totalQualityPoints += qualityPoints;
      }

      // Calculate SGPA for each semester
      Object.keys(semesterResults).forEach(key => {
        const sem = semesterResults[key];
        sem.sgpa = sem.totalCreditHours > 0 
          ? parseFloat((sem.totalQualityPoints / sem.totalCreditHours).toFixed(2))
          : 0;
        sem.totalQualityPoints = parseFloat(sem.totalQualityPoints.toFixed(2));
      });

      // Calculate CGPA
      const cgpa = totalCreditHours > 0 ? (totalQualityPoints / totalCreditHours) : 0;

      return {
        cgpa: parseFloat(cgpa.toFixed(2)),
        totalCreditHours: totalCreditHours,
        earnedCreditHours: earnedCreditHours,
        totalQualityPoints: parseFloat(totalQualityPoints.toFixed(2)),
        semestersIncluded: semesters.length,
        coursesCount: courseResults.length,
        semesterResults: Object.values(semesterResults).sort((a, b) => a.semesterNumber - b.semesterNumber)
      };
    } catch (error) {
      throw new Error(`Error calculating CGPA: ${error.message}`);
    }
  }

  /**
   * Get semester result for a student
   * @param {number} studentId - Student ID
   * @param {number} semesterId - Semester ID
   * @returns {Promise<Object>} Semester result with details
   */
  async getStudentSemesterResult(studentId, semesterId) {
    try {
      const [results] = await this.db.execute(
        `SELECT 
          sr.*,
          s.name as semester_name,
          s.semester_number,
          st.SID,
          u.username,
          u.name as student_name
        FROM ${this.tableName} sr
        JOIN semesters s ON sr.semester_id = s.id
        JOIN students st ON sr.student_id = st.id
        JOIN users u ON st.user_id = u.id
        WHERE sr.student_id = ? AND sr.semester_id = ?`,
        [studentId, semesterId]
      );

      return results.length > 0 ? results[0] : null;
    } catch (error) {
      throw new Error(`Error getting semester result: ${error.message}`);
    }
  }

  /**
   * Get all semester results for a student
   * @param {number} studentId - Student ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of semester results
   */
  async getStudentAllResults(studentId, options = {}) {
    try {
      const { includeUnpublished = false } = options;

      let query = `
        SELECT 
          sr.*,
          s.name as semester_name,
          s.semester_number,
          acs.session_name
        FROM ${this.tableName} sr
        JOIN semesters s ON sr.semester_id = s.id
        JOIN academic_sessions acs ON s.academic_session_id = acs.id
        WHERE sr.student_id = ?
      `;

      const params = [studentId];

      if (!includeUnpublished) {
        query += ` AND sr.is_published = TRUE`;
      }

      query += ` ORDER BY acs.start_date, s.semester_number`;

      const [results] = await this.db.execute(query, params);
      return results;
    } catch (error) {
      throw new Error(`Error getting student results: ${error.message}`);
    }
  }

  /**
   * Publish semester results
   * @param {number} semesterId - Semester ID
   * @param {Array<number>} studentIds - Optional array of specific student IDs to publish
   * @returns {Promise<Object>} Publication result
   */
  async publishResults(semesterId, studentIds = null) {
    try {
      let query = `
        UPDATE ${this.tableName}
        SET is_published = TRUE,
            updated_at = NOW()
        WHERE semester_id = ?
      `;

      const params = [semesterId];

      if (studentIds && studentIds.length > 0) {
        query += ` AND student_id IN (${studentIds.map(() => '?').join(',')})`;
        params.push(...studentIds);
      }

      const [result] = await this.db.execute(query, params);

      return {
        success: true,
        affectedRows: result.affectedRows,
        message: `Published results for ${result.affectedRows} student(s)`
      };
    } catch (error) {
      throw new Error(`Error publishing results: ${error.message}`);
    }
  }

  /**
   * Unpublish semester results
   * @param {number} semesterId - Semester ID
   * @param {Array<number>} studentIds - Optional array of specific student IDs to unpublish
   * @returns {Promise<Object>} Unpublication result
   */
  async unpublishResults(semesterId, studentIds = null) {
    try {
      let query = `
        UPDATE ${this.tableName}
        SET is_published = FALSE,
            updated_at = NOW()
        WHERE semester_id = ?
      `;

      const params = [semesterId];

      if (studentIds && studentIds.length > 0) {
        query += ` AND student_id IN (${studentIds.map(() => '?').join(',')})`;
        params.push(...studentIds);
      }

      const [result] = await this.db.execute(query, params);

      return {
        success: true,
        affectedRows: result.affectedRows,
        message: `Unpublished results for ${result.affectedRows} student(s)`
      };
    } catch (error) {
      throw new Error(`Error unpublishing results: ${error.message}`);
    }
  }

  /**
   * Get semester results summary for a semester
   * @param {number} semesterId - Semester ID
   * @returns {Promise<Object>} Results summary
   */
  async getSemesterSummary(semesterId) {
    try {
      const [summary] = await this.db.execute(
        `SELECT 
          COUNT(*) as total_students,
          COUNT(CASE WHEN is_published = TRUE THEN 1 END) as published_count,
          COUNT(CASE WHEN is_published = FALSE THEN 1 END) as unpublished_count,
          AVG(sgpa) as average_sgpa,
          AVG(cgpa) as average_cgpa,
          MAX(sgpa) as highest_sgpa,
          MIN(sgpa) as lowest_sgpa,
          MAX(cgpa) as highest_cgpa,
          MIN(cgpa) as lowest_cgpa,
          SUM(total_credit_hours) as total_credits,
          SUM(earned_credit_hours) as earned_credits
        FROM ${this.tableName}
        WHERE semester_id = ?`,
        [semesterId]
      );

      if (summary.length === 0 || summary[0].total_students === 0) {
        return {
          total_students: 0,
          published_count: 0,
          unpublished_count: 0,
          message: 'No semester results found'
        };
      }

      const result = summary[0];

      return {
        total_students: result.total_students,
        published_count: result.published_count,
        unpublished_count: result.unpublished_count,
        average_sgpa: result.average_sgpa ? parseFloat(result.average_sgpa.toFixed(2)) : 0,
        average_cgpa: result.average_cgpa ? parseFloat(result.average_cgpa.toFixed(2)) : 0,
        highest_sgpa: result.highest_sgpa ? parseFloat(result.highest_sgpa.toFixed(2)) : 0,
        lowest_sgpa: result.lowest_sgpa ? parseFloat(result.lowest_sgpa.toFixed(2)) : 0,
        highest_cgpa: result.highest_cgpa ? parseFloat(result.highest_cgpa.toFixed(2)) : 0,
        lowest_cgpa: result.lowest_cgpa ? parseFloat(result.lowest_cgpa.toFixed(2)) : 0,
        total_credits: result.total_credits || 0,
        earned_credits: result.earned_credits || 0
      };
    } catch (error) {
      throw new Error(`Error getting semester summary: ${error.message}`);
    }
  }
}

module.exports = SemesterResult;
