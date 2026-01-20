import { useState, useEffect } from 'react';
import api from '../services/api';

export const useCLOs = (courseOfferingId = null) => {
  const [clos, setCLOs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCLOs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = courseOfferingId 
        ? `/clos?courseOffering=${courseOfferingId}`
        : '/clos';
      
      const response = await api.get(url);
      setCLOs(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch CLOs');
      console.error('Error fetching CLOs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCLOs();
  }, [courseOfferingId]);

  const createCLO = async (cloData) => {
    try {
      const response = await api.post('/clos', cloData);
      await fetchCLOs(); // Refresh the list
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const updateCLO = async (id, cloData) => {
    try {
      const response = await api.put(`/clos/${id}`, cloData);
      await fetchCLOs(); // Refresh the list
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const deleteCLO = async (id) => {
    try {
      await api.delete(`/clos/${id}`);
      await fetchCLOs(); // Refresh the list
    } catch (err) {
      throw err;
    }
  };

  const bulkUpdateCLOs = async (updates) => {
    try {
      const response = await api.post('/clos/bulk-update', { updates });
      await fetchCLOs(); // Refresh the list
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  return {
    clos,
    loading,
    error,
    createCLO,
    updateCLO,
    deleteCLO,
    bulkUpdateCLOs,
    refetch: fetchCLOs
  };
};
