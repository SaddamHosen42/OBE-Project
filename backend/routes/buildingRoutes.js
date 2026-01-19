const express = require('express');
const router = express.Router();
const BuildingController = require('../controllers/BuildingController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * Building Management Routes
 * Base path: /api/buildings
 */

// ===========================
// BUILDING ROUTES
// ===========================

/**
 * @route   GET /api/buildings
 * @desc    Get all buildings (with pagination, filtering, and search)
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @query   { page?, limit?, search?, orderBy?, order?, withFloors? }
 * @returns { success, message, data: [buildings], pagination }
 */
router.get('/', authenticate, BuildingController.index);

/**
 * @route   GET /api/buildings/code/:code
 * @desc    Get a building by code
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @params  { code: building_code }
 * @returns { success, message, data: building }
 */
router.get('/code/:code', authenticate, BuildingController.getByCode);

/**
 * @route   GET /api/buildings/:id/capacity
 * @desc    Get building capacity statistics
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: building_id }
 * @returns { success, message, data: { building_id, total_rooms, total_capacity, available_rooms } }
 */
router.get('/:id/capacity', authenticate, BuildingController.getCapacity);

/**
 * @route   GET /api/buildings/:id
 * @desc    Get a single building by ID (with details if requested)
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: building_id }
 * @query   { withDetails? }
 * @returns { success, message, data: building }
 */
router.get('/:id', authenticate, BuildingController.show);

/**
 * @route   POST /api/buildings
 * @desc    Create a new building
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @body    { name, code, address?, description? }
 * @returns { success, message, data: building }
 */
router.post('/', authenticate, authorize(['admin']), BuildingController.store);

/**
 * @route   PUT /api/buildings/:id
 * @desc    Update an existing building
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: building_id }
 * @body    { name, code, address?, description? }
 * @returns { success, message, data: building }
 */
router.put('/:id', authenticate, authorize(['admin']), BuildingController.update);

/**
 * @route   DELETE /api/buildings/:id
 * @desc    Delete a building
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: building_id }
 * @returns { success, message }
 */
router.delete('/:id', authenticate, authorize(['admin']), BuildingController.destroy);

// ===========================
// FLOOR ROUTES
// ===========================

/**
 * @route   GET /api/buildings/floors
 * @desc    Get all floors (with pagination, filtering, and search)
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @query   { page?, limit?, search?, buildingId?, orderBy?, order? }
 * @returns { success, message, data: [floors], pagination }
 */
router.get('/floors', authenticate, BuildingController.indexFloors);

/**
 * @route   GET /api/buildings/floors/:id/capacity
 * @desc    Get floor capacity statistics
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: floor_id }
 * @returns { success, message, data: { floor_id, total_rooms, total_capacity, available_rooms } }
 */
router.get('/floors/:id/capacity', authenticate, BuildingController.getFloorCapacity);

/**
 * @route   GET /api/buildings/floors/:id
 * @desc    Get a single floor by ID (with rooms if requested)
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: floor_id }
 * @query   { withRooms? }
 * @returns { success, message, data: floor }
 */
router.get('/floors/:id', authenticate, BuildingController.showFloor);

/**
 * @route   POST /api/buildings/floors
 * @desc    Create a new floor
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @body    { building_id, name, floor_number }
 * @returns { success, message, data: floor }
 */
router.post('/floors', authenticate, authorize(['admin']), BuildingController.storeFloor);

/**
 * @route   PUT /api/buildings/floors/:id
 * @desc    Update an existing floor
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: floor_id }
 * @body    { building_id, name, floor_number }
 * @returns { success, message, data: floor }
 */
router.put('/floors/:id', authenticate, authorize(['admin']), BuildingController.updateFloor);

/**
 * @route   DELETE /api/buildings/floors/:id
 * @desc    Delete a floor
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: floor_id }
 * @returns { success, message }
 */
router.delete('/floors/:id', authenticate, authorize(['admin']), BuildingController.destroyFloor);

// ===========================
// ROOM ROUTES
// ===========================

/**
 * @route   GET /api/buildings/rooms
 * @desc    Get all rooms (with pagination, filtering, and search)
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @query   { page?, limit?, search?, floorId?, buildingId?, roomType?, available?, hasProjector?, hasAC?, minCapacity? }
 * @returns { success, message, data: [rooms], pagination }
 */
router.get('/rooms', authenticate, BuildingController.indexRooms);

/**
 * @route   GET /api/buildings/rooms/stats/by-type
 * @desc    Get room statistics by type
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @returns { success, message, data: [{ room_type, count, total_capacity }] }
 */
router.get('/rooms/stats/by-type', authenticate, BuildingController.getRoomStatsByType);

/**
 * @route   GET /api/buildings/rooms/:id
 * @desc    Get a single room by ID
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: room_id }
 * @returns { success, message, data: room }
 */
router.get('/rooms/:id', authenticate, BuildingController.showRoom);

/**
 * @route   POST /api/buildings/rooms
 * @desc    Create a new room
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @body    { floor_id, room_number, room_type, capacity, has_projector?, has_ac?, is_available? }
 * @returns { success, message, data: room }
 */
router.post('/rooms', authenticate, authorize(['admin']), BuildingController.storeRoom);

/**
 * @route   PUT /api/buildings/rooms/:id
 * @desc    Update an existing room
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: room_id }
 * @body    { floor_id, room_number, room_type, capacity, has_projector?, has_ac?, is_available? }
 * @returns { success, message, data: room }
 */
router.put('/rooms/:id', authenticate, authorize(['admin']), BuildingController.updateRoom);

/**
 * @route   DELETE /api/buildings/rooms/:id
 * @desc    Delete a room
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: room_id }
 * @returns { success, message }
 */
router.delete('/rooms/:id', authenticate, authorize(['admin']), BuildingController.destroyRoom);

/**
 * @route   PATCH /api/buildings/rooms/:id/availability
 * @desc    Update room availability status
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: room_id }
 * @body    { is_available: boolean }
 * @returns { success, message, data: room }
 */
router.patch('/rooms/:id/availability', authenticate, authorize(['admin', 'faculty']), BuildingController.updateRoomAvailability);

module.exports = router;
