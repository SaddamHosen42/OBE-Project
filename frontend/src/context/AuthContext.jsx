import React, { createContext, useContext, useMemo } from 'react';
import useAuthStore from '../store/authStore';

/**
 * Authentication Context
 * Provides authentication state and methods throughout the application
 */
const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Wraps the application to provide authentication context
 */
export const AuthProvider = ({ children }) => {
  const authStore = useAuthStore();

  const value = useMemo(() => ({
    user: authStore.user,
    token: authStore.token,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading,
    error: authStore.error,
    login: authStore.login,
    logout: authStore.logout,
    updateUser: authStore.updateUser,
    setLoading: authStore.setLoading,
    setError: authStore.setError,
    clearError: authStore.clearError,
    hasRole: authStore.hasRole,
    hasAnyRole: authStore.hasAnyRole,
    hasPermission: authStore.hasPermission,
    refreshToken: authStore.refreshToken,
    initializeAuth: authStore.initializeAuth,
  }), [authStore]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth Hook
 * Custom hook to use authentication context
 * @returns {Object} Authentication state and methods
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
