import { useQuery } from '@tanstack/react-query';
import studentService from '../services/studentService';

/**
 * useStudents Hook
 * Fetches list of students with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.search - Search query
 * @param {number} params.departmentId - Filter by department
 * @param {number} params.degreeId - Filter by degree
 * @param {string} params.academicStatus - Filter by academic status
 * @param {number} params.batchYear - Filter by batch year
 * @param {string} params.orderBy - Order by field
 * @param {string} params.order - Order direction (ASC/DESC)
 * @param {Object} options - React Query options
 * @returns {Object} Query result with students data
 */
const useStudents = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['students', params],
    queryFn: () => studentService.getAllStudents(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export default useStudents;
