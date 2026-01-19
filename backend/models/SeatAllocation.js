const BaseModel = require('./BaseModel');

/**
 * SeatAllocation Model for managing student seat allocations
 * Handles seat allocation CRUD operations and relationships with rooms and students
 */
class SeatAllocation extends BaseModel {
  constructor() {
    super('seat_allocations');
  }

  /**
   * Get all seat allocations with student and room details
   * @returns {Promise<Array>} Array of seat allocation objects with related data
   */
  async getAllWithDetails() {
    try {
      const query = `
        SELECT 
          sa.id,
          sa.room_id,
          sa.student_id,
          sa.created_at,
          sa.updated_at,
          s.registration_number,
          s.name as student_name,
          s.email as student_email,
          r.room_number,
          r.room_type,
          r.capacity,
          f.floor_number,
          b.name as building_name,
          b.code as building_code
        FROM ${this.tableName} sa
        INNER JOIN students s ON sa.student_id = s.id
        INNER JOIN rooms r ON sa.room_id = r.id
        INNER JOIN floors f ON r.floor_id = f.id
        INNER JOIN buildings b ON f.building_id = b.id
        ORDER BY b.name ASC, f.floor_number ASC, r.room_number ASC
      `;

      const [rows] = await this.db.execute(query);
      return rows;
    } catch (error) {
      console.error('Error in getAllWithDetails:', error);
      throw error;
    }
  }

