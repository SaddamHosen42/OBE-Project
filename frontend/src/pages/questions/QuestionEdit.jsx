import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import QuestionForm from '../../components/question/QuestionForm';
import questionService from '../../services/questionService';
import api from '../../services/api';

const QuestionEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [question, setQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [clos, setClos] = useState([]);
  const [bloomLevels, setBloomLevels] = useState([]);

  // Fetch question data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [questionResponse, bloomResponse] = await Promise.all([
          questionService.getQuestionById(id, { 
            includeCLOMapping: true,
            includeBloomLevel: true 
          }),
          api.get('/bloom-levels')
        ]);

        if (questionResponse.success) {
          setQuestion(questionResponse.data);
          
          // Fetch CLOs for the course offering
          if (questionResponse.data.course_offering_id) {
            const closResponse = await api.get(`/clos?courseOffering=${questionResponse.data.course_offering_id}`);
            if (closResponse.data.success) {
              setClos(closResponse.data.data || []);
            }
          } else {
            const closResponse = await api.get('/clos');
            if (closResponse.data.success) {
              setClos(closResponse.data.data || []);
            }
          }
        }

        if (bloomResponse.data.success) {
          setBloomLevels(bloomResponse.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to load question');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (formData) => {
    setIsSaving(true);
    setError('');
    
    try {
      const response = await questionService.updateQuestion(id, formData);
      
      if (response.success) {
        // Navigate back to questions list
        navigate('/questions', { 
          state: { message: 'Question updated successfully' } 
        });
      }
    } catch (err) {
      console.error('Error updating question:', err);
      setError(err.response?.data?.message || 'Failed to update question');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/questions');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Question Not Found</h2>
          <p className="text-red-700 mb-4">The requested question could not be found.</p>
          <Link to="/questions">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Back to Questions
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/questions" className="text-gray-600 hover:text-gray-900">
          <FiArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Question</h1>
          <p className="text-sm text-gray-500">
            Update question details and mappings
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <QuestionForm
          question={question}
          assessmentComponentId={question.assessment_component_id}
          courseOfferingId={question.course_offering_id}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          clos={clos}
          bloomLevels={bloomLevels}
        />
      </div>

      {/* Loading Overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Updating question...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionEdit;
