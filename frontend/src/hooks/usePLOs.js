import { useState, useEffect } from 'react';
import api from '../services/api';

export const usePLOs = (degreeId = null) => {
  const [plos, setPLOs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPLOs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = degreeId 
        ? `/plos?degreeId=${degreeId}`
        : '/plos';
      
      const response = await api.get(url);
      setPLOs(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch PLOs');
      console.error('Error fetching PLOs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPLOs();
  }, [degreeId]);

  const createPLO = async (ploData) => {
    try {
      const response = await api.post('/plos', ploData);
      await fetchPLOs(); // Refresh the list
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const updatePLO = async (id, ploData) => {
    try {
      const response = await api.put(`/plos/${id}`, ploData);
      await fetchPLOs(); // Refresh the list
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const deletePLO = async (id) => {
    try {
      await api.delete(`/plos/${id}`);
      await fetchPLOs(); // Refresh the list
    } catch (err) {
      throw err;
    }
  };

  const bulkUpdatePLOs = async (updates) => {
    try {
      const response = await api.post('/plos/bulk-update', { updates });
      await fetchPLOs(); // Refresh the list
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  return {
    plos,
    loading,
    error,
    createPLO,
    updatePLO,
    deletePLO,
    bulkUpdatePLOs,
    refetch: fetchPLOs
  };
};

export const usePLO = (id) => {
  const [plo, setPLO] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPLO = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/plos/${id}`);
      setPLO(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch PLO');
      console.error('Error fetching PLO:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPLO();
  }, [id]);

  const updatePLO = async (ploData) => {
    try {
      const response = await api.put(`/plos/${id}`, ploData);
      setPLO(response.data.data);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const deletePLO = async () => {
    try {
      await api.delete(`/plos/${id}`);
    } catch (err) {
      throw err;
    }
  };

  const getPLOAttainment = async () => {
    try {
      const response = await api.get(`/plos/${id}/attainment`);
      return response.data.data;
    } catch (err) {
      throw err;
    }
  };

  const getMappedPEOs = async () => {
    try {
      const response = await api.get(`/plos/${id}/peo-mappings`);
      return response.data.data;
    } catch (err) {
      throw err;
    }
  };

  const updatePEOMappings = async (peoIds) => {
    try {
      const response = await api.post(`/plos/${id}/peo-mappings`, { peo_ids: peoIds });
      await fetchPLO(); // Refresh to get updated mappings
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const getMappedCLOs = async () => {
    try {
      const response = await api.get(`/plos/${id}/clo-mappings`);
      return response.data.data;
    } catch (err) {
      throw err;
    }
  };

  const updateCLOMappings = async (cloIds) => {
    try {
      const response = await api.post(`/plos/${id}/clo-mappings`, { clo_ids: cloIds });
      await fetchPLO(); // Refresh to get updated mappings
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  return {
    plo,
    loading,
    error,
    updatePLO,
    deletePLO,
    getPLOAttainment,
    getMappedPEOs,
    updatePEOMappings,
    getMappedCLOs,
    updateCLOMappings,
    refetch: fetchPLO
  };
};
