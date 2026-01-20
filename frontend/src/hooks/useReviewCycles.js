import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

/**
 * useReviewCycles Hook
 * Fetches list of OBE review cycles with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.search - Search query
 * @param {string} params.orderBy - Sort field
 * @param {string} params.order - Sort order (ASC/DESC)
 * @param {number} params.degreeId - Filter by degree ID
 * @param {string} params.status - Filter by status
 * @param {string} params.reviewType - Filter by review type
 * @param {string} params.withDegree - Include degree data
 * @param {Object} options - React Query options
 * @returns {Object} Query result with review cycles data
 */
const useReviewCycles = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['reviewCycles', params],
    queryFn: async () => {
      const response = await api.get('/obe-review-cycles', { params });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * useReviewCycle Hook
 * Fetches a single review cycle by ID
 * @param {number} id - Review cycle ID
 * @param {Object} options - React Query options
 * @returns {Object} Query result with review cycle data
 */
export const useReviewCycle = (id, options = {}) => {
  return useQuery({
    queryKey: ['reviewCycle', id],
    queryFn: async () => {
      const response = await api.get(`/obe-review-cycles/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export default useReviewCycles;
