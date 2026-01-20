import { useQuery } from '@tanstack/react-query';
import userService from '../services/userService';

/**
 * useUsers Hook
 * Fetches list of users with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.search - Search query
 * @param {string} params.role - Filter by role
 * @param {string} params.status - Filter by status
 * @param {Object} options - React Query options
 * @returns {Object} Query result with users data
 */
const useUsers = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.getAllUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export default useUsers;
