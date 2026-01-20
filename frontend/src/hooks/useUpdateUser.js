import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import userService from '../services/userService';

/**
 * useUpdateUser Hook
 * Handles user updates with optimistic updates
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation result
 */
const useUpdateUser = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userData }) => userService.updateUser(id, userData),
    onMutate: async ({ id, userData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user', id] });
      await queryClient.cancelQueries({ queryKey: ['users'] });

      // Snapshot the previous value
      const previousUser = queryClient.getQueryData(['user', id]);
      const previousUsers = queryClient.getQueryData(['users']);

      // Optimistically update to the new value
      if (previousUser) {
        queryClient.setQueryData(['user', id], (old) => ({
          ...old,
          data: { ...old.data, ...userData },
        }));
      }

      // Return a context object with the snapshotted values
      return { previousUser, previousUsers };
    },
    onSuccess: (data, variables, context) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      // Show success toast
      toast.success(data.message || 'User updated successfully');
      
      // Call custom onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      // Rollback to the previous value
      if (context?.previousUser) {
        queryClient.setQueryData(['user', variables.id], context.previousUser);
      }
      if (context?.previousUsers) {
        queryClient.setQueryData(['users'], context.previousUsers);
      }
      
      // Show error toast
      const errorMessage = error.response?.data?.message || 'Failed to update user';
      toast.error(errorMessage);
      
      // Call custom onError callback if provided
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
    ...options,
  });
};

export default useUpdateUser;
