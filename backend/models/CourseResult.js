const BaseModel = require('./BaseModel');

/**
 * CourseResult Model
 * Manages final results for students in course offerings
 * @extends BaseModel
 */
class CourseResult extends BaseModel {
  /**
   * Constructor for CourseResult model
   */
  constructor() {
    super('course_results');
  }

  /**
   * Calculate result for a student in a course offering
   * @param {number} studentId - Student ID
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise<Object>} Calculated result
   */
  async calculateResult(studentId, courseOfferingId) {
    try {
      if (!studentId || !courseOfferingId) {
        throw new Error('Student ID and Course Offering ID are required');
      }

      // Get all assessment components for the course offering
      const [assessmentComponents] = await this.db.execute(
        `SELECT 
          ac.id,
          ac.weightage,
          ac.max_marks,
          sam.marks_obtained,
          sam.is_absent,
          sam.is_exempted
        FROM assessment_components ac
        LEFT JOIN student_assessment_marks sam ON ac.id = sam.assessment_component_id 
          AND sam.student_id = ?
        WHERE ac.course_offering_id = ?
        ORDER BY ac.sequence_number`,
        [studentId, courseOfferingId]
      );

      if (assessmentComponents.length === 0) {
        throw new Error('No assessment components found for this course offering');
      }

      // Calculate total weighted marks
      let totalWeightedMarks = 0;
      let totalWeightage = 0;
      let hasIncompleteMarks = false;

      for (const component of assessmentComponents) {
        // Skip if exempted
        if (component.is_exempted) {
          continue;
        }

        // Check if absent or marks not entered
        if (component.is_absent || component.marks_obtained === null) {
          hasIncompleteMarks = true;
          continue;
        }

        // Calculate weighted marks for this component
        const weightedMarks = (component.marks_obtained / component.max_marks) * component.weightage;
        totalWeightedMarks += weightedMarks;
        totalWeightage += component.weightage;
      }

      // Calculate percentage
      const percentage = totalWeightage > 0 ? (totalWeightedMarks / totalWeightage) * 100 : 0;

      // Get course details for credit hours
      const [courseDetails] = await this.db.execute(
        `SELECT c.credit_hours
        FROM course_offerings co
        JOIN courses c ON co.course_id = c.id
        WHERE co.id = ?`,
        [courseOfferingId]
      );

      if (courseDetails.length === 0) {
        throw new Error('Course offering not found');
      }

      const creditHours = courseDetails[0].credit_hours;

      // Get grade based on percentage
      const [gradeData] = await this.db.execute(
        `SELECT gp.id, gp.letter_grade, gp.grade_point
        FROM grade_points gp
        JOIN grade_scales gs ON gp.grade_scale_id = gs.id
        WHERE gs.is_active = TRUE
          AND ? BETWEEN gp.min_marks AND gp.max_marks
        LIMIT 1`,
        [percentage]
      );

      let gradePointId = null;
      let letterGrade = null;
      let gradePoint = null;
      let creditEarned = 0;
      let status = hasIncompleteMarks ? 'Incomplete' : 'Complete';

      if (gradeData.length > 0) {
        gradePointId = gradeData[0].id;
        letterGrade = gradeData[0].letter_grade;
        gradePoint = gradeData[0].grade_point;
        
        // Calculate credit earned (0 if grade point is 0, otherwise full credit hours)
        creditEarned = gradePoint > 0 ? creditHours : 0;
        
        // Update status based on grade
        if (gradePoint === 0) {
          status = 'Fail';
        } else {
          status = 'Pass';
        }
      }

      // Check if result already exists
      const existingResult = await this.findWhere({
        student_id: studentId,
        course_offering_id: courseOfferingId
      });

      const resultData = {
        student_id: studentId,
        course_offering_id: courseOfferingId,
        total_marks: totalWeightedMarks,
        percentage: percentage,
        grade_point_id: gradePointId,
        letter_grade: letterGrade,
        grade_point: gradePoint,
        credit_earned: creditEarned,
        status: status
      };

      let resultId;
      if (existingResult && existingResult.length > 0) {
        // Update existing result
        await this.update(existingResult[0].id, resultData);
        resultId = existingResult[0].id;
      } else {
        // Create new result
        resultId = await this.create(resultData);
      }

      return await this.findById(resultId);
    } catch (error) {
      throw new Error(`Error calculating result: ${error.message}`);
    }
  }

  /**
   * Get results for a specific student
   * @param {number} studentId - Student ID
   * @param {Object} options - Query options
   * @param {boolean} options.publishedOnly - Return only published results (default: false)
   * @param {number} options.semesterId - Filter by semester
   * @returns {Promise<Array>} Student's results
   */
  async getByStudent(studentId, options = {}) {
    try {
      if (!studentId) {
        throw new Error('Student ID is required');
      }

      const { publishedOnly = false, semesterId = null } = options;

      let query = `
        SELECT 
          cr.*,
          co.section,
          c.course_code,
          c.course_title,
          c.credit_hours,
          s.semester_name,
          s.semester_year,
          ase.session_code,
          ase.session_year
        FROM course_results cr
        JOIN course_offerings co ON cr.course_offering_id = co.id
        JOIN courses c ON co.course_id = c.id
        JOIN semesters s ON co.semester_id = s.id
        JOIN academic_sessions ase ON co.academic_session_id = ase.id
        WHERE cr.student_id = ?
      `;

      const params = [studentId];

      if (publishedOnly) {
        query += ' AND cr.is_published = TRUE';
      }

      if (semesterId) {
        query += ' AND co.semester_id = ?';
        params.push(semesterId);
      }

      query += ' ORDER BY ase.session_year DESC, s.semester_name, c.course_code';

      const [results] = await this.db.execute(query, params);
      return results;
    } catch (error) {
      throw new Error(`Error getting student results: ${error.message}`);
    }
  }

