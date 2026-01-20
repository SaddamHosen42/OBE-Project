import { create } from 'zustand';

/**
 * Global Loading State Store
 * Manages application-wide loading states
 */
const useLoadingStore = create((set) => ({
  isLoading: false,
  loadingMessage: '',
  
  /**
   * Set loading state
   * @param {boolean} loading - Loading state
   * @param {string} message - Optional loading message
   */
  setLoading: (loading, message = '') => set({ 
    isLoading: loading, 
    loadingMessage: message 
  }),
  
  /**
   * Clear loading state
   */
  clearLoading: () => set({ 
    isLoading: false, 
    loadingMessage: '' 
  }),
}));

export default useLoadingStore;
