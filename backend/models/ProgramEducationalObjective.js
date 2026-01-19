const BaseModel = require('./BaseModel');

/**
 * Program Educational Objective Model
 * Handles PEO CRUD operations and PLO mappings
 */
class ProgramEducationalObjective extends BaseModel {
  constructor() {
    super('program_educational_objectives');
  }

  /**
   * Get all PEOs for a specific degree/program
   * @param {number} degreeId - The degree ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of PEOs for the degree
   */
  async getByDegree(degreeId, options = {}) {
    try {
      const {
        includePLOMappings = false,
        orderBy = 'PEO_No',
        order = 'ASC'
      } = options;

      const query = `
        SELECT 
          peo.id,
          peo.degree_id,
          peo.PEO_No,
          peo.PEO_Description,
          peo.created_at,
          peo.updated_at,
          d.id as degree_id_ref,
          d.degree_name,
          d.degree_level
        FROM ${this.tableName} peo
        LEFT JOIN degrees d ON peo.degree_id = d.id
        WHERE peo.degree_id = ?
        ORDER BY peo.${orderBy} ${order}
      `;

      const [rows] = await this.db.execute(query, [degreeId]);

      // Get PLO mappings if requested
      if (rows.length > 0 && includePLOMappings) {
        for (let peo of rows) {
          peo.plo_mappings = await this.getMappedPLOs(peo.id);
        }
      }

      return rows;
    } catch (error) {
      throw new Error(`Error in getByDegree: ${error.message}`);
    }
  }

  /**
   * Get all PLOs mapped to a specific PEO
   * @param {number} peoId - The PEO ID
   * @returns {Promise<Array>} Array of mapped PLOs with mapping details
   */
  async getMappedPLOs(peoId) {
    try {
      const query = `
        SELECT 
          plo.id as plo_id,
          plo.degree_id,
          plo.programName,
          plo.PLO_No,
          plo.PLO_Description,
          plo.bloom_taxonomy_level_id,
          plo.target_attainment,
          plo.created_at as plo_created_at,
          plo.updated_at as plo_updated_at,
          mapping.id as mapping_id,
          mapping.correlation_level,
          mapping.created_at as mapping_created_at,
          btl.level_number as bloom_level_number,
          btl.level_name as bloom_level_name
        FROM peo_plo_mapping mapping
        INNER JOIN program_learning_outcomes plo ON mapping.plo_id = plo.id
        LEFT JOIN bloom_taxonomy_levels btl ON plo.bloom_taxonomy_level_id = btl.id
        WHERE mapping.peo_id = ?
        ORDER BY plo.PLO_No ASC
      `;

      const [rows] = await this.db.execute(query, [peoId]);
      return rows;
    } catch (error) {
      throw new Error(`Error in getMappedPLOs: ${error.message}`);
    }
  }

  /**
   * Create mapping between PEO and PLO
   * @param {number} peoId - The PEO ID
   * @param {number} ploId - The PLO ID
   * @param {string} correlationLevel - Correlation level (High, Medium, Low)
   * @returns {Promise<Object>} Created mapping
   */
  async mapToPLO(peoId, ploId, correlationLevel = 'Medium') {
    try {
      const query = `
        INSERT INTO peo_plo_mapping (peo_id, plo_id, correlation_level)
        VALUES (?, ?, ?)
      `;

      const [result] = await this.db.execute(query, [peoId, ploId, correlationLevel]);

      return {
        id: result.insertId,
        peo_id: peoId,
        plo_id: ploId,
        correlation_level: correlationLevel
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('This PEO-PLO mapping already exists');
      }
      throw new Error(`Error in mapToPLO: ${error.message}`);
    }
  }

  /**
   * Update mapping between PEO and PLO
   * @param {number} mappingId - The mapping ID
   * @param {string} correlationLevel - New correlation level
   * @returns {Promise<Object>} Updated mapping
   */
  async updateMapping(mappingId, correlationLevel) {
    try {
      const query = `
        UPDATE peo_plo_mapping
        SET correlation_level = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await this.db.execute(query, [correlationLevel, mappingId]);

      return {
        id: mappingId,
        correlation_level: correlationLevel
      };
    } catch (error) {
      throw new Error(`Error in updateMapping: ${error.message}`);
    }
  }

  /**
   * Remove mapping between PEO and PLO
   * @param {number} peoId - The PEO ID
   * @param {number} ploId - The PLO ID
   * @returns {Promise<boolean>} Success status
   */
  async unmapFromPLO(peoId, ploId) {
    try {
      const query = `
        DELETE FROM peo_plo_mapping
        WHERE peo_id = ? AND plo_id = ?
      `;

      const [result] = await this.db.execute(query, [peoId, ploId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error in unmapFromPLO: ${error.message}`);
    }
  }

  /**
   * Remove all PLO mappings for a PEO
   * @param {number} peoId - The PEO ID
   * @returns {Promise<number>} Number of mappings removed
   */
  async removeAllPLOMappings(peoId) {
    try {
      const query = `
        DELETE FROM peo_plo_mapping
        WHERE peo_id = ?
      `;

      const [result] = await this.db.execute(query, [peoId]);
      return result.affectedRows;
    } catch (error) {
      throw new Error(`Error in removeAllPLOMappings: ${error.message}`);
    }
  }

  /**
   * Bulk map PEO to multiple PLOs
   * @param {number} peoId - The PEO ID
   * @param {Array} ploMappings - Array of {plo_id, correlation_level}
   * @returns {Promise<Array>} Created mappings
   */
  async bulkMapToPLOs(peoId, ploMappings) {
    try {
      const values = ploMappings.map(mapping => 
        `(${peoId}, ${mapping.plo_id}, '${mapping.correlation_level || 'Medium'}')`
      ).join(', ');

      const query = `
        INSERT INTO peo_plo_mapping (peo_id, plo_id, correlation_level)
        VALUES ${values}
        ON DUPLICATE KEY UPDATE 
          correlation_level = VALUES(correlation_level),
          updated_at = CURRENT_TIMESTAMP
      `;

      await this.db.execute(query);

      // Return the created/updated mappings
      return await this.getMappedPLOs(peoId);
    } catch (error) {
      throw new Error(`Error in bulkMapToPLOs: ${error.message}`);
    }
  }

  /**
   * Get PEO statistics for a degree
   * @param {number} degreeId - The degree ID
   * @returns {Promise<Object>} Statistics object
   */
  async getStatsByDegree(degreeId) {
    try {
      const query = `
        SELECT 
          COUNT(DISTINCT peo.id) as total_peos,
          COUNT(DISTINCT mapping.plo_id) as mapped_plos,
          COUNT(mapping.id) as total_mappings,
          SUM(CASE WHEN mapping.correlation_level = 'High' THEN 1 ELSE 0 END) as high_correlations,
          SUM(CASE WHEN mapping.correlation_level = 'Medium' THEN 1 ELSE 0 END) as medium_correlations,
          SUM(CASE WHEN mapping.correlation_level = 'Low' THEN 1 ELSE 0 END) as low_correlations
        FROM ${this.tableName} peo
        LEFT JOIN peo_plo_mapping mapping ON peo.id = mapping.peo_id
        WHERE peo.degree_id = ?
      `;

      const [rows] = await this.db.execute(query, [degreeId]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error in getStatsByDegree: ${error.message}`);
    }
  }
}

module.exports = ProgramEducationalObjective;
