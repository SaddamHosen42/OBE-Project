import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRubrics } from '../../hooks/useRubrics';
import RubricBuilder from '../../components/rubric/RubricBuilder';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const RubricCreate = () => {
  const navigate = useNavigate();
  const { createRubric, loading, error } = useRubrics();
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (rubricData) => {
    try {
      setFormError(null);
      const result = await createRubric(rubricData);
      if (result) {
        navigate('/rubrics');
      }
    } catch (err) {
      setFormError(err.message || 'Failed to create rubric');
    }
  };

  const handleCancel = () => {
    navigate('/rubrics');
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Create New Rubric</h1>
        <p className="mt-1 text-sm text-gray-500">
          Define assessment criteria and scoring levels for your rubric
        </p>
      </div>

      {/* Error Message */}
      {(error || formError) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || formError}
        </div>
      )}

      {/* Rubric Builder */}
      <div className="bg-white shadow rounded-lg">
        <RubricBuilder
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default RubricCreate;
