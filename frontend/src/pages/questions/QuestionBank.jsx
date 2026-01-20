import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiPlus, FiFilter, FiBookOpen, FiArrowLeft } from 'react-icons/fi';
import { BookOpen, FileQuestion, TrendingUp, BarChart3 } from 'lucide-react';
import QuestionCard from '../../components/question/QuestionCard';
import SearchBar from '../../components/data/SearchBar';
import Button from '../../components/common/Button';
import questionService from '../../services/questionService';
import Modal from '../../components/common/Modal';

const QuestionBank = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseOfferingId = searchParams.get('offeringId');
  
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [questionType, setQuestionType] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('');
  const [bloomLevel, setBloomLevel] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  // Fetch questions and statistics
  const fetchQuestions = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const params = {
        courseOfferingId,
        includeCLOMapping: true
      };
      
      if (searchQuery) params.search = searchQuery;
      if (questionType) params.questionType = questionType;
      if (difficultyLevel) params.difficultyLevel = difficultyLevel;
      if (bloomLevel) params.bloomLevel = bloomLevel;
      
      const response = await questionService.getQuestionsByCourseOffering(courseOfferingId, params);
      
      if (response.success) {
        setQuestions(response.data || []);
      }

      // Fetch statistics
      if (courseOfferingId) {
        try {
          const statsResponse = await questionService.getQuestionStats(courseOfferingId);
          if (statsResponse.success) {
            setStats(statsResponse.data);
          }
        } catch (err) {
          console.error('Error fetching stats:', err);
        }
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(err.response?.data?.message || 'Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseOfferingId) {
      fetchQuestions();
    }
  }, [courseOfferingId, searchQuery, questionType, difficultyLevel, bloomLevel]);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Handle delete
  const handleDeleteClick = (question) => {
    setQuestionToDelete(question);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!questionToDelete) return;
    
    try {
      const response = await questionService.deleteQuestion(questionToDelete.question_id);
      
      if (response.success) {
        fetchQuestions();
        setShowDeleteModal(false);
        setQuestionToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      alert(error.message || 'Failed to delete question');
    }
  };

  // Handle view
  const handleView = (questionId) => {
    navigate(`/questions/${questionId}`);
  };

  // Handle edit
  const handleEdit = (questionId) => {
    navigate(`/questions/edit/${questionId}`);
  };

  // Reset filters
  const resetFilters = () => {
    setQuestionType('');
    setDifficultyLevel('');
    setBloomLevel('');
    setSearchQuery('');
  };

  // Calculate statistics
  const calculateStats = () => {
    if (!questions.length) return null;

    const typeCount = questions.reduce((acc, q) => {
      acc[q.question_type] = (acc[q.question_type] || 0) + 1;
      return acc;
    }, {});

    const difficultyCount = questions.reduce((acc, q) => {
      acc[q.difficulty_level] = (acc[q.difficulty_level] || 0) + 1;
      return acc;
    }, {});

    const bloomCount = questions.reduce((acc, q) => {
      if (q.bloom_level_id) {
        acc[q.bloom_level_id] = (acc[q.bloom_level_id] || 0) + 1;
      }
      return acc;
    }, {});

    return {
      total: questions.length,
      byType: typeCount,
      byDifficulty: difficultyCount,
      byBloom: bloomCount
    };
  };

  const localStats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/questions" className="text-gray-600 hover:text-gray-900">
          <FiArrowLeft className="h-6 w-6" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Question Bank</h1>
          <p className="mt-1 text-sm text-gray-500">
            Browse and manage your question repository
          </p>
        </div>
        {courseOfferingId && (
          <Link to={`/questions/create?offeringId=${courseOfferingId}`}>
            <Button variant="primary" icon={FiPlus}>
              Add Question
            </Button>
          </Link>
        )}
      </div>

      {/* Statistics Cards */}
      {localStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Total Questions</p>
                <p className="text-3xl font-bold mt-2">{localStats.total}</p>
              </div>
              <FileQuestion className="h-12 w-12 text-blue-100 opacity-75" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-100">Easy</p>
                <p className="text-3xl font-bold mt-2">{localStats.byDifficulty['Easy'] || 0}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-100 opacity-75" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-100">Medium</p>
                <p className="text-3xl font-bold mt-2">{localStats.byDifficulty['Medium'] || 0}</p>
              </div>
              <BarChart3 className="h-12 w-12 text-yellow-100 opacity-75" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-100">Hard</p>
                <p className="text-3xl font-bold mt-2">{localStats.byDifficulty['Hard'] || 0}</p>
              </div>
              <BookOpen className="h-12 w-12 text-red-100 opacity-75" />
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <SearchBar
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search questions..."
            />
          </div>
          
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="MCQ">Multiple Choice</option>
            <option value="Short Answer">Short Answer</option>
            <option value="Long Answer">Long Answer</option>
            <option value="True/False">True/False</option>
            <option value="Fill in the Blank">Fill in the Blank</option>
          </select>

          <select
            value={difficultyLevel}
            onChange={(e) => setDifficultyLevel(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <button
            onClick={resetFilters}
            className="px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Questions Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileQuestion className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No questions found in this question bank</p>
          {courseOfferingId && (
            <Link to={`/questions/create?offeringId=${courseOfferingId}`}>
              <Button variant="primary" icon={FiPlus}>
                Create First Question
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {questions.map((question) => (
            <QuestionCard
              key={question.question_id}
              question={question}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Question"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete this question? This action cannot be undone.
            </p>
            {questionToDelete && (
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {questionToDelete.question_text}
                </p>
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default QuestionBank;
