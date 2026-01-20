import { useQuery } from '@tanstack/react-query';
import teacherService from '../services/teacherService';

/**
 * useTeachers Hook
 * Fetches list of teachers with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.search - Search query
 * @param {number} params.departmentId - Filter by department
 * @param {string} params.orderBy - Order by field
 * @param {string} params.order - Order direction (ASC/DESC)
 * @param {boolean} params.withDetails - Include full teacher details
 * @param {Object} options - React Query options
 * @returns {Object} Query result with teachers data
 */
const useTeachers = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['teachers', params],
    queryFn: () => teacherService.getAllTeachers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export default useTeachers;
