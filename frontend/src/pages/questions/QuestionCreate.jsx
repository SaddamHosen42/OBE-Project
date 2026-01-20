import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import QuestionForm from '../../components/question/QuestionForm';
import questionService from '../../services/questionService';
import api from '../../services/api';

const QuestionCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assessmentComponentId = searchParams.get('assessmentId');
  const courseOfferingId = searchParams.get('offeringId');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [clos, setClos] = useState([]);
  const [bloomLevels, setBloomLevels] = useState([]);

  // Fetch CLOs and Bloom Levels
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [closResponse, bloomResponse] = await Promise.all([
          courseOfferingId 
            ? api.get(`/clos?courseOffering=${courseOfferingId}`)
            : api.get('/clos'),
          api.get('/bloom-levels')
        ]);

        if (closResponse.data.success) {
          setClos(closResponse.data.data || []);
        }
        if (bloomResponse.data.success) {
          setBloomLevels(bloomResponse.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [courseOfferingId]);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await questionService.createQuestion(formData);
      
      if (response.success) {
        // Navigate back to questions list or assessment page
        if (assessmentComponentId) {
          navigate(`/assessments/${assessmentComponentId}`);
        } else {
          navigate('/questions', { 
            state: { message: 'Question created successfully' } 
          });
        }
      }
    } catch (err) {
      console.error('Error creating question:', err);
      setError(err.response?.data?.message || 'Failed to create question');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (assessmentComponentId) {
      navigate(`/assessments/${assessmentComponentId}`);
    } else {
      navigate('/questions');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to={assessmentComponentId ? `/assessments/${assessmentComponentId}` : '/questions'}
          className="text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Question</h1>
          <p className="text-sm text-gray-500">
            Add a new question to the question bank
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
          assessmentComponentId={assessmentComponentId}
          courseOfferingId={courseOfferingId}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          clos={clos}
          bloomLevels={bloomLevels}
        />
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Creating question...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionCreate;
