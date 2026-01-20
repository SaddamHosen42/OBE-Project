import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useSurveys = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all surveys
  const fetchSurveys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/surveys');
      setSurveys(response.data.data || response.data);
      return response.data.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch surveys';
      setError(errorMessage);
      console.error('Error fetching surveys:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get survey by ID
  const getSurveyById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/surveys/${id}`);
      return response.data.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch survey';
      setError(errorMessage);
      console.error('Error fetching survey:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new survey
  const createSurvey = useCallback(async (surveyData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/surveys', surveyData);
      const newSurvey = response.data.data || response.data;
      setSurveys(prev => [...prev, newSurvey]);
      return newSurvey;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create survey';
      setError(errorMessage);
      console.error('Error creating survey:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update survey
  const updateSurvey = useCallback(async (id, surveyData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/surveys/${id}`, surveyData);
      const updatedSurvey = response.data.data || response.data;
      setSurveys(prev => prev.map(s => s.survey_id === id ? updatedSurvey : s));
      return updatedSurvey;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update survey';
      setError(errorMessage);
      console.error('Error updating survey:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete survey
  const deleteSurvey = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/surveys/${id}`);
      setSurveys(prev => prev.filter(s => s.survey_id !== id));
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete survey';
      setError(errorMessage);
      console.error('Error deleting survey:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Duplicate survey
  const duplicateSurvey = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/surveys/${id}/duplicate`);
      const duplicatedSurvey = response.data.data || response.data;
      setSurveys(prev => [...prev, duplicatedSurvey]);
      return duplicatedSurvey;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to duplicate survey';
      setError(errorMessage);
      console.error('Error duplicating survey:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update survey status
  const updateSurveyStatus = useCallback(async (id, status) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.patch(`/surveys/${id}/status`, { status });
      const updatedSurvey = response.data.data || response.data;
      setSurveys(prev => prev.map(s => s.survey_id === id ? updatedSurvey : s));
      return updatedSurvey;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update survey status';
      setError(errorMessage);
      console.error('Error updating survey status:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get surveys by type
  const getSurveysByType = useCallback(async (surveyType) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/surveys/type/${surveyType}`);
      return response.data.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch surveys by type';
      setError(errorMessage);
      console.error('Error fetching surveys by type:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get surveys by status
  const getSurveysByStatus = useCallback(async (status) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/surveys/status/${status}`);
      return response.data.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch surveys by status';
      setError(errorMessage);
      console.error('Error fetching surveys by status:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Add questions to survey
  const addSurveyQuestions = useCallback(async (surveyId, questions) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/surveys/${surveyId}/questions`, { questions });
      return response.data.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add survey questions';
      setError(errorMessage);
      console.error('Error adding survey questions:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get survey questions
  const getSurveyQuestions = useCallback(async (surveyId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/surveys/${surveyId}/questions`);
      return response.data.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch survey questions';
      setError(errorMessage);
      console.error('Error fetching survey questions:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Load surveys on mount
  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  return {
    surveys,
    loading,
    error,
    fetchSurveys,
    getSurveyById,
    createSurvey,
    updateSurvey,
    deleteSurvey,
    duplicateSurvey,
    updateSurveyStatus,
    getSurveysByType,
    getSurveysByStatus,
    addSurveyQuestions,
    getSurveyQuestions
  };
};
