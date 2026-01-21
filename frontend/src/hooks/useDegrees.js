import { useQuery } from '@tanstack/react-query';
import degreeService from '../services/degreeService';

/**
 * useDegrees Hook
 * Fetches list of degrees with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.search - Search query
 * @param {number} params.department_id - Filter by department
 * @param {string} params.level - Filter by level
 * @param {Object} options - React Query options
 * @returns {Object} Query result with degrees data
 */
export const useDegrees = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['degrees', params],
    queryFn: () => degreeService.getAllDegrees(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export default useDegrees;
