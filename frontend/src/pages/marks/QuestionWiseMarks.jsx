import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiUser, FiFileText } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import marksService from '../../services/marksService';
import questionService from '../../services/questionService';
import enrollmentService from '../../services/enrollmentService';

const QuestionWiseMarks = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [questions, setQuestions] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [marksEntries, setMarksEntries] = useState({});
  const [existingMarks, setExistingMarks] = useState([]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        // Fetch questions for the assessment
        const questionsResponse = await questionService.getQuestionsByAssessment(assessmentId);
        if (questionsResponse.success) {
          setQuestions(questionsResponse.data);
          if (questionsResponse.data.length > 0) {
            setSelectedQuestion(questionsResponse.data[0]);
          }
        }

        // Fetch enrolled students
        const enrollmentsResponse = await enrollmentService.getEnrollmentsByOffering(
          questionsResponse.data[0]?.course_offering_id
        );
        if (enrollmentsResponse.success) {
          setStudents(enrollmentsResponse.data);
        }

        // Fetch existing marks
        const marksResponse = await marksService.getMarksByAssessment(assessmentId);
        if (marksResponse.success) {
          setExistingMarks(marksResponse.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
        toast.error('Failed to load question-wise marks data');
      } finally {
        setIsLoading(false);
      }
    };

    if (assessmentId) {
      fetchData();
    }
  }, [assessmentId]);

  // Initialize marks entries when question or existing marks change
  useEffect(() => {
    if (selectedQuestion && students.length > 0) {
      const entries = {};
      students.forEach(student => {
        const existingMark = existingMarks.find(
          m => m.student_id === student.student_id && m.question_id === selectedQuestion.question_id
        );
        entries[student.student_id] = existingMark ? existingMark.marks_obtained : '';
      });
      setMarksEntries(entries);
    }
  }, [selectedQuestion, students, existingMarks]);

  // Handle question selection
  const handleQuestionChange = (e) => {
    const questionId = parseInt(e.target.value);
    const question = questions.find(q => q.question_id === questionId);
    setSelectedQuestion(question);
  };

  // Handle marks input
  const handleMarksChange = (studentId, value) => {
    setMarksEntries(prev => ({
      ...prev,
      [studentId]: value
    }));
  };

  // Validate marks
  const validateMarks = () => {
    const errors = [];
    
    Object.entries(marksEntries).forEach(([studentId, marks]) => {
      if (marks === '') return; // Skip empty entries
      
      const marksNum = parseFloat(marks);
      if (isNaN(marksNum)) {
        const student = students.find(s => s.student_id === parseInt(studentId));
        errors.push(`Invalid marks for ${student?.student_name || studentId}`);
      } else if (marksNum < 0) {
        const student = students.find(s => s.student_id === parseInt(studentId));
        errors.push(`Marks cannot be negative for ${student?.student_name || studentId}`);
      } else if (marksNum > selectedQuestion.total_marks) {
        const student = students.find(s => s.student_id === parseInt(studentId));
        errors.push(`Marks exceed maximum for ${student?.student_name || studentId}`);
      }
    });
    
    return errors;
  };

  // Handle save
  const handleSave = async () => {
    if (!selectedQuestion) {
      toast.error('Please select a question');
      return;
    }

    // Validate marks
    const validationErrors = validateMarks();
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      return;
    }

    setIsSaving(true);
    try {
      const marksArray = Object.entries(marksEntries)
        .filter(([_, marks]) => marks !== '')
        .map(([studentId, marks]) => ({
          student_id: parseInt(studentId),
          question_id: selectedQuestion.question_id,
          assessment_component_id: parseInt(assessmentId),
          marks_obtained: parseFloat(marks),
        }));

      if (marksArray.length === 0) {
        toast.warning('No marks to save');
        return;
      }

      const response = await marksService.bulkCreateMarks(marksArray);
      
      if (response.success) {
        toast.success(`Saved marks for ${marksArray.length} students`);
        // Refresh existing marks
        const marksResponse = await marksService.getMarksByAssessment(assessmentId);
        if (marksResponse.success) {
          setExistingMarks(marksResponse.data);
        }
        
        // Move to next question if available
        const currentIndex = questions.findIndex(q => q.question_id === selectedQuestion.question_id);
        if (currentIndex < questions.length - 1) {
          setSelectedQuestion(questions[currentIndex + 1]);
        }
      }
    } catch (err) {
      console.error('Error saving marks:', err);
      toast.error(err.message || 'Failed to save marks');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle quick fill (same marks for all)
  const handleQuickFill = () => {
    const value = prompt('Enter marks to fill for all students (leave blank for selected only):');
    if (value !== null) {
      const marksValue = value.trim();
      if (marksValue !== '' && (isNaN(parseFloat(marksValue)) || parseFloat(marksValue) > selectedQuestion.total_marks)) {
        toast.error('Invalid marks value');
        return;
      }
      
      const newEntries = { ...marksEntries };
      Object.keys(newEntries).forEach(studentId => {
        newEntries[studentId] = marksValue;
      });
      setMarksEntries(newEntries);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p className="font-semibold">Error Loading Data</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Question-wise Marks Entry</h1>
          <p className="text-gray-600 mt-1">
            Enter marks for all students for one question at a time
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            icon={FiArrowLeft}
          >
            Back
          </Button>
        </div>
      </div>

      {/* Question Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Select Question"
            value={selectedQuestion?.question_id || ''}
            onChange={handleQuestionChange}
            required
          >
            <option value="">Choose a question...</option>
            {questions.map(question => (
              <option key={question.question_id} value={question.question_id}>
                Q{question.question_number}: {question.question_text.substring(0, 50)}... 
                ({question.total_marks} marks)
              </option>
            ))}
          </Select>
          
          {selectedQuestion && (
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={handleQuickFill}
                className="w-full"
              >
                Quick Fill All
              </Button>
            </div>
          )}
        </div>

        {selectedQuestion && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <FiFileText className="text-blue-600 text-xl flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-blue-900">
                  Question {selectedQuestion.question_number}
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  {selectedQuestion.question_text}
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  <span className="font-medium">Total Marks:</span> {selectedQuestion.total_marks} | 
                  <span className="font-medium ml-3">Type:</span> {selectedQuestion.question_type} |
                  <span className="font-medium ml-3">Difficulty:</span> {selectedQuestion.difficulty_level}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Marks Entry Table */}
      {selectedQuestion && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Student Marks</h3>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                icon={FiSave}
                isLoading={isSaving}
              >
                Save Marks
              </Button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {students.map((student, index) => (
                <div 
                  key={student.student_id}
                  className="grid grid-cols-12 gap-4 items-center p-3 rounded-lg hover:bg-gray-50 border"
                >
                  <div className="col-span-1 text-center">
                    <span className="font-medium text-gray-600">{index + 1}</span>
                  </div>
                  <div className="col-span-6 flex items-center gap-3">
                    <FiUser className="text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{student.student_name}</p>
                      <p className="text-sm text-gray-600">{student.roll_number}</p>
                    </div>
                  </div>
                  <div className="col-span-5">
                    <Input
                      type="number"
                      min="0"
                      max={selectedQuestion.total_marks}
                      step="0.5"
                      value={marksEntries[student.student_id] || ''}
                      onChange={(e) => handleMarksChange(student.student_id, e.target.value)}
                      placeholder={`Max: ${selectedQuestion.total_marks}`}
                      className="text-center"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Progress Summary */}
      {selectedQuestion && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Entry Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-700">Total Students</p>
              <p className="text-2xl font-bold text-blue-900 mt-2">{students.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm font-medium text-green-700">Marks Entered</p>
              <p className="text-2xl font-bold text-green-900 mt-2">
                {Object.values(marksEntries).filter(m => m !== '').length}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm font-medium text-yellow-700">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 mt-2">
                {students.length - Object.values(marksEntries).filter(m => m !== '').length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionWiseMarks;
