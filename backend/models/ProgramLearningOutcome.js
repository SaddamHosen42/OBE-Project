const BaseModel = require('./BaseModel');

/**
 * Program Learning Outcome Model
 * Handles PLO CRUD operations, PEO mappings, CLO mappings, and attainment tracking
 */
class ProgramLearningOutcome extends BaseModel {
  constructor() {
    super('program_learning_outcomes');
  }

  /**
   * Get all PLOs for a specific degree/program
   * @param {number} degreeId - The degree ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of PLOs for the degree
   */
  async getByDegree(degreeId, options = {}) {
    try {
      const {
        includeBloomLevel = true,
        includePEOMappings = false,
        includeCLOMappings = false,
        orderBy = 'PLO_No',
        order = 'ASC'
      } = options;

      let query = `
        SELECT 
          plo.id,
          plo.degree_id,
          plo.programName,
          plo.PLO_No,
          plo.PLO_Description,
          plo.bloom_taxonomy_level_id,
          plo.target_attainment,
          plo.created_at,
          plo.updated_at
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
        FROM ${this.tableName} plo
      `;

      if (includeBloomLevel) {
        query += `
          LEFT JOIN bloom_taxonomy_levels btl ON plo.bloom_taxonomy_level_id = btl.id
        `;
      }

      query += `
        WHERE plo.degree_id = ?
        ORDER BY plo.${orderBy} ${order}
      `;

      const [rows] = await this.db.execute(query, [degreeId]);

      // Get additional mappings if requested
      if (rows.length > 0) {
        for (let plo of rows) {
          if (includePEOMappings) {
            plo.peo_mappings = await this.getMappedPEOs(plo.id);
          }
          if (includeCLOMappings) {
            plo.clo_mappings = await this.getMappedCLOs(plo.id);
          }
        }
      }

      return rows;
    } catch (error) {
      throw new Error(`Error in getByDegree: ${error.message}`);
    }
  }

  /**
   * Get all CLOs mapped to a specific PLO
   * @param {number} ploId - The PLO ID
   * @returns {Promise<Array>} Array of mapped CLOs with mapping details
   */
  async getMappedCLOs(ploId) {
    try {
      const query = `
        SELECT 
          clo.id as clo_id,
          clo.course_id,
          clo.CLO_ID,
          clo.CLO_Description,
          clo.bloom_taxonomy_level_id,
          clo.weight_percentage,
          clo.target_attainment,
          mapping.id as mapping_id,
          mapping.mapping_level,
          mapping.created_at as mapped_at,
          c.code as course_code,
          c.title as course_title,
          btl.level_name as bloom_level_name,
          btl.level_number as bloom_level_number
        FROM course_learning_outcome_program_learning_outcome mapping
        INNER JOIN course_learning_outcomes clo ON mapping.course_learning_outcome_id = clo.id
        INNER JOIN courses c ON clo.course_id = c.id
        LEFT JOIN bloom_taxonomy_levels btl ON clo.bloom_taxonomy_level_id = btl.id
        WHERE mapping.program_learning_outcome_id = ?
        ORDER BY c.code, clo.CLO_ID
      `;

      const [rows] = await this.db.execute(query, [ploId]);
      return rows;
    } catch (error) {
      throw new Error(`Error in getMappedCLOs: ${error.message}`);
    }
  }

  /**
   * Get all PEOs mapped to a specific PLO
   * @param {number} ploId - The PLO ID
   * @returns {Promise<Array>} Array of mapped PEOs with mapping details
   */
  async getMappedPEOs(ploId) {
    try {
      const query = `
        SELECT 
          peo.id as peo_id,
          peo.PEO_ID,
          peo.PEO_Description,
          peo.degree_id,
          mapping.id as mapping_id,
          mapping.correlation_level,
          mapping.created_at as mapped_at
        FROM peo_plo_mapping mapping
        INNER JOIN program_educational_objectives peo ON mapping.peo_id = peo.id
        WHERE mapping.plo_id = ?
        ORDER BY peo.PEO_ID
      `;

      const [rows] = await this.db.execute(query, [ploId]);
      return rows;
    } catch (error) {
      throw new Error(`Error in getMappedPEOs: ${error.message}`);
    }
  }

