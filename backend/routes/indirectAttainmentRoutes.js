const express = require('express');
const router = express.Router();
const IndirectAttainmentController = require('../controllers/IndirectAttainmentController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * Indirect Attainment Routes
 * Handles indirect assessment attainment calculations and reporting
 * Base path: /api/indirect-attainment
 * All routes require authentication
 */

/**
 * @route   POST /api/indirect-attainment/calculate
 * @desc    Calculate indirect attainment from survey responses
 * @body    {
 *            survey_id: number,
 *            outcome_type: string ('PLO' or 'CLO'),
 *            outcome_id: number (optional)
 *          }
 * @access  Teacher, Admin
 */
router.post(
  '/calculate',
  authenticate,
  authorize(['admin', 'teacher']),
  IndirectAttainmentController.calculateAttainment
);

/**
 * @route   POST /api/indirect-attainment/recalculate/:surveyId
 * @desc    Recalculate all indirect attainment results for a survey
 * @body    {
 *            outcome_type: string ('PLO' or 'CLO')
 *          }
 * @access  Teacher, Admin
 */
router.post(
  '/recalculate/:surveyId',
  authenticate,
  authorize(['admin', 'teacher']),
  IndirectAttainmentController.recalculate
);

/**
 * @route   GET /api/indirect-attainment/survey/:surveyId
 * @desc    Get indirect attainment report for a specific survey
 * @query   outcome_type - Filter by outcome type ('PLO' or 'CLO')
 * @access  Teacher, Admin
 */
router.get(
  '/survey/:surveyId',
  authenticate,
  authorize(['admin', 'teacher']),
  IndirectAttainmentController.getBySurvey
);

/**
 * @route   GET /api/indirect-attainment/outcome/:outcomeType/:outcomeId
 * @desc    Get indirect attainment results for a specific outcome across all surveys
 * @params  outcomeType - 'PLO' or 'CLO'
 *          outcomeId - The outcome ID
 * @access  Teacher, Admin
 */
router.get(
  '/outcome/:outcomeType/:outcomeId',
  authenticate,
  authorize(['admin', 'teacher']),
  IndirectAttainmentController.getByOutcome
);

/**
 * @route   GET /api/indirect-attainment/report/program/:degreeId
 * @desc    Get comprehensive indirect attainment report for a degree program
 * @params  degreeId - The degree/program ID
 * @access  Teacher, Admin
 */
router.get(
  '/report/program/:degreeId',
  authenticate,
  authorize(['admin', 'teacher']),
  IndirectAttainmentController.getReport
);

/**
 * @route   GET /api/indirect-attainment/summary
 * @desc    Get summary statistics for indirect attainment across all surveys
 * @query   degree_id - Filter by degree/program
 *          outcome_type - Filter by outcome type ('PLO' or 'CLO')
 * @access  Teacher, Admin
 */
router.get(
  '/summary',
  authenticate,
  authorize(['admin', 'teacher']),
  IndirectAttainmentController.getSummary
);

module.exports = router;
