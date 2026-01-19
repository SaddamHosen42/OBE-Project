const BaseModel = require('./BaseModel');

/**
 * AssessmentComponent Model
 * Manages specific assessment instances for course offerings
 * (e.g., "Quiz 1", "Midterm Exam", "Assignment 2")
 * @extends BaseModel
 */
class AssessmentComponent extends BaseModel {
  /**
   * Constructor for AssessmentComponent model
   */
  constructor() {
    super('assessment_components');
  }

  /**
   * Get assessment components by course offering
   * @param {number} courseOfferingId - Course offering ID
   * @param {Object} options - Query options
   * @param {boolean} options.includeType - Include assessment type details
   * @param {boolean} options.includeCLOMapping - Include CLO mapping
   * @param {string} options.orderBy - Column to order by
   * @param {string} options.order - Order direction ('ASC' or 'DESC')
   * @returns {Promise<Array>} Array of assessment components
   */
  async getByCourseOffering(courseOfferingId, options = {}) {
    try {
      const {
        includeType = true,
        includeCLOMapping = false,
        orderBy = 'scheduled_date',
        order = 'ASC'
      } = options;

      let query = `
        SELECT 
          ac.*
          ${includeType ? `, 
          at.name as type_name,
          at.category as type_category` : ''}
        FROM ${this.tableName} ac
        ${includeType ? 'LEFT JOIN assessment_types at ON ac.assessment_type_id = at.id' : ''}
        WHERE ac.course_offering_id = ?
        ORDER BY ac.${orderBy} ${order}
      `;

      const [rows] = await this.db.execute(query, [courseOfferingId]);

      // If includeCLOMapping is true, fetch CLO mappings for each component
      if (includeCLOMapping && rows.length > 0) {
        for (let i = 0; i < rows.length; i++) {
          rows[i].clo_mappings = await this.getCLOMapping(rows[i].id);
        }
      }

      return rows;
    } catch (error) {
      throw new Error(`Error getting assessment components by course offering: ${error.message}`);
    }
  }

  /**
   * Get CLO mapping for an assessment component
   * @param {number} assessmentComponentId - Assessment component ID
   * @returns {Promise<Array>} Array of CLO mappings with details
   */
  async getCLOMapping(assessmentComponentId) {
    try {
      const query = `
        SELECT 
          acm.id,
          acm.assessment_component_id,
          acm.course_learning_outcome_id,
          acm.marks_allocated,
          acm.weight_percentage,
          clo.clo_code,
          clo.description as clo_description,
          clo.bloom_level_id,
          bt.level_name as bloom_level,
          bt.level_number as bloom_level_number
        FROM assessment_clo_mapping acm
        LEFT JOIN course_learning_outcomes clo ON acm.course_learning_outcome_id = clo.id
        LEFT JOIN bloom_taxonomy_levels bt ON clo.bloom_level_id = bt.id
        WHERE acm.assessment_component_id = ?
        ORDER BY clo.clo_code ASC
      `;

      const [rows] = await this.db.execute(query, [assessmentComponentId]);
      return rows;
    } catch (error) {
      throw new Error(`Error getting CLO mapping: ${error.message}`);
    }
  }

  /**
   * Get assessment component by ID with full details
   * @param {number} id - Assessment component ID
   * @param {Object} options - Query options
   * @param {boolean} options.includeType - Include assessment type details
   * @param {boolean} options.includeCLOMapping - Include CLO mapping
   * @param {boolean} options.includeCourseOffering - Include course offering details
   * @returns {Promise<Object|null>} Assessment component with details or null
   */
  async getByIdWithDetails(id, options = {}) {
    try {
      const {
        includeType = true,
        includeCLOMapping = true,
        includeCourseOffering = true
      } = options;

      let query = `
        SELECT 
          ac.*
          ${includeType ? `, 
          at.name as type_name,
          at.category as type_category,
          at.description as type_description` : ''}
          ${includeCourseOffering ? `,
          co.section,
          co.semester_id,
          co.teacher_id,
          c.course_code,
          c.course_name` : ''}
        FROM ${this.tableName} ac
        ${includeType ? 'LEFT JOIN assessment_types at ON ac.assessment_type_id = at.id' : ''}
        ${includeCourseOffering ? `
        LEFT JOIN course_offerings co ON ac.course_offering_id = co.id
        LEFT JOIN courses c ON co.course_id = c.id` : ''}
        WHERE ac.id = ?
      `;

      const [rows] = await this.db.execute(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }

      const component = rows[0];

      // Fetch CLO mappings if requested
      if (includeCLOMapping) {
        component.clo_mappings = await this.getCLOMapping(id);
      }

      return component;
    } catch (error) {
      throw new Error(`Error getting assessment component by ID: ${error.message}`);
    }
  }

