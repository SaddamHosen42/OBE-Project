const StudentPLOAttainment = require('../models/StudentPLOAttainment');
const ProgramPLOAttainmentSummary = require('../models/ProgramPLOAttainmentSummary');

/**
 * PLO Attainment Controller
 * Handles PLO attainment calculation, retrieval, and reporting
 */
const PLOAttainmentController = {
  /**
   * Calculate PLO attainment for a single student
   * @route POST /api/plo-attainment/student/calculate
   * Body: {
   *   student_id: number,
   *   degree_id: number,
   *   plo_id: number (optional)
   * }
   */
  calculateStudentAttainment: async (req, res) => {
    try {
      const { student_id, degree_id, plo_id } = req.body;

      if (!student_id || !degree_id) {
        return res.status(400).json({
          success: false,
          message: 'Student ID and Degree ID are required'
        });
      }

      const attainmentModel = new StudentPLOAttainment();
      const attainment = await attainmentModel.calculateAttainment(
        student_id,
        degree_id,
        plo_id || null
      );

      return res.status(200).json({
        success: true,
        message: 'Student PLO attainment calculated successfully',
        data: attainment
      });
    } catch (error) {
      console.error('Error in calculateStudentAttainment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to calculate student PLO attainment',
        error: error.message
      });
    }
  },

  /**
   * Calculate PLO attainment for all students in a program
   * @route POST /api/plo-attainment/program/calculate
   * Body: {
   *   degree_id: number
   * }
   */
  calculateProgramAttainment: async (req, res) => {
    try {
      const { degree_id } = req.body;

      if (!degree_id) {
        return res.status(400).json({
          success: false,
          message: 'Degree ID is required'
        });
      }

      const attainmentModel = new StudentPLOAttainment();
      const summaryModel = new ProgramPLOAttainmentSummary();

      // Calculate attainment for all students
      const studentResults = await attainmentModel.calculateAllStudentsAttainment(degree_id);

      // Calculate program-level summary
      const programSummary = await summaryModel.calculateSummary(degree_id);

      return res.status(200).json({
        success: true,
        message: 'Program PLO attainment calculated successfully',
        data: {
          student_results: studentResults,
          program_summary: programSummary
        }
      });
    } catch (error) {
      console.error('Error in calculateProgramAttainment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to calculate program PLO attainment',
        error: error.message
      });
    }
  },

  /**
   * Get PLO attainment report for a student
   * @route GET /api/plo-attainment/student/:studentId/degree/:degreeId
   */
  getStudentReport: async (req, res) => {
    try {
      const { studentId, degreeId } = req.params;

      if (!studentId || !degreeId) {
        return res.status(400).json({
          success: false,
          message: 'Student ID and Degree ID are required'
        });
      }

      const attainmentModel = new StudentPLOAttainment();

      // Get detailed attainment records
      const attainmentRecords = await attainmentModel.getByStudent(
        parseInt(studentId),
        { degreeId: parseInt(degreeId) }
      );

      // Get summary statistics
      const summary = await attainmentModel.getStudentSummary(
        parseInt(studentId),
        parseInt(degreeId)
      );

      return res.status(200).json({
        success: true,
        message: 'Student PLO attainment report retrieved successfully',
        data: {
          attainment_records: attainmentRecords,
          summary: summary
        }
      });
    } catch (error) {
      console.error('Error in getStudentReport:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get student PLO attainment report',
        error: error.message
      });
    }
  },

  /**
   * Get all PLO attainment records for a student across all programs
   * @route GET /api/plo-attainment/student/:studentId
   */
  getStudentAllAttainment: async (req, res) => {
    try {
      const { studentId } = req.params;

      if (!studentId) {
        return res.status(400).json({
          success: false,
          message: 'Student ID is required'
        });
      }

      const attainmentModel = new StudentPLOAttainment();
      const attainmentRecords = await attainmentModel.getByStudent(parseInt(studentId));

      return res.status(200).json({
        success: true,
        message: 'Student PLO attainment records retrieved successfully',
        data: attainmentRecords
      });
    } catch (error) {
      console.error('Error in getStudentAllAttainment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get student PLO attainment records',
        error: error.message
      });
    }
  },

  /**
   * Get PLO attainment report for a program
   * @route GET /api/plo-attainment/program/:degreeId
   * Query params: plo_id (optional), status (optional)
   */
  getProgramReport: async (req, res) => {
    try {
      const { degreeId } = req.params;
      const { plo_id, status } = req.query;

      if (!degreeId) {
        return res.status(400).json({
          success: false,
          message: 'Degree ID is required'
        });
      }

      const summaryModel = new ProgramPLOAttainmentSummary();

      // Get summary data
      const filters = {};
      if (plo_id) filters.ploId = parseInt(plo_id);
      if (status) filters.status = status;

      const summaryData = await summaryModel.getByDegree(parseInt(degreeId), filters);

      // Get overall statistics
      const overallStats = await summaryModel.getProgramOverallStats(parseInt(degreeId));

      return res.status(200).json({
        success: true,
        message: 'Program PLO attainment report retrieved successfully',
        data: {
          summary: summaryData,
          overall_stats: overallStats
        }
      });
    } catch (error) {
      console.error('Error in getProgramReport:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get program PLO attainment report',
        error: error.message
      });
    }
  },

  /**
   * Get detailed attainment breakdown by PLO for a program
   * @route GET /api/plo-attainment/program/:degreeId/plo/:ploId/details
   */
  getPLODetails: async (req, res) => {
    try {
      const { degreeId, ploId } = req.params;

      if (!degreeId || !ploId) {
        return res.status(400).json({
          success: false,
          message: 'Degree ID and PLO ID are required'
        });
      }

      const summaryModel = new ProgramPLOAttainmentSummary();
      const attainmentModel = new StudentPLOAttainment();

      // Get PLO summary
      const ploSummary = await summaryModel.getByDegree(
        parseInt(degreeId),
        { ploId: parseInt(ploId) }
      );

      // Get student distribution
      const distribution = await summaryModel.getStudentDistribution(
        parseInt(degreeId),
        parseInt(ploId)
      );

      // Get all student attainment records for this PLO
      const studentRecords = await attainmentModel.getByStudent(null, {
        degreeId: parseInt(degreeId),
        ploId: parseInt(ploId)
      });

      return res.status(200).json({
        success: true,
        message: 'PLO details retrieved successfully',
        data: {
          plo_summary: ploSummary.length > 0 ? ploSummary[0] : null,
          distribution: distribution,
          student_records: studentRecords
        }
      });
    } catch (error) {
      console.error('Error in getPLODetails:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get PLO details',
        error: error.message
      });
    }
  },

  /**
   * Get PLO attainment trends for a program
   * @route GET /api/plo-attainment/program/:degreeId/trends
   * Query params: plo_id (optional), limit (optional, default 5)
   */
  getPLOTrends: async (req, res) => {
    try {
      const { degreeId } = req.params;
      const { plo_id, limit } = req.query;

      if (!degreeId) {
        return res.status(400).json({
          success: false,
          message: 'Degree ID is required'
        });
      }

      const summaryModel = new ProgramPLOAttainmentSummary();
      const trends = await summaryModel.getTrends(
        parseInt(degreeId),
        plo_id ? parseInt(plo_id) : null,
        limit ? parseInt(limit) : 5
      );

      return res.status(200).json({
        success: true,
        message: 'PLO trends retrieved successfully',
        data: trends
      });
    } catch (error) {
      console.error('Error in getPLOTrends:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get PLO trends',
        error: error.message
      });
    }
  },

  /**
   * Compare PLO attainment across multiple programs
   * @route POST /api/plo-attainment/compare
   * Body: {
   *   degree_ids: array of numbers
   * }
   */
  comparePrograms: async (req, res) => {
    try {
      const { degree_ids } = req.body;

      if (!degree_ids || !Array.isArray(degree_ids) || degree_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Degree IDs array is required'
        });
      }

      const summaryModel = new ProgramPLOAttainmentSummary();
      const comparison = await summaryModel.comparePrograms(degree_ids);

      return res.status(200).json({
        success: true,
        message: 'Program comparison completed successfully',
        data: comparison
      });
    } catch (error) {
      console.error('Error in comparePrograms:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to compare programs',
        error: error.message
      });
    }
  },

  /**
   * Get PLO breakdown by course for a student
   * @route GET /api/plo-attainment/student/:studentId/degree/:degreeId/plo/:ploId/breakdown
   */
  getPLOBreakdown: async (req, res) => {
    try {
      const { studentId, degreeId, ploId } = req.params;

      if (!studentId || !degreeId || !ploId) {
        return res.status(400).json({
          success: false,
          message: 'Student ID, Degree ID, and PLO ID are required'
        });
      }

      const attainmentModel = new StudentPLOAttainment();
      const breakdown = await attainmentModel.getPLOBreakdownByCourse(
        parseInt(studentId),
        parseInt(degreeId),
        parseInt(ploId)
      );

      return res.status(200).json({
        success: true,
        message: 'PLO breakdown retrieved successfully',
        data: breakdown
      });
    } catch (error) {
      console.error('Error in getPLOBreakdown:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get PLO breakdown',
        error: error.message
      });
    }
  },

  /**
   * Get student distribution by attainment level
   * @route GET /api/plo-attainment/program/:degreeId/plo/:ploId/distribution
   */
  getStudentDistribution: async (req, res) => {
    try {
      const { degreeId, ploId } = req.params;

      if (!degreeId || !ploId) {
        return res.status(400).json({
          success: false,
          message: 'Degree ID and PLO ID are required'
        });
      }

      const summaryModel = new ProgramPLOAttainmentSummary();
      const distribution = await summaryModel.getStudentDistribution(
        parseInt(degreeId),
        parseInt(ploId)
      );

      return res.status(200).json({
        success: true,
        message: 'Student distribution retrieved successfully',
        data: distribution
      });
    } catch (error) {
      console.error('Error in getStudentDistribution:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get student distribution',
        error: error.message
      });
    }
  },

  /**
   * Get overall program statistics
   * @route GET /api/plo-attainment/program/:degreeId/stats
   */
  getProgramStats: async (req, res) => {
    try {
      const { degreeId } = req.params;

      if (!degreeId) {
        return res.status(400).json({
          success: false,
          message: 'Degree ID is required'
        });
      }

      const summaryModel = new ProgramPLOAttainmentSummary();
      const stats = await summaryModel.getProgramOverallStats(parseInt(degreeId));

      return res.status(200).json({
        success: true,
        message: 'Program statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      console.error('Error in getProgramStats:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get program statistics',
        error: error.message
      });
    }
  }
};

module.exports = PLOAttainmentController;
