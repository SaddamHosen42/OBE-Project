const db = require('../config/database');

/**
 * Base Model class providing common CRUD operations for all models
 * @class BaseModel
 */
class BaseModel {
  /**
   * Constructor for BaseModel
   * @param {string} tableName - The name of the database table
   */
  constructor(tableName) {
    if (!tableName) {
      throw new Error('Table name is required');
    }
    this.tableName = tableName;
    this.db = db;
  }

  /**
   * Find all records from the table
   * @param {Object} options - Query options
   * @param {Array<string>} options.columns - Columns to select (default: ['*'])
   * @param {string} options.orderBy - Column to order by
   * @param {string} options.order - Order direction ('ASC' or 'DESC')
   * @param {number} options.limit - Limit number of results
   * @param {number} options.offset - Offset for pagination
   * @returns {Promise<Array>} Array of records
   */
  async findAll(options = {}) {
    try {
      const {
        columns = ['*'],
        orderBy = null,
        order = 'ASC',
        limit = null,
        offset = null
      } = options;

      let query = `SELECT ${columns.join(', ')} FROM ${this.tableName}`;
      const params = [];

      if (orderBy) {
        query += ` ORDER BY ${orderBy} ${order}`;
      }

      if (limit) {
        query += ` LIMIT ?`;
        params.push(limit);
      }

      if (offset) {
        query += ` OFFSET ?`;
        params.push(offset);
      }

      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error in findAll: ${error.message}`);
    }
  }

  /**
   * Find a single record by ID
   * @param {number|string} id - The ID of the record
   * @param {string} idColumn - The name of the ID column (default: 'id')
   * @returns {Promise<Object|null>} The found record or null
   */
  async findById(id, idColumn = 'id') {
    try {
      const query = `SELECT * FROM ${this.tableName} WHERE ${idColumn} = ?`;
      const [rows] = await this.db.execute(query, [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error(`Error in findById: ${error.message}`);
    }
  }

  /**
   * Find records matching specific conditions
   * @param {Object} conditions - Key-value pairs for WHERE conditions
   * @param {Object} options - Query options
   * @param {Array<string>} options.columns - Columns to select (default: ['*'])
   * @param {string} options.orderBy - Column to order by
   * @param {string} options.order - Order direction ('ASC' or 'DESC')
   * @param {number} options.limit - Limit number of results
   * @param {number} options.offset - Offset for pagination
   * @param {string} options.operator - Comparison operator (default: '=')
   * @returns {Promise<Array>} Array of matching records
   */
  async findWhere(conditions = {}, options = {}) {
    try {
      const {
        columns = ['*'],
        orderBy = null,
        order = 'ASC',
        limit = null,
        offset = null,
        operator = '='
      } = options;

      const conditionKeys = Object.keys(conditions);
      
      if (conditionKeys.length === 0) {
        return this.findAll(options);
      }

      const whereClause = conditionKeys.map(key => `${key} ${operator} ?`).join(' AND ');
      const params = Object.values(conditions);

      let query = `SELECT ${columns.join(', ')} FROM ${this.tableName} WHERE ${whereClause}`;

      if (orderBy) {
        query += ` ORDER BY ${orderBy} ${order}`;
      }

      if (limit) {
        query += ` LIMIT ?`;
        params.push(limit);
      }

      if (offset) {
        query += ` OFFSET ?`;
        params.push(offset);
      }

      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error in findWhere: ${error.message}`);
    }
  }

  /**
   * Create a new record
   * @param {Object} data - Data to insert
   * @returns {Promise<Object>} Object containing insertId and affectedRows
   */
  async create(data) {
    try {
      if (!data || Object.keys(data).length === 0) {
        throw new Error('Data is required for create operation');
      }

      const columns = Object.keys(data);
      const values = Object.values(data);
      const placeholders = columns.map(() => '?').join(', ');

      const query = `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
      const [result] = await this.db.execute(query, values);

      return {
        insertId: result.insertId,
        affectedRows: result.affectedRows
      };
    } catch (error) {
      throw new Error(`Error in create: ${error.message}`);
    }
  }

  /**
   * Update records matching specific conditions
   * @param {Object} data - Data to update
   * @param {Object} conditions - Key-value pairs for WHERE conditions
   * @returns {Promise<Object>} Object containing affectedRows and changedRows
   */
  async update(data, conditions) {
    try {
      if (!data || Object.keys(data).length === 0) {
        throw new Error('Data is required for update operation');
      }

      if (!conditions || Object.keys(conditions).length === 0) {
        throw new Error('Conditions are required for update operation');
      }

      const dataKeys = Object.keys(data);
      const conditionKeys = Object.keys(conditions);

      const setClause = dataKeys.map(key => `${key} = ?`).join(', ');
      const whereClause = conditionKeys.map(key => `${key} = ?`).join(' AND ');

      const params = [...Object.values(data), ...Object.values(conditions)];

      const query = `UPDATE ${this.tableName} SET ${setClause} WHERE ${whereClause}`;
      const [result] = await this.db.execute(query, params);

      return {
        affectedRows: result.affectedRows,
        changedRows: result.changedRows
      };
    } catch (error) {
      throw new Error(`Error in update: ${error.message}`);
    }
  }

  /**
   * Delete records matching specific conditions
   * @param {Object} conditions - Key-value pairs for WHERE conditions
   * @returns {Promise<Object>} Object containing affectedRows
   */
  async delete(conditions) {
    try {
      if (!conditions || Object.keys(conditions).length === 0) {
        throw new Error('Conditions are required for delete operation');
      }

      const conditionKeys = Object.keys(conditions);
      const whereClause = conditionKeys.map(key => `${key} = ?`).join(' AND ');
      const params = Object.values(conditions);

      const query = `DELETE FROM ${this.tableName} WHERE ${whereClause}`;
      const [result] = await this.db.execute(query, params);

      return {
        affectedRows: result.affectedRows
      };
    } catch (error) {
      throw new Error(`Error in delete: ${error.message}`);
    }
  }

  /**
   * Count total records in the table
   * @param {Object} conditions - Optional WHERE conditions
   * @returns {Promise<number>} Total count
   */
  async count(conditions = {}) {
    try {
      const conditionKeys = Object.keys(conditions);
      let query = `SELECT COUNT(*) as total FROM ${this.tableName}`;
      const params = [];

      if (conditionKeys.length > 0) {
        const whereClause = conditionKeys.map(key => `${key} = ?`).join(' AND ');
        query += ` WHERE ${whereClause}`;
        params.push(...Object.values(conditions));
      }

      const [rows] = await this.db.execute(query, params);
      return rows[0].total;
    } catch (error) {
      throw new Error(`Error in count: ${error.message}`);
    }
  }

  /**
   * Execute a raw SQL query
   * @param {string} query - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>} Query results
   */
  async executeQuery(query, params = []) {
    try {
      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error in executeQuery: ${error.message}`);
    }
  }

  /**
   * Check if a record exists
   * @param {Object} conditions - Key-value pairs for WHERE conditions
   * @returns {Promise<boolean>} True if record exists, false otherwise
   */
  async exists(conditions) {
    try {
      const count = await this.count(conditions);
      return count > 0;
    } catch (error) {
      throw new Error(`Error in exists: ${error.message}`);
    }
  }
}

module.exports = BaseModel;
