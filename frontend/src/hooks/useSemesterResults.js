import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * useSemesterResults Hook
 * Manages semester result operations including fetching, calculating, and publishing
 * @param {number} resultId - Optional specific result ID to fetch
 * @returns {Object} Hook methods and state
 */
export const useSemesterResults = (resultId = null) => {
  const [results, setResults] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all semester results
  const fetchResults = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.session) params.append('session', filters.session);
      if (filters.semester) params.append('semester', filters.semester);
      if (filters.status) params.append('status', filters.status);
      if (filters.degree_id) params.append('degree_id', filters.degree_id);
      if (filters.student_id) params.append('student_id', filters.student_id);

      const response = await api.get(`/semester-results?${params.toString()}`);
      setResults(response.data.data || response.data);
      return response.data.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch semester results';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single semester result by ID
  const getResultById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/semester-results/${id}`);
      const resultData = response.data.data || response.data;
      setResult(resultData);
      return resultData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch semester result';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate semester results (SGPA/CGPA)
  const calculateResults = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/semester-results/calculate', data);
      const calculatedData = response.data.data || response.data;
      return calculatedData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to calculate semester results';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save calculated semester results
  const saveResults = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/semester-results', data);
      const savedData = response.data.data || response.data;
      await fetchResults();
      return savedData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to save semester results';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchResults]);

  // Update semester result
  const updateResult = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/semester-results/${id}`, data);
      const updatedData = response.data.data || response.data;
      await fetchResults();
      return updatedData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update semester result';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchResults]);

  // Publish semester results
  const publishResult = useCallback(async (id, publishData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/semester-results/${id}/publish`, publishData);
      const publishedData = response.data.data || response.data;
      await fetchResults();
      return publishedData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to publish semester results';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchResults]);

  // Finalize semester results (lock from further changes)
  const finalizeResult = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/semester-results/${id}/finalize`);
      const finalizedData = response.data.data || response.data;
      await fetchResults();
      return finalizedData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to finalize semester results';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchResults]);

  // Delete semester result
  const deleteResult = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/semester-results/${id}`);
      await fetchResults();
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete semester result';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchResults]);

  // Get student transcript
  const getTranscript = useCallback(async (studentId, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (options.includeAll) params.append('include_all', 'true');
      if (options.upToSemester) params.append('up_to_semester', options.upToSemester);

      const response = await api.get(`/semester-results/transcript/${studentId}?${params.toString()}`);
      return response.data.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch transcript';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get semester-wise statistics
  const getStatistics = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.session_id) params.append('session_id', filters.session_id);
      if (filters.semester_id) params.append('semester_id', filters.semester_id);
      if (filters.degree_id) params.append('degree_id', filters.degree_id);

      const response = await api.get(`/semester-results/statistics?${params.toString()}`);
      return response.data.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch statistics';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get CGPA distribution
  const getCGPADistribution = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.session_id) params.append('session_id', filters.session_id);
      if (filters.semester_id) params.append('semester_id', filters.semester_id);
      if (filters.degree_id) params.append('degree_id', filters.degree_id);

      const response = await api.get(`/semester-results/cgpa-distribution?${params.toString()}`);
      return response.data.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch CGPA distribution';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Recalculate CGPA for specific student
  const recalculateCGPA = useCallback(async (studentId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/semester-results/recalculate-cgpa/${studentId}`);
      const recalculatedData = response.data.data || response.data;
      return recalculatedData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to recalculate CGPA';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Bulk import semester results
  const bulkImport = useCallback(async (file, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (options.session_id) formData.append('session_id', options.session_id);
      if (options.semester_id) formData.append('semester_id', options.semester_id);

      const response = await api.post('/semester-results/bulk-import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      await fetchResults();
      return response.data.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to import results';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchResults]);

  // Export semester results
  const exportResults = useCallback(async (filters = {}, format = 'excel') => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.session_id) params.append('session_id', filters.session_id);
      if (filters.semester_id) params.append('semester_id', filters.semester_id);
      if (filters.degree_id) params.append('degree_id', filters.degree_id);
      params.append('format', format);

      const response = await api.get(`/semester-results/export?${params.toString()}`, {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `semester-results.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to export results';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial data if resultId is provided
  useEffect(() => {
    if (resultId) {
      getResultById(resultId);
    } else {
      fetchResults();
    }
  }, [resultId, getResultById, fetchResults]);

  return {
    results,
    result,
    loading,
    error,
    fetchResults,
    getResultById,
    calculateResults,
    saveResults,
    updateResult,
    publishResult,
    finalizeResult,
    deleteResult,
    getTranscript,
    getStatistics,
    getCGPADistribution,
    recalculateCGPA,
    bulkImport,
    exportResults,
  };
};

export default useSemesterResults;
