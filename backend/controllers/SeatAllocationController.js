const SeatAllocation = require('../models/SeatAllocation');
const Room = require('../models/Room');
const Student = require('../models/Student');

/**
 * SeatAllocation Controller
 * Handles seat allocation management operations
 */
const SeatAllocationController = {
  /**
   * List all seat allocations
   * @route GET /api/seat-allocations
   */
  index: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        orderBy = 'created_at', 
        order = 'DESC' 
      } = req.query;

      const seatAllocationModel = new SeatAllocation();
      
      let allocations;
      let total;

      if (search) {
        allocations = await seatAllocationModel.search(search);
        total = allocations.length;
        
        // Apply pagination to search results
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        allocations = allocations.slice(startIndex, startIndex + parseInt(limit));
      } else {
        allocations = await seatAllocationModel.getAllWithDetails();
        total = allocations.length;
        
        // Apply pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        allocations = allocations.slice(startIndex, startIndex + parseInt(limit));
      }

      return res.status(200).json({
        success: true,
        message: 'Seat allocations retrieved successfully',
        data: allocations,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error in index:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve seat allocations',
        error: error.message
      });
    }
  },

  /**
   * Get a single seat allocation by ID
   * @route GET /api/seat-allocations/:id
   */
  show: async (req, res) => {
    try {
      const { id } = req.params;
      const seatAllocationModel = new SeatAllocation();

      const allocation = await seatAllocationModel.getByIdWithDetails(id);

      if (!allocation) {
        return res.status(404).json({
          success: false,
          message: 'Seat allocation not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Seat allocation retrieved successfully',
        data: allocation
      });
    } catch (error) {
      console.error('Error in show:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve seat allocation',
        error: error.message
      });
    }
  },

  /**
   * Allocate a seat to a student
   * @route POST /api/seat-allocations/allocate
   */
  allocate: async (req, res) => {
    try {
      const { room_id, student_id } = req.body;

      // Validate required fields
      if (!room_id || !student_id) {
        return res.status(400).json({
          success: false,
          message: 'Room ID and Student ID are required'
        });
      }

      // Verify room exists
      const roomModel = new Room();
      const room = await roomModel.findById(room_id);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      // Verify student exists
      const studentModel = new Student();
      const student = await studentModel.findById(student_id);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Allocate the seat
      const seatAllocationModel = new SeatAllocation();
      const allocation = await seatAllocationModel.allocate({
        room_id,
        student_id
      });

      return res.status(201).json({
        success: true,
        message: 'Seat allocated successfully',
        data: allocation
      });
    } catch (error) {
      console.error('Error in allocate:', error);
      
      // Handle specific error messages
      if (error.message === 'Student already has a seat allocation') {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.message === 'Room is at full capacity') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to allocate seat',
        error: error.message
      });
    }
  },

  /**
   * Deallocate a seat (remove allocation)
   * @route DELETE /api/seat-allocations/:id
   */
  deallocate: async (req, res) => {
    try {
      const { id } = req.params;
      const seatAllocationModel = new SeatAllocation();

      // Check if allocation exists
      const allocation = await seatAllocationModel.findById(id);
      if (!allocation) {
        return res.status(404).json({
          success: false,
          message: 'Seat allocation not found'
        });
      }

      // Deallocate the seat
      const success = await seatAllocationModel.deallocate(id);

      if (success) {
        return res.status(200).json({
          success: true,
          message: 'Seat deallocated successfully'
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to deallocate seat'
        });
      }
    } catch (error) {
      console.error('Error in deallocate:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to deallocate seat',
        error: error.message
      });
    }
  },

  /**
   * Deallocate seat by student ID
   * @route DELETE /api/seat-allocations/student/:studentId
   */
  deallocateByStudent: async (req, res) => {
    try {
      const { studentId } = req.params;
      const seatAllocationModel = new SeatAllocation();

      // Check if student has an allocation
      const allocation = await seatAllocationModel.getByStudent(studentId);
      if (!allocation) {
        return res.status(404).json({
          success: false,
          message: 'Student does not have a seat allocation'
        });
      }

      // Deallocate the seat
      const success = await seatAllocationModel.deallocateByStudent(studentId);

      if (success) {
        return res.status(200).json({
          success: true,
          message: 'Seat deallocated successfully'
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to deallocate seat'
        });
      }
    } catch (error) {
      console.error('Error in deallocateByStudent:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to deallocate seat',
        error: error.message
      });
    }
  },

  /**
   * Reallocate a student to a different room
   * @route PUT /api/seat-allocations/reallocate/:studentId
   */
  reallocate: async (req, res) => {
    try {
      const { studentId } = req.params;
      const { new_room_id } = req.body;

      // Validate required fields
      if (!new_room_id) {
        return res.status(400).json({
          success: false,
          message: 'New room ID is required'
        });
      }

      // Check if student has an allocation
      const seatAllocationModel = new SeatAllocation();
      const currentAllocation = await seatAllocationModel.getByStudent(studentId);
      if (!currentAllocation) {
        return res.status(404).json({
          success: false,
          message: 'Student does not have a seat allocation'
        });
      }

      // Verify new room exists
      const roomModel = new Room();
      const room = await roomModel.findById(new_room_id);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'New room not found'
        });
      }

      // Reallocate the seat
      const allocation = await seatAllocationModel.reallocate(studentId, new_room_id);

      return res.status(200).json({
        success: true,
        message: 'Seat reallocated successfully',
        data: allocation
      });
    } catch (error) {
      console.error('Error in reallocate:', error);
      
      if (error.message === 'New room is at full capacity') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to reallocate seat',
        error: error.message
      });
    }
  },

  /**
   * Get seat allocations by room
   * @route GET /api/seat-allocations/room/:roomId
   */
  getByRoom: async (req, res) => {
    try {
      const { roomId } = req.params;
      const seatAllocationModel = new SeatAllocation();

      const allocations = await seatAllocationModel.getByRoom(roomId);

      return res.status(200).json({
        success: true,
        message: 'Room allocations retrieved successfully',
        data: allocations
      });
    } catch (error) {
      console.error('Error in getByRoom:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve room allocations',
        error: error.message
      });
    }
  },

  /**
   * Get seat allocation by student
   * @route GET /api/seat-allocations/student/:studentId
   */
  getByStudent: async (req, res) => {
    try {
      const { studentId } = req.params;
      const seatAllocationModel = new SeatAllocation();

      const allocation = await seatAllocationModel.getByStudent(studentId);

      if (!allocation) {
        return res.status(404).json({
          success: false,
          message: 'Student does not have a seat allocation'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Student allocation retrieved successfully',
        data: allocation
      });
    } catch (error) {
      console.error('Error in getByStudent:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve student allocation',
        error: error.message
      });
    }
  },

  /**
   * Get available rooms
   * @route GET /api/seat-allocations/available-rooms
   */
  getAvailableRooms: async (req, res) => {
    try {
      const seatAllocationModel = new SeatAllocation();
      const rooms = await seatAllocationModel.getAvailableRooms();

      return res.status(200).json({
        success: true,
        message: 'Available rooms retrieved successfully',
        data: rooms
      });
    } catch (error) {
      console.error('Error in getAvailableRooms:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve available rooms',
        error: error.message
      });
    }
  },

  /**
   * Get allocation statistics by building
   * @route GET /api/seat-allocations/statistics/buildings
   */
  getStatisticsByBuilding: async (req, res) => {
    try {
      const seatAllocationModel = new SeatAllocation();
      const statistics = await seatAllocationModel.getStatisticsByBuilding();

      return res.status(200).json({
        success: true,
        message: 'Building statistics retrieved successfully',
        data: statistics
      });
    } catch (error) {
      console.error('Error in getStatisticsByBuilding:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve building statistics',
        error: error.message
      });
    }
  },

  /**
   * Get room occupancy
   * @route GET /api/seat-allocations/room/:roomId/occupancy
   */
  getRoomOccupancy: async (req, res) => {
    try {
      const { roomId } = req.params;
      const seatAllocationModel = new SeatAllocation();
      const roomModel = new Room();

      // Get room details
      const room = await roomModel.findById(roomId);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      // Get occupancy count
      const occupancy = await seatAllocationModel.getRoomOccupancy(roomId);
      const availableSeats = room.capacity - occupancy;
      const occupancyRate = room.capacity > 0 ? (occupancy / room.capacity) * 100 : 0;

      return res.status(200).json({
        success: true,
        message: 'Room occupancy retrieved successfully',
        data: {
          room_id: roomId,
          room_number: room.room_number,
          capacity: room.capacity,
          current_occupancy: occupancy,
          available_seats: availableSeats,
          occupancy_rate: Math.round(occupancyRate * 100) / 100
        }
      });
    } catch (error) {
      console.error('Error in getRoomOccupancy:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve room occupancy',
        error: error.message
      });
    }
  }
};

module.exports = SeatAllocationController;
