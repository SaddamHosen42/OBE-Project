import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useGradeScales = (activeOnly = false) => {
  const [gradeScales, setGradeScales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGradeScales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: 1,
        limit: 100,
        orderBy: 'name',
        order: 'ASC'
      };

      if (activeOnly) {
        params.activeOnly = 'true';
      }
      
      const response = await api.get('/grades/scales', { params });
      setGradeScales(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch grade scales');
      console.error('Error fetching grade scales:', err);
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => {
    fetchGradeScales();
  }, [fetchGradeScales]);

  const createGradeScale = async (gradeScaleData) => {
    const response = await api.post('/grades/scales', gradeScaleData);
    await fetchGradeScales(); // Refresh the list
    return response.data;
  };

  const updateGradeScale = async (id, gradeScaleData) => {
    const response = await api.put(`/grades/scales/${id}`, gradeScaleData);
    await fetchGradeScales(); // Refresh the list
    return response.data;
  };

  const deleteGradeScale = async (id) => {
    const response = await api.delete(`/grades/scales/${id}`);
    await fetchGradeScales(); // Refresh the list
    return response.data;
  };

  const getGradeScale = async (id) => {
    const response = await api.get(`/grades/scales/${id}`, {
      params: { includeGradePoints: 'true' }
    });
    return response.data.data;
  };

  const activateGradeScale = async (id) => {
    const response = await api.post(`/grades/scales/${id}/activate`);
    await fetchGradeScales(); // Refresh the list
    return response.data;
  };

  const deactivateGradeScale = async (id) => {
    const response = await api.post(`/grades/scales/${id}/deactivate`);
    await fetchGradeScales(); // Refresh the list
    return response.data;
  };

  return {
    gradeScales,
    loading,
    error,
    fetchGradeScales,
    createGradeScale,
    updateGradeScale,
    deleteGradeScale,
    getGradeScale,
    activateGradeScale,
    deactivateGradeScale
  };
};
