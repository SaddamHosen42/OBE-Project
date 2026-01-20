import { useQuery } from '@tanstack/react-query';
import courseService from '../services/courseService';

/**
 * useCourses Hook
 * Fetches list of courses with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.search - Search query
 * @param {number} params.departmentId - Filter by department
 * @param {number} params.degreeId - Filter by degree
 * @param {string} params.type - Filter by course type
 * @param {string} params.level - Filter by level
 * @param {string} params.semester - Filter by semester
 * @param {Object} options - React Query options
 * @returns {Object} Query result with courses data
 */
const useCourses = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => courseService.getAllCourses(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export default useCourses;
