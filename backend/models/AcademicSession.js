const BaseModel = require('./BaseModel');

/**
 * Academic Session Model for managing academic year information
 * Handles academic session CRUD operations and relationships with semesters
 */
class AcademicSession extends BaseModel {
  constructor() {
    super('academic_sessions');
  }

  /**
   * Get the currently active academic session
   * @returns {Promise<Object|null>} Active academic session or null if none is active
   */
  async getActive() {
    try {
      const query = `
        SELECT 
          id,
          session_name,
          start_date,
          end_date,
          is_active,
          created_at,
          updated_at
        FROM ${this.tableName}
        WHERE is_active = TRUE
        LIMIT 1
      `;

      const [rows] = await this.db.execute(query);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error in getActive:', error);
      throw error;
    }
  }

  /**
   * Get all academic sessions with their associated semesters
   * @returns {Promise<Array>} Array of academic session objects with semesters
   */
  async getWithSemesters() {
    try {
      const query = `
        SELECT 
          acs.id,
          acs.session_name,
          acs.start_date,
          acs.end_date,
          acs.is_active,
          acs.created_at,
          acs.updated_at,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', sem.id,
              'name', sem.name,
              'semester_number', sem.semester_number,
              'start_date', sem.start_date,
              'end_date', sem.end_date,
              'is_active', sem.is_active,
              'created_at', sem.created_at,
              'updated_at', sem.updated_at
            )
          ) as semesters
        FROM ${this.tableName} acs
        LEFT JOIN semesters sem ON acs.id = sem.academic_session_id
        GROUP BY acs.id, acs.session_name, acs.start_date, acs.end_date, 
                 acs.is_active, acs.created_at, acs.updated_at
        ORDER BY acs.start_date DESC
      `;

      const [rows] = await this.db.execute(query);
      
      // Parse the JSON semesters field and filter out null entries
      return rows.map(row => ({
        ...row,
        semesters: row.semesters ? JSON.parse(row.semesters).filter(semester => semester.id !== null) : []
      }));
    } catch (error) {
      console.error('Error in getWithSemesters:', error);
      throw error;
    }
  }

  /**
   * Get academic session by ID with its semesters
   * @param {number} id - Academic Session ID
   * @returns {Promise<Object|null>} Academic session object with semesters or null if not found
   */
  async findByIdWithSemesters(id) {
    try {
      const query = `
        SELECT 
          acs.id,
          acs.session_name,
          acs.start_date,
          acs.end_date,
          acs.is_active,
          acs.created_at,
          acs.updated_at,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', sem.id,
              'name', sem.name,
              'semester_number', sem.semester_number,
              'start_date', sem.start_date,
              'end_date', sem.end_date,
              'is_active', sem.is_active,
              'created_at', sem.created_at,
              'updated_at', sem.updated_at
            )
          ) as semesters
        FROM ${this.tableName} acs
        LEFT JOIN semesters sem ON acs.id = sem.academic_session_id
        WHERE acs.id = ?
        GROUP BY acs.id, acs.session_name, acs.start_date, acs.end_date, 
                 acs.is_active, acs.created_at, acs.updated_at
      `;

      const [rows] = await this.db.execute(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }

      const session = rows[0];
      return {
        ...session,
        semesters: session.semesters ? JSON.parse(session.semesters).filter(semester => semester.id !== null) : []
      };
    } catch (error) {
      console.error('Error in findByIdWithSemesters:', error);
      throw error;
    }
  }

