import { useState, useCallback } from 'react';
import api from '../services/api';

export const useSurveyResponses = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Submit survey response
  const submitResponse = useCallback(async (surveyId, responseData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/surveys/${surveyId}/responses`, responseData);
      const newResponse = response.data.data || response.data;
      setResponses(prev => [...prev, newResponse]);
      return newResponse;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to submit response';
      setError(errorMessage);
      console.error('Error submitting response:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get responses for a survey
  const getResponsesBySurvey = useCallback(async (surveyId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/surveys/${surveyId}/responses`);
      const responsesData = response.data.data || response.data;
      setResponses(responsesData);
      return responsesData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch responses';
      setError(errorMessage);
      console.error('Error fetching responses:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single response by ID
  const getResponseById = useCallback(async (responseId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/survey-responses/${responseId}`);
      return response.data.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch response';
      setError(errorMessage);
      console.error('Error fetching response:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get responses by user
  const getResponsesByUser = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/users/${userId}/survey-responses`);
      const responsesData = response.data.data || response.data;
      setResponses(responsesData);
      return responsesData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch user responses';
      setError(errorMessage);
      console.error('Error fetching user responses:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get analytics for a survey
  const getAnalytics = useCallback(async (surveyId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/surveys/${surveyId}/analytics`);
      return response.data.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch analytics';
      setError(errorMessage);
      console.error('Error fetching analytics:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get question statistics
  const getQuestionStatistics = useCallback(async (surveyId, questionId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/surveys/${surveyId}/questions/${questionId}/statistics`);
      return response.data.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch question statistics';
      setError(errorMessage);
      console.error('Error fetching question statistics:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Export survey responses
  const exportResponses = useCallback(async (surveyId, format = 'csv') => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/surveys/${surveyId}/export`, {
        params: { format },
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `survey_${surveyId}_responses.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to export responses';
      setError(errorMessage);
      console.error('Error exporting responses:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete response
  const deleteResponse = useCallback(async (responseId) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/survey-responses/${responseId}`);
      setResponses(prev => prev.filter(r => r.response_id !== responseId));
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete response';
      setError(errorMessage);
      console.error('Error deleting response:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get response summary
  const getResponseSummary = useCallback(async (surveyId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/surveys/${surveyId}/summary`);
      return response.data.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch response summary';
      setError(errorMessage);
      console.error('Error fetching response summary:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get response rate
  const getResponseRate = useCallback(async (surveyId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/surveys/${surveyId}/response-rate`);
      return response.data.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch response rate';
      setError(errorMessage);
      console.error('Error fetching response rate:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if user has responded
  const checkUserResponse = useCallback(async (surveyId, userId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/surveys/${surveyId}/check-response/${userId}`);
      return response.data.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to check user response';
      setError(errorMessage);
      console.error('Error checking user response:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update response
  const updateResponse = useCallback(async (responseId, responseData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/survey-responses/${responseId}`, responseData);
      const updatedResponse = response.data.data || response.data;
      setResponses(prev => prev.map(r => r.response_id === responseId ? updatedResponse : r));
      return updatedResponse;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update response';
      setError(errorMessage);
      console.error('Error updating response:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    responses,
    loading,
    error,
    submitResponse,
    getResponsesBySurvey,
    getResponseById,
    getResponsesByUser,
    getAnalytics,
    getQuestionStatistics,
    exportResponses,
    deleteResponse,
    getResponseSummary,
    getResponseRate,
    checkUserResponse,
    updateResponse
  };
};
