const IndirectAttainmentResult = require('../models/IndirectAttainmentResult');
const Survey = require('../models/Survey');

/**
 * Indirect Attainment Controller
 * Handles indirect assessment attainment calculations and reporting
 * Indirect assessments include surveys, exit interviews, alumni feedback, etc.
 */
const IndirectAttainmentController = {
  /**
   * Calculate indirect attainment from a survey
   * @route POST /api/indirect-attainment/calculate
   * @body {
   *   survey_id: number,
   *   outcome_type: string ('PLO' or 'CLO'),
   *   outcome_id: number (optional)
   * }
   */
  calculateAttainment: async (req, res) => {
    try {
      const { survey_id, outcome_type = 'PLO', outcome_id } = req.body;

      // Validate required fields
      if (!survey_id) {
        return res.status(400).json({
          success: false,
          message: 'Survey ID is required'
        });
      }

      if (!['PLO', 'CLO'].includes(outcome_type)) {
        return res.status(400).json({
          success: false,
          message: 'Outcome type must be either PLO or CLO'
        });
      }

      // Verify survey exists
      const surveyModel = new Survey();
      const survey = await surveyModel.findById(survey_id);
      
      if (!survey) {
        return res.status(404).json({
          success: false,
          message: 'Survey not found'
        });
      }

      // Calculate attainment
      const indirectAttainmentModel = new IndirectAttainmentResult();
      const results = await indirectAttainmentModel.calculateFromSurvey(
        survey_id,
        outcome_type,
        outcome_id
      );

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No survey responses found or no outcomes mapped to this survey'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Indirect attainment calculated successfully',
        data: {
          survey: {
            id: survey.id,
            title: survey.title,
            type: survey.type
          },
          outcome_type,
          results
        }
      });
    } catch (error) {
      console.error('Error in IndirectAttainmentController.calculateAttainment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate indirect attainment',
        error: error.message
      });
    }
  },

  /**
   * Get indirect attainment report for a survey
   * @route GET /api/indirect-attainment/survey/:surveyId
   * @query outcome_type - Filter by outcome type ('PLO' or 'CLO')
   */
  getBySurvey: async (req, res) => {
    try {
      const { surveyId } = req.params;
      const { outcome_type } = req.query;

      if (!surveyId) {
        return res.status(400).json({
          success: false,
          message: 'Survey ID is required'
        });
      }

      // Verify survey exists
      const surveyModel = new Survey();
      const survey = await surveyModel.findById(surveyId);
      
      if (!survey) {
        return res.status(404).json({
          success: false,
          message: 'Survey not found'
        });
      }

      const indirectAttainmentModel = new IndirectAttainmentResult();
      const results = await indirectAttainmentModel.getBySurvey(
        surveyId,
        outcome_type
      );

      res.status(200).json({
        success: true,
        data: {
          survey: {
            id: survey.id,
            title: survey.title,
            type: survey.type,
            start_date: survey.start_date,
            end_date: survey.end_date
          },
          results
        }
      });
    } catch (error) {
      console.error('Error in IndirectAttainmentController.getBySurvey:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch indirect attainment results',
        error: error.message
      });
    }
  },

  /**
   * Get indirect attainment report for a specific outcome
   * @route GET /api/indirect-attainment/outcome/:outcomeType/:outcomeId
   */
  getByOutcome: async (req, res) => {
    try {
      const { outcomeType, outcomeId } = req.params;

      if (!['PLO', 'CLO'].includes(outcomeType.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: 'Outcome type must be either PLO or CLO'
        });
      }

      if (!outcomeId) {
        return res.status(400).json({
          success: false,
          message: 'Outcome ID is required'
        });
      }

      const indirectAttainmentModel = new IndirectAttainmentResult();
      const results = await indirectAttainmentModel.getByOutcome(
        outcomeType.toUpperCase(),
        outcomeId
      );

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No indirect attainment data found for this outcome'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          outcome_type: outcomeType.toUpperCase(),
          outcome_id: parseInt(outcomeId),
          outcome_label: results[0].outcome_label,
          results
        }
      });
    } catch (error) {
      console.error('Error in IndirectAttainmentController.getByOutcome:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch indirect attainment results',
        error: error.message
      });
    }
  },

  /**
   * Get comprehensive indirect attainment report for a degree program
   * @route GET /api/indirect-attainment/report/program/:degreeId
   */
  getReport: async (req, res) => {
    try {
      const { degreeId } = req.params;

      if (!degreeId) {
        return res.status(400).json({
          success: false,
          message: 'Degree ID is required'
        });
      }

      const indirectAttainmentModel = new IndirectAttainmentResult();
      const report = await indirectAttainmentModel.getProgramReport(degreeId);

      if (report.plo_attainment.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No indirect attainment data found for this program'
        });
      }

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Error in IndirectAttainmentController.getReport:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate indirect attainment report',
        error: error.message
      });
    }
  },

  /**
   * Recalculate all indirect attainment results for a survey
   * @route POST /api/indirect-attainment/recalculate/:surveyId
   */
  recalculate: async (req, res) => {
    try {
      const { surveyId } = req.params;
      const { outcome_type = 'PLO' } = req.body;

      if (!surveyId) {
        return res.status(400).json({
          success: false,
          message: 'Survey ID is required'
        });
      }

      if (!['PLO', 'CLO'].includes(outcome_type)) {
        return res.status(400).json({
          success: false,
          message: 'Outcome type must be either PLO or CLO'
        });
      }

      // Verify survey exists
      const surveyModel = new Survey();
      const survey = await surveyModel.findById(surveyId);
      
      if (!survey) {
        return res.status(404).json({
          success: false,
          message: 'Survey not found'
        });
      }

      // Recalculate attainment
      const indirectAttainmentModel = new IndirectAttainmentResult();
      const results = await indirectAttainmentModel.calculateFromSurvey(
        surveyId,
        outcome_type,
        null // null means calculate for all outcomes
      );

      res.status(200).json({
        success: true,
        message: 'Indirect attainment recalculated successfully',
        data: {
          survey: {
            id: survey.id,
            title: survey.title,
            type: survey.type
          },
          outcome_type,
          results_count: results.length,
          results
        }
      });
    } catch (error) {
      console.error('Error in IndirectAttainmentController.recalculate:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to recalculate indirect attainment',
        error: error.message
      });
    }
  },

  /**
   * Get summary statistics for indirect attainment across all surveys
   * @route GET /api/indirect-attainment/summary
   * @query degree_id - Filter by degree/program
   * @query outcome_type - Filter by outcome type ('PLO' or 'CLO')
   */
  getSummary: async (req, res) => {
    try {
      const { degree_id, outcome_type } = req.query;

      const indirectAttainmentModel = new IndirectAttainmentResult();
      
      let query = `
        SELECT 
          iar.outcome_type,
          COUNT(DISTINCT iar.survey_id) as total_surveys,
          COUNT(DISTINCT iar.outcome_id) as total_outcomes_assessed,
          AVG(iar.attainment_percentage) as average_attainment,
          SUM(CASE WHEN iar.attainment_status = 'Achieved' THEN 1 ELSE 0 END) as outcomes_achieved,
          COUNT(*) as total_assessments,
          MAX(iar.calculated_at) as last_calculated
        FROM indirect_attainment_results iar
        WHERE 1=1
      `;

      const params = [];

      if (outcome_type && ['PLO', 'CLO'].includes(outcome_type)) {
        query += ` AND iar.outcome_type = ?`;
        params.push(outcome_type);
      }

      if (degree_id) {
        query += ` AND iar.outcome_id IN (
          SELECT id FROM program_learning_outcomes WHERE degree_id = ?
        )`;
        params.push(degree_id);
      }

      query += ` GROUP BY iar.outcome_type`;

      const [summary] = await indirectAttainmentModel.db.execute(query, params);

      res.status(200).json({
        success: true,
        data: {
          summary,
          filters: {
            degree_id: degree_id || null,
            outcome_type: outcome_type || null
          }
        }
      });
    } catch (error) {
      console.error('Error in IndirectAttainmentController.getSummary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch indirect attainment summary',
        error: error.message
      });
    }
  }
};

module.exports = IndirectAttainmentController;
