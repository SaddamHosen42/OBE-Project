import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import facultyService from '../services/facultyService';

/**
 * useCreateFaculty Hook
 * Handles faculty creation with optimistic updates
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation result
 */
const useCreateFaculty = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (facultyData) => facultyService.createFaculty(facultyData),
    onSuccess: (data, variables, context) => {
      // Invalidate and refetch faculties list
      queryClient.invalidateQueries({ queryKey: ['faculties'] });
      
      // Show success toast
      toast.success(data.message || 'Faculty created successfully');
      
      // Call custom onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      // Show error toast
      const errorMessage = error.response?.data?.message || 'Failed to create faculty';
      toast.error(errorMessage);
      
      // Call custom onError callback if provided
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
    ...options,
  });
};

export default useCreateFaculty;
