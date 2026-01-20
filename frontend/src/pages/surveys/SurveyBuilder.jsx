import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Eye, Trash2 } from 'lucide-react';
import { useSurveys } from '../../hooks/useSurveys';
import QuestionBuilder from '../../components/survey/QuestionBuilder';

const SurveyBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getSurveyById, loading } = useSurveys();

  const [survey, setSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showQuestionBuilder, setShowQuestionBuilder] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSurvey();
  }, [id]);

  const loadSurvey = async () => {
    try {
      const surveyData = await getSurveyById(id);
      if (surveyData) {
        setSurvey(surveyData);
        // Load existing questions if any
        if (surveyData.questions) {
          setQuestions(surveyData.questions);
        }
      }
    } catch (error) {
      console.error('Error loading survey:', error);
    }
  };

  const handleAddQuestion = (questionData) => {
    if (editingQuestion !== null) {
      // Update existing question
      setQuestions(prev => prev.map((q, idx) => 
        idx === editingQuestion ? { ...questionData, order: idx + 1 } : q
      ));
      setEditingQuestion(null);
    } else {
      // Add new question
      setQuestions(prev => [...prev, { ...questionData, order: prev.length + 1 }]);
    }
    setShowQuestionBuilder(false);
  };

  const handleEditQuestion = (index) => {
    setEditingQuestion(index);
    setShowQuestionBuilder(true);
  };

  const handleDeleteQuestion = (index) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      setQuestions(prev => prev.filter((_, idx) => idx !== index).map((q, idx) => ({
        ...q,
        order: idx + 1
      })));
    }
  };

  const handleReorderQuestion = (index, direction) => {
    const newQuestions = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= questions.length) return;
    
    [newQuestions[index], newQuestions[targetIndex]] = 
    [newQuestions[targetIndex], newQuestions[index]];
    
    // Update order numbers
    newQuestions.forEach((q, idx) => {
      q.order = idx + 1;
    });
    
    setQuestions(newQuestions);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save questions via API
      // await saveSurveyQuestions(id, questions);
      console.log('Saving questions:', questions);
      
      // Navigate back to survey list
      navigate('/surveys');
    } catch (error) {
      console.error('Error saving questions:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    navigate(`/surveys/${id}/preview`);
  };

  if (loading) {
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
    <div className="max-w-6xl mx-auto space-y-6">
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
            <p className="mt-1 text-sm text-gray-500">
              Build your survey by adding questions
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handlePreview}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="h-5 w-5 mr-2" />
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={saving || questions.length === 0}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Survey
              </>
            )}
          </button>
        </div>
      </div>

      {/* Survey Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="text-sm font-medium text-blue-900">Type:</span>
            <span className="ml-2 text-sm text-blue-700 capitalize">
              {survey.survey_type?.replace('_', ' ')}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-blue-900">Audience:</span>
            <span className="ml-2 text-sm text-blue-700 capitalize">
              {survey.target_audience}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-blue-900">Questions:</span>
            <span className="ml-2 text-sm text-blue-700">
              {questions.length}
            </span>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
            <p className="text-gray-500 mb-6">
              Start building your survey by adding questions
            </p>
            <button
              onClick={() => setShowQuestionBuilder(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add First Question
            </button>
          </div>
        ) : (
          <>
            {questions.map((question, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                        Q{index + 1}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded capitalize">
                        {question.question_type?.replace('_', ' ')}
                      </span>
                      {question.is_required && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {question.question_text}
                    </h3>
                    {question.options && question.options.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {question.options.map((option, optIdx) => (
                          <div key={optIdx} className="flex items-center text-sm text-gray-600">
                            <span className="mr-2">•</span>
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleReorderQuestion(index, 'up')}
                      disabled={index === 0}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleReorderQuestion(index, 'down')}
                      disabled={index === questions.length - 1}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => handleEditQuestion(index)}
                      className="p-2 text-blue-600 hover:text-blue-700"
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(index)}
                      className="p-2 text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => {
                setEditingQuestion(null);
                setShowQuestionBuilder(true);
              }}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              <Plus className="h-5 w-5 inline mr-2" />
              Add Another Question
            </button>
          </>
        )}
      </div>

      {/* Question Builder Modal */}
      {showQuestionBuilder && (
        <QuestionBuilder
          question={editingQuestion !== null ? questions[editingQuestion] : null}
          onSave={handleAddQuestion}
          onCancel={() => {
            setShowQuestionBuilder(false);
            setEditingQuestion(null);
          }}
        />
      )}
    </div>
  );
};

export default SurveyBuilder;