  /**
   * Get results for a specific course offering
   * @param {number} courseOfferingId - Course offering ID
   * @param {Object} options - Query options
   * @param {boolean} options.publishedOnly - Return only published results (default: false)
   * @returns {Promise<Array>} Course offering results
   */
  async getByCourseOffering(courseOfferingId, options = {}) {
    try {
      if (!courseOfferingId) {
        throw new Error('Course Offering ID is required');
      }

      const { publishedOnly = false } = options;

      let query = `
        SELECT 
          cr.*,
          s.roll_number,
          s.registration_number,
          u.first_name,
          u.last_name,
          u.email
        FROM course_results cr
        JOIN students s ON cr.student_id = s.id
        JOIN users u ON s.user_id = u.id
        WHERE cr.course_offering_id = ?
      `;

      const params = [courseOfferingId];

      if (publishedOnly) {
        query += ' AND cr.is_published = TRUE';
      }

      query += ' ORDER BY s.roll_number';

      const [results] = await this.db.execute(query, params);
      return results;
    } catch (error) {
      throw new Error(`Error getting course offering results: ${error.message}`);
    }
  }

  /**
   * Publish results for a course offering
   * @param {number} courseOfferingId - Course offering ID
   * @param {boolean} publishStatus - Publish status (true to publish, false to unpublish)
   * @returns {Promise<Object>} Update result
   */
  async publishResults(courseOfferingId, publishStatus = true) {
    try {
      if (!courseOfferingId) {
        throw new Error('Course Offering ID is required');
      }

      const query = `
        UPDATE course_results 
        SET is_published = ?, updated_at = NOW()
        WHERE course_offering_id = ?
      `;

      const [result] = await this.db.execute(query, [publishStatus, courseOfferingId]);

      return {
        success: true,
        affectedRows: result.affectedRows,
        publishStatus: publishStatus
      };
    } catch (error) {
      throw new Error(`Error publishing results: ${error.message}`);
    }
  }

  /**
   * Calculate results for all students in a course offering
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise<Object>} Calculation summary
   */
  async calculateAllResults(courseOfferingId) {
    try {
      if (!courseOfferingId) {
        throw new Error('Course Offering ID is required');
      }

      // Get all enrolled students
      const [enrolledStudents] = await this.db.execute(
        `SELECT DISTINCT ce.student_id
        FROM course_enrollments ce
        WHERE ce.course_offering_id = ? AND ce.status = 'Active'`,
        [courseOfferingId]
      );

      if (enrolledStudents.length === 0) {
        return {
          success: true,
          message: 'No enrolled students found',
          calculated: 0,
          failed: 0
        };
      }

      let calculated = 0;
      let failed = 0;
      const errors = [];

      for (const student of enrolledStudents) {
        try {
          await this.calculateResult(student.student_id, courseOfferingId);
          calculated++;
        } catch (error) {
          failed++;
          errors.push({
            student_id: student.student_id,
            error: error.message
          });
        }
      }

      return {
        success: true,
        message: `Calculated results for ${calculated} students`,
        calculated,
        failed,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      throw new Error(`Error calculating all results: ${error.message}`);
    }
  }

  /**
   * Get statistics for a course offering
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise<Object>} Course statistics
   */
  async getCourseStatistics(courseOfferingId) {
    try {
      if (!courseOfferingId) {
        throw new Error('Course Offering ID is required');
      }

      const [stats] = await this.db.execute(
        `SELECT 
          COUNT(*) as total_students,
          AVG(percentage) as average_percentage,
          MAX(percentage) as highest_percentage,
          MIN(percentage) as lowest_percentage,
          SUM(CASE WHEN status = 'Pass' THEN 1 ELSE 0 END) as passed_students,
          SUM(CASE WHEN status = 'Fail' THEN 1 ELSE 0 END) as failed_students,
          SUM(CASE WHEN status = 'Incomplete' THEN 1 ELSE 0 END) as incomplete_students,
          SUM(CASE WHEN is_published = TRUE THEN 1 ELSE 0 END) as published_results
        FROM course_results
        WHERE course_offering_id = ?`,
        [courseOfferingId]
      );

      // Get grade distribution
      const [gradeDistribution] = await this.db.execute(
        `SELECT 
          letter_grade,
          COUNT(*) as count
        FROM course_results
        WHERE course_offering_id = ? AND letter_grade IS NOT NULL
        GROUP BY letter_grade
        ORDER BY grade_point DESC`,
        [courseOfferingId]
      );

      return {
        ...stats[0],
        grade_distribution: gradeDistribution
      };
    } catch (error) {
      throw new Error(`Error getting course statistics: ${error.message}`);
    }
  }
}

module.exports = CourseResult;
