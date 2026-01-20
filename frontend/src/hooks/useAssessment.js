import { useState, useEffect } from 'react';
import api from '../services/api';

export const useAssessment = (id) => {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssessment = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/assessments/components/${id}`);
      setAssessment(response.data.data || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch assessment');
      console.error('Error fetching assessment:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessment();
  }, [id]);

  const updateAssessment = async (assessmentData) => {
    try {
      const response = await api.put(`/assessments/components/${id}`, assessmentData);
      await fetchAssessment(); // Refresh the data
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const deleteAssessment = async () => {
    try {
      await api.delete(`/assessments/components/${id}`);
    } catch (err) {
      throw err;
    }
  };

  const addCLOMapping = async (cloId, marksAllocated) => {
    try {
      const response = await api.post(`/assessments/components/${id}/clo-mappings`, {
        clo_id: cloId,
        marks_allocated: marksAllocated
      });
      await fetchAssessment(); // Refresh the data
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const updateCLOMapping = async (cloId, marksAllocated) => {
    try {
      const response = await api.put(`/assessments/components/${id}/clo-mappings/${cloId}`, {
        marks_allocated: marksAllocated
      });
      await fetchAssessment(); // Refresh the data
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const removeCLOMapping = async (cloId) => {
    try {
      await api.delete(`/assessments/components/${id}/clo-mappings/${cloId}`);
      await fetchAssessment(); // Refresh the data
    } catch (err) {
      throw err;
    }
  };

  return {
    assessment,
    loading,
    error,
    updateAssessment,
    deleteAssessment,
    addCLOMapping,
    updateCLOMapping,
    removeCLOMapping,
    refetch: fetchAssessment
  };
};
