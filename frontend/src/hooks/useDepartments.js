import { useQuery } from '@tanstack/react-query';
import departmentService from '../services/departmentService';

/**
 * useDepartments Hook
 * Fetches list of departments with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.search - Search query
 * @param {number} params.faculty_id - Filter by faculty
 * @param {string} params.status - Filter by status
 * @param {Object} options - React Query options
 * @returns {Object} Query result with departments data
 */
const useDepartments = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['departments', params],
    queryFn: () => departmentService.getAllDepartments(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export default useDepartments;
