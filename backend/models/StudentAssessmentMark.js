const BaseModel = require('./BaseModel');

/**
 * StudentAssessmentMark Model
 * Manages student marks for assessment components
 * @extends BaseModel
 */
class StudentAssessmentMark extends BaseModel {
  /**
   * Constructor for StudentAssessmentMark model
   */
  constructor() {
    super('student_assessment_marks');
  }

  /**
   * Enter marks for a student's assessment
   * @param {Object} markData - Mark data
   * @param {number} markData.student_id - Student ID
   * @param {number} markData.assessment_component_id - Assessment component ID
   * @param {number} markData.marks_obtained - Marks obtained (can be null if absent/exempted)
   * @param {boolean} markData.is_absent - Is student absent (default: false)
   * @param {boolean} markData.is_exempted - Is student exempted (default: false)
   * @param {string} markData.remarks - Additional remarks
   * @param {number} markData.evaluated_by - Evaluator user ID
   * @returns {Promise<Object>} Created mark record
   */
  async enterMarks(markData) {
    try {
      const {
        student_id,
        assessment_component_id,
        marks_obtained = null,
        is_absent = false,
        is_exempted = false,
        remarks = null,
        evaluated_by
      } = markData;

      // Validate required fields
      if (!student_id || !assessment_component_id || !evaluated_by) {
        throw new Error('Student ID, Assessment Component ID, and Evaluator ID are required');
      }

      // Check if marks already exist
      const existingMark = await this.findWhere({
        student_id,
        assessment_component_id
      });

      if (existingMark && existingMark.length > 0) {
        // Update existing marks
        const updateData = {
          marks_obtained,
          is_absent,
          is_exempted,
          remarks,
          evaluated_by,
          evaluated_at: new Date()
        };

        await this.update(existingMark[0].id, updateData);
        return await this.findById(existingMark[0].id);
      } else {
        // Insert new marks
        const insertData = {
          student_id,
          assessment_component_id,
          marks_obtained,
          is_absent,
          is_exempted,
          remarks,
          evaluated_by,
          evaluated_at: new Date()
        };

        const result = await this.create(insertData);
        return await this.findById(result);
      }
    } catch (error) {
      throw new Error(`Error entering marks: ${error.message}`);
    }
  }

