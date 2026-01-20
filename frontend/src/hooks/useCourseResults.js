import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useCourseResults = (resultId = null) => {
  const [results, setResults] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all course results
  const fetchResults = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.session) params.append('session', filters.session);
      if (filters.semester) params.append('semester', filters.semester);
      if (filters.status) params.append('status', filters.status);
      if (filters.department_id) params.append('department_id', filters.department_id);

      const response = await api.get(`/course-results?${params.toString()}`);
      setResults(response.data.data || response.data);
      return response.data.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch course results';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single course result by ID
  const getResultById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/course-results/${id}`);
      const resultData = response.data.data || response.data;
      setResult(resultData);
      return resultData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch course result';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate course results
  const calculateResults = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/course-results/calculate', data);
      const calculatedData = response.data.data || response.data;
      return calculatedData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to calculate results';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save calculated results
  const saveResults = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/course-results', data);
      const savedData = response.data.data || response.data;
      await fetchResults();
      return savedData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to save results';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchResults]);

  // Update course result
  const updateResult = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/course-results/${id}`, data);
      const updatedData = response.data.data || response.data;
      await fetchResults();
      return updatedData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update result';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchResults]);

  // Publish course results
  const publishResult = useCallback(async (id, publishData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/course-results/${id}/publish`, publishData);
      const publishedData = response.data.data || response.data;
      await fetchResults();
      return publishedData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to publish results';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchResults]);

  // Finalize course results
  const finalizeResult = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/course-results/${id}/finalize`);
      const finalizedData = response.data.data || response.data;
      await fetchResults();
      return finalizedData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to finalize results';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchResults]);

  // Delete course result
  const deleteResult = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/course-results/${id}`);
      await fetchResults();
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete result';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchResults]);

  // Export results in different formats
  const exportResults = useCallback(async (id, format = 'pdf') => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/course-results/${id}/export`, {
        params: { format },
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `course-result-${id}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to export results';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get result statistics
  const getResultStats = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.session) params.append('session', filters.session);
      if (filters.semester) params.append('semester', filters.semester);
      if (filters.department_id) params.append('department_id', filters.department_id);

      const response = await api.get(`/course-results/stats?${params.toString()}`);
      return response.data.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch statistics';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Recalculate specific student result
  const recalculateStudentResult = useCallback(async (resultId, studentId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(
        `/course-results/${resultId}/students/${studentId}/recalculate`
      );
      const updatedData = response.data.data || response.data;
      return updatedData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to recalculate student result';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get grade distribution
  const getGradeDistribution = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/course-results/${id}/grade-distribution`);
      return response.data.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch grade distribution';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch results on component mount if resultId is provided
  useEffect(() => {
    if (resultId) {
      getResultById(resultId);
    } else {
      fetchResults();
    }
  }, [resultId]);

  return {
    // State
    results,
    result,
    loading,
    error,

    // Methods
    fetchResults,
    getResultById,
    calculateResults,
    saveResults,
    updateResult,
    publishResult,
    finalizeResult,
    deleteResult,
    exportResults,
    getResultStats,
    recalculateStudentResult,
    getGradeDistribution,

    // Utility
    setError,
    setLoading,
  };
};

export default useCourseResults;
