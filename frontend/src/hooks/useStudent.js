import { useQuery } from '@tanstack/react-query';
import studentService from '../services/studentService';

/**
 * useStudent Hook
 * Fetches a single student by ID with related data
 * @param {number} id - Student ID
 * @param {Object} options - React Query options
 * @returns {Object} Query result with student data
 */
const useStudent = (id, options = {}) => {
  return useQuery({
    queryKey: ['student', id],
    queryFn: () => studentService.getStudentById(id),
    enabled: !!id, // Only fetch if ID is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * useStudentBySID Hook
 * Fetches a single student by Student ID (SID)
 * @param {string} sid - Student ID Number
 * @param {Object} options - React Query options
 * @returns {Object} Query result with student data
 */
export const useStudentBySID = (sid, options = {}) => {
  return useQuery({
    queryKey: ['student', 'sid', sid],
    queryFn: () => studentService.getStudentBySID(sid),
    enabled: !!sid, // Only fetch if SID is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * useStudentEnrollments Hook
 * Fetches student's course enrollments
 * @param {number} id - Student ID
 * @param {Object} params - Query parameters
 * @param {Object} options - React Query options
 * @returns {Object} Query result with enrollments data
 */
export const useStudentEnrollments = (id, params = {}, options = {}) => {
  return useQuery({
    queryKey: ['student', id, 'enrollments', params],
    queryFn: () => studentService.getStudentEnrollments(id, params),
    enabled: !!id,
    staleTime: 3 * 60 * 1000, // 3 minutes
    ...options,
  });
};

/**
 * useStudentResults Hook
 * Fetches student's academic results
 * @param {number} id - Student ID
 * @param {Object} options - React Query options
 * @returns {Object} Query result with results data
 */
export const useStudentResults = (id, options = {}) => {
  return useQuery({
    queryKey: ['student', id, 'results'],
    queryFn: () => studentService.getStudentResults(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * useStudentAttainment Hook
 * Fetches student's attainment report
 * @param {number} id - Student ID
 * @param {Object} params - Query parameters
 * @param {Object} options - React Query options
 * @returns {Object} Query result with attainment data
 */
export const useStudentAttainment = (id, params = {}, options = {}) => {
  return useQuery({
    queryKey: ['student', id, 'attainment', params],
    queryFn: () => studentService.getStudentAttainment(id, params),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * useStudentsByDepartment Hook
 * Fetches students by department
 * @param {number} departmentId - Department ID
 * @param {Object} params - Query parameters
 * @param {Object} options - React Query options
 * @returns {Object} Query result with students data
 */
export const useStudentsByDepartment = (departmentId, params = {}, options = {}) => {
  return useQuery({
    queryKey: ['students', 'department', departmentId, params],
    queryFn: () => studentService.getStudentsByDepartment(departmentId, params),
    enabled: !!departmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * useStudentsByDegree Hook
 * Fetches students by degree
 * @param {number} degreeId - Degree ID
 * @param {Object} params - Query parameters
 * @param {Object} options - React Query options
 * @returns {Object} Query result with students data
 */
export const useStudentsByDegree = (degreeId, params = {}, options = {}) => {
  return useQuery({
    queryKey: ['students', 'degree', degreeId, params],
    queryFn: () => studentService.getStudentsByDegree(degreeId, params),
    enabled: !!degreeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export default useStudent;
