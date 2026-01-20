import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';

const RubricCriteriaForm = ({ 
  criterion, 
  index, 
  onUpdate, 
  onRemove, 
  errors = {} 
}) => {
  const handleChange = (field, value) => {
    onUpdate(criterion.id, field, value);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">
          Criterion {index + 1}
        </h3>
        <button
          type="button"
          onClick={() => onRemove(criterion.id)}
          className="text-red-600 hover:text-red-800"
          title="Remove criterion"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Criterion Name *
          </label>
          <input
            type="text"
            value={criterion.criterion_name || ''}
            onChange={(e) => handleChange('criterion_name', e.target.value)}
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
              errors[`criteria_${index}_name`]
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            placeholder="e.g., Content Quality, Technical Accuracy"
          />
          {errors[`criteria_${index}_name`] && (
            <p className="mt-1 text-sm text-red-600">
              {errors[`criteria_${index}_name`]}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={criterion.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Describe what this criterion evaluates"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Weight
          </label>
          <input
            type="number"
            value={criterion.weight || 1}
            onChange={(e) => handleChange('weight', e.target.value)}
            min="0"
            step="0.1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            Weight determines the relative importance of this criterion
          </p>
        </div>
      </div>
    </div>
  );
};

export default RubricCriteriaForm;
