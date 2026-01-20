import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

/**
 * RoleBasedRoute Component
 * Wrapper component that protects routes based on user roles
 * Redirects to unauthorized page if user doesn't have required role
 * 
 * @component
 * @param {Object} props
 * @param {string[]} props.allowedRoles - Array of roles allowed to access the route
 * @param {string} props.redirectTo - Path to redirect if unauthorized (default: /dashboard)
 * 
 * @example
 * <Route element={<RoleBasedRoute allowedRoles={['admin', 'superadmin']} />}>
 *   <Route path="/admin/users" element={<Users />} />
 * </Route>
 */
const RoleBasedRoute = ({ allowedRoles = [], redirectTo = '/dashboard' }) => {
  const { user, hasAnyRole } = useAuthStore();

  // Check if user has any of the allowed roles
  const hasAccess = hasAnyRole(allowedRoles);

  // Show unauthorized message and redirect if user doesn't have access
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="alert alert-error max-w-md mx-auto mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Unauthorized: You don't have permission to access this page.</span>
          </div>
          <div className="space-y-4">
            <p className="text-gray-600">
              Your role: <span className="font-semibold">{user?.role || 'Unknown'}</span>
            </p>
            <p className="text-gray-600">
              Required roles: <span className="font-semibold">{allowedRoles.join(', ')}</span>
            </p>
            <div className="mt-6">
              <a href={redirectTo} className="btn btn-primary">
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render child routes if user has access
  return <Outlet />;
};

export default RoleBasedRoute;
