const BaseModel = require('./BaseModel');

/**
 * Bloom Taxonomy Level Model for managing Bloom's Taxonomy cognitive levels
 * Handles Bloom's Taxonomy level CRUD operations and relationships
 */
class BloomTaxonomyLevel extends BaseModel {
  constructor() {
    super('bloom_taxonomy_levels');
  }

  /**
   * Get all Bloom taxonomy levels ordered by level number
   * @returns {Promise<Array>} Array of Bloom taxonomy levels
   */
  async getAllOrdered() {
    try {
      const query = `
        SELECT 
          id,
          level_number,
          name,
          description,
          keywords,
          created_at,
          updated_at
        FROM ${this.tableName}
        ORDER BY level_number ASC
      `;
      
      const [rows] = await this.db.query(query);
      return rows;
    } catch (error) {
      console.error('Error getting ordered Bloom taxonomy levels:', error);
      throw new Error(`Failed to retrieve Bloom taxonomy levels: ${error.message}`);
    }
  }

  /**
   * Get a Bloom taxonomy level by its level number
   * @param {number} levelNumber - The level number (1-6)
   * @returns {Promise<Object|null>} Bloom taxonomy level or null if not found
   */
  async getByLevelNumber(levelNumber) {
    try {
      const query = `
        SELECT 
          id,
          level_number,
          name,
          description,
          keywords,
          created_at,
          updated_at
        FROM ${this.tableName}
        WHERE level_number = ?
        LIMIT 1
      `;
      
      const [rows] = await this.db.query(query, [levelNumber]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error(`Error getting Bloom taxonomy level by number ${levelNumber}:`, error);
      throw new Error(`Failed to retrieve Bloom taxonomy level: ${error.message}`);
    }
  }

  /**
   * Get a Bloom taxonomy level by its name
   * @param {string} name - The level name (e.g., 'Remember', 'Understand')
   * @returns {Promise<Object|null>} Bloom taxonomy level or null if not found
   */
  async getByName(name) {
    try {
      const query = `
        SELECT 
          id,
          level_number,
          name,
          description,
          keywords,
          created_at,
          updated_at
        FROM ${this.tableName}
        WHERE name = ?
        LIMIT 1
      `;
      
      const [rows] = await this.db.query(query, [name]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error(`Error getting Bloom taxonomy level by name ${name}:`, error);
      throw new Error(`Failed to retrieve Bloom taxonomy level: ${error.message}`);
    }
  }

  /**
   * Get Bloom taxonomy levels within a range
   * @param {number} startLevel - Start level number (1-6)
   * @param {number} endLevel - End level number (1-6)
   * @returns {Promise<Array>} Array of Bloom taxonomy levels within the range
   */
  async getLevelsInRange(startLevel, endLevel) {
    try {
      const query = `
        SELECT 
          id,
          level_number,
          name,
          description,
          keywords,
          created_at,
          updated_at
        FROM ${this.tableName}
        WHERE level_number BETWEEN ? AND ?
        ORDER BY level_number ASC
      `;
      
      const [rows] = await this.db.query(query, [startLevel, endLevel]);
      return rows;
    } catch (error) {
      console.error(`Error getting Bloom taxonomy levels in range ${startLevel}-${endLevel}:`, error);
      throw new Error(`Failed to retrieve Bloom taxonomy levels: ${error.message}`);
    }
  }

  /**
   * Search Bloom taxonomy levels by keyword
   * @param {string} keyword - Keyword to search in name, description, or keywords fields
   * @returns {Promise<Array>} Array of matching Bloom taxonomy levels
   */
  async searchByKeyword(keyword) {
    try {
      const searchTerm = `%${keyword}%`;
      const query = `
        SELECT 
          id,
          level_number,
          name,
          description,
          keywords,
          created_at,
          updated_at
        FROM ${this.tableName}
        WHERE name LIKE ? 
           OR description LIKE ? 
           OR keywords LIKE ?
        ORDER BY level_number ASC
      `;
      
      const [rows] = await this.db.query(query, [searchTerm, searchTerm, searchTerm]);
      return rows;
    } catch (error) {
      console.error(`Error searching Bloom taxonomy levels by keyword ${keyword}:`, error);
      throw new Error(`Failed to search Bloom taxonomy levels: ${error.message}`);
    }
  }

  /**
   * Count total number of Bloom taxonomy levels
   * @returns {Promise<number>} Count of levels
   */
  async countLevels() {
    try {
      const query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
      const [rows] = await this.db.query(query);
      return rows[0].count;
    } catch (error) {
      console.error('Error counting Bloom taxonomy levels:', error);
      throw new Error(`Failed to count Bloom taxonomy levels: ${error.message}`);
    }
  }

  /**
   * Validate if a level number is valid (1-6)
   * @param {number} levelNumber - The level number to validate
   * @returns {boolean} True if valid, false otherwise
   */
  isValidLevelNumber(levelNumber) {
    return Number.isInteger(levelNumber) && levelNumber >= 1 && levelNumber <= 6;
  }

  /**
   * Get keywords array from keywords string
   * @param {string} keywordsString - Comma-separated keywords string
   * @returns {Array<string>} Array of keywords
   */
  parseKeywords(keywordsString) {
    if (!keywordsString) return [];
    return keywordsString
      .split(',')
      .map(keyword => keyword.trim())
      .filter(keyword => keyword.length > 0);
  }
}

module.exports = BloomTaxonomyLevel;
