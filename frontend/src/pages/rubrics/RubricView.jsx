import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRubrics } from '../../hooks/useRubrics';
import RubricPreview from '../../components/rubric/RubricPreview';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon,
  DocumentDuplicateIcon 
} from '@heroicons/react/24/outline';

const RubricView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rubric, loading, error, fetchRubric, deleteRubric } = useRubrics();

  useEffect(() => {
    if (id) {
      fetchRubric(id);
    }
  }, [id]);

  const handleEdit = () => {
    navigate(`/rubrics/edit/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this rubric?')) {
      const result = await deleteRubric(id);
      if (result) {
        navigate('/rubrics');
      }
    }
  };

  const handleDuplicate = () => {
    // Future implementation: Create a duplicate rubric
    alert('Duplicate functionality coming soon!');
  };

  const handleBack = () => {
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
            onClick={handleBack}
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
            onClick={handleBack}
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Back to Rubrics
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDuplicate}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
            Duplicate
          </button>
          <button
            onClick={handleEdit}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <TrashIcon className="h-5 w-5 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Rubric Details */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {rubric.rubric_name}
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                {rubric.rubric_type?.replace('-', ' ').toUpperCase()}
              </p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              rubric.is_active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {rubric.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          {rubric.description && (
            <p className="mt-4 text-gray-700">{rubric.description}</p>
          )}

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Max Score</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {rubric.max_score || 'N/A'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Criteria Count</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {rubric.criteria?.length || 0}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Performance Levels</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {rubric.levels?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Rubric Preview */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Rubric Details
          </h2>
          <RubricPreview rubric={rubric} />
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Metadata
        </h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {rubric.created_at 
                ? new Date(rubric.created_at).toLocaleString() 
                : 'N/A'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {rubric.updated_at 
                ? new Date(rubric.updated_at).toLocaleString() 
                : 'N/A'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created By</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {rubric.created_by_name || rubric.created_by || 'N/A'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated By</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {rubric.updated_by_name || rubric.updated_by || 'N/A'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default RubricView;
