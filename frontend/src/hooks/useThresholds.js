import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Hook for managing multiple attainment thresholds
 * @param {number|null} degreeId - Optional degree ID to filter thresholds
 * @param {string|null} thresholdType - Optional threshold type to filter (CLO/PLO/PEO)
 * @returns {Object} Thresholds data and CRUD operations
 */
export const useThresholds = (degreeId = null, thresholdType = null) => {
  const [thresholds, setThresholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchThresholds = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (degreeId) params.append('degreeId', degreeId);
      if (thresholdType) params.append('thresholdType', thresholdType);
      
      const queryString = params.toString();
      const url = `/attainment-thresholds${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      setThresholds(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch attainment thresholds');
      console.error('Error fetching thresholds:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThresholds();
  }, [degreeId, thresholdType]);

  /**
   * Create a new attainment threshold
   * @param {Object} thresholdData - Threshold data
   * @returns {Promise} API response
   */
  const createThreshold = async (thresholdData) => {
    try {
      const response = await api.post('/attainment-thresholds', thresholdData);
      await fetchThresholds(); // Refresh the list
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  /**
   * Update an existing attainment threshold
   * @param {number} id - Threshold ID
   * @param {Object} thresholdData - Updated threshold data
   * @returns {Promise} API response
   */
  const updateThreshold = async (id, thresholdData) => {
    try {
      const response = await api.put(`/attainment-thresholds/${id}`, thresholdData);
      await fetchThresholds(); // Refresh the list
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  /**
   * Delete an attainment threshold
   * @param {number} id - Threshold ID
   * @returns {Promise} API response
   */
  const deleteThreshold = async (id) => {
    try {
      await api.delete(`/attainment-thresholds/${id}`);
      await fetchThresholds(); // Refresh the list
    } catch (err) {
      throw err;
    }
  };

  /**
   * Get thresholds by degree
   * @param {number} degreeId - Degree ID
   * @param {string|null} type - Optional threshold type
   * @returns {Promise<Array>} Array of thresholds
   */
  const getThresholdsByDegree = async (degreeId, type = null) => {
    try {
      const params = new URLSearchParams({ degreeId });
      if (type) params.append('thresholdType', type);
      
      const response = await api.get(`/attainment-thresholds?${params.toString()}`);
      return response.data.data || [];
    } catch (err) {
      console.error('Error fetching thresholds by degree:', err);
      throw err;
    }
  };

  /**
   * Get thresholds by type
   * @param {string} type - Threshold type (CLO/PLO/PEO)
   * @returns {Promise<Array>} Array of thresholds
   */
  const getThresholdsByType = async (type) => {
    try {
      const response = await api.get(`/attainment-thresholds?thresholdType=${type}`);
      return response.data.data || [];
    } catch (err) {
      console.error('Error fetching thresholds by type:', err);
      throw err;
    }
  };

  /**
   * Evaluate a score against thresholds for a specific degree and type
   * @param {number} score - Score to evaluate (0-100)
   * @param {number} degreeId - Degree ID
   * @param {string} type - Threshold type (CLO/PLO/PEO)
   * @returns {Promise<Object|null>} Matching threshold or null
   */
  const evaluateScore = async (score, degreeId, type) => {
    try {
      const thresholds = await getThresholdsByDegree(degreeId, type);
      
      // Find the threshold that matches the score
      const matchingThreshold = thresholds.find(
        t => score >= t.min_percentage && score <= t.max_percentage
      );
      
      return matchingThreshold || null;
    } catch (err) {
      console.error('Error evaluating score:', err);
      throw err;
    }
  };

  return {
    thresholds,
    loading,
    error,
    createThreshold,
    updateThreshold,
    deleteThreshold,
    getThresholdsByDegree,
    getThresholdsByType,
    evaluateScore,
    refetch: fetchThresholds
  };
};

/**
 * Hook for managing a single attainment threshold
 * @param {number} id - Threshold ID
 * @returns {Object} Threshold data and operations
 */
export const useThreshold = (id) => {
  const [threshold, setThreshold] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchThreshold = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/attainment-thresholds/${id}`);
      setThreshold(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch threshold');
      console.error('Error fetching threshold:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreshold();
  }, [id]);

  /**
   * Update the current threshold
   * @param {Object} thresholdData - Updated threshold data
   * @returns {Promise} API response
   */
  const updateThreshold = async (thresholdId, thresholdData) => {
    try {
      const response = await api.put(`/attainment-thresholds/${thresholdId}`, thresholdData);
      await fetchThreshold(); // Refresh the data
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  /**
   * Delete the current threshold
   * @returns {Promise} API response
   */
  const deleteThreshold = async (thresholdId) => {
    try {
      await api.delete(`/attainment-thresholds/${thresholdId}`);
    } catch (err) {
      throw err;
    }
  };

  return {
    threshold,
    loading,
    error,
    updateThreshold,
    deleteThreshold,
    refetch: fetchThreshold
  };
};

/**
 * Hook for threshold validation utilities
 * @returns {Object} Validation functions
 */
export const useThresholdValidation = () => {
  /**
   * Check if threshold ranges overlap
   * @param {Array} thresholds - Array of threshold objects
   * @param {Object} newThreshold - New threshold to check
   * @returns {boolean} True if overlap exists
   */
  const hasOverlap = (thresholds, newThreshold) => {
    return thresholds.some(t => {
      // Skip if same degree and type
      if (
        t.degree_id !== newThreshold.degree_id ||
        t.threshold_type !== newThreshold.threshold_type ||
        t.id === newThreshold.id // Skip self when editing
      ) {
        return false;
      }

      // Check for overlap
      return !(
        newThreshold.max_percentage < t.min_percentage ||
        newThreshold.min_percentage > t.max_percentage
      );
    });
  };

  /**
   * Check if threshold ranges have gaps
   * @param {Array} thresholds - Array of threshold objects for same degree and type
   * @returns {Array} Array of gap ranges
   */
  const findGaps = (thresholds) => {
    if (!thresholds || thresholds.length === 0) return [];

    // Sort by min_percentage
    const sorted = [...thresholds].sort((a, b) => a.min_percentage - b.min_percentage);
    const gaps = [];

    // Check gap before first threshold
    if (sorted[0].min_percentage > 0) {
      gaps.push({
        start: 0,
        end: sorted[0].min_percentage
      });
    }

    // Check gaps between thresholds
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];

      if (current.max_percentage < next.min_percentage) {
        gaps.push({
          start: current.max_percentage,
          end: next.min_percentage
        });
      }
    }

    // Check gap after last threshold
    const last = sorted[sorted.length - 1];
    if (last.max_percentage < 100) {
      gaps.push({
        start: last.max_percentage,
        end: 100
      });
    }

    return gaps;
  };

  /**
   * Validate threshold coverage (0-100%)
   * @param {Array} thresholds - Array of threshold objects for same degree and type
   * @returns {Object} Validation result
   */
  const validateCoverage = (thresholds) => {
    const gaps = findGaps(thresholds);
    return {
      isComplete: gaps.length === 0,
      gaps: gaps,
      coverage: calculateCoverage(thresholds)
    };
  };

  /**
   * Calculate total coverage percentage
   * @param {Array} thresholds - Array of threshold objects
   * @returns {number} Coverage percentage
   */
  const calculateCoverage = (thresholds) => {
    if (!thresholds || thresholds.length === 0) return 0;

    const coverage = thresholds.reduce((total, t) => {
      return total + (t.max_percentage - t.min_percentage);
    }, 0);

    return Math.min(coverage, 100);
  };

  return {
    hasOverlap,
    findGaps,
    validateCoverage,
    calculateCoverage
  };
};

export default useThresholds;
