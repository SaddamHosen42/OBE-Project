const OBEReport = require('../models/OBEReport');
const Course = require('../models/Course');
const Student = require('../models/Student');
const CourseOffering = require('../models/CourseOffering');
const db = require('../config/database');

/**
 * Report Controller
 * Handles generation and export of various OBE reports
 */
const ReportController = {
  /**
   * Get dashboard statistics
   * @route GET /api/reports/dashboard-stats
   * Returns statistics like total courses, students, average attainment, pending assessments
   */
  getDashboardStats: async (req, res) => {
    try {
      const userRole = req.user?.role;
      const userId = req.user?.id;

      // Initialize stats object
      const stats = {
        totalCourses: 0,
        totalStudents: 0,
        averageAttainment: 0,
        pendingAssessments: 0
      };

      // Get total courses
      const courseModel = new Course();
      const courses = await courseModel.findAll();
      stats.totalCourses = courses.length;

      // Get total students
      const studentModel = new Student();
      const students = await studentModel.findAll();
      stats.totalStudents = students.length;

      // Get average attainment from CLO attainment summary
      try {
        const [attainmentRows] = await db.execute(`
          SELECT AVG(attainment_percentage) as avg_attainment
          FROM course_clo_attainment_summary
          WHERE attainment_percentage IS NOT NULL
        `);
        stats.averageAttainment = attainmentRows[0]?.avg_attainment 
          ? Math.round(attainmentRows[0].avg_attainment) 
          : 0;
      } catch (error) {
        console.log('Could not fetch attainment data:', error.message);
        stats.averageAttainment = 0;
      }

      // Get pending assessments count
      try {
        const [assessmentRows] = await db.execute(`
          SELECT COUNT(*) as pending_count
          FROM assessment_components
          WHERE is_published = 0
        `);
        stats.pendingAssessments = assessmentRows[0]?.pending_count || 0;
      } catch (error) {
        console.log('Could not fetch pending assessments:', error.message);
        stats.pendingAssessments = 0;
      }

      return res.status(200).json({
        success: true,
        message: 'Dashboard statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard statistics',
        error: error.message
      });
    }
  },
  /**
   * Generate CLO attainment report for a course offering
   * @route GET /api/reports/clo-attainment/:courseOfferingId
   * Query params: {
   *   includeStudents: boolean (default: false),
   *   includeAssessments: boolean (default: true)
   * }
   */
  generateCLOAttainmentReport: async (req, res) => {
    try {
      const { courseOfferingId } = req.params;
      const { includeStudents, includeAssessments } = req.query;

      if (!courseOfferingId) {
        return res.status(400).json({
          success: false,
          message: 'Course Offering ID is required'
        });
      }

      const reportModel = new OBEReport();
      const report = await reportModel.generateCLOReport(
        parseInt(courseOfferingId),
        {
          includeStudents: includeStudents === 'true',
          includeAssessments: includeAssessments !== 'false' // default true
        }
      );

      return res.status(200).json({
        success: true,
        message: 'CLO attainment report generated successfully',
        data: report
      });
    } catch (error) {
      console.error('Error in generateCLOAttainmentReport:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate CLO attainment report',
        error: error.message
      });
    }
  },

  /**
   * Generate PLO attainment report for a program
   * @route GET /api/reports/plo-attainment/:degreeId
   * Query params: {
   *   sessionId: number (optional),
   *   includeCourses: boolean (default: true),
   *   includeTrends: boolean (default: false)
   * }
   */
  generatePLOAttainmentReport: async (req, res) => {
    try {
      const { degreeId } = req.params;
      const { sessionId, includeCourses, includeTrends } = req.query;

      if (!degreeId) {
        return res.status(400).json({
          success: false,
          message: 'Degree ID is required'
        });
      }

      const reportModel = new OBEReport();
      const report = await reportModel.generatePLOReport(
        parseInt(degreeId),
        {
          sessionId: sessionId ? parseInt(sessionId) : null,
          includeCourses: includeCourses !== 'false', // default true
          includeTrends: includeTrends === 'true'
        }
      );

      return res.status(200).json({
        success: true,
        message: 'PLO attainment report generated successfully',
        data: report
      });
    } catch (error) {
      console.error('Error in generatePLOAttainmentReport:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate PLO attainment report',
        error: error.message
      });
    }
  },

  /**
   * Generate comprehensive course report
   * @route GET /api/reports/course/:courseOfferingId
   */
  generateCourseReport: async (req, res) => {
    try {
      const { courseOfferingId } = req.params;

      if (!courseOfferingId) {
        return res.status(400).json({
          success: false,
          message: 'Course Offering ID is required'
        });
      }

      const reportModel = new OBEReport();
      const report = await reportModel.generateCourseReport(
        parseInt(courseOfferingId)
      );

      return res.status(200).json({
        success: true,
        message: 'Course report generated successfully',
        data: report
      });
    } catch (error) {
      console.error('Error in generateCourseReport:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate course report',
        error: error.message
      });
    }
  },

  /**
   * Generate comprehensive program report
   * @route GET /api/reports/program/:degreeId
   * Query params: {
   *   sessionId: number (optional)
   * }
   */
  generateProgramReport: async (req, res) => {
    try {
      const { degreeId } = req.params;
      const { sessionId } = req.query;

      if (!degreeId) {
        return res.status(400).json({
          success: false,
          message: 'Degree ID is required'
        });
      }

      const reportModel = new OBEReport();
      const report = await reportModel.generateProgramReport(
        parseInt(degreeId),
        {
          sessionId: sessionId ? parseInt(sessionId) : null
        }
      );

      return res.status(200).json({
        success: true,
        message: 'Program report generated successfully',
        data: report
      });
    } catch (error) {
      console.error('Error in generateProgramReport:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate program report',
        error: error.message
      });
    }
  },

  /**
   * Export report in various formats (PDF, Excel, CSV)
   * @route POST /api/reports/export
   * Body: {
   *   reportType: 'clo' | 'plo' | 'course' | 'program',
   *   reportId: number,
   *   format: 'pdf' | 'excel' | 'csv',
   *   reportData: object (optional - if not provided, will generate fresh)
   * }
   */
  exportReport: async (req, res) => {
    try {
      const { reportType, reportId, format, reportData } = req.body;

      if (!reportType || !reportId || !format) {
        return res.status(400).json({
          success: false,
          message: 'Report type, ID, and format are required'
        });
      }

      // Validate format
      const validFormats = ['pdf', 'excel', 'csv', 'json'];
      if (!validFormats.includes(format.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: `Invalid format. Supported formats: ${validFormats.join(', ')}`
        });
      }

      let data = reportData;

      // If report data not provided, generate it
      if (!data) {
        const reportModel = new OBEReport();
        
        switch (reportType.toLowerCase()) {
          case 'clo':
            data = await reportModel.generateCLOReport(parseInt(reportId), {
              includeStudents: true,
              includeAssessments: true
            });
            break;
          case 'plo':
            data = await reportModel.generatePLOReport(parseInt(reportId), {
              includeCourses: true,
              includeTrends: true
            });
            break;
          case 'course':
            data = await reportModel.generateCourseReport(parseInt(reportId));
            break;
          case 'program':
            data = await reportModel.generateProgramReport(parseInt(reportId));
            break;
          default:
            return res.status(400).json({
              success: false,
              message: `Invalid report type: ${reportType}. Supported types: clo, plo, course, program`
            });
        }
      }

      // Handle different export formats
      switch (format.toLowerCase()) {
        case 'json':
          // Return JSON response
          return res.status(200).json({
            success: true,
            message: 'Report exported successfully',
            data: data
          });

        case 'csv':
          // Convert to CSV (simplified - for full implementation, use a CSV library)
          const csv = convertToCSV(data);
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="${reportType}_report_${reportId}.csv"`);
          return res.status(200).send(csv);

        case 'excel':
          // For Excel export, you would typically use a library like 'exceljs'
          // This is a placeholder response
          return res.status(200).json({
            success: true,
            message: 'Excel export feature is under development. Please use JSON or CSV format.',
            note: 'To implement: Install exceljs package and generate .xlsx file'
          });

        case 'pdf':
          // For PDF export, you would typically use a library like 'pdfkit' or 'puppeteer'
          // This is a placeholder response
          return res.status(200).json({
            success: true,
            message: 'PDF export feature is under development. Please use JSON or CSV format.',
            note: 'To implement: Install pdfkit or puppeteer package and generate PDF file'
          });

        default:
          return res.status(400).json({
            success: false,
            message: 'Unsupported export format'
          });
      }

    } catch (error) {
      console.error('Error in exportReport:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to export report',
        error: error.message
      });
    }
  },

  /**
   * Get list of available reports
   * @route GET /api/reports/available
   * Query params: {
   *   degreeId: number (optional),
   *   courseId: number (optional)
   * }
   */
  getAvailableReports: async (req, res) => {
    try {
      const { degreeId, courseId } = req.query;

      const availableReports = {
        clo_reports: [],
        plo_reports: [],
        course_reports: [],
        program_reports: []
      };

      const reportModel = new OBEReport();

      // Get available course offerings for CLO and course reports
      if (courseId) {
        const offeringsQuery = `
          SELECT 
            co.id,
            co.academic_year,
            co.semester,
            co.section,
            c.course_code,
            c.course_title,
            COUNT(DISTINCT ce.student_id) as enrolled_students
          FROM course_offerings co
          JOIN courses c ON co.course_id = c.id
          LEFT JOIN course_enrollments ce ON co.id = ce.course_offering_id
          WHERE c.id = ?
          GROUP BY co.id, co.academic_year, co.semester, co.section, 
                   c.course_code, c.course_title
          ORDER BY co.academic_year DESC, co.semester DESC
        `;
        const [offerings] = await reportModel.db.query(offeringsQuery, [parseInt(courseId)]);
        availableReports.clo_reports = offerings || [];
        availableReports.course_reports = offerings || [];
      }

      // Get available programs for PLO and program reports
      if (degreeId) {
        const programQuery = `
          SELECT 
            d.id,
            d.degree_name,
            d.degree_level,
            COUNT(DISTINCT s.id) as total_students
          FROM degrees d
          LEFT JOIN students s ON d.id = s.degree_id
          WHERE d.id = ?
          GROUP BY d.id, d.degree_name, d.degree_level
        `;
        const [programs] = await reportModel.db.query(programQuery, [parseInt(degreeId)]);
        availableReports.plo_reports = programs || [];
        availableReports.program_reports = programs || [];
      }

      return res.status(200).json({
        success: true,
        message: 'Available reports retrieved successfully',
        data: availableReports
      });

    } catch (error) {
      console.error('Error in getAvailableReports:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve available reports',
        error: error.message
      });
    }
  }
};

/**
 * Helper function to convert report data to CSV format
 * @param {Object} data - Report data
 * @returns {string} CSV string
 */
function convertToCSV(data) {
  try {
    let csv = '';
    
    // Add report header
    csv += `Report Type:,${data.report_type}\n`;
    csv += `Generated At:,${data.generated_at}\n\n`;

    // Handle different report types
    if (data.report_type === 'CLO_ATTAINMENT' && data.clo_attainment) {
      csv += 'CLO Number,Description,Target,Average Attainment,Status\n';
      data.clo_attainment.forEach(clo => {
        csv += `${clo.clo_number},${escapeCSV(clo.description)},${clo.target_attainment},${clo.average_attainment},${clo.attainment_status}\n`;
      });
    } else if (data.report_type === 'PLO_ATTAINMENT' && data.plo_attainment) {
      csv += 'PLO Number,Description,Target,Average Attainment,Status\n';
      data.plo_attainment.forEach(plo => {
        csv += `${plo.plo_number},${escapeCSV(plo.description)},${plo.target_attainment},${plo.average_attainment},${plo.attainment_status}\n`;
      });
    } else {
      // Generic conversion for other report types
      csv += JSON.stringify(data);
    }

    return csv;
  } catch (error) {
    console.error('Error converting to CSV:', error);
    return '';
  }
}

/**
 * Helper function to escape CSV special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeCSV(str) {
  if (str === null || str === undefined) return '';
  str = String(str);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

module.exports = ReportController;
