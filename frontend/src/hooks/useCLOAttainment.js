import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function useCLOAttainment() {
  const [attainmentSummary, setAttainmentSummary] = useState(null);
  const [studentAttainment, setStudentAttainment] = useState(null);
  const [courseAttainment, setCourseAttainment] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch CLO Attainment Summary
  const fetchAttainmentSummary = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await axios.get(
        `${API_BASE_URL}/clo-attainment/summary?${params.toString()}`
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

  // Fetch Student CLO Attainment
  const fetchStudentAttainment = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await axios.get(
        `${API_BASE_URL}/clo-attainment/student?${params.toString()}`
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

  // Fetch Course CLO Attainment
  const fetchCourseAttainment = useCallback(async (courseId, offeringId = 'all') => {
    setLoading(true);
    setError(null);
    try {
      const params = offeringId !== 'all' ? `?offeringId=${offeringId}` : '';
      const response = await axios.get(
        `${API_BASE_URL}/clo-attainment/course/${courseId}${params}`
      );
      setCourseAttainment(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch course attainment';
      setError(errorMessage);
      console.error('Error fetching course attainment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate CLO Attainment
  const calculateCLOAttainment = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/clo-attainment/calculate`,
        data
      );
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to calculate attainment';
      setError(errorMessage);
      console.error('Error calculating attainment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get CLO Attainment by ID
  const getCLOAttainmentById = useCallback(async (attainmentId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/clo-attainment/${attainmentId}`
      );
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch CLO attainment';
      setError(errorMessage);
      console.error('Error fetching CLO attainment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update CLO Attainment
  const updateCLOAttainment = useCallback(async (attainmentId, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/clo-attainment/${attainmentId}`,
        data
      );
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update CLO attainment';
      setError(errorMessage);
      console.error('Error updating CLO attainment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete CLO Attainment
  const deleteCLOAttainment = useCallback(async (attainmentId) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_BASE_URL}/clo-attainment/${attainmentId}`);
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete CLO attainment';
      setError(errorMessage);
      console.error('Error deleting CLO attainment:', err);
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
        `${API_BASE_URL}/clo-attainment/reports?${params.toString()}`
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
  const generateReport = useCallback(async (config) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/clo-attainment/reports/generate`,
        config
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
        `${API_BASE_URL}/clo-attainment/reports/${reportId}/download`,
        { responseType: 'blob' }
      );

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `clo-attainment-report-${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
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
  const emailReport = useCallback(async (reportId, email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/clo-attainment/reports/${reportId}/email`,
        { email }
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

  // Export Attainment Report
  const exportAttainmentReport = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await axios.get(
        `${API_BASE_URL}/clo-attainment/export?${params.toString()}`,
        { responseType: 'blob' }
      );

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `clo-attainment-export-${Date.now()}.xlsx`);
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

  // Export Student Attainment Report
  const exportStudentAttainmentReport = useCallback(async (studentId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/clo-attainment/student/${studentId}/export`,
        { responseType: 'blob' }
      );

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `student-attainment-${studentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to export student report';
      setError(errorMessage);
      console.error('Error exporting student report:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Export Course Attainment Report
  const exportCourseAttainmentReport = useCallback(async (courseId, offeringId = 'all') => {
    setLoading(true);
    setError(null);
    try {
      const params = offeringId !== 'all' ? `?offeringId=${offeringId}` : '';
      const response = await axios.get(
        `${API_BASE_URL}/clo-attainment/course/${courseId}/export${params}`,
        { responseType: 'blob' }
      );

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `course-attainment-${courseId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to export course report';
      setError(errorMessage);
      console.error('Error exporting course report:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    attainmentSummary,
    studentAttainment,
    courseAttainment,
    reports,
    loading,
    error,

    // Methods
    fetchAttainmentSummary,
    fetchStudentAttainment,
    fetchCourseAttainment,
    calculateCLOAttainment,
    getCLOAttainmentById,
    updateCLOAttainment,
    deleteCLOAttainment,
    fetchReports,
    generateReport,
    downloadReport,
    emailReport,
    exportAttainmentReport,
    exportStudentAttainmentReport,
    exportCourseAttainmentReport
  };
}
