const BaseModel = require('./BaseModel');

/**
 * OBEReport Model
 * Generates comprehensive OBE reports for CLOs, PLOs, courses, and programs
 * @extends BaseModel
 */
class OBEReport extends BaseModel {
  /**
   * Constructor for OBEReport model
   */
  constructor() {
    super('course_clo_attainment_summary'); // Use as base table, though we'll query multiple tables
  }

  /**
   * Generate CLO attainment report for a course offering
   * Includes detailed CLO statistics, student performance, and assessment breakdown
   * @param {number} courseOfferingId - Course offering ID
   * @param {Object} options - Report options
   * @param {boolean} options.includeStudents - Include individual student data
   * @param {boolean} options.includeAssessments - Include assessment breakdown
   * @returns {Promise<Object>} CLO attainment report
   */
  async generateCLOReport(courseOfferingId, options = {}) {
    try {
      if (!courseOfferingId) {
        throw new Error('Course Offering ID is required');
      }

      const {
        includeStudents = false,
        includeAssessments = true
      } = options;

      // Get course offering details
      const courseOfferingQuery = `
        SELECT 
          co.id,
          co.academic_year,
          co.semester,
          co.section,
          c.course_code,
          c.course_title,
          c.credit_hours,
          d.department_name,
          f.name as instructor_name,
          as_session.session_name,
          as_session.start_date,
          as_session.end_date
        FROM course_offerings co
        JOIN courses c ON co.course_id = c.id
        LEFT JOIN departments d ON c.department_id = d.id
        LEFT JOIN faculty f ON co.faculty_id = f.id
        LEFT JOIN academic_sessions as_session ON co.session_id = as_session.id
        WHERE co.id = ?
      `;
      const [courseOffering] = await this.db.query(courseOfferingQuery, [courseOfferingId]);

      if (!courseOffering || courseOffering.length === 0) {
        throw new Error('Course offering not found');
      }

      // Get CLO attainment summary
      const cloSummaryQuery = `
        SELECT 
          clo.id as clo_id,
          clo.CLO_ID as clo_number,
          clo.CLO_Description as description,
          clo.target_attainment,
          clo.weight_percentage,
          bt.level_name as bloom_level,
          bt.level_number as bloom_level_number,
          ccas.total_students,
          ccas.students_achieved,
          ccas.students_not_achieved,
          ccas.average_attainment,
          ccas.min_attainment,
          ccas.max_attainment,
          ccas.std_deviation,
          ccas.attainment_percentage,
          ccas.attainment_status,
          ccas.calculated_at
        FROM course_learning_outcomes clo
        LEFT JOIN course_clo_attainment_summary ccas 
          ON clo.id = ccas.clo_id AND ccas.course_offering_id = ?
        LEFT JOIN bloom_taxonomy_levels bt ON clo.bloom_level_id = bt.id
        WHERE clo.course_id = (SELECT course_id FROM course_offerings WHERE id = ?)
        ORDER BY clo.CLO_ID
      `;
      const cloSummary = await this.db.query(cloSummaryQuery, [courseOfferingId, courseOfferingId]);

      // Get PLO mappings for each CLO
      const ploMappingsQuery = `
        SELECT 
          clop.clo_id,
          plo.id as plo_id,
          plo.PLO_ID as plo_number,
          plo.PLO_Description as plo_description,
          clop.mapping_strength
        FROM clo_plo_mappings clop
        JOIN program_learning_outcomes plo ON clop.plo_id = plo.id
        WHERE clop.clo_id IN (
          SELECT id FROM course_learning_outcomes 
          WHERE course_id = (SELECT course_id FROM course_offerings WHERE id = ?)
        )
        ORDER BY clop.clo_id, plo.PLO_ID
      `;
      const ploMappings = await this.db.query(ploMappingsQuery, [courseOfferingId]);

      // Organize PLO mappings by CLO
      const ploMappingsByCLO = {};
      ploMappings[0]?.forEach(mapping => {
        if (!ploMappingsByCLO[mapping.clo_id]) {
          ploMappingsByCLO[mapping.clo_id] = [];
        }
        ploMappingsByCLO[mapping.clo_id].push({
          plo_id: mapping.plo_id,
          plo_number: mapping.plo_number,
          plo_description: mapping.plo_description,
          mapping_strength: mapping.mapping_strength
        });
      });

      // Add PLO mappings to each CLO
      const cloData = cloSummary[0]?.map(clo => ({
        ...clo,
        plo_mappings: ploMappingsByCLO[clo.clo_id] || []
      }));

      // Get assessment breakdown if requested
      let assessmentBreakdown = null;
      if (includeAssessments) {
        const assessmentQuery = `
          SELECT 
            at.type_name as assessment_type,
            ac.component_name,
            ac.weightage,
            ac.total_marks,
            q.clo_id,
            q.marks as question_marks,
            COUNT(DISTINCT sam.student_id) as students_assessed,
            AVG(sam.marks_obtained) as avg_marks,
            SUM(sam.marks_obtained) as total_marks_obtained,
            SUM(q.marks) as total_possible_marks
          FROM assessment_components ac
          JOIN assessment_types at ON ac.assessment_type_id = at.id
          LEFT JOIN questions q ON ac.id = q.assessment_component_id
          LEFT JOIN student_assessment_marks sam ON q.id = sam.question_id
          WHERE ac.course_offering_id = ?
          GROUP BY at.type_name, ac.component_name, ac.weightage, ac.total_marks, q.clo_id, q.marks
          ORDER BY at.type_name, ac.component_name, q.clo_id
        `;
        assessmentBreakdown = await this.db.query(assessmentQuery, [courseOfferingId]);
      }

      // Get student-level data if requested
      let studentData = null;
      if (includeStudents) {
        const studentQuery = `
          SELECT 
            s.id as student_id,
            s.roll_number,
            s.name as student_name,
            s.email,
            sca.clo_id,
            clo.CLO_ID as clo_number,
            sca.attainment_percentage,
            sca.attainment_status,
            sca.total_marks_obtained,
            sca.total_possible_marks,
            sca.calculated_at
          FROM students s
          JOIN course_enrollments ce ON s.id = ce.student_id
          LEFT JOIN student_clo_attainment sca ON s.id = sca.student_id 
            AND sca.course_offering_id = ?
          LEFT JOIN course_learning_outcomes clo ON sca.clo_id = clo.id
          WHERE ce.course_offering_id = ?
          ORDER BY s.roll_number, clo.CLO_ID
        `;
        studentData = await this.db.query(studentQuery, [courseOfferingId, courseOfferingId]);
      }

      // Calculate overall course statistics
      const overallStats = {
        total_clos: cloData?.length || 0,
        achieved_clos: cloData?.filter(clo => clo.attainment_status === 'Achieved').length || 0,
        not_achieved_clos: cloData?.filter(clo => clo.attainment_status === 'Not Achieved').length || 0,
        average_attainment: cloData?.length > 0 
          ? cloData.reduce((sum, clo) => sum + (clo.average_attainment || 0), 0) / cloData.length 
          : 0,
        overall_success_rate: cloData?.length > 0
          ? (cloData.filter(clo => clo.attainment_status === 'Achieved').length / cloData.length) * 100
          : 0
      };

      return {
        report_type: 'CLO_ATTAINMENT',
        generated_at: new Date().toISOString(),
        course_offering: courseOffering[0],
        overall_statistics: overallStats,
        clo_attainment: cloData || [],
        assessment_breakdown: assessmentBreakdown?.[0] || null,
        student_data: studentData?.[0] || null
      };

    } catch (error) {
      console.error('Error generating CLO report:', error);
      throw error;
    }
  }

