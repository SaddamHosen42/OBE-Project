import { useQuery } from '@tanstack/react-query';
import offeringService from '../services/offeringService';

/**
 * useOfferings Hook
 * Fetches list of course offerings with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.search - Search query
 * @param {number} params.courseId - Filter by course
 * @param {number} params.sessionId - Filter by academic session
 * @param {number} params.semesterId - Filter by semester
 * @param {number} params.teacherId - Filter by teacher
 * @param {string} params.status - Filter by status
 * @param {Object} options - React Query options
 * @returns {Object} Query result with offerings data
 */
const useOfferings = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['course-offerings', params],
    queryFn: () => offeringService.getAllOfferings(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export default useOfferings;
