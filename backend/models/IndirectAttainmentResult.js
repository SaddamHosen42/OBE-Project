const BaseModel = require('./BaseModel');

/**
 * IndirectAttainmentResult Model
 * Manages indirect assessment attainment calculations based on surveys
 * Indirect assessment measures include surveys, exit interviews, alumni feedback, etc.
 * @extends BaseModel
 */
class IndirectAttainmentResult extends BaseModel {
  /**
   * Constructor for IndirectAttainmentResult model
   */
  constructor() {
    super('indirect_attainment_results');
  }

  /**
   * Calculate indirect attainment from survey responses
   * Maps survey results to PLO/CLO attainment based on survey questions linked to outcomes
   * @param {number} surveyId - Survey ID
   * @param {string} outcomeType - Type of outcome ('PLO' or 'CLO')
   * @param {number} outcomeId - Specific PLO or CLO ID (optional)
   * @returns {Promise<Array>} Calculated indirect attainment data
   */
  async calculateFromSurvey(surveyId, outcomeType = 'PLO', outcomeId = null) {
    try {
      if (!surveyId) {
        throw new Error('Survey ID is required');
      }

      if (!['PLO', 'CLO'].includes(outcomeType)) {
        throw new Error('Outcome type must be either PLO or CLO');
      }

      // Determine the table and columns based on outcome type
      const outcomeTable = outcomeType === 'PLO' 
        ? 'program_learning_outcomes' 
        : 'course_learning_outcomes';
      const outcomeNoColumn = outcomeType === 'PLO' ? 'PLO_No' : 'CLO_No';
      const outcomeDescColumn = outcomeType === 'PLO' 
        ? 'PLO_Description' 
        : 'CLO_Description';

      // Build query to calculate attainment from survey responses
      let query = `
        SELECT 
          o.id as outcome_id,
          o.${outcomeNoColumn} as outcome_number,
          o.${outcomeDescColumn} as outcome_description,
          o.target_attainment,
          s.id as survey_id,
          s.title as survey_title,
          s.type as survey_type,
          COUNT(DISTINCT sr.id) as total_responses,
          COUNT(DISTINCT sq.id) as total_questions_mapped,
          AVG(CASE 
            WHEN sq.question_type = 'rating' THEN 
              CAST(sa.answer_text AS DECIMAL(10,2)) / 
              CAST(JSON_EXTRACT(sq.options, '$.max_value') AS DECIMAL(10,2)) * 100
            WHEN sq.question_type = 'likert' THEN
              (CAST(sa.answer_text AS DECIMAL(10,2)) - 1) / 
              (CAST(JSON_EXTRACT(sq.options, '$.scale_size') AS DECIMAL(10,2)) - 1) * 100
            WHEN sq.question_type = 'yes_no' THEN
              CASE WHEN LOWER(sa.answer_text) = 'yes' THEN 100 ELSE 0 END
            ELSE NULL
          END) as average_attainment_percentage,
          CASE 
            WHEN AVG(CASE 
              WHEN sq.question_type = 'rating' THEN 
                CAST(sa.answer_text AS DECIMAL(10,2)) / 
                CAST(JSON_EXTRACT(sq.options, '$.max_value') AS DECIMAL(10,2)) * 100
              WHEN sq.question_type = 'likert' THEN
                (CAST(sa.answer_text AS DECIMAL(10,2)) - 1) / 
                (CAST(JSON_EXTRACT(sq.options, '$.scale_size') AS DECIMAL(10,2)) - 1) * 100
              WHEN sq.question_type = 'yes_no' THEN
                CASE WHEN LOWER(sa.answer_text) = 'yes' THEN 100 ELSE 0 END
              ELSE NULL
            END) >= o.target_attainment 
            THEN 'Achieved'
            ELSE 'Not Achieved'
          END as attainment_status,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'question_id', sq.id,
              'question_text', sq.question_text,
              'question_type', sq.question_type,
              'average_response', AVG(CASE 
                WHEN sq.question_type = 'rating' THEN CAST(sa.answer_text AS DECIMAL(10,2))
                WHEN sq.question_type = 'likert' THEN CAST(sa.answer_text AS DECIMAL(10,2))
                WHEN sq.question_type = 'yes_no' THEN 
                  CASE WHEN LOWER(sa.answer_text) = 'yes' THEN 1 ELSE 0 END
                ELSE NULL
              END)
            )
          ) as question_details,
          NOW() as calculated_at
        FROM ${outcomeTable} o
        INNER JOIN survey_outcome_mappings som ON o.id = som.outcome_id 
          AND som.outcome_type = '${outcomeType}'
        INNER JOIN survey_questions sq ON som.question_id = sq.id
        INNER JOIN surveys s ON sq.survey_id = s.id
        LEFT JOIN survey_answers sa ON sq.id = sa.question_id
        LEFT JOIN survey_responses sr ON sa.response_id = sr.id
        WHERE s.id = ?
      `;

      const params = [surveyId];

      // If specific outcome ID is provided, filter by it
      if (outcomeId) {
        query += ` AND o.id = ?`;
        params.push(outcomeId);
      }

      query += `
        GROUP BY o.id, o.${outcomeNoColumn}, o.${outcomeDescColumn}, 
                 o.target_attainment, s.id, s.title, s.type
        ORDER BY o.${outcomeNoColumn}
      `;

      const [rows] = await this.db.execute(query, params);

      // If calculating for all outcomes, save results to database
      if (!outcomeId && rows.length > 0) {
        await this.saveCalculatedResults(rows, surveyId, outcomeType);
      }

      return rows;
    } catch (error) {
      console.error('Error in calculateFromSurvey:', error);
      throw error;
    }
  }

