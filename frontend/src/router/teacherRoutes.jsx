import { lazy } from 'react';

// Lazy load teacher pages
const Courses = lazy(() => import('../pages/courses/Courses'));
const CourseOfferings = lazy(() => import('../pages/offerings/CourseOfferings'));
const Teachers = lazy(() => import('../pages/teachers/Teachers'));
const Students = lazy(() => import('../pages/students/Students'));
const Enrollments = lazy(() => import('../pages/enrollments/Enrollments'));
const OBEDashboard = lazy(() => import('../pages/obe/OBEDashboard'));
const PEOs = lazy(() => import('../pages/peos/PEOs'));
const PLOs = lazy(() => import('../pages/plos/PLOs'));
const CLOs = lazy(() => import('../pages/clos/CLOs'));
const Assessments = lazy(() => import('../pages/assessments/Assessments'));
const Questions = lazy(() => import('../pages/questions/Questions'));
const Marks = lazy(() => import('../pages/marks/Marks'));
const Rubrics = lazy(() => import('../pages/rubrics/Rubrics'));
const Scoring = lazy(() => import('../pages/scoring/RubricScoring'));
const Grades = lazy(() => import('../pages/grades/Grades'));
const Results = lazy(() => import('../pages/results/Results'));
const Thresholds = lazy(() => import('../pages/thresholds/AttainmentThresholds'));
const Attainment = lazy(() => import('../pages/attainment/Attainment'));
const Surveys = lazy(() => import('../pages/surveys/Surveys'));
const Reports = lazy(() => import('../pages/reports/Reports'));
const ReviewCycles = lazy(() => import('../pages/review/ReviewCycles'));
const ActionPlans = lazy(() => import('../pages/actionplans/ActionPlans'));
const Improvement = lazy(() => import('../pages/improvement/Improvement'));

/**
 * Teacher Route Configuration
 * Routes accessible to teachers, HODs, and admins
 * Organized by functional areas
 */

// Course Management Routes
export const courseManagementRoutes = [
  {
    path: '/courses',
    element: <Courses />,
  },
  {
    path: '/offerings',
    element: <CourseOfferings />,
  },
  {
    path: '/teachers',
    element: <Teachers />,
  },
  {
    path: '/students',
    element: <Students />,
  },
  {
    path: '/enrollments',
    element: <Enrollments />,
  },
];

// OBE Management Routes
export const obeRoutes = [
  {
    index: true,
    element: <OBEDashboard />,
  },
  {
    path: 'peos',
    element: <PEOs />,
  },
  {
    path: 'plos',
    element: <PLOs />,
  },
  {
    path: 'clos',
    element: <CLOs />,
  },
  {
    path: 'assessments',
    element: <Assessments />,
  },
  {
    path: 'questions',
    element: <Questions />,
  },
  {
    path: 'marks',
    element: <Marks />,
  },
  {
    path: 'rubrics',
    element: <Rubrics />,
  },
  {
    path: 'scoring',
    element: <Scoring />,
  },
  {
    path: 'grades',
    element: <Grades />,
  },
  {
    path: 'results',
    element: <Results />,
  },
];

// Attainment Routes
export const attainmentRoutes = [
  {
    index: true,
    element: <Attainment />,
  },
  {
    path: 'thresholds',
    element: <Thresholds />,
  },
  {
    path: 'surveys',
    element: <Surveys />,
  },
];

// Reports & Review Routes
export const reportRoutes = [
  {
    index: true,
    element: <Reports />,
  },
  {
    path: 'review-cycles',
    element: <ReviewCycles />,
  },
  {
    path: 'action-plans',
    element: <ActionPlans />,
  },
  {
    path: 'improvement',
    element: <Improvement />,
  },
];

export default {
  courseManagementRoutes,
  obeRoutes,
  attainmentRoutes,
  reportRoutes,
};
