import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';

const RubricLevelForm = ({ 
  level, 
  index, 
  onUpdate, 
  onRemove, 
  errors = {} 
}) => {
  const handleChange = (field, value) => {
    onUpdate(level.id, field, value);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">
          Level {index + 1}
        </h3>
        <button
          type="button"
          onClick={() => onRemove(level.id)}
          className="text-red-600 hover:text-red-800"
          title="Remove level"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Level Name *
          </label>
          <input
            type="text"
            value={level.level_name || ''}
            onChange={(e) => handleChange('level_name', e.target.value)}
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
              errors[`level_${index}_name`]
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            placeholder="e.g., Excellent, Good, Fair, Poor"
          />
          {errors[`level_${index}_name`] && (
            <p className="mt-1 text-sm text-red-600">
              {errors[`level_${index}_name`]}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Points *
          </label>
          <input
            type="number"
            value={level.points ?? ''}
            onChange={(e) => handleChange('points', e.target.value)}
            min="0"
            step="0.5"
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
              errors[`level_${index}_points`]
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            placeholder="e.g., 4, 3, 2, 1"
          />
          {errors[`level_${index}_points`] && (
            <p className="mt-1 text-sm text-red-600">
              {errors[`level_${index}_points`]}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={level.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Describe the performance characteristics for this level"
          />
        </div>
      </div>
    </div>
  );
};

export default RubricLevelForm;
