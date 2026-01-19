const BaseModel = require('./BaseModel');

/**
 * Building Model for managing building/hall information
 * Handles building CRUD operations and relationships with floors and rooms
 */
class Building extends BaseModel {
  constructor() {
    super('buildings');
  }

  /**
   * Get all buildings with their floor count
   * @returns {Promise<Array>} Array of building objects with floor count
   */
  async getWithFloorCount() {
    try {
      const query = `
        SELECT 
          b.id,
          b.name,
          b.code,
          b.address,
          b.description,
          b.created_at,
          b.updated_at,
          COUNT(DISTINCT f.id) as floor_count
        FROM ${this.tableName} b
        LEFT JOIN floors f ON b.id = f.building_id
        GROUP BY b.id, b.name, b.code, b.address, b.description, b.created_at, b.updated_at
        ORDER BY b.name ASC
      `;

      const [rows] = await this.db.execute(query);
      return rows;
    } catch (error) {
      console.error('Error in getWithFloorCount:', error);
      throw error;
    }
  }

  /**
   * Get all buildings with their floors and rooms
   * @returns {Promise<Array>} Array of building objects with floors and rooms
   */
  async getWithFloorsAndRooms() {
    try {
      const query = `
        SELECT 
          b.id,
          b.name,
          b.code,
          b.address,
          b.description,
          b.created_at,
          b.updated_at,
          f.id as floor_id,
          f.name as floor_name,
          f.floor_number,
          r.id as room_id,
          r.room_number,
          r.room_type,
          r.capacity,
          r.has_projector,
          r.has_ac,
          r.is_available
        FROM ${this.tableName} b
        LEFT JOIN floors f ON b.id = f.building_id
        LEFT JOIN rooms r ON f.id = r.floor_id
        ORDER BY b.name ASC, f.floor_number ASC, r.room_number ASC
      `;

      const [rows] = await this.db.execute(query);
      
      // Group results by building
      const buildingsMap = new Map();
      
      rows.forEach(row => {
        if (!buildingsMap.has(row.id)) {
          buildingsMap.set(row.id, {
            id: row.id,
            name: row.name,
            code: row.code,
            address: row.address,
            description: row.description,
            created_at: row.created_at,
            updated_at: row.updated_at,
            floors: []
          });
        }
        
        const building = buildingsMap.get(row.id);
        
        if (row.floor_id) {
          let floor = building.floors.find(f => f.id === row.floor_id);
          if (!floor) {
            floor = {
              id: row.floor_id,
              name: row.floor_name,
              floor_number: row.floor_number,
              rooms: []
            };
            building.floors.push(floor);
          }
          
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
        }
      });
      
      return Array.from(buildingsMap.values());
    } catch (error) {
      console.error('Error in getWithFloorsAndRooms:', error);
      throw error;
    }
  }

  /**
   * Get a building with its floors and rooms
   * @param {number} buildingId - Building ID
   * @returns {Promise<Object>} Building object with floors and rooms
   */
  async getBuildingWithDetails(buildingId) {
    try {
      const query = `
        SELECT 
          b.id,
          b.name,
          b.code,
          b.address,
          b.description,
          b.created_at,
          b.updated_at,
          f.id as floor_id,
          f.name as floor_name,
          f.floor_number,
          r.id as room_id,
          r.room_number,
          r.room_type,
          r.capacity,
          r.has_projector,
          r.has_ac,
          r.is_available
        FROM ${this.tableName} b
        LEFT JOIN floors f ON b.id = f.building_id
        LEFT JOIN rooms r ON f.id = r.floor_id
        WHERE b.id = ?
        ORDER BY f.floor_number ASC, r.room_number ASC
      `;

      const [rows] = await this.db.execute(query, [buildingId]);
      
      if (rows.length === 0) {
        return null;
      }
      
      const building = {
        id: rows[0].id,
        name: rows[0].name,
        code: rows[0].code,
        address: rows[0].address,
        description: rows[0].description,
        created_at: rows[0].created_at,
        updated_at: rows[0].updated_at,
        floors: []
      };
      
      const floorsMap = new Map();
      
      rows.forEach(row => {
        if (row.floor_id) {
          if (!floorsMap.has(row.floor_id)) {
            floorsMap.set(row.floor_id, {
              id: row.floor_id,
              name: row.floor_name,
              floor_number: row.floor_number,
              rooms: []
            });
          }
          
          const floor = floorsMap.get(row.floor_id);
          
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
        }
      });
      
      building.floors = Array.from(floorsMap.values());
      
      return building;
    } catch (error) {
      console.error('Error in getBuildingWithDetails:', error);
      throw error;
    }
  }

  /**
   * Get a building by code
   * @param {string} code - Building code
   * @returns {Promise<Object|null>} Building object or null if not found
   */
  async findByCode(code) {
    try {
      const query = `
        SELECT * FROM ${this.tableName}
        WHERE code = ?
        LIMIT 1
      `;

      const [rows] = await this.db.execute(query, [code]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error in findByCode:', error);
      throw error;
    }
  }

  /**
   * Check if building code exists (for validation during create/update)
   * @param {string} code - Building code
   * @param {number} excludeId - Building ID to exclude from check (for updates)
   * @returns {Promise<boolean>} True if code exists, false otherwise
   */
  async codeExists(code, excludeId = null) {
    try {
      let query = `
        SELECT COUNT(*) as count FROM ${this.tableName}
        WHERE code = ?
      `;
      const params = [code];

      if (excludeId) {
        query += ` AND id != ?`;
        params.push(excludeId);
      }

      const [rows] = await this.db.execute(query, params);
      return rows[0].count > 0;
    } catch (error) {
      console.error('Error in codeExists:', error);
      throw error;
    }
  }

  /**
   * Get total room capacity for a building
   * @param {number} buildingId - Building ID
   * @returns {Promise<Object>} Object with total capacity and room count
   */
  async getBuildingCapacity(buildingId) {
    try {
      const query = `
        SELECT 
          COUNT(DISTINCT r.id) as total_rooms,
          SUM(r.capacity) as total_capacity,
          COUNT(DISTINCT CASE WHEN r.is_available = 1 THEN r.id END) as available_rooms
        FROM ${this.tableName} b
        LEFT JOIN floors f ON b.id = f.building_id
        LEFT JOIN rooms r ON f.id = r.floor_id
        WHERE b.id = ?
      `;

      const [rows] = await this.db.execute(query, [buildingId]);
      return rows[0];
    } catch (error) {
      console.error('Error in getBuildingCapacity:', error);
      throw error;
    }
  }

  /**
   * Search buildings by name or code
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of matching buildings
   */
  async search(searchTerm) {
    try {
      const query = `
        SELECT 
          b.*,
          COUNT(DISTINCT f.id) as floor_count
        FROM ${this.tableName} b
        LEFT JOIN floors f ON b.id = f.building_id
        WHERE b.name LIKE ? OR b.code LIKE ?
        GROUP BY b.id
        ORDER BY b.name ASC
      `;

      const searchPattern = `%${searchTerm}%`;
      const [rows] = await this.db.execute(query, [searchPattern, searchPattern]);
      return rows;
    } catch (error) {
      console.error('Error in search:', error);
      throw error;
    }
  }
}

module.exports = Building;