  /**
   * Bulk enter marks for multiple students
   * @param {Array<Object>} marksData - Array of mark data objects
   * @param {number} evaluatedBy - Evaluator user ID
   * @returns {Promise<Object>} Result with success/failure counts
   */
  async bulkEnterMarks(marksData, evaluatedBy) {
    try {
      if (!Array.isArray(marksData) || marksData.length === 0) {
        throw new Error('Marks data must be a non-empty array');
      }

      const results = {
        success: 0,
        failed: 0,
        errors: []
      };

      for (const markData of marksData) {
        try {
          await this.enterMarks({
            ...markData,
            evaluated_by: evaluatedBy
          });
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            student_id: markData.student_id,
            assessment_component_id: markData.assessment_component_id,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Error in bulk enter marks: ${error.message}`);
    }
  }

  /**
   * Get marks by student ID
   * @param {number} studentId - Student ID
   * @param {Object} options - Query options
   * @param {number} options.courseOfferingId - Filter by course offering
   * @param {number} options.assessmentTypeId - Filter by assessment type
   * @param {boolean} options.includeDetails - Include assessment component details
   * @returns {Promise<Array>} Array of student marks
   */
  async getByStudent(studentId, options = {}) {
    try {
      const {
        courseOfferingId = null,
        assessmentTypeId = null,
        includeDetails = true
      } = options;

      let query = `
        SELECT 
          sam.*
          ${includeDetails ? `,
          ac.component_name,
          ac.max_marks,
          ac.weightage,
          ac.assessment_type_id,
          at.name as assessment_type,
          co.course_id,
          c.course_code,
          c.course_name,
          u.name as evaluated_by_name` : ''}
        FROM ${this.tableName} sam
        ${includeDetails ? `
        LEFT JOIN assessment_components ac ON sam.assessment_component_id = ac.id
        LEFT JOIN assessment_types at ON ac.assessment_type_id = at.id
        LEFT JOIN course_offerings co ON ac.course_offering_id = co.id
        LEFT JOIN courses c ON co.course_id = c.id
        LEFT JOIN users u ON sam.evaluated_by = u.id` : ''}
        WHERE sam.student_id = ?
      `;

      const params = [studentId];

      if (courseOfferingId) {
        query += ` AND ac.course_offering_id = ?`;
        params.push(courseOfferingId);
      }

      if (assessmentTypeId) {
        query += ` AND ac.assessment_type_id = ?`;
        params.push(assessmentTypeId);
      }

      query += ` ORDER BY ac.assessment_date DESC`;

      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error getting marks by student: ${error.message}`);
    }
  }

  /**
   * Get marks by assessment component
   * @param {number} assessmentComponentId - Assessment component ID
   * @param {Object} options - Query options
   * @param {boolean} options.includeStudentDetails - Include student details
   * @param {string} options.orderBy - Column to order by
   * @param {string} options.order - Order direction ('ASC' or 'DESC')
   * @returns {Promise<Array>} Array of marks for the assessment
   */
  async getByAssessment(assessmentComponentId, options = {}) {
    try {
      const {
        includeStudentDetails = true,
        orderBy = 's.roll_number',
        order = 'ASC'
      } = options;

      let query = `
        SELECT 
          sam.*
          ${includeStudentDetails ? `,
          s.roll_number,
          s.name as student_name,
          s.email as student_email,
          u.name as evaluated_by_name` : ''}
        FROM ${this.tableName} sam
        ${includeStudentDetails ? `
        LEFT JOIN students s ON sam.student_id = s.id
        LEFT JOIN users u ON sam.evaluated_by = u.id` : ''}
        WHERE sam.assessment_component_id = ?
        ORDER BY ${orderBy} ${order}
      `;

      const [rows] = await this.db.execute(query, [assessmentComponentId]);
      return rows;
    } catch (error) {
      throw new Error(`Error getting marks by assessment: ${error.message}`);
    }
  }

  /**
   * Get assessment marks with statistics
   * @param {number} assessmentComponentId - Assessment component ID
   * @returns {Promise<Object>} Statistics and marks data
   */
  async getAssessmentStatistics(assessmentComponentId) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_students,
          COUNT(marks_obtained) as evaluated_count,
          SUM(CASE WHEN is_absent = 1 THEN 1 ELSE 0 END) as absent_count,
          SUM(CASE WHEN is_exempted = 1 THEN 1 ELSE 0 END) as exempted_count,
          AVG(CASE WHEN marks_obtained IS NOT NULL THEN marks_obtained ELSE NULL END) as average_marks,
          MAX(marks_obtained) as max_marks_obtained,
          MIN(marks_obtained) as min_marks_obtained
        FROM ${this.tableName}
        WHERE assessment_component_id = ?
      `;

      const [rows] = await this.db.execute(query, [assessmentComponentId]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error getting assessment statistics: ${error.message}`);
    }
  }

  /**
   * Get student's total marks for a course offering
   * @param {number} studentId - Student ID
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise<Object>} Total marks and breakdown by assessment type
   */
  async getStudentCourseTotal(studentId, courseOfferingId) {
    try {
      const query = `
        SELECT 
          at.name as assessment_type,
          SUM(sam.marks_obtained) as total_marks,
          SUM(ac.max_marks) as max_marks,
          COUNT(*) as assessment_count
        FROM ${this.tableName} sam
        JOIN assessment_components ac ON sam.assessment_component_id = ac.id
        JOIN assessment_types at ON ac.assessment_type_id = at.id
        WHERE sam.student_id = ? 
          AND ac.course_offering_id = ?
          AND sam.marks_obtained IS NOT NULL
        GROUP BY at.id, at.name
      `;

      const [rows] = await this.db.execute(query, [studentId, courseOfferingId]);
      return rows;
    } catch (error) {
      throw new Error(`Error getting student course total: ${error.message}`);
    }
  }

  /**
   * Check if student has been evaluated for an assessment
   * @param {number} studentId - Student ID
   * @param {number} assessmentComponentId - Assessment component ID
   * @returns {Promise<boolean>} True if evaluated, false otherwise
   */
  async isEvaluated(studentId, assessmentComponentId) {
    try {
      const marks = await this.findWhere({
        student_id: studentId,
        assessment_component_id: assessmentComponentId
      });

      return marks.length > 0 && marks[0].evaluated_at !== null;
    } catch (error) {
      throw new Error(`Error checking evaluation status: ${error.message}`);
    }
  }
}

module.exports = StudentAssessmentMark;
