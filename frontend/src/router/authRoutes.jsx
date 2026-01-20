import { lazy } from 'react';

// Lazy load auth pages
const Login = lazy(() => import('../pages/auth/Login'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'));

/**
 * Authentication Route Configuration
 * Public routes for login, password reset, etc.
 */
export const authRoutes = [
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
];

export default authRoutes;
