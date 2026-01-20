import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import marksService from '../services/marksService';
import { toast } from 'react-hot-toast';

/**
 * useMarks Hook
 * Fetches and manages marks data with caching and mutations
 * @param {Object} params - Query parameters
 * @param {number} params.assessmentId - Assessment component ID
 * @param {number} params.studentId - Student ID (optional)
 * @param {number} params.questionId - Question ID (optional)
 * @param {Object} options - React Query options
 * @returns {Object} Query result with marks data and mutation functions
 */
const useMarks = (params = {}, options = {}) => {
  const queryClient = useQueryClient();

  // Fetch marks query
  const marksQuery = useQuery({
    queryKey: ['marks', params],
    queryFn: () => {
      if (params.assessmentId) {
        return marksService.getMarksByAssessment(params.assessmentId, params);
      } else if (params.studentId) {
        return marksService.getMarksByStudent(params.studentId, params);
      } else if (params.questionId) {
        return marksService.getMarksByQuestion(params.questionId, params);
      } else {
        return marksService.getAllMarks(params);
      }
    },
    enabled: !!(params.assessmentId || params.studentId || params.questionId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });

  // Fetch marks sheet query
  const marksSheetQuery = useQuery({
    queryKey: ['marksSheet', params.assessmentId],
    queryFn: () => marksService.getMarksSheet(params.assessmentId, params),
    enabled: !!params.assessmentId && options.fetchSheet,
    staleTime: 2 * 60 * 1000,
  });

  // Fetch marks statistics query
  const statisticsQuery = useQuery({
    queryKey: ['marksStatistics', params.assessmentId],
    queryFn: () => marksService.getMarksStatistics(params.assessmentId),
    enabled: !!params.assessmentId && options.fetchStatistics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create marks mutation
  const createMarksMutation = useMutation({
    mutationFn: (marksData) => marksService.createMarks(marksData),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['marks']);
      queryClient.invalidateQueries(['marksSheet']);
      queryClient.invalidateQueries(['marksStatistics']);
      toast.success('Marks created successfully');
    },
    onError: (error) => {
      console.error('Error creating marks:', error);
      toast.error(error.message || 'Failed to create marks');
    },
  });

  // Update marks mutation
  const updateMarksMutation = useMutation({
    mutationFn: ({ id, marksData }) => marksService.updateMarks(id, marksData),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['marks']);
      queryClient.invalidateQueries(['marksSheet']);
      queryClient.invalidateQueries(['marksStatistics']);
      toast.success('Marks updated successfully');
    },
    onError: (error) => {
      console.error('Error updating marks:', error);
      toast.error(error.message || 'Failed to update marks');
    },
  });

  // Delete marks mutation
  const deleteMarksMutation = useMutation({
    mutationFn: (id) => marksService.deleteMarks(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['marks']);
      queryClient.invalidateQueries(['marksSheet']);
      queryClient.invalidateQueries(['marksStatistics']);
      toast.success('Marks deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting marks:', error);
      toast.error(error.message || 'Failed to delete marks');
    },
  });

  // Bulk create marks mutation
  const bulkCreateMarksMutation = useMutation({
    mutationFn: (marksArray) => marksService.bulkCreateMarks(marksArray),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['marks']);
      queryClient.invalidateQueries(['marksSheet']);
      queryClient.invalidateQueries(['marksStatistics']);
      toast.success(`Successfully created ${response.data?.length || 0} marks entries`);
    },
    onError: (error) => {
      console.error('Error bulk creating marks:', error);
      toast.error(error.message || 'Failed to create marks entries');
    },
  });

  // Bulk update marks mutation
  const bulkUpdateMarksMutation = useMutation({
    mutationFn: (marksArray) => marksService.bulkUpdateMarks(marksArray),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['marks']);
      queryClient.invalidateQueries(['marksSheet']);
      queryClient.invalidateQueries(['marksStatistics']);
      toast.success(`Successfully updated ${response.data?.length || 0} marks entries`);
    },
    onError: (error) => {
      console.error('Error bulk updating marks:', error);
      toast.error(error.message || 'Failed to update marks entries');
    },
  });

  // Import marks mutation
  const importMarksMutation = useMutation({
    mutationFn: ({ assessmentId, formData }) => 
      marksService.importMarks(assessmentId, formData),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['marks']);
      queryClient.invalidateQueries(['marksSheet']);
      queryClient.invalidateQueries(['marksStatistics']);
      toast.success(`Successfully imported ${response.data?.imported || 0} marks entries`);
    },
    onError: (error) => {
      console.error('Error importing marks:', error);
      toast.error(error.message || 'Failed to import marks');
    },
  });

  // Validate marks mutation
  const validateMarksMutation = useMutation({
    mutationFn: (marksArray) => marksService.validateMarks(marksArray),
    onError: (error) => {
      console.error('Error validating marks:', error);
      toast.error(error.message || 'Failed to validate marks');
    },
  });

  return {
    // Query states
    marks: marksQuery.data?.data || [],
    marksSheet: marksSheetQuery.data?.data || null,
    statistics: statisticsQuery.data?.data || null,
    isLoading: marksQuery.isLoading || marksSheetQuery.isLoading || statisticsQuery.isLoading,
    isError: marksQuery.isError || marksSheetQuery.isError || statisticsQuery.isError,
    error: marksQuery.error || marksSheetQuery.error || statisticsQuery.error,
    
    // Refetch functions
    refetch: marksQuery.refetch,
    refetchSheet: marksSheetQuery.refetch,
    refetchStatistics: statisticsQuery.refetch,
    
    // Mutation functions
    createMarks: createMarksMutation.mutate,
    updateMarks: updateMarksMutation.mutate,
    deleteMarks: deleteMarksMutation.mutate,
    bulkCreateMarks: bulkCreateMarksMutation.mutate,
    bulkUpdateMarks: bulkUpdateMarksMutation.mutate,
    importMarks: importMarksMutation.mutate,
    validateMarks: validateMarksMutation.mutate,
    
    // Mutation states
    isCreating: createMarksMutation.isPending,
    isUpdating: updateMarksMutation.isPending,
    isDeleting: deleteMarksMutation.isPending,
    isBulkCreating: bulkCreateMarksMutation.isPending,
    isBulkUpdating: bulkUpdateMarksMutation.isPending,
    isImporting: importMarksMutation.isPending,
    isValidating: validateMarksMutation.isPending,
  };
};

export default useMarks;
