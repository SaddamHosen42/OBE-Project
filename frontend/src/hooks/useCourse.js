import { useQuery } from '@tanstack/react-query';
import courseService from '../services/courseService';

/**
 * useCourse Hook
 * Fetches a single course by ID
 * @param {number} id - Course ID
 * @param {Object} options - React Query options
 * @returns {Object} Query result with course data
 */
const useCourse = (id, options = {}) => {
  return useQuery({
    queryKey: ['courses', 'detail', id],
    queryFn: () => courseService.getCourseById(id),
    enabled: !!id, // Only run query if ID is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export default useCourse;
