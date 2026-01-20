import { useState, useEffect } from 'react';
import questionService from '../services/questionService';

export const useQuestions = (filters = {}) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await questionService.getAllQuestions(filters);
      setQuestions(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch questions');
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [JSON.stringify(filters)]);

  const createQuestion = async (questionData) => {
    try {
      const response = await questionService.createQuestion(questionData);
      await fetchQuestions(); // Refresh the list
      return response;
    } catch (err) {
      throw err;
    }
  };

  const updateQuestion = async (id, questionData) => {
    try {
      const response = await questionService.updateQuestion(id, questionData);
      await fetchQuestions(); // Refresh the list
      return response;
    } catch (err) {
      throw err;
    }
  };

  const deleteQuestion = async (id) => {
    try {
      const response = await questionService.deleteQuestion(id);
      await fetchQuestions(); // Refresh the list
      return response;
    } catch (err) {
      throw err;
    }
  };

  const bulkCreateQuestions = async (questionsData) => {
    try {
      const response = await questionService.bulkCreateQuestions(questionsData);
      await fetchQuestions(); // Refresh the list
      return response;
    } catch (err) {
      throw err;
    }
  };

  return {
    questions,
    loading,
    error,
    fetchQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    bulkCreateQuestions
  };
};

export default useQuestions;