  /**
   * Save calculated indirect attainment results to database
   * @param {Array} results - Array of calculated results
   * @param {number} surveyId - Survey ID
   * @param {string} outcomeType - Type of outcome ('PLO' or 'CLO')
   * @returns {Promise<void>}
   */
  async saveCalculatedResults(results, surveyId, outcomeType) {
    try {
      for (const result of results) {
        const data = {
          survey_id: surveyId,
          outcome_type: outcomeType,
          outcome_id: result.outcome_id,
          total_responses: result.total_responses,
          attainment_percentage: result.average_attainment_percentage,
          attainment_status: result.attainment_status,
          target_attainment: result.target_attainment,
          question_details: typeof result.question_details === 'string' 
            ? result.question_details 
            : JSON.stringify(result.question_details),
          calculated_at: new Date()
        };

        // Check if result already exists
        const existingQuery = `
          SELECT id FROM ${this.tableName}
          WHERE survey_id = ? AND outcome_type = ? AND outcome_id = ?
        `;
        const [existing] = await this.db.execute(existingQuery, [
          surveyId, outcomeType, result.outcome_id
        ]);

        if (existing.length > 0) {
          // Update existing record
          await this.update(existing[0].id, data);
        } else {
          // Create new record
          await this.create(data);
        }
      }
    } catch (error) {
      console.error('Error in saveCalculatedResults:', error);
      throw error;
    }
  }

  /**
   * Get indirect attainment results for a specific survey
   * @param {number} surveyId - Survey ID
   * @param {string} outcomeType - Type of outcome ('PLO' or 'CLO')
   * @returns {Promise<Array>} Indirect attainment results
   */
  async getBySurvey(surveyId, outcomeType = null) {
    try {
      let query = `
        SELECT 
          iar.*,
          s.title as survey_title,
          s.type as survey_type,
          CASE 
            WHEN iar.outcome_type = 'PLO' THEN 
              (SELECT CONCAT(PLO_No, ': ', PLO_Description) 
               FROM program_learning_outcomes 
               WHERE id = iar.outcome_id)
            WHEN iar.outcome_type = 'CLO' THEN 
              (SELECT CONCAT(CLO_No, ': ', CLO_Description) 
               FROM course_learning_outcomes 
               WHERE id = iar.outcome_id)
          END as outcome_label
        FROM ${this.tableName} iar
        INNER JOIN surveys s ON iar.survey_id = s.id
        WHERE iar.survey_id = ?
      `;

      const params = [surveyId];

      if (outcomeType) {
        query += ` AND iar.outcome_type = ?`;
        params.push(outcomeType);
      }

      query += ` ORDER BY iar.outcome_type, iar.outcome_id`;

      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error in getBySurvey:', error);
      throw error;
    }
  }