  /**
   * Generate PLO attainment report for a program
   * Includes PLO statistics, contributing courses, and trend analysis
   * @param {number} degreeId - Degree/Program ID
   * @param {Object} options - Report options
   * @param {number} options.sessionId - Academic session ID (optional)
   * @param {boolean} options.includeCourses - Include contributing courses
   * @param {boolean} options.includeTrends - Include historical trends
   * @returns {Promise<Object>} PLO attainment report
   */
  async generatePLOReport(degreeId, options = {}) {
    try {
      if (!degreeId) {
        throw new Error('Degree ID is required');
      }

      const {
        sessionId = null,
        includeCourses = true,
        includeTrends = false
      } = options;

      // Get degree/program details
      const degreeQuery = `
        SELECT 
          d.id,
          d.degree_name,
          d.degree_level,
          d.total_credit_hours,
          dept.department_name,
          dept.department_code
        FROM degrees d
        LEFT JOIN departments dept ON d.department_id = dept.id
        WHERE d.id = ?
      `;
      const [degree] = await this.db.query(degreeQuery, [degreeId]);

      if (!degree || degree.length === 0) {
        throw new Error('Degree not found');
      }

      // Build session filter
      let sessionFilter = '';
      let sessionParams = [degreeId];
      if (sessionId) {
        sessionFilter = 'AND ppas.session_id = ?';
        sessionParams.push(sessionId);
      }

      // Get PLO attainment summary
      const ploSummaryQuery = `
        SELECT 
          plo.id as plo_id,
          plo.PLO_ID as plo_number,
          plo.PLO_Description as description,
          plo.target_attainment,
          ppas.total_students,
          ppas.students_achieved,
          ppas.students_not_achieved,
          ppas.average_attainment,
          ppas.min_attainment,
          ppas.max_attainment,
          ppas.std_deviation,
          ppas.attainment_percentage,
          ppas.attainment_status,
          ppas.calculated_at,
          as_session.session_name,
          as_session.academic_year
        FROM program_learning_outcomes plo
        LEFT JOIN program_plo_attainment_summary ppas ON plo.id = ppas.plo_id ${sessionFilter}
        LEFT JOIN academic_sessions as_session ON ppas.session_id = as_session.id
        WHERE plo.degree_id = ?
        ORDER BY plo.PLO_ID
      `;
      const ploSummary = await this.db.query(ploSummaryQuery, sessionParams);

      // Get contributing courses for each PLO if requested
      let contributingCourses = null;
      if (includeCourses) {
        const coursesQuery = `
          SELECT 
            plo.id as plo_id,
            c.course_code,
            c.course_title,
            c.credit_hours,
            COUNT(DISTINCT co.id) as offerings_count,
            AVG(ccas.attainment_percentage) as avg_attainment,
            clop.mapping_strength
          FROM program_learning_outcomes plo
          JOIN clo_plo_mappings clop ON plo.id = clop.plo_id
          JOIN course_learning_outcomes clo ON clop.clo_id = clo.id
          JOIN courses c ON clo.course_id = c.id
          LEFT JOIN course_offerings co ON c.id = co.course_id
          LEFT JOIN course_clo_attainment_summary ccas ON clo.id = ccas.clo_id 
            AND co.id = ccas.course_offering_id
          WHERE plo.degree_id = ?
          GROUP BY plo.id, c.course_code, c.course_title, c.credit_hours, clop.mapping_strength
          ORDER BY plo.id, c.course_code
        `;
        contributingCourses = await this.db.query(coursesQuery, [degreeId]);

        // Organize courses by PLO
        const coursesByPLO = {};
        contributingCourses[0]?.forEach(course => {
          if (!coursesByPLO[course.plo_id]) {
            coursesByPLO[course.plo_id] = [];
          }
          coursesByPLO[course.plo_id].push({
            course_code: course.course_code,
            course_title: course.course_title,
            credit_hours: course.credit_hours,
            offerings_count: course.offerings_count,
            avg_attainment: course.avg_attainment,
            mapping_strength: course.mapping_strength
          });
        });

        // Add contributing courses to each PLO
        ploSummary[0]?.forEach(plo => {
          plo.contributing_courses = coursesByPLO[plo.plo_id] || [];
        });
      }

      // Get historical trends if requested
      let trends = null;
      if (includeTrends) {
        const trendsQuery = `
          SELECT 
            plo.id as plo_id,
            plo.PLO_ID as plo_number,
            as_session.session_name,
            as_session.academic_year,
            ppas.attainment_percentage,
            ppas.attainment_status,
            ppas.calculated_at
          FROM program_learning_outcomes plo
          JOIN program_plo_attainment_summary ppas ON plo.id = ppas.plo_id
          JOIN academic_sessions as_session ON ppas.session_id = as_session.id
          WHERE plo.degree_id = ?
          ORDER BY plo.PLO_ID, as_session.start_date
        `;
        trends = await this.db.query(trendsQuery, [degreeId]);
      }

      // Calculate overall program statistics
      const overallStats = {
        total_plos: ploSummary[0]?.length || 0,
        achieved_plos: ploSummary[0]?.filter(plo => plo.attainment_status === 'Achieved').length || 0,
        not_achieved_plos: ploSummary[0]?.filter(plo => plo.attainment_status === 'Not Achieved').length || 0,
        average_attainment: ploSummary[0]?.length > 0
          ? ploSummary[0].reduce((sum, plo) => sum + (plo.average_attainment || 0), 0) / ploSummary[0].length
          : 0,
        overall_success_rate: ploSummary[0]?.length > 0
          ? (ploSummary[0].filter(plo => plo.attainment_status === 'Achieved').length / ploSummary[0].length) * 100
          : 0
      };

      return {
        report_type: 'PLO_ATTAINMENT',
        generated_at: new Date().toISOString(),
        degree: degree[0],
        overall_statistics: overallStats,
        plo_attainment: ploSummary[0] || [],
        trends: trends?.[0] || null
      };

    } catch (error) {
      console.error('Error generating PLO report:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive course report
   * Includes course details, enrollments, CLO attainment, assessments, and grades
   * @param {number} courseOfferingId - Course offering ID
   * @param {Object} options - Report options
   * @returns {Promise<Object>} Course report
   */
  async generateCourseReport(courseOfferingId, options = {}) {
    try {
      if (!courseOfferingId) {
        throw new Error('Course Offering ID is required');
      }

      // Get course offering details
      const courseQuery = `
        SELECT 
          co.id,
          co.academic_year,
          co.semester,
          co.section,
          c.course_code,
          c.course_title,
          c.credit_hours,
          c.contact_hours,
          c.course_type,
          d.degree_name,
          d.degree_level,
          dept.department_name,
          f.name as instructor_name,
          f.email as instructor_email,
          as_session.session_name,
          as_session.start_date,
          as_session.end_date
        FROM course_offerings co
        JOIN courses c ON co.course_id = c.id
        LEFT JOIN degrees d ON c.degree_id = d.id
        LEFT JOIN departments dept ON c.department_id = dept.id
        LEFT JOIN faculty f ON co.faculty_id = f.id
        LEFT JOIN academic_sessions as_session ON co.session_id = as_session.id
        WHERE co.id = ?
      `;
      const [courseDetails] = await this.db.query(courseQuery, [courseOfferingId]);

      if (!courseDetails || courseDetails.length === 0) {
        throw new Error('Course offering not found');
      }

      // Get enrollment statistics
      const enrollmentQuery = `
        SELECT 
          COUNT(*) as total_enrolled,
          SUM(CASE WHEN ce.status = 'Active' THEN 1 ELSE 0 END) as active_students,
          SUM(CASE WHEN ce.status = 'Dropped' THEN 1 ELSE 0 END) as dropped_students,
          SUM(CASE WHEN ce.status = 'Withdrawn' THEN 1 ELSE 0 END) as withdrawn_students
        FROM course_enrollments ce
        WHERE ce.course_offering_id = ?
      `;
      const [enrollmentStats] = await this.db.query(enrollmentQuery, [courseOfferingId]);

      // Get CLO summary
      const cloReport = await this.generateCLOReport(courseOfferingId, { 
        includeStudents: false, 
        includeAssessments: false 
      });

      // Get assessment components
      const assessmentQuery = `
        SELECT 
          at.type_name,
          ac.component_name,
          ac.weightage,
          ac.total_marks,
          ac.conducted_date,
          COUNT(DISTINCT sam.student_id) as students_assessed,
          AVG(sam.marks_obtained) as average_marks,
          MAX(sam.marks_obtained) as max_marks,
          MIN(sam.marks_obtained) as min_marks
        FROM assessment_components ac
        JOIN assessment_types at ON ac.assessment_type_id = at.id
        LEFT JOIN questions q ON ac.id = q.assessment_component_id
        LEFT JOIN student_assessment_marks sam ON q.id = sam.question_id
        WHERE ac.course_offering_id = ?
        GROUP BY at.type_name, ac.component_name, ac.weightage, ac.total_marks, ac.conducted_date
        ORDER BY ac.conducted_date, at.type_name
      `;
      const assessmentComponents = await this.db.query(assessmentQuery, [courseOfferingId]);

      // Get grade distribution
      const gradeQuery = `
        SELECT 
          gs.grade,
          COUNT(*) as student_count,
          AVG(cr.total_marks_obtained) as avg_marks,
          gs.grade_point
        FROM course_results cr
        JOIN grade_scales gs ON cr.grade_scale_id = gs.id
        WHERE cr.course_offering_id = ?
        GROUP BY gs.grade, gs.grade_point
        ORDER BY gs.grade_point DESC
      `;
      const gradeDistribution = await this.db.query(gradeQuery, [courseOfferingId]);

      // Get course statistics
      const statsQuery = `
        SELECT 
          AVG(cr.total_marks_obtained) as average_marks,
          MAX(cr.total_marks_obtained) as highest_marks,
          MIN(cr.total_marks_obtained) as lowest_marks,
          STDDEV(cr.total_marks_obtained) as std_deviation,
          AVG(cr.gpa) as average_gpa,
          COUNT(CASE WHEN cr.status = 'Pass' THEN 1 END) as passed_students,
          COUNT(CASE WHEN cr.status = 'Fail' THEN 1 END) as failed_students
        FROM course_results cr
        WHERE cr.course_offering_id = ?
      `;
      const [courseStats] = await this.db.query(statsQuery, [courseOfferingId]);

      return {
        report_type: 'COURSE_REPORT',
        generated_at: new Date().toISOString(),
        course_details: courseDetails[0],
        enrollment_statistics: enrollmentStats[0] || {},
        clo_attainment_summary: {
          overall_statistics: cloReport.overall_statistics,
          clo_summary: cloReport.clo_attainment
        },
        assessment_components: assessmentComponents[0] || [],
        grade_distribution: gradeDistribution[0] || [],
        course_statistics: courseStats[0] || {}
      };

    } catch (error) {
      console.error('Error generating course report:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive program report
   * Includes program details, PLO attainment, course statistics, and overall performance
   * @param {number} degreeId - Degree/Program ID
   * @param {Object} options - Report options
   * @param {number} options.sessionId - Academic session ID (optional)
   * @returns {Promise<Object>} Program report
   */
  async generateProgramReport(degreeId, options = {}) {
    try {
      if (!degreeId) {
        throw new Error('Degree ID is required');
      }

      const { sessionId = null } = options;

      // Get program details
      const programQuery = `
        SELECT 
          d.id,
          d.degree_name,
          d.degree_level,
          d.duration_years,
          d.total_credit_hours,
          dept.department_name,
          dept.department_code,
          dept.hod_name
        FROM degrees d
        LEFT JOIN departments dept ON d.department_id = dept.id
        WHERE d.id = ?
      `;
      const [programDetails] = await this.db.query(programQuery, [degreeId]);

      if (!programDetails || programDetails.length === 0) {
        throw new Error('Program not found');
      }

      // Get PLO report
      const ploReport = await this.generatePLOReport(degreeId, {
        sessionId,
        includeCourses: true,
        includeTrends: true
      });

      // Build session filter for queries
      let sessionFilter = '';
      const sessionParams = [degreeId];
      if (sessionId) {
        sessionFilter = 'AND co.session_id = ?';
        sessionParams.push(sessionId);
      }

      // Get course statistics
      const courseStatsQuery = `
        SELECT 
          COUNT(DISTINCT c.id) as total_courses,
          COUNT(DISTINCT co.id) as total_offerings,
          SUM(c.credit_hours) as total_credits,
          AVG(ccas.attainment_percentage) as avg_clo_attainment
        FROM courses c
        LEFT JOIN course_offerings co ON c.id = co.course_id ${sessionFilter}
        LEFT JOIN course_clo_attainment_summary ccas ON co.id = ccas.course_offering_id
        WHERE c.degree_id = ?
      `;
      const [courseStats] = await this.db.query(courseStatsQuery, sessionParams);

      // Get student statistics
      const studentStatsQuery = `
        SELECT 
          COUNT(DISTINCT s.id) as total_students,
          COUNT(DISTINCT CASE WHEN sr.status = 'Pass' THEN s.id END) as active_students,
          AVG(sr.sgpa) as average_sgpa,
          AVG(sr.cgpa) as average_cgpa
        FROM students s
        LEFT JOIN semester_results sr ON s.id = sr.student_id
        WHERE s.degree_id = ?
      `;
      const [studentStats] = await this.db.query(studentStatsQuery, [degreeId]);

      // Get PEO information
      const peoQuery = `
        SELECT 
          id,
          PEO_ID as peo_number,
          PEO_Description as description
        FROM program_educational_objectives
        WHERE degree_id = ?
        ORDER BY PEO_ID
      `;
      const peos = await this.db.query(peoQuery, [degreeId]);

      // Get action plans if any
      const actionPlansQuery = `
        SELECT 
          ap.id,
          ap.plan_title,
          ap.issue_description,
          ap.proposed_action,
          ap.status,
          ap.priority,
          ap.created_at,
          ap.deadline,
          COUNT(apo.id) as outcome_count
        FROM action_plans ap
        LEFT JOIN action_plan_outcomes apo ON ap.id = apo.action_plan_id
        WHERE ap.degree_id = ?
        GROUP BY ap.id, ap.plan_title, ap.issue_description, ap.proposed_action, 
                 ap.status, ap.priority, ap.created_at, ap.deadline
        ORDER BY ap.created_at DESC
        LIMIT 10
      `;
      const actionPlans = await this.db.query(actionPlansQuery, [degreeId]);

      return {
        report_type: 'PROGRAM_REPORT',
        generated_at: new Date().toISOString(),
        program_details: programDetails[0],
        plo_attainment_summary: {
          overall_statistics: ploReport.overall_statistics,
          plo_summary: ploReport.plo_attainment
        },
        course_statistics: courseStats[0] || {},
        student_statistics: studentStats[0] || {},
        program_educational_objectives: peos[0] || [],
        recent_action_plans: actionPlans[0] || []
      };

    } catch (error) {
      console.error('Error generating program report:', error);
      throw error;
    }
  }
}

module.exports = OBEReport;
