import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Trash2, ClipboardList, Calendar, 
  BarChart3, Target, FileText, Users 
} from 'lucide-react';
import { useAssessment } from '../../hooks/useAssessment';
import { useAssessments } from '../../hooks/useAssessments';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AssessmentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { assessment, loading, error } = useAssessment(id);
  const { deleteAssessment } = useAssessments();
  
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this assessment? This action cannot be undone.')) {
      setDeleting(true);
      try {
        await deleteAssessment(id);
        navigate('/assessments');
      } catch (err) {
        console.error('Failed to delete assessment:', err);
        alert('Failed to delete assessment. Please try again.');
      } finally {
        setDeleting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading assessment: {error}
        </div>
        <Button
          onClick={() => navigate('/assessments')}
          icon={ArrowLeft}
          variant="outline"
          className="mt-4"
        >
          Back to Assessments
        </Button>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          Assessment not found
        </div>
        <Button
          onClick={() => navigate('/assessments')}
          icon={ArrowLeft}
          variant="outline"
          className="mt-4"
        >
          Back to Assessments
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate('/assessments')}
            variant="outline"
            icon={ArrowLeft}
          >
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{assessment.assessment_name}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {assessment.course_code} - {assessment.course_name}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => navigate(`/assessments/${id}/edit`)}
            variant="outline"
            icon={Edit}
          >
            Edit
          </Button>
          <Button
            onClick={handleDelete}
            variant="outline"
            loading={deleting}
            icon={Trash2}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Assessment Details Card */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <ClipboardList className="h-5 w-5 mr-2" />
            Assessment Details
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Assessment Type</label>
              <div className="mt-1 flex items-center space-x-2">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  assessment.category === 'Formative' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {assessment.category}
                </span>
                <p className="text-base text-gray-900">{assessment.type_name}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Scheduled Date</label>
              <p className="mt-1 text-base text-gray-900 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                {assessment.scheduled_date 
                  ? new Date(assessment.scheduled_date).toLocaleDateString()
                  : 'Not scheduled'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Total Marks</label>
              <p className="mt-1 text-base text-gray-900">{assessment.total_marks}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Weightage</label>
              <p className="mt-1 text-base text-gray-900">{assessment.weightage}%</p>
            </div>

            {assessment.description && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="mt-1 text-base text-gray-900 whitespace-pre-wrap">
                  {assessment.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CLO Mappings Card */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Target className="h-5 w-5 mr-2" />
            CLO Mappings
          </h2>
          <Button
            onClick={() => navigate(`/assessments/${id}/clo-mapping`)}
            size="sm"
          >
            Manage Mappings
          </Button>
        </div>
        <div className="p-6">
          {assessment.clo_mappings && assessment.clo_mappings.length > 0 ? (
            <div className="space-y-3">
              {assessment.clo_mappings.map(clo => (
                <div
                  key={clo.clo_id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900">{clo.clo_code}</span>
                    <span className="text-gray-600">{clo.description}</span>
                  </div>
                  {clo.marks_allocated && (
                    <span className="text-sm text-gray-500">
                      {clo.marks_allocated} marks
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No CLO mappings defined yet</p>
              <Button
                onClick={() => navigate(`/assessments/${id}/clo-mapping`)}
                className="mt-4"
                size="sm"
              >
                Add Mappings
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Questions Card */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Questions
          </h2>
          <Button
            onClick={() => navigate(`/assessments/${id}/questions`)}
            size="sm"
          >
            Manage Questions
          </Button>
        </div>
        <div className="p-6">
          {assessment.questions && assessment.questions.length > 0 ? (
            <div className="space-y-3">
              {assessment.questions.map((question, index) => (
                <div
                  key={question.question_id}
                  className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">Q{index + 1}</span>
                      <span className="text-sm text-gray-500">
                        ({question.marks} marks)
                      </span>
                    </div>
                    <p className="text-gray-700">{question.question_text}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No questions added yet</p>
              <Button
                onClick={() => navigate(`/assessments/${id}/questions`)}
                className="mt-4"
                size="sm"
              >
                Add Questions
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Card */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Statistics
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {assessment.total_students || 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">Total Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {assessment.submitted_count || 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">Submitted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {assessment.average_score || '-'}
              </div>
              <div className="text-sm text-gray-500 mt-1">Average Score</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentView;