  /**
   * Find academic session by session name
   * @param {string} sessionName - Session name (e.g., "2024-2025")
   * @returns {Promise<Object|null>} Academic session object or null if not found
   */
  async findByName(sessionName) {
    try {
      const query = `
        SELECT 
          id,
          session_name,
          start_date,
          end_date,
          is_active,
          created_at,
          updated_at
        FROM ${this.tableName}
        WHERE session_name = ?
      `;

      const [rows] = await this.db.execute(query, [sessionName]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error in findByName:', error);
      throw error;
    }
  }

  /**
   * Check if session name already exists
   * @param {string} sessionName - Session name to check
   * @param {number} excludeId - ID to exclude from check (for updates)
   * @returns {Promise<boolean>} True if name exists, false otherwise
   */
  async nameExists(sessionName, excludeId = null) {
    try {
      let query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE session_name = ?`;
      const params = [sessionName];

      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }

      const [rows] = await this.db.execute(query, params);
      return rows[0].count > 0;
    } catch (error) {
      console.error('Error in nameExists:', error);
      throw error;
    }
  }

  /**
   * Set a session as active (deactivates all other sessions)
   * @param {number} id - Academic Session ID to activate
   * @returns {Promise<boolean>} True if successful
   */
  async setActive(id) {
    try {
      // Start transaction
      await this.db.query('START TRANSACTION');

      // Deactivate all sessions
      await this.db.execute(`UPDATE ${this.tableName} SET is_active = FALSE`);

      // Activate the specified session
      await this.db.execute(
        `UPDATE ${this.tableName} SET is_active = TRUE WHERE id = ?`,
        [id]
      );

      // Commit transaction
      await this.db.query('COMMIT');

      return true;
    } catch (error) {
      // Rollback on error
      await this.db.query('ROLLBACK');
      console.error('Error in setActive:', error);
      throw error;
    }
  }

  /**
   * Get all academic sessions ordered by date
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of academic session objects
   */
  async getAllOrdered(options = {}) {
    try {
      const {
        orderBy = 'start_date',
        order = 'DESC',
        limit = null,
        offset = null
      } = options;

      let query = `
        SELECT 
          id,
          session_name,
          start_date,
          end_date,
          is_active,
          created_at,
          updated_at
        FROM ${this.tableName}
        ORDER BY ${orderBy} ${order}
      `;

      const params = [];

      if (limit) {
        query += ' LIMIT ?';
        params.push(limit);
      }

      if (offset) {
        query += ' OFFSET ?';
        params.push(offset);
      }

      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error in getAllOrdered:', error);
      throw error;
    }
  }

  /**
   * Get academic sessions within a date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Array>} Array of academic sessions within the date range
   */
  async getByDateRange(startDate, endDate) {
    try {
      const query = `
        SELECT 
          id,
          session_name,
          start_date,
          end_date,
          is_active,
          created_at,
          updated_at
        FROM ${this.tableName}
        WHERE (start_date BETWEEN ? AND ?) OR (end_date BETWEEN ? AND ?)
        ORDER BY start_date ASC
      `;

      const [rows] = await this.db.execute(query, [startDate, endDate, startDate, endDate]);
      return rows;
    } catch (error) {
      console.error('Error in getByDateRange:', error);
      throw error;
    }
  }

  /**
   * Search academic sessions by name
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of matching academic sessions
   */
  async search(searchTerm) {
    try {
      const query = `
        SELECT 
          id,
          session_name,
          start_date,
          end_date,
          is_active,
          created_at,
          updated_at
        FROM ${this.tableName}
        WHERE session_name LIKE ?
        ORDER BY start_date DESC
      `;

      const searchPattern = `%${searchTerm}%`;
      const [rows] = await this.db.execute(query, [searchPattern]);
      return rows;
    } catch (error) {
      console.error('Error in search:', error);
      throw error;
    }
  }

  /**
   * Get semester count for an academic session
   * @param {number} sessionId - Academic Session ID
   * @returns {Promise<number>} Count of semesters
   */
  async getSemesterCount(sessionId) {
    try {
      const query = `SELECT COUNT(*) as count FROM semesters WHERE academic_session_id = ?`;
      const [rows] = await this.db.execute(query, [sessionId]);
      return rows[0].count;
    } catch (error) {
      console.error('Error in getSemesterCount:', error);
      throw error;
    }
  }
}

module.exports = AcademicSession;
