import { useQuery } from '@tanstack/react-query';
import userService from '../services/userService';

/**
 * useUser Hook
 * Fetches a single user by ID
 * @param {number} id - User ID
 * @param {Object} options - React Query options
 * @returns {Object} Query result with user data
 */
const useUser = (id, options = {}) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUserById(id),
    enabled: !!id, // Only fetch if ID is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export default useUser;
