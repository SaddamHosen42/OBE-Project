import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiUpload, FiDownload, FiArrowLeft, FiSave, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import BulkUpload from '../../components/marks/BulkUpload';
import MarksTable from '../../components/marks/MarksTable';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import marksService from '../../services/marksService';
import questionService from '../../services/questionService';
import enrollmentService from '../../services/enrollmentService';

const BulkMarksEntry = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [questions, setQuestions] = useState([]);
  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

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
        toast.error('Failed to load bulk marks entry data');
      } finally {
        setIsLoading(false);
      }
    };

    if (assessmentId) {
      fetchData();
    }
  }, [assessmentId]);

  // Handle file upload
  const handleFileUpload = async (parsedData) => {
    try {
      // Validate the data
      const validationResponse = await marksService.validateMarks(parsedData);
      
      if (validationResponse.success) {
        if (validationResponse.data.errors.length > 0) {
          setValidationErrors(validationResponse.data.errors);
          toast.warning('Some entries have validation errors. Please review.');
        } else {
          setValidationErrors([]);
          toast.success('Data validated successfully');
        }
        setPreviewData(parsedData);
      }
    } catch (err) {
      console.error('Error validating marks:', err);
      toast.error(err.message || 'Failed to validate marks data');
    }
  };

  // Handle bulk save
  const handleBulkSave = async () => {
    if (!previewData || previewData.length === 0) {
      toast.error('No data to save');
      return;
    }

    if (validationErrors.length > 0) {
      toast.error('Please fix validation errors before saving');
      return;
    }

    setIsSaving(true);
    try {
      const response = await marksService.bulkCreateMarks(previewData);
      
      if (response.success) {
        toast.success(`Successfully saved ${response.data.length} marks entries`);
        setPreviewData(null);
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

  // Handle download template
  const handleDownloadTemplate = async () => {
    try {
      const blob = await marksService.exportMarks(assessmentId, { template: true });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `marks_template_${assessmentId}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Template downloaded successfully');
    } catch (err) {
      console.error('Error downloading template:', err);
      toast.error('Failed to download template');
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
          <h1 className="text-2xl font-bold text-gray-900">Bulk Marks Entry</h1>
          <p className="text-gray-600 mt-1">
            Upload marks for multiple students at once
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            icon={FiDownload}
          >
            Download Template
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            icon={FiArrowLeft}
          >
            Back
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <FiAlertCircle className="text-blue-600 text-xl shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-2">Instructions:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Download the template file using the button above</li>
              <li>Fill in the marks for each student and question</li>
              <li>Save the file and upload it below</li>
              <li>Review the preview and fix any validation errors</li>
              <li>Click "Save All Marks" to submit the data</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Upload Component */}
      <div className="bg-white rounded-lg shadow p-6">
        <BulkUpload
          assessmentId={assessmentId}
          students={students}
          questions={questions}
          onUpload={handleFileUpload}
          onCancel={() => setPreviewData(null)}
        />
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex gap-3">
            <FiAlertCircle className="text-red-600 text-xl shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-900 mb-2">
                Validation Errors ({validationErrors.length})
              </p>
              <ul className="space-y-1 text-sm text-red-800">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Preview Table */}
      {previewData && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Preview Data</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Review the data before saving ({previewData.length} entries)
                </p>
              </div>
              <Button
                onClick={handleBulkSave}
                disabled={isSaving || validationErrors.length > 0}
                icon={FiSave}
                isLoading={isSaving}
              >
                Save All Marks
              </Button>
            </div>
          </div>
          <div className="p-6">
            <MarksTable
              students={students}
              questions={questions}
              marksData={previewData}
              readonly={true}
            />
          </div>
        </div>
      )}

      {/* Current Marks Summary */}
      {marksData.length > 0 && !previewData && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Current Marks</h3>
            <p className="text-sm text-gray-600 mt-1">
              Existing marks entries for this assessment
            </p>
          </div>
          <div className="p-6">
            <MarksTable
              students={students}
              questions={questions}
              marksData={marksData}
              readonly={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkMarksEntry;
