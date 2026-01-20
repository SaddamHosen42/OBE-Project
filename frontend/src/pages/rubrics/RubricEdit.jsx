import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRubrics } from '../../hooks/useRubrics';
import RubricBuilder from '../../components/rubric/RubricBuilder';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const RubricEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rubric, loading, error, fetchRubric, updateRubric } = useRubrics();
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchRubric(id);
    }
  }, [id]);

  const handleSubmit = async (rubricData) => {
    try {
      setFormError(null);
      const result = await updateRubric(id, rubricData);
      if (result) {
        navigate('/rubrics');
      }
    } catch (err) {
      setFormError(err.message || 'Failed to update rubric');
    }
  };

  const handleCancel = () => {
    navigate('/rubrics');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCancel}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Back to Rubrics
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading rubric: {error}
        </div>
      </div>
    );
  }

  if (!rubric) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCancel}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Back to Rubrics
          </button>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          Rubric not found
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={handleCancel}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to Rubrics
        </button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Rubric</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update assessment criteria and scoring levels for your rubric
        </p>
      </div>

      {/* Error Message */}
      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {formError}
        </div>
      )}

      {/* Rubric Builder */}
      <div className="bg-white shadow rounded-lg">
        <RubricBuilder
          initialData={rubric}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
          isEdit
        />
      </div>
    </div>
  );
};

export default RubricEdit;
