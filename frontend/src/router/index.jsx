import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleBasedRoute from './RoleBasedRoute';
import { SuspenseLoader, LayoutWrapper, AuthLayout } from './RouteComponents';

// Lazy load pages
// Auth Pages
const Login = lazy(() => import('../pages/auth/Login'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'));

// Dashboard
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));

// Admin Pages
const Users = lazy(() => import('../pages/users/UserList'));
const Departments = lazy(() => import('../pages/departments/DepartmentList'));
const Faculties = lazy(() => import('../pages/faculties/FacultyList'));
const Degrees = lazy(() => import('../pages/degrees/DegreeList'));
const Buildings = lazy(() => import('../pages/buildings/BuildingList'));
const Floors = lazy(() => import('../pages/floors/FloorList'));
const Rooms = lazy(() => import('../pages/rooms/RoomList'));
const Sessions = lazy(() => import('../pages/sessions/SessionList'));
const Semesters = lazy(() => import('../pages/semesters/SemesterList'));
const Settings = lazy(() => import('../pages/settings/Settings'));
const AuditLogs = lazy(() => import('../pages/audit/AuditLogs'));

// Course Management Pages
const Courses = lazy(() => import('../pages/courses/Courses'));
const CourseOfferings = lazy(() => import('../pages/offerings/CourseOfferings'));
const Teachers = lazy(() => import('../pages/teachers/TeacherList'));
const Students = lazy(() => import('../pages/students/StudentList'));
const Enrollments = lazy(() => import('../pages/enrollments/Enrollments'));

// OBE Pages
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

// Attainment Pages
const Thresholds = lazy(() => import('../pages/thresholds/AttainmentThresholds'));
const Attainment = lazy(() => import('../pages/attainment/Attainment'));
const Surveys = lazy(() => import('../pages/surveys/Surveys'));

// Reports & Review Pages
const Reports = lazy(() => import('../pages/reports/Reports'));
const ReviewCycles = lazy(() => import('../pages/review/ReviewCycles'));
const ActionPlans = lazy(() => import('../pages/actionplans/ActionPlans'));
const Improvement = lazy(() => import('../pages/improvement/Improvement'));

// Allocation Pages
const SeatAllocation = lazy(() => import('../pages/allocation/SeatAllocation'));

// OBE Dashboard
const OBEDashboard = lazy(() => import('../pages/obe/OBEDashboard'));

/**
 * Router Configuration
 * Defines all application routes with lazy loading and route guards
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  
  // Auth Routes (Public)
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: 'reset-password/:token',
        element: <ResetPassword />,
      },
      {
        index: true,
        element: <Navigate to="/auth/login" replace />,
      },
    ],
  },

  // Protected Routes (Requires Authentication)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <LayoutWrapper />,
        children: [
          // Dashboard (All authenticated users)
          {
            path: '/dashboard',
            element: <Dashboard />,
          },

          // Admin Routes
          {
            path: '/admin',
            element: <RoleBasedRoute allowedRoles={['admin', 'superadmin']} />,
            children: [
              {
                path: 'users',
                element: <Users />,
              },
              {
                path: 'departments',
                element: <Departments />,
              },
              {
                path: 'faculties',
                element: <Faculties />,
              },
              {
                path: 'degrees',
                element: <Degrees />,
              },
              {
                path: 'buildings',
                element: <Buildings />,
              },
              {
                path: 'floors',
                element: <Floors />,
              },
              {
                path: 'rooms',
                element: <Rooms />,
              },
              {
                path: 'sessions',
                element: <Sessions />,
              },
              {
                path: 'semesters',
                element: <Semesters />,
              },
              {
                path: 'settings',
                element: <Settings />,
              },
              {
                path: 'audit-logs',
                element: <AuditLogs />,
              },
              {
                index: true,
                element: <Navigate to="/admin/departments" replace />,
              },
            ],
          },

          // Course Management Routes (Admin & Teachers)
          {
            path: '/courses',
            element: <RoleBasedRoute allowedRoles={['admin', 'superadmin', 'teacher', 'hod']} />,
            children: [
              {
                index: true,
                element: <Courses />,
              },
            ],
          },
          {
            path: '/offerings',
            element: <RoleBasedRoute allowedRoles={['admin', 'superadmin', 'teacher', 'hod']} />,
            children: [
              {
                index: true,
                element: <CourseOfferings />,
              },
            ],
          },
          {
            path: '/teachers',
            element: <RoleBasedRoute allowedRoles={['admin', 'superadmin', 'hod']} />,
            children: [
              {
                index: true,
                element: <Teachers />,
              },
            ],
          },
          {
            path: '/students',
            element: <RoleBasedRoute allowedRoles={['admin', 'superadmin', 'teacher', 'hod']} />,
            children: [
              {
                index: true,
                element: <Students />,
              },
            ],
          },
          {
            path: '/enrollments',
            element: <RoleBasedRoute allowedRoles={['admin', 'superadmin', 'teacher', 'hod']} />,
            children: [
              {
                index: true,
                element: <Enrollments />,
              },
            ],
          },

          // OBE Routes (Admin & Teachers)
          {
            path: '/obe',
            element: <RoleBasedRoute allowedRoles={['admin', 'superadmin', 'teacher', 'hod']} />,
            children: [
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
            ],
          },

          // Attainment Routes (Admin & Teachers)
          {
            path: '/attainment',
            element: <RoleBasedRoute allowedRoles={['admin', 'superadmin', 'teacher', 'hod']} />,
            children: [
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
            ],
          },

          // Reports Routes (Admin & Teachers)
          {
            path: '/reports',
            element: <RoleBasedRoute allowedRoles={['admin', 'superadmin', 'teacher', 'hod']} />,
            children: [
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
            ],
          },

          // Allocation Routes (Admin only)
          {
            path: '/allocation',
            element: <RoleBasedRoute allowedRoles={['admin', 'superadmin']} />,
            children: [
              {
                index: true,
                element: <SeatAllocation />,
              },
            ],
          },

          // Student Routes
          {
            path: '/student',
            element: <RoleBasedRoute allowedRoles={['student']} />,
            children: [
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
            ],
          },
        ],
      },
    ],
  },

  // 404 Not Found
  {
    path: '*',
    element: (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-8">Page not found</p>
          <a href="/dashboard" className="btn btn-primary">
            Go to Dashboard
          </a>
        </div>
      </div>
    ),
  },
]);

export default router;
