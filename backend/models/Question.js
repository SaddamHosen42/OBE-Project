const BaseModel = require('./BaseModel');

/**
 * Question Model
 * Manages individual questions within assessments
 * @extends BaseModel
 */
class Question extends BaseModel {
  /**
   * Constructor for Question model
   */
  constructor() {
    super('questions');
  }

  /**
   * Get questions by assessment component
   * @param {number} assessmentComponentId - Assessment component ID
   * @param {Object} options - Query options
   * @param {boolean} options.includeBloomLevel - Include Bloom taxonomy level details
   * @param {boolean} options.includeCLOMapping - Include CLO mapping
   * @param {string} options.orderBy - Column to order by
   * @param {string} options.order - Order direction ('ASC' or 'DESC')
   * @returns {Promise<Array>} Array of questions
   */
  async getByAssessment(assessmentComponentId, options = {}) {
    try {
      const {
        includeBloomLevel = true,
        includeCLOMapping = false,
        orderBy = 'question_number',
        order = 'ASC'
      } = options;

      let query = `
        SELECT 
          q.*
          ${includeBloomLevel ? `, 
          bt.level_name as bloom_level_name,
          bt.level_number as bloom_level_number,
          bt.description as bloom_description` : ''}
        FROM ${this.tableName} q
        ${includeBloomLevel ? 'LEFT JOIN bloom_taxonomy_levels bt ON q.bloom_taxonomy_level_id = bt.id' : ''}
        WHERE q.assessment_component_id = ?
        ORDER BY q.${orderBy} ${order}
      `;

      const [rows] = await this.db.execute(query, [assessmentComponentId]);

      // If includeCLOMapping is true, fetch CLO mappings for each question
      if (includeCLOMapping && rows.length > 0) {
        for (let i = 0; i < rows.length; i++) {
          rows[i].clo_mappings = await this.getCLOMapping(rows[i].id);
        }
      }

      return rows;
    } catch (error) {
      throw new Error(`Error getting questions by assessment: ${error.message}`);
    }
  }

  /**
   * Get CLO mapping for a question
   * @param {number} questionId - Question ID
   * @returns {Promise<Array>} Array of CLO mappings with details
   */
  async getCLOMapping(questionId) {
    try {
      const query = `
        SELECT 
          qcm.id,
          qcm.question_id,
          qcm.course_learning_outcome_id,
          qcm.marks_allocated,
          clo.clo_code,
          clo.description as clo_description,
          clo.bloom_level_id,
          bt.level_name as bloom_level,
          bt.level_number as bloom_level_number
        FROM question_clo_mapping qcm
        LEFT JOIN course_learning_outcomes clo ON qcm.course_learning_outcome_id = clo.id
        LEFT JOIN bloom_taxonomy_levels bt ON clo.bloom_level_id = bt.id
        WHERE qcm.question_id = ?
        ORDER BY clo.clo_code ASC
      `;

      const [rows] = await this.db.execute(query, [questionId]);
      return rows;
    } catch (error) {
      throw new Error(`Error getting CLO mapping: ${error.message}`);
    }
  }

  /**
   * Get question by ID with full details
   * @param {number} id - Question ID
   * @param {Object} options - Query options
   * @param {boolean} options.includeBloomLevel - Include Bloom taxonomy level details
   * @param {boolean} options.includeCLOMapping - Include CLO mapping
   * @param {boolean} options.includeAssessment - Include assessment component details
   * @returns {Promise<Object|null>} Question with details or null
   */
  async getByIdWithDetails(id, options = {}) {
    try {
      const {
        includeBloomLevel = true,
        includeCLOMapping = true,
        includeAssessment = true
      } = options;

      let query = `
        SELECT 
          q.*
          ${includeBloomLevel ? `, 
          bt.level_name as bloom_level_name,
          bt.level_number as bloom_level_number,
          bt.description as bloom_description` : ''}
          ${includeAssessment ? `, 
          ac.name as assessment_name,
          ac.description as assessment_description,
          ac.assessment_type_id,
          at.name as assessment_type_name` : ''}
        FROM ${this.tableName} q
        ${includeBloomLevel ? 'LEFT JOIN bloom_taxonomy_levels bt ON q.bloom_taxonomy_level_id = bt.id' : ''}
        ${includeAssessment ? `
        LEFT JOIN assessment_components ac ON q.assessment_component_id = ac.id
        LEFT JOIN assessment_types at ON ac.assessment_type_id = at.id` : ''}
        WHERE q.id = ?
      `;

      const [rows] = await this.db.execute(query, [id]);

      if (rows.length === 0) {
        return null;
      }

      const question = rows[0];

      // Fetch CLO mappings if requested
      if (includeCLOMapping) {
        question.clo_mappings = await this.getCLOMapping(id);
      }

      return question;
    } catch (error) {
      throw new Error(`Error getting question by ID with details: ${error.message}`);
    }
  }

