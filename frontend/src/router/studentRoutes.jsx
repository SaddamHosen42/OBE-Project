import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// Lazy load student pages
const Courses = lazy(() => import('../pages/courses/Courses'));
const Grades = lazy(() => import('../pages/grades/Grades'));
const Results = lazy(() => import('../pages/results/Results'));

/**
 * Student Route Configuration
 * Routes accessible only to students
 * Limited to viewing their own course information, grades, and results
 */
export const studentRoutes = [
  {
    path: 'courses',
    element: <Courses />,
  },
  {
    path: 'grades',
    element: <Grades />,
  },
  {
    path: 'results',
    element: <Results />,
  },
  {
    index: true,
    element: <Navigate to="/student/courses" replace />,
  },
];

export default studentRoutes;
