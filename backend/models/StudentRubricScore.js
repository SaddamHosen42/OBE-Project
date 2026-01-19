const BaseModel = require('./BaseModel');

/**
 * StudentRubricScore Model
 * Manages rubric-based scoring for students
 * @extends BaseModel
 */
class StudentRubricScore extends BaseModel {
  /**
   * Constructor for StudentRubricScore model
   */
  constructor() {
    super('student_rubric_scores');
  }

  /**
   * Enter score for a student's rubric criterion
   * @param {Object} scoreData - Score data
   * @param {number} scoreData.student_id - Student ID
   * @param {number} scoreData.assessment_component_id - Assessment component ID
   * @param {number} scoreData.rubric_criteria_id - Rubric criteria ID
   * @param {number} scoreData.rubric_level_id - Rubric level ID
   * @param {number} scoreData.score - Score value
   * @param {string} scoreData.feedback - Feedback for the student
   * @returns {Promise<Object>} Created or updated score record
   */
  async enterScore(scoreData) {
    try {
      const {
        student_id,
        assessment_component_id,
        rubric_criteria_id,
        rubric_level_id,
        score,
        feedback = null
      } = scoreData;

      // Validate required fields
      if (!student_id || !assessment_component_id || !rubric_criteria_id || !rubric_level_id) {
        throw new Error('Student ID, Assessment Component ID, Rubric Criteria ID, and Rubric Level ID are required');
      }

      // Validate score if provided
      if (score !== null && score !== undefined && (isNaN(score) || score < 0)) {
        throw new Error('Score must be a non-negative number');
      }

      // Check if score already exists for this criterion
      const existingScore = await this.findWhere({
        student_id,
        assessment_component_id,
        rubric_criteria_id
      });

      if (existingScore && existingScore.length > 0) {
        // Update existing score
        const updateData = {
          rubric_level_id,
          score,
          feedback,
          updated_at: new Date()
        };

        await this.update(existingScore[0].id, updateData);
        return await this.findById(existingScore[0].id);
      } else {
        // Insert new score
        const insertData = {
          student_id,
          assessment_component_id,
          rubric_criteria_id,
          rubric_level_id,
          score,
          feedback
        };

        const result = await this.create(insertData);
        return await this.findById(result);
      }
    } catch (error) {
      throw new Error(`Error entering rubric score: ${error.message}`);
    }
  }

