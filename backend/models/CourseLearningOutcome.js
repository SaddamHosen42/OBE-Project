const BaseModel = require('./BaseModel');

/**
 * Course Learning Outcome Model
 * Handles CLO CRUD operations, PLO mappings, and attainment tracking
 */
class CourseLearningOutcome extends BaseModel {
  constructor() {
    super('course_learning_outcomes');
  }

  /**
   * Get all CLOs for a specific course
   * @param {number} courseId - The course ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of CLOs for the course
   */
  async getByCourse(courseId, options = {}) {
    try {
      const {
        includeBloomLevel = true,
        includePLOMappings = false,
        orderBy = 'CLO_ID',
        order = 'ASC'
      } = options;

      let query = `
        SELECT 
          clo.id,
          clo.course_id,
          clo.CLO_ID,
          clo.CLO_Description,
          clo.bloom_taxonomy_level_id,
          clo.weight_percentage,
          clo.target_attainment,
          clo.created_at,
          clo.updated_at
      `;

      if (includeBloomLevel) {
        query += `,
          btl.id as bloom_level_id,
          btl.level_number as bloom_level_number,
          btl.level_name as bloom_level_name,
          btl.level_description as bloom_level_description
        `;
      }

      query += `
        FROM ${this.tableName} clo
      `;

      if (includeBloomLevel) {
        query += `
          LEFT JOIN bloom_taxonomy_levels btl ON clo.bloom_taxonomy_level_id = btl.id
        `;
      }

      query += `
        WHERE clo.course_id = ?
        ORDER BY clo.${orderBy} ${order}
      `;

      const [rows] = await this.db.execute(query, [courseId]);

      if (includePLOMappings && rows.length > 0) {
        // Get PLO mappings for each CLO
        for (let clo of rows) {
          clo.plo_mappings = await this.getMappedPLOs(clo.id);
        }
      }

      return rows;
    } catch (error) {
      throw new Error(`Error in getByCourse: ${error.message}`);
    }
  }

  /**
   * Get all PLOs mapped to a specific CLO
   * @param {number} cloId - The CLO ID
   * @returns {Promise<Array>} Array of mapped PLOs with mapping details
   */
  async getMappedPLOs(cloId) {
    try {
      const query = `
        SELECT 
          plo.id as plo_id,
          plo.PLO_ID,
          plo.PLO_Description,
          plo.degree_id,
          plo.bloom_taxonomy_level_id,
          mapping.id as mapping_id,
          mapping.mapping_level,
          mapping.created_at as mapped_at,
          btl.level_name as bloom_level_name,
          btl.level_number as bloom_level_number
        FROM course_learning_outcome_program_learning_outcome mapping
        INNER JOIN program_learning_outcomes plo ON mapping.program_learning_outcome_id = plo.id
        LEFT JOIN bloom_taxonomy_levels btl ON plo.bloom_taxonomy_level_id = btl.id
        WHERE mapping.course_learning_outcome_id = ?
        ORDER BY plo.PLO_ID
      `;

      const [rows] = await this.db.execute(query, [cloId]);
      return rows;
    } catch (error) {
      throw new Error(`Error in getMappedPLOs: ${error.message}`);
    }
  }

