import { useState, useEffect } from 'react';
import api from '../services/api';

export const useCLO = (id) => {
  const [clo, setCLO] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCLO = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/clos/${id}`);
      setCLO(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch CLO');
      console.error('Error fetching CLO:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCLO();
  }, [id]);

  const updateCLO = async (cloData) => {
    try {
      const response = await api.put(`/clos/${id}`, cloData);
      setCLO(response.data.data);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const deleteCLO = async () => {
    try {
      await api.delete(`/clos/${id}`);
    } catch (err) {
      throw err;
    }
  };

  const getCLOAttainment = async () => {
    try {
      const response = await api.get(`/clos/${id}/attainment`);
      return response.data.data;
    } catch (err) {
      throw err;
    }
  };

  const getCLOAssessments = async () => {
    try {
      const response = await api.get(`/clos/${id}/assessments`);
      return response.data.data;
    } catch (err) {
      throw err;
    }
  };

  const getPLOMappings = async () => {
    try {
      const response = await api.get(`/clos/${id}/plo-mappings`);
      return response.data.data;
    } catch (err) {
      throw err;
    }
  };

  const updatePLOMappings = async (ploIds) => {
    try {
      const response = await api.post(`/clos/${id}/plo-mappings`, { plo_ids: ploIds });
      await fetchCLO(); // Refresh to get updated mappings
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  return {
    clo,
    loading,
    error,
    updateCLO,
    deleteCLO,
    getCLOAttainment,
    getCLOAssessments,
    getPLOMappings,
    updatePLOMappings,
    refetch: fetchCLO
  };
};
