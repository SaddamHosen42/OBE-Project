import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Download,
  RefreshCcw,
  Filter,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Users,
  CheckCircle,
  XCircle,
  ChevronDown
} from 'lucide-react';
import useIndirectAttainment from '../../hooks/useIndirectAttainment';
import useSurveys from '../../hooks/useSurveys';
import IndirectAttainmentChart from '../../components/attainment/IndirectAttainmentChart';
import SurveyAttainmentTable from '../../components/attainment/SurveyAttainmentTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function IndirectAttainment() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    surveyAttainment,
    summary,
    loading,
    error,
    fetchBySurvey,
    fetchSummary,
    recalculateAttainment
  } = useIndirectAttainment();
  const { surveys, fetchSurveys } = useSurveys();

  const [selectedSurvey, setSelectedSurvey] = useState(searchParams.get('surveyId') || '');
  const [outcomeType, setOutcomeType] = useState(searchParams.get('outcomeType') || 'PLO');
  const [chartType, setChartType] = useState('bar');
  const [showFilters, setShowFilters] = useState(false);
  const [threshold] = useState(70);

  useEffect(() => {
    fetchSurveys({ status: 'completed' });
    if (!selectedSurvey) {
      fetchSummary({ outcome_type: outcomeType });
    }
  }, [fetchSurveys, fetchSummary, selectedSurvey, outcomeType]);

  useEffect(() => {
    if (selectedSurvey) {
      fetchBySurvey(selectedSurvey, outcomeType);
      setSearchParams({ surveyId: selectedSurvey, outcomeType });
    } else {
      fetchSummary({ outcome_type: outcomeType });
      setSearchParams({ outcomeType });
    }
  }, [selectedSurvey, outcomeType, fetchBySurvey, fetchSummary, setSearchParams]);

  const handleRefresh = () => {
    if (selectedSurvey) {
      fetchBySurvey(selectedSurvey, outcomeType);
    } else {
      fetchSummary({ outcome_type: outcomeType });
    }
  };

  const handleRecalculate = async () => {
    if (!selectedSurvey) {
      alert('Please select a survey to recalculate');
      return;
    }

    if (window.confirm('Are you sure you want to recalculate indirect attainment for this survey?')) {
      try {
        await recalculateAttainment(selectedSurvey, outcomeType);
        await fetchBySurvey(selectedSurvey, outcomeType);
      } catch (err) {
        console.error('Recalculation failed:', err);
      }
    }
  };

  const handleViewReport = () => {
    if (selectedSurvey) {
      navigate(`/attainment/indirect/report?surveyId=${selectedSurvey}&outcomeType=${outcomeType}`);
    } else {
      navigate(`/attainment/indirect/report?outcomeType=${outcomeType}`);
    }
  };

  // Prepare chart data
  const chartData = surveyAttainment?.results?.map(result => ({
    label: result.outcome_label || `${outcomeType}-${result.outcome_id}`,
    attainment: result.attainment_percentage || 0
  })) || [];

  // Calculate statistics
  const stats = {
    totalOutcomes: surveyAttainment?.results?.length || 0,
    achievedTarget: surveyAttainment?.results?.filter(r => r.attainment_percentage >= threshold).length || 0,
    belowTarget: surveyAttainment?.results?.filter(r => r.attainment_percentage < threshold).length || 0,
    avgAttainment: surveyAttainment?.results?.length > 0
      ? (surveyAttainment.results.reduce((sum, r) => sum + (r.attainment_percentage || 0), 0) / surveyAttainment.results.length).toFixed(1)
      : 0
  };

  if (loading && !surveyAttainment && !summary) {
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
          <h1 className="text-3xl font-bold text-gray-900">Indirect Attainment</h1>
          <p className="mt-1 text-sm text-gray-600">
            Survey-based assessment of learning outcomes
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={handleRecalculate}
            disabled={loading || !selectedSurvey}
            className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            <RefreshCcw className="w-5 h-5 mr-2" />
            Recalculate
          </button>
          <button
            onClick={handleViewReport}
            className="flex items-center px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            <FileText className="w-5 h-5 mr-2" />
            View Report
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Survey
              </label>
              <select
                value={selectedSurvey}
                onChange={(e) => setSelectedSurvey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Surveys</option>
                {surveys?.map(survey => (
                  <option key={survey.id} value={survey.id}>
                    {survey.title} ({survey.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Outcome Type
              </label>
              <select
                value={outcomeType}
                onChange={(e) => setOutcomeType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="PLO">Program Learning Outcomes (PLO)</option>
                <option value="CLO">Course Learning Outcomes (CLO)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chart Type
              </label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="radar">Radar Chart</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Survey Info */}
      {surveyAttainment?.survey && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="w-5 h-5 text-blue-600 mr-3" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900">
                {surveyAttainment.survey.title}
              </h3>
              <p className="text-xs text-blue-700 mt-1">
                Type: {surveyAttainment.survey.type} | 
                Period: {new Date(surveyAttainment.survey.start_date).toLocaleDateString()} - 
                {new Date(surveyAttainment.survey.end_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total {outcomeType}s</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOutcomes}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Achieved Target</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.achievedTarget}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Below Target</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.belowTarget}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <XCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Attainment</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.avgAttainment}%</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <IndirectAttainmentChart
          data={chartData}
          type={chartType}
          showThreshold={true}
          threshold={threshold}
          height={400}
        />
      )}

      {/* Table */}
      {surveyAttainment?.results && (
        <SurveyAttainmentTable
          data={surveyAttainment.results}
          threshold={threshold}
          outcomeType={outcomeType}
        />
      )}

      {/* No Data Message */}
      {!loading && !surveyAttainment?.results?.length && !error && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600 mb-4">
            {selectedSurvey 
              ? 'No indirect attainment data found for the selected survey.' 
              : 'Please select a survey to view indirect attainment data.'}
          </p>
          <button
            onClick={handleRefresh}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Refresh Data
          </button>
        </div>
      )}
    </div>
  );
}
