const BaseModel = require('./BaseModel');

/**
 * Room Model for managing room information
 * Handles room CRUD operations and relationships with floors and buildings
 */
class Room extends BaseModel {
  constructor() {
    super('rooms');
  }

  /**
   * Get all rooms belonging to a specific floor
   * @param {number} floorId - Floor ID
   * @returns {Promise<Array>} Array of room objects
   */
  async getByFloor(floorId) {
    try {
      const query = `
        SELECT 
          r.id,
          r.floor_id,
          r.room_number,
          r.room_type,
          r.capacity,
          r.has_projector,
          r.has_ac,
          r.is_available,
          r.created_at,
          r.updated_at,
          f.name as floor_name,
          f.floor_number,
          b.name as building_name,
          b.code as building_code
        FROM ${this.tableName} r
        INNER JOIN floors f ON r.floor_id = f.id
        INNER JOIN buildings b ON f.building_id = b.id
        WHERE r.floor_id = ?
        ORDER BY r.room_number ASC
      `;

      const [rows] = await this.db.execute(query, [floorId]);
      return rows;
    } catch (error) {
      console.error('Error in getByFloor:', error);
      throw error;
    }
  }

  /**
   * Get all rooms belonging to a specific building
   * @param {number} buildingId - Building ID
   * @returns {Promise<Array>} Array of room objects
   */
  async getByBuilding(buildingId) {
    try {
      const query = `
        SELECT 
          r.id,
          r.floor_id,
          r.room_number,
          r.room_type,
          r.capacity,
          r.has_projector,
          r.has_ac,
          r.is_available,
          r.created_at,
          r.updated_at,
          f.name as floor_name,
          f.floor_number,
          b.name as building_name,
          b.code as building_code
        FROM ${this.tableName} r
        INNER JOIN floors f ON r.floor_id = f.id
        INNER JOIN buildings b ON f.building_id = b.id
        WHERE b.id = ?
        ORDER BY f.floor_number ASC, r.room_number ASC
      `;

      const [rows] = await this.db.execute(query, [buildingId]);
      return rows;
    } catch (error) {
      console.error('Error in getByBuilding:', error);
      throw error;
    }
  }

  /**
   * Get all available rooms
   * @param {Object} filters - Optional filters
   * @param {number} filters.minCapacity - Minimum capacity required
   * @param {boolean} filters.hasProjector - Requires projector
   * @param {boolean} filters.hasAC - Requires AC
   * @param {string} filters.roomType - Room type filter
   * @returns {Promise<Array>} Array of available room objects
   */
  async getAvailableRooms(filters = {}) {
    try {
      let query = `
        SELECT 
          r.id,
          r.floor_id,
          r.room_number,
          r.room_type,
          r.capacity,
          r.has_projector,
          r.has_ac,
          r.is_available,
          r.created_at,
          r.updated_at,
          f.name as floor_name,
          f.floor_number,
          b.name as building_name,
          b.code as building_code
        FROM ${this.tableName} r
        INNER JOIN floors f ON r.floor_id = f.id
        INNER JOIN buildings b ON f.building_id = b.id
        WHERE r.is_available = 1
      `;
      
      const params = [];

      if (filters.minCapacity) {
        query += ` AND r.capacity >= ?`;
        params.push(filters.minCapacity);
      }

      if (filters.hasProjector === true || filters.hasProjector === 'true') {
        query += ` AND r.has_projector = 1`;
      }

      if (filters.hasAC === true || filters.hasAC === 'true') {
        query += ` AND r.has_ac = 1`;
      }

      if (filters.roomType) {
        query += ` AND r.room_type = ?`;
        params.push(filters.roomType);
      }

      query += ` ORDER BY b.name ASC, f.floor_number ASC, r.room_number ASC`;

      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error in getAvailableRooms:', error);
      throw error;
    }
  }

  /**
   * Get rooms by type
   * @param {string} roomType - Room type (classroom, lab, office, auditorium, etc.)
   * @returns {Promise<Array>} Array of room objects
   */
  async getByType(roomType) {
    try {
      const query = `
        SELECT 
          r.id,
          r.floor_id,
          r.room_number,
          r.room_type,
          r.capacity,
          r.has_projector,
          r.has_ac,
          r.is_available,
          r.created_at,
          r.updated_at,
          f.name as floor_name,
          f.floor_number,
          b.name as building_name,
          b.code as building_code
        FROM ${this.tableName} r
        INNER JOIN floors f ON r.floor_id = f.id
        INNER JOIN buildings b ON f.building_id = b.id
        WHERE r.room_type = ?
        ORDER BY b.name ASC, f.floor_number ASC, r.room_number ASC
      `;

      const [rows] = await this.db.execute(query, [roomType]);
      return rows;
    } catch (error) {
      console.error('Error in getByType:', error);
      throw error;
    }
  }

