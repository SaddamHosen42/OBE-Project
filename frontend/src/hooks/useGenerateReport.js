import { useState } from 'react';
import api from '../services/api';

/**
 * Custom hook for generating reports
 * @returns {object} Generate report function and generating state
 */
export const useGenerateReport = () => {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [generatedReport, setGeneratedReport] = useState(null);

  /**
   * Generate a report based on type and filters
   * @param {string} reportType - Type of report to generate
   * @param {object} filters - Filter parameters for report generation
   * @param {object} options - Additional options for report generation
   * @returns {Promise<object>} Generated report data
   */
  const generateReport = async (reportType, filters = {}, options = {}) => {
    setGenerating(true);
    setError(null);
    setGeneratedReport(null);

    try {
      const endpoint = getGenerateEndpoint(reportType);
      
      const requestData = {
        filters,
        options: {
          includeCharts: options.includeCharts ?? true,
          includeDetails: options.includeDetails ?? true,
          includeStatistics: options.includeStatistics ?? true,
          format: options.format || 'json',
          ...options
        }
      };

      const response = await api.post(endpoint, requestData);
      setGeneratedReport(response.data);
      
      return response.data;
    } catch (err) {
      console.error('Error generating report:', err);
      const errorMessage = err.response?.data?.message || 'Failed to generate report';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  /**
   * Export report in a specific format
   * @param {string} reportType - Type of report to export
   * @param {object} reportData - Report data to export
   * @param {string} format - Export format (pdf, excel, csv)
   * @param {object} exportOptions - Additional export options
   * @returns {Promise<Blob>} Exported file as blob
   */
  const exportReport = async (reportType, reportData, format = 'pdf', exportOptions = {}) => {
    setGenerating(true);
    setError(null);

    try {
      const endpoint = `/api/reports/${reportType}/export`;
      
      const response = await api.post(
        endpoint,
        {
          reportData,
          format,
          options: exportOptions
        },
        {
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const extension = getFileExtension(format);
      const filename = `${reportType}-report-${Date.now()}.${extension}`;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      window.URL.revokeObjectURL(url);
      
      return response.data;
    } catch (err) {
      console.error('Error exporting report:', err);
      const errorMessage = err.response?.data?.message || 'Failed to export report';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  /**
   * Schedule report generation
   * @param {string} reportType - Type of report
   * @param {object} schedule - Schedule configuration
   * @returns {Promise<object>} Scheduled report details
   */
  const scheduleReport = async (reportType, schedule) => {
    setGenerating(true);
    setError(null);

    try {
      const response = await api.post('/api/reports/schedule', {
        reportType,
        schedule: {
          frequency: schedule.frequency, // daily, weekly, monthly
          time: schedule.time,
          recipients: schedule.recipients,
          filters: schedule.filters,
          format: schedule.format || 'pdf'
        }
      });

      return response.data;
    } catch (err) {
      console.error('Error scheduling report:', err);
      const errorMessage = err.response?.data?.message || 'Failed to schedule report';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  /**
   * Get report generation history
   * @param {object} filters - Filter parameters
   * @returns {Promise<Array>} List of generated reports
   */
  const getReportHistory = async (filters = {}) => {
    try {
      const response = await api.get('/api/reports/history', { params: filters });
      return response.data;
    } catch (err) {
      console.error('Error fetching report history:', err);
      throw new Error('Failed to fetch report history');
    }
  };

  /**
   * Delete a generated report
   * @param {string} reportId - ID of the report to delete
   * @returns {Promise<void>}
   */
  const deleteReport = async (reportId) => {
    try {
      await api.delete(`/api/reports/${reportId}`);
    } catch (err) {
      console.error('Error deleting report:', err);
      throw new Error('Failed to delete report');
    }
  };

  return {
    generateReport,
    exportReport,
    scheduleReport,
    getReportHistory,
    deleteReport,
    generating,
    error,
    generatedReport
  };
};

/**
 * Get the API endpoint for report generation
 */
const getGenerateEndpoint = (reportType) => {
  const endpoints = {
    'clo-attainment': '/api/reports/generate/clo-attainment',
    'plo-attainment': '/api/reports/generate/plo-attainment',
    'course': '/api/reports/generate/course',
    'program': '/api/reports/generate/program',
    'student': '/api/reports/generate/student',
    'batch': '/api/reports/generate/batch'
  };

  return endpoints[reportType] || '/api/reports/generate';
};

/**
 * Get file extension for export format
 */
const getFileExtension = (format) => {
  const extensions = {
    'pdf': 'pdf',
    'excel': 'xlsx',
    'csv': 'csv',
    'image': 'png',
    'json': 'json'
  };

  return extensions[format] || 'pdf';
};

export default useGenerateReport;
