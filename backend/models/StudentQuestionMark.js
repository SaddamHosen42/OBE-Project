const BaseModel = require('./BaseModel');

/**
 * StudentQuestionMark Model
 * Manages student marks for individual questions
 * @extends BaseModel
 */
class StudentQuestionMark extends BaseModel {
  /**
   * Constructor for StudentQuestionMark model
   */
  constructor() {
    super('student_question_marks');
  }

  /**
   * Enter marks for a student's question
   * @param {Object} markData - Mark data
   * @param {number} markData.student_id - Student ID
   * @param {number} markData.question_id - Question ID
   * @param {number} markData.marks_obtained - Marks obtained
   * @param {string} markData.feedback - Feedback for the student
   * @returns {Promise<Object>} Created or updated mark record
   */
  async enterMarks(markData) {
    try {
      const {
        student_id,
        question_id,
        marks_obtained,
        feedback = null
      } = markData;

      // Validate required fields
      if (!student_id || !question_id) {
        throw new Error('Student ID and Question ID are required');
      }

      if (marks_obtained === undefined || marks_obtained === null) {
        throw new Error('Marks obtained is required');
      }

      // Check if marks already exist
      const existingMark = await this.findWhere({
        student_id,
        question_id
      });

      if (existingMark && existingMark.length > 0) {
        // Update existing marks
        const updateData = {
          marks_obtained,
          feedback
        };

        await this.update(existingMark[0].id, updateData);
        return await this.findById(existingMark[0].id);
      } else {
        // Insert new marks
        const insertData = {
          student_id,
          question_id,
          marks_obtained,
          feedback
        };

        const result = await this.create(insertData);
        return await this.findById(result);
      }
    } catch (error) {
      throw new Error(`Error entering question marks: ${error.message}`);
    }
  }

