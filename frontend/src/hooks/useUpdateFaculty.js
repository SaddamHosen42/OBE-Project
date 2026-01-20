import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import facultyService from '../services/facultyService';

/**
 * useUpdateFaculty Hook
 * Handles faculty updates with optimistic updates
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation result
 */
const useUpdateFaculty = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, facultyData }) => facultyService.updateFaculty(id, facultyData),
    onMutate: async ({ id, facultyData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['faculty', id] });
      await queryClient.cancelQueries({ queryKey: ['faculties'] });

      // Snapshot the previous value
      const previousFaculty = queryClient.getQueryData(['faculty', id]);
      const previousFaculties = queryClient.getQueryData(['faculties']);

      // Optimistically update to the new value
      if (previousFaculty) {
        queryClient.setQueryData(['faculty', id], (old) => ({
          ...old,
          data: { ...old.data, ...facultyData },
        }));
      }

      // Return a context object with the snapshotted values
      return { previousFaculty, previousFaculties };
    },
    onSuccess: (data, variables, context) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['faculty', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['faculties'] });
      
      // Show success toast
      toast.success(data.message || 'Faculty updated successfully');
      
      // Call custom onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      // Rollback to the previous value
      if (context?.previousFaculty) {
        queryClient.setQueryData(['faculty', variables.id], context.previousFaculty);
      }
      if (context?.previousFaculties) {
        queryClient.setQueryData(['faculties'], context.previousFaculties);
      }

      // Show error toast
      const errorMessage = error.response?.data?.message || 'Failed to update faculty';
      toast.error(errorMessage);
      
      // Call custom onError callback if provided
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
    ...options,
  });
};

export default useUpdateFaculty;