  /**
   * Get attainment data for a specific CLO
   * @param {number} cloId - The CLO ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} CLO attainment data
   */
  async getAttainment(cloId, options = {}) {
    try {
      const {
        academicSessionId = null,
        courseOfferingId = null
      } = options;

      // Get CLO basic info
      const clo = await this.findById(cloId);
      if (!clo) {
        throw new Error('CLO not found');
      }

      // Get attainment data from assessments
      let query = `
        SELECT 
          clo.id as clo_id,
          clo.CLO_ID,
          clo.CLO_Description,
          clo.target_attainment,
          clo.weight_percentage,
          COUNT(DISTINCT ca.id) as total_assessments,
          AVG(ca.actual_attainment) as average_attainment,
          MIN(ca.actual_attainment) as min_attainment,
          MAX(ca.actual_attainment) as max_attainment,
          SUM(CASE WHEN ca.actual_attainment >= clo.target_attainment THEN 1 ELSE 0 END) as assessments_meeting_target
        FROM course_learning_outcomes clo
        LEFT JOIN clo_assessments ca ON clo.id = ca.clo_id
        LEFT JOIN course_offerings co ON ca.course_offering_id = co.id
        WHERE clo.id = ?
      `;

      const params = [cloId];

      if (academicSessionId) {
        query += ` AND co.academic_session_id = ?`;
        params.push(academicSessionId);
      }

      if (courseOfferingId) {
        query += ` AND ca.course_offering_id = ?`;
        params.push(courseOfferingId);
      }

      query += ` GROUP BY clo.id`;

      const [rows] = await this.db.execute(query, params);
      
      if (rows.length === 0) {
        return {
          clo_id: clo.id,
          CLO_ID: clo.CLO_ID,
          CLO_Description: clo.CLO_Description,
          target_attainment: clo.target_attainment,
          weight_percentage: clo.weight_percentage,
          total_assessments: 0,
          average_attainment: null,
          min_attainment: null,
          max_attainment: null,
          assessments_meeting_target: 0,
          attainment_status: 'NO_DATA'
        };
      }

      const attainmentData = rows[0];
      
      // Calculate attainment status
      let attainmentStatus = 'NO_DATA';
      if (attainmentData.average_attainment !== null) {
        if (attainmentData.average_attainment >= attainmentData.target_attainment) {
          attainmentStatus = 'ACHIEVED';
        } else if (attainmentData.average_attainment >= attainmentData.target_attainment * 0.8) {
          attainmentStatus = 'PARTIALLY_ACHIEVED';
        } else {
          attainmentStatus = 'NOT_ACHIEVED';
        }
      }

      return {
        ...attainmentData,
        attainment_status: attainmentStatus
      };
    } catch (error) {
      throw new Error(`Error in getAttainment: ${error.message}`);
    }
  }

  /**
   * Map a CLO to a PLO
   * @param {number} cloId - The CLO ID
   * @param {number} ploId - The PLO ID
   * @param {number} mappingLevel - Mapping strength (1=Low, 2=Medium, 3=High)
   * @returns {Promise<Object>} The created mapping
   */
  async mapToPLO(cloId, ploId, mappingLevel = 2) {
    try {
      // Validate mapping level
      if (![1, 2, 3].includes(mappingLevel)) {
        throw new Error('Mapping level must be 1 (Low), 2 (Medium), or 3 (High)');
      }

      // Check if mapping already exists
      const checkQuery = `
        SELECT id FROM course_learning_outcome_program_learning_outcome 
        WHERE course_learning_outcome_id = ? AND program_learning_outcome_id = ?
      `;
      const [existing] = await this.db.execute(checkQuery, [cloId, ploId]);

      if (existing.length > 0) {
        // Update existing mapping
        const updateQuery = `
          UPDATE course_learning_outcome_program_learning_outcome 
          SET mapping_level = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;
        await this.db.execute(updateQuery, [mappingLevel, existing[0].id]);

        return {
          id: existing[0].id,
          course_learning_outcome_id: cloId,
          program_learning_outcome_id: ploId,
          mapping_level: mappingLevel,
          updated: true
        };
      }

      // Create new mapping
      const insertQuery = `
        INSERT INTO course_learning_outcome_program_learning_outcome 
        (course_learning_outcome_id, program_learning_outcome_id, mapping_level)
        VALUES (?, ?, ?)
      `;
      const [result] = await this.db.execute(insertQuery, [cloId, ploId, mappingLevel]);

      return {
        id: result.insertId,
        course_learning_outcome_id: cloId,
        program_learning_outcome_id: ploId,
        mapping_level: mappingLevel,
        updated: false
      };
    } catch (error) {
      throw new Error(`Error in mapToPLO: ${error.message}`);
    }
  }

  /**
   * Unmap a CLO from a PLO
   * @param {number} cloId - The CLO ID
   * @param {number} ploId - The PLO ID
   * @returns {Promise<boolean>} True if unmapped successfully
   */
  async unmapFromPLO(cloId, ploId) {
    try {
      const query = `
        DELETE FROM course_learning_outcome_program_learning_outcome 
        WHERE course_learning_outcome_id = ? AND program_learning_outcome_id = ?
      `;
      const [result] = await this.db.execute(query, [cloId, ploId]);

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error in unmapFromPLO: ${error.message}`);
    }
  }