  /**
   * Create a new question
   * @param {Object} questionData - Question data
   * @param {number} questionData.assessment_component_id - Assessment component ID
   * @param {string} questionData.question_number - Question number or identifier
   * @param {string} questionData.question_text - The actual question text
   * @param {string} questionData.question_type - Question type (MCQ, Short, etc.)
   * @param {number} questionData.marks - Marks allocated
   * @param {string} [questionData.difficulty_level] - Difficulty level
   * @param {number} [questionData.bloom_taxonomy_level_id] - Bloom taxonomy level ID
   * @returns {Promise<Object>} Created question with ID
   */
  async create(questionData) {
    try {
      const {
        assessment_component_id,
        question_number,
        question_text,
        question_type,
        marks,
        difficulty_level = null,
        bloom_taxonomy_level_id = null
      } = questionData;

      // Validate required fields
      if (!assessment_component_id || !question_number || !question_text || !question_type || marks === undefined) {
        throw new Error('Missing required fields: assessment_component_id, question_number, question_text, question_type, and marks are required');
      }

      const data = {
        assessment_component_id,
        question_number,
        question_text,
        question_type,
        marks,
        difficulty_level,
        bloom_taxonomy_level_id
      };

      const result = await this.insert(data);
      return {
        id: result.insertId,
        ...data
      };
    } catch (error) {
      throw new Error(`Error creating question: ${error.message}`);
    }
  }