  /**
   * Get indirect attainment results for a specific outcome
   * @param {string} outcomeType - Type of outcome ('PLO' or 'CLO')
   * @param {number} outcomeId - Outcome ID
   * @returns {Promise<Array>} Indirect attainment results across multiple surveys
   */
  async getByOutcome(outcomeType, outcomeId) {
    try {
      const query = `
        SELECT 
          iar.*,
          s.title as survey_title,
          s.type as survey_type,
          s.start_date,
          s.end_date,
          CASE 
            WHEN iar.outcome_type = 'PLO' THEN 
              (SELECT CONCAT(PLO_No, ': ', PLO_Description) 
               FROM program_learning_outcomes 
               WHERE id = iar.outcome_id)
            WHEN iar.outcome_type = 'CLO' THEN 
              (SELECT CONCAT(CLO_No, ': ', CLO_Description) 
               FROM course_learning_outcomes 
               WHERE id = iar.outcome_id)
          END as outcome_label
        FROM ${this.tableName} iar
        INNER JOIN surveys s ON iar.survey_id = s.id
        WHERE iar.outcome_type = ? AND iar.outcome_id = ?
        ORDER BY iar.calculated_at DESC
      `;

      const [rows] = await this.db.execute(query, [outcomeType, outcomeId]);
      return rows;
    } catch (error) {
      console.error('Error in getByOutcome:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive indirect attainment report for a degree program
   * Aggregates indirect attainment across all surveys for all PLOs in a program
   * @param {number} degreeId - Degree/Program ID
   * @returns {Promise<Object>} Comprehensive indirect attainment report
   */
  async getProgramReport(degreeId) {
    try {
      // Get all PLOs for the degree
      const plosQuery = `
        SELECT 
          plo.id,
          plo.PLO_No,
          plo.PLO_Description,
          plo.target_attainment,
          COUNT(DISTINCT iar.survey_id) as surveys_count,
          AVG(iar.attainment_percentage) as average_indirect_attainment,
          SUM(iar.total_responses) as total_responses_across_surveys,
          CASE 
            WHEN AVG(iar.attainment_percentage) >= plo.target_attainment 
            THEN 'Achieved'
            ELSE 'Not Achieved'
          END as overall_status
        FROM program_learning_outcomes plo
        LEFT JOIN ${this.tableName} iar ON plo.id = iar.outcome_id 
          AND iar.outcome_type = 'PLO'
        WHERE plo.degree_id = ?
        GROUP BY plo.id, plo.PLO_No, plo.PLO_Description, plo.target_attainment
        ORDER BY plo.PLO_No
      `;

      const [plos] = await this.db.execute(plosQuery, [degreeId]);

      // Get survey details
      const surveysQuery = `
        SELECT DISTINCT
          s.id,
          s.title,
          s.type,
          s.start_date,
          s.end_date,
          COUNT(DISTINCT iar.outcome_id) as outcomes_assessed,
          AVG(iar.attainment_percentage) as average_attainment
        FROM surveys s
        INNER JOIN ${this.tableName} iar ON s.id = iar.survey_id
        WHERE iar.outcome_type = 'PLO' 
          AND iar.outcome_id IN (
            SELECT id FROM program_learning_outcomes WHERE degree_id = ?
          )
        GROUP BY s.id, s.title, s.type, s.start_date, s.end_date
        ORDER BY s.end_date DESC
      `;

      const [surveys] = await this.db.execute(surveysQuery, [degreeId]);

      return {
        degree_id: degreeId,
        plo_attainment: plos,
        surveys_used: surveys,
        summary: {
          total_plos: plos.length,
          plos_achieved: plos.filter(p => p.overall_status === 'Achieved').length,
          total_surveys: surveys.length,
          overall_attainment: plos.reduce((sum, p) => sum + (p.average_indirect_attainment || 0), 0) / plos.length
        },
        generated_at: new Date()
      };
    } catch (error) {
      console.error('Error in getProgramReport:', error);
      throw error;
    }
  }
}

module.exports = IndirectAttainmentResult;
