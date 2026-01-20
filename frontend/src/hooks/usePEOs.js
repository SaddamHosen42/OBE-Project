import { useState, useEffect } from 'react';
import api from '../services/api';

export const usePEOs = (degreeId = null) => {
  const [peos, setPEOs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPEOs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = degreeId 
        ? `/peos?degreeId=${degreeId}`
        : '/peos';
      
      const response = await api.get(url);
      setPEOs(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch PEOs');
      console.error('Error fetching PEOs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPEOs();
  }, [degreeId]);

  const createPEO = async (peoData) => {
    try {
      const response = await api.post('/peos', peoData);
      await fetchPEOs(); // Refresh the list
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const updatePEO = async (id, peoData) => {
    try {
      const response = await api.put(`/peos/${id}`, peoData);
      await fetchPEOs(); // Refresh the list
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const deletePEO = async (id) => {
    try {
      await api.delete(`/peos/${id}`);
      await fetchPEOs(); // Refresh the list
    } catch (err) {
      throw err;
    }
  };

  const bulkUpdatePEOs = async (updates) => {
    try {
      const response = await api.post('/peos/bulk-update', { updates });
      await fetchPEOs(); // Refresh the list
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  return {
    peos,
    loading,
    error,
    createPEO,
    updatePEO,
    deletePEO,
    bulkUpdatePEOs,
    refetch: fetchPEOs
  };
};

export const usePEO = (id) => {
  const [peo, setPEO] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPEO = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/peos/${id}`);
      setPEO(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch PEO');
      console.error('Error fetching PEO:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPEO();
  }, [id]);

  const updatePEO = async (peoId, peoData) => {
    try {
      const response = await api.put(`/peos/${peoId}`, peoData);
      await fetchPEO(); // Refresh the data
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  return {
    peo,
    loading,
    error,
    updatePEO,
    refetch: fetchPEO
  };
};

export const usePEOMappings = (degreeId = null) => {
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMappings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = degreeId 
        ? `/peos/mappings?degreeId=${degreeId}`
        : '/peos/mappings';
      
      const response = await api.get(url);
      setMappings(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch PEO mappings');
      console.error('Error fetching PEO mappings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMappings();
  }, [degreeId]);

  const updateMappings = async (mappingData) => {
    try {
      const response = await api.post('/peos/mappings', mappingData);
      await fetchMappings(); // Refresh the mappings
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const deleteMappings = async (peoId, ploIds) => {
    try {
      const response = await api.delete(`/peos/${peoId}/mappings`, {
        data: { ploIds }
      });
      await fetchMappings(); // Refresh the mappings
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  return {
    mappings,
    loading,
    error,
    updateMappings,
    deleteMappings,
    refetch: fetchMappings
  };
};

export default usePEOs;
