import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiFilter, FiDownload } from 'react-icons/fi';
import QuestionCard from '../../components/question/QuestionCard';
import SearchBar from '../../components/data/SearchBar';
import ExportButton from '../../components/data/ExportButton';
import Button from '../../components/common/Button';
import questionService from '../../services/questionService';
import Modal from '../../components/common/Modal';

const QuestionList = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  
  // Filters
  const [questionType, setQuestionType] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('');
  const [bloomLevel, setBloomLevel] = useState('');

  // Fetch questions
  const fetchQuestions = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      
      if (searchQuery) params.search = searchQuery;
      if (questionType) params.questionType = questionType;
      if (difficultyLevel) params.difficultyLevel = difficultyLevel;
      if (bloomLevel) params.bloomLevel = bloomLevel;
      
      const response = await questionService.getAllQuestions(params);
      
      if (response.success) {
        setQuestions(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalItems(response.pagination.totalItems);
        }
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(err.message || 'Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [currentPage, itemsPerPage, searchQuery, questionType, difficultyLevel, bloomLevel]);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
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
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Questions</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage assessment questions and question banks
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Link to="/questions/bank">
            <Button variant="outline" icon={FiFilter}>
              Question Bank
            </Button>
          </Link>
          <Link to="/questions/create">
            <Button variant="primary" icon={FiPlus}>
              Create Question
            </Button>
          </Link>
        </div>
      </div>

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

          <div className="flex space-x-2">
            <button
              onClick={resetFilters}
              className="flex-1 px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              Reset
            </button>
            <ExportButton
              data={questions}
              filename="questions"
              className="flex-1"
            />
          </div>
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
          <p className="text-gray-500 mb-4">No questions found</p>
          <Link to="/questions/create">
            <Button variant="primary" icon={FiPlus}>
              Create First Question
            </Button>
          </Link>
        </div>
      ) : (
        <>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
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

export default QuestionList;
