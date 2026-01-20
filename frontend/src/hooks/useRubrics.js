import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const useRubrics = () => {
  const [rubrics, setRubrics] = useState([]);
  const [rubric, setRubric] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all rubrics
  const fetchRubrics = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/rubrics`, { params });
      setRubrics(response.data.data || response.data || []);
      return response.data.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch rubrics';
      setError(errorMessage);
      console.error('Error fetching rubrics:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single rubric by ID
  const fetchRubric = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/rubrics/${id}`);
      const rubricData = response.data.data || response.data;
      setRubric(rubricData);
      return rubricData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch rubric';
      setError(errorMessage);
      console.error('Error fetching rubric:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new rubric
  const createRubric = useCallback(async (rubricData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/rubrics`, rubricData);
      const newRubric = response.data.data || response.data;
      setRubrics(prev => [...prev, newRubric]);
      return newRubric;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create rubric';
      setError(errorMessage);
      console.error('Error creating rubric:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update rubric
  const updateRubric = useCallback(async (id, rubricData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${API_BASE_URL}/rubrics/${id}`, rubricData);
      const updatedRubric = response.data.data || response.data;
      setRubrics(prev => prev.map(r => r.rubric_id === id ? updatedRubric : r));
      setRubric(updatedRubric);
      return updatedRubric;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update rubric';
      setError(errorMessage);
      console.error('Error updating rubric:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete rubric
  const deleteRubric = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_BASE_URL}/rubrics/${id}`);
      setRubrics(prev => prev.filter(r => r.rubric_id !== id));
      if (rubric?.rubric_id === id) {
        setRubric(null);
      }
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete rubric';
      setError(errorMessage);
      console.error('Error deleting rubric:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [rubric]);

  // Fetch rubric criteria
  const fetchRubricCriteria = useCallback(async (rubricId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/rubrics/${rubricId}/criteria`);
      return response.data.data || response.data || [];
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch criteria';
      setError(errorMessage);
      console.error('Error fetching criteria:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch rubric levels
  const fetchRubricLevels = useCallback(async (rubricId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/rubrics/${rubricId}/levels`);
      return response.data.data || response.data || [];
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch levels';
      setError(errorMessage);
      console.error('Error fetching levels:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add criterion to rubric
  const addCriterion = useCallback(async (rubricId, criterionData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/rubrics/${rubricId}/criteria`,
        criterionData
      );
      return response.data.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add criterion';
      setError(errorMessage);
      console.error('Error adding criterion:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update criterion
  const updateCriterion = useCallback(async (rubricId, criterionId, criterionData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/rubrics/${rubricId}/criteria/${criterionId}`,
        criterionData
      );
      return response.data.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update criterion';
      setError(errorMessage);
      console.error('Error updating criterion:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete criterion
  const deleteCriterion = useCallback(async (rubricId, criterionId) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_BASE_URL}/rubrics/${rubricId}/criteria/${criterionId}`);
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete criterion';
      setError(errorMessage);
      console.error('Error deleting criterion:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add level to rubric
  const addLevel = useCallback(async (rubricId, levelData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/rubrics/${rubricId}/levels`,
        levelData
      );
      return response.data.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add level';
      setError(errorMessage);
      console.error('Error adding level:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update level
  const updateLevel = useCallback(async (rubricId, levelId, levelData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/rubrics/${rubricId}/levels/${levelId}`,
        levelData
      );
      return response.data.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update level';
      setError(errorMessage);
      console.error('Error updating level:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete level
  const deleteLevel = useCallback(async (rubricId, levelId) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_BASE_URL}/rubrics/${rubricId}/levels/${levelId}`);
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete level';
      setError(errorMessage);
      console.error('Error deleting level:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    rubrics,
    rubric,
    loading,
    error,
    fetchRubrics,
    fetchRubric,
    createRubric,
    updateRubric,
    deleteRubric,
    fetchRubricCriteria,
    fetchRubricLevels,
    addCriterion,
    updateCriterion,
    deleteCriterion,
    addLevel,
    updateLevel,
    deleteLevel,
  };
};
