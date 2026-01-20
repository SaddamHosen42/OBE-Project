import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const useRubricScoring = (assessmentId, studentId = null) => {
  const [rubrics, setRubrics] = useState([]);
  const [students, setStudents] = useState([]);
  const [student, setStudent] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch rubrics and students for an assessment
  const fetchRubricsAndStudents = useCallback(async () => {
    if (!assessmentId) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch rubrics
      const rubricsResponse = await axios.get(
        `${API_URL}/rubrics/assessment/${assessmentId}`,
        { headers }
      );
      setRubrics(rubricsResponse.data.data || []);

      // Fetch enrolled students
      const studentsResponse = await axios.get(
        `${API_URL}/enrollments/assessment/${assessmentId}/students`,
        { headers }
      );
      setStudents(studentsResponse.data.data || []);

      // Fetch existing scores
      const scoresResponse = await axios.get(
        `${API_URL}/rubric-scores/assessment/${assessmentId}`,
        { headers }
      );
      setScores(scoresResponse.data.data || []);
    } catch (err) {
      console.error('Error fetching rubrics and students:', err);
      setError(
        err.response?.data?.message || 'Failed to fetch rubrics and students'
      );
    } finally {
      setLoading(false);
    }
  }, [assessmentId]);

  // Fetch rubrics and scores for a specific student
  const fetchStudentScoring = useCallback(async () => {
    if (!assessmentId || !studentId) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch rubrics
      const rubricsResponse = await axios.get(
        `${API_URL}/rubrics/assessment/${assessmentId}`,
        { headers }
      );
      setRubrics(rubricsResponse.data.data || []);

      // Fetch student details
      const studentResponse = await axios.get(
        `${API_URL}/students/${studentId}`,
        { headers }
      );
      setStudent(studentResponse.data.data || null);

      // Fetch student's scores
      const scoresResponse = await axios.get(
        `${API_URL}/rubric-scores/assessment/${assessmentId}/student/${studentId}`,
        { headers }
      );
      setScores(scoresResponse.data.data || []);
    } catch (err) {
      console.error('Error fetching student scoring:', err);
      setError(
        err.response?.data?.message || 'Failed to fetch student scoring data'
      );
    } finally {
      setLoading(false);
    }
  }, [assessmentId, studentId]);

  // Save a single score
  const saveScore = useCallback(async (scoreData) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      let response;
      if (scoreData.id) {
        // Update existing score
        response = await axios.put(
          `${API_URL}/rubric-scores/${scoreData.id}`,
          scoreData,
          { headers }
        );
      } else {
        // Create new score
        response = await axios.post(
          `${API_URL}/rubric-scores`,
          scoreData,
          { headers }
        );
      }

      // Update local scores
      setScores((prevScores) => {
        const existingIndex = prevScores.findIndex(
          (s) =>
            s.student_id === scoreData.student_id &&
            s.rubric_id === scoreData.rubric_id
        );

        if (existingIndex >= 0) {
          const newScores = [...prevScores];
          newScores[existingIndex] = response.data.data;
          return newScores;
        } else {
          return [...prevScores, response.data.data];
        }
      });

      return response.data;
    } catch (err) {
      console.error('Error saving score:', err);
      throw new Error(err.response?.data?.message || 'Failed to save score');
    }
  }, []);

  // Save multiple scores at once
  const saveAllScores = useCallback(async (scoresData) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.post(
        `${API_URL}/rubric-scores/bulk`,
        { scores: scoresData },
        { headers }
      );

      // Update local scores
      setScores(response.data.data || []);

      return response.data;
    } catch (err) {
      console.error('Error saving scores:', err);
      throw new Error(err.response?.data?.message || 'Failed to save scores');
    }
  }, []);

  // Delete a score
  const deleteScore = useCallback(async (scoreId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      await axios.delete(`${API_URL}/rubric-scores/${scoreId}`, { headers });

      // Remove from local scores
      setScores((prevScores) => prevScores.filter((s) => s.id !== scoreId));
    } catch (err) {
      console.error('Error deleting score:', err);
      throw new Error(err.response?.data?.message || 'Failed to delete score');
    }
  }, []);

  // Get scores for a specific student
  const getStudentScores = useCallback(
    (studentId) => {
      return scores.filter((score) => score.student_id === studentId);
    },
    [scores]
  );

  // Get score for a specific student and rubric
  const getScore = useCallback(
    (studentId, rubricId) => {
      return scores.find(
        (score) =>
          score.student_id === studentId && score.rubric_id === rubricId
      );
    },
    [scores]
  );

  // Calculate total score for a student
  const calculateStudentTotal = useCallback(
    (studentId) => {
      const studentScores = getStudentScores(studentId);
      let total = 0;
      let maxTotal = 0;

      rubrics.forEach((rubric) => {
        const score = studentScores.find((s) => s.rubric_id === rubric.id);
        maxTotal += rubric.max_score;
        if (score) {
          total += score.score_level || 0;
        }
      });

      return {
        total,
        maxTotal,
        percentage: maxTotal > 0 ? ((total / maxTotal) * 100).toFixed(2) : 0,
      };
    },
    [rubrics, getStudentScores]
  );

  // Calculate weighted score for a student
  const calculateWeightedScore = useCallback(
    (studentId) => {
      const studentScores = getStudentScores(studentId);
      let weightedTotal = 0;

      rubrics.forEach((rubric) => {
        const score = studentScores.find((s) => s.rubric_id === rubric.id);
        if (score) {
          const percentage = (score.score_level / rubric.max_score) * 100;
          weightedTotal += (percentage * rubric.weightage) / 100;
        }
      });

      return weightedTotal.toFixed(2);
    },
    [rubrics, getStudentScores]
  );

  return {
    rubrics,
    students,
    student,
    scores,
    loading,
    error,
    fetchRubricsAndStudents,
    fetchStudentScoring,
    saveScore,
    saveAllScores,
    deleteScore,
    getStudentScores,
    getScore,
    calculateStudentTotal,
    calculateWeightedScore,
  };
};
