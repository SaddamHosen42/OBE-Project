import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Authentication Store
 * Manages user authentication state, tokens, and user information
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      /**
       * Set user and token after successful login
       * @param {Object} user - User object
       * @param {string} token - JWT token
       */
      login: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
          error: null,
        });
        // Store token in localStorage for API interceptor
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      },

      /**
       * Clear user data and logout
       */
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      },

      /**
       * Update user information
       * @param {Object} updates - Partial user object with updates
       */
      updateUser: (updates) => {
        const currentUser = get().user;
        const updatedUser = { ...currentUser, ...updates };
        set({ user: updatedUser });
        localStorage.setItem('user', JSON.stringify(updatedUser));
      },

      /**
       * Set loading state
       * @param {boolean} isLoading - Loading state
       */
      setLoading: (isLoading) => {
        set({ isLoading });
      },

      /**
       * Set error message
       * @param {string|null} error - Error message
       */
      setError: (error) => {
        set({ error });
      },

      /**
       * Clear error message
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Check if user has specific role
       * @param {string} role - Role to check
       * @returns {boolean}
       */
      hasRole: (role) => {
        const user = get().user;
        return user?.role === role;
      },

      /**
       * Check if user has any of the specified roles
       * @param {string[]} roles - Array of roles to check
       * @returns {boolean}
       */
      hasAnyRole: (roles) => {
        const user = get().user;
        return roles.includes(user?.role);
      },

      /**
       * Check if user has permission
       * @param {string} permission - Permission to check
       * @returns {boolean}
       */
      hasPermission: (permission) => {
        const user = get().user;
        return user?.permissions?.includes(permission) || false;
      },

      /**
       * Refresh token
       * @param {string} newToken - New JWT token
       */
      refreshToken: (newToken) => {
        set({ token: newToken });
        localStorage.setItem('token', newToken);
      },

      /**
       * Initialize auth state from localStorage
       */
      initializeAuth: () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            set({
              user,
              token,
              isAuthenticated: true,
            });
          } catch (error) {
            console.error('Failed to parse user from localStorage:', error);
            get().logout();
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
