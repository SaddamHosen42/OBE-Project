import { useState, useEffect } from 'react';
import api from '../services/api';

export const useAssessments = (courseOfferingId = null) => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = courseOfferingId 
        ? `/assessments/components?courseOffering=${courseOfferingId}`
        : '/assessments/components';
      
      const response = await api.get(url);
      setAssessments(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch assessments');
      console.error('Error fetching assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, [courseOfferingId]);

  const createAssessment = async (assessmentData) => {
    try {
      const response = await api.post('/assessments/components', assessmentData);
      await fetchAssessments(); // Refresh the list
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const updateAssessment = async (id, assessmentData) => {
    try {
      const response = await api.put(`/assessments/components/${id}`, assessmentData);
      await fetchAssessments(); // Refresh the list
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const deleteAssessment = async (id) => {
    try {
      await api.delete(`/assessments/components/${id}`);
      await fetchAssessments(); // Refresh the list
    } catch (err) {
      throw err;
    }
  };

  const bulkUpdateAssessments = async (updates) => {
    try {
      const response = await api.post('/assessments/components/bulk-update', { updates });
      await fetchAssessments(); // Refresh the list
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  return {
    assessments,
    loading,
    error,
    createAssessment,
    updateAssessment,
    deleteAssessment,
    bulkUpdateAssessments,
    refetch: fetchAssessments
  };
};
