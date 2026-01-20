import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import userService from '../services/userService';

/**
 * useCreateUser Hook
 * Handles user creation with optimistic updates
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation result
 */
const useCreateUser = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData) => userService.createUser(userData),
    onSuccess: (data, variables, context) => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      // Show success toast
      toast.success(data.message || 'User created successfully');
      
      // Call custom onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      // Show error toast
      const errorMessage = error.response?.data?.message || 'Failed to create user';
      toast.error(errorMessage);
      
      // Call custom onError callback if provided
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
    ...options,
  });
};

export default useCreateUser;
