import { useQuery } from '@tanstack/react-query';
import facultyService from '../services/facultyService';

/**
 * useFaculty Hook
 * Fetches a single faculty by ID
 * @param {number} id - Faculty ID
 * @param {Object} options - React Query options
 * @returns {Object} Query result with faculty data
 */
const useFaculty = (id, options = {}) => {
  return useQuery({
    queryKey: ['faculty', id],
    queryFn: () => facultyService.getFacultyById(id),
    enabled: !!id, // Only fetch if ID is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export default useFaculty;
