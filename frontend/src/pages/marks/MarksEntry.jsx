import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiArrowLeft, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import MarksEntryForm from '../../components/marks/MarksEntryForm';
import MarksTable from '../../components/marks/MarksTable';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import marksService from '../../services/marksService';
import questionService from '../../services/questionService';
import enrollmentService from '../../services/enrollmentService';

const MarksEntry = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewMode, setViewMode] = useState('form'); // 'form' or 'table'

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
          setMarksData(marksResponse.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
        toast.error('Failed to load marks entry data');
      } finally {
        setIsLoading(false);
      }
    };

    if (assessmentId) {
      fetchData();
    }
  }, [assessmentId]);

  // Handle student selection
  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
  };

  // Handle marks entry
  const handleMarksEntry = async (studentId, questionMarks) => {
    setIsSaving(true);
    try {
      const marksEntries = Object.entries(questionMarks).map(([questionId, marks]) => ({
        student_id: studentId,
        question_id: parseInt(questionId),
        assessment_component_id: parseInt(assessmentId),
        marks_obtained: parseFloat(marks),
      }));

      const response = await marksService.bulkCreateMarks(marksEntries);
      
      if (response.success) {
        toast.success('Marks saved successfully');
        // Refresh marks data
        const marksResponse = await marksService.getMarksByAssessment(assessmentId);
        if (marksResponse.success) {
          setMarksData(marksResponse.data);
        }
      }
    } catch (err) {
      console.error('Error saving marks:', err);
      toast.error(err.message || 'Failed to save marks');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle marks update
  const handleMarksUpdate = async (markId, updatedMarks) => {
    setIsSaving(true);
    try {
      const response = await marksService.updateMarks(markId, updatedMarks);
      
      if (response.success) {
        toast.success('Marks updated successfully');
        // Refresh marks data
        const marksResponse = await marksService.getMarksByAssessment(assessmentId);
        if (marksResponse.success) {
          setMarksData(marksResponse.data);
        }
      }
    } catch (err) {
      console.error('Error updating marks:', err);
      toast.error(err.message || 'Failed to update marks');
    } finally {
      setIsSaving(false);
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
          <h1 className="text-2xl font-bold text-gray-900">Marks Entry</h1>
          <p className="text-gray-600 mt-1">
            Enter marks for students in this assessment
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

      {/* View Mode Toggle */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'form' ? 'primary' : 'outline'}
            onClick={() => setViewMode('form')}
          >
            Form View
          </Button>
          <Button
            variant={viewMode === 'table' ? 'primary' : 'outline'}
            onClick={() => setViewMode('table')}
          >
            Table View
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow">
        {viewMode === 'form' ? (
          <MarksEntryForm
            students={students}
            questions={questions}
            existingMarks={marksData}
            onSubmit={handleMarksEntry}
            onUpdate={handleMarksUpdate}
            isLoading={isSaving}
          />
        ) : (
          <MarksTable
            students={students}
            questions={questions}
            marksData={marksData}
            onUpdate={handleMarksUpdate}
            isLoading={isSaving}
          />
        )}
      </div>

      {/* Summary Stats */}
      {marksData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Entry Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700">
                <FiCheck className="text-xl" />
                <span className="text-sm font-medium">Marks Entered</span>
              </div>
              <p className="text-2xl font-bold text-green-900 mt-2">
                {marksData.length}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-700">
                <FiX className="text-xl" />
                <span className="text-sm font-medium">Pending</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900 mt-2">
                {students.length * questions.length - marksData.length}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700">
                <FiSave className="text-xl" />
                <span className="text-sm font-medium">Total Entries</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mt-2">
                {students.length * questions.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarksEntry;