  /**
   * Get a room by room number and floor
   * @param {string} roomNumber - Room number
   * @param {number} floorId - Floor ID
   * @returns {Promise<Object|null>} Room object or null if not found
   */
  async findByRoomNumberAndFloor(roomNumber, floorId) {
    try {
      const query = `
        SELECT 
          r.*,
          f.name as floor_name,
          f.floor_number,
          b.name as building_name,
          b.code as building_code
        FROM ${this.tableName} r
        INNER JOIN floors f ON r.floor_id = f.id
        INNER JOIN buildings b ON f.building_id = b.id
        WHERE r.room_number = ? AND r.floor_id = ?
        LIMIT 1
      `;

      const [rows] = await this.db.execute(query, [roomNumber, floorId]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error in findByRoomNumberAndFloor:', error);
      throw error;
    }
  }

  /**
   * Check if room number exists on a floor (for validation during create/update)
   * @param {string} roomNumber - Room number
   * @param {number} floorId - Floor ID
   * @param {number} excludeId - Room ID to exclude from check (for updates)
   * @returns {Promise<boolean>} True if room number exists on floor, false otherwise
   */
  async roomNumberExists(roomNumber, floorId, excludeId = null) {
    try {
      let query = `
        SELECT COUNT(*) as count FROM ${this.tableName}
        WHERE room_number = ? AND floor_id = ?
      `;
      const params = [roomNumber, floorId];

      if (excludeId) {
        query += ` AND id != ?`;
        params.push(excludeId);
      }

      const [rows] = await this.db.execute(query, params);
      return rows[0].count > 0;
    } catch (error) {
      console.error('Error in roomNumberExists:', error);
      throw error;
    }
  }

  /**
   * Get count of rooms by type
   * @returns {Promise<Array>} Array of objects with room type and count
   */
  async countByType() {
    try {
      const query = `
        SELECT 
          room_type,
          COUNT(*) as count,
          SUM(capacity) as total_capacity
        FROM ${this.tableName}
        GROUP BY room_type
        ORDER BY count DESC
      `;

      const [rows] = await this.db.execute(query);
      return rows;
    } catch (error) {
      console.error('Error in countByType:', error);
      throw error;
    }
  }

  /**
   * Get room statistics for a floor
   * @param {number} floorId - Floor ID
   * @returns {Promise<Object>} Object with room statistics
   */
  async getFloorRoomStats(floorId) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_rooms,
          SUM(capacity) as total_capacity,
          COUNT(CASE WHEN is_available = 1 THEN 1 END) as available_rooms,
          COUNT(CASE WHEN has_projector = 1 THEN 1 END) as rooms_with_projector,
          COUNT(CASE WHEN has_ac = 1 THEN 1 END) as rooms_with_ac
        FROM ${this.tableName}
        WHERE floor_id = ?
      `;

      const [rows] = await this.db.execute(query, [floorId]);
      return rows[0];
    } catch (error) {
      console.error('Error in getFloorRoomStats:', error);
      throw error;
    }
  }

  /**
   * Get room statistics for a building
   * @param {number} buildingId - Building ID
   * @returns {Promise<Object>} Object with room statistics
   */
  async getBuildingRoomStats(buildingId) {
    try {
      const query = `
        SELECT 
          COUNT(DISTINCT r.id) as total_rooms,
          SUM(r.capacity) as total_capacity,
          COUNT(DISTINCT CASE WHEN r.is_available = 1 THEN r.id END) as available_rooms,
          COUNT(DISTINCT CASE WHEN r.has_projector = 1 THEN r.id END) as rooms_with_projector,
          COUNT(DISTINCT CASE WHEN r.has_ac = 1 THEN r.id END) as rooms_with_ac
        FROM ${this.tableName} r
        INNER JOIN floors f ON r.floor_id = f.id
        INNER JOIN buildings b ON f.building_id = b.id
        WHERE b.id = ?
      `;

      const [rows] = await this.db.execute(query, [buildingId]);
      return rows[0];
    } catch (error) {
      console.error('Error in getBuildingRoomStats:', error);
      throw error;
    }
  }

  /**
   * Search rooms by room number or type
   * @param {string} searchTerm - Search term
   * @param {number} floorId - Optional floor ID to filter by
   * @param {number} buildingId - Optional building ID to filter by
   * @returns {Promise<Array>} Array of matching rooms
   */
  async search(searchTerm, floorId = null, buildingId = null) {
    try {
      let query = `
        SELECT 
          r.*,
          f.name as floor_name,
          f.floor_number,
          b.name as building_name,
          b.code as building_code
        FROM ${this.tableName} r
        INNER JOIN floors f ON r.floor_id = f.id
        INNER JOIN buildings b ON f.building_id = b.id
        WHERE (r.room_number LIKE ? OR r.room_type LIKE ?)
      `;
      
      const params = [`%${searchTerm}%`, `%${searchTerm}%`];
      
      if (floorId) {
        query += ` AND r.floor_id = ?`;
        params.push(floorId);
      }
      
      if (buildingId) {
        query += ` AND b.id = ?`;
        params.push(buildingId);
      }
      
      query += ` ORDER BY b.name ASC, f.floor_number ASC, r.room_number ASC`;

      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error in search:', error);
      throw error;
    }
  }

  /**
   * Update room availability status
   * @param {number} roomId - Room ID
   * @param {boolean} isAvailable - Availability status
   * @returns {Promise<boolean>} True if successful
   */
  async updateAvailability(roomId, isAvailable) {
    try {
      const query = `
        UPDATE ${this.tableName}
        SET is_available = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      const [result] = await this.db.execute(query, [isAvailable ? 1 : 0, roomId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in updateAvailability:', error);
      throw error;
    }
  }
}

module.exports = Room;
