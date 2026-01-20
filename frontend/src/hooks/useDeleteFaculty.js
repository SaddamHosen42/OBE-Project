import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import facultyService from '../services/facultyService';

/**
 * useDeleteFaculty Hook
 * Handles faculty deletion with optimistic updates
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation result
 */
const useDeleteFaculty = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => facultyService.deleteFaculty(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['faculties'] });

      // Snapshot the previous value
      const previousFaculties = queryClient.getQueryData(['faculties']);

      // Optimistically remove the faculty from the list
      if (previousFaculties) {
        queryClient.setQueryData(['faculties'], (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.filter((faculty) => faculty.id !== id),
          };
        });
      }

      // Return a context object with the snapshotted value
      return { previousFaculties };
    },
    onSuccess: (data, variables, context) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['faculties'] });
      queryClient.removeQueries({ queryKey: ['faculty', variables] });
      
      // Show success toast
      toast.success(data.message || 'Faculty deleted successfully');
      
      // Call custom onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      // Rollback to the previous value
      if (context?.previousFaculties) {
        queryClient.setQueryData(['faculties'], context.previousFaculties);
      }

      // Show error toast
      const errorMessage = error.response?.data?.message || 'Failed to delete faculty';
      toast.error(errorMessage);
      
      // Call custom onError callback if provided
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
    ...options,
  });
};

export default useDeleteFaculty;
