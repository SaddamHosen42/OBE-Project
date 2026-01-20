import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import enrollmentService from '../services/enrollmentService';

/**
 * useEnrollments Hook
 * Fetches enrollments for a course offering or student
 * @param {Object} params - Query parameters
 * @param {number} params.courseOfferingId - Course offering ID
 * @param {number} params.studentId - Student ID
 * @param {string} params.status - Filter by status
 * @param {string} params.orderBy - Order by field
 * @param {string} params.order - Order direction (ASC/DESC)
 * @param {Object} options - React Query options
 * @returns {Object} Query result with enrollments data
 */
export const useEnrollments = (params = {}, options = {}) => {
  const { courseOfferingId, studentId, ...queryParams } = params;

  return useQuery({
    queryKey: ['enrollments', params],
    queryFn: async () => {
      if (courseOfferingId) {
        return enrollmentService.getByOffering(courseOfferingId, queryParams);
      } else if (studentId) {
        return enrollmentService.getByStudent(studentId, queryParams);
      }
      // If neither is provided, return empty result
      return { success: true, data: [], count: 0 };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!(courseOfferingId || studentId), // Only run if we have an ID
    ...options,
  });
};

/**
 * useEnrollment Hook
 * Fetches a single enrollment by ID
 * @param {number} id - Enrollment ID
 * @param {Object} options - React Query options
 * @returns {Object} Query result with enrollment data
 */
export const useEnrollment = (id, options = {}) => {
  return useQuery({
    queryKey: ['enrollment', id],
    queryFn: () => enrollmentService.getEnrollmentById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
    ...options,
  });
};

/**
 * useEnrollmentStats Hook
 * Fetches enrollment statistics for a course offering
 * @param {number} courseOfferingId - Course offering ID
 * @param {Object} options - React Query options
 * @returns {Object} Query result with enrollment statistics
 */
export const useEnrollmentStats = (courseOfferingId, options = {}) => {
  return useQuery({
    queryKey: ['enrollment-stats', courseOfferingId],
    queryFn: () => enrollmentService.getStats(courseOfferingId),
    staleTime: 5 * 60 * 1000,
    enabled: !!courseOfferingId,
    ...options,
  });
};

/**
 * useCheckEnrollment Hook
 * Checks if a student is enrolled in a course offering
 * @param {number} studentId - Student ID
 * @param {number} courseOfferingId - Course offering ID
 * @param {Object} options - React Query options
 * @returns {Object} Query result with enrollment check data
 */
export const useCheckEnrollment = (studentId, courseOfferingId, options = {}) => {
  return useQuery({
    queryKey: ['check-enrollment', studentId, courseOfferingId],
    queryFn: () => enrollmentService.checkEnrollment(studentId, courseOfferingId),
    staleTime: 5 * 60 * 1000,
    enabled: !!(studentId && courseOfferingId),
    ...options,
  });
};

/**
 * useEnrollStudent Mutation
 * Enrolls a student in a course offering
 * @returns {Object} Mutation object
 */
export const useEnrollStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enrollmentService.enrollStudent,
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['enrollment-stats'] });
      if (variables.student_id) {
        queryClient.invalidateQueries({ 
          queryKey: ['enrollments', { studentId: variables.student_id }] 
        });
      }
      if (variables.course_offering_id) {
        queryClient.invalidateQueries({ 
          queryKey: ['enrollments', { courseOfferingId: variables.course_offering_id }] 
        });
      }
    },
  });
};

/**
 * useBulkEnroll Mutation
 * Enrolls multiple students in a course offering
 * @returns {Object} Mutation object
 */
export const useBulkEnroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enrollmentService.bulkEnroll,
    onSuccess: (data, variables) => {
      // Invalidate all enrollment queries
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['enrollment-stats'] });
      if (variables.course_offering_id) {
        queryClient.invalidateQueries({ 
          queryKey: ['enrollments', { courseOfferingId: variables.course_offering_id }] 
        });
      }
    },
  });
};

/**
 * useDropEnrollment Mutation
 * Drops a student from a course offering
 * @returns {Object} Mutation object
 */
export const useDropEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enrollmentService.dropEnrollment,
    onSuccess: () => {
      // Invalidate all enrollment queries
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['enrollment-stats'] });
    },
  });
};

/**
 * useUpdateEnrollmentStatus Mutation
 * Updates enrollment status
 * @returns {Object} Mutation object
 */
export const useUpdateEnrollmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => enrollmentService.updateStatus(id, status),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['enrollment', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['enrollment-stats'] });
    },
  });
};

/**
 * useDeleteEnrollment Mutation
 * Deletes an enrollment
 * @returns {Object} Mutation object
 */
export const useDeleteEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enrollmentService.deleteEnrollment,
    onSuccess: () => {
      // Invalidate all enrollment queries
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['enrollment-stats'] });
    },
  });
};

// Default export for backward compatibility
export default useEnrollments;