  /**
   * Get seat allocation by ID with details
   * @param {number} id - Seat allocation ID
   * @returns {Promise<Object|null>} Seat allocation object with details or null
   */
  async getByIdWithDetails(id) {
    try {
      const query = `
        SELECT 
          sa.id,
          sa.room_id,
          sa.student_id,
          sa.created_at,
          sa.updated_at,
          s.registration_number,
          s.name as student_name,
          s.email as student_email,
          r.room_number,
          r.room_type,
          r.capacity,
          f.floor_number,
          b.name as building_name,
          b.code as building_code
        FROM ${this.tableName} sa
        INNER JOIN students s ON sa.student_id = s.id
        INNER JOIN rooms r ON sa.room_id = r.id
        INNER JOIN floors f ON r.floor_id = f.id
        INNER JOIN buildings b ON f.building_id = b.id
        WHERE sa.id = ?
      `;

      const [rows] = await this.db.execute(query, [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error in getByIdWithDetails:', error);
      throw error;
    }
  }

  /**
   * Get seat allocations by room ID
   * @param {number} roomId - Room ID
   * @returns {Promise<Array>} Array of seat allocation objects
   */
  async getByRoom(roomId) {
    try {
      const query = `
        SELECT 
          sa.id,
          sa.room_id,
          sa.student_id,
          sa.created_at,
          sa.updated_at,
          s.registration_number,
          s.name as student_name,
          s.email as student_email
        FROM ${this.tableName} sa
        INNER JOIN students s ON sa.student_id = s.id
        WHERE sa.room_id = ?
        ORDER BY s.name ASC
      `;

      const [rows] = await this.db.execute(query, [roomId]);
      return rows;
    } catch (error) {
      console.error('Error in getByRoom:', error);
      throw error;
    }
  }

  /**
   * Get seat allocation by student ID
   * @param {number} studentId - Student ID
   * @returns {Promise<Object|null>} Seat allocation object or null
   */
  async getByStudent(studentId) {
    try {
      const query = `
        SELECT 
          sa.id,
          sa.room_id,
          sa.student_id,
          sa.created_at,
          sa.updated_at,
          r.room_number,
          r.room_type,
          r.capacity,
          f.floor_number,
          b.name as building_name,
          b.code as building_code
        FROM ${this.tableName} sa
        INNER JOIN rooms r ON sa.room_id = r.id
        INNER JOIN floors f ON r.floor_id = f.id
        INNER JOIN buildings b ON f.building_id = b.id
        WHERE sa.student_id = ?
      `;

      const [rows] = await this.db.execute(query, [studentId]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error in getByStudent:', error);
      throw error;
    }
  }

  /**
   * Check if a student already has a seat allocation
   * @param {number} studentId - Student ID
   * @returns {Promise<boolean>} True if student has allocation, false otherwise
   */
  async hasAllocation(studentId) {
    try {
      const query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE student_id = ?`;
      const [rows] = await this.db.execute(query, [studentId]);
      return rows[0].count > 0;
    } catch (error) {
      console.error('Error in hasAllocation:', error);
      throw error;
    }
  }

  /**
   * Get room occupancy count
   * @param {number} roomId - Room ID
   * @returns {Promise<number>} Number of students in the room
   */
  async getRoomOccupancy(roomId) {
    try {
      const query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE room_id = ?`;
      const [rows] = await this.db.execute(query, [roomId]);
      return rows[0].count;
    } catch (error) {
      console.error('Error in getRoomOccupancy:', error);
      throw error;
    }
  }

  /**
   * Check if a room has available capacity
   * @param {number} roomId - Room ID
   * @returns {Promise<boolean>} True if room has space, false otherwise
   */
  async hasAvailableCapacity(roomId) {
    try {
      const query = `
        SELECT 
          r.capacity,
          COUNT(sa.id) as current_occupancy
        FROM rooms r
        LEFT JOIN ${this.tableName} sa ON r.id = sa.room_id
        WHERE r.id = ?
        GROUP BY r.id, r.capacity
      `;

      const [rows] = await this.db.execute(query, [roomId]);
      
      if (rows.length === 0) {
        return false;
      }

      const { capacity, current_occupancy } = rows[0];
      return current_occupancy < capacity;
    } catch (error) {
      console.error('Error in hasAvailableCapacity:', error);
      throw error;
    }
  }

  /**
   * Get available rooms (rooms with available capacity)
   * @returns {Promise<Array>} Array of available room objects
   */
  async getAvailableRooms() {
    try {
      const query = `
        SELECT 
          r.id,
          r.room_number,
          r.room_type,
          r.capacity,
          r.has_projector,
          r.has_ac,
          f.floor_number,
          b.name as building_name,
          b.code as building_code,
          COUNT(sa.id) as current_occupancy,
          (r.capacity - COUNT(sa.id)) as available_seats
        FROM rooms r
        INNER JOIN floors f ON r.floor_id = f.id
        INNER JOIN buildings b ON f.building_id = b.id
        LEFT JOIN ${this.tableName} sa ON r.id = sa.room_id
        WHERE r.is_available = 1
        GROUP BY r.id, r.room_number, r.room_type, r.capacity, r.has_projector, 
                 r.has_ac, f.floor_number, b.name, b.code
        HAVING available_seats > 0
        ORDER BY b.name ASC, f.floor_number ASC, r.room_number ASC
      `;

      const [rows] = await this.db.execute(query);
      return rows;
    } catch (error) {
      console.error('Error in getAvailableRooms:', error);
      throw error;
    }
  }

  /**
   * Get allocation statistics by building
   * @returns {Promise<Array>} Array of building statistics
   */
  async getStatisticsByBuilding() {
    try {
      const query = `
        SELECT 
          b.id as building_id,
          b.name as building_name,
          b.code as building_code,
          COUNT(DISTINCT r.id) as total_rooms,
          SUM(r.capacity) as total_capacity,
          COUNT(sa.id) as allocated_seats,
          (SUM(r.capacity) - COUNT(sa.id)) as available_seats,
          ROUND((COUNT(sa.id) / SUM(r.capacity)) * 100, 2) as occupancy_rate
        FROM buildings b
        LEFT JOIN floors f ON b.id = f.building_id
        LEFT JOIN rooms r ON f.id = r.floor_id
        LEFT JOIN ${this.tableName} sa ON r.id = sa.room_id
        GROUP BY b.id, b.name, b.code
        ORDER BY b.name ASC
      `;

      const [rows] = await this.db.execute(query);
      return rows;
    } catch (error) {
      console.error('Error in getStatisticsByBuilding:', error);
      throw error;
    }
  }

  /**
   * Search seat allocations
   * @param {string} searchTerm - Search term (student name or registration number)
   * @returns {Promise<Array>} Array of matching seat allocations
   */
  async search(searchTerm) {
    try {
      const query = `
        SELECT 
          sa.id,
          sa.room_id,
          sa.student_id,
          sa.created_at,
          sa.updated_at,
          s.registration_number,
          s.name as student_name,
          s.email as student_email,
          r.room_number,
          r.room_type,
          f.floor_number,
          b.name as building_name,
          b.code as building_code
        FROM ${this.tableName} sa
        INNER JOIN students s ON sa.student_id = s.id
        INNER JOIN rooms r ON sa.room_id = r.id
        INNER JOIN floors f ON r.floor_id = f.id
        INNER JOIN buildings b ON f.building_id = b.id
        WHERE s.name LIKE ? 
           OR s.registration_number LIKE ?
           OR r.room_number LIKE ?
        ORDER BY s.name ASC
      `;

      const searchPattern = `%${searchTerm}%`;
      const [rows] = await this.db.execute(query, [searchPattern, searchPattern, searchPattern]);
      return rows;
    } catch (error) {
      console.error('Error in search:', error);
      throw error;
    }
  }

  /**
   * Allocate a seat to a student
   * @param {Object} data - Allocation data
   * @param {number} data.room_id - Room ID
   * @param {number} data.student_id - Student ID
   * @returns {Promise<Object>} Created allocation object
   */
  async allocate(data) {
    try {
      // Check if student already has an allocation
      const hasExisting = await this.hasAllocation(data.student_id);
      if (hasExisting) {
        throw new Error('Student already has a seat allocation');
      }

      // Check if room has available capacity
      const hasCapacity = await this.hasAvailableCapacity(data.room_id);
      if (!hasCapacity) {
        throw new Error('Room is at full capacity');
      }

      // Create the allocation
      const result = await this.create(data);
      return await this.getByIdWithDetails(result.insertId);
    } catch (error) {
      console.error('Error in allocate:', error);
      throw error;
    }
  }

  /**
   * Deallocate a seat (remove allocation)
   * @param {number} id - Seat allocation ID
   * @returns {Promise<boolean>} True if successful
   */
  async deallocate(id) {
    try {
      const result = await this.delete(id);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in deallocate:', error);
      throw error;
    }
  }

  /**
   * Deallocate seat by student ID
   * @param {number} studentId - Student ID
   * @returns {Promise<boolean>} True if successful
   */
  async deallocateByStudent(studentId) {
    try {
      const query = `DELETE FROM ${this.tableName} WHERE student_id = ?`;
      const [result] = await this.db.execute(query, [studentId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in deallocateByStudent:', error);
      throw error;
    }
  }

  /**
   * Reallocate a student to a different room
   * @param {number} studentId - Student ID
   * @param {number} newRoomId - New room ID
   * @returns {Promise<Object>} Updated allocation object
   */
  async reallocate(studentId, newRoomId) {
    try {
      // Check if new room has available capacity
      const hasCapacity = await this.hasAvailableCapacity(newRoomId);
      if (!hasCapacity) {
        throw new Error('New room is at full capacity');
      }

      // Update the allocation
      const query = `UPDATE ${this.tableName} SET room_id = ? WHERE student_id = ?`;
      await this.db.execute(query, [newRoomId, studentId]);

      // Return updated allocation
      return await this.getByStudent(studentId);
    } catch (error) {
      console.error('Error in reallocate:', error);
      throw error;
    }
  }
}

module.exports = SeatAllocation;