  /**
   * Bulk enter marks for multiple students and questions
   * @param {Array<Object>} marksData - Array of mark data objects
   * @returns {Promise<Object>} Result with success/failure counts
   */
  async bulkEnterMarks(marksData) {
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
          await this.enterMarks(markData);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            student_id: markData.student_id,
            question_id: markData.question_id,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Error in bulk enter question marks: ${error.message}`);
    }
  }

  /**
   * Get question marks by student ID
   * @param {number} studentId - Student ID
   * @param {Object} options - Query options
   * @param {number} options.assessmentComponentId - Filter by assessment component
   * @param {number} options.questionId - Filter by specific question
   * @param {boolean} options.includeQuestionDetails - Include question details
   * @returns {Promise<Array>} Array of question marks
   */
  async getByStudent(studentId, options = {}) {
    try {
      const {
        assessmentComponentId = null,
        questionId = null,
        includeQuestionDetails = true
      } = options;

      let query = `
        SELECT 
          sqm.*
          ${includeQuestionDetails ? `,
          q.question_number,
          q.question_text,
          q.question_type,
          q.marks as max_marks,
          q.assessment_component_id,
          ac.component_name,
          bt.level_name as bloom_level` : ''}
        FROM ${this.tableName} sqm
        ${includeQuestionDetails ? `
        LEFT JOIN questions q ON sqm.question_id = q.id
        LEFT JOIN assessment_components ac ON q.assessment_component_id = ac.id
        LEFT JOIN bloom_taxonomy_levels bt ON q.bloom_taxonomy_level_id = bt.id` : ''}
        WHERE sqm.student_id = ?
      `;

      const params = [studentId];

      if (assessmentComponentId) {
        query += ` AND q.assessment_component_id = ?`;
        params.push(assessmentComponentId);
      }

      if (questionId) {
        query += ` AND sqm.question_id = ?`;
        params.push(questionId);
      }

      query += ` ORDER BY q.question_number ASC`;

      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error getting question marks by student: ${error.message}`);
    }
  }

  /**
   * Get question marks by question ID (all students)
   * @param {number} questionId - Question ID
   * @param {Object} options - Query options
   * @param {boolean} options.includeStudentDetails - Include student details
   * @param {string} options.orderBy - Column to order by
   * @param {string} options.order - Order direction ('ASC' or 'DESC')
   * @returns {Promise<Array>} Array of marks for the question
   */
  async getByQuestion(questionId, options = {}) {
    try {
      const {
        includeStudentDetails = true,
        orderBy = 's.roll_number',
        order = 'ASC'
      } = options;

      let query = `
        SELECT 
          sqm.*
          ${includeStudentDetails ? `,
          s.roll_number,
          s.name as student_name,
          s.email as student_email` : ''}
        FROM ${this.tableName} sqm
        ${includeStudentDetails ? `
        LEFT JOIN students s ON sqm.student_id = s.id` : ''}
        WHERE sqm.question_id = ?
        ORDER BY ${orderBy} ${order}
      `;

      const [rows] = await this.db.execute(query, [questionId]);
      return rows;
    } catch (error) {
      throw new Error(`Error getting marks by question: ${error.message}`);
    }
  }

  /**
   * Get question marks by assessment component (all students, all questions)
   * @param {number} assessmentComponentId - Assessment component ID
   * @param {Object} options - Query options
   * @param {boolean} options.includeDetails - Include student and question details
   * @returns {Promise<Array>} Array of all marks for the assessment
   */
  async getByAssessment(assessmentComponentId, options = {}) {
    try {
      const { includeDetails = true } = options;

      let query = `
        SELECT 
          sqm.*
          ${includeDetails ? `,
          s.roll_number,
          s.name as student_name,
          q.question_number,
          q.question_text,
          q.marks as max_marks` : ''}
        FROM ${this.tableName} sqm
        JOIN questions q ON sqm.question_id = q.id
        ${includeDetails ? `
        LEFT JOIN students s ON sqm.student_id = s.id` : ''}
        WHERE q.assessment_component_id = ?
        ORDER BY s.roll_number ASC, q.question_number ASC
      `;

      const [rows] = await this.db.execute(query, [assessmentComponentId]);
      return rows;
    } catch (error) {
      throw new Error(`Error getting marks by assessment: ${error.message}`);
    }
  }

  /**
   * Get question-wise statistics for an assessment
   * @param {number} assessmentComponentId - Assessment component ID
   * @returns {Promise<Array>} Statistics for each question
   */
  async getQuestionStatistics(assessmentComponentId) {
    try {
      const query = `
        SELECT 
          q.id as question_id,
          q.question_number,
          q.marks as max_marks,
          COUNT(sqm.id) as total_attempts,
          AVG(sqm.marks_obtained) as average_marks,
          MAX(sqm.marks_obtained) as highest_marks,
          MIN(sqm.marks_obtained) as lowest_marks,
          SUM(CASE WHEN sqm.marks_obtained = q.marks THEN 1 ELSE 0 END) as full_marks_count
        FROM questions q
        LEFT JOIN ${this.tableName} sqm ON q.id = sqm.question_id
        WHERE q.assessment_component_id = ?
        GROUP BY q.id, q.question_number, q.marks
        ORDER BY q.question_number ASC
      `;

      const [rows] = await this.db.execute(query, [assessmentComponentId]);
      return rows;
    } catch (error) {
      throw new Error(`Error getting question statistics: ${error.message}`);
    }
  }

  /**
   * Calculate total marks for a student in an assessment from question-level marks
   * @param {number} studentId - Student ID
   * @param {number} assessmentComponentId - Assessment component ID
   * @returns {Promise<Object>} Total marks calculation
   */
  async calculateStudentTotal(studentId, assessmentComponentId) {
    try {
      const query = `
        SELECT 
          SUM(sqm.marks_obtained) as total_obtained,
          SUM(q.marks) as total_max_marks,
          COUNT(DISTINCT q.id) as questions_answered,
          (SELECT COUNT(*) FROM questions WHERE assessment_component_id = ?) as total_questions
        FROM ${this.tableName} sqm
        JOIN questions q ON sqm.question_id = q.id
        WHERE sqm.student_id = ? AND q.assessment_component_id = ?
      `;

      const [rows] = await this.db.execute(query, [
        assessmentComponentId,
        studentId,
        assessmentComponentId
      ]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error calculating student total: ${error.message}`);
    }
  }

  /**
   * Get CLO-wise marks for a student
   * @param {number} studentId - Student ID
   * @param {number} assessmentComponentId - Assessment component ID
   * @returns {Promise<Array>} CLO-wise marks breakdown
   */
  async getCLOWiseMarks(studentId, assessmentComponentId) {
    try {
      const query = `
        SELECT 
          clo.id as clo_id,
          clo.clo_code,
          clo.description as clo_description,
          SUM(sqm.marks_obtained) as marks_obtained,
          SUM(qcm.marks_allocated) as total_marks
        FROM ${this.tableName} sqm
        JOIN questions q ON sqm.question_id = q.id
        JOIN question_clo_mapping qcm ON q.id = qcm.question_id
        JOIN course_learning_outcomes clo ON qcm.course_learning_outcome_id = clo.id
        WHERE sqm.student_id = ? AND q.assessment_component_id = ?
        GROUP BY clo.id, clo.clo_code, clo.description
        ORDER BY clo.clo_code ASC
      `;

      const [rows] = await this.db.execute(query, [studentId, assessmentComponentId]);
      return rows;
    } catch (error) {
      throw new Error(`Error getting CLO-wise marks: ${error.message}`);
    }
  }
}

module.exports = StudentQuestionMark;
