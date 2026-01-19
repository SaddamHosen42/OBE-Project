const express = require('express');
const router = express.Router();
const SurveyController = require('../controllers/SurveyController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * Survey Routes
 * Base path: /api/surveys
 */

// Public routes (or authenticated based on your requirements)
/**
 * @route   GET /api/surveys/active
 * @desc    Get all active surveys
 * @access  Public or Authenticated
 */
router.get('/active', authenticate, SurveyController.getActive);

/**
 * @route   GET /api/surveys/my-responses
 * @desc    Get current user's survey responses
 * @access  Authenticated
 */
router.get('/my-responses', authenticate, SurveyController.getMyResponses);

/**
 * @route   GET /api/surveys/type/:type
 * @desc    Get surveys by type
 * @access  Authenticated
 */
router.get('/type/:type', authenticate, SurveyController.getByType);

/**
 * @route   GET /api/surveys/:id
 * @desc    Get a single survey by ID
 * @access  Public or Authenticated
 * @query   includeQuestions - Include questions in response (default: true)
 * @query   includeStats - Include statistics in response (default: false)
 */
router.get('/:id', authenticate, SurveyController.show);

/**
 * @route   POST /api/surveys/:id/responses
 * @desc    Submit a response to a survey
 * @access  Authenticated (or public for anonymous surveys)
 */
router.post('/:id/responses', authenticate, SurveyController.submitResponse);

/**
 * @route   GET /api/surveys/:id/responses
 * @desc    Get all responses for a survey
 * @access  Admin/Faculty
 */
router.get(
  '/:id/responses',
  authenticate,
  authorize(['admin', 'faculty', 'coordinator']),
  SurveyController.getResponses
);

/**
 * @route   GET /api/surveys/:id/analytics
 * @desc    Get analytics for a survey
 * @access  Admin/Faculty
 */
router.get(
  '/:id/analytics',
  authenticate,
  authorize(['admin', 'faculty', 'coordinator']),
  SurveyController.getAnalytics
);

/**
 * @route   POST /api/surveys/:id/questions
 * @desc    Add a question to a survey
 * @access  Admin/Faculty
 */
router.post(
  '/:id/questions',
  authenticate,
  authorize(['admin', 'faculty', 'coordinator']),
  SurveyController.addQuestion
);

/**
 * @route   GET /api/surveys
 * @desc    List all surveys with pagination and filtering
 * @access  Authenticated
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10)
 * @query   type - Filter by survey type
 * @query   target_audience - Filter by target audience
 * @query   is_active - Filter by active status
 */
router.get('/', authenticate, SurveyController.index);

/**
 * @route   POST /api/surveys
 * @desc    Create a new survey
 * @access  Admin/Faculty
 */
router.post(
  '/',
  authenticate,
  authorize(['admin', 'faculty', 'coordinator']),
  SurveyController.create
);

/**
 * @route   PUT /api/surveys/:id
 * @desc    Update a survey
 * @access  Admin/Faculty
 */
router.put(
  '/:id',
  authenticate,
  authorize(['admin', 'faculty', 'coordinator']),
  SurveyController.update
);

/**
 * @route   DELETE /api/surveys/:id
 * @desc    Delete a survey
 * @access  Admin
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['admin']),
  SurveyController.delete
);

module.exports = router;