  /**
   * Get all CLOs with their attainment for a course
   * @param {number} courseId - The course ID
   * @param {number} courseOfferingId - Optional course offering ID to filter by specific offering
   * @returns {Promise<Array>} Array of CLOs with attainment data
   */
  async getCourseAttainmentSummary(courseId, courseOfferingId = null) {
    try {
      const clos = await this.getByCourse(courseId, {
        includeBloomLevel: true,
        includePLOMappings: false
      });

      // Get attainment for each CLO
      const cloAttainments = await Promise.all(
        clos.map(async (clo) => {
          const attainment = await this.getAttainment(clo.id, {
            courseOfferingId
          });
          return {
            ...clo,
            attainment
          };
        })
      );

      return cloAttainments;
    } catch (error) {
      throw new Error(`Error in getCourseAttainmentSummary: ${error.message}`);
    }
  }

  /**
   * Validate CLO data before insert/update
   * @param {Object} data - The CLO data to validate
   * @returns {Object} Validated and sanitized data
   */
  validateCLOData(data) {
    const errors = [];

    // Required fields
    if (!data.course_id) {
      errors.push('course_id is required');
    }

    if (!data.CLO_ID || data.CLO_ID.trim() === '') {
      errors.push('CLO_ID is required');
    }

    if (!data.CLO_Description || data.CLO_Description.trim() === '') {
      errors.push('CLO_Description is required');
    }

    // Validate weight_percentage
    if (data.weight_percentage !== undefined && data.weight_percentage !== null) {
      const weight = parseFloat(data.weight_percentage);
      if (isNaN(weight) || weight < 0 || weight > 100) {
        errors.push('weight_percentage must be between 0 and 100');
      }
    }

    // Validate target_attainment
    if (data.target_attainment !== undefined && data.target_attainment !== null) {
      const target = parseFloat(data.target_attainment);
      if (isNaN(target) || target < 0 || target > 100) {
        errors.push('target_attainment must be between 0 and 100');
      }
    }

    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.join(', ')}`);
    }

    return {
      course_id: data.course_id,
      CLO_ID: data.CLO_ID.trim(),
      CLO_Description: data.CLO_Description.trim(),
      bloom_taxonomy_level_id: data.bloom_taxonomy_level_id || null,
      weight_percentage: data.weight_percentage !== undefined ? parseFloat(data.weight_percentage) : 0.0,
      target_attainment: data.target_attainment !== undefined ? parseFloat(data.target_attainment) : 60.0
    };
  }

  /**
   * Create a new CLO
   * @param {Object} data - CLO data
   * @returns {Promise<Object>} Created CLO
   */
  async create(data) {
    try {
      const validatedData = this.validateCLOData(data);
      
      const query = `
        INSERT INTO ${this.tableName} 
        (course_id, CLO_ID, CLO_Description, bloom_taxonomy_level_id, weight_percentage, target_attainment)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const [result] = await this.db.execute(query, [
        validatedData.course_id,
        validatedData.CLO_ID,
        validatedData.CLO_Description,
        validatedData.bloom_taxonomy_level_id,
        validatedData.weight_percentage,
        validatedData.target_attainment
      ]);

      return await this.findById(result.insertId);
    } catch (error) {
      throw new Error(`Error in create: ${error.message}`);
    }
  }

  /**
   * Update an existing CLO
   * @param {number} id - CLO ID
   * @param {Object} data - Updated CLO data
   * @returns {Promise<Object>} Updated CLO
   */
  async update(id, data) {
    try {
      const validatedData = this.validateCLOData(data);
      
      const query = `
        UPDATE ${this.tableName}
        SET 
          course_id = ?,
          CLO_ID = ?,
          CLO_Description = ?,
          bloom_taxonomy_level_id = ?,
          weight_percentage = ?,
          target_attainment = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await this.db.execute(query, [
        validatedData.course_id,
        validatedData.CLO_ID,
        validatedData.CLO_Description,
        validatedData.bloom_taxonomy_level_id,
        validatedData.weight_percentage,
        validatedData.target_attainment,
        id
      ]);

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error in update: ${error.message}`);
    }
  }

  /**
   * Delete a CLO
   * @param {number} id - CLO ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete(id) {
    try {
      const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
      const [result] = await this.db.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error in delete: ${error.message}`);
    }
  }
}

module.exports = CourseLearningOutcome;
