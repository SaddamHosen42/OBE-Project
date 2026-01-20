import { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  Mail,
  Calendar,
  Filter,
  CheckCircle,
  AlertCircle,
  Eye,
  Plus
} from 'lucide-react';
import usePLOAttainment from '../../hooks/usePLOAttainment';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function PLOAttainmentReport() {
  const {
    reports,
    loading,
    error,
    fetchReports,
    generateReport,
    downloadReport,
    emailReport
  } = usePLOAttainment();

  const [filters, setFilters] = useState({
    type: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  const [showFilters, setShowFilters] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [emailModalData, setEmailModalData] = useState(null);

  const [reportConfig, setReportConfig] = useState({
    title: '',
    type: 'program',
    degreeId: '',
    studentId: '',
    format: 'pdf',
    includeCharts: true,
    includeTrends: true,
    includeRecommendations: true
  });

  const [emailRecipients, setEmailRecipients] = useState('');

  useEffect(() => {
    fetchReports(filters);
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateReport = async () => {
    try {
      await generateReport(reportConfig);
      setShowGenerateModal(false);
      fetchReports(filters);
      // Reset form
      setReportConfig({
        title: '',
        type: 'program',
        degreeId: '',
        studentId: '',
        format: 'pdf',
        includeCharts: true,
        includeTrends: true,
        includeRecommendations: true
      });
    } catch (err) {
      console.error('Failed to generate report:', err);
    }
  };

  const handleDownloadReport = async (reportId) => {
    try {
      await downloadReport(reportId);
    } catch (err) {
      console.error('Failed to download report:', err);
    }
  };

  const handleEmailReport = async () => {
    if (!emailModalData || !emailRecipients) return;

    try {
      const recipients = emailRecipients.split(',').map(email => email.trim());
      await emailReport(emailModalData.id, recipients);
      setEmailModalData(null);
      setEmailRecipients('');
    } catch (err) {
      console.error('Failed to email report:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading && !reports) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">PLO Attainment Reports</h1>
          <p className="mt-1 text-sm text-gray-600">
            Generate, manage, and download PLO attainment reports
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="program">Program</option>
                <option value="student">Student</option>
                <option value="comparative">Comparative</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center p-4 text-red-700 bg-red-100 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Reports List */}
      <div className="space-y-4">
        {reports?.data && reports.data.length > 0 ? (
          reports.data.map((report) => (
            <div
              key={report.id}
              className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{report.title}</h3>
                    <div className="flex items-center mt-1 space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                      <span>Type: {report.type}</span>
                      <span>Format: {report.format.toUpperCase()}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                    {report.description && (
                      <p className="mt-2 text-sm text-gray-600">{report.description}</p>
                    )}
                  </div>
                </div>

                {report.status === 'completed' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDownloadReport(report.id)}
                      className="flex items-center px-3 py-2 text-sm text-indigo-600 hover:text-indigo-700"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-700"
                      title="Print"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEmailModalData(report)}
                      className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-700"
                      title="Email"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {report.status === 'processing' && (
                  <div className="flex items-center text-yellow-600">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2 text-sm">Processing...</span>
                  </div>
                )}

                {report.status === 'failed' && (
                  <div className="flex items-center text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="ml-2 text-sm">Failed</span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-white border border-gray-200 rounded-lg">
            <FileText className="w-16 h-16 mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">No Reports Found</h3>
            <p className="text-sm text-gray-600 mb-4">
              Generate your first PLO attainment report
            </p>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Generate Report
            </button>
          </div>
        )}
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Generate PLO Attainment Report</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Title</label>
                <input
                  type="text"
                  value={reportConfig.title}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter report title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                  <select
                    value={reportConfig.type}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="program">Program Report</option>
                    <option value="student">Student Report</option>
                    <option value="comparative">Comparative Report</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                  <select
                    value={reportConfig.format}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, format: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
              </div>

              {reportConfig.type === 'program' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Degree/Program ID</label>
                  <input
                    type="text"
                    value={reportConfig.degreeId}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, degreeId: e.target.value }))}
                    placeholder="Enter degree ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              )}

              {reportConfig.type === 'student' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                    <input
                      type="text"
                      value={reportConfig.studentId}
                      onChange={(e) => setReportConfig(prev => ({ ...prev, studentId: e.target.value }))}
                      placeholder="Enter student ID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Degree ID</label>
                    <input
                      type="text"
                      value={reportConfig.degreeId}
                      onChange={(e) => setReportConfig(prev => ({ ...prev, degreeId: e.target.value }))}
                      placeholder="Enter degree ID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Report Options</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reportConfig.includeCharts}
                      onChange={(e) => setReportConfig(prev => ({ ...prev, includeCharts: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Include Charts and Visualizations</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reportConfig.includeTrends}
                      onChange={(e) => setReportConfig(prev => ({ ...prev, includeTrends: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Include Trend Analysis</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reportConfig.includeRecommendations}
                      onChange={(e) => setReportConfig(prev => ({ ...prev, includeRecommendations: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Include Recommendations</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={!reportConfig.title || (reportConfig.type === 'program' && !reportConfig.degreeId) || (reportConfig.type === 'student' && (!reportConfig.studentId || !reportConfig.degreeId))}
                className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {emailModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Report</h2>
            <p className="text-sm text-gray-600 mb-4">
              Sending: <span className="font-semibold">{emailModalData.title}</span>
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Recipients (comma-separated)
              </label>
              <textarea
                value={emailRecipients}
                onChange={(e) => setEmailRecipients(e.target.value)}
                placeholder="user1@example.com, user2@example.com"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setEmailModalData(null);
                  setEmailRecipients('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEmailReport}
                disabled={!emailRecipients}
                className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