  /**
   * Get attainment data for a specific PLO
   * @param {number} ploId - The PLO ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} PLO attainment data
   */
  async getAttainment(ploId, options = {}) {
    try {
      const {
        academicSessionId = null,
        degreeId = null
      } = options;

      // Get PLO basic info
      const plo = await this.findById(ploId);
      if (!plo) {
        throw new Error('PLO not found');
      }

      // Get attainment data aggregated from mapped CLOs
      let query = `
        SELECT 
          plo.id as plo_id,
          plo.PLO_No,
          plo.PLO_Description,
          plo.target_attainment,
          COUNT(DISTINCT mapping.course_learning_outcome_id) as total_mapped_clos,
          COUNT(DISTINCT clo.course_id) as total_courses,
          AVG(clo_att.average_attainment) as average_attainment,
          MIN(clo_att.min_attainment) as min_attainment,
          MAX(clo_att.max_attainment) as max_attainment,
          SUM(CASE WHEN clo_att.average_attainment >= plo.target_attainment THEN 1 ELSE 0 END) as clos_meeting_target
        FROM program_learning_outcomes plo
        LEFT JOIN course_learning_outcome_program_learning_outcome mapping 
          ON plo.id = mapping.program_learning_outcome_id
        LEFT JOIN course_learning_outcomes clo 
          ON mapping.course_learning_outcome_id = clo.id
        LEFT JOIN (
          SELECT 
            ca.clo_id,
            AVG(ca.actual_attainment) as average_attainment,
            MIN(ca.actual_attainment) as min_attainment,
            MAX(ca.actual_attainment) as max_attainment
          FROM clo_assessments ca
          LEFT JOIN course_offerings co ON ca.course_offering_id = co.id
          WHERE 1=1
      `;

      const params = [ploId];

      // Add academic session filter if provided
      if (academicSessionId) {
        query += ` AND co.academic_session_id = ?`;
        params.push(academicSessionId);
      }

      query += `
          GROUP BY ca.clo_id
        ) clo_att ON clo.id = clo_att.clo_id
        WHERE plo.id = ?
        GROUP BY plo.id, plo.PLO_No, plo.PLO_Description, plo.target_attainment
      `;

      // Add the PLO ID again for the final WHERE clause
      params.push(ploId);

      const [rows] = await this.db.execute(query, params);

      if (rows.length === 0) {
        return {
          ...plo,
          total_mapped_clos: 0,
          total_courses: 0,
          average_attainment: null,
          min_attainment: null,
          max_attainment: null,
          clos_meeting_target: 0,
          attainment_percentage: 0,
          meets_target: false
        };
      }

      const attainmentData = rows[0];
      const attainmentPercentage = attainmentData.average_attainment || 0;
      const meetsTarget = attainmentPercentage >= plo.target_attainment;

      return {
        ...plo,
        ...attainmentData,
        attainment_percentage: attainmentPercentage,
        meets_target: meetsTarget
      };
    } catch (error) {
      throw new Error(`Error in getAttainment: ${error.message}`);
    }
  }

  /**
   * Map a PLO to a PEO
   * @param {number} ploId - The PLO ID
   * @param {number} peoId - The PEO ID
   * @param {string} correlationLevel - Correlation level (High, Medium, Low)
   * @returns {Promise<Object>} Created mapping
   */
  async mapToPEO(ploId, peoId, correlationLevel = 'Medium') {
    try {
      // Validate correlation level
      const validLevels = ['High', 'Medium', 'Low'];
      if (!validLevels.includes(correlationLevel)) {
        throw new Error(`Invalid correlation level. Must be one of: ${validLevels.join(', ')}`);
      }

      // Check if PLO exists
      const plo = await this.findById(ploId);
      if (!plo) {
        throw new Error('PLO not found');
      }

      // Check if mapping already exists
      const existingMapping = await this.db.execute(
        'SELECT id FROM peo_plo_mapping WHERE peo_id = ? AND plo_id = ?',
        [peoId, ploId]
      );

      if (existingMapping[0].length > 0) {
        // Update existing mapping
        const [result] = await this.db.execute(
          'UPDATE peo_plo_mapping SET correlation_level = ?, updated_at = NOW() WHERE peo_id = ? AND plo_id = ?',
          [correlationLevel, peoId, ploId]
        );

        return {
          id: existingMapping[0][0].id,
          peo_id: peoId,
          plo_id: ploId,
          correlation_level: correlationLevel,
          updated: true
        };
      }

      // Create new mapping
      const [result] = await this.db.execute(
        'INSERT INTO peo_plo_mapping (peo_id, plo_id, correlation_level) VALUES (?, ?, ?)',
        [peoId, ploId, correlationLevel]
      );

      return {
        id: result.insertId,
        peo_id: peoId,
        plo_id: ploId,
        correlation_level: correlationLevel,
        created: true
      };
    } catch (error) {
      throw new Error(`Error in mapToPEO: ${error.message}`);
    }
  }

  /**
   * Remove a PLO-PEO mapping
   * @param {number} ploId - The PLO ID
   * @param {number} peoId - The PEO ID
   * @returns {Promise<Object>} Result of deletion
   */
  async unmapFromPEO(ploId, peoId) {
    try {
      const [result] = await this.db.execute(
        'DELETE FROM peo_plo_mapping WHERE peo_id = ? AND plo_id = ?',
        [peoId, ploId]
      );

      return {
        affectedRows: result.affectedRows,
        deleted: result.affectedRows > 0
      };
    } catch (error) {
      throw new Error(`Error in unmapFromPEO: ${error.message}`);
    }
  }

  /**
   * Get attainment summary for all PLOs of a degree
   * @param {number} degreeId - The degree ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of PLOs with attainment data
   */
  async getDegreeAttainmentSummary(degreeId, options = {}) {
    try {
      const { academicSessionId = null } = options;

      const plos = await this.getByDegree(degreeId, {
        includeBloomLevel: true,
        includePEOMappings: false,
        includeCLOMappings: false
      });

      // Get attainment data for each PLO
      const attainmentPromises = plos.map(plo => 
        this.getAttainment(plo.id, { academicSessionId, degreeId })
      );

      const attainmentResults = await Promise.all(attainmentPromises);

      return attainmentResults;
    } catch (error) {
      throw new Error(`Error in getDegreeAttainmentSummary: ${error.message}`);
    }
  }
}

module.exports = ProgramLearningOutcome;
