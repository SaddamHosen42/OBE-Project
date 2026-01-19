/**
 * Central Route Index
 * Imports and exports all application routes for cleaner app.js
 */

// Authentication & User Management
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');

// Academic Structure
const facultyRoutes = require('./facultyRoutes');
const departmentRoutes = require('./departmentRoutes');
const degreeRoutes = require('./degreeRoutes');
const academicSessionRoutes = require('./academicSessionRoutes');
const semesterRoutes = require('./semesterRoutes');

// Course Management
const courseRoutes = require('./courseRoutes');
const courseOfferingRoutes = require('./courseOfferingRoutes');
const cloRoutes = require('./cloRoutes');

// Program Outcomes
const ploRoutes = require('./ploRoutes');
const peoRoutes = require('./peoRoutes');
const bloomRoutes = require('./bloomRoutes');

// People
const studentRoutes = require('./studentRoutes');
const teacherRoutes = require('./teacherRoutes');
const enrollmentRoutes = require('./enrollmentRoutes');

// Assessment
const assessmentRoutes = require('./assessmentRoutes');
const questionRoutes = require('./questionRoutes');
const rubricRoutes = require('./rubricRoutes');
const marksRoutes = require('./marksRoutes');
const rubricScoreRoutes = require('./rubricScoreRoutes');

// Results & Grades
const gradeRoutes = require('./gradeRoutes');
const courseResultRoutes = require('./courseResultRoutes');
const semesterResultRoutes = require('./semesterResultRoutes');

// Attainment & Analysis
const cloAttainmentRoutes = require('./cloAttainmentRoutes');
const ploAttainmentRoutes = require('./ploAttainmentRoutes');
const attainmentThresholdRoutes = require('./attainmentThresholdRoutes');
const indirectAttainmentRoutes = require('./indirectAttainmentRoutes');

// Action Plans & Review
const actionPlanRoutes = require('./actionPlanRoutes');
const obeReviewCycleRoutes = require('./obeReviewCycleRoutes');

// Reports & Surveys
const reportRoutes = require('./reportRoutes');
const surveyRoutes = require('./surveyRoutes');

// System & Infrastructure
const auditLogRoutes = require('./auditLogRoutes');
const seatAllocationRoutes = require('./seatAllocationRoutes');
const buildingRoutes = require('./buildingRoutes');

/**
 * Register all routes with the Express app
 * @param {Express.Application} app - Express application instance
 */
const registerRoutes = (app) => {
  // Authentication & User Management
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);

  // Academic Structure
  app.use('/api/faculties', facultyRoutes);
  app.use('/api/departments', departmentRoutes);
  app.use('/api/degrees', degreeRoutes);
  app.use('/api/academic-sessions', academicSessionRoutes);
  app.use('/api/semesters', semesterRoutes);

  // Course Management
  app.use('/api/courses', courseRoutes);
  app.use('/api/course-offerings', courseOfferingRoutes);
  app.use('/api/clos', cloRoutes);

  // Program Outcomes
  app.use('/api/plos', ploRoutes);
  app.use('/api/peos', peoRoutes);
  app.use('/api/bloom-taxonomy', bloomRoutes);

  // People
  app.use('/api/students', studentRoutes);
  app.use('/api/teachers', teacherRoutes);
  app.use('/api/enrollments', enrollmentRoutes);

  // Assessment
  app.use('/api/assessments', assessmentRoutes);
  app.use('/api/questions', questionRoutes);
  app.use('/api/rubrics', rubricRoutes);
  app.use('/api/marks', marksRoutes);
  app.use('/api/rubric-scores', rubricScoreRoutes);

  // Results & Grades
  app.use('/api/grades', gradeRoutes);
  app.use('/api/course-results', courseResultRoutes);
  app.use('/api/semester-results', semesterResultRoutes);

  // Attainment & Analysis
  app.use('/api/clo-attainment', cloAttainmentRoutes);
  app.use('/api/plo-attainment', ploAttainmentRoutes);
  app.use('/api/attainment-thresholds', attainmentThresholdRoutes);
  app.use('/api/indirect-attainment', indirectAttainmentRoutes);

  // Action Plans & Review
  app.use('/api/action-plans', actionPlanRoutes);
  app.use('/api/obe-review-cycles', obeReviewCycleRoutes);

  // Reports & Surveys
  app.use('/api/reports', reportRoutes);
  app.use('/api/surveys', surveyRoutes);

  // System & Infrastructure
  app.use('/api/audit-logs', auditLogRoutes);
  app.use('/api/seat-allocations', seatAllocationRoutes);
  app.use('/api/buildings', buildingRoutes);
};

module.exports = {
  registerRoutes,
  // Export individual routes if needed elsewhere
  authRoutes,
  userRoutes,
  facultyRoutes,
  departmentRoutes,
  degreeRoutes,
  academicSessionRoutes,
  semesterRoutes,
  courseRoutes,
  courseOfferingRoutes,
  cloRoutes,
  ploRoutes,
  peoRoutes,
  bloomRoutes,
  studentRoutes,
  teacherRoutes,
  enrollmentRoutes,
  assessmentRoutes,
  questionRoutes,
  rubricRoutes,
  marksRoutes,
  rubricScoreRoutes,
  gradeRoutes,
  courseResultRoutes,
  semesterResultRoutes,
  cloAttainmentRoutes,
  ploAttainmentRoutes,
  attainmentThresholdRoutes,
  indirectAttainmentRoutes,
  actionPlanRoutes,
  obeReviewCycleRoutes,
  reportRoutes,
  surveyRoutes,
  auditLogRoutes,
  seatAllocationRoutes,
  buildingRoutes
};
