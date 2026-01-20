import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// Lazy load admin pages
const Users = lazy(() => import('../pages/users/Users'));
const Departments = lazy(() => import('../pages/departments/Departments'));
const Faculties = lazy(() => import('../pages/faculties/Faculties'));
const Degrees = lazy(() => import('../pages/degrees/Degrees'));
const Buildings = lazy(() => import('../pages/buildings/Buildings'));
const Floors = lazy(() => import('../pages/floors/Floors'));
const Rooms = lazy(() => import('../pages/rooms/Rooms'));
const Sessions = lazy(() => import('../pages/sessions/Sessions'));
const Semesters = lazy(() => import('../pages/semesters/Semesters'));
const Settings = lazy(() => import('../pages/settings/Settings'));
const AuditLogs = lazy(() => import('../pages/audit/AuditLogs'));
const SeatAllocation = lazy(() => import('../pages/allocation/SeatAllocation'));

/**
 * Admin Route Configuration
 * Routes accessible only to admin and superadmin roles
 */
export const adminRoutes = [
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
    path: 'allocation',
    element: <SeatAllocation />,
  },
  {
    index: true,
    element: <Navigate to="/admin/departments" replace />,
  },
];

export default adminRoutes;
