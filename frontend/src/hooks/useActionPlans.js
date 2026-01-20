import { useState, useEffect } from 'react';
import api from '../services/api';

export const useActionPlans = (degreeId = null) => {
  const [actionPlans, setActionPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActionPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = degreeId 
        ? `/action-plans?degreeId=${degreeId}`
        : '/action-plans';
      
      const response = await api.get(url);
      setActionPlans(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch action plans');
      console.error('Error fetching action plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActionPlans();
  }, [degreeId]);

  const createActionPlan = async (actionPlanData) => {
    try {
      const response = await api.post('/action-plans', actionPlanData);
      await fetchActionPlans(); // Refresh the list
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const updateActionPlan = async (id, actionPlanData) => {
    try {
      const response = await api.put(`/action-plans/${id}`, actionPlanData);
      await fetchActionPlans(); // Refresh the list
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const deleteActionPlan = async (id) => {
    try {
      await api.delete(`/action-plans/${id}`);
      await fetchActionPlans(); // Refresh the list
    } catch (err) {
      throw err;
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await api.patch(`/action-plans/${id}/status`, { status });
      await fetchActionPlans(); // Refresh the list
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  return {
    actionPlans,
    loading,
    error,
    createActionPlan,
    updateActionPlan,
    deleteActionPlan,
    updateStatus,
    refetch: fetchActionPlans
  };
};

export const useActionPlan = (id) => {
  const [actionPlan, setActionPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActionPlan = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/action-plans/${id}?includeOutcomes=true`);
      setActionPlan(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch action plan');
      console.error('Error fetching action plan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActionPlan();
  }, [id]);

  const updateActionPlan = async (planId, actionPlanData) => {
    try {
      const response = await api.put(`/action-plans/${planId}`, actionPlanData);
      await fetchActionPlan(); // Refresh the data
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const deleteActionPlan = async (planId) => {
    try {
      await api.delete(`/action-plans/${planId}`);
    } catch (err) {
      throw err;
    }
  };

  const updateStatus = async (planId, status) => {
    try {
      const response = await api.patch(`/action-plans/${planId}/status`, { status });
      await fetchActionPlan(); // Refresh the data
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const addOutcome = async (planId, outcomeData) => {
    try {
      const response = await api.post(`/action-plans/${planId}/outcomes`, outcomeData);
      await fetchActionPlan(); // Refresh the data
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const updateOutcome = async (planId, outcomeId, outcomeData) => {
    try {
      const response = await api.put(`/action-plans/${planId}/outcomes/${outcomeId}`, outcomeData);
      await fetchActionPlan(); // Refresh the data
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const deleteOutcome = async (planId, outcomeId) => {
    try {
      await api.delete(`/action-plans/${planId}/outcomes/${outcomeId}`);
      await fetchActionPlan(); // Refresh the data
    } catch (err) {
      throw err;
    }
  };

  return {
    actionPlan,
    loading,
    error,
    updateActionPlan,
    deleteActionPlan,
    updateStatus,
    addOutcome,
    updateOutcome,
    deleteOutcome,
    refetch: fetchActionPlan
  };
};
