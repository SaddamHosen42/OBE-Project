import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, Target, ArrowLeft } from 'lucide-react';
import { useAssessment } from '../../hooks/useAssessment';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CLOMappingForm from '../../components/assessment/CLOMappingForm';
import api from '../../services/api';

const AssessmentCLOMapping = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { assessment, loading: loadingAssessment, error: assessmentError } = useAssessment(id);
  
  const [clos, setClos] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (assessment?.course_offering_id) {
      fetchCLOs(assessment.course_offering_id);
    }
  }, [assessment]);

  useEffect(() => {
    if (assessment?.clo_mappings) {
      setMappings(assessment.clo_mappings.map(clo => ({
        clo_id: clo.clo_id,
        marks_allocated: clo.marks_allocated || 0
      })));
    }
  }, [assessment]);

  const fetchCLOs = async (courseOfferingId) => {
    try {
      const response = await api.get(`/clos?courseOffering=${courseOfferingId}`);
      setClos(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch CLOs:', err);
      setError('Failed to load CLOs');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      // Validate total marks
      const totalAllocated = mappings.reduce((sum, m) => sum + parseFloat(m.marks_allocated || 0), 0);
      if (totalAllocated > assessment.total_marks) {
        setError(`Total allocated marks (${totalAllocated}) cannot exceed assessment total marks (${assessment.total_marks})`);
        setLoading(false);
        return;
      }

      await api.post(`/assessments/${id}/clo-mappings`, {
        mappings: mappings.map(m => ({
          clo_id: m.clo_id,
          marks_allocated: parseFloat(m.marks_allocated || 0)
        }))
      });

      navigate(`/assessments/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save CLO mappings');
      console.error('Failed to save CLO mappings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMappingChange = (newMappings) => {
    setMappings(newMappings);
  };

  if (loadingAssessment) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (assessmentError) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading assessment: {assessmentError}
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate(`/assessments/${id}`)}
            variant="outline"
            icon={ArrowLeft}
          >
            Back
          </Button>
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CLO Mapping</h1>
              <p className="mt-1 text-sm text-gray-500">
                {assessment.assessment_name} - {assessment.course_code}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-900">Total Marks</p>
            <p className="text-2xl font-bold text-blue-700">{assessment.total_marks}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900">Allocated Marks</p>
            <p className="text-2xl font-bold text-blue-700">
              {mappings.reduce((sum, m) => sum + parseFloat(m.marks_allocated || 0), 0)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900">Remaining Marks</p>
            <p className="text-2xl font-bold text-blue-700">
              {assessment.total_marks - mappings.reduce((sum, m) => sum + parseFloat(m.marks_allocated || 0), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Mapping Form */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <CLOMappingForm
            clos={clos}
            mappings={mappings}
            totalMarks={assessment.total_marks}
            onChange={handleMappingChange}
          />
        </div>

        {/* Form Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/assessments/${id}`)}
            icon={X}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            loading={loading}
            icon={Save}
          >
            Save Mappings
          </Button>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Mapping Guidelines</h3>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>Select the CLOs that this assessment evaluates</li>
          <li>Allocate marks to each selected CLO</li>
          <li>Total allocated marks cannot exceed the assessment's total marks</li>
          <li>It's recommended to allocate marks proportionally to CLO emphasis</li>
        </ul>
      </div>
    </div>
  );
};

export default AssessmentCLOMapping;
