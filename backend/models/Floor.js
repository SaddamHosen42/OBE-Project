const BaseModel = require('./BaseModel');

/**
 * Floor Model for managing floor information
 * Handles floor CRUD operations and relationships with buildings and rooms
 */
class Floor extends BaseModel {
  constructor() {
    super('floors');
  }

  /**
   * Get all floors belonging to a specific building
   * @param {number} buildingId - Building ID
   * @returns {Promise<Array>} Array of floor objects
   */
  async getByBuilding(buildingId) {
    try {
      const query = `
        SELECT 
          f.id,
          f.building_id,
          f.name,
          f.floor_number,
          f.created_at,
          f.updated_at,
          b.name as building_name,
          b.code as building_code
        FROM ${this.tableName} f
        INNER JOIN buildings b ON f.building_id = b.id
        WHERE f.building_id = ?
        ORDER BY f.floor_number ASC
      `;

      const [rows] = await this.db.execute(query, [buildingId]);
      return rows;
    } catch (error) {
      console.error('Error in getByBuilding:', error);
      throw error;
    }
  }

  /**
   * Get all floors with their room count
   * @returns {Promise<Array>} Array of floor objects with room count
   */
  async getWithRoomCount() {
    try {
      const query = `
        SELECT 
          f.id,
          f.building_id,
          f.name,
          f.floor_number,
          f.created_at,
          f.updated_at,
          b.name as building_name,
          b.code as building_code,
          COUNT(DISTINCT r.id) as room_count
        FROM ${this.tableName} f
        INNER JOIN buildings b ON f.building_id = b.id
        LEFT JOIN rooms r ON f.id = r.floor_id
        GROUP BY f.id, f.building_id, f.name, f.floor_number, f.created_at, f.updated_at, b.name, b.code
        ORDER BY b.name ASC, f.floor_number ASC
      `;

      const [rows] = await this.db.execute(query);
      return rows;
    } catch (error) {
      console.error('Error in getWithRoomCount:', error);
      throw error;
    }
  }

  /**
   * Get a floor with its rooms
   * @param {number} floorId - Floor ID
   * @returns {Promise<Object|null>} Floor object with rooms or null if not found
   */
  async getFloorWithRooms(floorId) {
    try {
      const query = `
        SELECT 
          f.id,
          f.building_id,
          f.name,
          f.floor_number,
          f.created_at,
          f.updated_at,
          b.name as building_name,
          b.code as building_code,
          r.id as room_id,
          r.room_number,
          r.room_type,
          r.capacity,
          r.has_projector,
          r.has_ac,
          r.is_available
        FROM ${this.tableName} f
        INNER JOIN buildings b ON f.building_id = b.id
        LEFT JOIN rooms r ON f.id = r.floor_id
        WHERE f.id = ?
        ORDER BY r.room_number ASC
      `;

      const [rows] = await this.db.execute(query, [floorId]);
      
      if (rows.length === 0) {
        return null;
      }
      
      const floor = {
        id: rows[0].id,
        building_id: rows[0].building_id,
        name: rows[0].name,
        floor_number: rows[0].floor_number,
        created_at: rows[0].created_at,
        updated_at: rows[0].updated_at,
        building_name: rows[0].building_name,
        building_code: rows[0].building_code,
        rooms: []
      };
      
      rows.forEach(row => {
        if (row.room_id) {
          floor.rooms.push({
            id: row.room_id,
            room_number: row.room_number,
            room_type: row.room_type,
            capacity: row.capacity,
            has_projector: row.has_projector,
            has_ac: row.has_ac,
            is_available: row.is_available
          });
        }
      });
      
      return floor;
    } catch (error) {
      console.error('Error in getFloorWithRooms:', error);
      throw error;
    }
  }

  /**
   * Check if a floor number exists in a building (for validation during create/update)
   * @param {number} buildingId - Building ID
   * @param {number} floorNumber - Floor number
   * @param {number} excludeId - Floor ID to exclude from check (for updates)
   * @returns {Promise<boolean>} True if floor number exists in building, false otherwise
   */
  async floorNumberExists(buildingId, floorNumber, excludeId = null) {
    try {
      let query = `
        SELECT COUNT(*) as count FROM ${this.tableName}
        WHERE building_id = ? AND floor_number = ?
      `;
      const params = [buildingId, floorNumber];

      if (excludeId) {
        query += ` AND id != ?`;
        params.push(excludeId);
      }

      const [rows] = await this.db.execute(query, params);
      return rows[0].count > 0;
    } catch (error) {
      console.error('Error in floorNumberExists:', error);
      throw error;
    }
  }

  /**
   * Get total room capacity for a floor
   * @param {number} floorId - Floor ID
   * @returns {Promise<Object>} Object with total capacity and room count
   */
  async getFloorCapacity(floorId) {
    try {
      const query = `
        SELECT 
          COUNT(r.id) as total_rooms,
          SUM(r.capacity) as total_capacity,
          COUNT(CASE WHEN r.is_available = 1 THEN 1 END) as available_rooms
        FROM ${this.tableName} f
        LEFT JOIN rooms r ON f.id = r.floor_id
        WHERE f.id = ?
      `;

      const [rows] = await this.db.execute(query, [floorId]);
      return rows[0];
    } catch (error) {
      console.error('Error in getFloorCapacity:', error);
      throw error;
    }
  }

  /**
   * Get count of floors in a building
   * @param {number} buildingId - Building ID
   * @returns {Promise<number>} Count of floors
   */
  async countByBuilding(buildingId) {
    try {
      const query = `
        SELECT COUNT(*) as count FROM ${this.tableName}
        WHERE building_id = ?
      `;

      const [rows] = await this.db.execute(query, [buildingId]);
      return rows[0].count;
    } catch (error) {
      console.error('Error in countByBuilding:', error);
      throw error;
    }
  }

  /**
   * Search floors by name or floor number
   * @param {string} searchTerm - Search term
   * @param {number} buildingId - Optional building ID to filter by
   * @returns {Promise<Array>} Array of matching floors
   */
  async search(searchTerm, buildingId = null) {
    try {
      let query = `
        SELECT 
          f.*,
          b.name as building_name,
          b.code as building_code,
          COUNT(DISTINCT r.id) as room_count
        FROM ${this.tableName} f
        INNER JOIN buildings b ON f.building_id = b.id
        LEFT JOIN rooms r ON f.id = r.floor_id
        WHERE (f.name LIKE ? OR f.floor_number LIKE ?)
      `;
      
      const params = [`%${searchTerm}%`, `%${searchTerm}%`];
      
      if (buildingId) {
        query += ` AND f.building_id = ?`;
        params.push(buildingId);
      }
      
      query += ` GROUP BY f.id ORDER BY b.name ASC, f.floor_number ASC`;

      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error in search:', error);
      throw error;
    }
  }
}

module.exports = Floor;
