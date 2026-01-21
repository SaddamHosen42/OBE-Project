import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Printer,
  FileText,
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import useIndirectAttainment from '../../hooks/useIndirectAttainment';
import useDegrees from '../../hooks/useDegrees';
import IndirectAttainmentChart from '../../components/attainment/IndirectAttainmentChart';
import SurveyAttainmentTable from '../../components/attainment/SurveyAttainmentTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function IndirectAttainmentReport() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reportRef = useRef();
  
  const {
    programReport,
    surveyAttainment,
    loading,
    error,
    fetchProgramReport,
    fetchBySurvey,
    exportReport
  } = useIndirectAttainment();
  const { degrees, fetchDegrees } = useDegrees();

  const [selectedDegree, setSelectedDegree] = useState(searchParams.get('degreeId') || '');
  const surveyId = searchParams.get('surveyId') || '';
  const outcomeType = searchParams.get('outcomeType') || 'PLO';

  useEffect(() => {
    fetchDegrees();
  }, [fetchDegrees]);

  useEffect(() => {
    if (selectedDegree) {
      fetchProgramReport(selectedDegree);
    } else if (surveyId) {
      fetchBySurvey(surveyId, outcomeType);
    }
  }, [selectedDegree, surveyId, outcomeType, fetchProgramReport, fetchBySurvey]);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = async (format = 'pdf') => {
    if (!selectedDegree) {
      alert('Please select a program to export report');
      return;
    }

    try {
      await exportReport(selectedDegree, format);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const reportData = programReport || surveyAttainment;
  
  // Prepare chart data
  const chartData = reportData?.results?.map(result => ({
    label: result.outcome_label || `${outcomeType}-${result.outcome_id}`,
    attainment: result.attainment_percentage || 0
  })) || [];

  // Calculate statistics
  const threshold = 70;
  const stats = {
    totalOutcomes: reportData?.results?.length || 0,
    achievedTarget: reportData?.results?.filter(r => r.attainment_percentage >= threshold).length || 0,
    belowTarget: reportData?.results?.filter(r => r.attainment_percentage < threshold).length || 0,
    avgAttainment: reportData?.results?.length > 0
      ? (reportData.results.reduce((sum, r) => sum + (r.attainment_percentage || 0), 0) / reportData.results.length).toFixed(1)
      : 0,
    achievementRate: reportData?.results?.length > 0
      ? ((reportData.results.filter(r => r.attainment_percentage >= threshold).length / reportData.results.length) * 100).toFixed(1)
      : 0
  };

  if (loading && !reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Hidden when printing */}
      <div className="bg-white border-b border-gray-200 print:hidden">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Indirect Attainment Report</h1>
                <p className="text-sm text-gray-600">Comprehensive survey-based assessment report</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedDegree}
                onChange={(e) => setSelectedDegree(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Program</option>
                {degrees?.map(degree => (
                  <option key={degree.id} value={degree.id}>
                    {degree.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handlePrint}
                className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Printer className="w-5 h-5 mr-2" />
                Print
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                <Download className="w-5 h-5 mr-2" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="max-w-7xl mx-auto px-6 py-8" ref={reportRef}>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start mb-6">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {reportData ? (
          <div className="space-y-8">
            {/* Report Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Indirect Attainment Assessment Report
                  </h2>
                  {programReport?.program_info && (
                    <div className="text-lg text-gray-700">
                      {programReport.program_info.name}
                    </div>
                  )}
                  {surveyAttainment?.survey && (
                    <div className="text-lg text-gray-700">
                      Survey: {surveyAttainment.survey.title}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Generated: {new Date().toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Type: {outcomeType} Assessment
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Executive Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{stats.totalOutcomes}</div>
                    <div className="text-sm text-gray-600 mt-1">Total {outcomeType}s</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.achievedTarget}</div>
                    <div className="text-sm text-gray-600 mt-1">Achieved</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{stats.belowTarget}</div>
                    <div className="text-sm text-gray-600 mt-1">Below Target</div>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">{stats.avgAttainment}%</div>
                    <div className="text-sm text-gray-600 mt-1">Avg Attainment</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.achievementRate}%</div>
                    <div className="text-sm text-gray-600 mt-1">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Assessment */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
                Overall Assessment
              </h3>
              <div className="prose max-w-none">
                <p className="text-gray-700">
                  This indirect attainment report presents survey-based assessment results for {outcomeType}s.
                  The data shows that <strong>{stats.achievedTarget}</strong> out of <strong>{stats.totalOutcomes}</strong> outcomes
                  have achieved the target threshold of {threshold}%, resulting in an overall achievement rate of <strong>{stats.achievementRate}%</strong>.
                </p>
                <p className="text-gray-700 mt-3">
                  The average attainment across all outcomes is <strong>{stats.avgAttainment}%</strong>, which is 
                  {parseFloat(stats.avgAttainment) >= threshold 
                    ? ' above the target threshold, indicating strong performance.' 
                    : ' below the target threshold, suggesting areas for improvement.'}
                </p>
              </div>
            </div>

            {/* Attainment Chart */}
            {chartData.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <PieChartIcon className="w-5 h-5 mr-2 text-indigo-600" />
                  Attainment Distribution
                </h3>
                <IndirectAttainmentChart
                  data={chartData}
                  type="bar"
                  showThreshold={true}
                  threshold={threshold}
                  height={400}
                />
              </div>
            )}

            {/* Detailed Results Table */}
            {reportData.results && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                  Detailed Assessment Results
                </h3>
                <SurveyAttainmentTable
                  data={reportData.results}
                  threshold={threshold}
                  outcomeType={outcomeType}
                />
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
                Recommendations
              </h3>
              <div className="space-y-3">
                {stats.belowTarget > 0 && (
                  <div className="flex items-start p-3 bg-yellow-50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-700">
                      <strong>Action Required:</strong> {stats.belowTarget} outcome(s) are below the target threshold.
                      Review the specific outcomes and develop improvement strategies.
                    </div>
                  </div>
                )}
                {stats.achievedTarget > 0 && (
                  <div className="flex items-start p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-700">
                      <strong>Strengths:</strong> {stats.achievedTarget} outcome(s) have achieved the target.
                      Continue to maintain and enhance these areas of success.
                    </div>
                  </div>
                )}
                <div className="flex items-start p-3 bg-blue-50 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600 mr-3 shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <strong>Continuous Improvement:</strong> Regular monitoring and assessment through surveys
                    should continue to track progress and identify emerging trends.
                  </div>
                </div>
              </div>
            </div>

            {/* Report Footer */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-sm text-gray-600">
              <p>This report was automatically generated on {new Date().toLocaleString()}</p>
              <p className="mt-1">For questions or concerns, please contact the assessment coordinator.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Report Data</h3>
            <p className="text-gray-600">Please select a program or survey to generate the report.</p>
          </div>
        )}
      </div>
    </div>
  );
}
