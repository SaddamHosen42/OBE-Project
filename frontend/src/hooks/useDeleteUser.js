import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import userService from '../services/userService';

/**
 * useDeleteUser Hook
 * Handles user deletion with optimistic updates
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation result
 */
const useDeleteUser = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => userService.deleteUser(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['users'] });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData(['users']);

      // Optimistically remove the user from the list
      if (previousUsers) {
        queryClient.setQueryData(['users'], (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.filter((user) => user.id !== id),
          };
        });
      }

      // Return a context object with the snapshotted value
      return { previousUsers };
    },
    onSuccess: (data, variables, context) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.removeQueries({ queryKey: ['user', variables] });
      
      // Show success toast
      toast.success(data.message || 'User deleted successfully');
      
      // Call custom onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      // Rollback to the previous value
      if (context?.previousUsers) {
        queryClient.setQueryData(['users'], context.previousUsers);
      }
      
      // Show error toast
      const errorMessage = error.response?.data?.message || 'Failed to delete user';
      toast.error(errorMessage);
      
      // Call custom onError callback if provided
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
    ...options,
  });
};

export default useDeleteUser;
