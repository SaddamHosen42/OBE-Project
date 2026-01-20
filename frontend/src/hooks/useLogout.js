import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import authService from '../services/authService';

/**
 * useLogout Hook
 * Handles user logout functionality
 * @returns {Object} Logout state and methods
 */
const useLogout = () => {
  const navigate = useNavigate();
  const { logout: logoutStore, setLoading, setError } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setErrorState] = useState(null);

  /**
   * Logout user
   * @param {Object} options - Logout options
   * @param {string} options.redirectTo - Path to redirect after logout
   * @param {boolean} options.silent - Don't call API, just clear local state
   * @param {Function} options.onSuccess - Callback on successful logout
   * @param {Function} options.onError - Callback on logout error
   */
  const logout = useCallback(async (options = {}) => {
    const {
      redirectTo = '/auth/login',
      silent = false,
      onSuccess,
      onError,
    } = options;

    try {
      setIsLoading(true);
      setErrorState(null);
      setLoading(true);
      setError(null);

      // Call logout API unless silent mode
      if (!silent) {
        try {
          await authService.logout();
        } catch (apiError) {
          // Log but don't fail - still clear local state
          console.warn('Logout API call failed, continuing with local cleanup:', apiError);
        }
      }

      // Clear auth store and localStorage
      logoutStore();
      
      // Clear any additional stored data
      localStorage.removeItem('rememberMe');
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Redirect to login page
      setTimeout(() => {
        navigate(redirectTo);
      }, 100);

      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred during logout';
      
      setErrorState(errorMessage);
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }

      console.error('Logout error:', err);
      
      // Even on error, clear local state to be safe
      logoutStore();
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  }, [navigate, logoutStore, setLoading, setError]);

  /**
   * Logout and redirect to home page
   */
  const logoutToHome = useCallback(async () => {
    return logout({ redirectTo: '/' });
  }, [logout]);

  /**
   * Logout and redirect to login page
   */
  const logoutToLogin = useCallback(async () => {
    return logout({ redirectTo: '/auth/login' });
  }, [logout]);

  /**
   * Silent logout (clear local state only, no API call)
   * Useful for token expiration or unauthorized responses
   */
  const silentLogout = useCallback(async (redirectTo = '/auth/login') => {
    return logout({ redirectTo, silent: true });
  }, [logout]);

  /**
   * Logout due to session expiration
   */
  const logoutExpired = useCallback(async () => {
    return logout({
      redirectTo: '/auth/login?expired=true',
      silent: true,
    });
  }, [logout]);

  /**
   * Clear logout error
   */
  const clearError = useCallback(() => {
    setErrorState(null);
    setError(null);
  }, [setError]);

  return {
    // State
    isLoading,
    error,
    
    // Methods
    logout,
    logoutToHome,
    logoutToLogin,
    silentLogout,
    logoutExpired,
    clearError,
  };
};

export default useLogout;
