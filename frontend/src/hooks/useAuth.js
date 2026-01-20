import { useEffect, useCallback } from 'react';
import useAuthStore from '../store/authStore';
import authService from '../services/authService';

/**
 * useAuth Hook
 * Provides authentication state and utilities
 * @returns {Object} Authentication state and methods
 */
const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login: loginStore,
    logout: logoutStore,
    updateUser,
    setLoading,
    setError,
    clearError,
    hasRole,
    hasAnyRole,
  } = useAuthStore();

  /**
   * Check authentication status and fetch current user
   */
  const checkAuth = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    
    if (!storedToken) {
      return false;
    }

    try {
      setLoading(true);
      const response = await authService.getCurrentUser();
      
      if (response.success && response.data) {
        loginStore(response.data, storedToken);
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Auth check failed:', err);
      logoutStore();
      return false;
    } finally {
      setLoading(false);
    }
  }, [loginStore, logoutStore, setLoading]);

  /**
   * Refresh user data from server
   */
  const refreshUser = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      setLoading(true);
      const response = await authService.getCurrentUser();
      
      if (response.success && response.data) {
        updateUser(response.data);
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
      setError('Failed to refresh user data');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, updateUser, setLoading, setError]);

  /**
   * Update user profile
   * @param {Object} updates - Partial user data to update
   */
  const updateUserProfile = useCallback((updates) => {
    updateUser(updates);
  }, [updateUser]);

  /**
   * Check if user has permission
   * @param {string} permission - Permission to check
   * @returns {boolean}
   */
  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    
    // Admins have all permissions
    if (user.role === 'admin') return true;
    
    // Check if user has the specific permission
    return user.permissions?.includes(permission) || false;
  }, [user]);

  /**
   * Check if user has any of the specified permissions
   * @param {string[]} permissions - Array of permissions to check
   * @returns {boolean}
   */
  const hasAnyPermission = useCallback((permissions) => {
    if (!user) return false;
    
    // Admins have all permissions
    if (user.role === 'admin') return true;
    
    return permissions.some(permission => 
      user.permissions?.includes(permission)
    );
  }, [user]);

  /**
   * Check if user has all of the specified permissions
   * @param {string[]} permissions - Array of permissions to check
   * @returns {boolean}
   */
  const hasAllPermissions = useCallback((permissions) => {
    if (!user) return false;
    
    // Admins have all permissions
    if (user.role === 'admin') return true;
    
    return permissions.every(permission => 
      user.permissions?.includes(permission)
    );
  }, [user]);

  /**
   * Initialize authentication on mount
   */
  useEffect(() => {
    if (!isAuthenticated && localStorage.getItem('token')) {
      checkAuth();
    }
  }, [isAuthenticated, checkAuth]);

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    
    // Methods
    checkAuth,
    refreshUser,
    updateUserProfile,
    clearError,
    
    // Role checks
    hasRole,
    hasAnyRole,
    
    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};

export default useAuth;
