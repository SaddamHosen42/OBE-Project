import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Users, 
  CheckCircle, 
  TrendingUp,
  Calendar 
} from 'lucide-react';
import { useSurveys } from '../../hooks/useSurveys';
import { useSurveyResponses } from '../../hooks/useSurveyResponses';
import ResponseChart from '../../components/survey/ResponseChart';

const SurveyAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getSurveyById, loading: surveyLoading } = useSurveys();
  const { getResponsesBySurvey, getAnalytics, loading: analyticsLoading } = useSurveyResponses();

  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [surveyData, responsesData, analyticsData] = await Promise.all([
        getSurveyById(id),
        getResponsesBySurvey(id),
        getAnalytics(id)
      ]);

      if (surveyData) {
        setSurvey(surveyData);
        if (surveyData.questions && surveyData.questions.length > 0) {
          setSelectedQuestion(surveyData.questions[0].question_id);
        }
      }
      
      if (responsesData) {
        setResponses(responsesData);
      }
      
      if (analyticsData) {
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Error loading survey analytics:', error);
    }
  };

  const handleExport = () => {
    // Export analytics data as CSV
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `survey_${id}_analytics.csv`;
    link.click();
  };

  const generateCSV = () => {
    if (!survey || !responses) return '';

    let csv = 'Response ID,Submitted At,';
    
    // Add question headers
    survey.questions?.forEach(q => {
      csv += `"${q.question_text}",`;
    });
    csv += '\n';

    // Add response data
    responses.forEach(response => {
      csv += `${response.response_id},${response.submitted_at},`;
      
      survey.questions?.forEach(q => {
        const answer = response.answers?.find(a => a.question_id === q.question_id);
        csv += `"${answer?.response_value || ''}",`;
      });
      csv += '\n';
    });

    return csv;
  };

  const getCompletionRate = () => {
    if (!analytics) return 0;
    const total = analytics.total_invitations || responses.length;
    return total > 0 ? Math.round((responses.length / total) * 100) : 0;
  };

  if (surveyLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Survey not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/surveys')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{survey.title}</h1>
            <p className="mt-1 text-sm text-gray-500">Survey Analytics & Insights</p>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="h-5 w-5 mr-2" />
          Export Data
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Responses</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {responses.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {getCompletionRate()}%
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Completion Time</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                {analytics?.avg_completion_time || '5m 30s'}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Days Active</p>
              <p className="text-2xl font-bold text-orange-600 mt-2">
                {analytics?.days_active || 
                  Math.ceil((new Date() - new Date(survey.start_date)) / (1000 * 60 * 60 * 24))}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Question Analytics */}
      {survey.questions && survey.questions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900">Question Analysis</h2>
          </div>

          {/* Question Selector */}
          <div className="border-b border-gray-200 p-4">
            <select
              value={selectedQuestion}
              onChange={(e) => setSelectedQuestion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {survey.questions.map((q, idx) => (
                <option key={q.question_id} value={q.question_id}>
                  Q{idx + 1}: {q.question_text}
                </option>
              ))}
            </select>
          </div>

          {/* Chart Display */}
          <div className="p-6">
            {selectedQuestion && (
              <ResponseChart
                question={survey.questions.find(q => q.question_id === selectedQuestion)}
                responses={responses}
                analytics={analytics}
              />
            )}
          </div>
        </div>
      )}

      {/* Response Timeline */}
      {responses.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900">Response Timeline</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {responses.slice(0, 10).map((response, idx) => (
                <div key={response.response_id} className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Response #{responses.length - idx}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(response.submitted_at).toLocaleString()}
                    </p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              ))}
            </div>
            {responses.length > 10 && (
              <p className="text-sm text-gray-500 text-center mt-4">
                Showing 10 of {responses.length} responses
              </p>
            )}
          </div>
        </div>
      )}

      {/* No Responses */}
      {responses.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <Users className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-yellow-900 mb-2">No Responses Yet</h3>
          <p className="text-yellow-700">
            This survey hasn't received any responses yet. Share it with your target audience to start collecting data.
          </p>
        </div>
      )}
    </div>
  );
};

export default SurveyAnalytics;
