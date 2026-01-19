const express = require('express');
const router = express.Router();
const AuditLogController = require('../controllers/AuditLogController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * Audit Log Routes
 * Base path: /api/audit-logs
 * All routes require authentication
 * Most routes require admin role for security
 */

/**
 * @route   GET /api/audit-logs
 * @desc    Get all audit logs with filtering and pagination
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @query   { 
 *            page?, limit?, orderBy?, order?, 
 *            action?, table_name?, user_id?, 
 *            startDate?, endDate?, search? 
 *          }
 * @returns { success, message, data: [logs], pagination }
 */
router.get('/', authenticate, authorize(['admin']), AuditLogController.getLogs);

/**
 * @route   GET /api/audit-logs/statistics
 * @desc    Get audit log statistics
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @query   { startDate?, endDate?, user_id?, table_name? }
 * @returns { success, message, data: statistics }
 */
router.get('/statistics', authenticate, authorize(['admin']), AuditLogController.getStatistics);

/**
 * @route   GET /api/audit-logs/recent
 * @desc    Get recent audit activities (last 24 hours by default)
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @query   { hours?, limit?, action?, table_name?, user_id? }
 * @returns { success, message, data: [logs], pagination }
 */
router.get('/recent', authenticate, authorize(['admin']), AuditLogController.getRecentActivity);

/**
 * @route   GET /api/audit-logs/user/:userId
 * @desc    Get audit logs by user ID
 * @access  Private (Admin or own logs)
 * @headers { Authorization: Bearer <token> }
 * @params  { userId: user_id }
 * @query   { 
 *            page?, limit?, orderBy?, order?, 
 *            action?, table_name?, 
 *            startDate?, endDate? 
 *          }
 * @returns { success, message, data: [logs], pagination }
 */
router.get('/user/:userId', authenticate, AuditLogController.getLogsByUser);

/**
 * @route   GET /api/audit-logs/table/:tableName
 * @desc    Get audit logs by table name
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { tableName: table_name }
 * @query   { 
 *            page?, limit?, orderBy?, order?, 
 *            action?, record_id?, user_id?, 
 *            startDate?, endDate? 
 *          }
 * @returns { success, message, data: [logs], pagination }
 */
router.get('/table/:tableName', authenticate, authorize(['admin']), AuditLogController.getLogsByTable);

/**
 * @route   GET /api/audit-logs/record/:tableName/:recordId
 * @desc    Get audit logs for a specific record (full history)
 * @access  Private (Admin or authorized users)
 * @headers { Authorization: Bearer <token> }
 * @params  { tableName: table_name, recordId: record_id }
 * @query   { orderBy?, order?, action? }
 * @returns { success, message, data: [logs] }
 */
router.get('/record/:tableName/:recordId', authenticate, authorize(['admin', 'teacher']), AuditLogController.getLogsByRecord);

/**
 * @route   GET /api/audit-logs/:id
 * @desc    Get a specific audit log entry by ID
 * @access  Private (Admin only)
 * @headers { Authorization: Bearer <token> }
 * @params  { id: audit_log_id }
 * @returns { success, message, data: log }
 */
router.get('/:id', authenticate, authorize(['admin']), AuditLogController.getLogById);

module.exports = router;
