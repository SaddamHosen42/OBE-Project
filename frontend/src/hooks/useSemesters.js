import { useQuery } from '@tanstack/react-query';
import semesterService from '../services/semesterService';

/**
 * useSemesters Hook
 * Fetches list of semesters with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.search - Search query
 * @param {string} params.orderBy - Sort field
 * @param {string} params.order - Sort order (ASC/DESC)
 * @param {number} params.session_id - Filter by academic session
 * @param {string} params.withSession - Include session data
 * @param {Object} options - React Query options
 * @returns {Object} Query result with semesters data
 */
const useSemesters = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['semesters', params],
    queryFn: () => semesterService.getAllSemesters(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export default useSemesters;