  /**
   * Create a new assessment component
   * @param {Object} data - Assessment component data
   * @returns {Promise<number>} ID of the created assessment component
   */
  async create(data) {
    try {
      const {
        course_offering_id,
        assessment_type_id,
        name,
        total_marks,
        weight_percentage,
        scheduled_date = null,
        duration_minutes = null,
        instructions = null,
        is_published = false
      } = data;

      // Validate required fields
      if (!course_offering_id || !assessment_type_id || !name) {
        throw new Error('Course offering ID, assessment type ID, and name are required');
      }

      if (total_marks < 0) {
        throw new Error('Total marks must be non-negative');
      }

      if (weight_percentage < 0 || weight_percentage > 100) {
        throw new Error('Weight percentage must be between 0 and 100');
      }

      const query = `
        INSERT INTO ${this.tableName} (
          course_offering_id, assessment_type_id, name, total_marks,
          weight_percentage, scheduled_date, duration_minutes, instructions, is_published
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await this.db.execute(query, [
        course_offering_id,
        assessment_type_id,
        name,
        total_marks,
        weight_percentage,
        scheduled_date,
        duration_minutes,
        instructions,
        is_published
      ]);

      return result.insertId;
    } catch (error) {
      throw new Error(`Error creating assessment component: ${error.message}`);
    }
  }

  /**
   * Update an assessment component
   * @param {number} id - Assessment component ID
   * @param {Object} data - Updated data
   * @returns {Promise<boolean>} True if updated successfully
   */
  async update(id, data) {
    try {
      const {
        assessment_type_id,
        name,
        total_marks,
        weight_percentage,
        scheduled_date,
        duration_minutes,
        instructions,
        is_published
      } = data;

      // Validate if provided
      if (total_marks !== undefined && total_marks < 0) {
        throw new Error('Total marks must be non-negative');
      }

      if (weight_percentage !== undefined && (weight_percentage < 0 || weight_percentage > 100)) {
        throw new Error('Weight percentage must be between 0 and 100');
      }

      const updates = [];
      const values = [];

      if (assessment_type_id !== undefined) {
        updates.push('assessment_type_id = ?');
        values.push(assessment_type_id);
      }
      if (name !== undefined) {
        updates.push('name = ?');
        values.push(name);
      }
      if (total_marks !== undefined) {
        updates.push('total_marks = ?');
        values.push(total_marks);
      }
      if (weight_percentage !== undefined) {
        updates.push('weight_percentage = ?');
        values.push(weight_percentage);
      }
      if (scheduled_date !== undefined) {
        updates.push('scheduled_date = ?');
        values.push(scheduled_date);
      }
      if (duration_minutes !== undefined) {
        updates.push('duration_minutes = ?');
        values.push(duration_minutes);
      }
      if (instructions !== undefined) {
        updates.push('instructions = ?');
        values.push(instructions);
      }
      if (is_published !== undefined) {
        updates.push('is_published = ?');
        values.push(is_published);
      }

      if (updates.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(id);
      const query = `
        UPDATE ${this.tableName}
        SET ${updates.join(', ')}
        WHERE id = ?
      `;

      const [result] = await this.db.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error updating assessment component: ${error.message}`);
    }
  }

  /**
   * Delete an assessment component
   * @param {number} id - Assessment component ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete(id) {
    try {
      // The database will cascade delete related CLO mappings
      const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
      const [result] = await this.db.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting assessment component: ${error.message}`);
    }
  }

  /**
   * Map an assessment component to a CLO
   * @param {Object} data - Mapping data
   * @param {number} data.assessment_component_id - Assessment component ID
   * @param {number} data.course_learning_outcome_id - CLO ID
   * @param {number} data.marks_allocated - Marks allocated to this CLO
   * @param {number} data.weight_percentage - Weight percentage for this CLO
   * @returns {Promise<number>} ID of the created mapping
   */
  async mapToCLO(data) {
    try {
      const {
        assessment_component_id,
        course_learning_outcome_id,
        marks_allocated = 0,
        weight_percentage = 0
      } = data;

      // Validate required fields
      if (!assessment_component_id || !course_learning_outcome_id) {
        throw new Error('Assessment component ID and CLO ID are required');
      }

      // Validate values
      if (marks_allocated < 0) {
        throw new Error('Marks allocated must be non-negative');
      }

      if (weight_percentage < 0 || weight_percentage > 100) {
        throw new Error('Weight percentage must be between 0 and 100');
      }

      // Check if mapping already exists
      const checkQuery = `
        SELECT id FROM assessment_clo_mapping
        WHERE assessment_component_id = ? AND course_learning_outcome_id = ?
      `;
      const [existing] = await this.db.execute(checkQuery, [
        assessment_component_id,
        course_learning_outcome_id
      ]);

      if (existing.length > 0) {
        throw new Error('This CLO is already mapped to this assessment component');
      }

      const query = `
        INSERT INTO assessment_clo_mapping (
          assessment_component_id, course_learning_outcome_id,
          marks_allocated, weight_percentage
        )
        VALUES (?, ?, ?, ?)
      `;

      const [result] = await this.db.execute(query, [
        assessment_component_id,
        course_learning_outcome_id,
        marks_allocated,
        weight_percentage
      ]);

      return result.insertId;
    } catch (error) {
      throw new Error(`Error mapping assessment to CLO: ${error.message}`);
    }
  }

  /**
   * Unmap an assessment component from a CLO
   * @param {number} assessment_component_id - Assessment component ID
   * @param {number} course_learning_outcome_id - CLO ID
   * @returns {Promise<boolean>} True if unmapped successfully
   */
  async unmapFromCLO(assessment_component_id, course_learning_outcome_id) {
    try {
      const query = `
        DELETE FROM assessment_clo_mapping
        WHERE assessment_component_id = ? AND course_learning_outcome_id = ?
      `;

      const [result] = await this.db.execute(query, [
        assessment_component_id,
        course_learning_outcome_id
      ]);

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error unmapping assessment from CLO: ${error.message}`);
    }
  }

  /**
   * Update CLO mapping for an assessment component
   * @param {number} mappingId - Mapping ID
   * @param {Object} data - Updated mapping data
   * @returns {Promise<boolean>} True if updated successfully
   */
  async updateCLOMapping(mappingId, data) {
    try {
      const { marks_allocated, weight_percentage } = data;

      // Validate if provided
      if (marks_allocated !== undefined && marks_allocated < 0) {
        throw new Error('Marks allocated must be non-negative');
      }

      if (weight_percentage !== undefined && (weight_percentage < 0 || weight_percentage > 100)) {
        throw new Error('Weight percentage must be between 0 and 100');
      }

      const updates = [];
      const values = [];

      if (marks_allocated !== undefined) {
        updates.push('marks_allocated = ?');
        values.push(marks_allocated);
      }
      if (weight_percentage !== undefined) {
        updates.push('weight_percentage = ?');
        values.push(weight_percentage);
      }

      if (updates.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(mappingId);
      const query = `
        UPDATE assessment_clo_mapping
        SET ${updates.join(', ')}
        WHERE id = ?
      `;

      const [result] = await this.db.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error updating CLO mapping: ${error.message}`);
    }
  }

  /**
   * Get all assessment components for a course with their CLO mappings
   * @param {number} courseId - Course ID
   * @param {number} semesterId - Semester ID (optional)
   * @returns {Promise<Array>} Array of assessment components with CLO mappings
   */
  async getByCourse(courseId, semesterId = null) {
    try {
      let query = `
        SELECT 
          ac.*,
          at.name as type_name,
          at.category as type_category,
          co.section,
          co.semester_id
        FROM ${this.tableName} ac
        LEFT JOIN assessment_types at ON ac.assessment_type_id = at.id
        LEFT JOIN course_offerings co ON ac.course_offering_id = co.id
        WHERE co.course_id = ?
      `;

      const params = [courseId];

      if (semesterId) {
        query += ' AND co.semester_id = ?';
        params.push(semesterId);
      }

      query += ' ORDER BY co.semester_id DESC, ac.scheduled_date ASC';

      const [rows] = await this.db.execute(query, params);

      // Fetch CLO mappings for each component
      for (let i = 0; i < rows.length; i++) {
        rows[i].clo_mappings = await this.getCLOMapping(rows[i].id);
      }

      return rows;
    } catch (error) {
      throw new Error(`Error getting assessment components by course: ${error.message}`);
    }
  }

  /**
   * Get published assessment components for a course offering
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise<Array>} Array of published assessment components
   */
  async getPublishedByCourseOffering(courseOfferingId) {
    try {
      const query = `
        SELECT 
          ac.*,
          at.name as type_name,
          at.category as type_category
        FROM ${this.tableName} ac
        LEFT JOIN assessment_types at ON ac.assessment_type_id = at.id
        WHERE ac.course_offering_id = ? AND ac.is_published = TRUE
        ORDER BY ac.scheduled_date ASC
      `;

      const [rows] = await this.db.execute(query, [courseOfferingId]);
      return rows;
    } catch (error) {
      throw new Error(`Error getting published assessment components: ${error.message}`);
    }
  }
}

module.exports = AssessmentComponent;
