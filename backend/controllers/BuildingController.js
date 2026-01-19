const Building = require('../models/Building');
const Floor = require('../models/Floor');
const Room = require('../models/Room');

/**
 * Building Controller
 * Handles building, floor, and room management operations
 */
const BuildingController = {
  // ===========================
  // BUILDING CRUD OPERATIONS
  // ===========================

  /**
   * List all buildings
   * @route GET /api/buildings
   */
  index: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        orderBy = 'created_at', 
        order = 'DESC',
        withFloors = 'false'
      } = req.query;

      const buildingModel = new Building();
      
      // If withFloors is true, get buildings with floors and rooms
      if (withFloors === 'true') {
        const buildings = await buildingModel.getWithFloorsAndRooms();
        
        // Apply search filter if provided
        let filteredBuildings = buildings;
        if (search) {
          const searchLower = search.toLowerCase();
          filteredBuildings = buildings.filter(building => 
            building.name.toLowerCase().includes(searchLower) ||
            building.code.toLowerCase().includes(searchLower)
          );
        }

        // Apply pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedBuildings = filteredBuildings.slice(startIndex, endIndex);

        return res.status(200).json({
          success: true,
          message: 'Buildings retrieved successfully',
          data: paginatedBuildings,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(filteredBuildings.length / parseInt(limit)),
            totalItems: filteredBuildings.length,
            itemsPerPage: parseInt(limit)
          }
        });
      }

      // Build query options
      const options = {
        orderBy,
        order: order.toUpperCase(),
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      };

      let buildings;
      let total;

      if (search) {
        buildings = await buildingModel.search(search);
        total = buildings.length;
        
        // Apply pagination to search results
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        buildings = buildings.slice(startIndex, startIndex + parseInt(limit));
      } else {
        buildings = await buildingModel.getWithFloorCount();
        total = buildings.length;
        
        // Apply pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        buildings = buildings.slice(startIndex, startIndex + parseInt(limit));
      }

      return res.status(200).json({
        success: true,
        message: 'Buildings retrieved successfully',
        data: buildings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error in BuildingController.index:', error);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving buildings',
        error: error.message
      });
    }
  },

  /**
   * Get a single building by ID
   * @route GET /api/buildings/:id
   */
  show: async (req, res) => {
    try {
      const { id } = req.params;
      const { withDetails = 'false' } = req.query;

      const buildingModel = new Building();
      
      let building;
      if (withDetails === 'true') {
        building = await buildingModel.getBuildingWithDetails(id);
      } else {
        building = await buildingModel.findById(id);
      }

      if (!building) {
        return res.status(404).json({
          success: false,
          message: 'Building not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Building retrieved successfully',
        data: building
      });
    } catch (error) {
      console.error('Error in BuildingController.show:', error);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving building',
        error: error.message
      });
    }
  },

  /**
   * Create a new building
   * @route POST /api/buildings
   */
  store: async (req, res) => {
    try {
      const { name, code, address, description } = req.body;

      // Validation
      if (!name || !code) {
        return res.status(400).json({
          success: false,
          message: 'Building name and code are required'
        });
      }

      const buildingModel = new Building();

      // Check if code already exists
      const codeExists = await buildingModel.codeExists(code);
      if (codeExists) {
        return res.status(400).json({
          success: false,
          message: 'Building code already exists'
        });
      }

      const buildingData = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        address: address ? address.trim() : null,
        description: description ? description.trim() : null
      };

      const buildingId = await buildingModel.create(buildingData);
      const building = await buildingModel.findById(buildingId);

      return res.status(201).json({
        success: true,
        message: 'Building created successfully',
        data: building
      });
    } catch (error) {
      console.error('Error in BuildingController.store:', error);
      return res.status(500).json({
        success: false,
        message: 'Error creating building',
        error: error.message
      });
    }
  },

  /**
   * Update an existing building
   * @route PUT /api/buildings/:id
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, code, address, description } = req.body;

      const buildingModel = new Building();

      // Check if building exists
      const existingBuilding = await buildingModel.findById(id);
      if (!existingBuilding) {
        return res.status(404).json({
          success: false,
          message: 'Building not found'
        });
      }

      // Validation
      if (!name || !code) {
        return res.status(400).json({
          success: false,
          message: 'Building name and code are required'
        });
      }

      // Check if code already exists (excluding current building)
      const codeExists = await buildingModel.codeExists(code, id);
      if (codeExists) {
        return res.status(400).json({
          success: false,
          message: 'Building code already exists'
        });
      }

      const buildingData = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        address: address ? address.trim() : null,
        description: description ? description.trim() : null
      };

      await buildingModel.update(id, buildingData);
      const building = await buildingModel.findById(id);

      return res.status(200).json({
        success: true,
        message: 'Building updated successfully',
        data: building
      });
    } catch (error) {
      console.error('Error in BuildingController.update:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating building',
        error: error.message
      });
    }
  },

  /**
   * Delete a building
   * @route DELETE /api/buildings/:id
   */
  destroy: async (req, res) => {
    try {
      const { id } = req.params;

      const buildingModel = new Building();

      // Check if building exists
      const building = await buildingModel.findById(id);
      if (!building) {
        return res.status(404).json({
          success: false,
          message: 'Building not found'
        });
      }

      await buildingModel.delete(id);

      return res.status(200).json({
        success: true,
        message: 'Building deleted successfully'
      });
    } catch (error) {
      console.error('Error in BuildingController.destroy:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting building',
        error: error.message
      });
    }
  },

  /**
   * Get building by code
   * @route GET /api/buildings/code/:code
   */
  getByCode: async (req, res) => {
    try {
      const { code } = req.params;

      const buildingModel = new Building();
      const building = await buildingModel.findByCode(code);

      if (!building) {
        return res.status(404).json({
          success: false,
          message: 'Building not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Building retrieved successfully',
        data: building
      });
    } catch (error) {
      console.error('Error in BuildingController.getByCode:', error);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving building',
        error: error.message
      });
    }
  },

  /**
   * Get building capacity statistics
   * @route GET /api/buildings/:id/capacity
   */
  getCapacity: async (req, res) => {
    try {
      const { id } = req.params;

      const buildingModel = new Building();

      // Check if building exists
      const building = await buildingModel.findById(id);
      if (!building) {
        return res.status(404).json({
          success: false,
          message: 'Building not found'
        });
      }

      const capacity = await buildingModel.getBuildingCapacity(id);

      return res.status(200).json({
        success: true,
        message: 'Building capacity retrieved successfully',
        data: {
          building_id: parseInt(id),
          building_name: building.name,
          ...capacity
        }
      });
    } catch (error) {
      console.error('Error in BuildingController.getCapacity:', error);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving building capacity',
        error: error.message
      });
    }
  },

  // ===========================
  // FLOOR CRUD OPERATIONS
  // ===========================

  /**
   * List all floors
   * @route GET /api/buildings/floors
   */
  indexFloors: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        buildingId,
        orderBy = 'floor_number', 
        order = 'ASC'
      } = req.query;

      const floorModel = new Floor();
      
      let floors;
      let total;

      if (buildingId) {
        floors = await floorModel.getByBuilding(buildingId);
        total = floors.length;
      } else if (search) {
        floors = await floorModel.search(search, buildingId);
        total = floors.length;
      } else {
        floors = await floorModel.getWithRoomCount();
        total = floors.length;
      }

      // Apply pagination
      const startIndex = (parseInt(page) - 1) * parseInt(limit);
      const paginatedFloors = floors.slice(startIndex, startIndex + parseInt(limit));

      return res.status(200).json({
        success: true,
        message: 'Floors retrieved successfully',
        data: paginatedFloors,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error in BuildingController.indexFloors:', error);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving floors',
        error: error.message
      });
    }
  },

  /**
   * Get a single floor by ID
   * @route GET /api/buildings/floors/:id
   */
  showFloor: async (req, res) => {
    try {
      const { id } = req.params;
      const { withRooms = 'false' } = req.query;

      const floorModel = new Floor();
      
      let floor;
      if (withRooms === 'true') {
        floor = await floorModel.getFloorWithRooms(id);
      } else {
        const [floorData] = await floorModel.getByBuilding(id);
        floor = floorData || await floorModel.findById(id);
      }

      if (!floor) {
        return res.status(404).json({
          success: false,
          message: 'Floor not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Floor retrieved successfully',
        data: floor
      });
    } catch (error) {
      console.error('Error in BuildingController.showFloor:', error);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving floor',
        error: error.message
      });
    }
  },

  /**
   * Create a new floor
   * @route POST /api/buildings/floors
   */
  storeFloor: async (req, res) => {
    try {
      const { building_id, name, floor_number } = req.body;

      // Validation
      if (!building_id || !name || floor_number === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Building ID, floor name, and floor number are required'
        });
      }

      const floorModel = new Floor();
      const buildingModel = new Building();

      // Check if building exists
      const building = await buildingModel.findById(building_id);
      if (!building) {
        return res.status(404).json({
          success: false,
          message: 'Building not found'
        });
      }

      // Check if floor number already exists in this building
      const floorExists = await floorModel.floorNumberExists(building_id, floor_number);
      if (floorExists) {
        return res.status(400).json({
          success: false,
          message: 'Floor number already exists in this building'
        });
      }

      const floorData = {
        building_id: parseInt(building_id),
        name: name.trim(),
        floor_number: parseInt(floor_number)
      };

      const floorId = await floorModel.create(floorData);
      const floor = await floorModel.getFloorWithRooms(floorId);

      return res.status(201).json({
        success: true,
        message: 'Floor created successfully',
        data: floor
      });
    } catch (error) {
      console.error('Error in BuildingController.storeFloor:', error);
      return res.status(500).json({
        success: false,
        message: 'Error creating floor',
        error: error.message
      });
    }
  },

  /**
   * Update an existing floor
   * @route PUT /api/buildings/floors/:id
   */
  updateFloor: async (req, res) => {
    try {
      const { id } = req.params;
      const { building_id, name, floor_number } = req.body;

      const floorModel = new Floor();

      // Check if floor exists
      const existingFloor = await floorModel.findById(id);
      if (!existingFloor) {
        return res.status(404).json({
          success: false,
          message: 'Floor not found'
        });
      }

      // Validation
      if (!building_id || !name || floor_number === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Building ID, floor name, and floor number are required'
        });
      }

      const buildingModel = new Building();

      // Check if building exists
      const building = await buildingModel.findById(building_id);
      if (!building) {
        return res.status(404).json({
          success: false,
          message: 'Building not found'
        });
      }

      // Check if floor number already exists in this building (excluding current floor)
      const floorExists = await floorModel.floorNumberExists(building_id, floor_number, id);
      if (floorExists) {
        return res.status(400).json({
          success: false,
          message: 'Floor number already exists in this building'
        });
      }

      const floorData = {
        building_id: parseInt(building_id),
        name: name.trim(),
        floor_number: parseInt(floor_number)
      };

      await floorModel.update(id, floorData);
      const floor = await floorModel.getFloorWithRooms(id);

      return res.status(200).json({
        success: true,
        message: 'Floor updated successfully',
        data: floor
      });
    } catch (error) {
      console.error('Error in BuildingController.updateFloor:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating floor',
        error: error.message
      });
    }
  },

  /**
   * Delete a floor
   * @route DELETE /api/buildings/floors/:id
   */
  destroyFloor: async (req, res) => {
    try {
      const { id } = req.params;

      const floorModel = new Floor();

      // Check if floor exists
      const floor = await floorModel.findById(id);
      if (!floor) {
        return res.status(404).json({
          success: false,
          message: 'Floor not found'
        });
      }

      await floorModel.delete(id);

      return res.status(200).json({
        success: true,
        message: 'Floor deleted successfully'
      });
    } catch (error) {
      console.error('Error in BuildingController.destroyFloor:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting floor',
        error: error.message
      });
    }
  },

  /**
   * Get floor capacity statistics
   * @route GET /api/buildings/floors/:id/capacity
   */
  getFloorCapacity: async (req, res) => {
    try {
      const { id } = req.params;

      const floorModel = new Floor();

      // Check if floor exists
      const floor = await floorModel.findById(id);
      if (!floor) {
        return res.status(404).json({
          success: false,
          message: 'Floor not found'
        });
      }

      const capacity = await floorModel.getFloorCapacity(id);

      return res.status(200).json({
        success: true,
        message: 'Floor capacity retrieved successfully',
        data: {
          floor_id: parseInt(id),
          ...capacity
        }
      });
    } catch (error) {
      console.error('Error in BuildingController.getFloorCapacity:', error);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving floor capacity',
        error: error.message
      });
    }
  },

  // ===========================
  // ROOM CRUD OPERATIONS
  // ===========================

  /**
   * List all rooms
   * @route GET /api/buildings/rooms
   */
  indexRooms: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        floorId,
        buildingId,
        roomType,
        available,
        hasProjector,
        hasAC,
        minCapacity
      } = req.query;

      const roomModel = new Room();
      
      let rooms;
      let total;

      if (floorId) {
        rooms = await roomModel.getByFloor(floorId);
        total = rooms.length;
      } else if (buildingId) {
        rooms = await roomModel.getByBuilding(buildingId);
        total = rooms.length;
      } else if (available === 'true') {
        const filters = { minCapacity, hasProjector, hasAC, roomType };
        rooms = await roomModel.getAvailableRooms(filters);
        total = rooms.length;
      } else if (roomType) {
        rooms = await roomModel.getByType(roomType);
        total = rooms.length;
      } else if (search) {
        rooms = await roomModel.search(search, floorId, buildingId);
        total = rooms.length;
      } else {
        const options = {
          limit: 1000 // Get all for pagination
        };
        rooms = await roomModel.findAll(options);
        total = rooms.length;
      }

      // Apply pagination
      const startIndex = (parseInt(page) - 1) * parseInt(limit);
      const paginatedRooms = rooms.slice(startIndex, startIndex + parseInt(limit));

      return res.status(200).json({
        success: true,
        message: 'Rooms retrieved successfully',
        data: paginatedRooms,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error in BuildingController.indexRooms:', error);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving rooms',
        error: error.message
      });
    }
  },

  /**
   * Get a single room by ID
   * @route GET /api/buildings/rooms/:id
   */
  showRoom: async (req, res) => {
    try {
      const { id } = req.params;

      const roomModel = new Room();
      const rooms = await roomModel.getByFloor(id);
      const room = rooms[0] || await roomModel.findById(id);

      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Room retrieved successfully',
        data: room
      });
    } catch (error) {
      console.error('Error in BuildingController.showRoom:', error);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving room',
        error: error.message
      });
    }
  },

  /**
   * Create a new room
   * @route POST /api/buildings/rooms
   */
  storeRoom: async (req, res) => {
    try {
      const { 
        floor_id, 
        room_number, 
        room_type, 
        capacity,
        has_projector = false,
        has_ac = false,
        is_available = true
      } = req.body;

      // Validation
      if (!floor_id || !room_number || !room_type || !capacity) {
        return res.status(400).json({
          success: false,
          message: 'Floor ID, room number, room type, and capacity are required'
        });
      }

      const roomModel = new Room();
      const floorModel = new Floor();

      // Check if floor exists
      const floor = await floorModel.findById(floor_id);
      if (!floor) {
        return res.status(404).json({
          success: false,
          message: 'Floor not found'
        });
      }

      // Check if room number already exists on this floor
      const roomExists = await roomModel.roomNumberExists(room_number, floor_id);
      if (roomExists) {
        return res.status(400).json({
          success: false,
          message: 'Room number already exists on this floor'
        });
      }

      const roomData = {
        floor_id: parseInt(floor_id),
        room_number: room_number.trim(),
        room_type: room_type.trim(),
        capacity: parseInt(capacity),
        has_projector: has_projector ? 1 : 0,
        has_ac: has_ac ? 1 : 0,
        is_available: is_available ? 1 : 0
      };

      const roomId = await roomModel.create(roomData);
      const rooms = await roomModel.getByFloor(floor_id);
      const room = rooms.find(r => r.id === roomId);

      return res.status(201).json({
        success: true,
        message: 'Room created successfully',
        data: room
      });
    } catch (error) {
      console.error('Error in BuildingController.storeRoom:', error);
      return res.status(500).json({
        success: false,
        message: 'Error creating room',
        error: error.message
      });
    }
  },

  /**
   * Update an existing room
   * @route PUT /api/buildings/rooms/:id
   */
  updateRoom: async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        floor_id, 
        room_number, 
        room_type, 
        capacity,
        has_projector,
        has_ac,
        is_available
      } = req.body;

      const roomModel = new Room();

      // Check if room exists
      const existingRoom = await roomModel.findById(id);
      if (!existingRoom) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      // Validation
      if (!floor_id || !room_number || !room_type || !capacity) {
        return res.status(400).json({
          success: false,
          message: 'Floor ID, room number, room type, and capacity are required'
        });
      }

      const floorModel = new Floor();

      // Check if floor exists
      const floor = await floorModel.findById(floor_id);
      if (!floor) {
        return res.status(404).json({
          success: false,
          message: 'Floor not found'
        });
      }

      // Check if room number already exists on this floor (excluding current room)
      const roomExists = await roomModel.roomNumberExists(room_number, floor_id, id);
      if (roomExists) {
        return res.status(400).json({
          success: false,
          message: 'Room number already exists on this floor'
        });
      }

      const roomData = {
        floor_id: parseInt(floor_id),
        room_number: room_number.trim(),
        room_type: room_type.trim(),
        capacity: parseInt(capacity),
        has_projector: has_projector ? 1 : 0,
        has_ac: has_ac ? 1 : 0,
        is_available: is_available ? 1 : 0
      };

      await roomModel.update(id, roomData);
      const rooms = await roomModel.getByFloor(floor_id);
      const room = rooms.find(r => r.id === parseInt(id));

      return res.status(200).json({
        success: true,
        message: 'Room updated successfully',
        data: room
      });
    } catch (error) {
      console.error('Error in BuildingController.updateRoom:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating room',
        error: error.message
      });
    }
  },

  /**
   * Delete a room
   * @route DELETE /api/buildings/rooms/:id
   */
  destroyRoom: async (req, res) => {
    try {
      const { id } = req.params;

      const roomModel = new Room();

      // Check if room exists
      const room = await roomModel.findById(id);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      await roomModel.delete(id);

      return res.status(200).json({
        success: true,
        message: 'Room deleted successfully'
      });
    } catch (error) {
      console.error('Error in BuildingController.destroyRoom:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting room',
        error: error.message
      });
    }
  },

  /**
   * Update room availability
   * @route PATCH /api/buildings/rooms/:id/availability
   */
  updateRoomAvailability: async (req, res) => {
    try {
      const { id } = req.params;
      const { is_available } = req.body;

      if (is_available === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Availability status is required'
        });
      }

      const roomModel = new Room();

      // Check if room exists
      const room = await roomModel.findById(id);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      await roomModel.updateAvailability(id, is_available);
      const updatedRoom = await roomModel.findById(id);

      return res.status(200).json({
        success: true,
        message: 'Room availability updated successfully',
        data: updatedRoom
      });
    } catch (error) {
      console.error('Error in BuildingController.updateRoomAvailability:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating room availability',
        error: error.message
      });
    }
  },

  /**
   * Get room statistics by type
   * @route GET /api/buildings/rooms/stats/by-type
   */
  getRoomStatsByType: async (req, res) => {
    try {
      const roomModel = new Room();
      const stats = await roomModel.countByType();

      return res.status(200).json({
        success: true,
        message: 'Room statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      console.error('Error in BuildingController.getRoomStatsByType:', error);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving room statistics',
        error: error.message
      });
    }
  }
};

module.exports = BuildingController;
