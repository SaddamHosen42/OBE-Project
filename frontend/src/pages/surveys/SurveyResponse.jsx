import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { useSurveys } from '../../hooks/useSurveys';
import { useSurveyResponses } from '../../hooks/useSurveyResponses';
import ResponseForm from '../../components/survey/ResponseForm';

const SurveyResponse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getSurveyById, loading: surveyLoading } = useSurveys();
  const { submitResponse, loading: submitting } = useSurveyResponses();

  const [survey, setSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadSurvey();
  }, [id]);

  const loadSurvey = async () => {
    try {
      const surveyData = await getSurveyById(id);
      if (surveyData) {
        setSurvey(surveyData);
        
        // Check if survey is active
        const now = new Date();
        const startDate = new Date(surveyData.start_date);
        const endDate = new Date(surveyData.end_date);
        
        if (surveyData.status !== 'active' || now < startDate || now > endDate) {
          // Survey is not available
          return;
        }
        
        // Load questions
        if (surveyData.questions) {
          setQuestions(surveyData.questions.sort((a, b) => a.order - b.order));
          
          // Initialize responses object
          const initialResponses = {};
          surveyData.questions.forEach(q => {
            initialResponses[q.question_id] = '';
          });
          setResponses(initialResponses);
        }
      }
    } catch (error) {
      console.error('Error loading survey:', error);
    }
  };

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Clear error for this question
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    questions.forEach(question => {
      if (question.is_required) {
        const response = responses[question.question_id];
        
        if (!response || 
            (typeof response === 'string' && !response.trim()) ||
            (Array.isArray(response) && response.length === 0)) {
          newErrors[question.question_id] = 'This question is required';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    try {
      // Format responses for submission
      const formattedResponses = questions.map(question => ({
        question_id: question.question_id,
        response_value: responses[question.question_id]
      }));
      
      await submitResponse(id, {
        responses: formattedResponses
      });
      
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting survey:', error);
    }
  };

  // Check if survey is available
  const isSurveyAvailable = () => {
    if (!survey) return false;
    
    const now = new Date();
    const startDate = new Date(survey.start_date);
    const endDate = new Date(survey.end_date);
    
    return survey.status === 'active' && now >= startDate && now <= endDate;
  };

  if (surveyLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Survey not found
        </div>
      </div>
    );
  }

  if (!isSurveyAvailable()) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-yellow-900 mb-2">
            Survey Not Available
          </h2>
          <p className="text-yellow-700">
            This survey is not currently accepting responses.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-900 mb-2">
            Thank You!
          </h2>
          <p className="text-green-700 mb-6">
            Your response has been submitted successfully.
          </p>
          {survey.allow_multiple_responses && (
            <button
              onClick={() => {
                setSubmitted(false);
                // Reset responses
                const initialResponses = {};
                questions.forEach(q => {
                  initialResponses[q.question_id] = '';
                });
                setResponses(initialResponses);
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Submit Another Response
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{survey.title}</h1>
        <p className="text-gray-600 mb-4">{survey.description}</p>
        
        <div className="flex items-center space-x-6 text-sm text-gray-500">
          <div>
            <span className="font-medium">Type:</span>
            <span className="ml-2 capitalize">{survey.survey_type?.replace('_', ' ')}</span>
          </div>
          <div>
            <span className="font-medium">Questions:</span>
            <span className="ml-2">{questions.length}</span>
          </div>
          {survey.is_anonymous && (
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
              <span>Anonymous</span>
            </div>
          )}
        </div>
      </div>

      {/* Response Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <ResponseForm
          questions={questions}
          responses={responses}
          errors={errors}
          onChange={handleResponseChange}
        />

        {/* Submit Button */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Submit Response
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SurveyResponse;
