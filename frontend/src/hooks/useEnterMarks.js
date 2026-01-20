import { useState } from 'react';
import { toast } from 'react-hot-toast';
import marksService from '../services/marksService';

/**
 * useEnterMarks Hook
 * Custom hook for managing marks entry state and operations
 * @param {number} assessmentId - Assessment component ID
 * @returns {Object} Marks entry state and functions
 */
const useEnterMarks = (assessmentId) => {
  const [marksEntries, setMarksEntries] = useState({});
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  /**
   * Initialize marks entries for a student
   * @param {number} studentId - Student ID
   * @param {Array} questions - Array of questions
   * @param {Array} existingMarks - Existing marks data
   */
  const initializeMarks = (studentId, questions, existingMarks = []) => {
    const entries = {};
    questions.forEach(question => {
      const existingMark = existingMarks.find(
        m => m.student_id === studentId && m.question_id === question.question_id
      );
      entries[question.question_id] = existingMark ? existingMark.marks_obtained : '';
    });
    
    setMarksEntries(prev => ({
      ...prev,
      [studentId]: entries
    }));
    
    // Clear errors for this student
    setErrors(prev => ({
      ...prev,
      [studentId]: {}
    }));
  };

  /**
   * Update marks for a specific student and question
   * @param {number} studentId - Student ID
   * @param {number} questionId - Question ID
   * @param {number|string} value - Marks value
   */
  const updateMarks = (studentId, questionId, value) => {
    setMarksEntries(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [questionId]: value
      }
    }));
    
    // Clear error for this question
    if (errors[studentId]?.[questionId]) {
      setErrors(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [questionId]: ''
        }
      }));
    }
  };

  /**
   * Validate marks entries
   * @param {number} studentId - Student ID
   * @param {Array} questions - Array of questions
   * @returns {boolean} True if valid
   */
  const validateMarks = (studentId, questions) => {
    const studentMarks = marksEntries[studentId] || {};
    const newErrors = {};
    let isValid = true;

    Object.entries(studentMarks).forEach(([questionId, marks]) => {
      if (marks === '' || marks === null) return; // Skip empty entries
      
      const question = questions.find(q => q.question_id === parseInt(questionId));
      if (!question) return;
      
      const marksNum = parseFloat(marks);
      
      if (isNaN(marksNum)) {
        newErrors[questionId] = 'Invalid marks value';
        isValid = false;
      } else if (marksNum < 0) {
        newErrors[questionId] = 'Marks cannot be negative';
        isValid = false;
      } else if (marksNum > question.total_marks) {
        newErrors[questionId] = `Maximum ${question.total_marks} marks`;
        isValid = false;
      }
    });

    setErrors(prev => ({
      ...prev,
      [studentId]: newErrors
    }));
    
    return isValid;
  };

  /**
   * Save marks for a student
   * @param {number} studentId - Student ID
   * @param {Array} questions - Array of questions
   * @returns {Promise} Save result
   */
  const saveMarks = async (studentId, questions) => {
    if (!validateMarks(studentId, questions)) {
      toast.error('Please fix validation errors');
      return { success: false };
    }

    const studentMarks = marksEntries[studentId] || {};
    const marksArray = Object.entries(studentMarks)
      .filter(([_, marks]) => marks !== '' && marks !== null)
      .map(([questionId, marks]) => ({
        student_id: studentId,
        question_id: parseInt(questionId),
        assessment_component_id: parseInt(assessmentId),
        marks_obtained: parseFloat(marks),
      }));

    if (marksArray.length === 0) {
      toast.warning('No marks to save');
      return { success: false };
    }

    setIsSaving(true);
    try {
      const response = await marksService.bulkCreateMarks(marksArray);
      
      if (response.success) {
        toast.success(`Saved ${marksArray.length} marks entries`);
        return { success: true, data: response.data };
      }
      return { success: false };
    } catch (error) {
      console.error('Error saving marks:', error);
      toast.error(error.message || 'Failed to save marks');
      return { success: false, error };
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Validate marks data against API
   * @param {Array} marksArray - Array of marks data
   * @returns {Promise} Validation result
   */
  const validateMarksData = async (marksArray) => {
    try {
      const response = await marksService.validateMarks(marksArray);
      setValidationResult(response.data);
      return response;
    } catch (error) {
      console.error('Error validating marks:', error);
      toast.error('Failed to validate marks');
      return { success: false, error };
    }
  };

  /**
   * Clear marks entries for a student
   * @param {number} studentId - Student ID
   */
  const clearMarks = (studentId) => {
    setMarksEntries(prev => {
      const newEntries = { ...prev };
      delete newEntries[studentId];
      return newEntries;
    });
    
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[studentId];
      return newErrors;
    });
  };

  /**
   * Calculate total marks for a student
   * @param {number} studentId - Student ID
   * @returns {number} Total marks
   */
  const calculateTotal = (studentId) => {
    const studentMarks = marksEntries[studentId] || {};
    return Object.values(studentMarks)
      .filter(m => m !== '' && m !== null)
      .reduce((sum, m) => sum + parseFloat(m), 0);
  };

  /**
   * Get marks for a specific student and question
   * @param {number} studentId - Student ID
   * @param {number} questionId - Question ID
   * @returns {number|string} Marks value
   */
  const getMarks = (studentId, questionId) => {
    return marksEntries[studentId]?.[questionId] || '';
  };

  /**
   * Get error for a specific student and question
   * @param {number} studentId - Student ID
   * @param {number} questionId - Question ID
   * @returns {string} Error message
   */
  const getError = (studentId, questionId) => {
    return errors[studentId]?.[questionId] || '';
  };

  /**
   * Check if student has any marks entered
   * @param {number} studentId - Student ID
   * @returns {boolean} True if has marks
   */
  const hasMarks = (studentId) => {
    const studentMarks = marksEntries[studentId] || {};
    return Object.values(studentMarks).some(m => m !== '' && m !== null);
  };

  /**
   * Reset all marks entries
   */
  const resetAll = () => {
    setMarksEntries({});
    setErrors({});
    setValidationResult(null);
  };

  return {
    // State
    marksEntries,
    errors,
    isSaving,
    validationResult,
    
    // Functions
    initializeMarks,
    updateMarks,
    validateMarks,
    saveMarks,
    validateMarksData,
    clearMarks,
    calculateTotal,
    getMarks,
    getError,
    hasMarks,
    resetAll,
  };
};

export default useEnterMarks;
