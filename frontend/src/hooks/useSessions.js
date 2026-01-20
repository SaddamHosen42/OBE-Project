import { useQuery } from '@tanstack/react-query';
import sessionService from '../services/sessionService';

/**
 * useSessions Hook
 * Fetches list of academic sessions with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.search - Search query
 * @param {string} params.orderBy - Sort field
 * @param {string} params.order - Sort order (ASC/DESC)
 * @param {string} params.withSemesters - Include semesters data
 * @param {Object} options - React Query options
 * @returns {Object} Query result with sessions data
 */
const useSessions = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['sessions', params],
    queryFn: () => sessionService.getAllSessions(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export default useSessions;
