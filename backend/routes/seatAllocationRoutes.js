const express = require('express');
const router = express.Router();
const SeatAllocationController = require('../controllers/SeatAllocationController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * Seat Allocation Management Routes
 * Base path: /api/seat-allocations
 */

/**
 * @route   GET /api/seat-allocations
 * @desc    Get all seat allocations (with pagination, filtering, and search)
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @query   { page?, limit?, search?, orderBy?, order? }
 * @returns { success, message, data: [allocations], pagination }
 */
router.get('/', authenticate, SeatAllocationController.index);

/**
 * @route   GET /api/seat-allocations/available-rooms
 * @desc    Get all available rooms with capacity
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @returns { success, message, data: [rooms] }
 */
router.get('/available-rooms', authenticate, SeatAllocationController.getAvailableRooms);

/**
 * @route   GET /api/seat-allocations/statistics/buildings
 * @desc    Get allocation statistics by building
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @returns { success, message, data: [statistics] }
 */
router.get('/statistics/buildings', authenticate, authorize(['admin', 'faculty']), SeatAllocationController.getStatisticsByBuilding);

/**
 * @route   GET /api/seat-allocations/room/:roomId
 * @desc    Get all seat allocations for a specific room
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @params  { roomId: room_id }
 * @returns { success, message, data: [allocations] }
 */
router.get('/room/:roomId', authenticate, SeatAllocationController.getByRoom);

/**
 * @route   GET /api/seat-allocations/room/:roomId/occupancy
 * @desc    Get room occupancy information
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @params  { roomId: room_id }
 * @returns { success, message, data: { room_id, capacity, current_occupancy, available_seats, occupancy_rate } }
 */
router.get('/room/:roomId/occupancy', authenticate, SeatAllocationController.getRoomOccupancy);

/**
 * @route   GET /api/seat-allocations/student/:studentId
 * @desc    Get seat allocation for a specific student
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @params  { studentId: student_id }
 * @returns { success, message, data: allocation }
 */
router.get('/student/:studentId', authenticate, SeatAllocationController.getByStudent);

/**
 * @route   GET /api/seat-allocations/:id
 * @desc    Get a single seat allocation by ID
 * @access  Private (All authenticated users)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: allocation_id }
 * @returns { success, message, data: allocation }
 */
router.get('/:id', authenticate, SeatAllocationController.show);

/**
 * @route   POST /api/seat-allocations/allocate
 * @desc    Allocate a seat to a student
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @body    { room_id: number, student_id: number }
 * @returns { success, message, data: allocation }
 */
router.post('/allocate', authenticate, authorize(['admin', 'faculty']), SeatAllocationController.allocate);

/**
 * @route   PUT /api/seat-allocations/reallocate/:studentId
 * @desc    Reallocate a student to a different room
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @params  { studentId: student_id }
 * @body    { new_room_id: number }
 * @returns { success, message, data: allocation }
 */
router.put('/reallocate/:studentId', authenticate, authorize(['admin', 'faculty']), SeatAllocationController.reallocate);

/**
 * @route   DELETE /api/seat-allocations/:id
 * @desc    Deallocate a seat (remove allocation by ID)
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: allocation_id }
 * @returns { success, message }
 */
router.delete('/:id', authenticate, authorize(['admin', 'faculty']), SeatAllocationController.deallocate);

/**
 * @route   DELETE /api/seat-allocations/student/:studentId
 * @desc    Deallocate a seat by student ID
 * @access  Private (Admin, Faculty)
 * @headers { Authorization: Bearer <token> }
 * @params  { studentId: student_id }
 * @returns { success, message }
 */
router.delete('/student/:studentId', authenticate, authorize(['admin', 'faculty']), SeatAllocationController.deallocateByStudent);

module.exports = router;
