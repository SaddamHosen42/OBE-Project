import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function useIndirectAttainment() {
  const [surveyAttainment, setSurveyAttainment] = useState(null);
  const [outcomeAttainment, setOutcomeAttainment] = useState(null);
  const [programReport, setProgramReport] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Calculate indirect attainment from a survey
   */
  const calculateAttainment = useCallback(async (surveyId, outcomeType = 'PLO', outcomeId = null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/indirect-attainment/calculate`,
        {
          survey_id: surveyId,
          outcome_type: outcomeType,
          outcome_id: outcomeId
        }
      );
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to calculate indirect attainment';
      setError(errorMessage);
      console.error('Error calculating indirect attainment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get indirect attainment results by survey
   */
  const fetchBySurvey = useCallback(async (surveyId, outcomeType = null) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (outcomeType) params.append('outcome_type', outcomeType);

      const response = await axios.get(
        `${API_BASE_URL}/indirect-attainment/survey/${surveyId}?${params.toString()}`
      );
      setSurveyAttainment(response.data.data);
      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch survey attainment';
      setError(errorMessage);
      console.error('Error fetching survey attainment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get indirect attainment results by outcome
   */
  const fetchByOutcome = useCallback(async (outcomeType, outcomeId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/indirect-attainment/outcome/${outcomeType}/${outcomeId}`
      );
      setOutcomeAttainment(response.data.data);
      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch outcome attainment';
      setError(errorMessage);
      console.error('Error fetching outcome attainment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get comprehensive indirect attainment report for a program
   */
  const fetchProgramReport = useCallback(async (degreeId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/indirect-attainment/report/program/${degreeId}`
      );
      setProgramReport(response.data.data);
      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch program report';
      setError(errorMessage);
      console.error('Error fetching program report:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Recalculate all indirect attainment for a survey
   */
  const recalculateAttainment = useCallback(async (surveyId, outcomeType = 'PLO') => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/indirect-attainment/recalculate/${surveyId}`,
        { outcome_type: outcomeType }
      );
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to recalculate indirect attainment';
      setError(errorMessage);
      console.error('Error recalculating indirect attainment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get summary of all indirect attainment
   */
  const fetchSummary = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await axios.get(
        `${API_BASE_URL}/indirect-attainment/summary?${params.toString()}`
      );
      setSummary(response.data.data);
      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch summary';
      setError(errorMessage);
      console.error('Error fetching summary:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Export indirect attainment report
   */
  const exportReport = useCallback(async (degreeId, format = 'pdf') => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/indirect-attainment/report/program/${degreeId}/export`,
        {
          params: { format },
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `indirect-attainment-report-${degreeId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to export report';
      setError(errorMessage);
      console.error('Error exporting report:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    surveyAttainment,
    outcomeAttainment,
    programReport,
    summary,
    loading,
    error,
    calculateAttainment,
    fetchBySurvey,
    fetchByOutcome,
    fetchProgramReport,
    recalculateAttainment,
    fetchSummary,
    exportReport
  };
}
