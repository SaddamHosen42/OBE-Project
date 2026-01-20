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
  Eye
} from 'lucide-react';
import useCLOAttainment from '../../hooks/useCLOAttainment';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function CLOAttainmentReport() {
  const {
    reports,
    loading,
    error,
    fetchReports,
    generateReport,
    downloadReport,
    emailReport
  } = useCLOAttainment();

  const [reportConfig, setReportConfig] = useState({
    reportType: 'summary',
    academicSession: '',
    semester: '',
    department: '',
    course: '',
    includeCharts: true,
    includeStudentDetails: false,
    includePLOMapping: true,
    includeRecommendations: true,
    format: 'pdf'
  });

  const [showFilters, setShowFilters] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const handleConfigChange = (field, value) => {
    setReportConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const report = await generateReport(reportConfig);
      setSelectedReport(report);
      fetchReports(); // Refresh the list
    } catch (err) {
      console.error('Report generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadReport = async (reportId) => {
    try {
      await downloadReport(reportId);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleEmailReport = async (reportId) => {
    const email = prompt('Enter email address:');
    if (email) {
      try {
        await emailReport(reportId, email);
        alert('Report sent successfully!');
      } catch (err) {
        console.error('Email failed:', err);
        alert('Failed to send email');
      }
    }
  };

  const handlePrintReport = (reportId) => {
    // Open report in new window for printing
    window.open(`/api/clo-attainment/report/${reportId}/print`, '_blank');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CLO Attainment Reports</h1>
          <p className="mt-1 text-sm text-gray-600">
            Generate and manage comprehensive CLO attainment reports
          </p>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Generate New Report</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-sm text-indigo-600 hover:text-indigo-700"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide' : 'Show'} Options
          </button>
        </div>

        {showFilters && (
          <div className="space-y-6">
            {/* Report Type */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Report Type
              </label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {[
                  { value: 'summary', label: 'Summary Report', desc: 'Overall attainment summary' },
                  { value: 'detailed', label: 'Detailed Report', desc: 'Complete analysis with all data' },
                  { value: 'comparative', label: 'Comparative Report', desc: 'Compare across semesters' }
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleConfigChange('reportType', type.value)}
                    className={`p-4 text-left border-2 rounded-lg transition-all ${
                      reportConfig.reportType === type.value
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900">{type.label}</h3>
                    <p className="mt-1 text-sm text-gray-600">{type.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Academic Session
                </label>
                <input
                  type="text"
                  value={reportConfig.academicSession}
                  onChange={(e) => handleConfigChange('academicSession', e.target.value)}
                  placeholder="e.g., 2023-2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Semester
                </label>
                <select
                  value={reportConfig.semester}
                  onChange={(e) => handleConfigChange('semester', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Semesters</option>
                  <option value="Fall">Fall</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Department
                </label>
                <input
                  type="text"
                  value={reportConfig.department}
                  onChange={(e) => handleConfigChange('department', e.target.value)}
                  placeholder="Enter department"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Course
                </label>
                <input
                  type="text"
                  value={reportConfig.course}
                  onChange={(e) => handleConfigChange('course', e.target.value)}
                  placeholder="Enter course code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Report Options */}
            <div>
              <label className="block mb-3 text-sm font-medium text-gray-700">
                Report Options
              </label>
              <div className="space-y-2">
                {[
                  { key: 'includeCharts', label: 'Include Charts and Visualizations' },
                  { key: 'includeStudentDetails', label: 'Include Student-level Details' },
                  { key: 'includePLOMapping', label: 'Include PLO Mapping Analysis' },
                  { key: 'includeRecommendations', label: 'Include Recommendations' }
                ].map((option) => (
                  <label key={option.key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reportConfig[option.key]}
                      onChange={(e) => handleConfigChange(option.key, e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Format Selection */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Export Format
              </label>
              <div className="flex space-x-4">
                {[
                  { value: 'pdf', label: 'PDF' },
                  { value: 'excel', label: 'Excel' },
                  { value: 'word', label: 'Word' }
                ].map((format) => (
                  <button
                    key={format.value}
                    onClick={() => handleConfigChange('format', format.value)}
                    className={`px-4 py-2 border-2 rounded-lg transition-all ${
                      reportConfig.format === format.value
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {format.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                onClick={handleGenerateReport}
                disabled={generating}
                className="flex items-center px-6 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5 mr-2" />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center p-4 text-red-800 bg-red-100 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 mr-3" />
          <span>{error}</span>
        </div>
      )}

      {/* Generated Reports List */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="mb-6 text-xl font-bold text-gray-900">Recent Reports</h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : reports && reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.reportId}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
              >
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
                      {report.status === 'completed' ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Completed
                        </span>
                      ) : (
                        <span className="flex items-center text-yellow-600">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Processing
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {report.status === 'completed' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => window.open(report.previewUrl, '_blank')}
                      className="p-2 text-gray-600 hover:text-indigo-600"
                      title="Preview"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDownloadReport(report.reportId)}
                      className="p-2 text-gray-600 hover:text-indigo-600"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handlePrintReport(report.reportId)}
                      className="p-2 text-gray-600 hover:text-indigo-600"
                      title="Print"
                    >
                      <Printer className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEmailReport(report.reportId)}
                      className="p-2 text-gray-600 hover:text-indigo-600"
                      title="Email"
                    >
                      <Mail className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="w-16 h-16 mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">No Reports Yet</h3>
            <p className="text-sm text-gray-600">
              Generate your first report using the configuration above
            </p>
          </div>
        )}
      </div>

      {/* Report Preview */}
      {selectedReport && (
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-gray-900">Report Preview</h2>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <iframe
              src={selectedReport.previewUrl}
              className="w-full border-0 rounded"
              style={{ minHeight: '600px' }}
              title="Report Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}
