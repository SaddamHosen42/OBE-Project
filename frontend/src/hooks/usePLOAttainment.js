import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function usePLOAttainment() {
  const [attainmentSummary, setAttainmentSummary] = useState(null);
  const [studentAttainment, setStudentAttainment] = useState(null);
  const [programAttainment, setProgramAttainment] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch PLO Attainment Summary
  const fetchAttainmentSummary = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await axios.get(
        `${API_BASE_URL}/plo-attainment/summary?${params.toString()}`
      );
      setAttainmentSummary(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch attainment summary';
      setError(errorMessage);
      console.error('Error fetching attainment summary:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Student PLO Attainment
  const fetchStudentAttainment = useCallback(async (studentId, degreeId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/plo-attainment/student/${studentId}/degree/${degreeId}`
      );
      setStudentAttainment(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch student attainment';
      setError(errorMessage);
      console.error('Error fetching student attainment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch All Student PLO Attainment Records
  const fetchStudentAllAttainment = useCallback(async (studentId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/plo-attainment/student/${studentId}`
      );
      setStudentAttainment(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch student attainment';
      setError(errorMessage);
      console.error('Error fetching student attainment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Program PLO Attainment
  const fetchProgramAttainment = useCallback(async (degreeId, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await axios.get(
        `${API_BASE_URL}/plo-attainment/program/${degreeId}?${params.toString()}`
      );
      setProgramAttainment(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch program attainment';
      setError(errorMessage);
      console.error('Error fetching program attainment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate Student PLO Attainment
  const calculateStudentAttainment = useCallback(async (studentId, degreeId, ploId = null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/plo-attainment/student/calculate`,
        {
          student_id: studentId,
          degree_id: degreeId,
          plo_id: ploId
        }
      );
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to calculate student attainment';
      setError(errorMessage);
      console.error('Error calculating student attainment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate Program PLO Attainment
  const calculateProgramAttainment = useCallback(async (degreeId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/plo-attainment/program/calculate`,
        { degree_id: degreeId }
      );
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to calculate program attainment';
      setError(errorMessage);
      console.error('Error calculating program attainment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update PLO Attainment Record
  const updatePLOAttainment = useCallback(async (attainmentId, attainmentData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/plo-attainment/${attainmentId}`,
        attainmentData
      );
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update PLO attainment';
      setError(errorMessage);
      console.error('Error updating PLO attainment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete PLO Attainment Record
  const deletePLOAttainment = useCallback(async (attainmentId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/plo-attainment/${attainmentId}`
      );
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete PLO attainment';
      setError(errorMessage);
      console.error('Error deleting PLO attainment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Reports
  const fetchReports = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await axios.get(
        `${API_BASE_URL}/plo-attainment/reports?${params.toString()}`
      );
      setReports(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch reports';
      setError(errorMessage);
      console.error('Error fetching reports:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate Report
  const generateReport = useCallback(async (reportConfig) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/plo-attainment/reports/generate`,
        reportConfig
      );
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to generate report';
      setError(errorMessage);
      console.error('Error generating report:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Download Report
  const downloadReport = useCallback(async (reportId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/plo-attainment/reports/${reportId}/download`,
        { responseType: 'blob' }
      );
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `plo_attainment_report_${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to download report';
      setError(errorMessage);
      console.error('Error downloading report:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Email Report
  const emailReport = useCallback(async (reportId, recipients) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/plo-attainment/reports/${reportId}/email`,
        { recipients }
      );
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to email report';
      setError(errorMessage);
      console.error('Error emailing report:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Export Student PLO Attainment Report
  const exportStudentAttainmentReport = useCallback(async (studentId, degreeId, format = 'pdf') => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/plo-attainment/student/${studentId}/degree/${degreeId}/export`,
        {
          params: { format },
          responseType: 'blob'
        }
      );
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `student_plo_attainment_${studentId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to export student attainment';
      setError(errorMessage);
      console.error('Error exporting student attainment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Export Program PLO Attainment Report
  const exportProgramAttainmentReport = useCallback(async (degreeId, format = 'pdf') => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/plo-attainment/program/${degreeId}/export`,
        {
          params: { format },
          responseType: 'blob'
        }
      );
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `program_plo_attainment_${degreeId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to export program attainment';
      setError(errorMessage);
      console.error('Error exporting program attainment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    attainmentSummary,
    studentAttainment,
    programAttainment,
    reports,
    loading,
    error,
    fetchAttainmentSummary,
    fetchStudentAttainment,
    fetchStudentAllAttainment,
    fetchProgramAttainment,
    calculateStudentAttainment,
    calculateProgramAttainment,
    updatePLOAttainment,
    deletePLOAttainment,
    fetchReports,
    generateReport,
    downloadReport,
    emailReport,
    exportStudentAttainmentReport,
    exportProgramAttainmentReport
  };
}