  /**
   * Bulk enter scores for multiple criteria
   * @param {Array<Object>} scoresData - Array of score data objects
   * @returns {Promise<Object>} Result with success/failure counts
   */
  async bulkEnterScores(scoresData) {
    try {
      if (!Array.isArray(scoresData) || scoresData.length === 0) {
        throw new Error('Scores data must be a non-empty array');
      }

      const results = {
        success: 0,
        failed: 0,
        errors: []
      };

      for (const scoreData of scoresData) {
        try {
          await this.enterScore(scoreData);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            data: scoreData,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Error in bulk entering scores: ${error.message}`);
    }
  }

  /**
   * Get rubric scores for a student
   * @param {number} studentId - Student ID
   * @param {Object} options - Query options
   * @param {number} options.assessment_component_id - Filter by assessment component
   * @param {number} options.rubric_criteria_id - Filter by rubric criteria
   * @returns {Promise<Array>} Array of score records with details
   */
  async getByStudent(studentId, options = {}) {
    try {
      const {
        assessment_component_id = null,
        rubric_criteria_id = null
      } = options;

      let query = `
        SELECT 
          srs.*,
          rc.criterion_name,
          rc.description as criterion_description,
          rc.max_score as criterion_max_score,
          rc.weight_percentage,
          rl.level_name,
          rl.level_score,
          rl.description as level_description,
          ac.name as assessment_name,
          ac.total_marks as assessment_total_marks,
          r.rubric_name
        FROM ${this.tableName} srs
        INNER JOIN rubric_criteria rc ON srs.rubric_criteria_id = rc.id
        INNER JOIN rubric_levels rl ON srs.rubric_level_id = rl.id
        INNER JOIN assessment_components ac ON srs.assessment_component_id = ac.id
        INNER JOIN rubrics r ON rc.rubric_id = r.id
        WHERE srs.student_id = ?
      `;

      const params = [studentId];

      if (assessment_component_id) {
        query += ` AND srs.assessment_component_id = ?`;
        params.push(assessment_component_id);
      }

      if (rubric_criteria_id) {
        query += ` AND srs.rubric_criteria_id = ?`;
        params.push(rubric_criteria_id);
      }

      query += ` ORDER BY srs.assessment_component_id, rc.\`order\``;

      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error getting student rubric scores: ${error.message}`);
    }
  }

  /**
   * Get rubric scores for an assessment component
   * @param {number} assessmentComponentId - Assessment component ID
   * @param {Object} options - Query options
   * @param {number} options.student_id - Filter by specific student
   * @param {number} options.rubric_criteria_id - Filter by specific criterion
   * @returns {Promise<Array>} Array of score records with student details
   */
  async getByAssessment(assessmentComponentId, options = {}) {
    try {
      const {
        student_id = null,
        rubric_criteria_id = null
      } = options;

      let query = `
        SELECT 
          srs.*,
          s.student_id as student_roll_number,
          s.student_name,
          rc.criterion_name,
          rc.description as criterion_description,
          rc.max_score as criterion_max_score,
          rc.weight_percentage,
          rl.level_name,
          rl.level_score,
          rl.description as level_description
        FROM ${this.tableName} srs
        INNER JOIN students s ON srs.student_id = s.id
        INNER JOIN rubric_criteria rc ON srs.rubric_criteria_id = rc.id
        INNER JOIN rubric_levels rl ON srs.rubric_level_id = rl.id
        WHERE srs.assessment_component_id = ?
      `;

      const params = [assessmentComponentId];

      if (student_id) {
        query += ` AND srs.student_id = ?`;
        params.push(student_id);
      }

      if (rubric_criteria_id) {
        query += ` AND srs.rubric_criteria_id = ?`;
        params.push(rubric_criteria_id);
      }

      query += ` ORDER BY s.student_id, rc.\`order\``;

      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error getting assessment rubric scores: ${error.message}`);
    }
  }

  /**
   * Calculate total rubric score for a student in an assessment
   * @param {number} studentId - Student ID
   * @param {number} assessmentComponentId - Assessment component ID
   * @returns {Promise<Object>} Calculated total score and breakdown
   */
  async calculateTotalScore(studentId, assessmentComponentId) {
    try {
      const query = `
        SELECT 
          SUM(srs.score * rc.weight_percentage / 100) as weighted_total,
          COUNT(DISTINCT srs.rubric_criteria_id) as scored_criteria,
          r.rubric_name,
          ac.total_marks as assessment_total_marks
        FROM ${this.tableName} srs
        INNER JOIN rubric_criteria rc ON srs.rubric_criteria_id = rc.id
        INNER JOIN rubrics r ON rc.rubric_id = r.id
        INNER JOIN assessment_components ac ON srs.assessment_component_id = ac.id
        WHERE srs.student_id = ? AND srs.assessment_component_id = ?
        GROUP BY r.id, r.rubric_name, ac.total_marks
      `;

      const [rows] = await this.db.execute(query, [studentId, assessmentComponentId]);
      
      if (rows.length === 0) {
        return {
          weighted_total: 0,
          scored_criteria: 0,
          assessment_total_marks: 0,
          rubric_name: null
        };
      }

      return rows[0];
    } catch (error) {
      throw new Error(`Error calculating total rubric score: ${error.message}`);
    }
  }

  /**
   * Get rubric scores summary for all students in an assessment
   * @param {number} assessmentComponentId - Assessment component ID
   * @returns {Promise<Array>} Array of student score summaries
   */
  async getAssessmentSummary(assessmentComponentId) {
    try {
      const query = `
        SELECT 
          s.id as student_id,
          s.student_id as student_roll_number,
          s.student_name,
          COUNT(DISTINCT srs.rubric_criteria_id) as scored_criteria,
          SUM(srs.score * rc.weight_percentage / 100) as weighted_total,
          MAX(ac.total_marks) as assessment_total_marks
        FROM students s
        LEFT JOIN ${this.tableName} srs ON s.id = srs.student_id 
          AND srs.assessment_component_id = ?
        LEFT JOIN rubric_criteria rc ON srs.rubric_criteria_id = rc.id
        LEFT JOIN assessment_components ac ON srs.assessment_component_id = ac.id
        WHERE s.id IN (
          SELECT DISTINCT student_id 
          FROM course_enrollments ce
          INNER JOIN assessment_components ac2 ON ce.course_offering_id = ac2.course_offering_id
          WHERE ac2.id = ?
        )
        GROUP BY s.id, s.student_id, s.student_name
        ORDER BY s.student_id
      `;

      const [rows] = await this.db.execute(query, [assessmentComponentId, assessmentComponentId]);
      return rows;
    } catch (error) {
      throw new Error(`Error getting assessment summary: ${error.message}`);
    }
  }

  /**
   * Delete rubric score by ID
   * @param {number} scoreId - Score ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteScore(scoreId) {
    try {
      await this.delete(scoreId);
      return true;
    } catch (error) {
      throw new Error(`Error deleting rubric score: ${error.message}`);
    }
  }

  /**
   * Delete all scores for a student in an assessment
   * @param {number} studentId - Student ID
   * @param {number} assessmentComponentId - Assessment component ID
   * @returns {Promise<number>} Number of deleted records
   */
  async deleteStudentScores(studentId, assessmentComponentId) {
    try {
      const query = `
        DELETE FROM ${this.tableName}
        WHERE student_id = ? AND assessment_component_id = ?
      `;

      const [result] = await this.db.execute(query, [studentId, assessmentComponentId]);
      return result.affectedRows;
    } catch (error) {
      throw new Error(`Error deleting student rubric scores: ${error.message}`);
    }
  }
}

module.exports = StudentRubricScore;