  /**
   * Update a question
   * @param {number} id - Question ID
   * @param {Object} questionData - Updated question data
   * @returns {Promise<boolean>} True if updated successfully
   */
  async updateQuestion(id, questionData) {
    try {
      // Check if question exists
      const existing = await this.findById(id);
      if (!existing) {
        throw new Error('Question not found');
      }

      // Remove fields that shouldn't be updated directly
      const { id: _, created_at, updated_at, ...updateData } = questionData;

      if (Object.keys(updateData).length === 0) {
        throw new Error('No valid fields to update');
      }

      const result = await this.update(id, updateData);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error updating question: ${error.message}`);
    }
  }

  /**
   * Delete a question
   * @param {number} id - Question ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteQuestion(id) {
    try {
      // Check if question exists
      const existing = await this.findById(id);
      if (!existing) {
        throw new Error('Question not found');
      }

      const result = await this.delete(id);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting question: ${error.message}`);
    }
  }

  /**
   * Map question to CLO(s)
   * @param {number} questionId - Question ID
   * @param {Array} cloMappings - Array of CLO mappings
   * @param {number} cloMappings[].course_learning_outcome_id - CLO ID
   * @param {number} cloMappings[].marks_allocated - Marks allocated to this CLO
   * @returns {Promise<Object>} Mapping result
   */
  async mapToCLO(questionId, cloMappings) {
    try {
      // Validate question exists
      const question = await this.findById(questionId);
      if (!question) {
        throw new Error('Question not found');
      }

      // Validate input
      if (!Array.isArray(cloMappings) || cloMappings.length === 0) {
        throw new Error('CLO mappings must be a non-empty array');
      }

      // Validate total marks allocation
      const totalMarks = cloMappings.reduce((sum, mapping) => sum + (mapping.marks_allocated || 0), 0);
      if (totalMarks > question.marks) {
        throw new Error(`Total marks allocated (${totalMarks}) exceeds question marks (${question.marks})`);
      }

      // Start transaction
      const connection = await this.db.getConnection();
      await connection.beginTransaction();

      try {
        // Delete existing mappings for this question
        await connection.execute(
          'DELETE FROM question_clo_mapping WHERE question_id = ?',
          [questionId]
        );

        // Insert new mappings
        const insertPromises = cloMappings.map(mapping => {
          return connection.execute(
            `INSERT INTO question_clo_mapping 
            (question_id, course_learning_outcome_id, marks_allocated) 
            VALUES (?, ?, ?)`,
            [
              questionId,
              mapping.course_learning_outcome_id,
              mapping.marks_allocated
            ]
          );
        });

        await Promise.all(insertPromises);

        // Commit transaction
        await connection.commit();
        connection.release();

        // Return updated mappings
        const updatedMappings = await this.getCLOMapping(questionId);
        return {
          success: true,
          message: 'CLO mappings updated successfully',
          mappings: updatedMappings
        };
      } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
      }
    } catch (error) {
      throw new Error(`Error mapping question to CLO: ${error.message}`);
    }
  }

  /**
   * Get questions by course offering (through assessment components)
   * @param {number} courseOfferingId - Course offering ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of questions grouped by assessment
   */
  async getByCourseOffering(courseOfferingId, options = {}) {
    try {
      const query = `
        SELECT 
          q.*,
          ac.name as assessment_name,
          ac.description as assessment_description,
          at.name as assessment_type_name,
          bt.level_name as bloom_level_name,
          bt.level_number as bloom_level_number
        FROM ${this.tableName} q
        LEFT JOIN assessment_components ac ON q.assessment_component_id = ac.id
        LEFT JOIN assessment_types at ON ac.assessment_type_id = at.id
        LEFT JOIN bloom_taxonomy_levels bt ON q.bloom_taxonomy_level_id = bt.id
        WHERE ac.course_offering_id = ?
        ORDER BY ac.scheduled_date, q.question_number
      `;

      const [rows] = await this.db.execute(query, [courseOfferingId]);
      return rows;
    } catch (error) {
      throw new Error(`Error getting questions by course offering: ${error.message}`);
    }
  }

  /**
   * Get questions by difficulty level
   * @param {string} difficultyLevel - Difficulty level
   * @param {number} assessmentComponentId - Optional assessment component ID
   * @returns {Promise<Array>} Array of questions
   */
  async getByDifficultyLevel(difficultyLevel, assessmentComponentId = null) {
    try {
      let query = `
        SELECT q.*, bt.level_name as bloom_level_name
        FROM ${this.tableName} q
        LEFT JOIN bloom_taxonomy_levels bt ON q.bloom_taxonomy_level_id = bt.id
        WHERE q.difficulty_level = ?
      `;
      const params = [difficultyLevel];

      if (assessmentComponentId) {
        query += ' AND q.assessment_component_id = ?';
        params.push(assessmentComponentId);
      }

      query += ' ORDER BY q.question_number';

      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error getting questions by difficulty level: ${error.message}`);
    }
  }

  /**
   * Get statistics for questions in an assessment
   * @param {number} assessmentComponentId - Assessment component ID
   * @returns {Promise<Object>} Question statistics
   */
  async getStatistics(assessmentComponentId) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_questions,
          SUM(marks) as total_marks,
          AVG(marks) as avg_marks,
          COUNT(DISTINCT question_type) as question_types_count,
          COUNT(DISTINCT difficulty_level) as difficulty_levels_count,
          COUNT(DISTINCT bloom_taxonomy_level_id) as bloom_levels_count
        FROM ${this.tableName}
        WHERE assessment_component_id = ?
      `;

      const [rows] = await this.db.execute(query, [assessmentComponentId]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error getting question statistics: ${error.message}`);
    }
  }
}

module.exports = Question;
