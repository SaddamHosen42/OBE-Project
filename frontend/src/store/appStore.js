import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Application Store
 * Manages global application state including UI preferences, notifications, and app settings
 */
const useAppStore = create(
  persist(
    (set, get) => ({
      // UI State
      sidebarCollapsed: false,
      theme: 'light',
      
      // Notifications
      notifications: [],
      
      // Loading states
      globalLoading: false,
      loadingMessage: '',
      
      // Modal state
      modals: {},
      
      // Breadcrumbs
      breadcrumbs: [],
      
      // Page title
      pageTitle: 'Dashboard',

      // Actions
      /**
       * Toggle sidebar collapsed state
       */
      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      /**
       * Set sidebar collapsed state
       * @param {boolean} collapsed - Collapsed state
       */
      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed });
      },

      /**
       * Toggle theme between light and dark
       */
      toggleTheme: () => {
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        }));
      },

      /**
       * Set theme
       * @param {'light'|'dark'} theme - Theme name
       */
      setTheme: (theme) => {
        set({ theme });
      },

      /**
       * Add notification
       * @param {Object} notification - Notification object
       * @param {string} notification.id - Unique ID
       * @param {string} notification.type - Type: 'success', 'error', 'warning', 'info'
       * @param {string} notification.message - Message text
       * @param {number} [notification.duration=5000] - Duration in ms
       */
      addNotification: (notification) => {
        const id = notification.id || Date.now().toString();
        const newNotification = {
          id,
          type: notification.type || 'info',
          message: notification.message,
          duration: notification.duration || 5000,
          timestamp: Date.now(),
        };

        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));

        // Auto remove notification after duration
        if (newNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, newNotification.duration);
        }
      },

      /**
       * Remove notification by ID
       * @param {string} id - Notification ID
       */
      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      /**
       * Clear all notifications
       */
      clearNotifications: () => {
        set({ notifications: [] });
      },

      /**
       * Show success notification
       * @param {string} message - Success message
       */
      showSuccess: (message) => {
        get().addNotification({
          type: 'success',
          message,
        });
      },

      /**
       * Show error notification
       * @param {string} message - Error message
       */
      showError: (message) => {
        get().addNotification({
          type: 'error',
          message,
          duration: 7000, // Longer duration for errors
        });
      },

      /**
       * Show warning notification
       * @param {string} message - Warning message
       */
      showWarning: (message) => {
        get().addNotification({
          type: 'warning',
          message,
        });
      },

      /**
       * Show info notification
       * @param {string} message - Info message
       */
      showInfo: (message) => {
        get().addNotification({
          type: 'info',
          message,
        });
      },

      /**
       * Set global loading state
       * @param {boolean} isLoading - Loading state
       * @param {string} [message=''] - Loading message
       */
      setGlobalLoading: (isLoading, message = '') => {
        set({
          globalLoading: isLoading,
          loadingMessage: message,
        });
      },

      /**
       * Open modal
       * @param {string} modalId - Modal ID
       * @param {Object} [data={}] - Modal data
       */
      openModal: (modalId, data = {}) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [modalId]: { isOpen: true, data },
          },
        }));
      },

      /**
       * Close modal
       * @param {string} modalId - Modal ID
       */
      closeModal: (modalId) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [modalId]: { isOpen: false, data: {} },
          },
        }));
      },

      /**
       * Check if modal is open
       * @param {string} modalId - Modal ID
       * @returns {boolean}
       */
      isModalOpen: (modalId) => {
        return get().modals[modalId]?.isOpen || false;
      },

      /**
       * Get modal data
       * @param {string} modalId - Modal ID
       * @returns {Object}
       */
      getModalData: (modalId) => {
        return get().modals[modalId]?.data || {};
      },

      /**
       * Set breadcrumbs
       * @param {Array} breadcrumbs - Array of breadcrumb objects
       */
      setBreadcrumbs: (breadcrumbs) => {
        set({ breadcrumbs });
      },

      /**
       * Set page title
       * @param {string} title - Page title
       */
      setPageTitle: (title) => {
        set({ pageTitle: title });
        document.title = `${title} - OBE System`;
      },

      /**
       * Reset app store to initial state (except theme and sidebar preferences)
       */
      reset: () => {
        set({
          notifications: [],
          globalLoading: false,
          loadingMessage: '',
          modals: {},
          breadcrumbs: [],
          pageTitle: 'Dashboard',
        });
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
);

export default useAppStore;
